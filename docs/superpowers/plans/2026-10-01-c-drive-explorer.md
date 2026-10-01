# C: drive, Homework and PDF Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One Explorer browses a virtual `C:\` holding `My Projects` and a new `Homework` folder (education + certs), and a new PDF Viewer joins the file programs, with the program chosen by file type everywhere.

**Architecture:** A pure `fileSystem.js` builds the drive tree from `projects.json` and `education.json`; `Explorer.jsx` renders any folder of it by path, keeping the path in the window payload. `Projects.jsx` and `Homework.jsx` become thin wrappers giving Explorer a start path, registered as two separate single-instance apps so each desktop icon has its own window. `openFile.js` maps file type → program for the whole drive.

**Tech Stack:** Vite + React 19 (JSX, no TypeScript), 98.css, vitest (pure modules only, no DOM environment).

**Spec:** `docs/superpowers/specs/2026-10-01-c-drive-explorer-design.md`

## Global Constraints

- No invented portfolio content: `education.json` ships three templates with obviously placeholder copy (`"University Name"`, `"20XX – 20XX"`); no real details, no placeholder media committed.
- All copy lives in `src/content/*.json`; components must not hardcode content. Window titles live in `registry.jsx`.
- No new npm dependencies. PDFs render with the browser's built-in reader in an `<iframe>`.
- Chrome styles reference the Win98 tokens in `src/styles/index.css` (`--surface`, `--button-shadow`, …), never hardcoded hex.
- Icons are symbols in `public/icons.svg`; every `icon` value must match a symbol id.
- vitest covers pure modules only; components are verified by lint, build and a headless-Chrome click-through.
- `npm run lint` currently reports 4 pre-existing errors (3 in `src/os/WindowManager.jsx` hook exports, 1 in `src/os/useWindowGestures.js`). "Lint passes" in this plan means **no errors beyond those 4**.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Reopening a desktop icon after browsing elsewhere** — a visitor goes Up from My Projects into Homework, then double-clicks My Projects: the window must return to `C:\My Projects`. Pinned by a reducer test in Task 4.
2. **A mistyped PDF path** — the SPA fallback serves `index.html` with 200; the viewer must say *Cannot display*, never show the desktop inside itself. Pinned in Task 3.
3. **An external (https) PDF URL** — a HEAD check across origins fails on CORS; external URLs must embed without the check. Pinned in Task 3.
4. **Two files with the same name in different folders** (every folder has `README.txt`) — must open two Notepad windows, not focus one. Pinned in Task 4.
5. **The open folder disappears from the JSON under hot reload** — the window must walk up to the nearest folder that still exists rather than crash. Pinned in Task 2.

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/apps/projectFiles.js` | modify | `folderFiles` (shared media → files, `.pdf` docs → `pdf`), `projectFiles`, `educationDetails`, `educationReadme`, `educationFiles`; export `deduped` |
| `src/apps/projectFiles.test.js` | modify | tests for the above |
| `src/apps/fileSystem.js` | create | `buildDrive`, `resolve`, `parent`, `nearest`, `displayPath`, `folderTitle`, start paths |
| `src/apps/fileSystem.test.js` | create | tests |
| `src/apps/loadPdf.js` | create | `checkPdf(src, fetchImpl)` — HEAD guard against the SPA fallback |
| `src/apps/loadPdf.test.js` | create | tests |
| `src/apps/openFile.js` | create | file type → program |
| `src/apps/openFile.test.js` | create | tests |
| `src/os/windowReducer.test.js` | modify | reopen-without-payload test |
| `src/apps/PdfViewer.jsx` | create | the viewer |
| `src/apps/Explorer.jsx` | create | folder window over the drive |
| `src/apps/Projects.jsx` | rewrite | wrapper: Explorer at `My Projects` |
| `src/apps/Homework.jsx` | create | wrapper: Explorer at `Homework` |
| `src/apps/registry.jsx` | modify | `homework`, `pdfviewer` entries; `APP_ORDER` |
| `src/content/education.json` | create | three templates |
| `public/assets/education/README.md` | create | where files go |
| `public/icons.svg` | modify | `icon-homework`, `icon-file-pdf` |
| `src/styles/viewers.css` | modify | PDF Viewer styles |
| `CLAUDE.md` | modify | document the drive, Homework, PDF Viewer |

---

### Task 1: Shared folder contents and Homework READMEs

**Files:**
- Modify: `src/apps/projectFiles.js`
- Test: `src/apps/projectFiles.test.js`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `deduped(items: {name}[]) → {name}[]` (now exported; unchanged behaviour)
  - `folderFiles(readme: string, entry) → File[]` where `File` is `{ name, type: 'text'|'image'|'video'|'pdf'|'link', text?, src?, href? }`, README first
  - `projectFiles(project) → File[]` (unchanged output except `.pdf` docs become `type: 'pdf'`)
  - `educationDetails(entry) → { fields: {label, value}[], verifyUrl: string }`
  - `educationReadme(entry) → string`
  - `educationFiles(entry) → File[]`; its `pdf` files also carry `details` (the `educationDetails` result)

- [ ] **Step 1: Branch**

```bash
git switch -c c-drive-explorer
```

- [ ] **Step 2: Write the failing tests** — append to `src/apps/projectFiles.test.js`, and change its import line to:

```js
import { educationFiles, educationReadme, projectFiles } from './projectFiles'
```

```js
describe('pdf docs', () => {
  it('classifies a .pdf doc as pdf and anything else as text', () => {
    const files = projectFiles({
      ...base,
      docs: ['/a/notes.txt', '/a/paper.pdf', '/a/SCAN.PDF', '/a/report.pdf?v=2'],
    })
    expect(files.slice(1).map((f) => [f.name, f.type])).toEqual([
      ['notes.txt', 'text'],
      ['paper.pdf', 'pdf'],
      ['SCAN.PDF', 'pdf'],
      ['report.pdf', 'pdf'],
    ])
  })
})

const entry = {
  slug: 'bsc',
  name: 'Bachelor_of_Science',
  institution: 'University Name',
  program: 'Program Name',
  dates: '20XX – 20XX',
  gpa: '',
  status: 'Completed',
  verifyUrl: '',
  description: [],
  docs: [],
  screenshots: [],
  videos: [],
  links: [],
}

describe('educationReadme', () => {
  it('lists only the populated details, one per line', () => {
    expect(educationReadme(entry)).toBe(
      'Institution: University Name\nProgram: Program Name\nDates: 20XX – 20XX\nStatus: Completed',
    )
  })

  it('treats whitespace-only fields as empty', () => {
    expect(educationReadme({ ...entry, gpa: '   ', dates: '' })).not.toMatch(/GPA|Dates/)
  })

  it('adds the verify link, then a blank line and the description', () => {
    const text = educationReadme({
      ...entry,
      gpa: '3.9',
      verifyUrl: 'https://verify.example/abc',
      description: ['Line one.', 'Line two.'],
    })
    expect(text).toBe(
      'Institution: University Name\nProgram: Program Name\nDates: 20XX – 20XX\nGPA: 3.9\nStatus: Completed\nVerify: https://verify.example/abc\n\nLine one.\nLine two.',
    )
  })

  it('is just the description when no details are set, with no leading blank line', () => {
    const bare = { name: 'x', description: ['Only this.'] }
    expect(educationReadme(bare)).toBe('Only this.')
  })
})

describe('educationFiles', () => {
  it('leads with README.txt built from the details', () => {
    const [readme] = educationFiles(entry)
    expect(readme).toEqual({ name: 'README.txt', type: 'text', text: educationReadme(entry) })
  })

  it('attaches the details to pdf files only', () => {
    const files = educationFiles({
      ...entry,
      verifyUrl: 'https://verify.example/abc',
      docs: ['/e/diploma.pdf', '/e/notes.txt'],
    })
    const pdf = files.find((f) => f.type === 'pdf')
    expect(pdf.details).toEqual({
      fields: [
        { label: 'Institution', value: 'University Name' },
        { label: 'Program', value: 'Program Name' },
        { label: 'Dates', value: '20XX – 20XX' },
        { label: 'Status', value: 'Completed' },
      ],
      verifyUrl: 'https://verify.example/abc',
    })
    expect(files.find((f) => f.name === 'notes.txt').details).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run to verify they fail**

Run: `npx vitest run src/apps/projectFiles.test.js`
Expected: FAIL — `educationFiles`/`educationReadme` are not exported; the pdf test sees `'text'`.

- [ ] **Step 4: Implement** — in `src/apps/projectFiles.js`, change `const deduped =` to `export const deduped =`, then replace the whole `export function projectFiles(project) { … }` with:

```js
// A doc is a PDF by extension, ignoring any query string or fragment.
const isPdf = (src) => /\.pdf$/i.test(src.split(/[?#]/)[0])

// The media fields Projects and Homework entries share. `readme` is the text
// of the README.txt every folder leads with.
export function folderFiles(readme, entry) {
  const files = [{ name: 'README.txt', type: 'text', text: readme }]
  // Docs carry a src rather than inline text: they live on disk and are read
  // when opened. A PDF goes to the PDF Viewer, never to Notepad as bytes.
  for (const src of entry.docs ?? []) {
    if (src) files.push({ name: basename(src), type: isPdf(src) ? 'pdf' : 'text', src })
  }
  for (const src of entry.screenshots ?? []) {
    if (src) files.push({ name: basename(src), type: 'image', src })
  }
  for (const src of entry.videos ?? []) {
    if (src) files.push({ name: basename(src), type: 'video', src })
  }
  for (const { label, href } of entry.links ?? []) {
    if (label && href) files.push({ name: `${label}.url`, type: 'link', href })
  }
  return deduped(files)
}

export const projectFiles = (project) =>
  folderFiles((project.description ?? []).join('\n'), project)

// Homework details, in display order. Empty (or whitespace-only) fields are
// dropped here, so nothing downstream ever prints a bare label.
const DETAILS = [
  ['institution', 'Institution'],
  ['program', 'Program'],
  ['dates', 'Dates'],
  ['gpa', 'GPA'],
  ['status', 'Status'],
]

const clean = (value) => String(value ?? '').trim()

export function educationDetails(entry) {
  const fields = DETAILS.map(([key, label]) => ({ label, value: clean(entry[key]) })).filter(
    (f) => f.value,
  )
  return { fields, verifyUrl: clean(entry.verifyUrl) }
}

export function educationReadme(entry) {
  const { fields, verifyUrl } = educationDetails(entry)
  const lines = fields.map(({ label, value }) => `${label}: ${value}`)
  if (verifyUrl) lines.push(`Verify: ${verifyUrl}`)
  const description = entry.description ?? []
  if (lines.length && description.length) lines.push('')
  return [...lines, ...description].join('\n')
}

// A Homework folder: README from the details, the shared media, and the
// details riding along on each PDF for the viewer's strip.
export function educationFiles(entry) {
  const details = educationDetails(entry)
  return folderFiles(educationReadme(entry), entry).map((f) =>
    f.type === 'pdf' ? { ...f, details } : f,
  )
}
```

Also update the file's header comment's first line to: `// Turns a project or education entry into the files its folder shows. The list is derived`.

- [ ] **Step 5: Run to verify they pass**

Run: `npx vitest run src/apps/projectFiles.test.js`
Expected: PASS, including every pre-existing `projectFiles` test.

- [ ] **Step 6: Commit**

```bash
git add src/apps/projectFiles.js src/apps/projectFiles.test.js
git commit -m "Derive folder files for Homework entries; route .pdf docs to pdf

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The C: drive

**Files:**
- Create: `src/apps/fileSystem.js`
- Test: `src/apps/fileSystem.test.js`

**Interfaces:**
- Consumes: `deduped`, `projectFiles`, `educationFiles` from Task 1.
- Produces:
  - `PROJECTS_PATH = ['My Projects']`, `HOMEWORK_PATH = ['Homework']`
  - `buildDrive({ projects, education }) → Folder` where `Folder` is `{ type: 'folder', name, children: (Folder|File)[] }`
  - `resolve(root, path: string[]) → Folder | null`
  - `parent(path) → string[]`
  - `nearest(root, path) → string[]` (longest prefix that resolves)
  - `displayPath(path) → string` (`'C:\\'`, `'C:\\Homework\\X'`)
  - `folderTitle(path) → string` (`'(C:)'` at root, else the last name)

- [ ] **Step 1: Write the failing tests** — `src/apps/fileSystem.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  HOMEWORK_PATH,
  PROJECTS_PATH,
  buildDrive,
  displayPath,
  folderTitle,
  nearest,
  parent,
  resolve,
} from './fileSystem'

const drive = buildDrive({
  projects: [
    { slug: 'a', name: 'Alpha', description: ['Alpha'] },
    { slug: 'b', name: 'Alpha', description: ['Second Alpha'] },
  ],
  education: [{ slug: 'bsc', name: 'Bachelor_of_Science', status: 'Completed' }],
})

describe('buildDrive', () => {
  it('puts My Projects and Homework at the root', () => {
    expect(drive.children.map((c) => [c.type, c.name])).toEqual([
      ['folder', 'My Projects'],
      ['folder', 'Homework'],
    ])
  })

  it('gives each entry a folder of its files', () => {
    const bsc = resolve(drive, [...HOMEWORK_PATH, 'Bachelor_of_Science'])
    expect(bsc.children[0]).toMatchObject({ name: 'README.txt', text: 'Status: Completed' })
  })

  it('makes folder names unique within their parent', () => {
    expect(resolve(drive, PROJECTS_PATH).children.map((c) => c.name)).toEqual([
      'Alpha',
      'Alpha (2)',
    ])
  })

  it('skips entries with no name and tolerates missing lists', () => {
    const d = buildDrive({ projects: [{ slug: 'x' }] })
    expect(resolve(d, PROJECTS_PATH).children).toEqual([])
    expect(resolve(d, HOMEWORK_PATH).children).toEqual([])
  })
})

describe('resolve', () => {
  it('returns the root for the empty path', () => {
    expect(resolve(drive, [])).toBe(drive)
  })

  it('returns null for a missing folder or a path through a file', () => {
    expect(resolve(drive, ['Nope'])).toBeNull()
    expect(resolve(drive, [...PROJECTS_PATH, 'Alpha', 'README.txt'])).toBeNull()
  })
})

describe('paths', () => {
  it('parent drops the last segment and stays at the root', () => {
    expect(parent(['Homework', 'X'])).toEqual(['Homework'])
    expect(parent([])).toEqual([])
  })

  it('nearest walks up to the closest folder that still exists', () => {
    expect(nearest(drive, ['Homework', 'Gone'])).toEqual(['Homework'])
    expect(nearest(drive, ['Gone', 'Deeper'])).toEqual([])
    expect(nearest(drive, PROJECTS_PATH)).toEqual(PROJECTS_PATH)
  })

  it('displays as a C: path and titles the window by folder', () => {
    expect(displayPath([])).toBe('C:\\')
    expect(displayPath(['Homework', 'X'])).toBe('C:\\Homework\\X')
    expect(folderTitle([])).toBe('(C:)')
    expect(folderTitle(['Homework', 'X'])).toBe('X')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/apps/fileSystem.test.js`
Expected: FAIL — `Cannot find module './fileSystem'`.

- [ ] **Step 3: Implement** — `src/apps/fileSystem.js`:

```js
import { deduped, educationFiles, projectFiles } from './projectFiles'

// The virtual C: drive, built from the content JSON — never declared by hand,
// so nothing in it can point at an entry that doesn't exist. A path is the
// list of folder names from the root: [] is C:\.

export const PROJECTS_PATH = ['My Projects']
export const HOMEWORK_PATH = ['Homework']

const folder = (name, children) => ({ type: 'folder', name, children })

// Explorer keys icons by name, so sibling folders are made unique the same
// way files are.
const entryFolders = (entries, filesOf) =>
  deduped(entries.filter((e) => e?.name).map((e) => folder(e.name, filesOf(e))))

export function buildDrive({ projects = [], education = [] }) {
  return folder('(C:)', [
    folder(PROJECTS_PATH[0], entryFolders(projects, projectFiles)),
    folder(HOMEWORK_PATH[0], entryFolders(education, educationFiles)),
  ])
}

// The folder at `path`, or null if any step is missing or isn't a folder.
export function resolve(root, path) {
  let node = root
  for (const name of path) {
    node = node.children.find((c) => c.type === 'folder' && c.name === name)
    if (!node) return null
  }
  return node
}

export const parent = (path) => path.slice(0, -1)

// A folder removed from the JSON under hot reload leaves its window pointing
// nowhere; it shows the closest folder above that still exists.
export function nearest(root, path) {
  let p = path
  while (p.length && !resolve(root, p)) p = parent(p)
  return p
}

export const displayPath = (path) => `C:\\${path.join('\\')}`

export const folderTitle = (path) => path.at(-1) ?? '(C:)'
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/apps/fileSystem.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/fileSystem.js src/apps/fileSystem.test.js
git commit -m "Add the virtual C: drive built from projects and education

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: PDF guard

**Files:**
- Create: `src/apps/loadPdf.js`
- Test: `src/apps/loadPdf.test.js`

**Interfaces:**
- Produces: `checkPdf(src: string, fetchImpl = fetch) → Promise<void>` — resolves when the file is safe to embed; rejects when not OK or served as HTML. Does not fetch non-root-relative URLs.

- [ ] **Step 1: Write the failing tests** — `src/apps/loadPdf.test.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { checkPdf } from './loadPdf'

// A stand-in for the one fetch call this module makes.
const respond = ({ ok = true, status = 200, type = 'application/pdf' }) =>
  vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      headers: { get: (h) => (h.toLowerCase() === 'content-type' ? type : null) },
    }),
  )

describe('checkPdf', () => {
  it('resolves for a PDF, asking with HEAD so the file is not downloaded twice', async () => {
    const fetchImpl = respond({})
    await expect(checkPdf('/assets/education/bsc/diploma.pdf', fetchImpl)).resolves.toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledWith('/assets/education/bsc/diploma.pdf', { method: 'HEAD' })
  })

  it('rejects the SPA fallback that answers a mistyped path with index.html', async () => {
    await expect(checkPdf('/assets/typo.pdf', respond({ type: 'text/html; charset=utf-8' }))).rejects.toThrow(
      /app shell/,
    )
  })

  it('rejects a non-OK response', async () => {
    await expect(checkPdf('/assets/x.pdf', respond({ ok: false, status: 404 }))).rejects.toThrow(/404/)
  })

  it('does not check external URLs, which a cross-origin HEAD would fail on CORS', async () => {
    const fetchImpl = respond({})
    await expect(checkPdf('https://example.org/cert.pdf', fetchImpl)).resolves.toBeUndefined()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/apps/loadPdf.test.js`
Expected: FAIL — `Cannot find module './loadPdf'`.

- [ ] **Step 3: Implement** — `src/apps/loadPdf.js`:

```js
/**
 * Checks a PDF is really there before the viewer embeds it.
 *
 * public/ sits behind the SPA's index.html fallback, so a mistyped path
 * answers 200 with the app shell — embedded, that would show the whole
 * desktop inside the viewer. Same guard as loadTextFile, but with HEAD so
 * the PDF isn't downloaded twice. Only our own root-relative files are
 * checked: an external URL can't be HEADed across origins without CORS, and
 * isn't behind our fallback anyway. `fetchImpl` is injected only for tests.
 */
export async function checkPdf(src, fetchImpl = fetch) {
  if (!src.startsWith('/')) return
  const response = await fetchImpl(src, { method: 'HEAD' })
  if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`)
  if (/html/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`${src}: served the app shell, not a PDF`)
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/apps/loadPdf.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/loadPdf.js src/apps/loadPdf.test.js
git commit -m "Add a PDF guard against the SPA index.html fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: One file-type → program rule

**Files:**
- Create: `src/apps/openFile.js`
- Test: `src/apps/openFile.test.js`
- Modify: `src/os/windowReducer.test.js` (append one test)

**Interfaces:**
- Consumes: `displayPath` from Task 2; `File` shape from Task 1.
- Produces: `openFile(file: File, { siblings: (File|Folder)[], path: string[], openApp, openLink? }) → void`. Programs: `notepad`, `photos`, `media`, `pdfviewer` (registered in Task 5), links via `openLink(href)` (default opens a new tab).

- [ ] **Step 1: Write the failing tests** — `src/apps/openFile.test.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { openFile } from './openFile'

const readme = { name: 'README.txt', type: 'text', text: 'hi' }
const doc = { name: 'notes.txt', type: 'text', src: '/n.txt' }
const a = { name: 'a.jpg', type: 'image', src: '/a.jpg' }
const b = { name: 'b.jpg', type: 'image', src: '/b.jpg' }
const clip = { name: 'clip.mp4', type: 'video', src: '/c.mp4' }
const details = { fields: [{ label: 'Status', value: 'Completed' }], verifyUrl: '' }
const pdf = { name: 'diploma.pdf', type: 'pdf', src: '/d.pdf', details }
const link = { name: 'GitHub.url', type: 'link', href: 'https://github.com' }
const siblings = [readme, doc, a, clip, b, pdf, link]

const run = (file, path = ['Homework', 'Bachelor_of_Science']) => {
  const openApp = vi.fn()
  const openLink = vi.fn()
  openFile(file, { siblings, path, openApp, openLink })
  return { openApp, openLink }
}

describe('openFile', () => {
  it('opens text in Notepad, keyed by full path', () => {
    const { openApp } = run(readme)
    expect(openApp).toHaveBeenCalledWith('notepad', {
      key: 'C:\\Homework\\Bachelor_of_Science\\README.txt',
      title: 'README.txt - Notepad',
      payload: { name: 'README.txt', text: 'hi', src: undefined },
    })
  })

  it('gives same-named files in different folders different Notepad keys', () => {
    const one = run(readme, ['My Projects', 'Alpha']).openApp.mock.calls[0][1].key
    const two = run(readme, ['Homework', 'Bachelor_of_Science']).openApp.mock.calls[0][1].key
    expect(one).not.toBe(two)
  })

  it('opens an image in Photos with only this folder’s images', () => {
    const { openApp } = run(b)
    expect(openApp).toHaveBeenCalledWith('photos', {
      title: 'b.jpg - Photos',
      payload: {
        images: [
          { name: 'a.jpg', src: '/a.jpg' },
          { name: 'b.jpg', src: '/b.jpg' },
        ],
        index: 1,
      },
    })
  })

  it('opens video in Media Player', () => {
    expect(run(clip).openApp).toHaveBeenCalledWith('media', {
      title: 'clip.mp4 - Media Player',
      payload: { name: 'clip.mp4', src: '/c.mp4' },
    })
  })

  it('opens a pdf in the PDF Viewer with its details', () => {
    expect(run(pdf).openApp).toHaveBeenCalledWith('pdfviewer', {
      title: 'diploma.pdf - PDF Viewer',
      payload: { name: 'diploma.pdf', src: '/d.pdf', details },
    })
  })

  it('opens a link in a new tab and no program', () => {
    const { openApp, openLink } = run(link)
    expect(openLink).toHaveBeenCalledWith('https://github.com')
    expect(openApp).not.toHaveBeenCalled()
  })
})
```

Append to `src/os/windowReducer.test.js` inside the existing `describe('OPEN_APP single-instance apps', …)` block:

```js
  it('clears the payload when reopened with none, so a desktop icon resets its window', () => {
    // Explorer reads a missing payload as "go to my start folder".
    let state = open(initialState, 'photos', photos, { payload: { path: ['Homework'] } })
    state = open(state, 'photos', photos)
    expect(only(state).payload).toBeUndefined()
  })
```

- [ ] **Step 2: Run to verify**

Run: `npx vitest run src/apps/openFile.test.js src/os/windowReducer.test.js`
Expected: `openFile.test.js` FAILS (`Cannot find module './openFile'`). The reducer test should already PASS — it pins existing behaviour Explorer now depends on; if it fails, stop and report rather than changing the reducer.

- [ ] **Step 3: Implement** — `src/apps/openFile.js`:

```js
import { displayPath } from './fileSystem'

const openTab = (href) => window.open(href, '_blank', 'noopener')

/**
 * Opens a file in the program for its type — the same rule everywhere on the
 * drive. `siblings` is the folder's contents (Photos' Previous/Next stays
 * scoped to it) and `path` the folder's path. `openLink` is injectable for
 * tests.
 */
export function openFile(file, { siblings, path, openApp, openLink = openTab }) {
  switch (file.type) {
    case 'text':
      openApp('notepad', {
        // Keyed by full path: every folder has a README.txt, and each must
        // get its own window while the same file twice focuses the one open.
        key: displayPath([...path, file.name]),
        title: `${file.name} - Notepad`,
        // The README carries its text; a doc carries the path Notepad reads.
        payload: { name: file.name, text: file.text, src: file.src },
      })
      break
    case 'image': {
      const images = siblings
        .filter((f) => f.type === 'image')
        .map(({ name, src }) => ({ name, src }))
      openApp('photos', {
        title: `${file.name} - Photos`,
        payload: { images, index: images.findIndex((i) => i.src === file.src) },
      })
      break
    }
    case 'video':
      openApp('media', {
        title: `${file.name} - Media Player`,
        payload: { name: file.name, src: file.src },
      })
      break
    case 'pdf':
      openApp('pdfviewer', {
        title: `${file.name} - PDF Viewer`,
        payload: { name: file.name, src: file.src, details: file.details },
      })
      break
    case 'link':
      openLink(file.href)
      break
  }
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run src/apps/openFile.test.js src/os/windowReducer.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/openFile.js src/apps/openFile.test.js src/os/windowReducer.test.js
git commit -m "Map file types to programs in one place

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: PDF Viewer program

**Files:**
- Create: `src/apps/PdfViewer.jsx`
- Modify: `src/apps/registry.jsx`, `src/styles/viewers.css`, `public/icons.svg`

**Interfaces:**
- Consumes: `checkPdf` (Task 3); payload `{ name, src, details? }` from `openFile` (Task 4).
- Produces: registry entry `pdfviewer`; symbol `icon-file-pdf`.

- [ ] **Step 1: Add the icon** — in `public/icons.svg`, directly after the `icon-file-url` symbol (before `</svg>`):

```xml
  <symbol id="icon-file-pdf" viewBox="0 0 32 32" shape-rendering="crispEdges">
    <path d="M7 2h13l6 6v22H7z" fill="#fff" stroke="#000" stroke-width="1"/>
    <path d="M20 2v6h6" fill="#dfdfdf" stroke="#000" stroke-width="1"/>
    <rect x="4" y="17" width="20" height="8" fill="#c00000" stroke="#000" stroke-width="1"/>
    <path d="M6 19h3v1H7v1h2v1H7v1H6zM10 19h3v4h-3zM11 20v2h1v-2zM14 19h3v1h-2v1h2v1h-2v1h-1z" fill="#fff"/>
    <rect x="10" y="11" width="12" height="1" fill="#808080"/>
    <rect x="10" y="13" width="9" height="1" fill="#808080"/>
  </symbol>
```

- [ ] **Step 2: Write the component** — `src/apps/PdfViewer.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { checkPdf } from './loadPdf'

/**
 * PDF Viewer. The payload is { name, src, details? }. The browser's own
 * reader draws the document in an iframe — but only after checkPdf confirms
 * the path really is a PDF, because a mistyped one is answered with the app
 * shell. `details` comes from Homework entries ({ fields, verifyUrl }) and
 * shows as a strip above the page; a project PDF has none and shows none.
 */
export default function PdfViewer({ payload }) {
  const { name, src, details } = payload ?? {}
  // Keyed by src so opening another file shows its own state, not the last.
  const [check, setCheck] = useState(null)

  useEffect(() => {
    if (!src) return
    // A slow check of the file we just left must not land on this one.
    let ignore = false
    checkPdf(src).then(
      () => !ignore && setCheck({ src, ok: true }),
      () => !ignore && setCheck({ src, ok: false }),
    )
    return () => {
      ignore = true
    }
  }, [src])

  if (!src) return <p className="viewer-empty">No file open.</p>

  const fields = details?.fields ?? []
  const verifyUrl = details?.verifyUrl
  const state = check?.src !== src ? 'checking' : check.ok ? 'ok' : 'failed'

  return (
    <div className="app-pane pdf">
      {(fields.length > 0 || verifyUrl) && (
        <div className="pdf-details">
          <dl>
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {verifyUrl && (
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
              View original
            </a>
          )}
        </div>
      )}

      <div className="viewer-toolbar">
        {/* Mobile browsers often won't draw a PDF inline; this always works. */}
        {state === 'ok' && (
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open in new tab
          </a>
        )}
      </div>

      <div className="pdf-page app-grow">
        {state === 'checking' && <p className="viewer-empty">Opening {name}…</p>}
        {state === 'failed' && <p className="viewer-empty">Cannot display {name}.</p>}
        {state === 'ok' && <iframe key={src} className="pdf-frame" src={src} title={name} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Styles** — append to `src/styles/viewers.css`:

```css
/* --- PDF Viewer ------------------------------------------------------ */

/* Homework details: label/value pairs that wrap as the window narrows. */
.pdf-details {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 16px;
  margin: 0 0 3px;
  padding: 6px 8px;
  background: var(--button-highlight);
  box-shadow: inset -1px -1px var(--button-highlight),
    inset 1px 1px var(--button-shadow);
}

.pdf-details dl {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0;
}

.pdf-details dl div {
  display: flex;
  gap: 4px;
}

.pdf-details dt {
  font-weight: bold;
}

.pdf-details dt::after {
  content: ':';
}

.pdf-details dd {
  margin: 0;
}

.pdf .viewer-toolbar {
  min-height: 27px;
}

.pdf .viewer-toolbar a {
  padding: 0 4px;
}

/* Grey mat, sunk into the window like the Photos frame. */
.pdf-page {
  display: flex;
  background: var(--button-shadow);
  box-shadow: inset -1px -1px var(--button-highlight),
    inset 1px 1px var(--window-frame);
}

.pdf-frame {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--button-highlight);
}

.pdf-page .viewer-empty {
  color: var(--button-highlight);
}
```

- [ ] **Step 4: Register it** — in `src/apps/registry.jsx`, add `import PdfViewer from './PdfViewer'` after the `MediaPlayer` import, and add after the `media` entry:

```js
  pdfviewer: {
    title: 'PDF Viewer',
    icon: 'icon-file-pdf',
    // A page is taller than it is wide; give it the height.
    defaultSize: { w: 0.6, h: 0.9, min: { w: 480, h: 400 } },
    Component: PdfViewer,
  },
```

- [ ] **Step 5: Verify**

Run: `npm test && npm run build && npm run lint`
Expected: tests PASS; build succeeds; lint shows only the 4 pre-existing errors.

- [ ] **Step 6: Commit**

```bash
git add src/apps/PdfViewer.jsx src/apps/registry.jsx src/styles/viewers.css public/icons.svg
git commit -m "Add the PDF Viewer program

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Explorer over the drive, Homework folder and data

**Files:**
- Create: `src/apps/Explorer.jsx`, `src/apps/Homework.jsx`, `src/content/education.json`, `public/assets/education/README.md`
- Rewrite: `src/apps/Projects.jsx`
- Modify: `src/apps/registry.jsx`, `public/icons.svg`

**Interfaces:**
- Consumes: `buildDrive`, `resolve`, `parent`, `nearest`, `displayPath`, `folderTitle`, `PROJECTS_PATH`, `HOMEWORK_PATH` (Task 2); `openFile` (Task 4); `useWindowActions().update(id, { title, payload })`, `openApp`.
- Produces: `Explorer({ windowId, payload, start })`; registry entry `homework`; symbol `icon-homework`.

- [ ] **Step 1: Data** — `src/content/education.json`:

```json
{
  "_note": "One folder per entry under C:\\Homework. `name` is the folder name. Empty fields are hidden everywhere. README.txt is built from institution, program, dates, gpa, status and verifyUrl, then `description` (a list of lines). `docs` (.pdf opens in the PDF Viewer with these details across the top, anything else in Notepad), `screenshots`, `videos` and `links` work exactly as in projects.json. Files go in public/assets/education/<slug>/ — see the README there.",

  "education": [
    {
      "slug": "bachelors",
      "name": "Bachelor_of_Science",
      "institution": "University Name",
      "program": "Bachelor of Science in Program Name",
      "dates": "20XX – 20XX",
      "gpa": "",
      "status": "Completed",
      "verifyUrl": "",
      "description": ["Placeholder: a line or two about this degree."],
      "docs": [],
      "screenshots": [],
      "videos": [],
      "links": []
    },
    {
      "slug": "masters",
      "name": "Masters_in_progress",
      "institution": "University Name",
      "program": "Master of Program Name",
      "dates": "20XX – present",
      "gpa": "",
      "status": "In Progress",
      "verifyUrl": "",
      "description": ["Placeholder: a line or two about this degree."],
      "docs": [],
      "screenshots": [],
      "videos": [],
      "links": []
    },
    {
      "slug": "cybersecurity-cert",
      "name": "Cybersecurity_Cert",
      "institution": "Issuing Organization",
      "program": "Certification Name",
      "dates": "Issued 20XX",
      "gpa": "",
      "status": "Completed",
      "verifyUrl": "",
      "description": ["Placeholder: what this certification covers."],
      "docs": [],
      "screenshots": [],
      "videos": [],
      "links": []
    }
  ]
}
```

- [ ] **Step 2: Asset README** — `public/assets/education/README.md`:

````markdown
# Education files

One folder per entry, named by the entry's `slug` in
`src/content/education.json`. Drop certificates, transcripts, notes or images
in, then point the JSON at them.

Paths are **absolute from the site root** — write `/assets/education/…`, with
a leading slash and *without* `public`.

```jsonc
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
````

- [ ] **Step 3: Icon** — in `public/icons.svg`, directly after the `icon-projects` symbol:

```xml
  <!-- Homework: a folder with an apple for the teacher. -->
  <symbol id="icon-homework" viewBox="0 0 32 32" shape-rendering="crispEdges">
    <path d="M3 7h10l3 3h13v18H3z" fill="#ffd020" stroke="#000" stroke-width="1"/>
    <path d="M3 12h26v16H3z" fill="#ffe680" stroke="#000" stroke-width="1"/>
    <path d="M14 17h7v1h1v5h-1v1h-2v-1h-2v1h-2v-1h-1v-5h1z" fill="#d00000" stroke="#000" stroke-width="1"/>
    <rect x="17" y="14" width="1" height="3" fill="#5a3000"/>
    <rect x="18" y="14" width="2" height="1" fill="#00a000"/>
    <rect x="15" y="18" width="1" height="2" fill="#ff8080"/>
  </symbol>
```

- [ ] **Step 4: Explorer** — `src/apps/Explorer.jsx`:

```jsx
import { useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import projectsData from '../content/projects.json'
import educationData from '../content/education.json'
import { buildDrive, displayPath, folderTitle, nearest, parent, resolve } from './fileSystem'
import { openFile } from './openFile'
import FileIcon from './FileIcon'
import MenuBar from './MenuBar'

const drive = buildDrive({
  projects: projectsData.projects,
  education: educationData.education,
})

const ICON = {
  folder: 'icon-projects',
  text: 'icon-file-txt',
  image: 'icon-file-jpg',
  video: 'icon-file-mp4',
  pdf: 'icon-file-pdf',
  link: 'icon-file-url',
}

/**
 * A Win98 folder window over the C: drive. The current path lives in the
 * window payload ({ path }), as Photos keeps its index there; with no
 * payload — which is how the desktop opens it — the window shows `start`.
 * Single-instance reopen clears the payload, so a desktop icon always brings
 * its window back to its own folder.
 */
export default function Explorer({ windowId, payload, start }) {
  const { openApp, update } = useWindowActions()
  // Selection remembers which folder it was made in, so navigating clears
  // it without an effect.
  const [selection, setSelection] = useState({ at: null, name: null })

  const path = nearest(drive, payload?.path ?? start)
  const folder = resolve(drive, path)
  const here = displayPath(path)
  const selected = selection.at === here ? selection.name : null

  const go = (next) =>
    update(windowId, { title: folderTitle(next), payload: { path: next } })

  const open = (item) =>
    item.type === 'folder'
      ? go([...path, item.name])
      : openFile(item, { siblings: folder.children, path, openApp })

  return (
    <div className="app-pane explorer">
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />

      <div className="explorer-toolbar">
        <button type="button" onClick={() => go(parent(path))} disabled={path.length === 0}>
          Up
        </button>
      </div>

      <div className="explorer-address">
        <span>Address</span>
        <div className="explorer-address-field">{here}</div>
      </div>

      <div
        className="sunken-panel app-grow explorer-body"
        onPointerDown={(e) => {
          // Only clear the selection when the press landed on empty space.
          if (!e.target.closest('.file-icon')) setSelection({ at: null, name: null })
        }}
      >
        <div className="explorer-grid">
          {folder.children.map((item) => (
            <FileIcon
              key={item.name}
              icon={ICON[item.type]}
              label={item.name}
              selected={selected === item.name}
              onSelect={() => setSelection({ at: here, name: item.name })}
              onOpen={() => open(item)}
            />
          ))}
        </div>
      </div>

      <div className="status-bar">
        <p className="status-bar-field">{folder.children.length} object(s)</p>
        <p className="status-bar-field">{selected ?? ''}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wrappers** — replace all of `src/apps/Projects.jsx` with:

```jsx
import Explorer from './Explorer'
import { PROJECTS_PATH } from './fileSystem'

// The My Projects desktop icon: Explorer, starting at C:\My Projects.
export default function Projects(props) {
  return <Explorer {...props} start={PROJECTS_PATH} />
}
```

Create `src/apps/Homework.jsx`:

```jsx
import Explorer from './Explorer'
import { HOMEWORK_PATH } from './fileSystem'

// The Homework desktop icon: Explorer, starting at C:\Homework. A separate
// registry entry from My Projects, so the two always get separate windows.
export default function Homework(props) {
  return <Explorer {...props} start={HOMEWORK_PATH} />
}
```

- [ ] **Step 6: Register** — in `src/apps/registry.jsx`: add `import Homework from './Homework'` after the `Projects` import; replace the `projects` entry's comment `// The Explorer retitles itself to the open folder; this is the root.` with `// Explorer at C:\My Projects; it retitles itself as it navigates.`; add after the `projects` entry:

```js
  homework: {
    // Explorer at C:\Homework. Its own entry, so it gets its own window.
    title: 'Homework',
    icon: 'icon-homework',
    defaultSize: { w: 0.5, h: 0.6, min: { w: 560, h: 400 }, max: { w: 900, h: 700 } },
    Component: Homework,
  },
```

and insert `'homework',` in `APP_ORDER` directly after `'projects',`.

- [ ] **Step 7: Verify**

Run: `npm test && npm run build && npm run lint`
Expected: tests PASS; build succeeds; lint shows only the 4 pre-existing errors.

- [ ] **Step 8: Click-through** — `npm run dev`, then in a browser (or a headless-Chrome CDP script):
  1. Desktop shows **Homework** after My Projects. Double-click My Projects → window titled `My Projects`, Address `C:\My Projects`, one folder per project.
  2. Double-click Homework → a **second** window, Address `C:\Homework`, three folders.
  3. In the My Projects window press Up → title `(C:)`, Address `C:\`, two folders, Up greyed. Open Homework from there → that window now shows `C:\Homework`.
  4. Double-click the My Projects desktop icon → that window returns to `C:\My Projects`.
  5. In `C:\Homework\Bachelor_of_Science`, open `README.txt` → Notepad shows `Institution: University Name` … `Status: Completed`, a blank line, the placeholder description; no `GPA:` line. Open a project's `README.txt` → a separate Notepad window.
  6. PDF: generate a scratch PDF outside the repo, copy it to `public/assets/education/bachelors/test.pdf`, add `"/assets/education/bachelors/test.pdf"` to that entry's `docs`, open it → PDF Viewer shows the details strip and the page. Change the path to `test-typo.pdf` → *Cannot display test-typo.pdf.* Add the same file to a project's `docs` → opens with no strip. **Revert both JSON edits and delete the PDF** before committing (`git status` must show neither).

- [ ] **Step 9: Commit**

```bash
git add src/apps/Explorer.jsx src/apps/Projects.jsx src/apps/Homework.jsx src/apps/registry.jsx src/content/education.json public/assets/education/README.md public/icons.svg
git commit -m "Browse a C: drive from one Explorer; add the Homework folder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: vitest scope** — in the Commands section, change the list to begin: `` `src/os/windowReducer.js` (including `openStartup`), `src/os/windowSize.js`, `src/apps/zoom.js`, `src/apps/projectFiles.js`, `src/apps/fileSystem.js`, `src/apps/openFile.js`, `src/apps/loadTextFile.js`, `src/apps/loadPdf.js`, ``…(rest unchanged).

- [ ] **Step 2: Content list** — in Architecture, change `` `about`, `projects`, `experience`, `skills`, `contact` `` to `` `about`, `projects`, `education`, `experience`, `skills`, `contact` ``.

- [ ] **Step 3: Rename and extend the Projects section** — change the heading `### Projects program (file explorer)` to `### Explorer, the C: drive, and the file programs`, replace its first paragraph with:

```markdown
`src/apps/Explorer.jsx` is a Win98 folder window over a virtual `C:\` built by `src/apps/fileSystem.js` from `projects.json` and `education.json`: `C:\My Projects` (a folder per project) and `C:\Homework` (a folder per degree or certification). Up from either reaches `C:\`, which is left roomy for a planned easter egg. Files open in `notepad`, `photos`, `media` or `pdfviewer` (`Notepad.jsx`, `Photos.jsx`, `MediaPlayer.jsx`, `PdfViewer.jsx`), chosen by file type alone in `src/apps/openFile.js`. Design records: `docs/superpowers/specs/2026-09-13-projects-explorer-design.md`, `docs/superpowers/specs/2026-10-01-c-drive-explorer-design.md`.

- **Two desktop icons, one Explorer.** `projects` and `homework` are separate single-instance registry entries (`Projects.jsx`, `Homework.jsx` are three-line wrappers passing `start`), so each icon has its own window. The current path lives in the window payload (`{ path }`); the desktop opens with no payload, and single-instance reopen swaps that in, so double-clicking an icon always returns its window to its own folder. `windowReducer.test.js` pins the payload-clearing.
- **A path is an array of folder names**; `resolve`, `parent` and `nearest` are all Explorer uses. `nearest` walks a path that no longer resolves (JSON edited under hot reload) up to the closest folder that does. Folder names are made unique within their parent like filenames.
```

then add, after the bullet beginning `**Two kinds of text file reach Notepad.**`:

```markdown
- **`docs` are classified by extension**: `.pdf` → the PDF Viewer, anything else → Notepad. Projects and Homework entries share `docs`, `screenshots`, `videos` and `links` through `folderFiles`. A Homework folder's `README.txt` is built from its populated details (`Institution:` … `Status:`, `Verify:`), then `description`; empty fields never print a bare label.
- **The PDF Viewer checks before it embeds.** `loadPdf.js`'s `checkPdf` sends a HEAD and rejects non-OK or HTML responses — the same SPA-fallback trap as `loadTextFile`, which embedded would show the desktop inside the viewer. External URLs skip the check (cross-origin HEAD fails on CORS). A Homework PDF carries its entry's `details`, shown as a strip with **View original** for `verifyUrl`; project PDFs carry none. **Open in new tab** is the fallback for mobile browsers that won't draw PDFs inline.
```

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`
Expected: PASS, build succeeds.

```bash
git add CLAUDE.md
git commit -m "Document the C: drive, Homework and the PDF Viewer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
