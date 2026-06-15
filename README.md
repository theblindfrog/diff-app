# Diff Viewer

A small macOS desktop app for comparing two pieces of code or text. Open two
files (live-watched, so the diff updates when you save) or paste two blocks of
text (live-editable). Diffs are computed and rendered by
[`@pierre/diffs`](https://diffs.com) (the open-source library behind diffs.com),
with Shiki syntax highlighting.

Built with **Tauri 2** (native macOS shell) + **React + TypeScript + Vite**.

## Features

- **Two input modes** — segmented Files ↔ Paste switch.
  - _Files_: open or drag-and-drop two files; live-watched with a Freeze toggle;
    recent file pairs for quick re-opening.
  - _Paste_: two editable panes that re-diff as you type.
- **Split** (side-by-side) or **Unified** (stacked) layout.
- **Syntax highlighting** — auto-detected from the file extension, with a manual
  language override.
- **Change navigation** — jump between change regions (toolbar arrows or
  `F8` / `Shift+F8`, `⌥↓` / `⌥↑`), plus a `+adds / −dels` summary.
- **Theme** — follows macOS light/dark, or force light/dark.
- **Persists** UI prefs, recent pairs, and window geometry across launches.

## Develop

```bash
npm install
npm run tauri dev     # native dev window with hot reload
```

The frontend alone (no native file features) also runs in a browser:

```bash
npm run dev           # http://localhost:1420
```

## Build (personal use)

```bash
npm run tauri build
```

Outputs a `.app` and `.dmg` under `src-tauri/target/release/bundle/`. The app is
ad-hoc signed (`signingIdentity: "-"`) so it runs locally on Apple Silicon
without an Apple Developer account or notarization. If you copy the `.dmg`
elsewhere and Gatekeeper quarantines it:

```bash
xattr -dr com.apple.quarantine "/Applications/Diff Viewer.app"
```

## Architecture

- `src/store/` — single Zustand store; the canonical
  `(oldText, newText, language, layout, …)` model. Files and Paste modes are the
  only writers; everything below the diff reads it.
- `src/diff/` — `DiffView` (renders `MultiFileDiff`), `useFileDiff`
  (`parseDiffFromFile` for stats), and change-navigation.
- `src/modes/` — Files (pick / drop / watch / recents) and Paste editors.
- `src/toolbar/` — layout toggle, language picker, change navigator, stats,
  freeze, theme.
- `src/platform/` — thin, mockable wrappers over Tauri (dialog, fs, drag-drop,
  store) plus the Shiki highlighter preload; all degrade gracefully in a browser.
