import React, { useState, useEffect } from 'react';
import { ScriptureSource, ScriptureData, ViewportMode, VideoStudioConfig, TextStyleConfig } from './types';
import { HomeHeroView } from './components/HomeHeroView';
import { SourceSelector } from './components/SourceSelector';
import { TextEditorPanel } from './components/TextEditorPanel';
import { MusicAndThemePanel } from './components/MusicAndThemePanel';
import { PrayerVideoCanvas } from './components/PrayerVideoCanvas';
import { VISUAL_THEMES } from './utils/visualThemes';
import { audioEngine } from './utils/audioEngine';
import {
  Smartphone,
  Tablet,
  Monitor,
  Video,
  Home,
  Sliders,
  Music,
  ArrowLeft,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  // Navigation State: 'home' | 'studio'
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');

  // Studio Sub-Tab: 'text' | 'music_theme' | 'source'
  const [studioTab, setStudioTab] = useState<'text' | 'music_theme' | 'source'>('text');

  // Viewport mode: Detect screen width on load - on PC/Desktop default to 'desktop'
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'desktop';
    }
    return 'mobile';
  });

  // Scripture data & loading state
  const [currentSource, setCurrentSource] = useState<ScriptureSource>('聖經');
  const [scripture, setScripture] = useState<ScriptureData | null>(null);
  const [isLoadingScripture, setIsLoadingScripture] = useState<boolean>(false);
  const [verseSeed, setVerseSeed] = useState<number>(0);

  // Global Audio Header Quick Toggle
  const [headerIsMuted, setHeaderIsMuted] = useState<boolean>(false);

  // Video Studio Configuration
  const [studioConfig, setStudioConfig] = useState<VideoStudioConfig>({
    aspectRatio: '9:16',
    themeId: VISUAL_THEMES[0].id,
    trackId: audioEngine.getCurrentTrack().id,
    customBackgroundImage: null,
    customBgOverlay: 45,
    topText: {
      content: '神是我們的避難所，是我們的力量，是我們在患難中隨時的幫助。',
      fontFamily: '"Noto Serif TC", serif',
      fontSize: 28,
      autoFit: true,
      color: '#FFFFFF',
      textAlign: 'center',
      posY: 0,
      hasShadow: true,
      hasBackdrop: false,
    },
    bottomText: {
      content: '— 詩篇 46:1 · 當你不知道該怎麼辦，先來禱告。',
      fontFamily: '"Noto Serif TC", serif',
      fontSize: 18,
      autoFit: true,
      color: '#F3E5AB',
      textAlign: 'center',
      posY: 0,
      hasShadow: true,
      hasBackdrop: false,
    },
    bilingualMode: true,
    secondaryLang: 'en',
    showWatermark: true,
    watermarkText: '隨時禱告 · PRAY ANYTIME',
  });


  // Fetch Scripture via Server with Google Search Grounding & Bilingual Sync
  const fetchScripture = async (source: ScriptureSource, seed: number) => {
    setIsLoadingScripture(true);
    try {
      const response = await fetch('/api/scriptures/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, seed }),
      });
      const data = await response.json();

      if (data && data.verse) {
        setScripture(data);
        // 經文要中英對照：預設主體為中文，下方為英文對照版本
        const primaryZh = data.verseZh || data.verse;
        const secondaryEn = data.verseEn
          ? `"${data.verseEn}"\n— ${data.referenceEn || data.reference}`
          : `— ${data.reference} · ${data.prayer || ''}`;

        setStudioConfig((prev) => ({
          ...prev,
          topText: {
            ...prev.topText,
            content: primaryZh,
          },
          bottomText: {
            ...prev.bottomText,
            content: secondaryEn,
          },
        }));
      }
    } catch (err) {
      console.error('Fetch scripture failed:', err);
    } finally {
      setIsLoadingScripture(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchScripture(currentSource, verseSeed);
  }, []);

  // Source change handler
  const handleSelectSource = (src: ScriptureSource) => {
    setCurrentSource(src);
    const newSeed = verseSeed + 1;
    setVerseSeed(newSeed);
    fetchScripture(src, newSeed);
  };

  // Refresh verse handler
  const handleRefreshVerse = () => {
    const newSeed = verseSeed + 1;
    setVerseSeed(newSeed);
    fetchScripture(currentSource, newSeed);
  };

  // Start Video Creation Workflow (預設經典詩歌「讚美之泉」)
  const handleStartVideoCreation = () => {
    const currentTrackId = studioConfig.trackId || 'sop_stream_of_praise';
    audioEngine.selectTrack(currentTrackId);
    setStudioConfig((prev) => ({
      ...prev,
      trackId: currentTrackId,
    }));
    // Start gentle worship audio
    audioEngine.play();
    setCurrentView('studio');
    setStudioTab('text');
  };

  // Quick header audio mute
  const handleToggleHeaderMute = () => {
    const muted = audioEngine.toggleMute();
    setHeaderIsMuted(muted);
  };

  // Text updater helpers
  const handleUpdateTopText = (updated: Partial<TextStyleConfig>) => {
    setStudioConfig((prev) => ({
      ...prev,
      topText: { ...prev.topText, ...updated },
    }));
  };

  const handleUpdateBottomText = (updated: Partial<TextStyleConfig>) => {
    setStudioConfig((prev) => ({
      ...prev,
      bottomText: { ...prev.bottomText, ...updated },
    }));
  };

  // Viewport Container Wrapper styling
  const getViewportContainerClass = () => {
    switch (viewportMode) {
      case 'mobile':
        // Mobile simulated frame or centered compact layout
        return 'max-w-[440px] shadow-2xl rounded-[40px] border-[8px] border-[#3B322A]/10 bg-[#FAF7F2] min-h-[860px] my-4 overflow-hidden';
      case 'tablet':
        // Tablet layout
        return 'max-w-[860px] shadow-2xl rounded-[32px] border-[6px] border-[#3B322A]/10 bg-[#FAF7F2] min-h-[860px] my-4 overflow-hidden';
      case 'desktop':
      default:
        // Desktop full screen layout: perfectly utilizes available desktop workspace
        return 'w-full max-w-[1440px] px-2 sm:px-6 lg:px-8 my-2';
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#2D2620] flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top Device & Viewport Switcher Toolbar */}
      <header className="w-full max-w-[1440px] flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 mb-2 bg-[#EFE8DA]/90 backdrop-blur-md rounded-2xl border border-[#DFD3C0] shadow-sm">
        {/* App Title & Quick Home Link */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#8C6D46] text-amber-50 flex items-center justify-center font-serif font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              禱
            </div>
            <div>
              <span className="text-sm font-bold text-[#3B3026] block leading-tight">
                隨時禱告 PRAY ANYTIME
              </span>
              <span className="text-[10px] text-[#8C7B6A] block leading-none">
                當你不知道該怎麼辦，先來禱告。
              </span>
            </div>
          </button>
        </div>

        {/* Viewport Mode Switcher (手機版預設 / 平板版 / 桌面版) */}
        <div className="flex items-center gap-1 bg-[#E4DAC7] p-1 rounded-xl">
          <button
            onClick={() => setViewportMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewportMode === 'mobile'
                ? 'bg-[#8C6D46] text-white shadow-xs'
                : 'text-[#615141] hover:text-[#2B231C]'
            }`}
            title="手機版 (預設)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">手機版</span>
          </button>

          <button
            onClick={() => setViewportMode('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewportMode === 'tablet'
                ? 'bg-[#8C6D46] text-white shadow-xs'
                : 'text-[#615141] hover:text-[#2B231C]'
            }`}
            title="平板版"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">平板版</span>
          </button>

          <button
            onClick={() => setViewportMode('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewportMode === 'desktop'
                ? 'bg-[#8C6D46] text-white shadow-xs'
                : 'text-[#615141] hover:text-[#2B231C]'
            }`}
            title="桌面版"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">桌面版</span>
          </button>
        </div>

        {/* Audio Mute & Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleHeaderMute}
            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              headerIsMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-[#D8CCB5] text-[#5C4A38] hover:bg-[#F2EBDC]'
            }`}
            title={headerIsMuted ? '開聲音' : '靜音'}
          >
            {headerIsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#8C6D46]" />}
            <span className="text-[11px] hidden md:inline">
              {headerIsMuted ? '已靜音' : '音樂開'}
            </span>
          </button>

          {currentView === 'home' ? (
            <button
              onClick={handleStartVideoCreation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C6D46] hover:bg-[#7B5E39] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Video className="w-3.5 h-3.5" />
              <span>製作影片</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#D8CCB5] hover:bg-[#F2EBDC] text-[#5C4A38] text-xs font-semibold shadow-sm transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>回首頁</span>
            </button>
          )}
        </div>
      </header>

      {/* Responsive Viewport Container */}
      <main className={`w-full flex-1 flex flex-col transition-all duration-300 ${getViewportContainerClass()}`}>
        {/* VIEW 1: HOME VIEW (今日金句為主視覺) */}
        {currentView === 'home' && (
          <div className="p-4 sm:p-6 w-full flex-1 flex flex-col justify-between">
            <HomeHeroView
              scripture={scripture}
              currentSource={currentSource}
              isLoading={isLoadingScripture}
              viewportMode={viewportMode}
              onSelectSource={handleSelectSource}
              onRefreshVerse={handleRefreshVerse}
              onStartVideoCreation={handleStartVideoCreation}
            />


            {/* Quiet Footer */}
            <footer className="text-center text-xs text-[#9E8E7D] pt-6 pb-2 border-t border-[#EAE0D0]">
              <p>「應當一無挂慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。」</p>
              <p className="text-[10px] text-[#B0A292] mt-1">隨時禱告 PRAY ANYTIME · 當你不知道該怎麼辦，先來禱告。</p>
            </footer>
          </div>
        )}

        {/* VIEW 2: VIDEO STUDIO WORKSPACE (禱告影片製作工作室) */}
        {currentView === 'studio' && (
          <div className="p-4 sm:p-6 w-full flex-1 flex flex-col">
            {/* Studio Navigation Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAE0D0]">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5945] hover:text-[#3B3026] px-2.5 py-1.5 rounded-xl hover:bg-[#ECE2D0] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回今日金句</span>
              </button>

              <div className="text-center">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#362C22]">
                  禱告影片工作室
                </h2>
                <span className="text-[10px] text-[#8C7B6A]">即時微調、智慧字級適配與影片匯出</span>
              </div>

              {/* Watermark checkbox toggle */}
              <label className="flex items-center gap-1.5 text-xs text-[#635140] cursor-pointer">
                <input
                  type="checkbox"
                  checked={studioConfig.showWatermark}
                  onChange={(e) =>
                    setStudioConfig((prev) => ({ ...prev, showWatermark: e.target.checked }))
                  }
                  className="rounded border-[#D8CCB5] text-[#8C6D46] focus:ring-[#8C6D46]"
                />
                <span className="hidden sm:inline text-[11px]">顯示影片微標</span>
              </label>
            </div>

            {/* Studio Main Workspace: Grid depending on Viewport Mode */}
            <div
              className={`w-full flex-1 gap-6 ${
                viewportMode === 'desktop'
                  ? 'grid grid-cols-1 lg:grid-cols-12 items-start'
                  : 'flex flex-col items-center'
              }`}
            >
              {/* Left/Center Column: Canvas Preview */}
              <div
                className={`flex flex-col items-center w-full ${
                  viewportMode === 'desktop' ? 'lg:col-span-6' : 'max-w-[420px]'
                }`}
              >
                <PrayerVideoCanvas
                  config={studioConfig}
                  onUpdateTopText={(text) => handleUpdateTopText({ content: text })}
                  onUpdateBottomText={(text) => handleUpdateBottomText({ content: text })}
                />
              </div>

              {/* Right Column: Customization Controls & Tool Tabs */}
              <div
                className={`w-full flex flex-col space-y-4 ${
                  viewportMode === 'desktop' ? 'lg:col-span-6' : 'max-w-[420px]'
                }`}
              >
                {/* 3 Studio Tool Tabs */}
                <div className="w-full bg-[#EFE6D5] p-1 rounded-2xl flex gap-1 shadow-inner">
                  <button
                    onClick={() => setStudioTab('text')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      studioTab === 'text'
                        ? 'bg-[#8C6D46] text-white shadow-sm'
                        : 'text-[#665443] hover:text-[#3B3026]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>調整文字版面</span>
                  </button>

                  <button
                    onClick={() => setStudioTab('music_theme')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      studioTab === 'music_theme'
                        ? 'bg-[#8C6D46] text-white shadow-sm'
                        : 'text-[#665443] hover:text-[#3B3026]'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>音樂與視覺</span>
                  </button>

                  <button
                    onClick={() => setStudioTab('source')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      studioTab === 'source'
                        ? 'bg-[#8C6D46] text-white shadow-sm'
                        : 'text-[#665443] hover:text-[#3B3026]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>更換金句來源</span>
                  </button>
                </div>

                {/* Tab 1: Text Customization Panel */}
                {studioTab === 'text' && (
                  <TextEditorPanel
                    topText={studioConfig.topText}
                    bottomText={studioConfig.bottomText}
                    scripture={scripture}
                    onChangeTopText={handleUpdateTopText}
                    onChangeBottomText={handleUpdateBottomText}
                  />
                )}

                {/* Tab 2: Background Music & Visual Theme Panel */}
                {studioTab === 'music_theme' && (
                  <MusicAndThemePanel
                    selectedThemeId={studioConfig.themeId}
                    selectedTrackId={studioConfig.trackId}
                    selectedAspectRatio={studioConfig.aspectRatio}
                    customBackgroundImage={studioConfig.customBackgroundImage}
                    customBgOverlay={studioConfig.customBgOverlay}
                    onSelectTheme={(themeId) =>
                      setStudioConfig((prev) => ({ ...prev, themeId }))
                    }
                    onSelectTrack={(trackId) =>
                      setStudioConfig((prev) => ({ ...prev, trackId }))
                    }
                    onSelectAspectRatio={(aspectRatio) =>
                      setStudioConfig((prev) => ({ ...prev, aspectRatio }))
                    }
                    onUploadCustomImage={(dataUrl) =>
                      setStudioConfig((prev) => ({ ...prev, customBackgroundImage: dataUrl }))
                    }
                    onUpdateBgOverlay={(overlay) =>
                      setStudioConfig((prev) => ({ ...prev, customBgOverlay: overlay }))
                    }
                  />
                )}


                {/* Tab 3: Scripture Source Switcher */}
                {studioTab === 'source' && (
                  <SourceSelector
                    currentSource={currentSource}
                    scripture={scripture}
                    isLoading={isLoadingScripture}
                    onSelectSource={handleSelectSource}
                    onRefreshVerse={handleRefreshVerse}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
