// Skin definitions. Each skin = design tokens + a frame() that paints the
// card background/decoration + a label() for section headings.
import { SANS, MONO, SERIF, esc, rng, hashStr } from './util.mjs';

const r2 = (n) => Math.round(n * 100) / 100;

/* ───────────────────────────── AURORA ───────────────────────────── */
const aurora = {
  id: 'aurora',
  name: 'Aurora',
  mode: 'dark',
  font: SANS, display: SANS, mono: MONO, labelFamily: 'sans',
  bg: '#0a0b14', text: '#eef0ff', muted: '#9097c2', faint: '#5b6190',
  accent: '#a78bfa', accent2: '#22d3ee', accent3: '#f472b6',
  surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)',
  track: 'rgba(255,255,255,0.07)',
  radius: 18, bars: 'gradient', nameWeight: 750, nameSpacing: -0.8,
  css: `
    .blob{animation:drift 18s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
    .b2{animation-duration:23s;animation-delay:-6s}.b3{animation-duration:29s;animation-delay:-11s}
    @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-14px) scale(1.12)}100%{transform:translate(-24px,10px) scale(.94)}}
    .shine{animation:shine 7s ease-in-out infinite}
    @keyframes shine{0%,100%{opacity:.35}50%{opacity:.9}}`,
  frame(w, h) {
    const R = this.radius;
    return `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0e1c"/><stop offset="1" stop-color="#090a12"/></linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".25"/></linearGradient>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a78bfa"/><stop offset=".55" stop-color="#22d3ee"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
  <linearGradient id="accV" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.max(28, h * 0.22)}"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g filter="url(#blur)" opacity=".55">
    <ellipse class="blob" cx="${r2(w * 0.86)}" cy="${r2(h * 0.08)}" rx="${r2(w * 0.22)}" ry="${r2(h * 0.45)}" fill="#7c3aed"/>
    <ellipse class="blob b2" cx="${r2(w * 0.62)}" cy="${r2(h * 1.0)}" rx="${r2(w * 0.2)}" ry="${r2(h * 0.35)}" fill="#0891b2"/>
    <ellipse class="blob b3" cx="${r2(w * 0.08)}" cy="${r2(h * 0.95)}" rx="${r2(w * 0.16)}" ry="${r2(h * 0.3)}" fill="#db2777" opacity=".6"/>
  </g>
  <rect x="${R}" y="0" width="${w - 2 * R}" height="1" fill="url(#acc)" class="shine"/>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" fill="none" stroke="url(#edge)"/>`;
  },
  label(text, x, y) {
    return `<circle cx="${x + 3}" cy="${y - 4}" r="3" fill="url(#acc)"/>
<text x="${x + 13}" y="${y}" font-family="${SANS}" font-size="11" font-weight="650" letter-spacing="1.6" fill="${this.muted}">${esc(text.toUpperCase())}</text>`;
  },
  numberFill: '#ffffff',
  ringStroke: 'url(#acc)',
};

/* ──────────────────────────── BROADCAST ─────────────────────────── */
const broadcast = {
  id: 'broadcast',
  name: 'Broadcast',
  mode: 'dark',
  font: SANS, display: SANS, mono: MONO, labelFamily: 'mono',
  bg: '#0b0b0d', text: '#f4f4f5', muted: '#8d8d96', faint: '#55555e',
  accent: '#ff3b30', accent2: '#30d158', accent3: '#ffb000',
  surface: '#141417', border: '#26262c', track: '#1d1d22',
  radius: 10, bars: 'segmented', nameWeight: 800, nameSpacing: -0.6,
  css: `
    .tally{animation:tally 2.4s ease-in-out infinite}
    @keyframes tally{0%,100%{opacity:1}50%{opacity:.35}}
    .scan{animation:scan 6s linear infinite}
    @keyframes scan{0%{transform:translateY(-40px)}100%{transform:translateY(420px)}}`,
  frame(w, h) {
    const R = this.radius;
    const c = 14, m = 10; // safe-area corner brackets
    const br = (x, y, dx, dy) => `<path d="M${x} ${y + dy * c}V${y}H${x + dx * c}" fill="none" stroke="#3a3a42" stroke-width="1.5"/>`;
    return `<defs>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".025"/></pattern>
  <linearGradient id="vu" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#30d158"/><stop offset=".62" stop-color="#30d158"/><stop offset=".63" stop-color="#ffb000"/><stop offset=".84" stop-color="#ffb000"/><stop offset=".85" stop-color="#ff3b30"/></linearGradient>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3b30"/><stop offset="1" stop-color="#ff7a45"/></linearGradient>
  <linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>
  <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="${this.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect class="scan" x="0" y="0" width="${w}" height="40" fill="url(#scanG)"/>
  <rect x="0" y="0" width="${w}" height="3" fill="url(#acc)"/>
</g>
${w >= 800 ? br(m, m + 3, 1, 1) + br(w - m, m + 3, -1, 1) + br(m, h - m, 1, -1) + br(w - m, h - m, -1, -1) : ''}
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" fill="none" stroke="${this.border}"/>`;
  },
  label(text, x, y, tag = 'CAM') {
    return `<rect x="${x}" y="${y - 9}" width="9" height="9" rx="1.5" fill="${this.accent}" class="tally" filter="url(#glow)"/>
<text x="${x + 16}" y="${y}" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="1.4" fill="${this.muted}">${esc(text.toUpperCase())}</text>`;
  },
  numberFill: '#ffffff',
  ringStroke: '#30d158',
};

/* ──────────────────────────── TERMINAL ──────────────────────────── */
const terminal = {
  id: 'terminal',
  name: 'Terminal',
  mode: 'dark',
  font: MONO, display: MONO, mono: MONO, labelFamily: 'mono', bodyFamily: 'mono',
  bg: '#07100a', text: '#b9f6c0', muted: '#5f9a6a', faint: '#2f5a39',
  accent: '#39ff88', accent2: '#9dffc4', accent3: '#ffd166',
  surface: 'rgba(57,255,136,0.04)', border: '#163a22', track: '#0f2a18',
  radius: 12, bars: 'block', nameWeight: 700, nameSpacing: -0.5,
  langTint: true,
  css: `
    .cur{animation:blink 1.1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .flick{animation:flick 5s infinite}
    @keyframes flick{0%,96%,100%{opacity:1}97%{opacity:.82}98%{opacity:1}99%{opacity:.9}}`,
  chrome: 30,
  frame(w, h, opts = {}) {
    const R = this.radius, T = this.chrome;
    const title = opts.title || 'zsh';
    return `<defs>
  <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".35"/></pattern>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <radialGradient id="phos" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#0d2414"/><stop offset="1" stop-color="#050b07"/></radialGradient>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#39ff88"/><stop offset="1" stop-color="#9dffc4"/></linearGradient>
  <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="url(#phos)"/>
  <rect width="${w}" height="${T}" fill="#0c1a10"/>
  <rect y="${T}" width="${w}" height="1" fill="#1b3d26"/>
  <circle cx="18" cy="${T / 2}" r="5" fill="#ff5f57" opacity=".85"/><circle cx="35" cy="${T / 2}" r="5" fill="#febc2e" opacity=".85"/><circle cx="52" cy="${T / 2}" r="5" fill="#28c840" opacity=".85"/>
  <text x="${w / 2}" y="${T / 2 + 4}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="#4e8a5c">${esc(title)}</text>
</g>`;
  },
  overlay(w, h) {
    const R = this.radius, T = this.chrome;
    return `<g clip-path="url(#clip)" pointer-events="none">
  <rect y="${T}" width="${w}" height="${h - T}" fill="url(#scan)" opacity=".45"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" fill="none" stroke="${this.border}"/>`;
  },
  label(text, x, y) {
    return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="12" fill="${this.muted}"><tspan fill="${this.accent}">❯</tspan> ${esc(text)}</text>`;
  },
  numberFill: '#d6ffdc',
  ringStroke: '#39ff88',
  overlayLast: true,
};

/* ───────────────────────────── PAPER ────────────────────────────── */
const paper = {
  id: 'paper',
  name: 'Paper',
  mode: 'light',
  font: SANS, display: SERIF, mono: MONO, labelFamily: 'mono',
  bg: '#f6f3ec', text: '#17171b', muted: '#6d6860', faint: '#b8b2a7',
  accent: '#2347ff', accent2: '#ff5a2a', accent3: '#0f9d6b',
  surface: '#efebe2', border: '#dcd6ca', track: '#e6e1d6',
  radius: 8, bars: 'ink', nameWeight: 600, nameSpacing: -1.2,
  css: `
    .stamp{animation:spin 40s linear infinite;transform-box:fill-box;transform-origin:center}
    @keyframes spin{to{transform:rotate(360deg)}}`,
  frame(w, h) {
    const R = this.radius;
    const rand = rng(hashStr('paper' + w + h));
    let specks = '';
    for (let i = 0; i < Math.round((w * h) / 2600); i++)
      specks += `<circle cx="${r2(rand() * w)}" cy="${r2(rand() * h)}" r="${r2(0.3 + rand() * 0.5)}" fill="#8a7f6c" opacity="${r2(0.06 + rand() * 0.1)}"/>`;
    return `<defs>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2347ff"/><stop offset="1" stop-color="#2347ff"/></linearGradient>
  <filter id="glow"><feOffset dx="0" dy="0"/></filter>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="${this.bg}"/>
  ${specks}
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" fill="none" stroke="${this.border}"/>`;
  },
  label(text, x, y, _t, w) {
    const tw = text.length * 7.3 + 6;
    const rule = w ? `<line x1="${x + tw + 8}" y1="${y - 4}" x2="${w - x}" y2="${y - 4}" stroke="${this.border}"/>` : '';
    return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="1.3" fill="${this.text}">${esc(text.toUpperCase())}</text>${rule}`;
  },
  numberFill: '#17171b',
  ringStroke: '#2347ff',
  labelRule: true,
};

/* ──────────────────────────── CIRCUIT ───────────────────────────── */
const circuit = {
  id: 'circuit',
  name: 'Circuit',
  mode: 'dark',
  font: SANS, display: SANS, mono: MONO, labelFamily: 'mono',
  bg: '#04110e', text: '#e3fff6', muted: '#7fb8a6', faint: '#2f6153',
  accent: '#00f0c0', accent2: '#ff4fa3', accent3: '#ffd23f',
  surface: 'rgba(0,240,192,0.04)', border: '#0f3a30', track: '#0b2a23',
  radius: 14, bars: 'trace', nameWeight: 750, nameSpacing: -0.6,
  css: `
    .sig{stroke-dasharray:10 190;animation:sig 4.5s linear infinite}
    .s1{animation-delay:-1.3s}.s2{animation-delay:-2.6s;animation-duration:6s}.s3{animation-delay:-3.4s;animation-duration:5.2s}
    @keyframes sig{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
    .led{animation:led 3s ease-in-out infinite}
    @keyframes led{0%,100%{opacity:1}50%{opacity:.3}}`,
  frame(w, h) {
    const R = this.radius;
    const rand = rng(hashStr('pcb' + w + 'x' + h));
    // Deterministic 45°-routed traces.
    const traces = [];
    const n = Math.round(w / 70);
    for (let i = 0; i < n; i++) {
      let x = r2(rand() * w), y = rand() > 0.5 ? -4 : h + 4;
      const dir = y < 0 ? 1 : -1;
      const pts = [[x, y]];
      const segs = 2 + Math.floor(rand() * 3);
      for (let s = 0; s < segs; s++) {
        const len = 18 + rand() * (h * 0.35);
        const diag = s % 2 === 1;
        if (diag) { const d = (rand() > 0.5 ? 1 : -1) * len * 0.7; x += d; y += dir * Math.abs(d); }
        else y += dir * len;
        pts.push([r2(x), r2(y)]);
      }
      traces.push(pts);
    }
    let paths = '', pads = '', sigs = '';
    traces.forEach((pts, i) => {
      const d = 'M' + pts.map((p) => p.join(' ')).join('L');
      paths += `<path d="${d}" fill="none" stroke="#0d3a2f" stroke-width="2.2" stroke-linejoin="round"/>`;
      const [ex, ey] = pts[pts.length - 1];
      pads += `<circle cx="${ex}" cy="${ey}" r="3.4" fill="#04110e" stroke="#13574a" stroke-width="1.6"/>`;
      if (i % 2 === 0) sigs += `<path d="${d}" fill="none" stroke="${i % 4 === 0 ? '#00f0c0' : '#ff4fa3'}" stroke-width="2.2" stroke-linecap="round" class="sig s${i % 4}" opacity=".9" filter="url(#glow)"/>`;
    });
    return `<defs>
  <radialGradient id="mask" cx=".7" cy=".1" r="1"><stop offset="0" stop-color="#062019"/><stop offset="1" stop-color="#030c0a"/></radialGradient>
  <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00f0c0"/><stop offset="1" stop-color="#7dffe4"/></linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
  <radialGradient id="fadeG" cx="${w >= 800 ? 0.3 : 0.5}" cy=".5" r="${w >= 800 ? 0.75 : 0.7}"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></radialGradient>
  <mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#fadeG)"/></mask>
</defs>
<g clip-path="url(#clip)">
  <rect width="${w}" height="${h}" fill="url(#mask)"/>
  <g mask="url(#fade)"><g opacity=".8">${paths}${pads}</g><g>${sigs}</g></g>
</g>
<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="${R - 4}" fill="none" stroke="#0f3a30" stroke-dasharray="2 4"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" fill="none" stroke="#14493d"/>`;
  },
  label(text, x, y, tag = 'U') {
    return `<rect x="${x}" y="${y - 10}" width="10" height="10" rx="2" fill="none" stroke="${this.accent}" stroke-width="1.5"/><circle cx="${x + 5}" cy="${y - 5}" r="1.8" fill="${this.accent}" class="led"/>
<text x="${x + 17}" y="${y}" font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="1.4" fill="${this.muted}">${esc(text.toUpperCase())}</text>`;
  },
  numberFill: '#ffffff',
  ringStroke: 'url(#acc)',
};

export const THEMES = { aurora, broadcast, terminal, paper, circuit };
export const THEME_IDS = Object.keys(THEMES);
