/**
 * 隨禱 (Always Near) - 影片視覺主題與動態畫布渲染器
 * 顯著增強視覺意境：神聖耶穌光束、璀璨銀河星空、祈禱流星、水波倒影、教堂燭光與十字架光芒
 */

export interface VisualTheme {
  id: string;
  name: string;
  description: string;
  bgGradient: [string, string, string];
  accentColor: string;
  haloColor: string;
  type: 'morning_dawn' | 'quiet_night' | 'living_waters' | 'candle_glow' | 'celestial_rays' | 'cross_grace' | 'warm_linen';
}

export const VISUAL_THEMES: VisualTheme[] = [
  {
    id: 'morning_dawn',
    name: '晨光拂曉',
    description: '耀眼溫暖的晨光金曦、耶穌聖光光束與金色光塵',
    bgGradient: ['#3A2412', '#644122', '#8C5B32'],
    accentColor: '#FFD700',
    haloColor: 'rgba(255, 215, 0, 0.45)',
    type: 'morning_dawn',
  },
  {
    id: 'cross_grace',
    name: '十架恩典',
    description: '神聖明亮的十字架背光榮光、天國光柱與祈禱火星',
    bgGradient: ['#281E2B', '#48324E', '#6B4775'],
    accentColor: '#F7D070',
    haloColor: 'rgba(247, 208, 112, 0.55)',
    type: 'cross_grace',
  },
  {
    id: 'quiet_night',
    name: '靜謐星空',
    description: '璀璨深邃的銀河星雲、十字星芒與劃過天際的祈禱流星',
    bgGradient: ['#0B1120', '#172554', '#1E3A8A'],
    accentColor: '#93C5FD',
    haloColor: 'rgba(147, 197, 253, 0.45)',
    type: 'quiet_night',
  },
  {
    id: 'living_waters',
    name: '可安歇水邊',
    description: '碧波粼粼的生命溪流倒影、青草綠岸與清晨微霧',
    bgGradient: ['#0F291E', '#164E3D', '#206D56'],
    accentColor: '#6EE7B7',
    haloColor: 'rgba(110, 231, 183, 0.45)',
    type: 'living_waters',
  },
  {
    id: 'candle_glow',
    name: '聖殿燭光',
    description: '教堂彩色窗花剪影、溫暖搖曳的燭光光暈與琥珀火光',
    bgGradient: ['#331508', '#5A260F', '#7C3414'],
    accentColor: '#FDBA74',
    haloColor: 'rgba(253, 186, 116, 0.5)',
    type: 'candle_glow',
  },
  {
    id: 'celestial_rays',
    name: '天國榮光',
    description: '天頂綻放的放射狀聖潔恩典光芒與繾綣晨雲',
    bgGradient: ['#382046', '#58306E', '#7E469D'],
    accentColor: '#E9D5FF',
    haloColor: 'rgba(233, 213, 255, 0.48)',
    type: 'celestial_rays',
  },
  {
    id: 'warm_linen',
    name: '質樸暖羊皮',
    description: '古典典雅的羊皮紙古卷質地、金箔花紋與柔暖光斑',
    bgGradient: ['#332A22', '#4D3F33', '#685545'],
    accentColor: '#FDE68A',
    haloColor: 'rgba(253, 230, 138, 0.42)',
    type: 'warm_linen',
  },
];

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
  maxAlpha: number;
  phase: number;
  color?: string;
  isSparkle?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private shootingStars: ShootingStar[] = [];
  private width: number = 720;
  private height: number = 1280;
  private nextShootingStarTime: number = 0;

  constructor(width: number, height: number, count: number = 65) {
    this.resize(width, height, count);
  }

  public resize(width: number, height: number, count: number = 65) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.shootingStars = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4.5 + 1.5,
        alpha: Math.random() * 0.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.65 - 0.25, // 向上飄逸
        maxAlpha: Math.random() * 0.7 + 0.35,
        phase: Math.random() * Math.PI * 2,
        isSparkle: i % 4 === 0, // 每4顆有一顆明顯閃爍星芒
      });
    }

    // 初始化流星池
    for (let j = 0; j < 3; j++) {
      this.shootingStars.push({
        x: -100,
        y: -100,
        length: 140,
        speed: 16,
        angle: (Math.PI / 180) * 35, // 35度向下劃過
        alpha: 0,
        active: false,
      });
    }
  }

  public updateAndDraw(ctx: CanvasRenderingContext2D, theme: VisualTheme, time: number) {
    const w = this.width;
    const h = this.height;

    // 1. 繪製豐富飽滿的背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, theme.bgGradient[0]);
    gradient.addColorStop(0.45, theme.bgGradient[1]);
    gradient.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 2. 依主題繪製明顯而獨特的視覺背景意境
    switch (theme.type) {
      case 'morning_dawn':
        this.drawMorningDawn(ctx, time, theme);
        break;
      case 'cross_grace':
        this.drawCrossOfGrace(ctx, time, theme);
        break;
      case 'quiet_night':
        this.drawQuietNightSky(ctx, time, theme);
        break;
      case 'living_waters':
        this.drawLivingWaters(ctx, time, theme);
        break;
      case 'candle_glow':
        this.drawCandleGlow(ctx, time, theme);
        break;
      case 'celestial_rays':
        this.drawCelestialRays(ctx, time, theme);
        break;
      case 'warm_linen':
      default:
        this.drawWarmLinen(ctx, time, theme);
        break;
    }

    // 3. 繪製動態浮游粒子、光芒光暈與星光
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.y += p.vy;
      p.x += p.vx + Math.sin(time * 0.0012 + p.phase) * 0.35;

      // 邊界循環
      if (p.y < -15) {
        p.y = h + 15;
        p.x = Math.random() * w;
      }
      if (p.x < -15) p.x = w + 15;
      if (p.x > w + 15) p.x = -15;

      const pulsatingAlpha = Math.min(1, p.maxAlpha * (0.65 + 0.45 * Math.sin(time * 0.002 + p.phase)));

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color || `rgba(255, 248, 220, ${pulsatingAlpha})`;
      ctx.shadowColor = theme.accentColor;
      ctx.shadowBlur = p.radius * 4;
      ctx.fill();

      // 明顯的十字星芒閃爍效果
      if (p.isSparkle && pulsatingAlpha > 0.4) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulsatingAlpha * 0.8})`;
        ctx.lineWidth = 1;
        const sparkleSize = p.radius * 3.5;
        ctx.beginPath();
        // 橫豎十字
        ctx.moveTo(p.x - sparkleSize, p.y);
        ctx.lineTo(p.x + sparkleSize, p.y);
        ctx.moveTo(p.x, p.y - sparkleSize);
        ctx.lineTo(p.x, p.y + sparkleSize);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // 4. 頂部與底部的微暗角暗幕（保護文字清晰易讀性）
    this.drawReadabilityVignette(ctx, w, h);
  }

  /**
   * 僅繪製粒子與保護暗幕（供使用者自訂背景圖時使用，保留神聖微光氛圍）
   */
  public updateAndDrawParticlesOnly(ctx: CanvasRenderingContext2D, theme: VisualTheme, time: number) {
    const w = this.width;
    const h = this.height;

    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.y += p.vy;
      p.x += p.vx + Math.sin(time * 0.0012 + p.phase) * 0.35;

      if (p.y < -15) {
        p.y = h + 15;
        p.x = Math.random() * w;
      }
      if (p.x < -15) p.x = w + 15;
      if (p.x > w + 15) p.x = -15;

      const pulsatingAlpha = Math.min(1, p.maxAlpha * (0.65 + 0.45 * Math.sin(time * 0.002 + p.phase)));

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color || `rgba(255, 248, 220, ${pulsatingAlpha})`;
      ctx.shadowColor = theme.accentColor;
      ctx.shadowBlur = p.radius * 4;
      ctx.fill();

      if (p.isSparkle && pulsatingAlpha > 0.4) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulsatingAlpha * 0.8})`;
        ctx.lineWidth = 1;
        const sparkleSize = p.radius * 3.5;
        ctx.beginPath();
        ctx.moveTo(p.x - sparkleSize, p.y);
        ctx.lineTo(p.x + sparkleSize, p.y);
        ctx.moveTo(p.x, p.y - sparkleSize);
        ctx.lineTo(p.x, p.y + sparkleSize);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    this.drawReadabilityVignette(ctx, w, h);
  }

  /**
   * 晨光拂曉：耀眼太陽、動態耶穌聖光光束 (God-Rays)、金黃晨曦
   */
  private drawMorningDawn(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;
    const sunX = w * 0.5;
    const sunY = h * 0.16;

    // 太陽金色核心巨型光暈
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, w * 0.7);
    sunGlow.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
    sunGlow.addColorStop(0.2, 'rgba(255, 215, 0, 0.6)');
    sunGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h * 0.8);

    // 放射狀耶穌光束 (God-Rays) - 動態呼吸
    ctx.save();
    const rayCount = 11;
    const basePulse = 0.6 + 0.4 * Math.sin(time * 0.001);

    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI / 2) + ((i - (rayCount - 1) / 2) * 0.18) + Math.sin(time * 0.0005 + i) * 0.04;
      const rayLength = h * 0.95;
      const rayWidth = (w * 0.08) * (1 + 0.3 * Math.sin(time * 0.0015 + i));

      const targetX = sunX + Math.cos(angle) * rayLength;
      const targetY = sunY + Math.sin(angle) * rayLength;

      const rayGrad = ctx.createLinearGradient(sunX, sunY, targetX, targetY);
      rayGrad.addColorStop(0, `rgba(255, 245, 200, ${0.45 * basePulse})`);
      rayGrad.addColorStop(0.4, `rgba(255, 215, 0, ${0.28 * basePulse})`);
      rayGrad.addColorStop(0.8, `rgba(245, 158, 11, ${0.12 * basePulse})`);
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(targetX - rayWidth, targetY);
      ctx.lineTo(targetX + rayWidth, targetY);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
    ctx.restore();

    // 底部晨霧微光地平線
    const mistGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    mistGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    mistGrad.addColorStop(1, 'rgba(217, 119, 6, 0.35)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  }

  /**
   * 十架恩典：頂部聖潔發光十字架剪影、天國榮耀放射聖光
   */
  private drawCrossOfGrace(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;
    const crossX = w * 0.5;
    const crossY = h * 0.22;

    // 十字架背後神聖金色大光環 (Divine Halo)
    const haloPulse = 1 + 0.1 * Math.sin(time * 0.0015);
    const halo = ctx.createRadialGradient(crossX, crossY, 20, crossX, crossY, w * 0.65 * haloPulse);
    halo.addColorStop(0, 'rgba(255, 248, 220, 0.85)');
    halo.addColorStop(0.25, 'rgba(247, 208, 112, 0.5)');
    halo.addColorStop(0.6, 'rgba(217, 119, 6, 0.18)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // 12道向下傾倒的恩典光柱
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI / 2) + ((i - 4) * 0.22);
      const rayL = h * 0.85;
      const rayGrad = ctx.createLinearGradient(crossX, crossY, crossX + Math.cos(angle) * rayL, crossY + Math.sin(angle) * rayL);
      rayGrad.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
      rayGrad.addColorStop(0.5, 'rgba(247, 208, 112, 0.2)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(crossX, crossY);
      ctx.lineTo(crossX + Math.cos(angle - 0.07) * rayL, crossY + Math.sin(angle - 0.07) * rayL);
      ctx.lineTo(crossX + Math.cos(angle + 0.07) * rayL, crossY + Math.sin(angle + 0.07) * rayL);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }

    // 繪製尊貴發光的十字架剪影
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = '#F7D070';
    ctx.shadowBlur = 35;

    const crossHeight = 90;
    const crossWidth = 54;
    const barThickness = 12;

    // 豎直桿
    ctx.fillRect(crossX - barThickness / 2, crossY - crossHeight * 0.35, barThickness, crossHeight);
    // 橫樑
    ctx.fillRect(crossX - crossWidth / 2, crossY - crossHeight * 0.05, crossWidth, barThickness);
    ctx.restore();
  }

  /**
   * 靜謐星空：深邃銀河光帶、亮星、定期劃過天際的祈禱流星
   */
  private drawQuietNightSky(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;

    // 1. 璀璨銀河光帶 (Milky Way Diagonal Nebula)
    ctx.save();
    ctx.translate(w * 0.5, h * 0.45);
    ctx.rotate(-Math.PI / 4.5);

    const nebulaGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, w * 0.85);
    nebulaGrad.addColorStop(0, 'rgba(167, 139, 250, 0.38)');
    nebulaGrad.addColorStop(0.3, 'rgba(96, 165, 250, 0.25)');
    nebulaGrad.addColorStop(0.7, 'rgba(30, 58, 138, 0.12)');
    nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(-w, -h * 0.5, w * 2, h);
    ctx.restore();

    // 2. 祈禱流星動畫 (Shooting Stars)
    if (time > this.nextShootingStarTime) {
      // 觸發新流星
      const freeStar = this.shootingStars.find((s) => !s.active);
      if (freeStar) {
        freeStar.active = true;
        freeStar.x = Math.random() * (w * 0.7);
        freeStar.y = Math.random() * (h * 0.35);
        freeStar.alpha = 1;
        freeStar.speed = 18 + Math.random() * 8;
        this.nextShootingStarTime = time + 2500 + Math.random() * 2000; // 每2.5~4.5秒一顆
      }
    }

    ctx.save();
    this.shootingStars.forEach((star) => {
      if (!star.active) return;
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.alpha -= 0.016;

      if (star.alpha <= 0 || star.x > w + 100 || star.y > h + 100) {
        star.active = false;
        return;
      }

      // 繪製流星光尾
      const tailX = star.x - Math.cos(star.angle) * star.length;
      const tailY = star.y - Math.sin(star.angle) * star.length;

      const starGrad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      starGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      starGrad.addColorStop(0.7, `rgba(191, 219, 254, ${star.alpha * 0.7})`);
      starGrad.addColorStop(1, `rgba(255, 255, 255, ${star.alpha})`);

      ctx.strokeStyle = starGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      // 流星頭部亮點
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.shadowColor = '#60A5FA';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  /**
   * 可安歇水邊：生命活水溪流、粼粼波光倒影、青草綠岸水波
   */
  private drawLivingWaters(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;

    // 上方柔和森林晨光
    const topGlow = ctx.createRadialGradient(w * 0.5, h * 0.1, 20, w * 0.5, h * 0.1, w * 0.6);
    topGlow.addColorStop(0, 'rgba(167, 243, 208, 0.45)');
    topGlow.addColorStop(0.5, 'rgba(52, 211, 153, 0.18)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h * 0.6);

    // 下方生機盎然的流動波光水面 (Water Caustic Ripples)
    const waterY = h * 0.55;
    ctx.save();
    for (let wave = 0; wave < 6; wave++) {
      const waveY = waterY + wave * (h * 0.08);
      const waveSpeed = 0.0018 + wave * 0.0004;
      const waveAmp = 14 - wave * 1.5;

      ctx.beginPath();
      ctx.moveTo(0, waveY);

      for (let x = 0; x <= w; x += 30) {
        const yOffset = Math.sin(x * 0.015 + time * waveSpeed + wave) * waveAmp;
        ctx.lineTo(x, waveY + yOffset);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      ctx.fillStyle = `rgba(16, 185, 129, ${0.12 + wave * 0.04})`;
      ctx.fill();

      // 波光反光線
      ctx.strokeStyle = `rgba(167, 243, 208, ${0.35 + 0.15 * Math.sin(time * 0.002 + wave)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 聖殿燭光：教堂彩繪玻璃拱門剪影、溫暖微動琥珀燭光火燄
   */
  private drawCandleGlow(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;

    // 教堂哥德式拱門輪廓 (Cathedral Arch)
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // 拱門頂部圓弧
    ctx.arc(w * 0.5, h * 0.35, w * 0.38, Math.PI, 0);
    ctx.lineTo(w * 0.88, h);
    ctx.moveTo(w * 0.12, h * 0.35);
    ctx.lineTo(w * 0.12, h);
    ctx.stroke();

    // 內層小拱門
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.35, w * 0.28, Math.PI, 0);
    ctx.lineTo(w * 0.78, h);
    ctx.moveTo(w * 0.22, h * 0.35);
    ctx.lineTo(w * 0.22, h);
    ctx.stroke();
    ctx.restore();

    // 溫暖燭光中心 (Flickering Candle Glow)
    const flicker = 1 + 0.08 * Math.sin(time * 0.008) + 0.04 * Math.cos(time * 0.015);
    const candleGlow = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.42, w * 0.75 * flicker);
    candleGlow.addColorStop(0, 'rgba(255, 237, 213, 0.85)');
    candleGlow.addColorStop(0.2, 'rgba(251, 146, 60, 0.55)');
    candleGlow.addColorStop(0.55, 'rgba(194, 65, 12, 0.2)');
    candleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = candleGlow;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * 天國榮光：天空雲開破曉、天國傾倒放射狀金色恩典
   */
  private drawCelestialRays(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;

    // 頂部天門大開金光
    const topLight = ctx.createRadialGradient(w * 0.5, 0, 20, w * 0.5, 0, w * 0.85);
    topLight.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
    topLight.addColorStop(0.3, 'rgba(216, 180, 254, 0.55)');
    topLight.addColorStop(0.7, 'rgba(147, 51, 234, 0.22)');
    topLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topLight;
    ctx.fillRect(0, 0, w, h);

    // 放射狀天光
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI / 2) + ((i - 6.5) * 0.16) + Math.sin(time * 0.0008 + i) * 0.03;
      const rayL = h * 0.95;
      const rayGrad = ctx.createLinearGradient(w * 0.5, 0, w * 0.5 + Math.cos(angle) * rayL, Math.sin(angle) * rayL);
      rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      rayGrad.addColorStop(0.5, 'rgba(233, 213, 255, 0.22)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(w * 0.5, 0);
      ctx.lineTo(w * 0.5 + Math.cos(angle - 0.05) * rayL, Math.sin(angle - 0.05) * rayL);
      ctx.lineTo(w * 0.5 + Math.cos(angle + 0.05) * rayL, Math.sin(angle + 0.05) * rayL);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * 質樸暖羊皮：經典羊皮紙溫潤紙感與典雅金箔飾角
   */
  private drawWarmLinen(ctx: CanvasRenderingContext2D, time: number, theme: VisualTheme) {
    const w = this.width;
    const h = this.height;

    // 羊皮紙溫暖中央暈光
    const parchment = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.45, w * 0.85);
    parchment.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
    parchment.addColorStop(0.6, 'rgba(217, 119, 6, 0.18)');
    parchment.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = parchment;
    ctx.fillRect(0, 0, w, h);

    // 四個優雅金色邊角裝飾線
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1.5;
    const margin = 28;
    const len = 40;

    // 左上
    ctx.beginPath();
    ctx.moveTo(margin, margin + len);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + len, margin);
    ctx.stroke();

    // 右上
    ctx.beginPath();
    ctx.moveTo(w - margin - len, margin);
    ctx.lineTo(w - margin, margin);
    ctx.lineTo(w - margin, margin + len);
    ctx.stroke();

    // 左下
    ctx.beginPath();
    ctx.moveTo(margin, h - margin - len);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(margin + len, h - margin);
    ctx.stroke();

    // 右下
    ctx.beginPath();
    ctx.moveTo(w - margin - len, h - margin);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin, h - margin - len);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 頂部與底部的微暗角暗幕（保護經文與禱告詞對比度與易讀性）
   */
  private drawReadabilityVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const vignette = ctx.createLinearGradient(0, 0, 0, h);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    vignette.addColorStop(0.18, 'rgba(0, 0, 0, 0.05)');
    vignette.addColorStop(0.55, 'rgba(0, 0, 0, 0.08)');
    vignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.28)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}
