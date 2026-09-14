import { describe, expect, it } from 'vitest'
import { projectFiles } from './projectFiles'

const base = {
  slug: 'demo',
  name: 'Demo',
  description: ['Demo', '====', '', 'A thing.'],
  screenshots: [],
  video: '',
  url: '',
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

  it('includes the video only when one is set', () => {
    expect(projectFiles(base).some((f) => f.type === 'video')).toBe(false)
    const files = projectFiles({ ...base, video: '/assets/projects/demo/demo.mp4' })
    expect(files.at(-1)).toEqual({
      name: 'demo.mp4',
      type: 'video',
      src: '/assets/projects/demo/demo.mp4',
    })
  })

  it('includes an Internet Shortcut named after the project only when a url is set', () => {
    expect(projectFiles(base).some((f) => f.type === 'link')).toBe(false)
    const files = projectFiles({ ...base, url: 'https://example.com/demo' })
    expect(files.at(-1)).toEqual({
      name: 'Demo.url',
      type: 'link',
      href: 'https://example.com/demo',
    })
  })

  it('strips query strings and fragments from basenames', () => {
    const files = projectFiles({
      ...base,
      video: 'https://cdn.example.com/clip.mp4?token=abc#t=5',
    })
    expect(files.at(-1).name).toBe('clip.mp4')
  })

  it('orders files README, images, video, link', () => {
    const files = projectFiles({
      ...base,
      screenshots: ['/a/1.jpg'],
      video: '/a/v.mp4',
      url: 'https://x.y',
    })
    expect(files.map((f) => f.type)).toEqual(['text', 'image', 'video', 'link'])
  })
})
