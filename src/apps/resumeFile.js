import site from '../content/site.json'

// Where the resume lives, and the name it saves as. Both the resume.exe
// wizard and the Contacts list in Contact Me read from here, so the path is
// set in one place. Query strings and fragments are stripped so a full URL
// still yields a clean filename.
export const resumePath = site.resumePath ?? ''
export const resumeName = resumePath.split(/[?#]/)[0].split('/').pop() ?? ''
