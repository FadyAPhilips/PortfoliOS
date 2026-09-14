# Profile pictures

Drop image files in this folder, then point `about.json` at them.

Paths are **absolute from the site root** — write `/assets/avatars/…`, with a
leading slash and *without* `public`, because everything in `public/` is served
from the root at build time.

```jsonc
// src/content/about.json
{
  "photo": "/assets/avatars/me.jpg",     // your own profile picture
  "friends": [
    { "name": "Tom", "photo": "/assets/avatars/tom.jpg" },
    { "name": "Gill Bates", "photo": "" }  // empty → generated placeholder
  ]
}
```

Any entry left empty — or pointing at a file that fails to load — falls back to
a generated pixel-art face, so the page never shows a broken-image icon.

**Square images work best.** Both slots are square (150px for the main photo,
76px for friends) and non-square images are centre-cropped to fit.

Vite serves this folder as-is: no imports, no rebuild of the bundle. Adding a
file and refreshing is enough.
