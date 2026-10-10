import React, { useState } from 'react';
import { ScriptureSource, ScriptureData } from '../types';
import { voiceService } from '../utils/voiceService';
import { RefreshCw, BookOpen, ExternalLink, Sparkles, AlertCircle, Volume2, VolumeX, Languages } from 'lucide-react';

interface Props {
  currentSource: ScriptureSource;
  scripture: ScriptureData | null;
  isLoading: boolean;
  onSelectSource: (src: ScriptureSource) => void;
  onRefreshVerse: () => void;
}

export const SourceSelector: React.FC<Props> = ({
  currentSource,
  scripture,
  isLoading,
  onSelectSource,
  onRefreshVerse,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const sources: { id: ScriptureSource; label: string; desc: string }[] = [
    { id: '每日靈糧', label: '每日靈糧', desc: '每日靈修與生活撫慰' },
    { id: '荒漠甘泉', label: '荒漠甘泉', desc: '考門夫人經典信心甘泉' },
    { id: '聖經', label: '聖經', desc: '繁體和合本應許經文' },
    { id: 'THE BIBLE', label: 'THE BIBLE', desc: 'English Scripture' },
  ];

  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!scripture) return;
      setIsSpeaking(true);
      const textToSpeak = `${scripture.verseZh || scripture.verse}。${scripture.referenceZh || scripture.reference}。${scripture.prayer}`;
      voiceService.speakText(textToSpeak, 'zh');

      const unsub = voiceService.subscribe((playing) => {
        setIsSpeaking(playing);
        if (!playing) unsub();
      });
    }
  };

  return (
    <div className="w-full bg-[#FAF6EE] rounded-3xl p-5 border border-[#E8DEC9] shadow-sm">
      {/* Header and Source Tabs */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C6D46]" />
            <span className="text-sm font-semibold text-[#4A3B2C] tracking-wide">
              金句來源切換
            </span>
          </div>
          <span className="text-xs text-[#9B8874]">
            由 Google Search Grounding 自動搜尋
          </span>
        </div>

        {/* 4 Source Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sources.map((s) => {
            const isActive = currentSource === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSource(s.id)}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl text-center transition-all ${
                  isActive
                    ? 'bg-[#8C6D46] text-amber-50 shadow-md font-semibold scale-[1.02]'
                    : 'bg-[#F2EBDC] hover:bg-[#EAE0CD] text-[#5C4A38] font-medium border border-[#E3D7C0]'
                }`}
              >
                <span className="text-sm">{s.label}</span>
                <span
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isActive ? 'text-amber-200/90' : 'text-[#8F7D6B]'
                  }`}
                >
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Scripture Card */}
      <div className="relative bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#E8DEC9] shadow-inner">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-7 h-7 text-[#8C6D46] animate-spin mb-3" />
            <p className="text-sm font-medium text-[#4A3B2C]">
              正在聯網搜尋「{currentSource}」靈修金句...
            </p>
            <p className="text-xs text-[#9B8874] mt-1">中英雙語版本檢索中</p>
          </div>
        ) : scripture ? (
          <div className="space-y-3">
            {/* Fallback or offline friendly notice */}
            {scripture.isFallback && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{scripture.message || '目前已載入內建中英雙語靈修金句，可正常製作影片！'}</span>
              </div>
            )}

            {/* Verse text (Chinese) */}
            <div className="relative pl-3 border-l-2 border-[#8C6D46]">
              <p className="font-serif text-base sm:text-lg text-[#2E2822] leading-relaxed font-semibold">
                「{scripture.verseZh || scripture.verse}」
              </p>
            </div>

            {/* Translations preview (English / German / Spanish) */}
            <div className="space-y-1.5 pt-1">
              {scripture.verseEn && (
                <div className="pl-3 border-l-2 border-stone-300 py-0.5">
                  <p className="font-sans text-xs text-[#5C4B3A] italic leading-relaxed">
                    "{scripture.verseEn}"
                  </p>
                  <span className="text-[10px] text-[#8C6D46] font-medium block">
                    — {scripture.referenceEn || scripture.reference} (English)
                  </span>
                </div>
              )}
              {scripture.verseDe && (
                <div className="pl-3 border-l-2 border-amber-300/70 py-0.5">
                  <p className="font-sans text-xs text-[#5C4B3A] italic leading-relaxed">
                    "{scripture.verseDe}"
                  </p>
                  <span className="text-[10px] text-[#8C6D46] font-medium block">
                    — {scripture.referenceDe || scripture.reference} (Deutsch)
                  </span>
                </div>
              )}
              {scripture.verseEs && (
                <div className="pl-3 border-l-2 border-rose-300/70 py-0.5">
                  <p className="font-sans text-xs text-[#5C4B3A] italic leading-relaxed">
                    "{scripture.verseEs}"
                  </p>
                  <span className="text-[10px] text-[#8C6D46] font-medium block">
                    — {scripture.referenceEs || scripture.reference} (Español)
                  </span>
                </div>
              )}
            </div>

            {/* Reference and Prayer */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#EFE8DA]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#8C6D46] tracking-wide">
                  — {scripture.referenceZh || scripture.reference}
                </span>
                <button
                  onClick={() => voiceService.speakText(scripture.prayer, 'zh')}
                  className="flex items-center gap-1 text-[11px] text-[#8C6D46] hover:underline font-semibold"
                  title="朗讀同心禱告"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>禱告發音</span>
                </button>
              </div>
              <p className="text-xs text-[#6B5A49] leading-relaxed bg-[#FAF6EE] p-2.5 rounded-xl border border-[#EADECA]">
                <strong className="text-[#8C6D46] font-semibold">同心禱告：</strong>
                {scripture.prayer}
              </p>
            </div>

            {/* Multilingual Voice Action Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-[10px] text-[#8C7B6A] font-semibold flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#8C6D46]" /> 溫暖真人朗讀：
              </span>
              {[
                { id: 'zh', label: '經文中文' },
                { id: 'prayer', label: '同心禱告' },
                { id: 'en', label: '英文' },
                { id: 'de', label: '德文' },
                { id: 'es', label: '西班牙文' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    if (l.id === 'prayer') {
                      voiceService.speakText(scripture.prayer, 'zh');
                      return;
                    }
                    let txt = `${scripture.verseZh || scripture.verse}。${scripture.referenceZh || scripture.reference}`;
                    if (l.id === 'en') txt = `${scripture.verseEn || scripture.verse}。${scripture.referenceEn || scripture.reference}`;
                    if (l.id === 'de') txt = `${scripture.verseDe || scripture.verseEn}。${scripture.referenceDe || ''}`;
                    if (l.id === 'es') txt = `${scripture.verseEs || scripture.verseEn}。${scripture.referenceEs || ''}`;
                    voiceService.speakText(txt, l.id as any);
                  }}
                  className="px-2 py-0.5 rounded-md bg-[#F2EBDC] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] text-[10px] font-medium border border-[#DACFBD] transition-all active:scale-95"
                >
                  {l.label}發音
                </button>
              ))}
            </div>

            {/* Search Grounding Citation Links */}
            {scripture.groundingSources && scripture.groundingSources.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#7A6B5C]">
                <span className="flex items-center gap-1 font-medium text-[#8C6D46]">
                  <Sparkles className="w-3 h-3 text-[#8C6D46]" /> 搜尋出處：
                </span>
                {scripture.groundingSources.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2EBDC] hover:bg-[#EAE0CD] text-[#5C4A38] transition-colors border border-[#E3D7C0]"
                  >
                    <span className="max-w-[140px] truncate">{link.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Change Verse Button */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {isSpeaking ? (
            <button
              onClick={() => {
                voiceService.stopSpeaking();
                setIsSpeaking(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white border border-amber-600 animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>停止朗讀</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#8C7B6A]">點選上方語言可聆聽親切發音</span>
          )}

          <button
            onClick={onRefreshVerse}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F2EBDC] hover:bg-[#EAE0CD] text-[#5C4A38] text-xs font-semibold border border-[#DACFBD] transition-all active:scale-95 disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8C6D46]' : ''}`} />
            <span>換一句經文</span>
          </button>
        </div>
      </div>
    </div>
  );
};
