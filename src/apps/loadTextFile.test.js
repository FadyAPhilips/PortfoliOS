import { describe, expect, it } from 'vitest'
import { loadTextFile } from './loadTextFile'

// A stand-in for the one fetch call this module makes. Nothing here mocks the
// module under test — only the network it talks to.
const respond = ({ ok = true, status = 200, type = 'text/plain', body = '' }) =>
  () =>
    Promise.resolve({
      ok,
      status,
      headers: { get: (h) => (h.toLowerCase() === 'content-type' ? type : null) },
      text: () => Promise.resolve(body),
    })

describe('loadTextFile', () => {
  it('returns the file contents', async () => {
    const load = respond({ body: 'Architecture\n============\n' })
    await expect(loadTextFile('/assets/projects/demo/architecture.txt', load)).resolves.toBe(
      'Architecture\n============\n',
    )
  })

  it('requests the path it was given', async () => {
    let asked
    const load = (url) => {
      asked = url
      return respond({ body: 'x' })()
    }
    await loadTextFile('/assets/projects/demo/notes.txt', load)
    expect(asked).toBe('/assets/projects/demo/notes.txt')
  })

  it('rejects when the file is missing', async () => {
    const load = respond({ ok: false, status: 404, type: 'text/html', body: 'Not found' })
    await expect(loadTextFile('/assets/projects/demo/gone.txt', load)).rejects.toThrow()
  })

  // public/ is served with an SPA fallback: a wrong path does not 404, it
  // returns the app's own index.html with HTTP 200. Without this guard the
  // viewer would display "<!doctype html>…" as the file's contents.
  it('rejects the index.html the SPA fallback serves for a wrong path', async () => {
    const load = respond({
      type: 'text/html; charset=utf-8',
      body: '<!doctype html>\n<html lang="en">\n  <div id="root"></div>\n</html>',
    })
    await expect(loadTextFile('/assets/projects/demo/typo.txt', load)).rejects.toThrow()
  })

  it('accepts a text/plain response that declares a charset', async () => {
    const load = respond({ type: 'text/plain; charset=utf-8', body: 'notes' })
    await expect(loadTextFile('/a/notes.txt', load)).resolves.toBe('notes')
  })

  it('accepts a response that declares no content type at all', async () => {
    const load = respond({ type: null, body: 'notes' })
    await expect(loadTextFile('/a/notes.txt', load)).resolves.toBe('notes')
  })

  it('rejects when the network fails', async () => {
    const load = () => Promise.reject(new TypeError('Failed to fetch'))
    await expect(loadTextFile('/a/notes.txt', load)).rejects.toThrow()
  })
})
