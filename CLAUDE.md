# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` for local verification
- `npm run lint` — run ESLint over the project (flat config in `eslint.config.js`)
- `npm test` — run vitest once

`vitest` is deliberately scoped to the pure modules — `src/os/windowReducer.js`, `src/apps/projectFiles.js`, and Solitaire's `engine.js` and `layout.js`. There is no DOM test environment; components are verified with lint, build, and a click-through in the dev server.

## Architecture

Vite + React 19 single-page app. JavaScript (JSX), not TypeScript. No backend.

PortfoliOS presents the portfolio as a Windows 98 desktop: each section is a "program" that opens in a draggable, resizable window.

- `index.html` → `src/main.jsx` → `<App />` in `#root` under `StrictMode`. `main.jsx` imports `98.css` **before** `src/styles/index.css` so our layer can override it.
- `src/os/` is the window manager. `windowReducer.js` holds all window state (one `useReducer`); `WindowManager.jsx` provides it through split state/actions contexts so dispatch-only components don't re-render. `useWindowGestures.js` does drag and 8-way resize.
- `src/apps/registry.jsx` maps `appId → { title, icon, defaultSize, Component, multiInstance? }`. It is the single source of truth — desktop icons, the Start menu, and the window layer all read from it, so adding a program is a one-entry change. Only ids listed in `APP_ORDER` get a desktop icon and Start entry; an app in `APPS` but not `APP_ORDER` can still be opened programmatically (that's how the file viewers work).
- `src/components/` is the shell: `Desktop`, `DesktopIcon`, `WindowLayer`, `Window`, `ResizeHandles`, `Taskbar`, `StartMenu`, `Clock`.
- `src/content/*.json` holds all portfolio copy — `about`, `projects`, `experience`, `skills`, `contact`, plus `site.json` for branding. Program components render this data and must not hardcode content. Vite imports JSON natively, so editing a file and saving hot-reloads it. (Window titles are the exception: they live in `registry.jsx` because they identify the program rather than describe it.)
- `src/styles/` is plain CSS, one file per shell area, all imported by `styles/index.css`.
- Icons are SVG symbols in `public/icons.svg`, referenced as `<use href="/icons.svg#icon-…">`. The `icon` field in the registry must match a symbol id.

### Conventions that matter

- **The Win98 palette is declared in `src/styles/index.css`, not by 98.css.** 98.css's *source* defines `--surface`, `--button-face`, etc. as `:root` custom properties, but the published `dist/98.css` inlines them all into literals and ships no `:root` block. We declare them ourselves with matching values. Chrome styles must reference these tokens rather than hardcoding hex, or the two layers drift apart.
- **Desktop icons and Start menu items are `<button>`s, so 98.css's global button styling has to be explicitly unwound** — `box-shadow`, `min-width`/`min-height`, `padding`, and its `color: transparent` + `text-shadow` text-rendering trick. Miss any of them and the element renders as a raised grey button (or with dark text over a navy highlight).
- **Gestures write to the DOM directly and dispatch only on `pointerup`.** Committing to state per `pointermove` re-renders at pointer frequency. Preserve this.
- **Maximized and compact (<768px) windows derive their rect from the live desktop size at render time**, never from stored state, so they keep filling the viewport on resize while the floating rect survives for restore.
- `src/os/constants.js` holds shared measurements (`MIN_W`, `TASKBAR_H`, z-index layers). CSS and gesture math both depend on these agreeing.

### About program (MySpace profile)

`src/apps/About.jsx` renders an early-MySpace profile as a *webpage inside a browser*, not as OS chrome. The window gets a thin IE-style address bar (`.ms-chrome`, which does keep the system font) and everything below it switches to web typography — Arial, 11px, flat 1px borders, `#6699cc` banners, `#ff6600` subheads, `#003399` links. Keep that separation: `myspace.css` deliberately does not reference the Win98 bevel tokens except in the chrome strip.

- The 35/65 split and the 4x2 friend grid respond to **container queries**, not viewport media queries — windows are resized independently of the viewport, so `.ms` sets `container-type: inline-size` and the breakpoints key off window width. Below 560px the columns stack and friends go 2-across.
- **Tables must re-declare `white-space: normal`.** 98.css sets `table { white-space: nowrap }` globally and white-space *inherits*, so any cell of prose runs off the side of its block instead of wrapping — the table sizes correctly while its content overflows, which is easy to misread as a width bug. `.ms-interests` and `.ms-stats` both unwind it, and both use `table-layout: fixed` so a long value can't widen the table either.
- **Profile pictures come from `public/assets/avatars/`**, referenced by root-absolute path (`/assets/avatars/me.jpg`) from `about.json` — `photo` on the profile, `photo` on each friend. `src/apps/Avatar.jsx` renders an `<img>` when a path is set and falls back to a generated `PixelAvatar` when it's empty *or* when the image fails to load, so a wrong path degrades to a placeholder rather than a broken-image icon. `public/` is served as-is: dropping a file in and refreshing is enough, no rebuild.
- `src/apps/PixelAvatar.jsx` generates every headshot from a 16x16 character map. Avatars are synthesized rather than photographed: the parody lineup is fictional, and a coarse grid gives the compressed low-res look the design wants. Style and palette are picked by a djb2 hash of the name, so a given name always yields the same face. `variant: "tom"` in the JSON selects the whiteboard-white special case.
- Hash indexing uses `>>>`, never `>>`. A signed shift on a hash past 2^31 goes negative and indexes off the front of the palette array, which throws and — with no error boundary in the tree — blanks the whole desktop.
- Horizontal runs of identical pixels are merged into single `<rect>`s. One rect per cell would be 256 nodes per avatar; the page draws nine.
- All copy lives in `about.json`, including `mood`, `stats`, `interests`, both blurbs, and the `friends` array. `interests` is the MySpace category table (General / Music / Movies / Television / Books / Heroes by default) and sits between the blurbs and the friend grid, where the original had it; the labels are data, so rename or drop rows freely — the section hides itself when the array is empty.

### Contact program (mail client)

`src/apps/Contact.jsx` is an Outlook Express style compose window that really sends mail, via **Web3Forms** — chosen because it needs no backend and no npm package, just a `fetch`.

- The access key lives in `src/content/contact.json` as `accessKey`. Web3Forms keys are public by design (they're inlined into the bundle regardless). Mail is delivered to whatever address the key is registered to, so the `email` field in that JSON is display-only and should be kept in sync manually.
- With no key set, Send is disabled and the status bar says so, rather than failing silently.
- **Web3Forms rejects server-side requests** — a `curl` POST returns `403 "This method is not allowed"`. It only accepts calls from a browser, so end-to-end testing requires the real app, not a shell. Success is `{ success: true }` with HTTP 200; failures return `{ success: false, message }`, which the status bar surfaces.
- `botcheck` is the honeypot field name Web3Forms expects — a hidden checkbox, kept out of layout, tab order, and the a11y tree by `.mail-botcheck`.

### Projects program (file explorer)

`src/apps/Projects.jsx` is a Win98 folder window. The root shows one folder per project; inside, each file opens in one of three programs that exist only for this — `notepad`, `photos`, `media` (`src/apps/Notepad.jsx`, `Photos.jsx`, `MediaPlayer.jsx`). Design record: `docs/superpowers/specs/2026-09-13-projects-explorer-design.md`.

- **Files travel on the window.** A window carries `payload` (opaque to the reducer) and `key`. `openApp(appId, { payload, title, key })` hands a file to a program; `update(id, { title, payload })` lets a program retitle itself — and nothing else, geometry and z-order are deliberately unreachable through it. `Window.jsx` passes `windowId` and `payload` to every app component; apps that don't take a file ignore them.
- **Single-instance by default; `multiInstance: true` per app.** Reopening a single-instance app (Photos, Media Player) swaps the payload into the existing window and raises it. A `multiInstance` app (Notepad) dedupes on `(appId, key)`: the same README focuses its window, a different one gets its own. `windowReducer.test.js` pins all of this.
- **The file list is derived, never declared.** `src/apps/projectFiles.js` turns a project entry into `README.txt` (from `description`, an array of lines), one image per `screenshots` entry named by its basename, the `.mp4` if `video` is set, and `<Name>.url` if `url` is set. Nothing in the UI can reference a file the JSON doesn't back. Assets live in `public/assets/projects/<slug>/` (see the README there).
- `FileIcon` is a `<button>` and needs the same 98.css unwind as desktop icons (in `explorer.css`), but black-on-white with a navy selection rather than the desktop's white-on-teal.
- **Photos keeps its index in the window payload**, not local state, so opening another picture from Explorer (which swaps the payload) jumps straight to it and the title updates in the same dispatch. Arrow keys are gated on `focusedId === windowId` so an unfocused viewer doesn't steal them.
- **Media Player is keyed on `src`** so a new clip remounts with fresh transport state. `stop()` rewinds *before* the asynchronous `pause` event fires, so `onPause` reads `currentTime === 0` and reports Stopped rather than Paused.
- The `MenuBar` strips (File Edit View Help) are decorative — `aria-hidden`, not focusable. There is nothing for those menus to do in a read-only portfolio.

### Resume (resume.exe)

`src/apps/ResumeWizard.jsx` is a three-page Win98 setup wizard — Welcome, a fake copy step with a filling progress bar, then Finish — whose Finish button downloads the resume PDF.

- **The PDF is committed to `public/assets/resume/`, deliberately.** The HTML `download` attribute is honoured **only for same-origin URLs**; point it at Google Drive, Dropbox or any other host and every browser ignores it and navigates instead, so the file opens in a viewer tab rather than landing in Downloads with a clean name. That, not repo size, is why it lives here. See the README in that folder.
- **`resumePath` in `site.json` is the single source of truth**, read through `src/apps/resumeFile.js`, which also derives the saved filename from the path's basename. Both the wizard and the Contacts list in Contact Me consume it — Contact's old `resumeUrl` field is gone. Name the PDF the way it should land in someone's Downloads folder.
- With no path set, Finish is disabled and the wizard says so, and Contact's Résumé link hides itself — the same convention as Contact's missing `accessKey`, rather than a 404.
- **Finish is a real `<a download>`, not a scripted click**, so the save is user-initiated and no popup blocker is involved. 98.css only styles `<button>`, so `.wizard-finish` rebuilds the raised bevel and its pressed state by hand from the palette tokens.

### Solitaire program

`src/apps/solitaire/` — the first subfolder under `apps/` — is a faithful Windows 98 `sol.exe`: Klondike with Draw One / Three, Standard or no scoring, timed play, one-level Undo, a Deck picker, and the bouncing-cards cascade across the whole desktop on a win. Plus a **Solve** button (status bar and Game menu) so a visitor can see the cascade without playing. Design record: `docs/superpowers/specs/2026-09-13-solitaire-design.md`. Card artwork comes from a supplied sprite sheet at `src/assets/solitaire/cards.png` — the Windows Solitaire deck, not a redrawing of it.

- **`engine.js` is pure and fully tested.** Every function returns a new state, or the *same* state object when the action is illegal or a no-op, so callers and tests check identity. The standard-scoring numbers (+10 to foundation, +5 waste→tableau, +5 for a turned card, −15 foundation→tableau, −100 per recycle in Draw One, −20 from the fourth recycle in Draw Three, −2 per 10 s timed, `700000 / seconds` bonus over 30 s, floor 0) are reconstructed from the Windows help text, not from a source that can be cited.
- **The waste fans only the last draw** (`state.fanned`): play the top card and the other two stay put; the next draw resets the fan; a recycle clears it. That is sol.exe behaviour and the reason `fanned` lives in the engine rather than being "the top three".
- **All geometry is in 71×96 card units** (`layout.js`) and the table is scaled as a whole — down only, never up — from a `ResizeObserver` on the felt. `hitTest` finds drop targets from those coordinates, so a drop never measures cards. The default window (616×520) fits the table at 1:1.
- **Card drags write the DOM and dispatch once on drop**, like window gestures. `useCardDrag` remembers card *keys* and re-queries each node from `tableRef.current` at write time: `react-hooks/immutability` rejects mutating DOM nodes cached from a hook argument, while a direct `ref.current…` write (as in `useWindowGestures`) is allowed.
- **Every card is one cell of `src/assets/solitaire/cards.png`** — 13 columns x 6 rows of 71x96, which is exactly `CARD_W`/`CARD_H`, so cells map 1:1 with no scaling. Rows 0-3 are the suits in the engine's own order (spades, hearts, clubs, diamonds), ace to king, so a face is at `(col = rank - 1, row = suit)` with no remapping. `cardArt.js` holds that map, the twelve backs, and the markers. Cards are plain divs offset by `background-position`; `--cards-sheet` is set once on `.sol` in `Solitaire.jsx`, so Vite's hashed asset path appears in exactly one place.
- **The sprite carries no text**, so `CardFace`'s `role="img"` + `aria-label` is the only thing a screen reader has — it matters more than it did when the faces were drawn as SVG.
- Four of the twelve backs were animated in the original and their extra frames sit in the cells right after them (robot r4 c6-c8, castle r5 c1-c2, beach r5 c3-c5, hand r5 c6-c8). Only first frames are used. The sheet also has a red X at r4 c11 for a stock that can't be recycled; this engine allows unlimited recycles, so nothing uses it. The green O at r4 c10 *is* used, on an empty stock.
- Because a card is now one blit, **the cascade just needs the decoded sheet** (`loadSheet()`, one shared promise) and each card's source rect — no per-card rasterizing. If the sheet fails to decode the game skips straight to "Deal again?" rather than stalling on a finished table.
- **The cascade is a portal canvas** at `document.body`, `Z.OVERLAY`, never cleared (that is the trail effect), with a capture-phase click/key listener so the click that ends it never reaches a window underneath. It launches the top card of each foundation in turn from the table's `getBoundingClientRect()` taken at the instant of winning — the game's only DOM measurement.
- `MenuBar` items may carry a `menu` array; those become real Win98 drop-downs (Solitaire's Game / Help). Plain-string items stay decorative and the strip stays `aria-hidden`, so Notepad and Explorer are unaffected.
- `src/apps/Dialog.jsx` is the shared in-window modal (Options, Deck, About, Deal again). It uses the `.props-*` styles from `skills.css` and needs a `position: relative` container.
- Changing Draw or Scoring in Options **redeals**, as Windows did; Timed and Status bar apply immediately. The clock runs from the first move until the win.

### 98.css patch

`vite.config.js` includes a `patch98css` plugin. 98.css@0.1.21 ships a malformed `@media (not(hover))` query; browsers drop it silently but Vite 8's lightningcss minifier fails the build. The plugin strips the block. Remove the plugin only if upstream fixes it.

## ESLint config notes

Flat config (`eslint.config.js`) applies `@eslint/js` recommended plus `eslint-plugin-react-hooks` (flat recommended) and `eslint-plugin-react-refresh` (vite preset) to all `**/*.{js,jsx}`. `dist` is globally ignored. There is no TypeScript or type-aware linting.
