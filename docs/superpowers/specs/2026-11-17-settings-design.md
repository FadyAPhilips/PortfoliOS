# Settings program, desktop-browser notice, and favicon — design

Date: 2026-11-17

## Intent

Visitors have said the text is hard to read. Nobody knows yet whether that
means *too small* or *too jagged* (the pixel font renders with smoothing off),
so both get fixed: a **Settings** program lets a visitor choose a text size
from a fixed set of presets and switch the system font between the classic
pixel face and a smooth one. While there, Settings also takes a few other
display preferences.

Two smaller changes ride along: the Welcome screen gains a notice that the site
is meant for a desktop browser, and the Vite-bolt favicon is replaced.

## Goals

- Every font size in the shell and the programs follows one chosen preset:
  **Small, Default, Large, Extra Large**. Default looks exactly like today.
- The preset enlarges the **window chrome too** — title bars, taskbar, Start
  menu, desktop icon labels — the way Windows 98's Large Fonts did, and the
  window manager's geometry stays correct at every preset.
- Font style: **Classic** (Pixelated MS Sans Serif, smoothing off — today) or
  **Smooth** (Tahoma / system sans, normal smoothing).
- Also in Settings: desktop background colour, show Welcome on startup, reduce
  motion.
- Choices persist across visits in the visitor's own browser.

## Non-goals

- Free-form customisation. No sliders, no arbitrary pixel values, no font
  picker — presets only.
- Scaling icons. Every icon (16px title-bar/taskbar/Start/Explorer, 32px
  desktop, the 13px title-bar control buttons' glyphs) keeps its size at every
  preset, as Win98's Large Fonts did — pixel art stays crisp. Containers grow
  around them. (User's call.)
- Scaling window default sizes with the preset. Windows open at their
  registry size; content that no longer fits scrolls (see Constraints).
- Wallpaper images. Background is a solid colour only; there are no wallpaper
  assets and none get invented.
- Sound, themes/colour schemes for the chrome, or anything that touches
  portfolio copy.

## Anti-goals

- Default preset + Classic font must be **pixel-identical** to today. If the
  refactor shifts anything at Default, it's wrong.
- Text overflowing a fixed-height strip (title bar, taskbar button, menu row)
  at Large/Extra Large is a failure even if the setting "works".
- CSS and the gesture/desktop-size math disagreeing about chrome heights.
- Settings that break the site when browser storage is blocked.

## Constraints (found in the code)

- **Font sizes are hardcoded px everywhere.** ~25 `font-size` declarations
  across `src/styles/*.css`; 98.css's single rule
  `.title-bar, .window, button, input, label, legend, li[role=tab], option,
  select, table, textarea, ul.tree-view { font-size: 11px; font-family:
  "Pixelated MS Sans Serif" … }`; 98.css `body { font-size: 12px }` and its
  `h1`–`h4` rem sizes; and Notepad's `BASE_FONT_PX = 12` in JS. All of these
  must route through variables. 98.css's rule has to be overridden in our
  layer (`index.css` loads after it).
- **Chrome heights are fixed in two places.** `--titlebar-h: 22px` /
  `--taskbar-h: 28px` in `index.css`, and `TITLEBAR_H = 22` / `TASKBAR_H = 28`
  in `src/os/constants.js`, read by `useWindowGestures.js` (drag clamp) and
  `useDesktopSize.js` (usable desktop height). Both must follow the preset.
- **Font families are hardcoded in several files**: `index.css` body,
  `desktop.css` `.wallpaper-text`, `myspace.css` `.ms-chrome`, plus 98.css.
- **The pixel font is drawn for 11px.** At 1.25x it renders unevenly; that's
  accepted — Classic at Large is still a valid choice, and Smooth exists for
  anyone it bothers.
- No DOM test environment; only pure modules are unit-tested.

## Approaches

Considered how a chosen preset reaches both CSS and the JS geometry code:

- **A. One JS preset table writes CSS variables — chosen.** `src/os/settings.js`
  holds each preset as numbers; on change the app writes them as custom
  properties on `document.documentElement`, and the window manager reads chrome
  heights from the same table. One source, so CSS and geometry can't drift —
  the reason `constants.js` exists. Pure and unit-testable.
- **B. Preset blocks in CSS keyed on `:root[data-text-size=…]`.** Readable CSS,
  but JS needs the chrome heights too, so either a duplicate copy (drift) or
  `getComputedStyle` reads on every resize. Rejected.

Picked by the user: A. Chrome scaling included (vs. window contents only),
also the user's call.

## Design

### `src/os/settings.js` (pure, tested)

- `DEFAULTS = { textSize: 'default', fontStyle: 'classic', desktopColor:
  'teal', showWelcome: true, reduceMotion: <prefers-reduced-motion at first
  load> }`. The `reduceMotion` default is computed by the caller and passed in,
  keeping the module pure.
- `TEXT_SIZES`: ordered `small | default | large | xlarge`, each
  `{ label, scale, titlebarH, taskbarH }`. Proposed values (builder may tune
  after looking at them in the browser, keeping Default exact):

  | preset | scale | titlebar | taskbar |
  |---|---|---|---|
  | Small | 0.9 | 20 | 26 |
  | Default | 1 | 22 | 28 |
  | Large | 1.25 | 26 | 32 |
  | Extra Large | 1.5 | 30 | 36 |

- `FONT_TOKENS`: the base (Default) px of each named size, e.g.
  `ui: 11, body: 12, mono: 12, startBanner: 15, …` — one token per distinct
  role found in the CSS. Naming is the builder's, but tokens are by **role**,
  not by number, so two 11px rules that mean different things can diverge
  later.
- **Exempt display sizes** (not scaled): the wallpaper name/tagline
  (108/42px and their compact 36/16px) and the Welcome banner (28/16/22px).
  They're decoration, already large, and scaling them would collide with
  layout. They stay literal in CSS.
- `FONT_STYLES`: `classic` → `{ family: "'Pixelated MS Sans Serif', Tahoma,
  'Segoe UI', sans-serif", smoothing: 'none' }`; `smooth` → `{ family: "Tahoma,
  'Segoe UI', Verdana, sans-serif", smoothing: 'auto' }`.
- `DESKTOP_COLORS`: a short Win98-style list — Teal (default `#008080`), Black,
  Navy, Dark green, Maroon, Purple, Slate grey. Exact hexes are the builder's.
- `cssVars(settings)` → a flat `{ '--fs-ui': '11px', …, '--titlebar-h':
  '22px', '--taskbar-h': '28px', '--font-ui': …, '--font-smoothing': …,
  '--desktop-teal': … }`. Sizes `Math.round`ed to whole px.
- `chrome(settings)` → `{ titlebarH, taskbarH }` for the JS side.
- `parse(raw, defaults)` → validates a stored blob field by field; unknown
  keys dropped, invalid values replaced by the default. Never throws.

Tests pin: Default produces exactly today's numbers; every preset has every
token; `parse` survives `null`, garbage JSON, unknown enum values, wrong types.

### State and persistence

- `SettingsProvider` (new, `src/os/SettingsContext.jsx`) wraps
  `WindowManagerProvider` in `App`. Reads `localStorage['portfolios.settings']`
  synchronously in a lazy `useState` initializer (try/catch; failure → defaults)
  so the **first frame** already has the right sizes and the startup decision
  — no flash of 11px text.
- On change: writes CSS vars to `document.documentElement.style` (in a
  layout effect, before paint) and saves to storage (try/catch, ignored on
  failure).
- Exposes `useSettings()` → `{ settings, set(patch), chrome }`.

### Geometry follows the preset

- `TITLEBAR_H` / `TASKBAR_H` leave `constants.js` (or stay only as the Default
  values with a comment pointing at settings.js — builder's call, but nothing
  may import them for live geometry).
- `useDesktopSize(taskbarH)` subtracts the live height; changing preset
  re-reads the desktop size, so maximized/compact windows refit immediately.
- `useWindowGestures` receives `titlebarH` from `Window.jsx`.
- Existing floating windows are not re-laid-out on preset change; the drag
  clamp only applies on the next drag. Acceptable.

### CSS refactor

- `index.css :root` declares every token with its Default value (so CSS works
  before JS runs and matches today exactly). JS overwrites them inline.
- Every non-exempt `font-size` in `src/styles/` becomes `var(--fs-…)`.
- Our layer overrides 98.css's control rule with the same selector list, using
  `var(--fs-ui)` and `var(--font-ui)`, and sets `-webkit-font-smoothing:
  var(--font-smoothing)`. Likewise `body` and `h1`–`h4` if anything renders
  them.
- `--font-ui` replaces the hardcoded family in `index.css` body, and in
  `myspace.css .ms-chrome` (the address bar is OS chrome). **Not** in
  `.wallpaper-text` (exempt display text keeps the pixel face) and not in the
  MySpace page body (Arial — it's a webpage) or Notepad (Fixedsys — it's an
  editor); those keep their family but take scaled sizes.
- Anything with a fixed pixel height that holds text — title bar, taskbar
  buttons, Start menu rows, menu bars, desktop icon label width, tree rows,
  tabs, 98.css's 23px button min-height — must grow with the preset rather
  than clip. The builder audits these at Extra Large; preferred fix is
  `min-height` / padding instead of fixed height, falling back to a scaled
  variable.
- Notepad: `BASE_FONT_PX` comes from the `mono` token × scale, so its own zoom
  steps multiply on top of the preset.

### The Settings program

- `src/apps/Settings.jsx`, registry id `settings`, title **Display
  Properties**, new `icon-settings` symbol (a Control Panel–style monitor with
  a wrench or slider — builder's drawing, pixel-crisp like the others).
  Added to `APP_ORDER` (last, after Solitaire) so it gets a desktop icon and
  Start entry — the visitors who need it must be able to find it.
  Single-instance. `defaultSize` around 400x440; builder sizes to fit.
- Modelled on Win98's Display Properties: tabs (98.css `menu[role=tablist]`)
  - **Appearance** — a small live preview (a mini window with title bar,
    a line of text, a button) at the top, then *Font size* select (the four
    presets) and *Font* select (Classic / Smooth).
  - **Background** — a list of desktop colours with a swatch preview.
  - **Effects** — checkboxes: *Show Welcome when {brand} starts*, *Reduce
    motion*.
- **OK / Cancel / Apply**, Win98 semantics: changes are staged in the
  dialog; the preview pane reflects staged values; Apply commits (and
  persists) without closing; OK commits and closes; Cancel discards staged
  changes and closes. Closing via the title-bar X = Cancel.
- Labels and option names live in `src/content/settings.json` per the
  no-hardcoded-copy rule; the preset *values* live in `settings.js`.
- A **Restore defaults** button on Appearance resets size and font.

### Effects of the other settings

- **Show Welcome on startup**: the `WindowManager` lazy initializer filters
  `STARTUP_APPS` by it. Takes effect next load (that's what "on startup"
  means). Welcome stays on the desktop and Start menu regardless.
- **Reduce motion**: Solitaire skips the bouncing-cards cascade and goes
  straight to "Deal again?"; resume.exe's progress bar completes on the next
  tick instead of animating (the save still fires as the bar hits 100%, still
  inside user activation). *(Designer's call:)* storage holds **only fields the
  visitor has committed** via Apply/OK — nothing is written on first load. An
  absent `reduceMotion` follows the OS `prefers-reduced-motion` on every load;
  once committed, the stored value wins. `parse` therefore returns a partial
  object and the provider merges it over computed defaults.
- **Desktop colour**: sets `--desktop-teal` (used by `.desktop` and `body`).
  The `theme-color` meta tag is updated to match.

### Welcome: desktop-browser notice

- A notice strip in the Welcome window, between the banner and the
  Contents/page area, visible on every topic and at every screen size. Small
  info icon + one or two lines of text.
- Copy in `welcome.json` as `notice` (string, `{brand}`/`{owner}` filled).
  Approved copy: *"{brand} is made for a desktop browser. It works on a
  phone, but to get the full experience, visit on a computer. Text too small?
  Open Display Properties from the Start menu."*
- When `notice` is empty or absent, the strip hides.
- "What's on the Desktop" topic gets this approved line: *"Display
  Properties: make the text bigger, switch to a smoother font, change the
  desktop colour, or turn off animations."*
- Settings' interface labels (`settings.json`) are written by the builder —
  plain UI wording, no claims about the owner. (User's call.)

### Favicon

- Replace `public/favicon.svg` with a 32x32 pixel-crisp
  (`shape-rendering="crispEdges"`) beige CRT monitor: beige case with a darker
  bevel and a small stand, teal (`#008080`) screen, a white blocky **P** on it.
  Must read at 16x16 — so a thick P and minimal case detail.
- Optionally the same drawing becomes a new `icon-logo` replacement — **not**
  in this change; the Win98 flag elsewhere stays.

### Docs

- `CLAUDE.md`: a Settings section (preset table is the source of truth;
  tokens by role; exempt display sizes; chrome heights come from settings, not
  constants; 98.css rule override), add `settings.js` to the vitest list, note
  the Welcome `notice`.

## Left to the builder

- Token names and the exact token inventory, after reading each CSS rule.
- Fine-tuning the proposed scale and chrome-height numbers by eye, with
  Default fixed.
- Desktop colour hexes, the `icon-settings` drawing, the favicon drawing
  details, Settings window size.
- How each fixed-height text container is made to grow.
- Whether `TITLEBAR_H`/`TASKBAR_H` are deleted or kept as documented Default
  aliases.
