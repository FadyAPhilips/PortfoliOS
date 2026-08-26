import skills from '../content/skills.json'

export default function Skills() {
  return (
    <div className="app-pad">
      <ul className="tree-view">
        {skills.groups.map((group) => (
          <li key={group.name}>
            {group.name}
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
