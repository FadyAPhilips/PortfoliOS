import { useState } from 'react'
import { positions } from './experienceData'

export default function Experience() {
  const [selected, setSelected] = useState(0)
  const active = positions[selected]

  return (
    <div className="app-pane">
      <div className="sunken-panel app-grow">
        <table className="interactive tm-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Employer</th>
              <th>Status</th>
              <th>Tech</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((job, i) => (
              <tr
                key={`${job.role}-${job.company}-${job.dates}`}
                className={i === selected ? 'highlighted' : undefined}
                onClick={() => setSelected(i)}
              >
                <td>{job.role}</td>
                <td>{job.company}</td>
                <td>{job.status}</td>
                <td>{job.tech.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="detail-panel tm-detail">
          <h3 className="app-title">{active.role}</h3>
          <p className="app-sub">
            {[active.company, active.location, active.dates]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {active.bullets?.length > 0 && (
            <ul className="bullets">
              {active.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="status-bar">
        <p className="status-bar-field">Processes: {positions.length}</p>
        <p className="status-bar-field">{active ? active.role : ''}</p>
      </div>
    </div>
  )
}
