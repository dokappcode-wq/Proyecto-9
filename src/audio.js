// Sonido sintetizado con WebAudio: efectos, lluvia y una pequeña música por zona.
'use strict';
const Audio2 = {
  ctx: null, master: null, sfxGain: null, musGain: null, noiseBuf: null,
  rain: null, hum: null, music: null, muted: false,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.8; this.sfxGain.connect(this.master);
    this.musGain = this.ctx.createGain(); this.musGain.gain.value = 0.22; this.musGain.connect(this.master);
    const n = this.ctx.sampleRate;
    this.noiseBuf = this.ctx.createBuffer(1, n, n);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    if (this.pendingMusic) this.setMusic(this.pendingMusic);
    if (this.pendingRain != null) this.setRain(this.pendingRain);
  },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; },
  tone(freq, dur, type = 'square', vol = 0.2, slide = 0, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.2, freq = 1200, q = 1, type = 'bandpass', delay = 0, sweep = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  sfx(name, arg) {
    if (!this.ctx) return;
    switch (name) {
      case 'jump': this.tone(220, 0.12, 'square', 0.08, 260); break;
      case 'walljump': this.tone(260, 0.12, 'square', 0.08, 300); this.noise(0.06, 0.08, 2000); break;
      case 'land': this.noise(0.08, 0.12, 400, 1, 'lowpass'); break;
      case 'roll': this.noise(0.2, 0.1, 600, 1, 'lowpass', 0, -300); break;
      case 'vault': this.tone(300, 0.08, 'triangle', 0.08, 120); break;
      case 'slide': this.noise(0.3, 0.08, 1800, 2, 'bandpass', 0, -1200); break;
      case 'dash': this.noise(0.18, 0.18, 3000, 1, 'bandpass', 0, -2400); this.tone(660, 0.12, 'sawtooth', 0.05, -300); break;
      case 'shot': this.tone(880, 0.1, 'square', 0.07, -500); break;
      case 'charge': this.tone(440, 0.25, 'sawtooth', 0.09, -300); this.noise(0.25, 0.1, 2500); break;
      case 'fire': this.noise(0.18, 0.12, 900, 1, 'bandpass', 0, 500); break;
      case 'ice': this.tone(1400, 0.2, 'triangle', 0.08, 600); this.noise(0.1, 0.06, 6000, 3); break;
      case 'wave': this.tone(120, 0.4, 'sawtooth', 0.12, -60); this.noise(0.35, 0.14, 800, 1, 'lowpass'); break;
      case 'plat': this.tone(1200, 0.15, 'triangle', 0.07, 400); break;
      case 'hit': this.noise(0.08, 0.15, 1500, 2); this.tone(180, 0.08, 'square', 0.06, -80); break;
      case 'block': this.tone(1500, 0.06, 'square', 0.06); this.tone(1100, 0.06, 'square', 0.05, 0, 0.04); break;
      case 'hurt': this.tone(300, 0.25, 'sawtooth', 0.12, -220); this.noise(0.15, 0.12, 700); break;
      case 'ko': this.tone(200, 0.35, 'square', 0.08, -150); break;
      case 'break': this.noise(0.3, 0.2, 500, 1, 'lowpass'); this.noise(0.15, 0.1, 2500, 1, 'bandpass', 0.05); break;
      case 'enemyShot': this.tone(500, 0.1, 'square', 0.05, -200); break;
      case 'orb': this.tone(300, 0.2, 'sine', 0.08, 200); break;
      case 'alert': this.tone(880, 0.12, 'square', 0.09); this.tone(660, 0.18, 'square', 0.09, 0, 0.13); break;
      case 'pickup': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, 'square', 0.06, 0, i * 0.06)); break;
      case 'save': [392, 523, 659].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.08, 0, i * 0.1)); break;
      case 'copy': [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.08, 0, i * 0.09)); break;
      case 'blip': this.tone(640 + Math.random() * 80, 0.03, 'square', 0.025); break;
      case 'select': this.tone(520, 0.06, 'square', 0.06); break;
      case 'veil': [196, 247, 294, 392, 494].forEach((f, i) => this.tone(f, 1.6, 'triangle', 0.08, 0, i * 0.12)); this.noise(1.5, 0.15, 300, 1, 'lowpass'); break;
      case 'thunder': this.noise(1.6, 0.35, 200, 0.7, 'lowpass', 0, -120); break;
      case 'card': this.tone(1046, 0.6, 'triangle', 0.08); this.tone(1568, 0.8, 'triangle', 0.06, 0, 0.15); break;
      case 'bounce': this.tone(180, 0.18, 'triangle', 0.12, 420); this.noise(0.08, 0.06, 900); break;
      case 'swing': this.noise(0.15, 0.07, 1200, 2, 'bandpass', 0, -600); break;
      case 'racha': [784, 988, 1175].forEach((f, i) => this.tone(f, 0.12, 'square', 0.05, 0, i * 0.05)); break;
      case 'chispa': this.tone(1046 * Math.pow(2, Math.min(12, arg || 0) / 12), 0.09, 'triangle', 0.06); break;
      case 'crumble': this.noise(0.25, 0.08, 500, 1, 'lowpass', 0, -200); break;
      case 'die': this.tone(400, 0.8, 'triangle', 0.12, -330); break;
    }
  },
  // Zumbido mientras se absorbe o se copia
  setHum(on, freq = 220) {
    if (!this.ctx) return;
    if (on && !this.hum) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq; g.gain.value = 0.03;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      o.connect(f); f.connect(g); g.connect(this.sfxGain); o.start();
      this.hum = { o, g };
    } else if (on && this.hum) {
      this.hum.o.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    } else if (!on && this.hum) {
      this.hum.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
      const h = this.hum; setTimeout(() => h.o.stop(), 200); this.hum = null;
    }
  },
  setRain(level) {
    if (!this.ctx) { this.pendingRain = level; return; }
    if (!this.rain) {
      const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500;
      const g = this.ctx.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(this.master); s.start();
      this.rain = { s, g };
    }
    this.rain.g.gain.setTargetAtTime(level * 0.12, this.ctx.currentTime, 0.5);
  },
  // Música: un arpegio modal (re dórico) y un bajo; cada zona cambia tempo y timbre
  SONGS: {
    title: { bpm: 84, wave: 'triangle', bass: [50, 50, 53, 48], arp: [0, 7, 10, 12, 14, 12, 10, 7] },
    eibar: { bpm: 112, wave: 'square', bass: [50, 48, 46, 48], arp: [0, 3, 7, 10, 12, 10, 7, 3] },
    fort: { bpm: 96, wave: 'triangle', bass: [45, 45, 46, 44], arp: [0, 1, 7, 8, 12, 8, 7, 1] },
    storm: { bpm: 70, wave: 'sine', bass: [43, 43, 41, 41], arp: [0, 7, 12, 15, 12, 7, 3, 7] },
    forest: { bpm: 90, wave: 'triangle', bass: [50, 53, 48, 45], arp: [0, 5, 7, 12, 7, 5, 2, 5] },
    faroles: { bpm: 100, wave: 'square', bass: [45, 45, 41, 43], arp: [0, 3, 7, 3, 10, 7, 3, 7] },
    forja: { bpm: 126, wave: 'sawtooth', bass: [40, 40, 43, 38], arp: [0, 12, 7, 12, 3, 12, 7, 15] },
    ancla: { bpm: 140, wave: 'square', bass: [45, 46, 45, 43], arp: [0, 12, 3, 12, 7, 12, 10, 12] },
  },
  setMusic(name) {
    if (!this.ctx) { this.pendingMusic = name; return; }
    if (this.music && this.music.name === name) return;
    if (this.music) clearInterval(this.music.timer);
    if (!name) { this.music = null; return; }
    const song = this.SONGS[name];
    const step = 60 / song.bpm / 2;
    let i = 0;
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const play = () => {
      if (!this.ctx || this.muted) { i++; return; }
      const t = this.ctx.currentTime + 0.05;
      const bar = Math.floor(i / 8) % song.bass.length;
      const root = song.bass[bar];
      const mk = (freq, dur, type, vol) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(this.musGain); o.start(t); o.stop(t + dur + 0.02);
      };
      if (i % 8 === 0) mk(midi(root - 12), step * 7, 'triangle', 0.35);
      if (i % 4 === 2) mk(midi(root - 12), step * 1.5, 'triangle', 0.2);
      const n = song.arp[i % song.arp.length];
      if ((i * 7) % 11 !== 3) mk(midi(root + 12 + n), step * 0.9, song.wave, song.wave === 'sawtooth' ? 0.05 : 0.08);
      i++;
    };
    this.music = { name, timer: setInterval(play, step * 1000) };
  },
};
