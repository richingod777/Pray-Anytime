import React, { useState } from 'react';
import { TextStyleConfig, ScriptureData } from '../types';
import { voiceService } from '../utils/voiceService';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Palette,
  MoveVertical,
  Sparkles,
  Languages,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface Props {
  topText: TextStyleConfig;
  bottomText: TextStyleConfig;
  scripture?: ScriptureData | null;
  onChangeTopText: (updated: Partial<TextStyleConfig>) => void;
  onChangeBottomText: (updated: Partial<TextStyleConfig>) => void;
}

const COLOR_PRESETS = [
  { label: '柔白', value: '#FFFFFF' },
  { label: '暖金', value: '#F3E5AB' },
  { label: '象牙', value: '#FAF0E6' },
  { label: '朝霞粉', value: '#FDE2E4' },
  { label: '清泉綠', value: '#E2F0D9' },
  { label: '沉穩石', value: '#333333' },
];

const FONT_OPTIONS = [
  { label: '典雅宋體 (Noto Serif TC)', value: '"Noto Serif TC", serif' },
  { label: '清晰黑體 (Noto Sans TC)', value: '"Noto Sans TC", sans-serif' },
  { label: '英倫莊嚴 (Cinzel Serif)', value: '"Cinzel", serif' },
];

export const TextEditorPanel: React.FC<Props> = ({
  topText,
  bottomText,
  scripture,
  onChangeTopText,
  onChangeBottomText,
}) => {
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeConfig = activeTab === 'top' ? topText : bottomText;
  const updateActive = activeTab === 'top' ? onChangeTopText : onChangeBottomText;

  // Toggle voice narration for current active text
  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const isEnglish = /[a-zA-Z]{5,}/.test(activeConfig.content);
      voiceService.speakText(activeConfig.content, isEnglish ? 'en' : 'zh');
      // Auto reset isSpeaking when done via listener
      const unsub = voiceService.subscribe((playing) => {
        setIsSpeaking(playing);
        if (!playing) unsub();
      });
    }
  };

  // Quick apply translation to bottom text (支援 英文、德文、西班牙文、日文、韓文、短禱)
  const handleApplySecondaryLanguage = (langKey: 'en' | 'de' | 'es' | 'ja' | 'ko' | 'prayer') => {
    if (!scripture) return;

    if (langKey === 'en') {
      const enVerse = scripture.verseEn || '';
      const enRef = scripture.referenceEn || scripture.reference;
      onChangeBottomText({
        content: `"${enVerse}"\n— ${enRef}`,
      });
    } else if (langKey === 'de') {
      const deVerse = scripture.verseDe || scripture.translations?.de?.verse || '';
      const deRef = scripture.referenceDe || scripture.translations?.de?.reference || scripture.reference;
      onChangeBottomText({
        content: `"${deVerse}"\n— ${deRef}`,
      });
    } else if (langKey === 'es') {
      const esVerse = scripture.verseEs || scripture.translations?.es?.verse || '';
      const esRef = scripture.referenceEs || scripture.translations?.es?.reference || scripture.reference;
      onChangeBottomText({
        content: `"${esVerse}"\n— ${esRef}`,
      });
    } else if (langKey === 'ja') {
      const jaData = scripture.translations?.ja;
      if (jaData) {
        onChangeBottomText({
          content: `「${jaData.verse}」\n— ${jaData.reference}`,
        });
      }
    } else if (langKey === 'ko') {
      const koData = scripture.translations?.ko;
      if (koData) {
        onChangeBottomText({
          content: `"${koData.verse}"\n— ${koData.reference}`,
        });
      }
    } else if (langKey === 'prayer') {
      onChangeBottomText({
        content: `【同心禱告】${scripture.prayer}`,
      });
    }
  };

  return (
    <div className="w-full bg-[#FAF6EE] rounded-3xl p-5 border border-[#E8DEC9] shadow-sm">
      {/* Tab Switcher: Top Verse vs Bottom Multi-Language/Prayer */}
      <div className="flex bg-[#EFE6D5] p-1 rounded-2xl mb-4">
        <button
          onClick={() => setActiveTab('top')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'top'
              ? 'bg-[#8C6D46] text-white shadow-sm'
              : 'text-[#615141] hover:text-[#3B3026]'
          }`}
        >
          上方主體 (預設中文經文)
        </button>
        <button
          onClick={() => setActiveTab('bottom')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'bottom'
              ? 'bg-[#8C6D46] text-white shadow-sm'
              : 'text-[#615141] hover:text-[#3B3026]'
          }`}
        >
          下方對照 (多語版本 / 出處)
        </button>
      </div>

      {/* Multilingual Quick Pairing Bar for Bottom Text (新增 德文、西班牙文) */}
      {activeTab === 'bottom' && scripture && (
        <div className="mb-4 p-3 rounded-2xl bg-white/80 border border-[#E5DAC5] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#544332]">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#8C6D46]" />
              快速切換下方對照語言版本：
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            <button
              onClick={() => handleApplySecondaryLanguage('en')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              英文 (預設)
            </button>
            <button
              onClick={() => handleApplySecondaryLanguage('de')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              德文 (Deutsch)
            </button>
            <button
              onClick={() => handleApplySecondaryLanguage('es')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              西班牙文
            </button>
            <button
              onClick={() => handleApplySecondaryLanguage('ja')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              日文版本
            </button>
            <button
              onClick={() => handleApplySecondaryLanguage('ko')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              韓文版本
            </button>
            <button
              onClick={() => handleApplySecondaryLanguage('prayer')}
              className="py-1.5 px-1.5 rounded-xl text-[11px] font-semibold bg-[#EFE7D7] hover:bg-[#8C6D46] hover:text-white text-[#5C4A38] border border-[#DACFBD] transition-all text-center"
            >
              同心禱告
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* 1. Content Textarea & Real Voice Narration Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#544332] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#8C6D46]" />
              文字內容編輯
            </label>

            {/* Real Human-Like Voice Preview Button */}
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                  : 'bg-white hover:bg-[#F2EBDC] text-[#5C4A38] border-[#DACFBD]'
              }`}
              title="溫暖真人朗讀此段文字"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-[#8C6D46]" />}
              <span>{isSpeaking ? '停止' : '真人發音試聽'}</span>
            </button>
          </div>

          <textarea
            value={activeConfig.content}
            onChange={(e) => updateActive({ content: e.target.value })}
            rows={activeTab === 'top' ? 3 : 2}
            className="w-full rounded-2xl border border-[#D8CCB5] bg-white p-3 text-sm text-[#2E2822] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:border-transparent transition-all shadow-inner"
            placeholder={activeTab === 'top' ? '請輸入主體經文（預設中文）...' : '請輸入下方版本（英文對照或出處）...'}
          />
        </div>

        {/* 2. Font Size Settings (可設定字型大小) */}
        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#E5DAC5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8C6D46]" />
              <div>
                <span className="text-xs font-semibold text-[#4A3B2C] block">
                  智能最大化字級適配
                </span>
                <span className="text-[10px] text-[#8C7B6A]">
                  自動依螢幕比例與中英字數計算最佳字級
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activeConfig.autoFit}
                onChange={(e) => updateActive({ autoFit: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C6D46]"></div>
            </label>
          </div>

          {/* Explicit Font Size Slider & Quick Presets */}
          <div className="pt-2 border-t border-[#EFE8DA] space-y-2">
            <div className="flex justify-between items-center text-xs text-[#544332] font-medium">
              <span className="flex items-center gap-1">
                <span>自訂字型大小</span>
                {activeConfig.autoFit && (
                  <span className="text-[10px] text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded font-normal">
                    (關閉智能適配後固定以此數值顯示)
                  </span>
                )}
              </span>
              <span className="font-mono text-[#8C6D46] font-bold text-sm">
                {activeConfig.fontSize} px
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateActive({
                    autoFit: false,
                    fontSize: Math.max(14, activeConfig.fontSize - 2),
                  })
                }
                className="w-8 h-8 rounded-lg bg-[#EFE6D5] hover:bg-[#E5D7BF] text-[#544130] font-bold flex items-center justify-center transition-all active:scale-95 text-sm"
                title="縮小字型"
              >
                A-
              </button>
              <input
                type="range"
                min="14"
                max="72"
                step="1"
                value={activeConfig.fontSize}
                onChange={(e) =>
                  updateActive({ autoFit: false, fontSize: Number(e.target.value) })
                }
                className="w-full accent-[#8C6D46] h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <button
                onClick={() =>
                  updateActive({
                    autoFit: false,
                    fontSize: Math.min(72, activeConfig.fontSize + 2),
                  })
                }
                className="w-8 h-8 rounded-lg bg-[#EFE6D5] hover:bg-[#E5D7BF] text-[#544130] font-bold flex items-center justify-center transition-all active:scale-95 text-sm"
                title="放大字型"
              >
                A+
              </button>
            </div>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#8C7B6A]">字級快速選取：</span>
              {[
                { label: '小 (20px)', size: 20 },
                { label: '適中 (28px)', size: 28 },
                { label: '大 (36px)', size: 36 },
                { label: '特大 (48px)', size: 48 },
              ].map((preset) => (
                <button
                  key={preset.size}
                  onClick={() => updateActive({ autoFit: false, fontSize: preset.size })}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    !activeConfig.autoFit && activeConfig.fontSize === preset.size
                      ? 'bg-[#8C6D46] text-white font-bold'
                      : 'bg-[#F2EBDC] hover:bg-[#EAE0CC] text-[#5C4A38]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* 3. Font Family Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#544332] mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#8C6D46]" />
            字體風格選擇
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FONT_OPTIONS.map((f) => {
              const isSelected = activeConfig.fontFamily === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => updateActive({ fontFamily: f.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-medium text-left border transition-all ${
                    isSelected
                      ? 'bg-[#8C6D46] text-white border-[#8C6D46] shadow-sm'
                      : 'bg-white hover:bg-[#F2EBDC] text-[#4A3B2C] border-[#DACFBD]'
                  }`}
                >
                  <span className="block truncate">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Text Color & Presets */}
        <div>
          <label className="block text-xs font-semibold text-[#544332] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#8C6D46]" />
              文字色彩
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#8C7B6A]">自訂：</span>
              <input
                type="color"
                value={activeConfig.color}
                onChange={(e) => updateActive({ color: e.target.value })}
                className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
              />
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => {
              const isSelected = activeConfig.color.toLowerCase() === p.value.toLowerCase();
              return (
                <button
                  key={p.value}
                  onClick={() => updateActive({ color: p.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                      : 'bg-white hover:bg-[#F5EFE3] text-[#4A3B2C] border-[#DACFBD]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-inner"
                    style={{ backgroundColor: p.value }}
                  />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Alignment & Position Offset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-white/70 p-3 rounded-2xl border border-[#E5DAC5]">
            <span className="block text-xs font-semibold text-[#544332] mb-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#8C6D46]" /> 對齊方式
            </span>
            <div className="flex gap-1 bg-[#EFE6D5] p-1 rounded-xl">
              <button
                onClick={() => updateActive({ textAlign: 'left' })}
                className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs ${
                  activeConfig.textAlign === 'left' ? 'bg-[#8C6D46] text-white' : 'text-[#615141]'
                }`}
                title="靠左對齊"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateActive({ textAlign: 'center' })}
                className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs ${
                  activeConfig.textAlign === 'center' ? 'bg-[#8C6D46] text-white' : 'text-[#615141]'
                }`}
                title="置中對齊"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateActive({ textAlign: 'right' })}
                className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs ${
                  activeConfig.textAlign === 'right' ? 'bg-[#8C6D46] text-white' : 'text-[#615141]'
                }`}
                title="靠右對齊"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white/70 p-3 rounded-2xl border border-[#E5DAC5]">
            <div className="flex justify-between text-xs font-semibold text-[#544332] mb-2 items-center">
              <span className="flex items-center gap-1">
                <MoveVertical className="w-3 h-3 text-[#8C6D46]" /> 垂直位置微調
              </span>
              <span className="font-mono text-[11px] text-[#8C6D46]">{activeConfig.posY}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              value={activeConfig.posY}
              onChange={(e) => updateActive({ posY: Number(e.target.value) })}
              className="w-full accent-[#8C6D46] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Shadow & Backdrop Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => updateActive({ hasShadow: !activeConfig.hasShadow })}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
              activeConfig.hasShadow
                ? 'bg-[#8C6D46]/15 border-[#8C6D46] text-[#634E35] font-semibold'
                : 'bg-white border-[#DACFBD] text-[#786653]'
            }`}
          >
            {activeConfig.hasShadow ? '✓ 文字深色陰影開' : '文字深色陰影關'}
          </button>
          <button
            onClick={() => updateActive({ hasBackdrop: !activeConfig.hasBackdrop })}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
              activeConfig.hasBackdrop
                ? 'bg-[#8C6D46]/15 border-[#8C6D46] text-[#634E35] font-semibold'
                : 'bg-white border-[#DACFBD] text-[#786653]'
            }`}
          >
            {activeConfig.hasBackdrop ? '✓ 柔和半透明底板開' : '柔和半透明底板關'}
          </button>
        </div>
      </div>
    </div>
  );
};
