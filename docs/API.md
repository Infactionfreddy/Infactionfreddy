# API / Schnittstellen

[← Zurück zur README](../README.md)

Es gibt keine HTTP-API. Dokumentiert sind CLI und interne Module.

## CLI

```
node skins-engine/build.mjs [--demo] [--config <pfad>]
```

Schreibt `<output>/<skin>/*.svg` und `<output>/data.json`.

## Erzeugte Dateien

| Datei | Skins |
|---|---|
| `banner.svg`, `stats.svg`, `languages.svg`, `activity.svg` | alle |
| `repo-1.svg`, `repo-2.svg` | alle (gemäß `maxPins`) |
| `capabilities.svg` | nur `fg`, `fg-light` |
| `data.json` | Datenstand im Ausgabeordner |

## Externe Schnittstelle

GitHub GraphQL: `POST https://api.github.com/graphql` mit `Authorization: bearer <token>`. Abgefragt werden Profil, Follower, PRs, Issues, Repos (inkl. Sprachen), Pins und Contribution-Kalender.

## Module

### `lib/fetch.mjs`

- `fetchProfile(login, token, cfg)` → Profildaten (`stats`, `languages`, `weeks`, `pins`, …); wirft Fehler ohne Token, bei API-Fehlern oder unbekanntem Nutzer.
- `streaks(days)` → `{ current, longest, active }`.

### `lib/cards.mjs`

`banner(t, d)`, `stats(t, d)`, `languages(t, d)`, `activity(t, d)`, `repo(t, d, r, i)` – liefern SVG-Strings.

### `lib/fg.mjs`

`fgTheme(mode, accent)`, `banner(t, d, cfg)`, `capabilities(t, d, cfg)`, `stats`, `languages`, `activity`, `repo`, Konstante `FG_SKINS`.

### `lib/themes.mjs`

`THEMES` (aurora, broadcast, terminal, paper, circuit) und `THEME_IDS`.

### `lib/util.mjs`

`esc`, `textWidth`, `truncate`, `wrap`, `fmt`, `clamp`, `rng`, `hashStr`, `icon`, `svgDoc`, Konstanten `SANS`, `MONO`, `SERIF`, `ICONS`.
