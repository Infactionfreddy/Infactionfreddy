// Card renderers. Every card = theme.frame() + content + theme.overlay().
import { esc, fmt, truncate, wrap, textWidth, icon, svgDoc, clamp, MONO, SANS } from './util.mjs';

const LABELS = {
  aurora:    { stats: 'GitHub Stats', langs: 'Top Languages', activity: 'Activity · 52 weeks', repo: 'Featured Repository' },
  broadcast: { stats: 'CAM 1 · Stats', langs: 'CAM 2 · Languages', activity: 'PGM · Activity 52 wk', repo: 'VTR · Repository' },
  terminal:  { stats: 'gh stats --last 12mo', langs: 'cloc --by-language', activity: 'git log --since=1.year | spark', repo: 'git remote -v' },
  paper:     { stats: 'Statistics', langs: 'Languages', activity: 'Activity, the last 52 weeks', repo: 'Featured Work' },
  circuit:   { stats: 'U1 · Stats', langs: 'U2 · Languages', activity: 'BUS · Activity 52 wk', repo: 'J1 · Repository' },
};
const L = (t, k) => (LABELS[t.id] || LABELS.aurora)[k];

const top = (t) => (t.chrome ? t.chrome + 4 : 0);
const body = (t) => (t.bodyFamily === 'mono' ? 'mono' : 'sans');

function card(t, w, h, title, content, opts = {}, extraCss = '') {
  const inner = t.frame(w, h, opts) + '\n' + content + '\n' + (t.overlay ? t.overlay(w, h) : '');
  return svgDoc(w, h, title, inner, t.css + extraCss);
}

const GROW = `
  .grow{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s cubic-bezier(.2,.8,.2,1) both}
  @keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  .fade{animation:fade .8s ease-out both}
  @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`;

// Terminal skin renders language colours as shades of phosphor green.
function langColor(t, lang, i) {
  if (t.langTint) return ['#39ff88', '#2fd873', '#9dffc4', '#1fa85a', '#c8ffd9', '#147a40'][i % 6];
  return lang.color || '#8b949e';
}

/* ════════════════════════════ BANNER ════════════════════════════ */
export function banner(t, d) {
  const T = top(t), W = 900, H = 250 + T;
  const x = 44;
  const login = d.login;
  const name = d.displayName || d.name || login;
  let s = '';

  // kicker
  const kick = {
    aurora: `@${login}${d.location ? '  ·  ' + d.location : ''}`,
    broadcast: `LIVE  ·  @${login}${d.location ? '  ·  ' + d.location.toUpperCase() : ''}`,
    terminal: `whoami`,
    paper: `Developer profile — №${String(new Date(d.generatedAt).getFullYear())}`,
    circuit: `REV ${new Date(d.generatedAt).getFullYear()}  ·  @${login}${d.location ? "  ·  " + d.location : ""}`,
  }[t.id];

  let y0 = T + 64;
  if (t.id === 'terminal') {
    s += `<text x="${x}" y="${T + 34}" font-family="${MONO}" font-size="13" fill="${t.muted}"><tspan fill="${t.accent}">❯</tspan> ${esc(kick)}</text>`;
    y0 = T + 80;
  } else if (t.id === 'broadcast') {
    s += `<rect x="${x}" y="${T + 38}" width="8" height="8" rx="4" fill="${t.accent}" class="tally" filter="url(#glow)"/>`;
    s += `<text x="${x + 16}" y="${T + 46}" font-family="${MONO}" font-size="12" font-weight="700" letter-spacing="1.6" fill="${t.muted}">${esc(kick)}</text>`;
    y0 = T + 100;
  } else {
    const fam = t.id === 'aurora' ? SANS : MONO;
    s += `<text x="${x}" y="${T + 46}" font-family="${fam}" font-size="12" font-weight="600" letter-spacing="${t.id === 'aurora' ? 0.6 : 1.4}" fill="${t.muted}">${esc(t.id === 'aurora' ? kick : kick.toUpperCase())}</text>`;
    y0 = T + 100;
  }

  // name
  const nameSize = t.id === 'terminal' ? 44 : t.id === 'paper' ? 60 : 56;
  const fam = t.id === 'terminal' ? 'mono' : t.id === 'paper' ? 'serif' : 'sans';
  const nm = truncate(name, 520, nameSize, fam);
  const nameFill = t.id === 'aurora' ? 'url(#nameG)' : t.id === 'terminal' ? t.accent : t.text;
  if (t.id === 'aurora')
    s += `<defs><linearGradient id="nameG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e3dcff"/><stop offset="1" stop-color="#9ee9f5"/></linearGradient></defs>`;
  s += `<text x="${x - 2}" y="${y0}" font-family="${t.display}" font-size="${nameSize}" font-weight="${t.nameWeight}" letter-spacing="${t.nameSpacing}" fill="${nameFill}"${t.id === 'terminal' ? ' filter="url(#glow)" class="flick"' : ''}${t.id === 'paper' ? ' font-style="normal"' : ''}>${esc(nm)}${t.id === 'paper' ? `<tspan fill="${t.accent2}">.</tspan>` : ''}</text>`;
  if (t.id === 'terminal') {
    const cw = textWidth(nm, nameSize, 'mono');
    s += `<rect x="${x + cw + 4}" y="${y0 - 34}" width="20" height="38" fill="${t.accent}" class="cur" opacity=".9"/>`;
  }

  // tagline
  const tagSize = t.id === 'paper' ? 18 : 16;
  const tagFam = t.id === 'terminal' ? 'mono' : t.id === 'paper' ? 'serif' : 'sans';
  const lines = wrap(d.tagline || d.bio || '', t.id === 'terminal' ? 460 : 520, tagSize, tagFam, 2);
  lines.forEach((ln, i) => {
    s += `<text x="${x}" y="${y0 + 32 + i * 23}" font-family="${tagFam === 'mono' ? MONO : tagFam === 'serif' ? t.display : t.font}" font-size="${tagSize}"${t.id === 'paper' ? ' font-style="italic"' : ''} fill="${t.id === 'paper' ? '#3b3833' : t.muted}">${t.id === 'terminal' && i === 0 ? `<tspan fill="${t.faint}"># </tspan>` : t.id === 'terminal' ? `<tspan fill="${t.faint}">  </tspan>` : ''}${esc(ln)}</text>`;
  });

  // chips
  const cy = H - 46;
  let cx = x;
  const chips = (d.stack || []).slice(0, 9);
  for (const c of chips) {
    const label = t.id === 'terminal' ? c.toLowerCase() : c;
    const cw = textWidth(label, 11.5, 'mono') + 22;
    if (cx + cw > 600) break;
    const fill = { aurora: 'rgba(255,255,255,0.06)', broadcast: '#16161a', terminal: 'rgba(57,255,136,0.06)', paper: 'transparent', circuit: 'rgba(0,240,192,0.06)' }[t.id];
    const stroke = { aurora: 'rgba(255,255,255,0.12)', broadcast: '#2c2c33', terminal: '#1f5a33', paper: '#cfc8ba', circuit: '#145244' }[t.id];
    const rx = { aurora: 13, broadcast: 4, terminal: 3, paper: 13, circuit: 4 }[t.id];
    s += `<g class="fade"><rect x="${cx}" y="${cy - 17}" width="${cw}" height="26" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
    if (t.id === 'broadcast') s += `<rect x="${cx}" y="${cy - 17}" width="3" height="26" rx="1" fill="${t.accent2}"/>`;
    s += `<text x="${cx + cw / 2}" y="${cy}" text-anchor="middle" font-family="${MONO}" font-size="11.5" font-weight="500" fill="${t.id === 'paper' ? t.text : t.text}" opacity="${t.id === 'paper' ? 1 : 0.92}">${esc(label)}</text></g>`;
    cx += cw + 8;
  }

  s += bannerArt(t, d, W, H, T);
  return card(t, W, H, `${name} — GitHub profile banner`, s, { title: `${login}@github: ~` }, GROW);
}

function bannerArt(t, d, W, H, T) {
  const ax = 640, aw = W - ax - 34;
  const mx = ax + aw / 2, my = T + (H - T) / 2;
  if (t.id === 'aurora') {
    const rings = [92, 70, 48];
    let s = `<style>.orb{transform-box:view-box;transform-origin:${mx}px ${my}px;animation:orbit 16s linear infinite}.o2{animation-duration:11s;animation-direction:reverse}.o3{animation-duration:7s}@keyframes orbit{to{transform:rotate(360deg)}}</style>`;
    rings.forEach((r, i) => {
      s += `<circle cx="${mx}" cy="${my}" r="${r}" fill="none" stroke="url(#acc)" stroke-opacity="${0.18 + i * 0.12}" stroke-width="1"${i === 0 ? ' stroke-dasharray="2 6"' : ''}/>`;
    });
    s += `<g class="orb"><circle cx="${mx + 92}" cy="${my}" r="4.5" fill="#22d3ee" filter="url(#glow)"/></g>`;
    s += `<g class="orb o2"><circle cx="${mx}" cy="${my - 70}" r="3.5" fill="#f472b6" filter="url(#glow)"/></g>`;
    s += `<g class="orb o3"><circle cx="${mx - 48}" cy="${my}" r="3" fill="#a78bfa" filter="url(#glow)"/></g>`;
    s += `<circle cx="${mx}" cy="${my}" r="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>`;
    s += `<text x="${mx}" y="${my + 9}" text-anchor="middle" font-family="${SANS}" font-size="26" font-weight="750" fill="url(#acc)">${esc((d.displayName || d.login)[0].toUpperCase())}</text>`;
    return s;
  }
  if (t.id === 'broadcast') {
    const mw = 220, mh = 124, mx0 = W - 44 - mw, my0 = T + 62;
    const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    const bw = mw / 7;
    let s = '';
    // ON AIR box
    s += `<g class="tally"><rect x="${mx0 + mw - 92}" y="${T + 22}" width="92" height="26" rx="4" fill="#2a0806" stroke="#ff3b30" filter="url(#glow)"/>
<text x="${mx0 + mw - 46}" y="${T + 40}" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="800" letter-spacing="3" fill="#ff5a4f">ON AIR</text></g>`;
    s += `<rect x="${mx0 - 6}" y="${my0 - 6}" width="${mw + 12}" height="${mh + 12}" rx="6" fill="#111114" stroke="#2a2a31"/>`;
    bars.forEach((c, i) => (s += `<rect x="${(mx0 + i * bw).toFixed(2)}" y="${my0}" width="${(bw + 0.4).toFixed(2)}" height="${mh * 0.67}" fill="${c}"/>`));
    const rev = ['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'];
    rev.forEach((c, i) => (s += `<rect x="${(mx0 + i * bw).toFixed(2)}" y="${my0 + mh * 0.67}" width="${(bw + 0.4).toFixed(2)}" height="${mh * 0.08}" fill="${c}"/>`));
    const low = ['#00214c', '#ffffff', '#32006a', '#131313', '#090909', '#131313', '#1d1d1d'];
    const lw = mw / 7;
    low.forEach((c, i) => (s += `<rect x="${(mx0 + i * lw).toFixed(2)}" y="${my0 + mh * 0.75}" width="${(lw + 0.4).toFixed(2)}" height="${mh * 0.25}" fill="${c}"/>`));
    s += `<rect x="${mx0 + 8}" y="${my0 + 8}" width="38" height="16" rx="2" fill="#ff3b30"/><text x="${mx0 + 27}" y="${my0 + 20}" text-anchor="middle" font-family="${MONO}" font-size="10" font-weight="800" fill="#fff">PGM</text>`;
    const dt = new Date(d.generatedAt);
    const tc = [dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), Math.floor(dt.getUTCMilliseconds() / 40)].map((n) => String(n).padStart(2, '0')).join(':');
    s += `<text x="${mx0}" y="${my0 + mh + 26}" font-family="${MONO}" font-size="12" fill="${t.muted}">TC <tspan fill="${t.text}" font-weight="700">${tc}</tspan></text>`;
    s += `<text x="${mx0 + mw}" y="${my0 + mh + 26}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}"><tspan fill="${t.accent2}">●</tspan> SYNC</text>`;
    return s;
  }
  if (t.id === 'terminal') {
    const px = ax - 6, py = T + 40;
    const yrs = d.createdAt ? Math.max(1, new Date(d.generatedAt).getFullYear() - new Date(d.createdAt).getFullYear()) : null;
    const rows = [
      ['user', `${d.login}`],
      ['loc', d.location || 'earth'],
      ['uptime', yrs ? `${yrs} yrs on github` : 'since forever'],
      ['repos', fmt(d.stats.repos)],
      ['stars', fmt(d.stats.stars)],
      ['commits', `${fmt(d.stats.commits)} / 12mo`],
      ['shell', (d.languages[0] && d.languages[0].name.toLowerCase()) || 'zsh'],
    ];
    let s = `<text x="${px}" y="${py}" font-family="${MONO}" font-size="12" fill="${t.accent}" font-weight="700">${esc(d.login)}<tspan fill="${t.faint}">@</tspan>github</text>`;
    s += `<text x="${px}" y="${py + 14}" font-family="${MONO}" font-size="12" fill="${t.faint}">${'─'.repeat(Math.min(22, d.login.length + 7))}</text>`;
    rows.forEach(([k, v], i) => {
      s += `<text x="${px}" y="${py + 32 + i * 18}" font-family="${MONO}" font-size="12" fill="${t.accent2}">${esc(k)}<tspan x="${px + 66}" fill="${t.text}">${esc(truncate(v, 150, 12, 'mono'))}</tspan></text>`;
    });
    const sw = ['#0a3d1e', '#13662f', '#1fa85a', '#39ff88', '#9dffc4', '#d6ffdc'];
    sw.forEach((c, i) => (s += `<rect x="${px + i * 22}" y="${py + 32 + rows.length * 18 - 6}" width="20" height="10" fill="${c}"/>`));
    return s;
  }
  if (t.id === 'paper') {
    const cx = W - 140, cy = T + H / 2 - 4, r = 70;
    const txt = (d.stampText || 'open source · engineering · made with care · ').toUpperCase();
    let s = `<defs><path id="circ" d="M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0"/></defs>`;
    s += `<g class="stamp"><circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="none" stroke="${t.accent}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
<text font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="3.2" fill="${t.accent}"><textPath href="#circ" textLength="${(2 * Math.PI * r - 4).toFixed(1)}">${esc(txt)}</textPath></text></g>`;
    s += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="${t.display}" font-size="54" font-style="italic" fill="${t.accent}">${esc((d.displayName || d.login)[0].toUpperCase())}</text>`;
    s += `<line x1="${ax - 20}" y1="${T + 34}" x2="${ax - 20}" y2="${H - 30}" stroke="${t.border}"/>`;
    return s;
  }
  if (t.id === 'circuit') {
    const cw = 150, ch = 110, cx0 = W - 52 - cw, cy0 = T + (H - ch) / 2;
    let s = '';
    const pins = 7;
    for (let i = 0; i < pins; i++) {
      const py = cy0 + 14 + i * ((ch - 28) / (pins - 1));
      s += `<rect x="${cx0 - 12}" y="${py - 2.5}" width="12" height="5" fill="#9fb6ae"/><rect x="${cx0 + cw}" y="${py - 2.5}" width="12" height="5" fill="#9fb6ae"/>`;
      s += `<path d="M${cx0 - 12} ${py}H${cx0 - 40 - (i % 3) * 14}" stroke="#0d3a2f" stroke-width="2"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const px = cx0 + 20 + i * ((cw - 40) / 4);
      s += `<rect x="${px - 2.5}" y="${cy0 - 12}" width="5" height="12" fill="#9fb6ae"/><rect x="${px - 2.5}" y="${cy0 + ch}" width="5" height="12" fill="#9fb6ae"/>`;
    }
    s += `<rect x="${cx0}" y="${cy0}" width="${cw}" height="${ch}" rx="6" fill="#0b0f0e" stroke="#25332f"/>`;
    s += `<circle cx="${cx0 + 14}" cy="${cy0 + 14}" r="4" fill="#1a2421"/>`;
    s += `<text x="${cx0 + cw / 2}" y="${cy0 + ch / 2 - 4}" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="#cfe9e1">${esc(truncate(d.login.toUpperCase(), cw - 20, 13, 'mono'))}</text>`;
    s += `<text x="${cx0 + cw / 2}" y="${cy0 + ch / 2 + 14}" text-anchor="middle" font-family="${MONO}" font-size="10" fill="#5f7d74">SYNC ${esc(d.stamp || '')}</text>`;
    s += `<circle cx="${cx0 + cw - 16}" cy="${cy0 + ch - 16}" r="4" fill="${t.accent}" class="led" filter="url(#glow)"/>`;
    s += `<text x="${cx0 - 8}" y="${cy0 - 20}" font-family="${MONO}" font-size="10" fill="#4f8a7a">U0</text>`;
    return s;
  }
  return '';
}

/* ════════════════════════════ STATS ════════════════════════════ */
export function stats(t, d) {
  const T = top(t), W = 445, H = 215 + T;
  const st = d.stats;
  let s = t.label(L(t, 'stats'), 24, T + 34, 'CAM', W);

  // ring: active days in the last year
  const cx = 92, cy = T + 122, r = 52, sw = 9;
  const frac = clamp((st.activeDays || 0) / 365, 0, 1);
  const C = 2 * Math.PI * r;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.track}" stroke-width="${sw}"/>`;
  if (t.id === 'broadcast') {
    // segmented meter ring
    const segs = 36;
    for (let i = 0; i < segs; i++) {
      const a0 = -Math.PI / 2 + (i / segs) * 2 * Math.PI, a1 = a0 + (2 * Math.PI) / segs * 0.7;
      const on = i / segs < frac;
      const col = !on ? '#202026' : i / segs > 0.85 ? '#ff3b30' : i / segs > 0.62 ? '#ffb000' : '#30d158';
      const p = (a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
      s += `<path d="M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
    }
  } else {
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.ringStroke}" stroke-width="${sw}" stroke-linecap="${t.id === 'terminal' ? 'butt' : 'round'}" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})" class="ring"${t.id !== 'paper' ? ' filter="url(#glow)"' : ''}/>`;
  }
  const big = fmt(st.totalContributions);
  const fs = big.length > 4 ? 24 : 28;
  s += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="${t.id === 'paper' ? t.display : t.id === 'terminal' ? MONO : SANS}" font-size="${fs}" font-weight="${t.id === 'paper' ? 600 : 750}" fill="${t.numberFill}">${big}</text>`;
  s += `<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="${t.muted}">contrib / yr</text>`;
  s += `<text x="${cx}" y="${cy + r + 26}" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="${t.muted}">active <tspan fill="${t.text}" font-weight="700">${st.activeDays || 0}</tspan>/365 d</text>`;

  // Show the five strongest non-zero figures; empty ones make way for others.
  const rows = [
    ['star', 'Stars earned', st.stars],
    ['commit', 'Commits · 12 mo', st.commits],
    ['pr', 'Pull requests', st.prs],
    ['issue', 'Issues', st.issues],
    ['repo', 'Contributed to', st.contributedTo],
    ['repo', 'Repositories', st.repos],
    ['people', 'Followers', st.followers],
  ].filter((r) => r[2] > 0).slice(0, 5);
  const rx = 188, rw = W - 24 - rx;
  rows.forEach(([ic, label, val], i) => {
    const y = T + 72 + i * 27;
    const col = [t.accent3, t.accent, t.accent2, t.accent, t.accent2][i];
    if (t.id === 'terminal') {
      const key = label.toLowerCase().replace(/ · /g, '_').replace(/\s+/g, '_');
      const v = fmt(val);
      const dots = Math.max(2, Math.floor((rw - textWidth(key + v, 12, 'mono')) / 7.3) - 1);
      s += `<text x="${rx}" y="${y}" font-family="${MONO}" font-size="12" fill="${t.accent2}">${esc(key)}<tspan fill="${t.faint}"> ${'.'.repeat(dots)} </tspan><tspan fill="${t.text}" font-weight="700">${v}</tspan></text>`;
    } else {
      s += icon(ic, rx, y - 12, col, 15, 1.5);
      s += `<text x="${rx + 24}" y="${y}" font-family="${t.font}" font-size="13" fill="${t.muted}">${esc(label)}</text>`;
      s += `<text x="${W - 24}" y="${y}" text-anchor="end" font-family="${t.id === 'paper' ? MONO : SANS}" font-size="14" font-weight="700" fill="${t.text}">${fmt(val)}</text>`;
      if (i < rows.length - 1 && (t.id === 'paper' || t.id === 'broadcast'))
        s += `<line x1="${rx}" y1="${y + 9}" x2="${W - 24}" y2="${y + 9}" stroke="${t.border}" ${t.id === 'paper' ? 'stroke-dasharray="1 3"' : ''}/>`;
    }
  });
  const css = `.ring{animation:ring 1.4s cubic-bezier(.2,.8,.2,1) both}@keyframes ring{from{stroke-dasharray:0 ${C.toFixed(1)}}}`;
  return card(t, W, H, `${d.login} GitHub stats`, s, { title: '~/stats' }, css + GROW);
}

/* ═══════════════════════════ LANGUAGES ═══════════════════════════ */
export function languages(t, d) {
  const T = top(t), W = 445, H = 215 + T;
  const langs = d.languages.slice(0, 6);
  const total = langs.reduce((a, l) => a + l.size, 0) || 1;
  let s = t.label(L(t, 'langs'), 24, T + 34, 'CAM', W);

  const bx = 24, by = T + 56, bw = W - 48, bh = t.id === 'paper' ? 8 : 10;
  s += `<defs><clipPath id="barclip"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${t.id === 'terminal' || t.id === 'broadcast' ? 2 : bh / 2}"/></clipPath></defs>`;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bh / 2}" fill="${t.track}"/>`;
  let acc = 0;
  s += `<g clip-path="url(#barclip)" class="sweep">`;
  langs.forEach((l, i) => {
    const w = (l.size / total) * bw;
    s += `<rect x="${(bx + acc).toFixed(2)}" y="${by}" width="${Math.max(0, w - (i < langs.length - 1 ? 2 : 0)).toFixed(2)}" height="${bh}" fill="${langColor(t, l, i)}"/>`;
    acc += w;
  });
  s += `</g>`;

  const colW = (W - 48) / 2;
  langs.forEach((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 24 + col * (colW + 0), y = T + 104 + row * 34;
    const pct = ((l.size / total) * 100).toFixed(1) + '%';
    const c = langColor(t, l, i);
    if (t.id === 'terminal') s += `<rect x="${x}" y="${y - 10}" width="10" height="10" fill="${c}"/>`;
    else if (t.id === 'broadcast') s += `<rect x="${x}" y="${y - 10}" width="4" height="12" rx="1" fill="${c}"/>`;
    else s += `<circle cx="${x + 5}" cy="${y - 4.5}" r="5" fill="${c}"${t.id === 'aurora' || t.id === 'circuit' ? ' filter="url(#glow)"' : ''}/>`;
    s += `<text x="${x + 18}" y="${y}" font-family="${t.font}" font-size="13" font-weight="600" fill="${t.text}">${esc(truncate(l.name, colW - 80, 13, body(t)))}</text>`;
    s += `<text x="${x + colW - 16}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">${pct}</text>`;
  });
  if (!langs.length) s += `<text x="24" y="${T + 110}" font-family="${t.font}" font-size="13" fill="${t.muted}">No public code yet.</text>`;
  const css = `.sweep{animation:sweep 1.2s cubic-bezier(.2,.8,.2,1) both}@keyframes sweep{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}`;
  return card(t, W, H, `${d.login} top languages`, s, { title: '~/languages' }, css);
}

/* ════════════════════════════ ACTIVITY ═══════════════════════════ */
export function activity(t, d) {
  const T = top(t), W = 900, H = 200 + T;
  const weeks = d.weeks.slice(-52);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  let s = t.label(L(t, 'activity'), 24, T + 34, 'PGM', 0);

  // header stats (right aligned)
  const best = Math.max(0, ...weeks.map((w) => w.count));
  const items = [
    ['Current streak', `${d.stats.currentStreak || 0} d`],
    ['Longest', `${d.stats.longestStreak || 0} d`],
    ['Best week', `${best}`],
  ];
  let hx = W - 24;
  for (let i = items.length - 1; i >= 0; i--) {
    const [k, v] = items[i];
    const vw = textWidth(v, 13, 'mono');
    s += `<text x="${hx}" y="${T + 34}" text-anchor="end" font-family="${MONO}" font-size="13" font-weight="700" fill="${t.text}">${esc(v)}</text>`;
    hx -= vw + 7;
    s += `<text x="${hx}" y="${T + 34}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${t.muted}">${esc(t.id === 'terminal' ? k.toLowerCase().replace(' ', '_') + '=' : k)}</text>`;
    hx -= textWidth(k, 11, 'mono') + (i === 0 ? 0 : 22);
    if (i === 0 && t.id !== 'terminal') s += icon('flame', hx - 18, T + 22, t.accent2 === '#30d158' ? t.accent3 : t.accent2, 14, 1.4);
  }

  const x0 = 24, x1 = W - 24, yb = H - 34, ytop = T + 58;
  const ch = yb - ytop;
  const step = (x1 - x0) / weeks.length;
  const bw = Math.max(3, step * (t.bars === 'trace' ? 0.18 : t.bars === 'ink' ? 0.42 : 0.62));
  const bestIdx = weeks.findIndex((w) => w.count === best);

  if (t.bars === 'ink') {
    [0.25, 0.5, 0.75].forEach((f) => (s += `<line x1="${x0}" y1="${(yb - ch * f).toFixed(1)}" x2="${x1}" y2="${(yb - ch * f).toFixed(1)}" stroke="${t.border}" stroke-dasharray="1 4"/>`));
  }

  weeks.forEach((w, i) => {
    const cx = x0 + step * i + step / 2;
    const v = w.count / max;
    const h = Math.max(w.count ? 3 : 0, v * ch);
    const delay = `style="animation-delay:${i * 14}ms"`;
    if (t.bars === 'gradient') {
      if (!w.count) s += `<circle cx="${cx.toFixed(1)}" cy="${yb - 1.5}" r="1.5" fill="${t.track}"/>`;
      else s += `<rect class="grow" ${delay} x="${(cx - bw / 2).toFixed(1)}" y="${(yb - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(bw / 2, 4).toFixed(1)}" fill="url(#accV)" opacity="${(0.45 + 0.55 * v).toFixed(2)}"/>`;
    } else if (t.bars === 'segmented') {
      const segH = 5, gap = 2, n = Math.floor(ch / (segH + gap));
      const lit = Math.round(v * n);
      s += `<g class="grow" ${delay}>`;
      for (let k = 0; k < n; k++) {
        const f = k / n;
        const col = k >= lit ? '#18181c' : f > 0.85 ? '#ff3b30' : f > 0.62 ? '#ffb000' : '#30d158';
        s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(yb - (k + 1) * (segH + gap) + gap).toFixed(1)}" width="${bw.toFixed(1)}" height="${segH}" rx="1" fill="${col}"/>`;
      }
      s += `</g>`;
    } else if (t.bars === 'block') {
      const lv = Math.round(v * 8);
      const hh = (lv / 8) * ch;
      if (!lv) s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${yb - 2}" width="${bw.toFixed(1)}" height="2" fill="${t.faint}"/>`;
      else s += `<rect class="grow" ${delay} x="${(cx - bw / 2).toFixed(1)}" y="${(yb - hh).toFixed(1)}" width="${bw.toFixed(1)}" height="${hh.toFixed(1)}" fill="${t.accent}" opacity="${(0.35 + 0.65 * v).toFixed(2)}" filter="url(#glow)"/>`;
    } else if (t.bars === 'ink') {
      const c = i === bestIdx ? t.accent2 : t.text;
      if (w.count) s += `<rect class="grow" ${delay} x="${(cx - bw / 2).toFixed(1)}" y="${(yb - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${c}"/>`;
    } else if (t.bars === 'trace') {
      if (!w.count) s += `<circle cx="${cx.toFixed(1)}" cy="${yb}" r="1.6" fill="${t.faint}"/>`;
      else {
        const col = v > 0.66 ? t.accent2 : t.accent;
        s += `<g class="grow" ${delay}><line x1="${cx.toFixed(1)}" y1="${yb}" x2="${cx.toFixed(1)}" y2="${(yb - h).toFixed(1)}" stroke="${col}" stroke-width="2" opacity=".65"/><circle cx="${cx.toFixed(1)}" cy="${(yb - h).toFixed(1)}" r="3.2" fill="${t.bg}" stroke="${col}" stroke-width="1.8"${v > 0.5 ? ' filter="url(#glow)"' : ''}/></g>`;
      }
    }
  });

  // baseline + month labels
  s += `<line x1="${x0}" y1="${yb + 0.5}" x2="${x1}" y2="${yb + 0.5}" stroke="${t.id === 'paper' ? t.text : t.border}" stroke-width="${t.id === 'paper' ? 1 : 1}"/>`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let last = -1;
  weeks.forEach((w, i) => {
    const m = new Date(w.start + 'T00:00:00Z').getUTCMonth();
    if (m !== last) {
      if (last !== -1 || i < 2) {
        const lx = x0 + step * i + 1;
        if (lx < x1 - 24) s += `<text x="${lx.toFixed(1)}" y="${yb + 18}" font-family="${MONO}" font-size="10" fill="${t.muted}">${t.id === 'broadcast' ? MONTHS[m].toUpperCase() : t.id === 'terminal' ? MONTHS[m].toLowerCase() : MONTHS[m]}</text>`;
      }
      last = m;
    }
  });
  return card(t, W, H, `${d.login} contribution activity`, s, { title: '~/activity' }, GROW);
}

/* ═════════════════════════════ REPO ═════════════════════════════ */
export function repo(t, d, r, i = 0) {
  const T = top(t), W = 445, H = 150 + T;
  let s = t.label(L(t, 'repo').replace('J1', 'J' + (i + 1)), 24, T + 32, 'VTR', W);
  const nameFam = body(t);
  const nm = t.id === 'terminal' ? `~/${r.name}` : r.name;
  s += icon('repo', 24, T + 49, t.accent, 16, 1.5);
  s += `<text x="48" y="${T + 63}" font-family="${t.id === 'paper' ? t.display : t.font}" font-size="${t.id === 'paper' ? 20 : 17}" font-weight="700" fill="${t.text}">${esc(truncate(nm, W - 80, 17, nameFam))}</text>`;
  const lines = wrap(r.description || 'No description provided.', W - 48, 12.5, nameFam, 2);
  lines.forEach((ln, i) => (s += `<text x="24" y="${T + 88 + i * 18}" font-family="${t.font}" font-size="12.5" fill="${t.muted}">${esc(ln)}</text>`));

  const by = H - 18;
  let x = 24;
  if (r.language) {
    const c = t.langTint ? t.accent : r.languageColor || '#8b949e';
    s += `<circle cx="${x + 5}" cy="${by - 4}" r="5" fill="${c}"/>`;
    s += `<text x="${x + 16}" y="${by}" font-family="${t.font}" font-size="12" fill="${t.muted}">${esc(r.language)}</text>`;
    x += 26 + textWidth(r.language, 12, nameFam);
  }
  s += icon('star', x, by - 12, t.accent3, 14, 1.4);
  s += `<text x="${x + 19}" y="${by}" font-family="${MONO}" font-size="12" fill="${t.text}">${fmt(r.stars)}</text>`;
  x += 30 + textWidth(fmt(r.stars), 12, 'mono');
  s += icon('fork', x, by - 12, t.muted, 14, 1.4);
  s += `<text x="${x + 19}" y="${by}" font-family="${MONO}" font-size="12" fill="${t.text}">${fmt(r.forks)}</text>`;
  if (r.updated) {
    s += `<text x="${W - 24}" y="${by}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${t.faint}">upd ${esc(r.updated.slice(0, 10))}</text>`;
  }
  return card(t, W, H, `${r.name} repository`, s, { title: `~/${r.name}` });
}
