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

// Degrees and certifications are both education entries, kept apart because
// a multi-year degree and a short course aren't the same weight of thing.
// Both subfolders always exist, empty or not.
export function buildDrive({ projects = [], degrees = [], certifications = [] }) {
  return folder('(C:)', [
    folder(PROJECTS_PATH[0], entryFolders(projects, projectFiles)),
    folder(HOMEWORK_PATH[0], [
      folder('Degrees', entryFolders(degrees, educationFiles)),
      folder('Certifications', entryFolders(certifications, educationFiles)),
    ]),
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
