/**
 * tema.js — Lima token warna + mesin tema.
 * Dimuat SEBELUM Tailwind, karena tailwind.config membaca window.TEMA_COLORS.
 */

window.TEMA_COLORS = {
    "background":                 "rgb(var(--bg-base) / <alpha-value>)",
    "surface":                    "rgb(var(--bg-base) / <alpha-value>)",
    "surface-bright":             "rgb(var(--bg-base) / <alpha-value>)",
    "surface-container-lowest":   "rgb(255 255 255 / <alpha-value>)",
    "surface-container-low":      "rgb(var(--surface) / <alpha-value>)",
    "surface-container":          "rgb(var(--surface-2) / <alpha-value>)",
    "surface-container-high":     "rgb(var(--surface-3) / <alpha-value>)",
    "surface-container-highest":  "rgb(var(--brand) / <alpha-value>)",
    "surface-variant":            "rgb(var(--brand) / <alpha-value>)",
    "surface-dim":                "rgb(var(--brand-soft) / <alpha-value>)",
    "surface-tint":               "rgb(var(--action) / <alpha-value>)",

    "primary":                    "rgb(var(--action) / <alpha-value>)",
    "on-primary":                 "rgb(255 255 255 / <alpha-value>)",
    "primary-container":          "rgb(var(--action-hover) / <alpha-value>)",
    "on-primary-container":       "rgb(var(--brand-soft) / <alpha-value>)",
    "primary-fixed":              "rgb(var(--brand) / <alpha-value>)",
    "primary-fixed-dim":          "rgb(var(--brand-strong) / <alpha-value>)",
    "on-primary-fixed":           "rgb(var(--ink) / <alpha-value>)",
    "on-primary-fixed-variant":   "rgb(var(--action) / <alpha-value>)",
    "inverse-primary":            "rgb(var(--brand-strong) / <alpha-value>)",

    "secondary":                  "rgb(var(--ink-muted) / <alpha-value>)",
    "on-secondary":               "rgb(255 255 255 / <alpha-value>)",
    "secondary-container":        "rgb(var(--brand-soft) / <alpha-value>)",
    "on-secondary-container":     "rgb(var(--ink-muted) / <alpha-value>)",
    "secondary-fixed":            "rgb(var(--brand) / <alpha-value>)",
    "secondary-fixed-dim":        "rgb(var(--on-ink-muted) / <alpha-value>)",
    "on-secondary-fixed":         "rgb(var(--ink) / <alpha-value>)",
    "on-secondary-fixed-variant": "rgb(var(--ink-muted) / <alpha-value>)",

    "tertiary":                   "rgb(var(--accent) / <alpha-value>)",
    "on-tertiary":                "rgb(255 255 255 / <alpha-value>)",
    "tertiary-container":         "rgb(var(--accent) / <alpha-value>)",
    "on-tertiary-container":      "rgb(var(--accent-soft) / <alpha-value>)",
    "tertiary-fixed":             "rgb(var(--accent-soft) / <alpha-value>)",
    "tertiary-fixed-dim":         "rgb(var(--accent) / <alpha-value>)",
    "on-tertiary-fixed":          "rgb(var(--ink) / <alpha-value>)",
    "on-tertiary-fixed-variant":  "rgb(var(--accent) / <alpha-value>)",

    "on-surface":                 "rgb(var(--ink) / <alpha-value>)",
    "on-background":              "rgb(var(--ink) / <alpha-value>)",
    "on-surface-variant":         "rgb(var(--ink-muted) / <alpha-value>)",
    "outline":                    "rgb(var(--ink-muted) / <alpha-value>)",
    "outline-variant":            "rgb(var(--border) / <alpha-value>)",
    "inverse-surface":            "rgb(var(--ink-deep) / <alpha-value>)",
    "inverse-on-surface":         "rgb(var(--on-ink) / <alpha-value>)",

    "error":                      "rgb(var(--danger) / <alpha-value>)",
    "on-error":                   "rgb(255 255 255 / <alpha-value>)",
    "error-container":            "rgb(var(--danger-soft) / <alpha-value>)",
    "on-error-container":         "rgb(var(--danger) / <alpha-value>)"
  };

(function () {
  'use strict';

  // Lima warna dasar — INI yang diisi dari sheet Pengaturan / color picker.
  var PRESET = {
    lavender: { nama:'Lavender Lembut', brand:'#CFC6EE', action:'#6C4FC7',
                surface:'#F5F3FB', ink:'#2E2552', accent:'#2A9D8F' },
    biru:     { nama:'Biru Langit',     brand:'#BBD4F2', action:'#1D5FA8',
                surface:'#F2F6FB', ink:'#1F3350', accent:'#0F766E' },
    mustard:  { nama:'Mustard Hangat',  brand:'#F5C542', action:'#B45309',
                surface:'#F7EFD8', ink:'#3B2A1A', accent:'#4D7C3F' }
  };

  function hexToRgb(h) {
    h = String(h).replace('#', '').trim();
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {                        // t = porsi b (0..1)
    return [0,1,2].map(function (i) {
      return Math.round(a[i] + (b[i] - a[i]) * t);
    });
  }
  function shade(c, t) { return mix(c, [0,0,0], t); }
  function ch(c) { return c.join(' '); }

  // Menurunkan 19 token dari 5 warna dasar.
  function derive(base) {
    var W = [255,255,255],
        brand  = hexToRgb(base.brand),
        action = hexToRgb(base.action),
        surf   = hexToRgb(base.surface),
        ink    = hexToRgb(base.ink),
        acc    = hexToRgb(base.accent);
    return {
      'bg-base':      mix(W, brand, 0.04),
      'surface':      surf,
      'surface-2':    mix(surf, brand, 0.30),
      'surface-3':    mix(surf, brand, 0.55),
      'brand':        brand,
      'brand-strong': mix(brand, action, 0.35),
      'brand-soft':   mix(brand, W, 0.45),
      'action':       action,
      'action-hover': shade(action, 0.18),
      'accent':       acc,
      'accent-soft':  mix(acc, W, 0.82),
      'ink':          ink,
      'ink-muted':    mix(ink, W, 0.52),
      'ink-deep':     mix(ink, action, 0.18),
      'on-ink':       mix(W, brand, 0.10),
      'on-ink-muted': mix(brand, W, 0.15),
      'border':       mix(brand, W, 0.35),
      'danger':       [186,26,26],
      'danger-soft':  [255,218,214]
    };
  }

  // Kontras WCAG — dipakai panel "cek kontras" di menu Pengaturan.
  function lum(c) {
    var s = c.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126*s[0] + 0.7152*s[1] + 0.0722*s[2];
  }
  function rasio(a, b) {
    var x = lum(a), y = lum(b);
    return ((Math.max(x,y) + 0.05) / (Math.min(x,y) + 0.05));
  }

  /**
   * Terapkan tema ke seluruh halaman.
   * @param {string|Object} t  nama preset ('lavender'|'biru'|'mustard')
   *                           atau objek {brand, action, surface, ink, accent}
   */
  function terapkanTema(t) {
    var base = (typeof t === 'string') ? PRESET[t] : t;
    if (!base) base = PRESET.lavender;
    var tok = derive(base), root = document.documentElement;
    Object.keys(tok).forEach(function (k) {
      root.style.setProperty('--' + k, ch(tok[k]));
    });
    root.setAttribute('data-tema', (typeof t === 'string') ? t : 'kustom');
    try { localStorage.setItem('tema_aktif', JSON.stringify(base)); } catch (e) {}
    return tok;
  }

  /** Laporan kontras untuk panel Pengaturan → tab Tema Warna. */
  function cekKontras(base) {
    var tok = derive(base);
    var uji = [
      { label:'Teks di atas latar',   a:tok.ink,        b:tok['bg-base'] },
      { label:'Teks di atas brand',   a:tok.ink,        b:tok.brand },
      { label:'Teks di atas surface', a:tok.ink,        b:tok.surface },
      { label:'Putih di atas tombol', a:[255,255,255],  b:tok.action },
      { label:'Teks muted di latar',  a:tok['ink-muted'], b:tok['bg-base'] }
    ];
    return uji.map(function (u) {
      var r = rasio(u.a, u.b);
      return { label:u.label, rasio:r.toFixed(2), lulus:r >= 4.5 };
    });
  }

  /** Pulihkan tema terakhir sebelum halaman tampil (hindari kedip warna). */
  function pulihkanTema() {
    try {
      var s = localStorage.getItem('tema_aktif');
      if (s) { terapkanTema(JSON.parse(s)); return; }
    } catch (e) {}
    terapkanTema('lavender');
  }

  window.TEMA_PRESET  = PRESET;
  window.terapkanTema = terapkanTema;
  window.cekKontras   = cekKontras;
  pulihkanTema();
})();
