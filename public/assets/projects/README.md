# Project files

One folder per project, named by the project's `slug` in
`src/content/projects.json`. Drop screenshots and a video in, then point the
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
  "video": "/assets/projects/my-app/demo.mp4",   // or "" for none
  "url": "https://github.com/you/my-app"         // or "" for none
}
```

The Explorer window derives its file list from these fields — you never list
files by hand. `README.txt` comes from `description`, each screenshot becomes
a `.jpg` named by its filename, `video` becomes the `.mp4`, and `url` becomes
an Internet Shortcut named after the project.

A screenshot that fails to load shows *Cannot display* in Photos rather than
a broken-image icon, so a wrong path degrades cleanly.

**Video size.** Files in this folder are committed to git and shipped with
every deploy. A few short clips are fine; past a few tens of megabytes,
host the `.mp4` elsewhere and put the full URL in `video` — Media Player
plays any direct `.mp4` link.

Vite serves this folder as-is: no imports, no rebuild. Adding a file and
refreshing is enough.
