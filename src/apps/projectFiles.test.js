import { describe, expect, it } from 'vitest'
import { projectFiles } from './projectFiles'

const base = {
  slug: 'demo',
  name: 'Demo',
  description: ['Demo', '====', '', 'A thing.'],
  screenshots: [],
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

  it('orders files README, images, videos, links', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/a/1.jpg', '/a/2.jpg'],
      videos: ['/a/v.mp4', '/a/w.mp4'],
      links: [
        { label: 'GitHub', href: 'https://x.y' },
        { label: 'Live', href: 'https://y.z' },
      ],
    })
    expect(files.map((f) => f.type)).toEqual([
      'text',
      'image',
      'image',
      'video',
      'video',
      'link',
      'link',
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
