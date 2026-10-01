/**
 * Checks a PDF is really there before the viewer embeds it.
 *
 * public/ sits behind the SPA's index.html fallback, so a mistyped path
 * answers 200 with the app shell — embedded, that would show the whole
 * desktop inside the viewer. Same guard as loadTextFile, but with HEAD so
 * the PDF isn't downloaded twice. External URLs (a scheme, or protocol-
 * relative `//`) are skipped: they can't be HEADed across origins without
 * CORS, and aren't behind our fallback anyway. Anything else is a site path —
 * including one missing its leading slash — and is checked. `fetchImpl` is
 * injected only for tests.
 */
const EXTERNAL = /^([a-z][a-z\d+.-]*:|\/\/)/i

export async function checkPdf(src, fetchImpl = fetch) {
  if (EXTERNAL.test(src)) return
  const response = await fetchImpl(src, { method: 'HEAD' })
  if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`)
  if (/html/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`${src}: served the app shell, not a PDF`)
  }
}
