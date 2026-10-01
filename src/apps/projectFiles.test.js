import { describe, expect, it } from 'vitest'
import { educationFiles, educationReadme, projectFiles } from './projectFiles'

const base = {
  slug: 'demo',
  name: 'Demo',
  description: ['Demo', '====', '', 'A thing.'],
  screenshots: [],
  docs: [],
  videos: [],
  links: [],
}

describe('projectFiles', () => {
  it('always yields README.txt first, with the description joined by newlines', () => {
    const [readme] = projectFiles(base)
    expect(readme).toEqual({
      name: 'README.txt',
      type: 'text',
      text: 'Demo\n====\n\nA thing.',
    })
  })

  it('yields one image per screenshot, named by its basename', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/assets/projects/demo/home.jpg', '/assets/projects/demo/settings.png'],
    })
    expect(files.slice(1)).toEqual([
      { name: 'home.jpg', type: 'image', src: '/assets/projects/demo/home.jpg' },
      { name: 'settings.png', type: 'image', src: '/assets/projects/demo/settings.png' },
    ])
  })

  // A doc is read from disk when opened, so it carries a src instead of the
  // inline text the README is built from.
  it('yields one text file per doc, named by its basename and carrying its path', () => {
    expect(projectFiles(base)).toHaveLength(1)
    const files = projectFiles({
      ...base,
      docs: ['/assets/projects/demo/architecture.txt', '/assets/projects/demo/changelog.txt'],
    })
    expect(files.slice(1)).toEqual([
      {
        name: 'architecture.txt',
        type: 'text',
        src: '/assets/projects/demo/architecture.txt',
      },
      { name: 'changelog.txt', type: 'text', src: '/assets/projects/demo/changelog.txt' },
    ])
  })

  it('skips a doc with no path', () => {
    const files = projectFiles({ ...base, docs: ['', '/a/notes.txt'] })
    expect(files.slice(1).map((f) => f.name)).toEqual(['notes.txt'])
  })

  it('numbers a doc that is itself named README.txt, leaving the derived one first', () => {
    const files = projectFiles({ ...base, docs: ['/a/README.txt'] })
    expect(files.map((f) => f.name)).toEqual(['README.txt', 'README (2).txt'])
    expect(files[0].text).toBe('Demo\n====\n\nA thing.')
    expect(files[1].src).toBe('/a/README.txt')
  })

  it('yields one video per entry, named by its basename', () => {
    expect(projectFiles(base).some((f) => f.type === 'video')).toBe(false)
    const files = projectFiles({
      ...base,
      videos: ['/assets/projects/demo/demo.mp4', '/assets/projects/demo/walkthrough.mp4'],
    })
    expect(files.slice(1)).toEqual([
      { name: 'demo.mp4', type: 'video', src: '/assets/projects/demo/demo.mp4' },
      { name: 'walkthrough.mp4', type: 'video', src: '/assets/projects/demo/walkthrough.mp4' },
    ])
  })

  it('yields one Internet Shortcut per link, named by its label', () => {
    expect(projectFiles(base).some((f) => f.type === 'link')).toBe(false)
    const files = projectFiles({
      ...base,
      links: [
        { label: 'GitHub', href: 'https://github.com/you/demo' },
        { label: 'Live Demo', href: 'https://demo.example.com' },
      ],
    })
    expect(files.slice(1)).toEqual([
      { name: 'GitHub.url', type: 'link', href: 'https://github.com/you/demo' },
      { name: 'Live Demo.url', type: 'link', href: 'https://demo.example.com' },
    ])
  })

  it('skips a video with no path and a link with no href or label', () => {
    const files = projectFiles({
      ...base,
      videos: ['', '/a/v.mp4'],
      links: [
        { label: 'Unfinished', href: '' },
        { label: '', href: 'https://x.y' },
        { label: 'GitHub', href: 'https://github.com/you/demo' },
      ],
    })
    expect(files.slice(1).map((f) => f.name)).toEqual(['v.mp4', 'GitHub.url'])
  })

  it('strips query strings and fragments from basenames', () => {
    const files = projectFiles({
      ...base,
      videos: ['https://cdn.example.com/clip.mp4?token=abc#t=5'],
    })
    expect(files.at(-1).name).toBe('clip.mp4')
  })

  it('orders files README, docs, images, videos, links', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/a/1.jpg', '/a/2.jpg'],
      docs: ['/a/notes.txt'],
      videos: ['/a/v.mp4', '/a/w.mp4'],
      links: [
        { label: 'GitHub', href: 'https://x.y' },
        { label: 'Live', href: 'https://y.z' },
      ],
    })
    expect(files.map((f) => f.name)).toEqual([
      'README.txt',
      'notes.txt',
      '1.jpg',
      '2.jpg',
      'v.mp4',
      'w.mp4',
      'GitHub.url',
      'Live.url',
    ])
  })

  // Explorer keys its icons and its selection by name, so two files sharing
  // one would render as a single selectable icon.
  it('disambiguates repeated names, keeping the extension last', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/a/demo/shot.jpg', '/b/demo/shot.jpg', '/c/demo/shot.jpg'],
      links: [
        { label: 'GitHub', href: 'https://github.com/you/demo' },
        { label: 'GitHub', href: 'https://github.com/you/demo-api' },
      ],
    })
    expect(files.map((f) => f.name)).toEqual([
      'README.txt',
      'shot.jpg',
      'shot (2).jpg',
      'shot (3).jpg',
      'GitHub.url',
      'GitHub (2).url',
    ])
  })

  it('leaves the source path untouched when renaming a duplicate', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/a/shot.jpg', '/b/shot.jpg'],
    })
    expect(files.slice(1).map((f) => f.src)).toEqual(['/a/shot.jpg', '/b/shot.jpg'])
  })
})

describe('pdf docs', () => {
  it('classifies a .pdf doc as pdf and anything else as text', () => {
    const files = projectFiles({
      ...base,
      docs: ['/a/notes.txt', '/a/paper.pdf', '/a/SCAN.PDF', '/a/report.pdf?v=2'],
    })
    expect(files.slice(1).map((f) => [f.name, f.type])).toEqual([
      ['notes.txt', 'text'],
      ['paper.pdf', 'pdf'],
      ['SCAN.PDF', 'pdf'],
      ['report.pdf', 'pdf'],
    ])
  })
})

const entry = {
  slug: 'bsc',
  name: 'Bachelor_of_Science',
  institution: 'University Name',
  program: 'Program Name',
  dates: '20XX – 20XX',
  gpa: '',
  status: 'Completed',
  verifyUrl: '',
  description: [],
  docs: [],
  screenshots: [],
  videos: [],
  links: [],
}

describe('educationReadme', () => {
  it('lists only the populated details, one per line', () => {
    expect(educationReadme(entry)).toBe(
      'Institution: University Name\nProgram: Program Name\nDates: 20XX – 20XX\nStatus: Completed',
    )
  })

  it('treats whitespace-only fields as empty', () => {
    expect(educationReadme({ ...entry, gpa: '   ', dates: '' })).not.toMatch(/GPA|Dates/)
  })

  it('adds the verify link, then a blank line and the description', () => {
    const text = educationReadme({
      ...entry,
      gpa: '3.9',
      verifyUrl: 'https://verify.example/abc',
      description: ['Line one.', 'Line two.'],
    })
    expect(text).toBe(
      'Institution: University Name\nProgram: Program Name\nDates: 20XX – 20XX\nGPA: 3.9\nStatus: Completed\nVerify: https://verify.example/abc\n\nLine one.\nLine two.',
    )
  })

  it('is just the description when no details are set, with no leading blank line', () => {
    const bare = { name: 'x', description: ['Only this.'] }
    expect(educationReadme(bare)).toBe('Only this.')
  })
})

describe('educationFiles', () => {
  it('leads with README.txt built from the details', () => {
    const [readme] = educationFiles(entry)
    expect(readme).toEqual({ name: 'README.txt', type: 'text', text: educationReadme(entry) })
  })

  it('attaches the details to pdf files only', () => {
    const files = educationFiles({
      ...entry,
      verifyUrl: 'https://verify.example/abc',
      docs: ['/e/diploma.pdf', '/e/notes.txt'],
    })
    const pdf = files.find((f) => f.type === 'pdf')
    expect(pdf.details).toEqual({
      fields: [
        { label: 'Institution', value: 'University Name' },
        { label: 'Program', value: 'Program Name' },
        { label: 'Dates', value: '20XX – 20XX' },
        { label: 'Status', value: 'Completed' },
      ],
      verifyUrl: 'https://verify.example/abc',
    })
    expect(files.find((f) => f.name === 'notes.txt').details).toBeUndefined()
  })
})
