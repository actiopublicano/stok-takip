// Web Audio API ile tamamen sentetik ses sistemi - telif hakkı yok

class SesYonetici {
  constructor() {
    this._ctx = null;
    this.aktif = true;
    this.muzikSes = 0.3;
    this.sfxSes = 0.5;
    this._ambiyans = null;
  }

  get ctx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  // Basit zil sesi üret
  _osc(frekans, sure, tip = 'sine', gec = 0) {
    if (!this.aktif) return;
    try {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = tip;
      osc.frequency.setValueAtTime(frekans, ctx.currentTime + gec);
      gain.gain.setValueAtTime(this.sfxSes * 0.3, ctx.currentTime + gec);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + gec + sure);
      osc.start(ctx.currentTime + gec);
      osc.stop(ctx.currentTime + gec + sure);
    } catch {}
  }

  // Sulama sesi - su damlası gibi inen tonlar
  sulama() {
    if (!this.aktif) return;
    const frekanslar = [800, 600, 450, 340];
    frekanslar.forEach((f, i) => this._osc(f, 0.15, 'sine', i * 0.08));
  }

  // Hasat sesi - yükselen neşeli notlar
  hasat() {
    if (!this.aktif) return;
    const notlar = [523, 659, 784, 1047]; // Do Mi Sol Do
    notlar.forEach((f, i) => this._osc(f, 0.2, 'triangle', i * 0.1));
  }

  // Ekim sesi - kısa toprak sesi
  ekim() {
    if (!this.aktif) return;
    this._osc(200, 0.1, 'square', 0);
    this._osc(180, 0.15, 'sine', 0.05);
  }

  // Başarım sesi - fanfar
  basarim() {
    if (!this.aktif) return;
    const notlar = [523, 659, 784, 1047, 784, 1047];
    const sureler = [0.1, 0.1, 0.1, 0.1, 0.1, 0.3];
    notlar.forEach((f, i) => this._osc(f, sureler[i], 'triangle', i * 0.12));
  }

  // Seviye atlama sesi
  seviye() {
    if (!this.aktif) return;
    const notlar = [523, 587, 659, 698, 784, 880, 988, 1047];
    notlar.forEach((f, i) => this._osc(f, 0.15, 'sine', i * 0.07));
  }

  // Hata sesi - uyarı tonu
  hata() {
    if (!this.aktif) return;
    this._osc(200, 0.2, 'square', 0);
    this._osc(180, 0.2, 'square', 0.25);
  }

  // Gübre sesi - parlak ses
  gubre() {
    if (!this.aktif) return;
    this._osc(880, 0.1, 'sine', 0);
    this._osc(1100, 0.15, 'sine', 0.08);
  }

  // Satın alma sesi - kısa klik
  satin() {
    if (!this.aktif) return;
    this._osc(600, 0.08, 'triangle', 0);
    this._osc(750, 0.08, 'triangle', 0.07);
  }

  // Bildirim sesi - nazik ping
  bildirim() {
    if (!this.aktif) return;
    this._osc(880, 0.3, 'sine', 0);
  }

  // Hastalık uyarı sesi - endişeli nabız
  hastalikUyari() {
    if (!this.aktif) return;
    this._osc(220, 0.15, 'sawtooth', 0);
    this._osc(220, 0.15, 'sawtooth', 0.3);
    this._osc(220, 0.15, 'sawtooth', 0.6);
  }

  // Rastgele olay sesi - gizemli
  rastgeleOlay() {
    if (!this.aktif) return;
    const notlar = [659, 784, 880, 1047, 880, 784];
    notlar.forEach((f, i) => this._osc(f, 0.12, 'sine', i * 0.09));
  }

  // Yağmur ambiyans sesi (kısa)
  yagmur() {
    if (!this.aktif) return;
    try {
      const ctx = this.ctx;
      const bufBoy = ctx.sampleRate * 0.5;
      const buf = ctx.createBuffer(1, bufBoy, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufBoy; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = this.sfxSes * 0.1;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      source.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  // Sesi aç/kapat
  toggle() {
    this.aktif = !this.aktif;
    return this.aktif;
  }
}

// Singleton
export const ses = new SesYonetici();
