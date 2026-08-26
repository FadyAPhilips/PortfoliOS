import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 98.css@0.1.21 ships a malformed media query:
 *
 *   @media (not(hover)) { button:not(:disabled):hover { ...pressed shadow... } }
 *
 * `(not(hover))` isn't valid media-query syntax — it looks like a botched
 * `not (hover: none)`. Every browser drops the whole block, so the rule has
 * never actually applied. Vite 8's lightningcss minifier is stricter and
 * fails the build outright instead.
 *
 * We strip the block so the stylesheet is valid. That keeps rendering
 * identical to what browsers already do, and matches real Win98 besides —
 * buttons depressed on click, not on hover. To opt into the author's
 * apparent intent instead, replace the block with `@media (hover: hover)`.
 *
 * Upstream: https://github.com/jdan/98.css
 */
function patch98css() {
  const BROKEN = /@media \(not\(hover\)\)\{[^}]*\{[^}]*\}\}/g
  return {
    name: 'patch-98css-media-query',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('98.css')) return null
      const patched = code.replace(BROKEN, '')
      return patched === code ? null : { code: patched, map: null }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [patch98css(), react()],
})
