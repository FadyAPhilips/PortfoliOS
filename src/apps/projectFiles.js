// Turns a project or education entry into the files its folder shows. The list is derived
// from the data rather than declared in it, so nothing in the UI can point at
// a file the JSON doesn't back.

// Filename without directory, query string or fragment — the last two matter
// for externally hosted video ("clip.mp4?token=…").
const basename = (path) => path.split(/[?#]/)[0].split('/').pop()

// "shot.jpg" + 2 → "shot (2).jpg". The suffix goes before the extension so the
// name still reads as a file of that type.
const suffixed = (name, n) => {
  const dot = name.lastIndexOf('.')
  return dot < 1 ? `${name} (${n})` : `${name.slice(0, dot)} (${n})${name.slice(dot)}`
}

// Explorer keys both its icons and its selection by name, so two files sharing
// one would collapse into a single selectable icon. Two screenshots can share a
// basename across folders, and two links can share a label, so names are made
// unique here rather than trusted from the JSON.
export const deduped = (files) => {
  const seen = new Map()
  return files.map((file) => {
    const n = (seen.get(file.name) ?? 0) + 1
    seen.set(file.name, n)
    return n === 1 ? file : { ...file, name: suffixed(file.name, n) }
  })
}

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
