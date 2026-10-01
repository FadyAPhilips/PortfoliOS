import Explorer from './Explorer'
import { HOMEWORK_PATH } from './fileSystem'

// The Homework desktop icon: Explorer, starting at C:\Homework. A separate
// registry entry from My Projects, so the two always get separate windows.
export default function Homework(props) {
  return <Explorer {...props} start={HOMEWORK_PATH} />
}
