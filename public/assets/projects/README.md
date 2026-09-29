# Project files

One folder per project, named by the project's `slug` in
`src/content/projects.json`. Drop screenshots and videos in, then point the
JSON at them.

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

All three media fields are lists: use as many screenshots, videos and links as
the project has, or `[]` for none.

The Explorer window derives its file list from these fields — you never list
files by hand. `README.txt` comes from `description`, each screenshot and each
video becomes a file named by its filename, and each link becomes an Internet
Shortcut named by its `label` — so `"label": "GitHub"` shows up as `GitHub.url`.
Files appear in that order: README, screenshots, videos, links, each group in
the order you wrote it.

Two files that would end up with the same name — the same screenshot filename
used twice, or two links both labelled `GitHub` — get a numbered suffix, as
`shot.jpg` and `shot (2).jpg`. A link missing its `label` or its `href`, and a
video with an empty path, are skipped rather than shown as a dead file.

A screenshot that fails to load shows *Cannot display* in Photos rather than
a broken-image icon, so a wrong path degrades cleanly.

Screenshots share one Photos window and its Previous/Next moves through the
folder; each video opens in the single Media Player window, replacing whatever
was playing.

**Video size.** Files in this folder are committed to git and shipped with
every deploy. A few short clips are fine; past a few tens of megabytes,
host the `.mp4` elsewhere and put the full URL in `videos` — Media Player
plays any direct `.mp4` link.

Vite serves this folder as-is: no imports, no rebuild. Adding a file and
refreshing is enough.
