/**
 * Checks a PDF is really there before the viewer embeds it.
 *
 * public/ sits behind the SPA's index.html fallback, so a mistyped path
 * answers 200 with the app shell — embedded, that would show the whole
 * desktop inside the viewer. Same guard as loadTextFile, but with HEAD so
 * the PDF isn't downloaded twice. Only our own root-relative files are
 * checked: an external URL can't be HEADed across origins without CORS, and
 * isn't behind our fallback anyway. `fetchImpl` is injected only for tests.
 */
export async function checkPdf(src, fetchImpl = fetch) {
  if (!src.startsWith('/')) return
  const response = await fetchImpl(src, { method: 'HEAD' })
  if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`)
  if (/html/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`${src}: served the app shell, not a PDF`)
  }
}
