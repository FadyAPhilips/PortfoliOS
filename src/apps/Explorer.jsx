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
