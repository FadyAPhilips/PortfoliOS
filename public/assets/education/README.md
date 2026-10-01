# Education files

One folder per entry, named by the entry's `slug` in
`src/content/education.json` — whichever list it's in, `degrees` (shown under
`C:\Homework\Degrees`) or `certifications` (`C:\Homework\Certifications`). Drop certificates, transcripts, notes or images
in, then point the JSON at them.

Paths are **absolute from the site root** — write `/assets/education/…`, with
a leading slash and *without* `public`.

```jsonc
// in "certifications": [ … ]
{
  "slug": "cybersecurity-cert",
  "name": "Cybersecurity_Cert",
  "docs": [
    "/assets/education/cybersecurity-cert/certificate.pdf",
    "/assets/education/cybersecurity-cert/notes.txt"
  ],
  "links": [{ "label": "Credly badge", "href": "https://…" }]
}
```

- A `.pdf` in `docs` opens in the PDF Viewer with the entry's details across
  the top; any other doc opens in Notepad.
- A mistyped path shows *Cannot display* rather than an error — check the
  filename first if a file won't open.
- `verifyUrl` adds a **View original** link beside the details.
