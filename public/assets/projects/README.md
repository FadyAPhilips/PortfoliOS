# Project files

One folder per project, named by the project's `slug` in
`src/content/projects.json`. Drop screenshots, videos and text files in, then
point the JSON at them.

Paths are **absolute from the site root** — write `/assets/projects/…`, with a
leading slash and *without* `public`, because everything in `public/` is served
from the root at build time.

```jsonc
// src/content/projects.json
{
  "slug": "my-app",
  "name": "My App",
  "description": ["My App", "======", "", "What it does and why."],
  "screenshots": [
    "/assets/projects/my-app/home.jpg",
    "/assets/projects/my-app/settings.jpg"
  ],
  "docs": [
    "/assets/projects/my-app/architecture.txt",
    "/assets/projects/my-app/changelog.txt"
  ],
  "videos": [
    "/assets/projects/my-app/demo.mp4",
    "/assets/projects/my-app/walkthrough.mp4"
  ],
  "links": [
    { "label": "GitHub", "href": "https://github.com/you/my-app" },
    { "label": "Live Demo", "href": "https://my-app.example.com" }
  ]
}
```

All four media fields are lists: use as many screenshots, docs, videos and
links as the project has, or `[]` for none.

The Explorer window derives its file list from these fields — you never list
files by hand. `README.txt` comes from `description`, each doc, screenshot and
video becomes a file named by its filename, and each link becomes an Internet
Shortcut named by its `label` — so `"label": "GitHub"` shows up as `GitHub.url`.
Files appear in that order: README, docs, screenshots, videos, links, each
group in the order you wrote it.

Two files that would end up with the same name — the same screenshot filename
used twice, or two links both labelled `GitHub` — get a numbered suffix, as
`shot.jpg` and `shot (2).jpg`. A link missing its `label` or its `href`, and a
doc or video with an empty path, are skipped rather than shown as a dead file.

## Text files

`docs` holds plain-text files kept here on disk, for anything too long or too
awkward to write as a `description` array — an architecture note, a changelog,
a build log. They open in Notepad, read at the moment you open them, and they
sit alongside `README.txt` rather than replacing it. `README.txt` always comes
from `description`; a file in `docs` that happens to be named `README.txt`
appears next to it as `README (2).txt`.

Any plain-text file works — the extension is only ever the label on the icon —
but the icon is always the Notepad one, so `.txt` is the honest choice.

**A wrong path here does not 404.** `public/` sits behind the SPA's
`index.html` fallback, so a misspelled filename comes back as the whole app
shell with HTTP 200. The reader rejects an HTML response for exactly that
reason and Notepad says *Cannot display* — if you see that on a file you know
exists, check the spelling and the extension before anything else.

## How the viewers behave

A screenshot that fails to load shows *Cannot display* in Photos rather than
a broken-image icon, so a wrong path degrades cleanly.

Screenshots share one Photos window and its Previous/Next moves through the
folder; each video opens in the single Media Player window, replacing whatever
was playing. Each text file gets its own Notepad window, and reopening one
brings its window back to the front instead of making a second.

**Video size.** Files in this folder are committed to git and shipped with
every deploy. A few short clips are fine; past a few tens of megabytes,
host the `.mp4` elsewhere and put the full URL in `videos` — Media Player
plays any direct `.mp4` link.

Vite serves this folder as-is: no imports, no rebuild. Adding a file and
refreshing is enough.
