/**
 * ParticleEngine — Core canvas rendering engine for the portrait.
 *
 * Samples pixels from the profile photo, filters out the studio backdrop,
 * creates particles ONLY for the person, and provides physics-based
 * interactions: cursor repulsion, spring-back, idle breathing, and
 * press-and-hold reveal with an ink border.
 */

export interface Particle {
  /** Home (target) x position */
  hx: number;
  /** Home (target) y position */
  hy: number;
  /** Current x position */
  x: number;
  /** Current y position */
  y: number;
  /** Velocity x */
  vx: number;
  /** Velocity y */
  vy: number;
  /** Particle color from photo (adjusted for cream background) */
  r: number;
  g: number;
  b: number;
  /** Particle size */
  size: number;
  /** Random offset for breathing */
  breathOffset: number;
}

export interface ParticleEngineConfig {
  canvas: HTMLCanvasElement;
  imageSrc: string;
  maxParticles: number;
  /** Spacing between sample points (px) */
  spacing: number;
  /** Cursor repulsion radius */
  cursorRadius: number;
  /** Spring stiffness for returning to home */
  springStiffness: number;
  /** Damping factor */
  damping: number;
  /** Cursor repulsion force */
  repulsionForce: number;
  /** Callback when particles are ready (image loaded, sampled) */
  onReady?: () => void;
  /** Callback on the very first complete rendered frame (for smooth 400ms fade-in) */
  onFirstFrame?: () => void;
  /** Portrait area bounds (for layout calculations) */
  offsetX?: number;
  offsetY?: number;
  renderWidth?: number;
  renderHeight?: number;
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private config: ParticleEngineConfig;
  private animFrameId: number | null = null;
  private cursorX = -9999;
  private cursorY = -9999;
  private isHolding = false;
  private holdX = 0;
  private holdY = 0;
  private holdRadius = 0;
  private holdTargetRadius = 0;
  private time = 0;
  private isRunning = false;
  private image: HTMLImageElement | null = null;
  private imageLoaded = false;
  private dpr = 1;
  private hasDrawnFirstFrame = false;
  /** Set when destroy() runs, so a late image load can never revive a dead engine */
  private destroyed = false;
  /** One engine per canvas: creating a new engine retires any older one on the same canvas */
  private static active = new WeakMap<HTMLCanvasElement, ParticleEngine>();

  // Rendered image dimensions and offset within canvas
  private imgRenderX = 0;
  private imgRenderY = 0;
  private imgRenderW = 0;
  private imgRenderH = 0;

  constructor(config: ParticleEngineConfig) {
    this.config = config;
    this.canvas = config.canvas;
    ParticleEngine.active.get(this.canvas)?.destroy();
    ParticleEngine.active.set(this.canvas, this);
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.loadImage();
  }

  private async loadImage() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.config.imageSrc;

    const finish = () => {
      // The engine may have been destroyed while the image was still loading
      if (this.destroyed) return;
      this.image = img;
      this.imageLoaded = true;
      this.samplePixels();
      this.config.onReady?.();
      this.start();
    };

    try {
      if (typeof img.decode === 'function') {
        await img.decode();
      } else {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
        });
      }
      finish();
    } catch {
      if (img.complete && img.naturalWidth > 0) {
        finish();
      } else {
        img.onload = finish;
      }
    }
  }

  private samplePixels() {
    if (!this.image) return;

    const { spacing, maxParticles } = this.config;

    const canvasW = this.canvas.width / this.dpr;
    const canvasH = this.canvas.height / this.dpr;

    if (canvasW <= 0 || canvasH <= 0) return;

    // Use configured render dimensions or auto-calculate to gracefully fill canvas container
    const targetW = this.config.renderWidth || canvasW * 0.92;
    const targetH = this.config.renderHeight || canvasH * 0.92;

    // Maintain aspect ratio
    const imgAspect = this.image.width / this.image.height;
    let renderW: number, renderH: number;
    if (targetW / targetH > imgAspect) {
      renderH = targetH;
      renderW = renderH * imgAspect;
    } else {
      renderW = targetW;
      renderH = renderW / imgAspect;
    }

    // Position centered in canvas
    const offsetX = this.config.offsetX ?? (canvasW - renderW) / 2;
    const offsetY = this.config.offsetY ?? (canvasH - renderH) / 2;

    this.imgRenderX = offsetX;
    this.imgRenderY = offsetY;
    this.imgRenderW = renderW;
    this.imgRenderH = renderH;

    // Create offscreen canvas for pixel sampling
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

    const sampleW = Math.ceil(renderW);
    const sampleH = Math.ceil(renderH);
    offscreen.width = sampleW;
    offscreen.height = sampleH;

    offCtx.drawImage(this.image, 0, 0, sampleW, sampleH);

    const imageData = offCtx.getImageData(0, 0, sampleW, sampleH);
    const data = imageData.data;

    // Sample corner pixels to find the backdrop color
    let sumR = 0, sumG = 0, sumB = 0, cornerCount = 0;
    const cornerOffsets = [
      [2, 2], [5, 2], [2, 5], [5, 5], [8, 4],
      [sampleW - 3, 2], [sampleW - 6, 2], [sampleW - 3, 5], [sampleW - 6, 5],
      [3, Math.floor(sampleH * 0.15)], [sampleW - 4, Math.floor(sampleH * 0.15)],
      [3, Math.floor(sampleH * 0.25)], [sampleW - 4, Math.floor(sampleH * 0.25)],
    ];

    for (const [cx, cy] of cornerOffsets) {
      if (cx >= 0 && cx < sampleW && cy >= 0 && cy < sampleH) {
        const idx = (cy * sampleW + cx) * 4;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        cornerCount++;
      }
    }

    const bgR = cornerCount > 0 ? sumR / cornerCount : 175;
    const bgG = cornerCount > 0 ? sumG / cornerCount : 175;
    const bgB = cornerCount > 0 ? sumB / cornerCount : 175;

    // Sample on grid — filter out gray backdrop so ONLY the person is rendered
    const candidates: Particle[] = [];
    const particleSize = spacing >= 4 ? 2.2 : 1.8;

    for (let y = 0; y < sampleH; y += spacing) {
      for (let x = 0; x < sampleW; x += spacing) {
        const i = (y * sampleW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 100) continue;

        const lum = (r + g + b) / 3;
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);

        // Check if pixel is in the central lower chest region (white shirt / collar)
        const isChestArea = (y > sampleH * 0.58 && x > sampleW * 0.30 && x < sampleW * 0.70);
        const isShirt = isChestArea && (lum > 180);

        // Check for human features: dark hair/suit/glasses or warm skin tones
        const isDark = lum < 112; // Hair, suit, glasses frames, pupils, beard
        const isSkinTone = (r > g && g >= b && (r - b) >= 12 && lum > 75);

        // Background detection:
        // Studio gray backdrop has low chroma and matches corner brightness/color
        let isBackground = false;
        if (!isShirt && !isDark && !isSkinTone) {
          if (chroma < 20 && (colorDist < 75 || (lum > 125 && lum < 210))) {
            isBackground = true;
          }
        }

        if (isBackground) {
          // Skip backdrop pixel so warm cream background shows through
          continue;
        }

        // Brighten particle colors for dark maroon background:
        // Apply gamma 0.8 plus a lift of +18 to each channel (clamped at 255) and boost contrast slightly.
        // Do not darken light pixels.
        const brighten = (val: number) => {
          const norm = val / 255;
          const gamma = Math.pow(norm, 0.8) * 255;
          const lifted = gamma + 18;
          const contrast = (lifted - 128) * 1.05 + 128;
          const res = Math.min(255, Math.max(0, Math.round(contrast)));
          return val > 200 ? Math.max(val, res) : res;
        };

        const pr = brighten(r);
        const pg = brighten(g);
        const pb = brighten(b);

        candidates.push({
          hx: offsetX + x,
          hy: offsetY + y,
          x: offsetX + x,
          y: offsetY + y,
          vx: 0,
          vy: 0,
          r: pr,
          g: pg,
          b: pb,
          size: particleSize,
          breathOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    // Cap at maxParticles
    if (candidates.length > maxParticles) {
      const step = candidates.length / maxParticles;
      const sampled: Particle[] = [];
      for (let i = 0; i < maxParticles; i++) {
        sampled.push(candidates[Math.floor(i * step)]);
      }
      this.particles = sampled;
    } else {
      this.particles = candidates;
    }
  }

  /** Begin the assembly animation (no-op since particles are already at home) */
  startAssembly(_speed = 0.02) {
    // Already assembled
  }

  /** Skip directly to assembled state */
  skipToAssembled() {
    for (const p of this.particles) {
      p.x = p.hx;
      p.y = p.hy;
      p.vx = 0;
      p.vy = 0;
    }
  }

  /** Stream particles downwards as user scrolls past hero */
  streamOnScroll(scrollOffset: number) {
    if (scrollOffset <= 0) return;
    const factor = Math.min(scrollOffset / 400, 1.5);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      // Capped so many quick scroll events can never fling particles wildly
      p.vy = Math.min(p.vy + factor * 0.4, 12);
      p.vx = Math.max(-6, Math.min(6, p.vx + Math.sin(p.breathOffset + scrollOffset * 0.01) * factor * 0.2));
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.round(rect.width * this.dpr);
    const newHeight = Math.round(rect.height * this.dpr);

    const sizeChanged = this.canvas.width !== newWidth || this.canvas.height !== newHeight;
    // Only touch the canvas size when it really changed (assigning it clears the canvas)
    if (sizeChanged) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.imageLoaded && (sizeChanged || this.particles.length === 0)) {
      this.samplePixels();
    }
  }

  setCursor(x: number, y: number) {
    if (!this.isRunning && this.imageLoaded) {
      this.start();
    }
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scaleX = (this.canvas.width / this.dpr) / rect.width;
    const scaleY = (this.canvas.height / this.dpr) / rect.height;
    this.cursorX = (x - rect.left) * scaleX;
    this.cursorY = (y - rect.top) * scaleY;
  }

  clearCursor() {
    this.cursorX = -9999;
    this.cursorY = -9999;
  }

  setHolding(holding: boolean, x?: number, y?: number) {
    if (!this.isRunning && this.imageLoaded) {
      this.start();
    }
    this.isHolding = holding;
    if (holding && x !== undefined && y !== undefined) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width ? (this.canvas.width / this.dpr) / rect.width : 1;
      const scaleY = rect.height ? (this.canvas.height / this.dpr) / rect.height : 1;
      this.holdX = (x - rect.left) * scaleX;
      this.holdY = (y - rect.top) * scaleY;
      const canvasW = this.canvas.width / this.dpr;
      const canvasH = this.canvas.height / this.dpr;
      this.holdTargetRadius = Math.max(canvasW, canvasH) * 1.3;
    } else {
      this.holdTargetRadius = 0;
    }
  }

  start() {
    if (this.isRunning || this.destroyed) return;
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  getAssemblyProgress(): number {
    return 1;
  }

  private tick = () => {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private update() {
    this.time += 0.016;
    const { springStiffness, damping, repulsionForce, cursorRadius } = this.config;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Idle breathing motion
      const breathX = Math.sin(this.time * 0.8 + p.breathOffset) * 0.35;
      const breathY = Math.cos(this.time * 0.6 + p.breathOffset * 1.3) * 0.35;

      // Spring force toward home
      const dx = (p.hx + breathX) - p.x;
      const dy = (p.hy + breathY) - p.y;
      const ax = dx * springStiffness;
      const ay = dy * springStiffness;

      // Cursor repulsion
      let repelX = 0;
      let repelY = 0;
      const cdx = p.x - this.cursorX;
      const cdy = p.y - this.cursorY;
      const dist = Math.sqrt(cdx * cdx + cdy * cdy);

      if (dist < cursorRadius && dist > 0) {
        const force = (1 - dist / cursorRadius) * repulsionForce;
        repelX = (cdx / dist) * force;
        repelY = (cdy / dist) * force;
      }

      p.vx = (p.vx + ax + repelX) * damping;
      p.vy = (p.vy + ay + repelY) * damping;
      p.x += p.vx;
      p.y += p.vy;
    }

    // Animate hold reveal radius
    if (this.isHolding) {
      this.holdRadius += (this.holdTargetRadius - this.holdRadius) * 0.1;
    } else {
      this.holdRadius += (0 - this.holdRadius) * 0.15;
      if (this.holdRadius < 1) this.holdRadius = 0;
    }
  }

  private draw() {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;

    // Clear canvas to transparent so warm cream background and subtle noise show through
    ctx.clearRect(0, 0, w, h);

    // Normal blending
    ctx.globalCompositeOperation = 'source-over';

    // Draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    // Draw photo reveal on hold
    if (this.holdRadius > 1 && this.image) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.holdX, this.holdY, this.holdRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw real sharp photo
      ctx.drawImage(
        this.image,
        this.imgRenderX,
        this.imgRenderY,
        this.imgRenderW,
        this.imgRenderH
      );

      // 1px --text border at 40% opacity on the circle edge
      ctx.strokeStyle = 'rgba(244, 238, 227, 0.40)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    if (!this.hasDrawnFirstFrame && this.particles.length > 0) {
      this.hasDrawnFirstFrame = true;
      this.config.onFirstFrame?.();
    }
  }

  destroy() {
    this.destroyed = true;
    if (ParticleEngine.active.get(this.canvas) === this) {
      ParticleEngine.active.delete(this.canvas);
    }
    this.stop();
    this.particles = [];
    this.image = null;
  }
}