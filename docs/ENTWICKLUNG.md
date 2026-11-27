# Entwicklung

[← Zurück zur README](../README.md)

## Lokale Umgebung

- Node.js installieren, keine Abhängigkeiten nötig.
- Mit Demo-Daten arbeiten: `node skins-engine/build.mjs --demo`
- Generierte SVGs im Browser öffnen (`skins/<skin>/*.svg`).
- Eigene Config testen: `node skins-engine/build.mjs --demo --config pfad/zur/config.json`

## Code-Struktur

- `build.mjs`: Ablauf, Varianten (`VARIANTS` mit Farbtabelle), Demo-Daten.
- `lib/themes.mjs`: neuen Skin als Objekt (Tokens, `frame`, `label`, optional `overlay`) anlegen und in `THEMES` eintragen; Labels in `LABELS` (`cards.mjs`) ergänzen und Banner-Sonderfälle in `banner`/`bannerArt` berücksichtigen.
- Neue Farbvariante: Eintrag in `VARIANTS` mit `base` und Farbmapping.
- `lib/fg.mjs`: eigenständiges Design mit eingebetteten Fonts.

## Neuen Skin hinzufügen

1. Theme in `themes.mjs` definieren.
2. Labels und Banner-Kicker/Chip-Farben in `cards.mjs` ergänzen.
3. Skin-Namen in `skins.config.json` unter `skins` aufnehmen.
4. Mit `--demo` rendern und Ergebnis prüfen.

## Tests

Es sind keine automatisierten Tests vorhanden. Empfehlung: Demo-Lauf (`--demo`) und Sichtprüfung; ggf. Snapshot-Tests der SVGs ergänzen (Vorschlag).

## Coding-Standards (aus dem Code abgeleitet)

- ES Modules, `.mjs`, keine externen Pakete
- Kommentare auf Englisch, knapper Stil
- Alle Texte in SVG über `esc()` escapen
- Deterministische Dekoration über `rng`/`hashStr`, damit keine Zufalls-Diffs entstehen
- Animationen respektieren `prefers-reduced-motion`

## Release-Ablauf

Es gibt keine Versionierung. Änderungen auf `main` pushen; bei Änderungen an `skins-engine/**` oder der Config rendert der Workflow neu und committet `skins/` (Commit-Nachricht `chore(skins): refresh profile cards [skip ci]`).
