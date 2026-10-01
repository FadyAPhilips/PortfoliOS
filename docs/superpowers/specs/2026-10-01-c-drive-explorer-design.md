# C: drive, Homework and the PDF Viewer — design

Approved in chat 2026-10-01. This records the decisions; it is not a tutorial.

## Goal

My Projects stops being a window of its own and becomes one folder on a
virtual `C:\` drive, next to a new **Homework** folder holding education and
certifications. One Explorer browses the whole drive: **Up** from either folder
reaches `C:\`, where both folders are visible. `C:\` is deliberately left
roomy for an easter egg in a later update — out of scope here.

A new **PDF Viewer** program joins Notepad, Photos and Media Player. Which
program opens a file depends only on the file's type, wherever on the drive
it lives.

## The drive (`src/apps/fileSystem.js`)

Pure, built once from the content JSON, never declared by hand:

```
C:\
├── My Projects\     one folder per projects.json entry
└── Homework\        one folder per education.json entry
```

- A node is `{ type: 'folder', name, children }` or a file
  (`{ type: 'text' | 'image' | 'video' | 'pdf' | 'link', name, … }`), the
  file shapes `projectFiles` already produces plus `pdf`.
- A **path** is the array of folder names from the root: `[]` is `C:\`,
  `['Homework', 'Cybersecurity Cert']` a cert's folder. Display form joins
  with `\`: `C:\Homework\Cybersecurity Cert`.
- The API is `resolve(path)` → the folder node at that path, or `null`; and
  `parent(path)` → the path one level up (`[]` stays `[]`). Explorer uses
  nothing else, so the easter egg is another child of the root.
- Folder names come from each entry's `name` and are made unique within
  their parent by the same `" (2)"` suffixing files already use.
- A path that no longer resolves (JSON edited under hot reload) walks up to
  the nearest folder that does, ending at `C:\`.

## Explorer (`src/apps/Explorer.jsx`)

The window body currently in `Projects.jsx` — menu strip, Up, Address bar,
icon grid, status bar — generalised to browse the drive by path.

- **The path lives in the window payload** (`{ path }`), as Photos keeps its
  index there. Navigating calls `update(windowId, { title, payload })`.
- Title is the current folder's name; at the root it is `(C:)`.
- Up is disabled at `C:\`. Folders show the folder icon; files show the icon
  for their type.
- Selection clears on navigation, as today.

### Two desktop icons, two windows

`projects` (My Projects) and `homework` (Homework) remain **separate
single-instance registry entries**, both rendering Explorer, each with its
own start path — thin wrappers `Projects.jsx` and `Homework.jsx`. Consequences:

- Each icon has its own window; the two can be open at once. With My
  Projects open, double-clicking Homework opens a **second** window rather
  than navigating the first — and that holds even if the My Projects window
  has been browsed into `C:\Homework` itself.
- The desktop opens an app with no payload, which Explorer reads as "start
  path". Because single-instance reopen *swaps the payload in*, double-clicking
  an icon always brings its window back to its own folder, even after the
  visitor has wandered up to `C:\` and into the other one.
- Homework is added to `APP_ORDER` straight after My Projects, with the same
  screen-relative `defaultSize`, and a new `icon-homework`.

## Opening files (`src/apps/openFile.js`)

One mapping for the whole drive:

| type  | program        |
|-------|----------------|
| text  | Notepad        |
| image | Photos         |
| video | Media Player   |
| pdf   | PDF Viewer     |
| link  | new browser tab |

Payloads are those `Projects.jsx` builds today. Photos still receives only
the current folder's images, so Previous/Next stays scoped to the folder.
Notepad's instance key is the file's full display path, so two `README.txt`s
in different folders still get separate windows.

## Folder contents (`folderFiles`, generalised from `projectFiles`)

Projects and Homework entries share the media fields and one function reads
them:

- `docs` — classified **by extension**: `.pdf` → `pdf` file, anything else →
  `text` (fetched by Notepad, as today). A PDF listed in a project's `docs`
  therefore opens in the PDF Viewer, never as bytes in Notepad.
- `screenshots`, `videos`, `links` — unchanged.
- Any combination, including none. Unique-name and drop-empty rules
  unchanged.

Each folder leads with a derived `README.txt`:

- Project: from `description`, as today.
- Homework entry: the populated details, one per line —
  `Institution:`, `Program:`, `Dates:`, `Average:`, `Status:`, `Verify:` —
  then a blank line and `description`, if any. Empty fields are omitted
  entirely, never printed as a bare label.

## PDF Viewer (`src/apps/PdfViewer.jsx`, app id `pdfviewer`)

Single-instance, outside `APP_ORDER` (opens only from files), screen-relative
size. Payload `{ name, src, details? }`.

- Renders the PDF with the browser's built-in reader (`<iframe>`), no npm
  dependency. An **Open in new tab** link sits in the toolbar — the fallback
  for mobile browsers that won't render PDFs inline.
- **Guard before embed.** `public/` sits behind the SPA's `index.html`
  fallback, so a mistyped path returns the app shell with HTTP 200 and the
  iframe would show the desktop inside itself. The viewer first checks the
  response (`src/apps/loadPdf.js`, injected `fetchImpl` like `loadTextFile`):
  not OK, or an HTML content type → *Cannot display* `name`.
- **Details strip.** A Homework PDF carries its entry's details in the
  payload; the viewer shows the populated ones in a strip above the document,
  plus **View original** when `verifyUrl` is set. Empty fields are hidden;
  with none, the strip isn't rendered — which is the case for every project
  PDF.
- Window chrome, fonts and borders match the other viewers (`viewers.css`).

## Data (`src/content/education.json`)

```jsonc
{
  "education": [
    {
      "slug": "bachelors",
      "name": "Bachelor_of_Science",
      "institution": "Institution Name",
      "program": "Program Name",
      "dates": "20XX – 20XX",
      "average": "",
      "status": "Completed",
      "verifyUrl": "",
      "description": [],
      "docs": [], "screenshots": [], "videos": [], "links": []
    }
  ]
}
```

Three templates — undergrad, master's (`"In Progress"`), cybersecurity cert —
with obviously placeholder copy for the owner to replace. No real details are
invented. Assets go in `public/assets/education/<slug>/`, with a README there
mirroring `public/assets/projects/README.md`.

## Icons (`public/icons.svg`)

`icon-homework` (desktop and Start), `icon-file-pdf`. Folders inside the
Explorer keep `icon-projects`.

## Testing

`vitest`, pure modules only:

- `fileSystem` — resolve, parent, root contents, unique folder names, a dead
  path walking up.
- `folderFiles` — `.pdf` vs `.txt` docs; the Homework README omitting empty
  fields; existing `projectFiles` behaviour unchanged.
- `loadPdf` — OK PDF passes; HTML fallback and non-OK responses reject.

Then lint, build, and a headless-Chrome pass: both icons open separate
windows; Up reaches `C:\` from either and crosses into the other folder;
reopening an icon returns its window to its own folder; each file type opens
its program; a Homework PDF shows the strip, a project PDF doesn't. The test
PDF is generated for the run and deleted after — nothing placeholder is
committed as media.

## Out of scope

The `C:\` easter egg; a My Computer window; drive-letter navigation in the
Address bar (it is display-only, as today).
