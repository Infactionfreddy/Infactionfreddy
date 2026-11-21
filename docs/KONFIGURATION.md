# Konfiguration

[← Zurück zur README](../README.md)

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `GITHUB_TOKEN` | ja (ohne `--demo`) | Fallback-Token für die GraphQL-API |
| `SKINS_TOKEN` | nein | Hat Vorrang vor `GITHUB_TOKEN`; aktiviert bei `includePrivate: "auto"` private Daten |

## CLI-Optionen

| Option | Wirkung |
|---|---|
| `--demo` | Beispieldaten, kein Netzwerk |
| `--config <pfad>` | Alternative Konfigurationsdatei (Standard `skins.config.json`); Ausgabe relativ zu deren Ordner |

## `skins.config.json`

| Schlüssel | Beschreibung |
|---|---|
| `user` | GitHub-Login |
| `displayName` | Anzeigename (überschreibt API-Name) |
| `tagline` | Untertitel (überschreibt Bio) |
| `location` | Ort |
| `stack` | Liste der Chips im Banner |
| `skins` | Liste der Skins oder `"all"` |
| `pins` | Namen der hervorgehobenen Repos |
| `maxPins` | Anzahl Projekt-Karten (Standard 2) |
| `excludeLanguages` | Sprachen, die ausgeblendet werden |
| `excludeRepos` | Repos, die bei Sprachstatistik ignoriert werden |
| `includePrivate` | `"auto"` (an, wenn `SKINS_TOKEN` gesetzt), sonst boolesch |
| `includeForks` | Forks einbeziehen |
| `languageWeighting` | `perRepo` (Standard) oder `bytes` |
| `stampText` | Rundtext im `paper`-Skin |
| `timezone` | Zeitzone für Datumsstempel (Standard `Europe/Berlin`) |
| `output` | Ausgabeordner (Standard `skins`) |

### Abschnitt `fg`

| Schlüssel | Beschreibung |
|---|---|
| `accent` | Akzentfarbe (Hex) |
| `eyebrow` | Kleine Überschrift im Banner |
| `headline` | Array von Headline-Wörtern (letztes erhält Akzent) |
| `brandWord` | Wort neben dem „FG“-Logo |
| `ctaPrimary`, `ctaGhost` | Button-Texte |
| `website` | Website-URL (in der Config vorhanden; im gezeigten Code nicht ausgewertet) |
| `heroCode` | Zeilen des Code-Overlays |
| `capabilities` | Bis zu 5 Kompetenzkarten (`icon`, `title`, `items`) |
| `tagline` | Banner-Text der FG-Skins |

Icons: `chip`, `code`, `wave`, `box`, `pen`.

## Verfügbare Skins

`fg`, `fg-light`, `circuit-violet`, `circuit`, `aurora`, `broadcast`, `terminal`, `paper`. Unbekannte Namen erzeugen eine Warnung.

## Hooks/Filter

Nicht vorhanden.

## Workflow-Trigger

| Trigger | Details |
|---|---|
| `schedule` | `17 */3 * * *` |
| `workflow_dispatch` | manuell |
| `push` auf `main` | bei Änderung von `skins.config.json` oder `skins-engine/**` |
