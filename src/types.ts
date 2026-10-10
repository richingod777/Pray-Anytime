export type ScriptureSource = '每日靈糧' | '荒漠甘泉' | '聖經' | 'THE BIBLE';

export interface TranslationItem {
  label: string;
  verse: string;
  reference: string;
}

export type SupportedLanguage = 'zh' | 'en' | 'de' | 'es' | 'ja' | 'ko';

export interface ScriptureData {
  source: ScriptureSource;
  verse: string; // primary (usually Traditional Chinese)
  reference: string;
  verseZh?: string;
  referenceZh?: string;
  verseEn?: string;
  referenceEn?: string;
  verseDe?: string;
  referenceDe?: string;
  verseEs?: string;
  referenceEs?: string;
  translations?: Record<string, TranslationItem>;
  prayer: string;
  reflection: string;
  groundingSources?: { title: string; uri: string }[];
  isFallback?: boolean;
  message?: string;
}

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';
export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface TextStyleConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  autoFit: boolean;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  posY: number; // percentage offset -30 to 30
  hasShadow: boolean;
  hasBackdrop: boolean;
}

export interface VideoStudioConfig {
  aspectRatio: AspectRatio;
  themeId: string;
  trackId: string;
  topText: TextStyleConfig;
  bottomText: TextStyleConfig;
  showWatermark: boolean;
  watermarkText: string;
  // Bilingual / Multilingual options
  bilingualMode: boolean;
  secondaryLang: 'en' | 'de' | 'es' | 'ja' | 'ko' | 'prayer';
  // User uploaded custom background image
  customBackgroundImage?: string | null; // dataURL
  customBgBlur?: number; // 0 to 20
  customBgOverlay?: number; // 0 to 90 opacity percentage
}

