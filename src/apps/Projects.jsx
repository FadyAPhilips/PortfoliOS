import Explorer from './Explorer'
import { PROJECTS_PATH } from './fileSystem'

// The My Projects desktop icon: Explorer, starting at C:\My Projects.
export default function Projects(props) {
  return <Explorer {...props} start={PROJECTS_PATH} />
}
