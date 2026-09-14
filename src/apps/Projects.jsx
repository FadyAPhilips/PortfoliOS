import { useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import data from '../content/projects.json'
import { projectFiles } from './projectFiles'
import FileIcon from './FileIcon'
import MenuBar from './MenuBar'

const ROOT_TITLE = 'My Projects'
const ROOT_PATH = 'C:\\My Projects'

const FILE_ICON = {
  text: 'icon-file-txt',
  image: 'icon-file-jpg',
  video: 'icon-file-mp4',
  link: 'icon-file-url',
}

/**
 * A Win98 folder window. The root lists one folder per project; inside a
 * folder, the files come from projectFiles() and each opens its program.
 */
export default function Projects({ windowId }) {
  const { projects } = data
  const { openApp, update } = useWindowActions()
  const [folder, setFolder] = useState(null) // a project slug, or null at root
  const [selected, setSelected] = useState(null)

  // A slug missing from the JSON (edited under hot reload) renders as root.
  const project = folder ? projects.find((p) => p.slug === folder) : null
  const files = project ? projectFiles(project) : null

  const enter = (p) => {
    setFolder(p.slug)
    setSelected(null)
    update(windowId, { title: p.name })
  }

  const up = () => {
    setFolder(null)
    setSelected(null)
    update(windowId, { title: ROOT_TITLE })
  }

  const openFile = (file) => {
    switch (file.type) {
      case 'text':
        openApp('notepad', {
          // Keyed per file so the same README focuses its existing window
          // while a different project's README gets its own.
          key: `${project.slug}/${file.name}`,
          title: `${file.name} - Notepad`,
          payload: { name: file.name, text: file.text },
        })
        break
      case 'image': {
        // Photos only ever receives this folder's images, which is what
        // scopes its Previous/Next to the folder.
        const images = files
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
      case 'link':
        window.open(file.href, '_blank', 'noopener')
        break
    }
  }

  const count = project ? files.length : projects.length
  const selectedLabel = project
    ? selected
    : projects.find((p) => p.slug === selected)?.name

  return (
    <div className="app-pane explorer">
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />

      <div className="explorer-toolbar">
        <button type="button" onClick={up} disabled={!project}>
          Up
        </button>
      </div>

      <div className="explorer-address">
        <span>Address</span>
        <div className="explorer-address-field">
          {project ? `${ROOT_PATH}\\${project.name}` : ROOT_PATH}
        </div>
      </div>

      <div
        className="sunken-panel app-grow explorer-body"
        onPointerDown={(e) => {
          // Only clear the selection when the press landed on empty space.
          if (!e.target.closest('.file-icon')) setSelected(null)
        }}
      >
        <div className="explorer-grid">
          {project
            ? files.map((f) => (
                <FileIcon
                  key={f.name}
                  icon={FILE_ICON[f.type]}
                  label={f.name}
                  selected={selected === f.name}
                  onSelect={() => setSelected(f.name)}
                  onOpen={() => openFile(f)}
                />
              ))
            : projects.map((p) => (
                <FileIcon
                  key={p.slug}
                  icon="icon-projects"
                  label={p.name}
                  selected={selected === p.slug}
                  onSelect={() => setSelected(p.slug)}
                  onOpen={() => enter(p)}
                />
              ))}
        </div>
      </div>

      <div className="status-bar">
        <p className="status-bar-field">{count} object(s)</p>
        <p className="status-bar-field">{selectedLabel ?? ''}</p>
      </div>
    </div>
  )
}
