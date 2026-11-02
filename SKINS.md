# Profile Skins — Einrichtung

Eigene, animierte SVG-Karten für dein GitHub-Profil. Acht Skins, live-Daten, keine Abhängigkeiten, kein externer Server.

| Skin | Look |
|---|---|
| `circuit-violet` | **Standard** — Circuit-Platine in Lila/Schwarz, persönlich |
| `fg` | **FG Production** — Schwarz/Lila wie fg-production.tech, Hero „Engineering. Software. Design.“, Kompetenzen, Skill-Bars |
| `fg-light` | FG Production, helle Variante |
| `aurora` | Dunkles Glas, Violett/Cyan-Aurora, Orbit-Animation |
| `broadcast` | Regie/PGM-Monitor, Tally-Licht, ON AIR, LED-VU-Meter |
| `terminal` | Phosphor-CRT, Scanlines, Neofetch-Panel, blinkender Cursor |
| `paper` | Hell, editorial, Serifen, rotierender Stempel |
| `circuit` | Platine mit wandernden Signalpulsen, IC-Gehäuse |

## Installation (5 Minuten)

1. Profil-Repository anlegen: **`Infactionfreddy/Infactionfreddy`** (öffentlich, Name = Benutzername).
2. Den Inhalt dieses Ordners ins Repo kopieren (inkl. `.github/` und `skins-engine/`) und pushen.
3. Im Repo: **Settings → Actions → General → Workflow permissions → „Read and write permissions“**.
4. **Actions → Profile skins → Run workflow**. Danach liegen die Karten in `skins/<skin>/` und werden alle 3 Stunden aktualisiert.
5. Fertig — `README.md` zeigt das Profil. Skin wechseln: im README `circuit-violet` durch einen anderen Skin-Namen ersetzen.

## Anpassen — `skins.config.json`

| Feld | Bedeutung |
|---|---|
| `displayName`, `tagline`, `location` | Text im Banner |
| `stack` | Chips im Banner (max. ~7 passen) |
| `skins` | welche Skins gerendert werden (`"all"` = alle) |
| `pins` | Repos für die Repo-Karten; leer = deine angepinnten Repos |
| `excludeLanguages` / `excludeRepos` | aus der Sprachstatistik ausnehmen |
| `includePrivate` | `"auto"` (Standard): private Repos und Beiträge zählen mit, sobald das Secret `SKINS_TOKEN` existiert; `false` = nur öffentlich |
| `includeForks` | `true`: öffentliche Forks zählen bei Repos und Sprachen mit (Sterne nur von eigenen Repos) |
| `timezone` | Zeitzone für das Datum „SYNC“ auf der Karte |
| `stampText` | Umlauftext des Stempels im `paper`-Skin |
| `fg.accent` | Akzentfarbe des FG-Skins (Standard `#8b5cf6`, Lila) |
| `fg.eyebrow`, `fg.headline`, `fg.ctaPrimary`, `fg.ctaGhost` | Texte im FG-Banner |
| `fg.heroCode` | Code-Zeilen im Hintergrund des Banners |
| `fg.capabilities` | die fünf Kompetenz-Spalten (Icons: chip, code, wave, box, pen) |

**Private Arbeit einbeziehen:**
1. github.com/settings/personal-access-tokens → *Generate new token* (fine-grained), Ablauf z. B. 1 Jahr.
2. *Repository access:* All repositories. *Permissions → Repository:* Contents = Read-only, Metadata = Read-only. Sonst nichts.
3. Token kopieren → im Profil-Repo *Settings → Secrets and variables → Actions → New repository secret*, Name `SKINS_TOKEN`.
4. Workflow einmal starten. Private Repos zählen dann bei Sprachen, Repos und Aktivität mit, ihre Namen erscheinen nirgends.

## Lokal testen

```bash
node skins-engine/build.mjs --demo              # Demo-Daten, offline
GITHUB_TOKEN=ghp_… node skins-engine/build.mjs  # echte Daten
```

Node 18+ reicht, nichts zu installieren.

## Hinweise

- Animationen laufen auch in GitHub-READMEs (CSS in SVG); bei „Bewegung reduzieren“ im System sind sie aus.
- Schriftarten: Der FG-Skin bettet Inter und Geist Mono direkt in die SVGs ein und sieht dadurch überall gleich aus. Die anderen Skins nutzen System-Fonts.
- Neuen Skin bauen: in `skins-engine/lib/themes.mjs` ein Objekt mit Farben, `frame()` und `label()` ergänzen.
