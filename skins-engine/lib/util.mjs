// Small helpers shared by all cards. No dependencies.

export const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const SANS =
  "'Inter','Segoe UI Variable','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const MONO =
  "'JetBrains Mono','SF Mono','Cascadia Code',Menlo,Consolas,'Liberation Mono',monospace";
export const SERIF = "'Iowan Old Style','Charter','Georgia','Times New Roman',serif";

// Rough glyph-width model so we can truncate / wrap without a font engine.
export function textWidth(str, size, family = 'sans') {
  const k = family === 'mono' ? 0.61 : family === 'serif' ? 0.52 : 0.555;
  let w = 0;
  for (const ch of String(str)) {
    if ('ilI.,:;|!\'`'.includes(ch)) w += 0.5;
    else if ('mwMW@'.includes(ch)) w += 1.45;
    else if (ch === ' ') w += 0.55;
    else if (/[A-Z0-9]/.test(ch)) w += 1.15;
    else w += 1;
  }
  return family === 'mono' ? String(str).length * k * size : w * k * size;
}

export function truncate(str, maxW, size, family) {
  str = String(str ?? '');
  if (textWidth(str, size, family) <= maxW) return str;
  while (str.length > 1 && textWidth(str + '…', size, family) > maxW) str = str.slice(0, -1);
  return str.trimEnd() + '…';
}

export function wrap(str, maxW, size, family, maxLines = 2) {
  const words = String(str ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (textWidth(next, size, family) <= maxW) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  if (lines.length === maxLines) {
    const used = lines.join(' ').split(/\s+/).length;
    if (used < words.length) lines[maxLines - 1] = truncate(lines[maxLines - 1] + ' …', maxW, size, family);
  }
  return lines.slice(0, maxLines).map((l) => l.replace(/^[·|•–-]\s*/, '').replace(/\s*[·|•–-]$/, ''));
}

export function fmt(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(0) + 'k';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Deterministic pseudo-random so decorative noise is stable between runs
// (otherwise every daily build would produce a diff).
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function hashStr(str) {
  let h = 2166136261;
  for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Tiny 16px icon set (stroke icons, drawn in a 16x16 box).
export const ICONS = {
  star: 'M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z',
  commit: 'M8 5.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM1 8h4.2M10.8 8H15',
  pr: 'M4 3.5v9M4 3.5a1.6 1.6 0 1 0 0-.01M4 12.5a1.6 1.6 0 1 0 0 .01M12 12.5a1.6 1.6 0 1 0 0 .01M12 11V6.5c0-1.4-1-2.5-2.5-2.5H7.5M9 2.5L7.5 4 9 5.5',
  issue: 'M8 1.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 8 1.8zM8 7.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z',
  repo: 'M3 2.5h8.5a1 1 0 0 1 1 1v9.5H4.5A1.5 1.5 0 0 1 3 11.5zM3 11.5A1.5 1.5 0 0 1 4.5 10h8',
  people: 'M6 7.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM1.8 13.5c.4-2.3 2.1-3.7 4.2-3.7s3.8 1.4 4.2 3.7M11 3a2.1 2.1 0 0 1 0 4.2M12.2 9.9c1.2.5 1.9 1.7 2.1 3.2',
  fork: 'M4.5 3a1.5 1.5 0 1 0 0 .01M11.5 3a1.5 1.5 0 1 0 0 .01M8 13a1.5 1.5 0 1 0 0 .01M4.5 4.5v1.2c0 1 .8 1.8 1.8 1.8h3.4c1 0 1.8-.8 1.8-1.8V4.5M8 7.5v4',
  pin: 'M8 14.5s4.8-4.3 4.8-8a4.8 4.8 0 0 0-9.6 0c0 3.7 4.8 8 4.8 8zM8 4.8a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z',
  flame: 'M8 14.5c2.6 0 4.5-1.8 4.5-4.4 0-3.4-3.1-4.6-3.6-8.1-1.9 1.4-2.6 3.4-2.4 5-1-.3-1.7-1.2-1.9-2.2-1.3 1.2-1.6 2.6-1.6 3.7 0 3.4 2.1 6 5 6z',
};

export function icon(name, x, y, color, size = 14, sw = 1.4) {
  const s = size / 16;
  return `<path d="${ICONS[name]}" transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw / s}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function svgDoc(w, h, title, body, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
${css}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
${body}
</svg>
`;
}
