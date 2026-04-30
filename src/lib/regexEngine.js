export function parseRegex(pattern, flags = 'g') {
  if (!pattern) return { regex: null, error: null }
  try {
    return { regex: new RegExp(pattern, flags), error: null }
  } catch (e) {
    return { regex: null, error: e.message }
  }
}

export function getMatches(regex, testString) {
  if (!regex || !testString) return []
  const results = []
  regex.lastIndex = 0
  if (regex.global) {
    let m
    while ((m = regex.exec(testString)) !== null) {
      results.push({ index: m.index, end: m.index + m[0].length, value: m[0], groups: m.slice(1) })
      if (m[0].length === 0) regex.lastIndex++
    }
  } else {
    const m = regex.exec(testString)
    if (m) results.push({ index: m.index, end: m.index + m[0].length, value: m[0], groups: m.slice(1) })
  }
  return results
}

export function buildHighlightedHtml(testString, matches) {
  if (!testString) return ''
  if (!matches.length) return escapeHtml(testString)
  let html = ''
  let pos = 0
  for (const { index, end } of matches) {
    if (index > pos) html += escapeHtml(testString.slice(pos, index))
    html += `<mark class="regex-match">${escapeHtml(testString.slice(index, end))}</mark>`
    pos = end
  }
  if (pos < testString.length) html += escapeHtml(testString.slice(pos))
  return html
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
