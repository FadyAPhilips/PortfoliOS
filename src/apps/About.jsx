import about from '../content/about.json'

export default function About() {
  return (
    <div className="app-pad">
      <div className="about-head">
        <svg className="app-icon-lg" aria-hidden="true">
          <use href="/icons.svg#icon-about" />
        </svg>
        <div>
          <h2 className="app-title">{about.name}</h2>
          <p className="app-sub">{about.role}</p>
        </div>
      </div>

      <fieldset>
        <legend>Summary</legend>
        <p>{about.summary}</p>
      </fieldset>

      <fieldset>
        <legend>System Information</legend>
        <ul className="spec-list">
          {about.details.map((d) => (
            <li key={d.label}>
              <span>{d.label}</span>
              <span>{d.value}</span>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  )
}
