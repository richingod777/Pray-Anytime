import React, { useEffect, useRef, useState } from 'react';
import { VideoStudioConfig } from '../types';
import { VISUAL_THEMES, ParticleSystem } from '../utils/visualThemes';
import { calculateMaxFittingFontSize, wrapTextLines } from '../utils/textFitting';
import { audioEngine } from '../utils/audioEngine';
import { voiceService } from '../utils/voiceService';
import { Play, Pause, Download, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  config: VideoStudioConfig;
  onUpdateTopText?: (text: string) => void;
  onUpdateBottomText?: (text: string) => void;
}

export const PrayerVideoCanvas: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Aspect ratio canvas internal resolutions
  const getCanvasDimensions = () => {
    switch (config.aspectRatio) {
      case '1:1':
        return { width: 720, height: 720 };
      case '16:9':
        return { width: 1280, height: 720 };
      case '9:16':
      default:
        return { width: 720, height: 1280 };
    }
  };

  const { width, height } = getCanvasDimensions();

  // Initialize or resize particle system when dimensions change
  useEffect(() => {
    particleSystemRef.current = new ParticleSystem(width, height, 48);
  }, [width, height]);

  // Cache loaded custom background image
  const customImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (config.customBackgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        customImgRef.current = img;
      };
      img.src = config.customBackgroundImage;
    } else {
      customImgRef.current = null;
    }
  }, [config.customBackgroundImage]);

  // Main canvas render function
  const renderFrame = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    const activeTheme = VISUAL_THEMES.find((t) => t.id === config.themeId) || VISUAL_THEMES[0];

    // 1. Draw animated background or custom uploaded image
    if (customImgRef.current && config.customBackgroundImage) {
      const img = customImgRef.current;
      ctx.save();
      
      // Calculate cover fit dimensions
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawW = width;
      let drawH = height;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
      } else {
        // Image is taller than canvas
        drawW = width;
        drawH = width / imgAspect;
        drawY = (height - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Dark overlay for scripture readability
      const overlayAlpha = (config.customBgOverlay ?? 45) / 100;
      ctx.fillStyle = `rgba(18, 14, 10, ${overlayAlpha})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Subtle particles on top of custom background for spiritual ambiance
      if (particleSystemRef.current) {
        particleSystemRef.current.updateAndDrawParticlesOnly(ctx, activeTheme, timestamp);
      }
    } else if (particleSystemRef.current) {
      particleSystemRef.current.updateAndDraw(ctx, activeTheme, timestamp);
    }

    // 2. Decorative Top Watermark / Brand
    if (config.showWatermark) {
      ctx.save();
      ctx.font = '500 16px "Noto Sans TC", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.textAlign = 'center';
      ctx.fillText(config.watermarkText, width / 2, 44);
      
      // Small cross accent
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(245, 222, 179, 0.6)';
      ctx.fillText('✝', width / 2, 26);
      ctx.restore();
    }

    // 3. Upper Text Area (Scripture / 經文)
    const topPadding = 48;
    const topAreaWidth = width - topPadding * 2;
    // Top area occupies roughly 12% to 58% of canvas height
    const topAreaTop = height * 0.12 + (config.topText.posY * height) / 100;
    const topAreaHeight = height * 0.44;

    // Optional Soft Backdrop
    if (config.topText.hasBackdrop) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 16;
      const cornerRadius = 16;
      ctx.beginPath();
      ctx.roundRect(
        topPadding - 16,
        topAreaTop - 16,
        topAreaWidth + 32,
        topAreaHeight + 32,
        cornerRadius
      );
      ctx.fill();
      ctx.restore();
    }

    // Determine font size & lines for top text
    let topFontSize = config.topText.fontSize;
    let topLines: string[] = [];
    let topLineHeight = topFontSize * 1.5;

    if (config.topText.autoFit) {
      const fit = calculateMaxFittingFontSize(ctx, {
        text: config.topText.content,
        fontFamily: config.topText.fontFamily,
        maxWidth: topAreaWidth,
        maxHeight: topAreaHeight,
        minFontSize: 16,
        maxFontSize: width > 900 ? 56 : 42,
        lineHeightRatio: 1.5,
        fontWeight: '600',
      });
      topFontSize = fit.fontSize;
      topLines = fit.lines;
      topLineHeight = fit.lineHeight;
    } else {
      topLines = wrapTextLines(
        ctx,
        config.topText.content,
        topAreaWidth,
        topFontSize,
        config.topText.fontFamily,
        '600'
      );
    }

    // Draw Top Text
    ctx.save();
    ctx.font = `600 ${topFontSize}px ${config.topText.fontFamily}`;
    ctx.fillStyle = config.topText.color;
    ctx.textBaseline = 'middle';

    if (config.topText.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
    }

    const totalTopTextHeight = topLines.length * topLineHeight;
    const startYTop = topAreaTop + (topAreaHeight - totalTopTextHeight) / 2 + topLineHeight / 2;

    topLines.forEach((line, index) => {
      const lineY = startYTop + index * topLineHeight;
      let lineX = width / 2;
      if (config.topText.textAlign === 'left') {
        lineX = topPadding;
        ctx.textAlign = 'left';
      } else if (config.topText.textAlign === 'right') {
        lineX = width - topPadding;
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }
      ctx.fillText(line, lineX, lineY);
    });
    ctx.restore();

    // 4. Subtle dividing line with golden glow
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 222, 179, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.61);
    ctx.lineTo(width * 0.65, height * 0.61);
    ctx.stroke();
    ctx.restore();

    // 5. Lower Text Area (Reference & Prayer Sentence / 出處與短禱)
    const bottomPadding = 48;
    const bottomAreaWidth = width - bottomPadding * 2;
    const bottomAreaTop = height * 0.64 + (config.bottomText.posY * height) / 100;
    const bottomAreaHeight = height * 0.26;

    if (config.bottomText.hasBackdrop) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(
        bottomPadding - 16,
        bottomAreaTop - 12,
        bottomAreaWidth + 32,
        bottomAreaHeight + 24,
        14
      );
      ctx.fill();
      ctx.restore();
    }

    let bottomFontSize = config.bottomText.fontSize;
    let bottomLines: string[] = [];
    let bottomLineHeight = bottomFontSize * 1.45;

    if (config.bottomText.autoFit) {
      const fit = calculateMaxFittingFontSize(ctx, {
        text: config.bottomText.content,
        fontFamily: config.bottomText.fontFamily,
        maxWidth: bottomAreaWidth,
        maxHeight: bottomAreaHeight,
        minFontSize: 14,
        maxFontSize: width > 900 ? 36 : 28,
        lineHeightRatio: 1.45,
        fontWeight: '500',
      });
      bottomFontSize = fit.fontSize;
      bottomLines = fit.lines;
      bottomLineHeight = fit.lineHeight;
    } else {
      bottomLines = wrapTextLines(
        ctx,
        config.bottomText.content,
        bottomAreaWidth,
        bottomFontSize,
        config.bottomText.fontFamily,
        '500'
      );
    }

    // Draw Bottom Text
    ctx.save();
    ctx.font = `500 ${bottomFontSize}px ${config.bottomText.fontFamily}`;
    ctx.fillStyle = config.bottomText.color;
    ctx.textBaseline = 'middle';

    if (config.bottomText.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
    }

    const totalBottomTextHeight = bottomLines.length * bottomLineHeight;
    const startYBottom = bottomAreaTop + (bottomAreaHeight - totalBottomTextHeight) / 2 + bottomLineHeight / 2;

    bottomLines.forEach((line, index) => {
      const lineY = startYBottom + index * bottomLineHeight;
      let lineX = width / 2;
      if (config.bottomText.textAlign === 'left') {
        lineX = bottomPadding;
        ctx.textAlign = 'left';
      } else if (config.bottomText.textAlign === 'right') {
        lineX = width - bottomPadding;
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }
      ctx.fillText(line, lineX, lineY);
    });
    ctx.restore();
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const loop = (timestamp: number) => {
      if (!isRunning) return;
      if (isPlaying || isExporting) {
        renderFrame(ctx, timestamp);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [config, isPlaying, isExporting, width, height]);

  // Export high-res still image (PNG)
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `隨禱AlwaysNear_金句卡片_${Date.now()}.png`;
    a.click();
    setExportSuccessMessage('已為您成功下載高清靈修金句卡片！');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  // Export video (WebM / MP4) with audio mixed
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Start audio playback if paused so the stream has active sound
      if (!audioEngine.getIsPlaying()) {
        audioEngine.play();
      }

      // Capture Canvas Stream (30 FPS)
      const canvasStream = canvas.captureStream(30);

      // Mix Audio Stream
      const audioDestination = audioEngine.getMediaStreamDestination();
      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        const audioTrack = audioDestination.stream.getAudioTracks()[0];
        canvasStream.addTrack(audioTrack);
      }

      // Check supported MIME type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const recorder = new MediaRecorder(
        canvasStream,
        mimeType ? { mimeType, videoBitsPerSecond: 3500000 } : undefined
      );

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const durationMs = 8000; // 8 seconds high-quality devotional video loop
      const startTime = Date.now();

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const videoURL = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = videoURL;
        a.download = `隨禱AlwaysNear_禱告影片_${Date.now()}.webm`;
        a.click();

        setIsExporting(false);
        setExportProgress(100);
        setExportSuccessMessage('禱告影片已成功生成並自動開始下載！');
        setTimeout(() => setExportSuccessMessage(null), 4000);
      };

      recorder.start();

      // Progress tick
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(99, Math.floor((elapsed / durationMs) * 100));
        setExportProgress(pct);

        if (elapsed >= durationMs) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 150);

    } catch (err) {
      console.error('Video recording failed:', err);
      setIsExporting(false);
      alert('瀏覽器錄製影片時發生問題，您可以直接點選「下載圖片卡片」快速儲存金句！');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Video Canvas Container */}
      <div className="relative group w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-amber-900/20">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto aspect-[9/16] object-contain block select-none"
          style={{
            aspectRatio:
              config.aspectRatio === '1:1'
                ? '1 / 1'
                : config.aspectRatio === '16:9'
                ? '16 / 9'
                : '9 / 16',
          }}
        />

        {/* Video Hover Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex justify-between items-center pointer-events-auto">
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-200 border border-amber-500/30">
              {config.aspectRatio} 預覽中
            </span>
            <span className="text-xs text-stone-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
              隨時禱告 · PRAY ANYTIME
            </span>
          </div>

          <div className="flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-amber-500/80 hover:bg-amber-500 text-stone-900 flex items-center justify-center backdrop-blur-md shadow-lg transition-transform transform active:scale-95"
              title={isPlaying ? '暫停動畫' : '播放動畫'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs text-stone-200 pointer-events-auto">
            <span>畫質：高解析動態</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="underline text-amber-300 hover:text-amber-200"
            >
              {isPlaying ? '暫停動態' : '繼續播放'}
            </button>
          </div>
        </div>

        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-7 h-7 text-amber-300 animate-spin" />
            </div>
            <h4 className="text-lg font-semibold text-amber-100 mb-1">正在合成禱告影片與敬拜音樂</h4>
            <p className="text-xs text-stone-300 mb-5">請稍候片刻，影片即將生成完成...</p>
            
            {/* Progress bar */}
            <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden border border-stone-700 mb-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-amber-300">{exportProgress}%</span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {exportSuccessMessage && (
        <div className="mt-3 w-full max-w-[420px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Quick Action Bar under Canvas */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[520px]">

        <button
          onClick={handleExportVideo}
          disabled={isExporting}
          className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#8C6D46] to-[#715431] hover:from-[#9D7B50] hover:to-[#7E5E37] text-amber-50 font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? '匯出處理中...' : '匯出禱告影片'}</span>
        </button>

        <button
          onClick={() => {
            const combinedText = `${config.topText.content}。${config.bottomText.content}`;
            voiceService.speakText(combinedText, 'zh');
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl bg-[#F0E6D4] hover:bg-[#E5D7BF] text-[#544130] font-medium shadow-sm border border-[#DACFBD] transition-all active:scale-[0.98] text-xs sm:text-sm"
          title="溫暖親切真人發音朗讀"
        >
          <Sparkles className="w-4 h-4 text-[#8C6D46]" />
          <span>真人發音</span>
        </button>

        <button
          onClick={handleExportImage}
          className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-[#EBE3D5] hover:bg-[#E0D6C4] text-[#4A3B2C] font-medium shadow-sm border border-[#DACFBD] transition-all active:scale-[0.98] text-xs sm:text-sm"
          title="儲存為高畫質社群圖卡"
        >
          <ImageIcon className="w-4 h-4" />
          <span>下載圖卡</span>
        </button>
      </div>
    </div>
  );
};
