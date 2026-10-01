import { describe, expect, it, vi } from 'vitest'
import { openFile } from './openFile'

const readme = { name: 'README.txt', type: 'text', text: 'hi' }
const doc = { name: 'notes.txt', type: 'text', src: '/n.txt' }
const a = { name: 'a.jpg', type: 'image', src: '/a.jpg' }
const b = { name: 'b.jpg', type: 'image', src: '/b.jpg' }
const clip = { name: 'clip.mp4', type: 'video', src: '/c.mp4' }
const details = { fields: [{ label: 'Status', value: 'Completed' }], verifyUrl: '' }
const pdf = { name: 'diploma.pdf', type: 'pdf', src: '/d.pdf', details }
const link = { name: 'GitHub.url', type: 'link', href: 'https://github.com' }
const siblings = [readme, doc, a, clip, b, pdf, link]

const run = (file, path = ['Homework', 'Bachelor_of_Science']) => {
  const openApp = vi.fn()
  const openLink = vi.fn()
  openFile(file, { siblings, path, openApp, openLink })
  return { openApp, openLink }
}

describe('openFile', () => {
  it('opens text in Notepad, keyed by full path', () => {
    const { openApp } = run(readme)
    expect(openApp).toHaveBeenCalledWith('notepad', {
      key: 'C:\\Homework\\Bachelor_of_Science\\README.txt',
      title: 'README.txt - Notepad',
      payload: { name: 'README.txt', text: 'hi', src: undefined },
    })
  })

  it('gives same-named files in different folders different Notepad keys', () => {
    const one = run(readme, ['My Projects', 'Alpha']).openApp.mock.calls[0][1].key
    const two = run(readme, ['Homework', 'Bachelor_of_Science']).openApp.mock.calls[0][1].key
    expect(one).not.toBe(two)
  })

  it('opens an image in Photos with only this folder’s images', () => {
    const { openApp } = run(b)
    expect(openApp).toHaveBeenCalledWith('photos', {
      title: 'b.jpg - Photos',
      payload: {
        images: [
          { name: 'a.jpg', src: '/a.jpg' },
          { name: 'b.jpg', src: '/b.jpg' },
        ],
        index: 1,
      },
    })
  })

  it('opens video in Media Player', () => {
    expect(run(clip).openApp).toHaveBeenCalledWith('media', {
      title: 'clip.mp4 - Media Player',
      payload: { name: 'clip.mp4', src: '/c.mp4' },
    })
  })

  it('opens a pdf in the PDF Viewer with its details', () => {
    expect(run(pdf).openApp).toHaveBeenCalledWith('pdfviewer', {
      title: 'diploma.pdf - PDF Viewer',
      payload: { name: 'diploma.pdf', src: '/d.pdf', details },
    })
  })

  it('opens a link in a new tab and no program', () => {
    const { openApp, openLink } = run(link)
    expect(openLink).toHaveBeenCalledWith('https://github.com')
    expect(openApp).not.toHaveBeenCalled()
  })
})
