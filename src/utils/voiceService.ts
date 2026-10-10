/**
 * 隨禱 (Always Near) - 真人溫暖親切發音服務
 * 支援多國語言：繁體中文、英文、德文、西班牙文、日文、韓文
 * 整合 Gemini 3.8 Flash Lite TTS 與瀏覽器本機語音合成雙軌備援
 * 聲音風格：溫暖、柔和、親切、敬虔
 */

export type VoiceLanguage = 'zh' | 'en' | 'de' | 'es' | 'ja' | 'ko';

type VoiceStateListener = (isPlaying: boolean, statusText?: string) => void;

class VoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingState: boolean = false;
  private currentLang: VoiceLanguage = 'zh';
  private listeners: Set<VoiceStateListener> = new Set();

  public subscribe(listener: VoiceStateListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isPlaying: boolean, statusText?: string) {
    this.isSpeakingState = isPlaying;
    this.listeners.forEach((l) => l(isPlaying, statusText));
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public getCurrentLanguage(): VoiceLanguage {
    return this.currentLang;
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify(false);
  }

  /**
   * 溫暖真人多國語言朗讀
   */
  public async speakText(text: string, lang: VoiceLanguage = 'zh'): Promise<void> {
    if (!text || !text.trim()) return;

    this.currentLang = lang;
    this.stopSpeaking();

    const langNames: Record<VoiceLanguage, string> = {
      zh: '繁體中文',
      en: '英文',
      de: '德文 (Deutsch)',
      es: '西班牙文 (Español)',
      ja: '日文 (日本語)',
      ko: '韓文 (한국어)',
    };

    this.notify(true, `正在為您準備${langNames[lang]}溫暖親切的真人發音...`);

    try {
      // 1. 呼叫後端 Gemini 3.8 Flash Lite TTS
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: 'Kore', // Kore: 溫暖親切柔和音色
          language: lang,
        }),
      });

      const data = await res.json();

      if (data.success && data.audioBase64) {
        this.notify(true, `正在播放 Gemini ${langNames[lang]}溫暖親切真人發音...`);
        const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        const audio = new Audio(audioSrc);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          this.notify(false);
        };

        audio.onerror = () => {
          this.fallbackBrowserSpeech(text, lang);
        };

        await audio.play();
        return;
      }

      // 若後端回傳 fallback，則使用本機瀏覽器語音
      this.fallbackBrowserSpeech(text, lang);

    } catch (err) {
      console.warn('TTS API error, falling back to local speech:', err);
      this.fallbackBrowserSpeech(text, lang);
    }
  }

  /**
   * 瀏覽器本機語音合成多語備用方案
   */
  private fallbackBrowserSpeech(text: string, lang: VoiceLanguage) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notify(false, '您的瀏覽器不支援語音播放');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // 溫暖平緩的敬虔靈修語速
    utterance.rate = 0.86;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();

    if (lang === 'zh') {
      const zhVoice = voices.find(
        (v) =>
          (v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang.startsWith('zh')) &&
          (v.name.includes('Natural') || v.name.includes('Yating') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('zh'));
      if (zhVoice) utterance.voice = zhVoice;
      utterance.lang = 'zh-TW';

    } else if (lang === 'de') {
      const deVoice = voices.find(
        (v) => v.lang.startsWith('de') && (v.name.includes('Natural') || v.name.includes('Katja') || v.name.includes('Hedda') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('de'));
      if (deVoice) utterance.voice = deVoice;
      utterance.lang = 'de-DE';

    } else if (lang === 'es') {
      const esVoice = voices.find(
        (v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Helena') || v.name.includes('Elvira') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('es'));
      if (esVoice) utterance.voice = esVoice;
      utterance.lang = 'es-ES';

    } else if (lang === 'ja') {
      const jaVoice = voices.find(
        (v) => v.lang.startsWith('ja') && (v.name.includes('Natural') || v.name.includes('Nanami') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('ja'));
      if (jaVoice) utterance.voice = jaVoice;
      utterance.lang = 'ja-JP';

    } else if (lang === 'ko') {
      const koVoice = voices.find(
        (v) => v.lang.startsWith('ko') && (v.name.includes('Natural') || v.name.includes('SunHi') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('ko'));
      if (koVoice) utterance.voice = koVoice;
      utterance.lang = 'ko-KR';

    } else {
      // en
      const enVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Jenny') || v.name.includes('Aria') || !v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      this.notify(true, '溫暖親切朗讀播放中...');
    };

    utterance.onend = () => {
      this.notify(false);
    };

    utterance.onerror = () => {
      this.notify(false);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceService = new VoiceService();
