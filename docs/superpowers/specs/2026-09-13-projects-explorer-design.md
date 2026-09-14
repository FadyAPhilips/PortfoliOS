# Projects as a File Explorer — design

Approved in chat 2026-09-13. This records the decisions; it is not a tutorial.

## Goal

The Projects section becomes a Win98 folder window. Each project is a folder
holding a `README.txt`, zero or more `.jpg` screenshots, an optional `.mp4`,
and an optional `.url` Internet Shortcut. Double-clicking a file opens it in
the matching program: Notepad (read-only), Photos (prev/next within that
folder), or Media Player. `.url` opens the link in a new tab.

Four programs ship: Explorer (`projects`), `notepad`, `photos`, `media`. Only
Explorer appears on the desktop and Start menu; the viewers are launched
exclusively from files.

## Window manager extension (`src/os/`)

The only change to the OS layer.

- A window gains `payload` (app-defined, opaque to the reducer) and `key`
  (instance identity string, e.g. `"yekola/README.txt"`).
- `OPEN_APP` accepts `{ payload, title, key }`. `title` falls back to the
  registry title.
  - Single-instance app (default) with an existing window: patch `payload`
    and `title`, then raise. Photos and Media Player swap content this way.
  - `multiInstance: true` app (Notepad only): find a window with the same
    `appId` **and** `key`. Found → raise. Not found → new window. Two READMEs
    get two Notepads; the same README twice focuses the one already open.
- `UPDATE_WINDOW(id, { title, payload })` — a narrow patch so an app can
  retitle itself (Explorer → folder name, Photos → current file) without
  being able to touch geometry or z-order.
- `Window.jsx` renders `<Body windowId={win.id} payload={win.payload} />`.
  Existing apps ignore both props.
- `WindowManager` exposes `openApp(appId, opts?)` and `update(id, patch)`.

Tested with `vitest`, scoped to `windowReducer` only.

## Data model (`src/content/projects.json`)

```json
{ "projects": [{
  "slug": "project-one",
  "name": "Project One",
  "description": ["Project One", "===========", "", "What it does."],
  "screenshots": ["/assets/projects/project-one/screenshot-1.jpg"],
  "video": "",
  "url": ""
}]}
```

- **The file list is derived, never hand-listed.** `projectFiles(project)`
  returns: `README.txt` from `description`; one `.jpg` per screenshot,
  named by basename; the `.mp4` by basename if `video` is set; `<name>.url`
  if `url` is set. Nothing in the UI can point at a file that doesn't exist
  in the data.
- `description` is an array of lines (empty string = blank line), joined
  with `\n`.
- Assets live in `public/assets/projects/<slug>/`, referenced by
  root-absolute path like the avatars.
- The old `type` and `year` fields are dropped.

## Explorer (`src/apps/Projects.jsx`)

Single-pane folder window. State: `folder` (`null` = root, else a slug) and
`selected` (file name or null).

Chrome top to bottom: decorative menu strip (File Edit View Help), toolbar
with **Up** (disabled at root), address bar (`C:\My Projects` or
`C:\My Projects\<Name>`), icon grid, status bar (`N object(s)` left,
selected name right).

Icon grid flows left-to-right in rows. `FileIcon`: single click selects,
double-click / Enter opens, empty-space click deselects. Black label on
white, navy selection. Own CSS with the standard 98.css button unwind.

Open by type: folder → navigate + retitle to project name; `.txt` →
Notepad; `.jpg` → Photos with all of the folder's screenshots and the
clicked index; `.mp4` → Media Player; `.url` →
`window.open(url, '_blank', 'noopener')`. Up → root, retitle `My Projects`.

## Viewers

Registry entries kept out of `APP_ORDER`. Each shows *No file open.* if
mounted without a payload.

- **Notepad** — `multiInstance: true`, key `slug/README.txt`, title
  `README.txt - Notepad`. Decorative menu strip, full-bleed
  `<textarea readOnly>`, monospace stack, wrap on, resize grip hidden.
- **Photos** — single-instance, title `<name> - Photos`, retitles on
  navigation. Payload `{ images: [{ src, name }], index }`. Image centered on
  grey, `object-fit: contain`. Toolbar: ◄ Previous / Next ► and `i of n`;
  buttons disable at the ends; ← / → keys work. Folder-scoped by
  construction.
- **Media Player** — single-instance, title `<name> - Media Player`. Payload
  `{ src, name }`. Black `<video>` with native controls off; transport row:
  Play/Pause, Stop, seek range, `m:ss / m:ss`. Status bar: Playing / Paused
  / Stopped. No volume control.

## Icons (`public/icons.svg`)

Seven new 32×32 `crispEdges` symbols: `icon-notepad`, `icon-photos`,
`icon-media`, `icon-file-txt`, `icon-file-jpg`, `icon-file-mp4`,
`icon-file-url`. Folders and the Explorer window reuse `icon-projects`.

## Errors

- Image `onError` → *Cannot display <name>* in the frame.
- Video `onError` → status *Cannot play file*.
- `folder` slug missing from JSON → snap to root.
- Nothing may throw into the tree: there is no error boundary and an
  uncaught render error blanks the desktop.

## Build order

1. Reducer + `WindowManager` + `Window.jsx` + tests
2. `projects.json`, assets README, icons
3. Explorer + `FileIcon` + `MenuBar`
4. Notepad
5. Photos
6. Media Player
7. CLAUDE.md

Each step leaves the app building and clickable. Media Player is verified
against a sample clip during development only; no placeholder media is
committed.
