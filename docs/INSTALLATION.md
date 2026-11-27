# Installation

[← Zurück zur README](../README.md)

## Voraussetzungen

- Node.js (CI: Version 24; Annahme: ab 18 lauffähig wegen `fetch` und Top-Level-`await`)
- Git
- Für Live-Daten: GitHub-Token (`GITHUB_TOKEN`, optional `SKINS_TOKEN`)

Es ist keine `npm install` nötig; es gibt keine `package.json`.

## Schritt für Schritt

1. Repository klonen:
   ```bash
   git clone https://github.com/Infactionfreddy/Infactionfreddy.git
   cd Infactionfreddy
   ```
2. Konfiguration in `skins.config.json` anpassen (mindestens `user`).
3. Test ohne Netzwerk:
   ```bash
   node skins-engine/build.mjs --demo
   ```
4. Live-Lauf:
   ```bash
   export GITHUB_TOKEN=<token>
   node skins-engine/build.mjs
   ```
5. Skin in der `README.md` auswählen (Pfad `skins/<skin>/...`).

## Als eigenes Profil nutzen (Annahme)

Repository mit dem eigenen Benutzernamen benennen, Dateien übernehmen, in den Repo-Einstellungen Actions mit Schreibrechten erlauben. Optional ein Secret `SKINS_TOKEN` anlegen. Workflow einmal über „Run workflow“ starten.

## Update

```bash
git pull
node skins-engine/build.mjs
```

In CI läuft das Update automatisch alle 3 Stunden.

## Deinstallation

- Workflow `.github/workflows/profile-skins.yml` entfernen oder deaktivieren.
- Ordner `skins/`, `skins-engine/` und `skins.config.json` löschen, README-Bildverweise anpassen.
- Secret `SKINS_TOKEN` löschen und ggf. das Token widerrufen.
