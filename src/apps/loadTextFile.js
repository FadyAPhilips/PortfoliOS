/**
 * Reads a text file served from public/.
 *
 * public/ sits behind the SPA's index.html fallback, so a path that doesn't
 * exist doesn't 404 — the host answers 200 with the whole app shell. Handing
 * that to a viewer would display "<!doctype html>…" as the file's contents, so
 * an HTML response is treated as a missing file. `fetchImpl` is injected only
 * so the guard can be tested without a network.
 */
export async function loadTextFile(src, fetchImpl = fetch) {
  const response = await fetchImpl(src)
  if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`)
  if (/html/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`${src}: served the app shell, not a text file`)
  }
  return response.text()
}
