import { SoundType } from '../types';

// Singleton to manage Audio Context
class AudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  public async init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.ctx && !this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8; // Prevent clipping
        this.masterGain.connect(this.ctx.destination);
    }
    this.isEnabled = true;
  }

  // Helper: Create a noise buffer for percussive textures
  private createNoiseBuffer() {
      if (!this.ctx) throw new Error("No Context");
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      return { source, buffer };
  }

  // Realistic Tabla "Dum" (Bass - Deep & Resonant)
  private playDum() {
    if (!this.ctx || !this.isEnabled || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. The Body (Deep Sine with pitch drop)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);

    // 2. The Skin Impact (Low passed noise thud)
    const noiseConfig = this.createNoiseBuffer();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 300;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    noiseConfig.source.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseConfig.source.start(t);
  }

  // Realistic Tabla "Tak" (Rim Shot - Sharp & Metallic)
  private playTak() {
    if (!this.ctx || !this.isEnabled || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. Sharp Metallic Ring (High pitch square wave)
    const osc = this.ctx.createOscillator();
    osc.type = 'square'; // Square gives that metallic harmonic content
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    // 2. The Snap (High passed noise)
    const noiseConfig = this.createNoiseBuffer();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2500;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);

    noiseConfig.source.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseConfig.source.start(t);
  }

  // Soft filler note "Sak" (Muted slap)
  private playSak() {
    if (!this.ctx || !this.isEnabled || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const noiseConfig = this.createNoiseBuffer();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 1;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t); // Lower volume
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    noiseConfig.source.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseConfig.source.start(t);
  }

  // Standard Hand Clap
  private playHandClap() {
    if (!this.ctx || !this.isEnabled || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const noiseConfig = this.createNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noiseConfig.source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseConfig.source.start(t);
  }

  // Zaghroota (Ululation) - Synthesized vocal trill
  private playZaghroota() {
     if (!this.ctx || !this.isEnabled || !this.masterGain) return;
     const t = this.ctx.currentTime;
     
     const osc = this.ctx.createOscillator();
     const lfo = this.ctx.createOscillator(); // Vibrato LFO
     const gain = this.ctx.createGain();
     const lfoGain = this.ctx.createGain();

     // FM Synthesis setup
     lfo.frequency.value = 12; // Speed of trill
     lfoGain.gain.value = 250; // Depth of pitch change

     osc.type = 'triangle';
     osc.frequency.value = 1100; // Base pitch (High soprano)
     
     lfo.connect(lfoGain);
     lfoGain.connect(osc.frequency);
     osc.connect(gain);
     gain.connect(this.masterGain);

     gain.gain.setValueAtTime(0, t);
     gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
     gain.gain.linearRampToValueAtTime(0, t + 1.5); // 1.5 second duration

     lfo.start(t);
     osc.start(t);
     lfo.stop(t+1.5);
     osc.stop(t+1.5);
  }

  public play(type: SoundType) {
    if (type === SoundType.CLAP) {
      this.playHandClap();
      // Double clap effect
      setTimeout(() => this.playHandClap(), 80); 
    } else if (type === SoundType.DRUM) {
      this.playDum();
      setTimeout(() => this.playSak(), 120);
      setTimeout(() => this.playTak(), 240);
    } else if (type === SoundType.CHEER) {
       this.playZaghroota();
    }
  }

  public startRhythmLoop(callback: () => void): number {
    if (!this.ctx) return 0;
    
    let step = 0;
    // Energetic Egyptian Maqsoum Loop (Shaabi Tempo ~166 BPM)
    // 180ms per 8th note
    // Pattern: Dum - Sak - Tak - Sak - Dum - Sak - Tak - Sak
    //          D    k    T    k    D    k    T    k
    
    const interval = window.setInterval(() => {
        const pattern = ['D', 'k', 'T', 'k', 'D', 'k', 'T', 'k'];
        const current = pattern[step % pattern.length];

        if (current === 'D') {
            this.playDum();
            callback(); // Visual bounce on Main Beats
        }
        else if (current === 'T') {
            this.playTak();
        }
        else if (current === 'k') {
             // Randomly play ghost notes or silence for variety
             if (Math.random() > 0.3) this.playSak(); 
        }

        // Trigger Zaghroota every 4 bars (32 beats) for maximum hype
        if (step > 0 && step % 32 === 0) {
           this.playZaghroota();
        }
        
        step++;
    }, 180); 

    return interval;
  }
}

export const audioService = new AudioEngine();