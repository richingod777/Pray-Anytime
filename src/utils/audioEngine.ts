/**
 * 隨禱 (Always Near) - 敬拜背景音樂音訊引擎
 * 預設經典詩歌「讚美之泉」，支援純音樂敬拜旋律合成 (Web Audio API)
 * 以及使用者上傳 MP3 / WAV 檔案解碼與錄音輸出
 */

export interface MelodyNote {
  freq: number;
  timeOffset: number; // in seconds relative to chord
  duration: number;
}

export interface TrackInfo {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  isCustom?: boolean;
  bpm?: number;
  chords?: number[][];
  melody?: MelodyNote[];
}

// 頻率速查表 (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

// 內建敬拜純音樂曲目（以經典詩歌「讚美之泉」為預設首選）
export const BUILTIN_TRACKS: TrackInfo[] = [
  {
    id: 'sop_stream_of_praise',
    name: '讚美之泉 (Stream of Praise)',
    subtitle: '經典敬拜首選',
    description: '經典詩歌主旋律「天父祢的愛，何等奇妙深不可測，讚美之泉湧流」',
    bpm: 56,
    // 讚美之泉經典進行：C -> G/B -> Am7 -> Em/G -> F -> C/E -> Dm7 -> G7
    chords: [
      [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], // C
      [NOTE.B3 / 2, NOTE.G3, NOTE.D4, NOTE.G4], // G/B
      [NOTE.A3 / 2, NOTE.E3, NOTE.A3, NOTE.C4, NOTE.E4], // Am7
      [NOTE.G3 / 2, NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E4], // Em/G
      [NOTE.F3 / 2, NOTE.C3, NOTE.F3, NOTE.A3, NOTE.C4], // F
      [NOTE.E3 / 2, NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], // C/E
      [NOTE.D3, NOTE.A3, NOTE.C4, NOTE.F4], // Dm7
      [NOTE.G3, NOTE.D4, NOTE.F4, NOTE.B4], // G7
    ],
    // 讚美之泉 主旋律音符（純鋼琴與鐘琴伴奏）
    melody: [
      // 第一段：天父祢的愛 (E4 - G4 - A4 - G4)
      { freq: NOTE.E4, timeOffset: 0.1, duration: 0.7 },
      { freq: NOTE.G4, timeOffset: 0.9, duration: 0.7 },
      { freq: NOTE.A4, timeOffset: 1.7, duration: 0.9 },
      { freq: NOTE.G4, timeOffset: 2.8, duration: 1.2 },
      // 奇妙深不可測 (E4 - D4 - C4 - D4)
      { freq: NOTE.E4, timeOffset: 4.2, duration: 0.7 },
      { freq: NOTE.D4, timeOffset: 5.0, duration: 0.7 },
      { freq: NOTE.C4, timeOffset: 5.8, duration: 0.8 },
      { freq: NOTE.D4, timeOffset: 6.8, duration: 1.4 },
      // 第二段：讚美之泉湧流不息 (E4 - G4 - A4 - C5 - A4 - G4)
      { freq: NOTE.E4, timeOffset: 8.5, duration: 0.7 },
      { freq: NOTE.G4, timeOffset: 9.3, duration: 0.7 },
      { freq: NOTE.A4, timeOffset: 10.1, duration: 0.7 },
      { freq: NOTE.C5, timeOffset: 10.9, duration: 0.9 },
      { freq: NOTE.A4, timeOffset: 11.9, duration: 0.7 },
      { freq: NOTE.G4, timeOffset: 12.7, duration: 1.2 },
      // 榮耀歸於祢 (E4 - D4 - C4)
      { freq: NOTE.E4, timeOffset: 14.2, duration: 0.8 },
      { freq: NOTE.D4, timeOffset: 15.2, duration: 0.9 },
      { freq: NOTE.C4, timeOffset: 16.3, duration: 2.2 },
    ],
  },
  {
    id: 'the_greatest_blessing',
    name: '這一生最美的祝福',
    subtitle: '讚美之泉經典',
    description: '溫暖動人的鋼琴伴奏「在祢手裡，有永恆的盼望」',
    bpm: 50,
    chords: [
      [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.F4], // D
      [NOTE.A3 / 2, NOTE.E3, NOTE.A3, NOTE.C4], // A/C#
      [NOTE.B3 / 2, NOTE.F3, NOTE.B3, NOTE.D4], // Bm
      [NOTE.G3 / 2, NOTE.D3, NOTE.G3, NOTE.B3], // G
    ],
    melody: [
      { freq: NOTE.F4, timeOffset: 0.2, duration: 0.8 },
      { freq: NOTE.A4, timeOffset: 1.1, duration: 0.8 },
      { freq: NOTE.B4, timeOffset: 2.0, duration: 1.1 },
      { freq: NOTE.A4, timeOffset: 3.3, duration: 1.3 },
      { freq: NOTE.F4, timeOffset: 4.8, duration: 0.8 },
      { freq: NOTE.E4, timeOffset: 5.7, duration: 0.8 },
      { freq: NOTE.D4, timeOffset: 6.6, duration: 1.8 },
    ],
  },
  {
    id: 'as_the_deer',
    name: '如鹿切慕溪水 (As the Deer)',
    subtitle: '敬拜渴慕之歌',
    description: '「神啊，我的心切慕祢，如鹿切慕溪水」悠揚大提琴與鋼琴',
    bpm: 48,
    chords: [
      [NOTE.D3, NOTE.F4, NOTE.A4, NOTE.D5],
      [NOTE.A3 / 2, NOTE.E4, NOTE.A4, NOTE.C5],
      [NOTE.B3 / 2, NOTE.D4, NOTE.F4, NOTE.B4],
      [NOTE.G3 / 2, NOTE.D4, NOTE.G4, NOTE.B4],
    ],
    melody: [
      { freq: NOTE.D4, timeOffset: 0.2, duration: 0.8 },
      { freq: NOTE.F4, timeOffset: 1.1, duration: 0.8 },
      { freq: NOTE.A4, timeOffset: 2.0, duration: 1.2 },
      { freq: NOTE.B4, timeOffset: 3.4, duration: 0.8 },
      { freq: NOTE.A4, timeOffset: 4.3, duration: 1.4 },
    ],
  },
  {
    id: 'still_waters',
    name: '安歇水邊 (Beside Still Waters)',
    subtitle: '詩篇23篇安息調',
    description: '溫潤平靜的電鋼琴與暖心環境和弦，引導至可安歇的水邊',
    bpm: 54,
    chords: [
      [146.83, 220.00, 293.66, 369.99, 440.00], // D
      [196.00, 246.94, 293.66, 392.00, 493.88], // G
      [123.47, 185.00, 246.94, 293.66, 369.99], // Bm
      [220.00, 277.18, 329.63, 440.00, 554.37], // A
    ],
  },
  {
    id: 'morning_dawn',
    name: '黎明曙光 (Morning Dawn)',
    subtitle: '晨曦靈修伴奏',
    description: '晨光初現時的柔和原聲琶音與安寧氛圍',
    bpm: 50,
    chords: [
      [196.00, 293.66, 392.00, 493.88, 587.33], // G
      [130.81, 196.00, 261.63, 329.63, 392.00], // C
      [164.81, 246.94, 329.63, 392.00, 493.88], // Em
      [146.83, 220.00, 293.66, 369.99, 440.00], // D
    ],
  },
  {
    id: 'peace_river',
    name: '平安如江河 (Peace Like a River)',
    subtitle: '沉浸式靜心弦樂',
    description: '如靜水深流的水晶鐘琴與溫柔弦樂長音',
    bpm: 46,
    chords: [
      [130.81, 261.63, 329.63, 392.00, 523.25], // C
      [174.61, 261.63, 349.23, 440.00, 523.25], // F
      [110.00, 220.00, 261.63, 329.63, 440.00], // Am
      [196.00, 246.94, 293.66, 392.00, 493.88], // G
    ],
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  // 預設經典詩歌「讚美之泉」
  private currentTrack: TrackInfo = BUILTIN_TRACKS[0];
  private isPlaying: boolean = false;

  // Custom uploaded audio buffers
  private customAudioBuffers: Map<string, AudioBuffer> = new Map();
  private customTracks: TrackInfo[] = [];

  // Web Audio Nodes
  private masterGain: GainNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private synthInterval: number | null = null;
  private melodyTimeoutIds: number[] = [];
  private activeCustomSource: AudioBufferSourceNode | null = null;
  private currentChordIndex: number = 0;

  constructor() {
    // 預設為讚美之泉
    this.currentTrack = BUILTIN_TRACKS[0];
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      // Connect to output speakers
      this.masterGain.connect(this.ctx.destination);

      // Destination for Canvas MediaRecorder capture
      this.streamDestination = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.streamDestination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMediaStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.initContext();
    return this.streamDestination;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): TrackInfo {
    return this.currentTrack;
  }

  public getAllTracks(): TrackInfo[] {
    return [...BUILTIN_TRACKS, ...this.customTracks];
  }

  public selectTrack(trackId: string) {
    const all = this.getAllTracks();
    const found = all.find((t) => t.id === trackId);
    if (found) {
      const wasPlaying = this.isPlaying;
      if (wasPlaying) {
        this.stop();
      }
      this.currentTrack = found;
      if (wasPlaying) {
        this.play();
      }
    }
  }

  public getRandomTrack(): TrackInfo {
    const all = this.getAllTracks();
    const otherTracks = all.filter((t) => t.id !== this.currentTrack.id);
    const pool = otherTracks.length > 0 ? otherTracks : all;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  public switchRandomTrack(): TrackInfo {
    const next = this.getRandomTrack();
    this.selectTrack(next.id);
    return next;
  }

  public async uploadCustomTrack(file: File): Promise<TrackInfo> {
    this.initContext();
    if (!this.ctx) throw new Error('AudioContext unavailable');

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');

    const newTrack: TrackInfo = {
      id,
      name: `自訂：${cleanName}`,
      description: `使用者上傳音樂 (${audioBuffer.duration.toFixed(0)} 秒)`,
      isCustom: true,
    };

    this.customAudioBuffers.set(id, audioBuffer);
    this.customTracks.push(newTrack);
    this.selectTrack(id);

    return newTrack;
  }

  public play() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.currentTrack.isCustom) {
      this.playCustomTrack(this.currentTrack.id);
    } else {
      this.playProceduralTrack();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.melodyTimeoutIds.forEach((id) => clearTimeout(id));
    this.melodyTimeoutIds = [];

    if (this.activeCustomSource) {
      try {
        this.activeCustomSource.stop();
      } catch (e) {
        // ignore already stopped
      }
      this.activeCustomSource = null;
    }
  }

  private playCustomTrack(trackId: string) {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.customAudioBuffers.get(trackId);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.masterGain);
    source.start();
    this.activeCustomSource = source;
  }

  private playProceduralTrack() {
    if (!this.ctx || !this.masterGain) return;

    this.currentChordIndex = 0;
    const chords = this.currentTrack.chords || BUILTIN_TRACKS[0].chords!;
    const chordDuration = 5.2; // seconds per chord progression

    const triggerNextChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const currentChord = chords[this.currentChordIndex % chords.length];
      this.currentChordIndex++;
      this.playHarmonicPad(currentChord, chordDuration);
    };

    // First trigger immediately
    triggerNextChord();

    // Loop through chords
    this.synthInterval = window.setInterval(triggerNextChord, chordDuration * 1000);

    // If track has specific melody line (e.g. 讚美之泉 / 這一生最美的祝福)
    if (this.currentTrack.melody && this.currentTrack.melody.length > 0) {
      this.scheduleMelodyLoop(this.currentTrack.melody);
    }
  }

  private scheduleMelodyLoop(melody: MelodyNote[]) {
    if (!this.ctx || !this.isPlaying) return;
    const maxOffset = Math.max(...melody.map((m) => m.timeOffset + m.duration));
    const totalCycle = Math.max(18, maxOffset + 2.5);

    const playCycle = () => {
      if (!this.isPlaying || !this.ctx) return;
      melody.forEach((note) => {
        const tid = window.setTimeout(() => {
          if (!this.isPlaying || !this.ctx) return;
          this.playPianoNote(note.freq, note.duration);
        }, note.timeOffset * 1000);
        this.melodyTimeoutIds.push(tid);
      });
    };

    playCycle();
    const cycleTid = window.setInterval(() => {
      if (!this.isPlaying) return;
      playCycle();
    }, totalCycle * 1000);
    this.melodyTimeoutIds.push(cycleTid);
  }

  /**
   * 演奏溫潤細膩的純鋼琴 / 鐘琴主旋律單音
   */
  private playPianoNote(frequency: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Filter to simulate soft upright piano felt damping
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);
    filter.connect(this.masterGain);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    // Instant attack
    noteGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    // Piano decay
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noteGain.connect(filter);

    // Fundamental oscillator (Warm sine + triangle harmonic)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);
    osc1.connect(noteGain);
    osc1.start(now);
    osc1.stop(now + duration + 0.1);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency, now);
    osc2.detune.setValueAtTime(3, now); // slight chorus warmth
    osc2.connect(noteGain);
    osc2.start(now);
    osc2.stop(now + duration + 0.1);

    // Celestial chime sparkle on high register
    if (frequency > 400) {
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(frequency * 2, now);
      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.linearRampToValueAtTime(0.03, now + 0.01);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      chime.connect(chimeGain);
      chimeGain.connect(filter);
      chime.start(now);
      chime.stop(now + 1.3);
    }
  }

  /**
   * 演奏飽滿溫暖的敬拜長音和弦氛圍 (Harmonic Pad)
   */
  private playHarmonicPad(frequencies: number[], duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(1300, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(680, now + duration);
    filter.connect(this.masterGain);

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.linearRampToValueAtTime(0.24, now + 1.6);
    padGain.gain.setValueAtTime(0.24, now + duration - 1.2);
    padGain.gain.linearRampToValueAtTime(0.001, now + duration);
    padGain.connect(filter);

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 2) * 5, now);

      osc.connect(padGain);
      osc.start(now);
      osc.stop(now + duration + 0.5);
    });
  }
}

// Global audio engine singleton (預設以經典詩歌「讚美之泉」為背景音樂)
export const audioEngine = new AudioEngine();
