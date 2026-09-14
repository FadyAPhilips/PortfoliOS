import about from '../content/about.json'
import Avatar from './Avatar'

// Blurb copy is authored with blank lines between paragraphs.
const paragraphs = (text) =>
  text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)

function Blurb({ heading, body }) {
  return (
    <div className="ms-blurb">
      <h3 className="ms-subhead">{heading}</h3>
      {paragraphs(body)}
    </div>
  )
}

export default function About() {
  const { name, role, mood, photo, stats, interests, blurbs, friends, profileUrl } =
    about

  return (
    <div className="ms">
      {/* The OS window is the browser; this is its address bar. */}
      <div className="ms-chrome">
        <span className="ms-chrome-label">Address</span>
        <div className="ms-chrome-url">
          <svg className="ms-chrome-icon" aria-hidden="true">
            <use href="/icons.svg#icon-about" />
          </svg>
          <span>{profileUrl}</span>
        </div>
      </div>

      <div className="ms-page">
        <div className="ms-columns">
          {/* ---- Left: identity panel ---------------------------------- */}
          <div className="ms-col-left">
            <div className="ms-panel">
              <h2 className="ms-name">{name}</h2>

              <div className="ms-avatar-frame">
                <Avatar name={name} photo={photo} size={150} />
              </div>

              <div className="ms-network">
                {name} is in your extended network
              </div>

              <p className="ms-mood">
                <span className="ms-mood-label">Mood:</span> {mood}
              </p>

              <table className="ms-stats">
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.label}>
                      <th scope="row">{s.label}:</th>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---- Right: blurbs + friend space --------------------------- */}
          <div className="ms-col-right">
            <section className="ms-block">
              <h2 className="ms-banner">{name}&apos;s Blurbs</h2>
              <div className="ms-block-body">
                <Blurb heading="About me:" body={blurbs.aboutMe} />
                <Blurb
                  heading={"Who I'd like to meet:"}
                  body={blurbs.whoIdLikeToMeet}
                />
              </div>
            </section>

            {interests?.length > 0 && (
              <section className="ms-block">
                <h2 className="ms-banner">{name}&apos;s Interests</h2>
                <table className="ms-interests">
                  <tbody>
                    {interests.map((i) => (
                      <tr key={i.label}>
                        <th scope="row">{i.label}</th>
                        <td>{i.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="ms-block">
              <h2 className="ms-banner">{name}&apos;s Friend Space</h2>
              <div className="ms-block-body">
                <p className="ms-friend-count">
                  {name} has <strong>{friends.length}</strong> friends.
                </p>

                <ul className="ms-friends">
                  {friends.map((f) => (
                    <li key={f.name} className="ms-friend">
                      <a
                        className="ms-friend-name"
                        href={f.url || '#'}
                        onClick={(e) => !f.url && e.preventDefault()}
                      >
                        {f.name}
                      </a>
                      <div className="ms-avatar-frame ms-avatar-frame--sm">
                        <Avatar
                          name={f.name}
                          photo={f.photo}
                          variant={f.variant}
                          size={76}
                        />
                      </div>
                      {f.caption && (
                        <span className="ms-friend-caption">{f.caption}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>

        <div className="ms-footer">
          {name} &mdash; {role}
        </div>
      </div>
    </div>
  )
}
