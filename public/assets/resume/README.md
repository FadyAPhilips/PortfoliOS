# Resume

Drop the PDF in this folder, then point `resumePath` in `src/content/site.json`
at it.

Paths are **absolute from the site root** — write `/assets/resume/…`, with a
leading slash and *without* `public`, because everything in `public/` is served
from the root at build time.

```jsonc
// src/content/site.json
{
  "resumePath": "/assets/resume/Fady-Philips-Resume.pdf"
}
```

**Name the file how you want it saved.** The download uses this path's
basename as the filename, so `Fady-Philips-Resume.pdf` is what lands in a
visitor's Downloads folder — not `resume-final-v3.pdf`.

Until `resumePath` is set, the resume.exe wizard's Finish button stays
disabled and says so, and the Résumé link in Contact Me is hidden. Nothing
404s.

## Why this is committed rather than hosted elsewhere

The HTML `download` attribute **only works same-origin**. Linking to Google
Drive, Dropbox, or any other host makes browsers ignore it and open a viewer
tab instead, so the file never lands in Downloads with a clean name. Keeping
the PDF here is what makes the download a download.

A PDF revised a few times a year costs the repo nothing, and git history
means old versions stay recoverable. `resumePath` does accept a full URL if
you ever move it — you would just lose the clean filename.

**Before committing:** a resume in a public repo is permanently scrapeable,
git history included. Consider stripping your phone number and street address
and keeping just email and city.

Vite serves this folder as-is: no imports, no rebuild. Adding a file and
refreshing is enough.
