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
