import React, { useEffect, useRef } from "react";

export default function SfxTester({ enabled = true }: { enabled?: boolean }) {
  const mgrRef = useRef<any>(null);

  useEffect(() => {
    class AudioManager {
      ctx: AudioContext | null = null;
      masterGain: GainNode | null = null;
      noiseBuffer: AudioBuffer | null = null;
      defaultVolume = 0.22;
      constructor() {
        try {
          this.ctx = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.defaultVolume;
          this.masterGain.connect(this.ctx.destination);
        } catch (e) {
          this.ctx = null;
        }
      }
      setEnabled = (on: boolean) => {
        if (this.masterGain)
          this.masterGain.gain.value = on ? this.defaultVolume : 0;
      };
      resumeIfNeeded = async () => {
        try {
          if (this.ctx && this.ctx.state === "suspended")
            await this.ctx.resume();
        } catch {}
      };
      playTone = (
        freq: number,
        type: OscillatorType | string = "sine",
        duration = 0.12,
        decay = 0.02,
        gain = 1,
      ) => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type as OscillatorType;
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(this.masterGain!);
        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.8 * gain, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration + decay);
        o.start(now);
        o.stop(now + duration + decay + 0.02);
      };
      glideTone = (
        startFreq: number,
        endFreq: number,
        duration = 0.12,
        type: OscillatorType | string = "sine",
        gain = 1,
      ) => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type as OscillatorType;
        o.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        o.frequency.linearRampToValueAtTime(
          endFreq,
          this.ctx.currentTime + duration,
        );
        g.gain.value = 0;
        o.connect(g);
        g.connect(this.masterGain!);
        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.7 * gain, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.04);
        o.start(now);
        o.stop(now + duration + 0.06);
      };
      getNoiseBuffer = () => {
        if (!this.ctx) return null;
        if (this.noiseBuffer) return this.noiseBuffer;
        const sampleRate = this.ctx.sampleRate || 44100;
        const duration = 1.0;
        const bufferSize = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        this.noiseBuffer = buffer;
        return buffer;
      };
      playNoiseBurst = (
        duration = 0.4,
        opts: {
          filter?: BiquadFilterType;
          from?: number;
          to?: number;
          q?: number;
          gain?: number;
        } = {},
      ) => {
        if (!this.ctx) return;
        const buffer = this.getNoiseBuffer();
        if (!buffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const g = this.ctx.createGain();
        g.gain.value = 0;
        let node: AudioNode = src;
        if (opts.filter) {
          const f = this.ctx.createBiquadFilter();
          f.type = opts.filter;
          if (typeof opts.from === "number")
            f.frequency.setValueAtTime(opts.from, this.ctx.currentTime);
          if (typeof opts.q === "number") f.Q.value = opts.q;
          node.connect(f);
          node = f;
          if (typeof opts.to === "number") {
            const now = this.ctx.currentTime;
            f.frequency.cancelScheduledValues(now);
            f.frequency.setValueAtTime(opts.from ?? f.frequency.value, now);
            f.frequency.linearRampToValueAtTime(opts.to, now + duration);
          }
        }
        node.connect(g);
        g.connect(this.masterGain!);
        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.6 * (opts.gain ?? 1), now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
        src.start(now);
        src.stop(now + duration + 0.02);
      };
      click = () => this.percussiveClick(900, 0.05);
      tick = () => this.playTone(800, "square", 0.04, 0.02, 0.9);
      pop = () => this.glideTone(1200, 700, 0.08, "sine", 0.9);
      whoosh = () =>
        this.playNoiseBurst(0.6, {
          filter: "bandpass",
          from: 4000,
          to: 900,
          q: 0.9,
          gain: 0.6,
        });
      paper = () => {
        this.playNoiseBurst(0.08, {
          filter: "bandpass",
          from: 2500,
          to: 1500,
          q: 1.0,
          gain: 0.35,
        });
        this.playNoiseBurst(0.06, {
          filter: "bandpass",
          from: 2200,
          to: 1200,
          q: 0.9,
          gain: 0.28,
        });
        this.playTone(600, "triangle", 0.02, 0.01, 0.2);
      };
      release = () => {
        this.glideTone(520, 900, 0.12, "triangle", 0.9);
        this.playNoiseBurst(0.12, {
          filter: "highpass",
          from: 3000,
          to: 1500,
          q: 0.7,
          gain: 0.25,
        });
      };
      lock = () => this.percussiveClick(250, 0.08);
      unlock = () => this.percussiveClick(1100, 0.08);
      success = () => {
        [880, 1320, 1760].forEach((f) =>
          this.playTone(f, "sine", 0.12, 0.04, 0.8),
        );
      };
      vaultReveal = () => {
        this.playTone(220, "sine", 0.24, 0.08, 0.9);
        this.playNoiseBurst(0.18, {
          filter: "lowpass",
          from: 800,
          to: 300,
          q: 0.7,
          gain: 0.3,
        });
      };
      private percussiveClick = (freq: number, duration = 0.06) => {
        this.playTone(freq, "sine", duration, 0.02, 1);
        this.playNoiseBurst(duration * 0.7, {
          filter: "highpass",
          from: 3000,
          to: 2500,
          q: 0.7,
          gain: 0.2,
        });
      };
    }

    mgrRef.current = new AudioManager();
    mgrRef.current.setEnabled(!!enabled);
    const handler = () => mgrRef.current?.resumeIfNeeded?.();
    window.addEventListener("pointerdown", handler, { once: true } as any);
    window.addEventListener("keydown", handler, { once: true } as any);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    try {
      mgrRef.current?.setEnabled?.(!!enabled);
      if (enabled) mgrRef.current?.resumeIfNeeded?.();
    } catch {}
  }, [enabled]);

  const play = (name: string) => {
    const m = mgrRef.current as any;
    if (!m) return;
    m.resumeIfNeeded?.();
    switch (name) {
      case "Klik":
        m.click?.();
        break;
      case "Pop":
        m.pop?.();
        break;
      case "Whoosh":
        m.whoosh?.();
        break;
      case "Sukses":
        m.success?.();
        break;
      case "Kunci":
        m.lock?.();
        break;
      case "Buka":
        m.unlock?.();
        break;
      case "Tick":
        m.tick?.();
        break;
      case "Vault":
        m.vaultReveal?.();
        break;
      case "Kertas":
        m.paper?.();
        break;
    }
  };

  const btn =
    "px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs focus:outline-none focus:ring-2 focus:ring-white/20";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs opacity-80">Coba:</span>
      {(
        [
          "Klik",
          "Pop",
          "Whoosh",
          "Kertas",
          "Sukses",
          "Kunci",
          "Buka",
          "Tick",
          "Vault",
        ] as const
      ).map((label) => (
        <button key={label} onClick={() => play(label)} className={btn}>
          {label}
        </button>
      ))}
    </div>
  );
}
