import About from './About'
import Projects from './Projects'
import Experience from './Experience'
import Skills from './Skills'
import Contact from './Contact'
import Solitaire from './Solitaire'

/**
 * Single source of truth for every "program". Desktop icons, the Start menu,
 * and the window layer all read from here, so adding an app is a one-entry
 * change.
 *
 * `icon` is a symbol id in /public/icons.svg.
 */
export const APPS = {
  about: {
    title: 'About Me',
    icon: 'icon-about',
    defaultSize: { w: 520, h: 380 },
    Component: About,
  },
  projects: {
    title: 'Projects',
    icon: 'icon-projects',
    defaultSize: { w: 640, h: 440 },
    Component: Projects,
  },
  experience: {
    title: 'Experience',
    icon: 'icon-experience',
    defaultSize: { w: 600, h: 420 },
    Component: Experience,
  },
  skills: {
    title: 'Skills',
    icon: 'icon-skills',
    defaultSize: { w: 520, h: 400 },
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
  solitaire: {
    title: 'Solitaire',
    icon: 'icon-solitaire',
    defaultSize: { w: 580, h: 420 },
    Component: Solitaire,
  },
}

// Order shown on the desktop and in the Start menu.
export const APP_ORDER = [
  'about',
  'projects',
  'experience',
  'skills',
  'contact',
  'solitaire',
]
