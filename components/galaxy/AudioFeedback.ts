class CelestialAudio {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private init(): AudioContext | null {
    if (typeof window === "undefined" || this.muted) return null;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private createPanner(ctx: AudioContext, pan = 0): StereoPannerNode | null {
    if ("createStereoPanner" in ctx) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
      return panner;
    }
    return null;
  }

  public playSelect(pan = 0, rank = 1) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = this.createPanner(ctx, pan);

      // Pitch modulation: Core stars chime higher, rim stars chime lower
      const baseFreq = rank === 1 ? 659.25 : rank <= 3 ? 587.33 : rank <= 8 ? 523.25 : 440.0; // E5, D5, C5, A4

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playTick(pan = 0) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = this.createPanner(ctx, pan);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, ctx.currentTime);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore
    }
  }

  public playTakeoverSupernova() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(120, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(60, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch {
      // Ignore
    }
  }
}

export const sound = new CelestialAudio();
