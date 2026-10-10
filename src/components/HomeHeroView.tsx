import React, { useState, useEffect } from 'react';
import { ScriptureSource, ScriptureData } from '../types';
import { voiceService, VoiceLanguage } from '../utils/voiceService';
import {
  Sparkles,
  Video,
  RefreshCw,
  Heart,
  Volume2,
  VolumeX,
  Languages,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  scripture: ScriptureData | null;
  currentSource: ScriptureSource;
  isLoading: boolean;
  viewportMode?: 'mobile' | 'tablet' | 'desktop';
  onSelectSource: (src: ScriptureSource) => void;
  onRefreshVerse: () => void;
  onStartVideoCreation: () => void;
}


export const HomeHeroView: React.FC<Props> = ({
  scripture,
  currentSource,
  isLoading,
  viewportMode = 'desktop',
  onSelectSource,
  onRefreshVerse,
  onStartVideoCreation,
}) => {

  const sources: ScriptureSource[] = ['每日靈糧', '荒漠甘泉', '聖經', 'THE BIBLE'];

  // Secondary language for bilingual comparison (預設為英文 English，支援德文、西班牙文、日文、韓文)
  const [secondaryLang, setSecondaryLang] = useState<'en' | 'de' | 'es' | 'ja' | 'ko' | 'none'>('en');

  // Voice narration state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingType, setSpeakingType] = useState<'scripture' | 'prayer' | null>(null);
  const [speakLang, setSpeakLang] = useState<VoiceLanguage>('zh');
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isPrayerCopied, setIsPrayerCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((playing, status) => {
      setIsSpeaking(playing);
      if (!playing) setSpeakingType(null);
      if (status) setVoiceStatus(status);
    });
    return () => {
      unsubscribe();
      voiceService.stopSpeaking();
    };
  }, []);

  const getSecondaryTranslation = () => {
    if (!scripture || secondaryLang === 'none') return null;
    if (secondaryLang === 'en') {
      return {
        label: '英文 (English NIV/ESV)',
        verse: scripture.verseEn,
        reference: scripture.referenceEn,
      };
    }
    if (secondaryLang === 'de') {
      return {
        label: '德文 (Deutsch Luther)',
        verse: scripture.verseDe || scripture.translations?.de?.verse,
        reference: scripture.referenceDe || scripture.translations?.de?.reference,
      };
    }
    if (secondaryLang === 'es') {
      return {
        label: '西班牙文 (Español RVR)',
        verse: scripture.verseEs || scripture.translations?.es?.verse,
        reference: scripture.referenceEs || scripture.translations?.es?.reference,
      };
    }
    if (scripture.translations && scripture.translations[secondaryLang]) {
      return scripture.translations[secondaryLang];
    }
    return null;
  };

  const secondaryData = getSecondaryTranslation();

  const handleToggleVoice = (targetLang?: VoiceLanguage) => {
    const langToUse = targetLang || speakLang;
    if (isSpeaking && speakingType === 'scripture' && langToUse === speakLang) {
      voiceService.stopSpeaking();
      setSpeakingType(null);
    } else {
      if (!scripture) return;
      setSpeakingType('scripture');
      setSpeakLang(langToUse);

      let textToSpeak = `${scripture.verseZh || scripture.verse}。${scripture.referenceZh || scripture.reference}`;
      if (langToUse === 'en') {
        textToSpeak = `${scripture.verseEn || scripture.verse}。${scripture.referenceEn || scripture.reference}`;
      } else if (langToUse === 'de') {
        textToSpeak = `${scripture.verseDe || scripture.translations?.de?.verse || scripture.verseEn}。${scripture.referenceDe || ''}`;
      } else if (langToUse === 'es') {
        textToSpeak = `${scripture.verseEs || scripture.translations?.es?.verse || scripture.verseEn}。${scripture.referenceEs || ''}`;
      } else if (langToUse === 'ja') {
        textToSpeak = `${scripture.translations?.ja?.verse || scripture.verse}。${scripture.translations?.ja?.reference || ''}`;
      } else if (langToUse === 'ko') {
        textToSpeak = `${scripture.translations?.ko?.verse || scripture.verse}。${scripture.translations?.ko?.reference || ''}`;
      }

      voiceService.speakText(textToSpeak, langToUse);
    }
  };

  const handleTogglePrayerVoice = () => {
    if (isSpeaking && speakingType === 'prayer') {
      voiceService.stopSpeaking();
      setSpeakingType(null);
    } else {
      if (!scripture || !scripture.prayer) return;
      setSpeakingType('prayer');
      setSpeakLang('zh');
      voiceService.speakText(scripture.prayer, 'zh');
    }
  };

  const handleCopyPrayer = () => {
    if (!scripture?.prayer) return;
    navigator.clipboard.writeText(scripture.prayer);
    setIsPrayerCopied(true);
    setTimeout(() => setIsPrayerCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col items-center w-full mx-auto space-y-6 pb-12 animate-fadeIn transition-all ${
        viewportMode === 'desktop' ? 'max-w-4xl' : 'max-w-xl'
      }`}
    >
      {/* App Branding & Tagline Banner */}

      <div className="text-center pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFE6D5] text-[#785E3B] text-xs font-semibold mb-3 border border-[#DACFBD] shadow-xs">
          <span>✝</span>
          <span>當你不知道該怎麼辦，先來禱告。</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2822] tracking-tight">
          隨時禱告 <span className="text-xl sm:text-2xl font-sans font-light text-[#7C6651]">PRAY ANYTIME</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#7D6B58] mt-2 max-w-md mx-auto leading-relaxed">
          當你不知道該怎麼辦，先來禱告。藉由每日聖經金句、多語對照與溫暖敬拜音樂，為心靈預備一處平安的棲所。
        </p>
      </div>

      {/* Source Selector Tabs */}
      <div className="w-full bg-[#F3ECE0] p-1.5 rounded-2xl flex gap-1 border border-[#E3D7C1] shadow-inner">
        {sources.map((s) => {
          const isActive = currentSource === s;
          return (
            <button
              key={s}
              onClick={() => onSelectSource(s)}
              disabled={isLoading}
              className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-[#8C6D46] text-white shadow-sm scale-[1.02]'
                  : 'text-[#695847] hover:text-[#3B3026] hover:bg-[#EAE0CD]/60'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Main Hero Card: 今日金句 */}
      <div className="w-full bg-gradient-to-b from-[#FDFBF7] to-[#F7F2E7] rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-lg relative overflow-hidden">
        {/* Decorative Watermark */}
        <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 text-[#EADECA] opacity-30 select-none pointer-events-none font-serif text-9xl">
          ✝
        </div>

        {/* Header Badge & Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C6D46] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8C6D46]">
              今日金句 · {currentSource}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Real Human-Like Voice Narration Button */}
            <button
              onClick={() => handleToggleVoice()}
              disabled={isLoading || !scripture}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-xs ${
                isSpeaking
                  ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                  : 'bg-[#F0E6D4] hover:bg-[#E5D7BF] text-[#544130] border-[#D9C9AF]'
              }`}
              title="溫暖親切真人發音"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#8C6D46]" />}
              <span>{isSpeaking ? '停止朗讀' : '真人發音'}</span>
            </button>

            {/* Refresh verse button */}
            <button
              onClick={onRefreshVerse}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE7D7] hover:bg-[#E5DBC7] text-[#5C4A38] text-xs font-medium border border-[#DACFBD] transition-all active:scale-95 disabled:opacity-50"
              title="更換下一句金句"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-[#8C6D46]' : ''}`} />
              <span>換一句</span>
            </button>
          </div>
        </div>

        {/* Voice status prompt if speaking */}
        {isSpeaking && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>{voiceStatus || (speakingType === 'prayer' ? '正在以溫暖親切語調朗讀同心禱告...' : '溫暖親切發音中...')}</span>
            </span>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded-md">
              {speakingType === 'prayer' ? '同心禱告 (中文朗讀)' : `發音語言：${
                speakLang === 'zh' ? '繁體中文' :
                speakLang === 'en' ? '英文' :
                speakLang === 'de' ? '德文' :
                speakLang === 'es' ? '西班牙文' :
                speakLang === 'ja' ? '日文' : '韓文'
              }`}
            </span>
          </div>
        )}

        {/* Verse Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center relative z-10">
            <RefreshCw className="w-8 h-8 text-[#8C6D46] animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#4A3B2C]">
              Google Search Grounding 正在為您搜尋...
            </p>
            <p className="text-xs text-[#9B8874] mt-1">「{currentSource}」多語對照靈修經文載入中</p>
          </div>
        ) : scripture ? (
          <div className="space-y-4 relative z-10">
            {/* Primary Scripture (Default Traditional Chinese 繁體中文) */}
            <div className="space-y-1">
              <blockquote className="font-serif text-xl sm:text-2xl text-[#2B241E] leading-relaxed font-semibold tracking-wide">
                「{scripture.verseZh || scripture.verse}」
              </blockquote>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-[#8C6D46] tracking-wider">
                  — {scripture.referenceZh || scripture.reference}
                </span>
                <button
                  onClick={() => handleToggleVoice('zh')}
                  className="text-[11px] text-[#8C6D46] hover:underline flex items-center gap-1 font-medium"
                  title="朗讀中文經文"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>中文朗讀</span>
                </button>
              </div>
            </div>

            {/* Bilingual / Multilingual Language Switcher for Lower Section (新增 德文、西班牙文) */}
            <div className="pt-2 border-t border-[#EAE0CD]/80">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#665443]">
                  <Languages className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>下方對照版本：</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {[
                    { id: 'en', label: '英文 (預設)' },
                    { id: 'de', label: '德文 (Deutsch)' },
                    { id: 'es', label: '西班牙文 (Español)' },
                    { id: 'ja', label: '日文' },
                    { id: 'ko', label: '韓文' },
                    { id: 'none', label: '隱藏' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSecondaryLang(lang.id as any)}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        secondaryLang === lang.id
                          ? 'bg-[#8C6D46] text-white shadow-xs font-bold'
                          : 'bg-[#EFE7D7] hover:bg-[#E5DBC7] text-[#5C4A38]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Translation Display with direct voice narration button */}
              {secondaryData && secondaryData.verse && (
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E5DAC5] shadow-inner space-y-1.5">
                  <p className="font-sans text-xs sm:text-sm text-[#473A2D] leading-relaxed italic">
                    "{secondaryData.verse}"
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EFE8DA] text-[11px] text-[#8C6D46] font-semibold">
                    <span>— {secondaryData.reference || scripture.referenceEn || scripture.reference}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8C7B6A] font-normal">{secondaryData.label}</span>
                      {secondaryLang !== 'none' && (
                        <button
                          onClick={() => handleToggleVoice(secondaryLang as VoiceLanguage)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFE6D6] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] text-[10px] font-medium transition-colors"
                          title={`真人發音朗讀${secondaryData.label}`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>真人發音</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 同心禱告 (禱告文再長一點、屬靈直白、簡潔有力、要可發音) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5EDE1] border border-[#E1D4BD] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#705634]">
                  <span className="w-6 h-6 rounded-lg bg-[#8C6D46]/15 text-[#8C6D46] flex items-center justify-center font-bold text-xs">
                    ✝
                  </span>
                  <div>
                    <span className="text-sm font-serif font-bold text-[#3D3023] block leading-tight">
                      同心禱告
                    </span>
                    <span className="text-[10px] text-[#8C7A67] block">
                      屬靈直白 · 簡潔有力 · 溫暖發音
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* 禱告專屬真人發音按鈕 */}
                  <button
                    onClick={handleTogglePrayerVoice}
                    disabled={isLoading || !scripture?.prayer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-xs ${
                      isSpeaking && speakingType === 'prayer'
                        ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                        : 'bg-white hover:bg-[#EAE0CD] text-[#705634] border-[#D9C9AF]'
                    }`}
                    title="溫暖親切發音朗讀同心禱告"
                  >
                    {isSpeaking && speakingType === 'prayer' ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#8C6D46]" />
                    )}
                    <span>{isSpeaking && speakingType === 'prayer' ? '停止朗讀' : '禱告發音'}</span>
                  </button>

                  {/* 複製禱告文按鈕 */}
                  <button
                    onClick={handleCopyPrayer}
                    disabled={!scripture?.prayer}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-[#EAE0CD] text-[#705634] text-xs font-medium border border-[#D9C9AF] transition-colors"
                    title="複製同心禱告文"
                  >
                    {isPrayerCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-[11px] text-emerald-700 font-semibold">已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#8C6D46]" />
                        <span className="text-[11px] hidden sm:inline">複製</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 禱告文內容 */}
              <div className="bg-white/70 rounded-xl p-3.5 border border-[#E8DEC9]/80">
                <p className="text-xs sm:text-sm text-[#3E3227] leading-relaxed tracking-wide font-normal">
                  {scripture.prayer}
                </p>
              </div>

              {scripture.reflection && (
                <div className="pt-1.5 border-t border-[#EADECA]/70 flex items-start gap-1.5 text-[11px] text-[#85715D]">
                  <span className="font-semibold text-[#8C6D46] flex-shrink-0">靈修默想：</span>
                  <span className="leading-relaxed">{scripture.reflection}</span>
                </div>
              )}
            </div>

            {/* Multilingual Voice Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#85715D]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-[#8C7B6A] font-semibold">朗讀語言：</span>
                {[
                  { id: 'zh', label: '中文' },
                  { id: 'en', label: '英文' },
                  { id: 'de', label: '德文' },
                  { id: 'es', label: '西文' },
                  { id: 'ja', label: '日文' },
                  { id: 'ko', label: '韓文' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleToggleVoice(l.id as VoiceLanguage)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                      speakLang === l.id && isSpeaking
                        ? 'bg-amber-600 text-white font-bold animate-pulse'
                        : speakLang === l.id
                        ? 'bg-[#8C6D46] text-white font-bold'
                        : 'bg-[#EFE7D7] text-[#695847] hover:bg-[#E2D6C0]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {scripture.groundingSources && scripture.groundingSources.length > 0 && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8C6D46]" />
                  <a
                    href={scripture.groundingSources[0].uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[#8C6D46] hover:underline"
                  >
                    <span>出處參考</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* PRIMARY ACTION BUTTON: 製作禱告影片 */}
      <div className="w-full">
        <button
          onClick={onStartVideoCreation}
          className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8C6D46] via-[#7B5E39] to-[#684C2A] p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-[0.99] border border-[#A7865B]/40"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
                <span className="text-lg sm:text-xl font-bold tracking-wide">
                  製作禱告影片
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 font-light">
                當你不知道該怎麼辦，先來禱告。
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/25 transition-colors">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
          </div>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform" />
        </button>
      </div>

      {/* 6-Step Workflow Guide */}
      <div className="w-full bg-[#FAF6EE] rounded-2xl p-4 border border-[#E8DEC9] text-center">
        <span className="text-[11px] font-semibold text-[#8C6D46] uppercase tracking-wider block mb-2.5">
          隨時禱告製作流程
        </span>
        <div className="grid grid-cols-6 gap-1 text-[11px] sm:text-xs text-[#635140] font-medium">
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#EAE0CE] flex items-center justify-center text-[10px] text-[#8C6D46] font-bold mb-1">
              1
            </span>
            <span>選來源</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#EAE0CE] flex items-center justify-center text-[10px] text-[#8C6D46] font-bold mb-1">
              2
            </span>
            <span>多語對照</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#EAE0CE] flex items-center justify-center text-[10px] text-[#8C6D46] font-bold mb-1">
              3
            </span>
            <span>調文字</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#EAE0CE] flex items-center justify-center text-[10px] text-[#8C6D46] font-bold mb-1">
              4
            </span>
            <span>讚美之泉</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#EAE0CE] flex items-center justify-center text-[10px] text-[#8C6D46] font-bold mb-1">
              5
            </span>
            <span>真人朗讀</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white flex items-center justify-center text-[10px] font-bold mb-1">
              6
            </span>
            <span className="text-[#8C6D46] font-bold">匯出片</span>
          </div>
        </div>
      </div>
    </div>
  );
};
