import { useState } from 'react'
import data from '../content/projects.json'

export default function Projects() {
  const { projects } = data
  const [selected, setSelected] = useState(0)
  const active = projects[selected]

  return (
    <div className="app-pane">
      <div className="sunken-panel app-grow">
        <table className="interactive">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr
                key={p.name}
                className={i === selected ? 'highlighted' : undefined}
                onClick={() => setSelected(i)}
              >
                <td>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="detail-panel">
          <p>{active.description}</p>
          {active.tech?.length > 0 && (
            <p className="app-sub">{active.tech.join(' · ')}</p>
          )}
          {active.url && (
            <p>
              <a href={active.url} target="_blank" rel="noreferrer">
                Open project
              </a>
            </p>
          )}
        </div>
      )}

      <div className="status-bar">
        <p className="status-bar-field">{projects.length} object(s)</p>
        <p className="status-bar-field">{active ? active.name : ''}</p>
      </div>
    </div>
  )
}
