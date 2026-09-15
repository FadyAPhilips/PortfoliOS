import About from './About'
import Projects from './Projects'
import Experience from './Experience'
import Skills from './Skills'
import Contact from './Contact'
import Solitaire from './solitaire/Solitaire'
import ResumeWizard from './ResumeWizard'
import SkillProperties from './SkillProperties'
import Notepad from './Notepad'
import Photos from './Photos'
import MediaPlayer from './MediaPlayer'

/**
 * Single source of truth for every "program". Desktop icons, the Start menu,
 * and the window layer all read from here, so adding an app is a one-entry
 * change.
 *
 * `icon` is a symbol id in /public/icons.svg.
 *
 * `multiInstance: true` lets an app open one window per file (deduped on the
 * `key` passed to openApp); everything else is one window per app, and
 * reopening swaps the payload into the existing window.
 */
export const APPS = {
  about: {
    title: 'About Me',
    icon: 'icon-about',
    // Wide enough for the 35/65 split and a 4-across friend grid; below
    // ~560px the layout stacks (see myspace.css container queries).
    defaultSize: { w: 800, h: 600 },
    Component: About,
  },
  projects: {
    // The Explorer retitles itself to the open folder; this is the root.
    title: 'My Projects',
    icon: 'icon-projects',
    defaultSize: { w: 560, h: 400 },
    Component: Projects,
  },
  experience: {
    title: 'Experience',
    icon: 'icon-experience',
    // Four columns plus a notes pane deep enough for four resume bullets.
    defaultSize: { w: 720, h: 520 },
    Component: Experience,
  },
  skills: {
    title: 'Skills',
    icon: 'icon-skills',
    // A tree wants height more than width — seven categories, 54 leaves.
    defaultSize: { w: 480, h: 540 },
    Component: Skills,
  },
  contact: {
    title: 'Contact Me',
    icon: 'icon-contact',
    // Roomier than the other apps — it holds a toolbar, four header rows,
    // a message body, a contacts strip and a status bar.
    defaultSize: { w: 580, h: 500 },
    Component: Contact,
  },
  resume: {
    // The .exe name is the joke; the window is a setup wizard.
    title: 'resume.exe',
    icon: 'icon-resume',
    defaultSize: { w: 460, h: 300 },
    Component: ResumeWizard,
  },
  solitaire: {
    title: 'Solitaire',
    icon: 'icon-solitaire',
    // Fits the 585x424 table at 1:1 plus menu strip and status bar; the
    // table scales down, never up, in smaller windows.
    defaultSize: { w: 616, h: 520 },
    Component: Solitaire,
  },

  // Opened from the Skills tree, never from the desktop. Single-instance:
  // picking another skill swaps this window's payload and title.
  skillprops: {
    title: 'Properties',
    icon: 'icon-skills',
    defaultSize: { w: 360, h: 300 },
    Component: SkillProperties,
  },

  // Programs that files in My Projects open in. Not in APP_ORDER, so they
  // have no desktop icon or Start entry and only ever launch from a file.
  notepad: {
    title: 'Notepad',
    icon: 'icon-notepad',
    defaultSize: { w: 480, h: 360 },
    multiInstance: true,
    Component: Notepad,
  },
  photos: {
    title: 'Photos',
    icon: 'icon-photos',
    defaultSize: { w: 640, h: 480 },
    Component: Photos,
  },
  media: {
    title: 'Media Player',
    icon: 'icon-media',
    defaultSize: { w: 560, h: 440 },
    Component: MediaPlayer,
  },
}

// Order shown on the desktop and in the Start menu.
export const APP_ORDER = [
  'about',
  'projects',
  'experience',
  'skills',
  'contact',
  'resume',
  'solitaire',
]
