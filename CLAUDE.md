# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` for local verification
- `npm run lint` — run ESLint over the project (flat config in `eslint.config.js`)

There is no test runner configured.

## Architecture

Vite + React 19 single-page app. JavaScript (JSX), not TypeScript. No backend.

PortfoliOS presents the portfolio as a Windows 98 desktop: each section is a "program" that opens in a draggable, resizable window.

- `index.html` → `src/main.jsx` → `<App />` in `#root` under `StrictMode`. `main.jsx` imports `98.css` **before** `src/styles/index.css` so our layer can override it.
- `src/os/` is the window manager. `windowReducer.js` holds all window state (one `useReducer`); `WindowManager.jsx` provides it through split state/actions contexts so dispatch-only components don't re-render. `useWindowGestures.js` does drag and 8-way resize.
- `src/apps/registry.jsx` maps `appId → { title, icon, defaultSize, Component }`. It is the single source of truth — desktop icons, the Start menu, and the window layer all read from it, so adding a program is a one-entry change.
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

### Contact program (mail client)

`src/apps/Contact.jsx` is an Outlook Express style compose window that really sends mail, via **Web3Forms** — chosen because it needs no backend and no npm package, just a `fetch`.

- The access key lives in `src/content/contact.json` as `accessKey`. Web3Forms keys are public by design (they're inlined into the bundle regardless). Mail is delivered to whatever address the key is registered to, so the `email` field in that JSON is display-only and should be kept in sync manually.
- With no key set, Send is disabled and the status bar says so, rather than failing silently.
- **Web3Forms rejects server-side requests** — a `curl` POST returns `403 "This method is not allowed"`. It only accepts calls from a browser, so end-to-end testing requires the real app, not a shell. Success is `{ success: true }` with HTTP 200; failures return `{ success: false, message }`, which the status bar surfaces.
- `botcheck` is the honeypot field name Web3Forms expects — a hidden checkbox, kept out of layout, tab order, and the a11y tree by `.mail-botcheck`.

### 98.css patch

`vite.config.js` includes a `patch98css` plugin. 98.css@0.1.21 ships a malformed `@media (not(hover))` query; browsers drop it silently but Vite 8's lightningcss minifier fails the build. The plugin strips the block. Remove the plugin only if upstream fixes it.

## ESLint config notes

Flat config (`eslint.config.js`) applies `@eslint/js` recommended plus `eslint-plugin-react-hooks` (flat recommended) and `eslint-plugin-react-refresh` (vite preset) to all `**/*.{js,jsx}`. `dist` is globally ignored. There is no TypeScript or type-aware linting.
