import experience from '../content/experience.json'

export default function Experience() {
  return (
    <div className="app-pad">
      {experience.positions.map((job) => (
        <fieldset key={`${job.org}-${job.period}`}>
          <legend>{job.period}</legend>
          <h3 className="app-title">{job.role}</h3>
          <p className="app-sub">
            {job.org}
            {job.location ? ` · ${job.location}` : ''}
          </p>
          {job.highlights?.length > 0 && (
            <ul className="bullets">
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </fieldset>
      ))}
    </div>
  )
}
