// Turns a project entry into the files its folder shows. The list is derived
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
const deduped = (files) => {
  const seen = new Map()
  return files.map((file) => {
    const n = (seen.get(file.name) ?? 0) + 1
    seen.set(file.name, n)
    return n === 1 ? file : { ...file, name: suffixed(file.name, n) }
  })
}

export function projectFiles(project) {
  const files = [
    {
      name: 'README.txt',
      type: 'text',
      text: (project.description ?? []).join('\n'),
    },
  ]
  for (const src of project.screenshots ?? []) {
    if (src) files.push({ name: basename(src), type: 'image', src })
  }
  for (const src of project.videos ?? []) {
    if (src) files.push({ name: basename(src), type: 'video', src })
  }
  for (const { label, href } of project.links ?? []) {
    if (label && href) files.push({ name: `${label}.url`, type: 'link', href })
  }
  return deduped(files)
}
