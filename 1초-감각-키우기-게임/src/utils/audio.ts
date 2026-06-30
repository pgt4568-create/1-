/**
 * Web Audio API Synth wrapper for offline/synthetic kid-friendly sounds.
 */
class GameAudio {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playBeep(freq: number, type: OscillatorType = 'sine', duration: number = 0.2, volume: number = 0.15) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  playStart() {
    this.playBeep(523.25, 'sine', 0.25, 0.2); // C5
  }

  playStop() {
    this.playBeep(659.25, 'sine', 0.25, 0.2); // E5
  }

  playSuccess() {
    // Upward arpeggio (C5 -> E5 -> G5)
    this.playBeep(523.25, 'triangle', 0.15, 0.15);
    setTimeout(() => this.playBeep(659.25, 'triangle', 0.15, 0.15), 100);
    setTimeout(() => this.playBeep(783.99, 'triangle', 0.25, 0.15), 200);
  }

  playVictory() {
    // Cheerful fanfare
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playBeep(f, 'sine', 0.3, 0.2);
      }, idx * 150);
    });
  }

  playFailure() {
    // Soft, friendly, playful error/warning sound
    this.playBeep(349.23, 'sine', 0.2, 0.15); // F4
    setTimeout(() => this.playBeep(293.66, 'sine', 0.3, 0.15), 150); // D4
  }
}

export const gameAudio = new GameAudio();
