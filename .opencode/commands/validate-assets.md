---
description: "Asset validation check. Verifies naming conventions, format compliance, and file size budgets for all assets under assets/."
agent: build
---

# Validate Assets

Check the following for all files under `assets/`:

1. **Naming**: All asset files use kebab-case (e.g., `player-run-sheet.png`, `bg-music.mp3`)
2. **Format**: Images are PNG or WebP. Audio is MP3 or WebM. Spritesheets have matching `.json` manifest.
3. **Size budget**: No single texture exceeds 2048x2048 px. No audio file exceeds 5 MB uncompressed.
4. **Naming consistency**: Asset keys in `assets/manifest.json` match the actual filenames.
5. **Orphan detection**: Every asset in `assets/` is referenced somewhere in `src/` or `assets/manifest.json`.
   If an asset is not referenced, flag it as potentially unused.
