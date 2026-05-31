# DBD Skill Check Simulator

A timing-focused Dead by Daylight style skill check simulator built with Vite, React, TypeScript, TailwindCSS, Zustand, Canvas, requestAnimationFrame, Web Audio, and Tauri.

The simulator is designed around low input latency: the canvas animation loop owns motion, keyboard input is captured outside React render flow, and scoring is computed with `performance.now()` timestamps.

## Features

- Standard, Decisive Strike, Hex, Chaos, and Zen Trainer modes
- Rotating needle, success zone, great zone, miss and timeout detection
- Delta-time based `requestAnimationFrame` loop for smooth 60fps motion
- Keyboard-first input with configurable keybinds
- Web Audio cues for ready, success, great, and fail events
- Score, streak, accuracy, reaction time, and per-mode stats
- Persisted settings and stats through `localStorage`
- Offline-capable Tauri desktop builds for Windows and Linux

## Requirements

- Node.js 22+
- npm 10+
- Rust stable and Tauri system dependencies for desktop builds
- GitHub CLI (`gh`) if you want to create and push the GitHub repository from the terminal

Linux desktop build dependencies:

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

## Setup

```bash
npm install
npm run dev
```

The dev server runs at `http://127.0.0.1:1420`.

## Web Build

```bash
npm run build
npm run preview
```

## Desktop Build

```bash
npm run tauri build
```

Tauri bundles are emitted under `src-tauri/target/release/bundle`.

## Architecture

- `src/components` contains React UI panels and the canvas mount
- `src/modes` defines mode tuning and attempt generation
- `src/systems` contains the frame loop, input controller, and scoring evaluator
- `src/store` contains persisted Zustand state
- `src/audio` contains the Web Audio timing cues
- `src/utils` contains math, formatting, and input helpers

React renders controls and stats only. The active timing ring is drawn directly to Canvas, updated with delta time, and hit-tested on keydown timestamps.

## CI/CD

The repository includes:

- `.github/workflows/build-check.yml` for install, typecheck, lint, and web build
- `.github/workflows/desktop-build.yml` for Windows NSIS and Linux AppImage desktop artifacts
- `.github/workflows/release.yml` for automatic `vX.Y.Z` tags, release notes, and GitHub Release artifact uploads

The release workflow reads `package.json` version, creates a matching tag if one does not already exist, builds desktop artifacts, and publishes them to GitHub Releases.

## GitHub Repository

If the GitHub CLI is authenticated:

```bash
git init
git add .
git commit -m "Initial DBD skill check simulator"
gh repo create dbd-skill-check-simulator --private --source=. --remote=origin --push
```

Change `--private` to `--public` if you want a public repository.
