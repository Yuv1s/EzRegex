// A global pattern like /a*/g against a large paste can produce a match per
// character. Past a few thousand <mark> elements the highlight layer stops
// being readable and starts costing frames, so collect up to this many and
// tell the UI it was capped.
export const MATCH_LIMIT = 5000

export function parseRegex(pattern, flags = 'g') {
  if (!pattern) return { regex: null, error: null }
  try {
    return { regex: new RegExp(pattern, flags), error: null }
  } catch (e) {
    return { regex: null, error: e.message }
  }
}

/**
 * @returns {{ matches: Array<{index:number,end:number,value:string,groups:string[]}>,
 *             truncated: boolean }}
 */
export function getMatches(regex, testString) {
  if (!regex || !testString) return { matches: [], truncated: false }

  const matches = []
  regex.lastIndex = 0

  if (!regex.global) {
    const m = regex.exec(testString)
    if (m) matches.push(toMatch(m))
    return { matches, truncated: false }
  }

  let m
  while ((m = regex.exec(testString)) !== null) {
    matches.push(toMatch(m))
    // A zero-length match would otherwise spin forever on the same index
    if (m[0].length === 0) regex.lastIndex++
    if (matches.length >= MATCH_LIMIT) return { matches, truncated: true }
  }

  return { matches, truncated: false }
}

function toMatch(m) {
  return { index: m.index, end: m.index + m[0].length, value: m[0], groups: m.slice(1) }
}

export function buildHighlightedHtml(testString, matches) {
  if (!testString) return ''

  let html = ''

  if (!matches.length) {
    html = escapeHtml(testString)
  } else {
    let pos = 0
    for (const { index, end } of matches) {
      if (index > pos) html += escapeHtml(testString.slice(pos, index))
      // Zero-length matches have nothing to wrap and would emit an empty <mark>
      if (end > index) html += `<mark class="regex-match">${escapeHtml(testString.slice(index, end))}</mark>`
      pos = Math.max(pos, end)
    }
    if (pos < testString.length) html += escapeHtml(testString.slice(pos))
  }

  // A trailing newline renders as a final empty line in a <textarea> but is
  // collapsed in a `white-space: pre-wrap` element. Without this the backdrop
  // ends up one line shorter than the textarea and the highlights slide out of
  // register once you scroll to the bottom.
  if (testString.endsWith('\n')) html += ' '

  return html
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
