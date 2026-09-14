/**
 * Rasterize the face-up cards currently on the table into Images, keyed by
 * card key (as a string, matching `dataset.key`).
 *
 * Each card's SVG references the shared <defs> (#sol-defs) by id, which a
 * standalone SVG image can't see, so the defs are inlined into every card's
 * markup before it becomes a data URL.
 */
export async function rasterizeCards(tableEl, defsEl) {
  const defs = defsEl?.innerHTML ?? ''
  const jobs = []
  for (const node of tableEl.querySelectorAll('.sol-card[data-key]')) {
    const svg = node.querySelector('svg')
    if (!svg) continue
    const markup =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 71 96">' +
      defs +
      svg.innerHTML +
      '</svg>'
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
    jobs.push(img.decode().then(() => [node.dataset.key, img]))
  }
  return new Map(await Promise.all(jobs))
}
