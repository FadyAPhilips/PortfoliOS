// Turns a project entry into the files its folder shows. The list is derived
// from the data rather than declared in it, so nothing in the UI can point at
// a file the JSON doesn't back.

// Filename without directory, query string or fragment — the last two matter
// for externally hosted video ("clip.mp4?token=…").
const basename = (path) => path.split(/[?#]/)[0].split('/').pop()

export function projectFiles(project) {
  const files = [
    {
      name: 'README.txt',
      type: 'text',
      text: (project.description ?? []).join('\n'),
    },
  ]
  for (const src of project.screenshots ?? []) {
    files.push({ name: basename(src), type: 'image', src })
  }
  if (project.video) {
    files.push({ name: basename(project.video), type: 'video', src: project.video })
  }
  if (project.url) {
    files.push({ name: `${project.name}.url`, type: 'link', href: project.url })
  }
  return files
}
