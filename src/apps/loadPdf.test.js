import { describe, expect, it, vi } from 'vitest'
import { checkPdf } from './loadPdf'

// A stand-in for the one fetch call this module makes.
const respond = ({ ok = true, status = 200, type = 'application/pdf' }) =>
  vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      headers: { get: (h) => (h.toLowerCase() === 'content-type' ? type : null) },
    }),
  )

describe('checkPdf', () => {
  it('resolves for a PDF, asking with HEAD so the file is not downloaded twice', async () => {
    const fetchImpl = respond({})
    await expect(checkPdf('/assets/education/bsc/diploma.pdf', fetchImpl)).resolves.toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledWith('/assets/education/bsc/diploma.pdf', { method: 'HEAD' })
  })

  it('rejects the SPA fallback that answers a mistyped path with index.html', async () => {
    await expect(checkPdf('/assets/typo.pdf', respond({ type: 'text/html; charset=utf-8' }))).rejects.toThrow(
      /app shell/,
    )
  })

  it('rejects a non-OK response', async () => {
    await expect(checkPdf('/assets/x.pdf', respond({ ok: false, status: 404 }))).rejects.toThrow(/404/)
  })

  it('does not check external URLs, which a cross-origin HEAD would fail on CORS', async () => {
    const fetchImpl = respond({})
    await expect(checkPdf('https://example.org/cert.pdf', fetchImpl)).resolves.toBeUndefined()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
