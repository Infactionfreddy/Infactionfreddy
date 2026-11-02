// FG Production skin — mirrors the fg-production.tech website:
// near-black/white canvas, hairline borders, mono eyebrows, heavy display
// headlines with one accent word, icon tiles, skill bars.
// Fonts are embedded as subsets so the cards look identical on every device.
import { FONTS, WIDTHS } from '../fonts/fg-fonts.mjs';
import { esc, fmt } from './util.mjs';

/* ─────────────────────────── tokens ─────────────────────────── */
const hexA = (hex, a) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const mix = (hex, to, t) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

export function fgTheme(mode, accent = '#8b5cf6') {
  const dark = mode === 'dark';
  const acc = dark ? accent : mix(accent, '#000000', 0.12);
  // Neutrals carry a slight violet bias so black and purple read as one palette.
  return {
    id: dark ? 'fg' : 'fg-light',
    dark,
    cardTop: dark ? '#0e0b14' : '#ffffff',
    cardBot: dark ? '#050407' : '#faf9fc',
    inset: dark ? 'rgba(167,139,250,0.035)' : '#f6f4fa',
    solid: dark ? '#0d0a12' : '#f8f6fb',
    border: dark ? 'rgba(167,139,250,0.14)' : '#e6e2ee',
    borderHi: dark ? 'rgba(167,139,250,0.28)' : '#d4cde2',
    text: dark ? '#f5f3fa' : '#0c0a10',
    body: dark ? '#cbc5d9' : '#3f3a4a',
    muted: dark ? '#968fa8' : '#665f75',
    faint: dark ? '#4a4458' : '#b7b0c4',
    track: dark ? 'rgba(167,139,250,0.10)' : '#eeeaf5',
    dots: dark ? 'rgba(167,139,250,0.10)' : 'rgba(12,10,16,0.07)',
    accent: acc,
    accentHi: mix(acc, '#ffffff', dark ? 0.4 : 0.25),
    accentSoft: hexA(acc, dark ? 0.14 : 0.09),
    accentLine: hexA(acc, dark ? 0.38 : 0.28),
    onAccent: '#ffffff',
    ok: dark ? '#34d399' : '#10b981',
  };
}

/* ─────────────────────────── type ─────────────────────────── */
const FACE = {
  sans4: { fam: 'FGSans', w: 400, key: 'fg-sans-400' },
  sans5: { fam: 'FGSans', w: 500, key: 'fg-sans-500' },
  sans6: { fam: 'FGSans', w: 600, key: 'fg-sans-600' },
  disp: { fam: 'FGDisplay', w: 800, key: 'fg-display-800' },
  mono: { fam: 'FGMono', w: 400, key: 'fg-mono-400' },
};
const STACK = {
  FGSans: "FGSans,Inter,'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",
  FGDisplay: "FGDisplay,'Inter Display',Inter,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif",
  FGMono: "FGMono,'Geist Mono','SF Mono',Menlo,Consolas,monospace",
};
function fontCss(faces) {
  return [...new Set(faces)]
    .map((f) => {
      const F = FACE[f];
      return `@font-face{font-family:${F.fam};font-weight:${F.w};font-style:normal;src:url(data:font/woff;base64,${FONTS[F.key]}) format('woff')}`;
    })
    .join('\n');
}
// Precise width from the embedded font's advance widths.
function measure(str, face, size, tracking = 0) {
  const tbl = WIDTHS[FACE[face].key];
  let w = 0;
  for (const ch of String(str)) w += (tbl[ch] ?? 0.56) * size + tracking;
  return w;
}
function fit(str, face, size, maxW, tracking = 0) {
  str = String(str ?? '');
  if (measure(str, face, size, tracking) <= maxW) return str;
  while (str.length > 1 && measure(str + '…', face, size, tracking) > maxW) str = str.slice(0, -1);
  return str.trimEnd() + '…';
}
function lines(str, face, size, maxW, max = 2) {
  const words = String(str ?? '').split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '', i = 0;
  for (; i < words.length; i++) {
    const nx = cur ? cur + ' ' + words[i] : words[i];
    if (measure(nx, face, size) <= maxW) cur = nx;
    else {
      out.push(cur);
      cur = words[i];
      if (out.length === max) break;
    }
  }
  if (out.length < max && cur) { out.push(cur); i = words.length; }
  if (i < words.length) out[max - 1] = fit(out[max - 1] + ' ' + words.slice(i).join(' '), face, size, maxW);
  return out;
}
function T(x, y, str, face, size, fill, extra = '') {
  const F = FACE[face];
  return `<text x="${r(x)}" y="${r(y)}" font-family="${STACK[F.fam]}" font-weight="${F.w}" font-size="${size}" fill="${fill}" ${extra}>${esc(str)}</text>`;
}
const r = (n) => Math.round(n * 10) / 10;

/* ─────────────────────────── icons (24px, stroke) ─────────────────────────── */
const IC = {
  chip: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  wave: '<path d="M2 12h3l2-7 4 14 3-9 2 4h4"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><path d="M12 22.08V12"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  commit: '<circle cx="12" cy="12" r="4"/><path d="M1.5 12H8M16 12h6.5"/>',
  star: '<path d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.5 9.4l6.6-1z"/>',
  pr: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v7M18 15.5V10a3 3 0 0 0-3-3h-4"/><path d="M13 4.5L10.5 7 13 9.5"/>',
  issue: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.5"/>',
  pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  repo: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  fork: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M6 7.5v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1M12 11.5v5"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  ext: '<path d="M7 17L17 7M8 7h9v9"/>',
};
function ic(name, x, y, size, color, sw = 1.8) {
  const s = size / 24;
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[name]}</g>`;
}
function tile(t, name, x, y, size = 34) {
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.27}" fill="${t.accentSoft}" stroke="${t.accentLine}"/>` +
    ic(name, x + size * 0.24, y + size * 0.24, size * 0.52, t.accent, 1.9);
}

/* ─────────────────────────── frame ─────────────────────────── */
function frame(t, w, h) {
  return `<defs>
  <linearGradient id="card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.cardTop}"/><stop offset="1" stop-color="${t.cardBot}"/></linearGradient>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accentHi}"/></linearGradient>
  <linearGradient id="accV" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accentHi}"/></linearGradient>
  <linearGradient id="hi" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${t.accent}" stop-opacity="${t.dark ? 0.7 : 0.5}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient>
  <radialGradient id="glow" cx="1" cy="0" r="1"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.dark ? 0.22 : 0.07}"/><stop offset=".6" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${t.dots}"/></pattern>
  <radialGradient id="dotFadeG" cx="1" cy="0" r="1"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="dotFade"><rect width="${w}" height="${h}" fill="url(#dotFadeG)"/></mask>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="16"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="url(#card)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)" mask="url(#dotFade)"/>
  <rect x="${w * 0.15}" y="0" width="${w * 0.7}" height="1" fill="url(#hi)"/>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="${t.border}"/>`;
}
function head(t, x, eyebrow, title, right = '') {
  return `<rect x="${x}" y="31" width="14" height="2" rx="1" fill="${t.accent}"/>` +
    T(x + 22, 36, eyebrow.toUpperCase(), 'mono', 11, t.accent, 'letter-spacing="1.8"') +
    T(x, 64, title, 'disp', 22, t.text, 'letter-spacing="-0.5"') + right;
}
const BASE_CSS = `
.up{animation:up .7s cubic-bezier(.2,.8,.2,1) both}
@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.grow{transform-box:fill-box;transform-origin:0 50%;animation:growX 1.1s cubic-bezier(.2,.8,.2,1) both}
@keyframes growX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.rise{transform-box:fill-box;transform-origin:50% 100%;animation:growY .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes growY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.fadein{animation:fadein .6s ease-out both}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.pulse{animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.caret{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

function doc(t, w, h, title, body, faces, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
${fontCss(faces)}
${BASE_CSS}
${css}
</style>
${frame(t, w, h)}
${body}
</svg>
`;
}

/* ═══════════════════════════ BANNER ═══════════════════════════ */
export function banner(t, d, cfg) {
  const W = 900, H = 340;
  const fg = cfg.fg || {};
  let s = '';
  // header bar, like the site's nav
  const mark = 22;
  const fw = measure('F', 'disp', mark, -0.5);
  s += T(36, 47, 'F', 'disp', mark, t.text, 'letter-spacing="-0.5"');
  s += T(36 + fw, 47, 'G', 'disp', mark, t.accent, 'letter-spacing="-0.5"');
  const gw = measure('G', 'disp', mark, -0.5);
  s += T(36 + fw + gw + 8, 46, fg.brandWord || 'Production', 'sans5', 15, t.muted);
  const meta = `@${d.login}${d.location ? '  ·  ' + d.location : ''}`;
  const mw = measure(meta, 'mono', 11.5, 0.4);
  s += `<circle cx="${r(W - 36 - mw - 14)}" cy="42" r="3.5" fill="${t.ok}" class="pulse"/>`;
  s += T(W - 36, 46, meta, 'mono', 11.5, t.muted, 'text-anchor="end" letter-spacing="0.4"');
  s += `<line x1="36" y1="72.5" x2="${W - 36}" y2="72.5" stroke="${t.border}"/>`;

  // code overlay (right), faded like the site's hero media
  const code = fg.heroCode || [
    '#include <Arduino.h>',
    '',
    'void setup() {',
    '  pinMode(LED, OUTPUT);',
    '}',
    '',
    'void loop() {',
    '  digitalWrite(LED, HIGH);',
    '}',
  ];
  s += `<defs><linearGradient id="codeFadeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="codeFadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".25" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="codeFadeY"><rect x="470" y="73" width="430" height="267" fill="url(#codeFadeV)"/></mask>
<mask id="codeFade"><rect x="470" y="73" width="430" height="267" fill="url(#codeFadeG)" mask="url(#codeFadeY)"/></mask></defs>`;
  const kw = /\b(void|include|return|let|fn|pub|use|const|if|else|for|while|struct|impl)\b/;
  s += `<g mask="url(#codeFade)" opacity="${t.dark ? 0.32 : 0.38}">`;
  code.forEach((ln, i) => {
    const y = 200 + i * 17.5;
    const col = ln.startsWith('#') ? t.accent : kw.test(ln) ? t.accentHi : t.faint;
    s += T(640, y, ln.replace(/ /g, ' '), 'mono', 12, col, `opacity="${ln.startsWith('#') || kw.test(ln) ? 0.6 : 1}"`);
  });
  const last = code[code.length - 1] || '';
  s += `<rect x="${r(640 + measure(last, 'mono', 12) + 3)}" y="${r(200 + (code.length - 1) * 17.5 - 10)}" width="7" height="13" fill="${t.accent}" class="caret" opacity=".8"/>`;
  s += `</g>`;

  // eyebrow + headline
  s += `<g class="up"><rect x="36" y="110" width="18" height="2" rx="1" fill="${t.accent}"/>`;
  s += T(62, 115, (fg.eyebrow || 'Elektrotechnik Student').toUpperCase(), 'mono', 11.5, t.accent, 'letter-spacing="2"') + '</g>';
  const words = fg.headline || ['Engineering.', 'Software.', 'Design.'];
  words.forEach((wd, i) => {
    const isAcc = i === words.length - 1;
    s += `<g class="up" style="animation-delay:${120 + i * 110}ms">` +
      T(34, 174 + i * 56, wd, 'disp', 56, isAcc ? 'url(#acc)' : t.text, 'letter-spacing="-2.2"') + '</g>';
  });

  // right column copy
  const rx = 500, rw = 352;
  const sub = lines(cfg.fg?.tagline || d.tagline, 'sans4', 15.5, rw, 3);
  s += `<g class="up" style="animation-delay:300ms">`;
  sub.forEach((ln, i) => (s += T(rx, 128 + i * 24, ln, 'sans4', 15.5, t.body)));
  s += '</g>';

  // CTA buttons
  const by = 128 + sub.length * 24 + 12;
  const p = fg.ctaPrimary || 'Meine Projekte';
  const g = fg.ctaGhost || 'Über mich';
  const pw = measure(p, 'sans6', 14) + 52, gw2 = measure(g, 'sans6', 14) + 52;
  s += `<g class="up" style="animation-delay:420ms">`;
  s += `<rect x="${rx}" y="${by}" width="${r(pw)}" height="42" rx="10" fill="${t.accent}"/>`;
  s += T(rx + 18, by + 26, p, 'sans6', 14, t.onAccent);
  s += ic('arrow', rx + pw - 30, by + 14, 14, t.onAccent, 2.2);
  const gx = rx + pw + 10;
  s += `<rect x="${r(gx + 0.5)}" y="${by + 0.5}" width="${r(gw2 - 1)}" height="41" rx="9.5" fill="${t.solid}" stroke="${t.borderHi}"/>`;
  s += T(gx + 18, by + 26, g, 'sans6', 14, t.text);
  s += ic('arrow', gx + gw2 - 30, by + 14, 14, t.text, 2.2);
  s += '</g>';

  // stack chips
  let cx = rx;
  const cy = by + 66;
  s += `<g class="up" style="animation-delay:520ms">`;
  for (const c of d.stack || []) {
    const cw = measure(c, 'mono', 11, 0.2) + 20;
    if (cx + cw > W - 36) break;
    s += `<rect x="${r(cx + 0.5)}" y="${cy + 0.5}" width="${r(cw - 1)}" height="25" rx="12.5" fill="${t.solid}" stroke="${t.border}"/>`;
    s += T(cx + 10, cy + 17, c, 'mono', 11, t.muted, 'letter-spacing="0.2"');
    cx += cw + 6;
  }
  s += '</g>';

  return doc(t, W, H, `${d.displayName} — ${words.join(' ')}`, s, ['disp', 'sans4', 'sans5', 'sans6', 'mono']);
}

/* ═══════════════════════════ KOMPETENZEN ═══════════════════════════ */
const DEFAULT_CAPS = [
  { icon: 'chip', title: 'Elektrotechnik', items: ['Schaltungsdesign', 'PCB Design', 'Embedded Systems', 'Mikrocontroller'] },
  { icon: 'code', title: 'Software', items: ['Webentwicklung', 'Python', 'Automatisierung', 'APIs & Datenbanken'] },
  { icon: 'wave', title: 'Audio & Video', items: ['Beschallung', 'Lichttechnik', 'Streaming', 'Veranstaltungstechnik'] },
  { icon: 'box', title: '3D Druck & CAD', items: ['3D Konstruktion', 'Prototyping', '3D Druck', 'Rapid Manufacturing'] },
  { icon: 'pen', title: 'Design', items: ['UI/UX Design', 'Grafik Design', 'Technische Visualisierung', 'Branding'] },
];
export function capabilities(t, d, cfg) {
  const caps = (cfg.fg?.capabilities || DEFAULT_CAPS).slice(0, 5);
  const W = 900;
  const gap = 10, n = caps.length, cw = (W - 72 - gap * (n - 1)) / n;
  const itemW = cw - 36;
  // pre-wrap items so every column shares one height
  const wrapped = caps.map((c) => c.items.slice(0, 5).map((it) => lines(it, 'sans4', 11.5, itemW, 2)));
  const LH = 15, IG = 6;
  const colH = wrapped.map((its) => its.reduce((a, l) => a + l.length * LH + IG, 0));
  const cardH = 84 + Math.max(...colH) + 4;
  const H = 88 + cardH + 24;
  let s = head(t, 36, 'Was ich mache', 'Kompetenzen');
  caps.forEach((c, i) => {
    const x = 36 + i * (cw + gap), y = 88;
    s += `<g class="up" style="animation-delay:${i * 80}ms">`;
    s += `<rect x="${r(x + 0.5)}" y="${y + 0.5}" width="${r(cw - 1)}" height="${r(cardH - 1)}" rx="12" fill="${t.inset}" stroke="${t.border}"/>`;
    s += tile(t, c.icon || 'chip', x + 14, y + 14, 34);
    s += T(x + 14, y + 72, fit(c.title, 'sans6', 14.5, cw - 24), 'sans6', 14.5, t.text);
    let iy = y + 96;
    wrapped[i].forEach((ls) => {
      s += `<circle cx="${r(x + 17)}" cy="${iy - 4}" r="1.8" fill="${t.accent}" opacity=".7"/>`;
      ls.forEach((ln, k) => (s += T(x + 24, iy + k * LH, ln, 'sans4', 11.5, t.muted)));
      iy += ls.length * LH + IG;
    });
    s += '</g>';
  });
  return doc(t, W, H, 'Kompetenzen', s, ['disp', 'sans4', 'sans6', 'mono']);
}

/* ═══════════════════════════ STATS ═══════════════════════════ */
export function stats(t, d) {
  const W = 445, H = 262;
  const st = d.stats;
  let s = head(t, 24, 'GitHub', 'Statistik');
  const items = [
    ['pulse', fmt(st.totalContributions), 'Beiträge · 12 Mon.'],
    ['commit', fmt(st.commits), 'Commits'],
    ['pr', fmt(st.prs), 'Pull Requests'],
    ['issue', fmt(st.issues), 'Issues'],
    ['star', fmt(st.stars), 'Sterne erhalten'],
    ['calendar', `${st.activeDays || 0}`, 'aktive Tage / Jahr'],
  ];
  items.forEach(([icn, val, label], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 24 + col * 205, y = 90 + row * 56;
    s += `<g class="up" style="animation-delay:${i * 60}ms">`;
    s += tile(t, icn, x, y, 36);
    s += T(x + 48, y + 16, val, 'disp', 19, t.text, 'letter-spacing="-0.4" style="font-variant-numeric:tabular-nums"');
    s += T(x + 48, y + 33, label, 'sans4', 12, t.muted);
    s += '</g>';
  });
  return doc(t, W, H, `${d.login} GitHub-Statistik`, s, ['disp', 'sans4', 'mono']);
}

/* ═══════════════════════════ SPRACHEN ═══════════════════════════ */
export function languages(t, d) {
  const W = 445, H = 262;
  const langs = d.languages.slice(0, 5);
  const total = d.languages.reduce((a, l) => a + l.size, 0) || 1;
  let s = head(t, 24, 'Tech Stack', 'Sprachen');
  const bw = W - 48;
  langs.forEach((l, i) => {
    const y = 102 + i * 31;
    const pct = (l.size / total) * 100;
    s += `<circle cx="28" cy="${y - 4.5}" r="3.5" fill="${l.color || t.faint}"/>`;
    s += T(38, y, l.name, 'sans5', 13, t.text);
    s += T(W - 24, y, pct.toFixed(1).replace('.', ',') + ' %', 'mono', 11.5, t.muted, 'text-anchor="end"');
    s += `<rect x="24" y="${y + 8}" width="${bw}" height="5" rx="2.5" fill="${t.track}"/>`;
    s += `<rect class="grow" style="animation-delay:${i * 90}ms" x="24" y="${y + 8}" width="${r(Math.max(6, (bw * pct) / 100))}" height="5" rx="2.5" fill="url(#acc)"/>`;
  });
  if (!langs.length) s += T(24, 110, 'Noch kein öffentlicher Code.', 'sans4', 13, t.muted);
  return doc(t, W, H, `${d.login} Sprachen`, s, ['disp', 'sans4', 'sans5', 'mono']);
}

/* ═══════════════════════════ AKTIVITÄT ═══════════════════════════ */
export function activity(t, d) {
  const W = 900, H = 252;
  const weeks = d.weeks.slice(-52);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const best = Math.max(0, ...weeks.map((w) => w.count));
  // right-hand key figures
  const kf = [
    ['Aktuelle Serie', `${d.stats.currentStreak || 0} T`],
    ['Längste Serie', `${d.stats.longestStreak || 0} T`],
    ['Beste Woche', `${best}`],
  ];
  let right = '', x = W - 36;
  for (let i = kf.length - 1; i >= 0; i--) {
    const [k, v] = kf[i];
    const w = Math.max(measure(v, 'disp', 20, -0.4), measure(k.toUpperCase(), 'mono', 10, 1.2));
    right += T(x, 40, k.toUpperCase(), 'mono', 10, t.muted, 'text-anchor="end" letter-spacing="1.2"');
    right += T(x, 64, v, 'disp', 20, t.text, 'text-anchor="end" letter-spacing="-0.4"');
    x -= w + 28;
    if (i) right += `<line x1="${r(x + 14)}" y1="30" x2="${r(x + 14)}" y2="66" stroke="${t.border}"/>`;
  }
  let s = head(t, 36, 'Aktivität', 'Letzte 52 Wochen', right);

  const x0 = 36, x1 = W - 36, yb = 206, ch = 100;
  const step = (x1 - x0) / weeks.length, bw = step * 0.58;
  [0.5, 1].forEach((f) => (s += `<line x1="${x0}" y1="${r(yb - ch * f)}" x2="${x1}" y2="${r(yb - ch * f)}" stroke="${t.border}" stroke-dasharray="2 4"/>`));
  weeks.forEach((w, i) => {
    const cx = x0 + step * i + step / 2;
    const v = w.count / max;
    if (!w.count) { s += `<circle cx="${r(cx)}" cy="${yb - 2}" r="1.5" fill="${t.faint}"/>`; return; }
    const h = Math.max(4, v * ch);
    const isBest = w.count === best;
    s += `<rect class="fadein" style="animation-delay:${i * 18}ms" x="${r(cx - bw / 2)}" y="${r(yb - h)}" width="${r(bw)}" height="${r(h)}" rx="${r(Math.min(3, bw / 2))}" fill="url(#accV)" fill-opacity="${isBest ? 1 : (0.35 + 0.6 * v).toFixed(2)}"/>`;
  });
  s += `<line x1="${x0}" y1="${yb + 0.5}" x2="${x1}" y2="${yb + 0.5}" stroke="${t.borderHi}"/>`;
  const M = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  let last = -1;
  weeks.forEach((w, i) => {
    const m = new Date(w.start + 'T00:00:00Z').getUTCMonth();
    if (m !== last) {
      const lx = x0 + step * i + 1;
      if (last !== -1 && lx < x1 - 24) s += T(lx, yb + 22, M[m], 'mono', 10.5, t.muted);
      last = m;
    }
  });
  return doc(t, W, H, `${d.login} Aktivität`, s, ['disp', 'mono']);
}

/* ═══════════════════════════ PROJEKT ═══════════════════════════ */
export function repo(t, d, rp, i = 0) {
  const W = 445, H = 196;
  let s = '';
  s += `<rect x="24" y="31" width="14" height="2" rx="1" fill="${t.accent}"/>`;
  s += T(46, 36, `PROJEKT ${String(i + 1).padStart(2, '0')}`, 'mono', 11, t.accent, 'letter-spacing="1.8"');
  // arrow tile top-right
  s += `<rect x="${W - 24 - 32}" y="20" width="32" height="32" rx="9" fill="${t.inset}" stroke="${t.border}"/>`;
  s += ic('ext', W - 24 - 32 + 8, 28, 16, t.text, 2);
  s += T(24, 76, fit(rp.name, 'disp', 22, W - 48, -0.5), 'disp', 22, t.text, 'letter-spacing="-0.5"');
  lines(rp.description || 'Keine Beschreibung.', 'sans4', 13, W - 48, 2).forEach((ln, k) => (s += T(24, 104 + k * 20, ln, 'sans4', 13, t.muted)));
  // footer
  s += `<line x1="24" y1="148.5" x2="${W - 24}" y2="148.5" stroke="${t.border}"/>`;
  let x = 24;
  const fy = 174;
  if (rp.language) {
    const lw = measure(rp.language, 'mono', 11, 0.2) + 30;
    s += `<rect x="${x + 0.5}" y="${fy - 16.5}" width="${r(lw - 1)}" height="24" rx="12" fill="${t.inset}" stroke="${t.border}"/>`;
    s += `<circle cx="${x + 12}" cy="${fy - 4.5}" r="3.5" fill="${rp.languageColor || t.faint}"/>`;
    s += T(x + 21, fy, rp.language, 'mono', 11, t.body, 'letter-spacing="0.2"');
    x += lw + 14;
  }
  s += ic('star', x, fy - 13, 15, t.muted, 1.8);
  s += T(x + 20, fy, fmt(rp.stars), 'mono', 12, t.text);
  x += 30 + measure(fmt(rp.stars), 'mono', 12);
  s += ic('fork', x, fy - 13, 15, t.muted, 1.8);
  s += T(x + 20, fy, fmt(rp.forks), 'mono', 12, t.text);
  if (rp.updated) {
    const [yy, mm, dd] = rp.updated.slice(0, 10).split('-');
    s += T(W - 24, fy, `aktualisiert ${dd}.${mm}.${yy}`, 'mono', 10.5, t.muted, 'text-anchor="end"');
  }
  return doc(t, W, H, `Projekt ${rp.name}`, s, ['disp', 'sans4', 'mono']);
}

export const FG_SKINS = ['fg', 'fg-light'];
