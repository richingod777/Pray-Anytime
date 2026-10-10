import React, { useRef, useState } from 'react';
import { AspectRatio } from '../types';
import { VISUAL_THEMES } from '../utils/visualThemes';
import { audioEngine, TrackInfo } from '../utils/audioEngine';
import { Music, Shuffle, Upload, Volume2, VolumeX, Sparkles, Check, Play, Pause } from 'lucide-react';

interface Props {
  selectedThemeId: string;
  selectedTrackId: string;
  selectedAspectRatio: AspectRatio;
  customBackgroundImage?: string | null;
  customBgOverlay?: number;
  onSelectTheme: (id: string) => void;
  onSelectTrack: (id: string) => void;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
  onUploadCustomImage?: (dataUrl: string | null) => void;
  onUpdateBgOverlay?: (overlay: number) => void;
}

export const MusicAndThemePanel: React.FC<Props> = ({
  selectedThemeId,
  selectedTrackId,
  selectedAspectRatio,
  customBackgroundImage,
  customBgOverlay = 45,
  onSelectTheme,
  onSelectTrack,
  onSelectAspectRatio,
  onUploadCustomImage,
  onUpdateBgOverlay,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgImageInputRef = useRef<HTMLInputElement | null>(null);

  const [volume, setVolume] = useState<number>(audioEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getIsMuted());
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [tracks, setTracks] = useState<TrackInfo[]>(audioEngine.getAllTracks());
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [imageUploadMessage, setImageUploadMessage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadMessage('請選擇有效的圖片檔案 (JPG、PNG、WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUploadCustomImage?.(result);
      setImageUploadMessage(`已成功套用自訂背景圖片！`);
      setTimeout(() => setImageUploadMessage(null), 3000);
    };
    reader.onerror = () => {
      setImageUploadMessage('讀取圖片失敗，請重試');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onUploadCustomImage?.(null);
    setImageUploadMessage('已恢復使用預設動態意境主題');
    setTimeout(() => setImageUploadMessage(null), 3000);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    audioEngine.setVolume(newVal);
    if (isMuted && newVal > 0) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSwitchRandomTrack = () => {
    const next = audioEngine.switchRandomTrack();
    onSelectTrack(next.id);
    if (!isPlaying) {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    audioEngine.selectTrack(trackId);
    onSelectTrack(trackId);
    if (!isPlaying) {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadMessage('正在解析音樂檔案...');
      const newTrack = await audioEngine.uploadCustomTrack(file);
      setTracks(audioEngine.getAllTracks());
      onSelectTrack(newTrack.id);
      setIsPlaying(true);
      setUploadMessage(`成功加入並選用：${newTrack.name}`);
      setTimeout(() => setUploadMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setUploadMessage('音訊解析失敗，請確認檔案格式為 MP3 或 WAV');
    }
  };

  return (
    <div className="w-full bg-[#FAF6EE] rounded-3xl p-5 border border-[#E8DEC9] shadow-sm space-y-6">
      {/* 1. Background Music Controller */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#8C6D46]" />
            <h3 className="text-sm font-semibold text-[#4A3B2C]">敬拜背景音樂</h3>
          </div>
          <button
            onClick={handleSwitchRandomTrack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2EBDC] hover:bg-[#EAE0CD] text-[#5C4A38] text-xs font-semibold border border-[#DACFBD] transition-all active:scale-95 shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>換一首</span>
          </button>
        </div>

        {/* Music Player Bar (Volume & Mute) */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E5DAC5] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#8C6D46] hover:bg-[#785C38] text-white flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0"
              title={isPlaying ? '暫停試聽' : '試聽音樂'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#3D3126] block truncate">
                {audioEngine.getCurrentTrack().name}
              </span>
              <span className="text-[10px] text-[#8C7B6A] block truncate">
                {audioEngine.getCurrentTrack().description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-48">
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg text-[#665443] hover:bg-[#F2EBDC] transition-colors"
              title={isMuted ? '解除靜音' : '靜音'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-700" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#8C6D46]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-[#8C6D46] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#8C6D46] w-8 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Music Track List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tracks.map((t) => {
            const isSelected = selectedTrackId === t.id;
            const isDefaultSop = t.id === 'sop_stream_of_praise';
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTrack(t.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#8C6D46] text-white border-[#8C6D46] shadow-md ring-1 ring-[#8C6D46]'
                    : 'bg-white hover:bg-[#F2EBDC] text-[#4A3B2C] border-[#DACFBD]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold block truncate">{t.name}</span>
                    {isDefaultSop && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold flex-shrink-0 ${
                        isSelected ? 'bg-amber-400 text-stone-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        預設
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] block truncate mt-0.5 ${
                      isSelected ? 'text-amber-200/90' : 'text-[#8F7D6B]'
                    }`}
                  >
                    {t.description}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-200 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Upload Custom Music */}
        <div className="pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/mp3,audio/wav,audio/mpeg,audio/m4a"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#8C6D46]/60 hover:border-[#8C6D46] bg-white/60 hover:bg-white text-[#5C4A38] text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Upload className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>自行上傳音樂 (支援 MP3、WAV)</span>
          </button>
          {uploadMessage && (
            <p className="text-xs text-[#8C6D46] font-medium text-center mt-2 animate-fadeIn">
              {uploadMessage}
            </p>
          )}
        </div>
      </div>

      {/* 2. Visual Theme Selector */}
      <div className="space-y-3 pt-3 border-t border-[#EAE1D1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C6D46]" />
            <h3 className="text-sm font-semibold text-[#4A3B2C]">影片視覺意境</h3>
          </div>
          <span className="text-[11px] text-[#8C7B6A]">已強化光芒與動態細節</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {VISUAL_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'ring-2 ring-[#8C6D46] border-[#8C6D46] shadow-md scale-[1.02] bg-[#FAF5EB]'
                    : 'bg-white hover:bg-[#F2EBDC] border-[#DACFBD]'
                }`}
              >
                {/* Visual Color Swatch */}
                <div
                  className="w-full h-9 rounded-xl mb-2 shadow-inner relative overflow-hidden flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]}, ${theme.bgGradient[2]})`,
                  }}
                >
                  {/* Subtle decorative glow in preview button */}
                  <div
                    className="w-4 h-4 rounded-full blur-xs opacity-80"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D3126] block truncate">
                    {theme.name}
                  </span>
                  {isSelected && <span className="text-[10px] text-[#8C6D46] font-bold">●</span>}
                </div>
                <span className="text-[10px] text-[#8F7D6B] block truncate mt-0.5">
                  {theme.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2.1 Upload Custom Background Image (使用者可上傳背景圖片) */}
        <div className="pt-2">
          <input
            type="file"
            ref={bgImageInputRef}
            onChange={handleImageUpload}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => bgImageInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-[#8C6D46]/60 hover:border-[#8C6D46] bg-white/70 hover:bg-white text-[#5C4A38] text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>上傳自訂背景圖片 (JPG / PNG / WebP)</span>
            </button>

            {customBackgroundImage && (
              <button
                onClick={handleRemoveImage}
                className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all active:scale-95"
              >
                清除自訂圖片
              </button>
            )}
          </div>

          {customBackgroundImage && (
            <div className="mt-2.5 p-3 rounded-2xl bg-white/80 border border-[#E3D6C1] flex items-center gap-3 shadow-inner">
              <img
                src={customBackgroundImage}
                alt="自訂背景預覽"
                className="w-12 h-12 rounded-xl object-cover border border-amber-200/80 shadow-xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between text-[11px] text-[#544332] font-medium">
                  <span>背景暗度遮罩 (保護文字清晰)</span>
                  <span className="font-mono text-[#8C6D46]">{customBgOverlay ?? 45}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  step="5"
                  value={customBgOverlay ?? 45}
                  onChange={(e) => onUpdateBgOverlay?.(Number(e.target.value))}
                  className="w-full accent-[#8C6D46] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {imageUploadMessage && (
            <p className="text-xs text-[#8C6D46] font-medium text-center mt-2 animate-fadeIn">
              {imageUploadMessage}
            </p>
          )}
        </div>
      </div>


      {/* 3. Aspect Ratio Selection */}
      <div className="space-y-2 pt-3 border-t border-[#EAE1D1]">
        <h3 className="text-xs font-semibold text-[#544332]">影片比例選擇</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '9:16', label: '9:16 直式', desc: '手機 / 短影音 Reels' },
            { id: '1:1', label: '1:1 正方形', desc: '動態卡片貼文' },
            { id: '16:9', label: '16:9 橫式', desc: '寬螢幕 / YouTube' },
          ].map((r) => {
            const isSelected = selectedAspectRatio === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectAspectRatio(r.id as AspectRatio)}
                className={`py-2 px-2 rounded-xl text-center border transition-all ${
                  isSelected
                    ? 'bg-[#8C6D46] text-white border-[#8C6D46] font-semibold shadow-sm'
                    : 'bg-white hover:bg-[#F2EBDC] text-[#4A3B2C] border-[#DACFBD]'
                }`}
              >
                <span className="text-xs block">{r.label}</span>
                <span
                  className={`text-[9px] block truncate ${
                    isSelected ? 'text-amber-200/90' : 'text-[#8F7D6B]'
                  }`}
                >
                  {r.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
