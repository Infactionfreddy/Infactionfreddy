#!/usr/bin/env node
// Usage:
//   node skins-engine/build.mjs                 → live data (needs GITHUB_TOKEN)
//   node skins-engine/build.mjs --demo          → demo data, no network
//   node skins-engine/build.mjs --config path   → custom config file
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { THEMES, THEME_IDS } from './lib/themes.mjs';
import * as cards from './lib/cards.mjs';
import { fetchProfile, streaks } from './lib/fetch.mjs';
import { rng } from './lib/util.mjs';
import * as fg from './lib/fg.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, def) => (args.includes(n) ? args[args.indexOf(n) + 1] : def);

const cfgPath = resolve(opt('--config', 'skins.config.json'));
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const root = dirname(cfgPath);
const outDir = resolve(root, cfg.output || 'skins');

// Colour variants: render a base skin, then swap its palette in the output.
const VARIANTS = {
  'circuit-violet': {
    base: 'circuit',
    map: {
      '#00f0c0': '#a855f7', '#7dffe4': '#d8b4fe', '#ff4fa3': '#e879f9', '#ffd23f': '#c4b5fd',
      '#04110e': '#050308', '#e3fff6': '#f3eefe', '#7fb8a6': '#a396bd', '#2f6153': '#4a3d63',
      '#0f3a30': '#2a1a42', '#0b2a23': '#1c1230', '#062019': '#150a26', '#030c0a': '#030205',
      '#0d3a2f': '#25163c', '#13574a': '#3d2663', '#14493d': '#36214f', '#145244': '#3a2458',
      '#9fb6ae': '#b6a8cc', '#0b0f0e': '#0b0810', '#25332f': '#2f2344', '#1a2421': '#1e1629',
      '#cfe9e1': '#ede5fb', '#5f7d74': '#8a7ca6', '#4f8a7a': '#7e6aa0',
      'rgba(0,240,192,0.06)': 'rgba(168,85,247,0.08)', 'rgba(0,240,192,0.04)': 'rgba(168,85,247,0.05)',
    },
  },
};
const recolor = (svg, map) => Object.entries(map).reduce((a, [k, v]) => a.split(k).join(v).split(k.toUpperCase()).join(v), svg);
const ALL = [...fg.FG_SKINS, ...Object.keys(VARIANTS), ...THEME_IDS];
const wanted = (cfg.skins === 'all' || !cfg.skins ? ALL : cfg.skins).filter((s) => {
  if (!ALL.includes(s)) console.warn(`! unknown skin "${s}" (available: ${ALL.join(', ')})`);
  return ALL.includes(s);
});

let data;
if (flag('--demo')) data = demoData(cfg);
else {
  const token = process.env.SKINS_TOKEN || process.env.GITHUB_TOKEN;
  data = await fetchProfile(cfg.user, token, cfg);
}

// Config overrides win over API values.
data.displayName = cfg.displayName || data.name || data.login;
data.tagline = cfg.tagline || data.bio || '';
data.location = cfg.location ?? data.location;
data.stack = cfg.stack || data.languages.slice(0, 6).map((l) => l.name);
data.stampText = cfg.stampText;
data.generatedAt = new Date().toISOString();

const written = [];
for (const id of wanted) {
  const dir = join(outDir, id);
  mkdirSync(dir, { recursive: true });
  let out;
  if (fg.FG_SKINS.includes(id)) {
    const t = fg.fgTheme(id === 'fg' ? 'dark' : 'light', cfg.fg?.accent);
    out = {
      'banner.svg': fg.banner(t, data, cfg),
      'capabilities.svg': fg.capabilities(t, data, cfg),
      'stats.svg': fg.stats(t, data),
      'languages.svg': fg.languages(t, data),
      'activity.svg': fg.activity(t, data),
    };
    data.pins.slice(0, cfg.maxPins ?? 2).forEach((r, i) => (out[`repo-${i + 1}.svg`] = fg.repo(t, data, r, i)));
  } else {
  const variant = VARIANTS[id];
  const t = THEMES[variant ? variant.base : id];
  out = {
    'banner.svg': cards.banner(t, data),
    'stats.svg': cards.stats(t, data),
    'languages.svg': cards.languages(t, data),
    'activity.svg': cards.activity(t, data),
  };
  data.pins.slice(0, cfg.maxPins ?? 2).forEach((r, i) => (out[`repo-${i + 1}.svg`] = cards.repo(t, data, r, i)));
  if (variant) for (const f in out) out[f] = recolor(out[f], variant.map);
  }
  for (const [f, svg] of Object.entries(out)) {
    writeFileSync(join(dir, f), svg);
    written.push(`${id}/${f}`);
  }
}
writeFileSync(join(outDir, 'data.json'), JSON.stringify({ ...data, generatedAt: undefined }, null, 2));
console.log(`✓ ${written.length} cards → ${outDir}\n  ${wanted.join(', ')}`);

function demoData(cfg) {
  const rand = rng(42);
  const days = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 363 - start.getUTCDay());
  for (let i = 0; i < 364 + new Date().getUTCDay() + 1; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const season = 0.55 + 0.45 * Math.sin(i / 38) + (i > 250 ? 0.6 : 0);
    const weekend = [0, 6].includes(d.getUTCDay()) ? 1.3 : 1;
    const c = rand() < 0.3 ? 0 : Math.round(rand() * 6 * season * weekend);
    days.push({ date: d.toISOString().slice(0, 10), contributionCount: c });
  }
  for (let i = days.length - 9; i < days.length; i++) days[i].contributionCount ||= 2;
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    weeks.push({ start: chunk[0].date, count: chunk.reduce((a, d) => a + d.contributionCount, 0) });
  }
  const { current, longest, active } = streaks(days);
  return {
    login: cfg.user,
    name: cfg.displayName,
    bio: null,
    location: 'Berlin',
    createdAt: '2019-03-01T00:00:00Z',
    stats: {
      stars: 34, repos: 33, followers: 1, commits: 1187, prs: 64, issues: 37, contributedTo: 12,
      totalContributions: days.reduce((a, d) => a + d.contributionCount, 0),
      activeDays: active, currentStreak: current, longestStreak: longest,
    },
    languages: [
      { name: 'C', color: '#555555', size: 520000 },
      { name: 'Python', color: '#3572A5', size: 260000 },
      { name: 'C++', color: '#f34b7d', size: 140000 },
      { name: 'Rust', color: '#dea584', size: 90000 },
      { name: 'Shell', color: '#89e051', size: 40000 },
      { name: 'PowerShell', color: '#012456', size: 25000 },
    ],
    weeks: weeks.slice(-52),
    pins: [
      { name: 'klipper-for-cnc', description: 'Klipper fork with CNC M-Code support (M0/M1/M2/M30) - ISO 6983 compliant program control', stars: 12, forks: 2, language: 'C', languageColor: '#555555', updated: '2026-10-21' },
      { name: 'moonraker-for-cnc', description: 'Moonraker fork with CNC M30 handler - ISO 6983 compliant program control for repeated cycles', stars: 6, forks: 1, language: 'Python', languageColor: '#3572A5', updated: '2026-10-19' },
    ],
  };
}
