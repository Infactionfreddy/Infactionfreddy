# Infactionfreddy – Profile Skins

![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Profil-README von Freddy (Elektrotechnik-Student aus Berlin). Ein dependency-freier Node.js-Generator (`skins-engine`) rendert aus der GitHub-GraphQL-API animierte SVG-Karten (Banner, Statistiken, Sprachen, Aktivität, Projekte) in mehreren Designs („Skins“).

## Features

- 8 Skins: `circuit-violet` (aktuell in der README), `circuit`, `fg`, `fg-light`, `aurora`, `broadcast`, `terminal`, `paper`
- Karten: Banner, Stats, Sprachen, Aktivität (52 Wochen), bis zu 2 Projekt-Karten, bei `fg`/`fg-light` zusätzlich Kompetenzen
- Live-Daten per GitHub GraphQL API, optional inkl. privater Beiträge (nur als Zahlen)
- Demo-Modus ohne Netzwerk (`--demo`)
- Automatische Aktualisierung alle 3 Stunden per GitHub Actions
- Eingebettete Font-Subsets bei den FG-Skins, deterministische Dekoration (keine unnötigen Diffs)
- Konfiguration komplett über `skins.config.json`

## Tech-Stack

- JavaScript (ES Modules, `.mjs`), Node.js 24, keine externen npm-Abhängigkeiten
- GitHub GraphQL API, GitHub Actions
- Ausgabe: statische SVG-Dateien und `skins/data.json`

## Schnellstart

**Voraussetzungen:** Node.js (CI nutzt 24; ab Version mit globalem `fetch` und Top-Level-`await`, Annahme ≥ 18), Git, für Live-Daten ein GitHub-Token.

```bash
git clone https://github.com/Infactionfreddy/Infactionfreddy.git
cd Infactionfreddy

# Demo ohne Netzwerk
node skins-engine/build.mjs --demo

# Live-Daten
export GITHUB_TOKEN=<dein-token>
node skins-engine/build.mjs
```

Die Karten landen in `skins/<skin>/*.svg`. Welcher Skin in der README angezeigt wird, steht in `README.md` (Pfad `skins/circuit-violet/...` ersetzen). Siehe auch `SKINS.md`.

## Konfiguration

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `GITHUB_TOKEN` | ja (Live-Modus) | Token für die GraphQL-API; in Actions `github.token` |
| `SKINS_TOKEN` | nein | Persönliches Token; schaltet private Repos/Beiträge frei (nur Zahlen) |

Weitere Einstellungen (Nutzer, Skins, Pins, Farben, Texte) in `skins.config.json` – Details in [docs/KONFIGURATION.md](docs/KONFIGURATION.md).

## Projektstruktur

```
.github/workflows/profile-skins.yml  CI: Karten rendern und committen
skins-engine/build.mjs               Einstiegspunkt / CLI
skins-engine/lib/fetch.mjs           GraphQL-Abfrage, Streaks, Aggregation
skins-engine/lib/cards.mjs           Renderer für Standard-Skins
skins-engine/lib/themes.mjs          Skin-Definitionen (aurora, broadcast, terminal, paper, circuit)
skins-engine/lib/fg.mjs              Renderer für fg / fg-light
skins-engine/lib/util.mjs            Hilfsfunktionen (Escape, Textbreite, Icons, SVG)
skins-engine/fonts/fg-fonts.mjs      Eingebettete Font-Subsets
skins.config.json                    Konfiguration
skins/                               Generierte SVGs + data.json
SKINS.md                             Skin-Übersicht
```

## Dokumentation

- [Architektur](docs/ARCHITEKTUR.md)
- [Installation](docs/INSTALLATION.md)
- [Konfiguration](docs/KONFIGURATION.md)
- [Entwicklung](docs/ENTWICKLUNG.md)
- [API / Schnittstellen](docs/API.md)
