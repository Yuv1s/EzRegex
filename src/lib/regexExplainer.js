// Tokenizer
export const TOKEN = {
  ANCHOR:      'anchor',
  ESCAPE:      'escape',
  SHORTHAND:   'shorthand',
  CHAR_CLASS:  'charClass',
  GROUP:       'group',
  LITERAL:     'literal',
  ALTERNATION: 'alternation',
  UNKNOWN:     'unknown',
}

// Helpers

function makeChunk(id, raw, start, end, type, opts = {}) {
  return {
    id,
    raw,
    start,
    end,
    type,
    quantifier:  null,
    description: opts.description ?? '',
    useCase:     opts.useCase     ?? null,
  }
}

// Types that can be followed by a quantifier
const QUANTIFIABLE = new Set([
  TOKEN.LITERAL, TOKEN.ESCAPE, TOKEN.SHORTHAND, TOKEN.CHAR_CLASS, TOKEN.GROUP,
])

// Reads a quantifier (+, *, ?, {n,m}, with optional trailing lazy ?) at index i
// Mutates the last chunk in the array in place and returns the new cursor position
function consumeQuantifier(pattern, i, chunks) {
  const ch    = pattern[i]
  const chunk = chunks[chunks.length - 1]
  if (!ch || !chunk || !QUANTIFIABLE.has(chunk.type)) return i

  let q       = null
  let advance = 0

  if (ch === '+' || ch === '*') {
    q = ch; advance = 1
    if (pattern[i + 1] === '?') { q += '?'; advance = 2 }
  } else if (ch === '?') {
    q = '?'; advance = 1
    if (pattern[i + 1] === '?') { q += '?'; advance = 2 }
  } else if (ch === '{') {
    let j = i + 1
    while (j < pattern.length && pattern[j] !== '}') j++
    if (j < pattern.length) {
      const qStr = pattern.slice(i, j + 1)
      if (/^\{\d+(,\d*)?\}$/.test(qStr)) {
        q = qStr; advance = qStr.length
        if (pattern[i + advance] === '?') { q += '?'; advance++ }
      }
    }
  }

  if (q !== null) {
    chunk.quantifier = q
    chunk.raw       += q
    chunk.end        = i + advance
    return i + advance
  }

  return i
}

// Anchor table

const ANCHOR_DESCRIPTIONS = {
  '^':   { description: 'Matches the start of the string (or the start of a line in multiline mode)', useCase: null },
  '$':   { description: 'Matches the end of the string (or the end of a line in multiline mode)',     useCase: null },
  '\\b': { description: 'Matches a word boundary: the position between a word character and a non-word character', useCase: 'Commonly used for: matching whole words without consuming surrounding characters' },
  '\\B': { description: 'Matches a non-word boundary: a position that is NOT between a word character and a non-word character', useCase: null },
}

// Escape table (non shorthand, non anchor)

const ESCAPE_DESCRIPTIONS = {
  '\\.':  { description: 'Matches a literal dot (the backslash prevents it from meaning "any character")', useCase: null },
  '\\\\': { description: 'Matches a literal backslash',              useCase: null },
  '\\n':  { description: 'Matches a newline character',              useCase: null },
  '\\r':  { description: 'Matches a carriage-return character',      useCase: null },
  '\\t':  { description: 'Matches a tab character',                  useCase: null },
  '\\(':  { description: 'Matches a literal opening parenthesis',    useCase: null },
  '\\)':  { description: 'Matches a literal closing parenthesis',    useCase: null },
  '\\[':  { description: 'Matches a literal opening square bracket', useCase: null },
  '\\]':  { description: 'Matches a literal closing square bracket', useCase: null },
  '\\{':  { description: 'Matches a literal opening curly brace',    useCase: null },
  '\\}':  { description: 'Matches a literal closing curly brace',    useCase: null },
  '\\^':  { description: 'Matches a literal caret character',        useCase: null },
  '\\$':  { description: 'Matches a literal dollar sign',            useCase: null },
  '\\|':  { description: 'Matches a literal pipe character',         useCase: null },
  '\\+':  { description: 'Matches a literal plus sign',              useCase: null },
  '\\*':  { description: 'Matches a literal asterisk',               useCase: null },
  '\\?':  { description: 'Matches a literal question mark',          useCase: null },
}

// Shorthand class table

const SHORTHAND_DESCRIPTIONS = {
  '\\d': { description: 'Matches any digit (0 through 9)',                                           useCase: 'Commonly used for: phone numbers, zip codes, numeric IDs' },
  '\\D': { description: 'Matches any non-digit character',                                           useCase: null },
  '\\w': { description: 'Matches any word character (letters a–z, A–Z, digits 0–9, or underscore)', useCase: 'Commonly used for: usernames, identifiers, and alphanumeric input' },
  '\\W': { description: 'Matches any non-word character (spaces, punctuation, symbols, etc.)',       useCase: null },
  '\\s': { description: 'Matches any whitespace character (space, tab, newline, carriage return)',   useCase: 'Commonly used for: splitting on whitespace or stripping blank tokens' },
  '\\S': { description: 'Matches any non-whitespace character',                                      useCase: null },
}

// Literal description

function describeChar(ch) {
  const named = {
    ' ':  'a space character',
    '\t': 'a tab character',
    '-':  'a hyphen',
    '_':  'an underscore',
    '@':  'the @ symbol',
    '#':  'the # symbol',
    '/':  'a forward slash',
  }
  return `Matches the literal character "${named[ch] ?? ch}"`
}

// Character class description helpers
// These parse the inside of [...] and build a plain English parts list.

function describeRange(from, to) {
  if (from === 'a' && to === 'z') return 'a lowercase letter (a through z)'
  if (from === 'A' && to === 'Z') return 'an uppercase letter (A through Z)'
  if (from === '0' && to === '9') return 'a digit (0 through 9)'
  return `a character from "${from}" to "${to}"`
}

function joinList(parts) {
  if (parts.length === 0) return 'an unknown character'
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} or ${parts[1]}`
  return parts.slice(0, -1).join(', ') + ', or ' + parts[parts.length - 1]
}

function describeCharClass(raw) {
  let i       = 1
  let negated = false
  const parts = []

  if (raw[i] === '^') { negated = true; i++ }
  // ] as the very first char inside the class is a literal ] per the spec
  if (raw[i] === ']') { parts.push('"["'); i++ }

  while (i < raw.length - 1) {
    const ch = raw[i]

    if (ch === '\\') {
      const next = raw[i + 1]
      if      (next === 'w') parts.push('a word character (letter, digit, or underscore)')
      else if (next === 'W') parts.push('a non-word character')
      else if (next === 'd') parts.push('a digit')
      else if (next === 'D') parts.push('a non-digit')
      else if (next === 's') parts.push('a whitespace character')
      else if (next === 'S') parts.push('a non-whitespace character')
      else if (next === '.') parts.push('a literal dot')
      else if (next === 'n') parts.push('a newline')
      else if (next === 't') parts.push('a tab')
      else if (next === '-') parts.push('a hyphen')
      else                   parts.push(`"\\${next}"`)
      i += 2
    } else if (
      raw[i + 1] === '-' &&
      i + 2 <= raw.length - 2 &&
      ch !== '-' &&             // leading - is literal, not a range start
      raw[i + 2] !== '-'        // trailing - is literal, not a range end
    ) {
      parts.push(describeRange(ch, raw[i + 2]))
      i += 3
    } else {
      const named = { ' ': 'a space', '-': 'a hyphen', '_': 'an underscore', '.': 'a dot' }
      parts.push(named[ch] ?? `"${ch}"`)
      i++
    }
  }

  const list = joinList(parts)
  if (negated) return `Any character except: ${list}`
  return `One of: ${list}`
}

// Scans from '[' to the closing ']', respecting escapes inside the class
// Returns { end, raw } where end is the index after the closing ']'
function scanCharClass(pattern, start) {
  let i = start + 1
  if (i < pattern.length && pattern[i] === '^') i++
  // ] as first char (after optional ^) is literal, skip so it doesn't end the scan early
  if (i < pattern.length && pattern[i] === ']') i++

  while (i < pattern.length) {
    if (pattern[i] === '\\') { i += 2; continue }
    if (pattern[i] === ']')  { i++;    break      }
    i++
  }

  return { end: i, raw: pattern.slice(start, i) }
}

// Group description and scanner

function describeGroup(raw, captureIndex) {
  if (raw.startsWith('(?:')) {
    return {
      description: 'Non-capturing group: groups the enclosed expression without remembering what it matched',
      useCase:     'Commonly used for: grouping alternatives or applying a quantifier without creating a numbered capture',
    }
  }
  if (raw.startsWith('(?')) {
    return {
      description: 'Advanced group feature (lookahead, lookbehind, or named group)',
      useCase:     null,
    }
  }
  return {
    description: `Capturing group ${captureIndex} matches and remembers the enclosed expression`,
    useCase:     'Commonly used for: extracting parts of a match, such as the domain in a URL or the year in a date',
  }
}

// Scans from '(' to the matching ')', respecting escapes, character classes, and nesting
// Returns { end, raw } where end is the index after the closing ')'
function scanGroup(pattern, start) {
  let i     = start + 1
  let depth = 1

  while (i < pattern.length && depth > 0) {
    if (pattern[i] === '\\') { i += 2; continue }
    if (pattern[i] === '[')  { const r = scanCharClass(pattern, i); i = r.end; continue }
    if (pattern[i] === '(')  { depth++; i++; continue }
    if (pattern[i] === ')')  { depth--; i++; continue }
    i++
  }

  return { end: i, raw: pattern.slice(start, i) }
}

// Core tokenizer

/**
 * Tokenize a raw regex pattern string into an ordered array of Chunk objects.
 *
 * Scope: anchors (^ $ \b \B), shorthand classes (\d \w \s and negatives),
 * character classes ([...]), capturing and non-capturing groups ((...) (?:...)),
 * escape sequences, plain literals, alternation (|), and quantifiers (+ * ? {n,m})
 * attached to their preceding token. Advanced group syntax (lookahead etc.) is
 * described generically rather than broken down further.
 *
 * @param {string} pattern  raw pattern (no slashes or flags)
 * @returns {{ chunks: Chunk[], warnings: string[] }}
 */
export function explainRegex(pattern) {
  const chunks   = []
  const warnings = []
  let   i            = 0
  let   chunkIdx     = 0
  let   captureCount = 0

  while (i < pattern.length) {
    const ch    = pattern[i]
    const start = i
    const id    = `chunk-${chunkIdx++}`

    // Anchors: ^ and $
    if (ch === '^' || ch === '$') {
      chunks.push(makeChunk(id, ch, start, i + 1, TOKEN.ANCHOR, ANCHOR_DESCRIPTIONS[ch]))
      i += 1
      continue
    }

    // Escape sequences (\x)
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1]
      const raw  = '\\' + next

      // Word boundary anchors
      if (next === 'b' || next === 'B') {
        chunks.push(makeChunk(id, raw, start, i + 2, TOKEN.ANCHOR, ANCHOR_DESCRIPTIONS[raw]))
        i += 2
        continue
      }

      // Shorthand classes (\d \w \s and their negatives)
      if (SHORTHAND_DESCRIPTIONS[raw] !== undefined) {
        chunks.push(makeChunk(id, raw, start, i + 2, TOKEN.SHORTHAND, SHORTHAND_DESCRIPTIONS[raw]))
        i += 2
        i = consumeQuantifier(pattern, i, chunks)
        continue
      }

      // Known non shorthand escapes
      if (ESCAPE_DESCRIPTIONS[raw] !== undefined) {
        chunks.push(makeChunk(id, raw, start, i + 2, TOKEN.ESCAPE, ESCAPE_DESCRIPTIONS[raw]))
        i += 2
        i = consumeQuantifier(pattern, i, chunks)
        continue
      }

      // Anything else, unknown escape
      warnings.push(`"${raw}" at position ${start} is not yet handled, treated as unknown`)
      chunks.push(makeChunk(id, raw, start, i + 2, TOKEN.UNKNOWN, {
        description: `Unrecognised escape sequence "${raw}"`,
      }))
      i += 2
      continue
    }

    // Character classes [...]
    if (ch === '[') {
      const { end, raw } = scanCharClass(pattern, i)
      const negated      = raw[1] === '^'
      const useCase      = negated
        ? null
        : 'Commonly used for: matching a specific set of characters at a given position'
      chunks.push(makeChunk(id, raw, start, end, TOKEN.CHAR_CLASS, {
        description: describeCharClass(raw),
        useCase,
      }))
      i = end
      i = consumeQuantifier(pattern, i, chunks)
      continue
    }

    // Groups (...)
    if (ch === '(') {
      const { end, raw } = scanGroup(pattern, i)
      const isCapturing  = !raw.startsWith('(?')
      if (isCapturing) captureCount++
      const { description, useCase } = describeGroup(raw, captureCount)
      chunks.push(makeChunk(id, raw, start, end, TOKEN.GROUP, { description, useCase }))
      i = end
      i = consumeQuantifier(pattern, i, chunks)
      continue
    }

    // Alternation
    if (ch === '|') {
      chunks.push(makeChunk(id, '|', start, i + 1, TOKEN.ALTERNATION, {
        description: 'Alternation, matches either the expression before or the expression after this |',
        useCase:     'Commonly used for: expressing two or more alternatives, e.g. cat|dog',
      }))
      i += 1
      continue
    }

    // Everything else is a plain literal
    chunks.push(makeChunk(id, ch, start, i + 1, TOKEN.LITERAL, {
      description: describeChar(ch),
    }))
    i += 1
    i = consumeQuantifier(pattern, i, chunks)
  }

  return { chunks, warnings }
}

// Summary generator
// Converts the chunk array into a single plain-English sentence.

function quantifierToPrefix(q) {
  if (!q) return null
  if (q === '+' || q === '+?') return 'one or more'
  if (q === '*' || q === '*?') return 'zero or more'
  if (q === '?' || q === '??') return 'optionally'
  const rangeM = q.match(/^\{(\d+),(\d+)\}\??$/)
  if (rangeM) return `between ${rangeM[1]} and ${rangeM[2]}`
  const minM = q.match(/^\{(\d+),\}\??$/)
  if (minM) return `${minM[1]} or more`
  const exactM = q.match(/^\{(\d+)\}\??$/)
  if (exactM) return `exactly ${exactM[1]}`
  return null
}

// Singular and plural forms for common literal characters
const LITERAL_FORMS = {
  ' ':  { single: 'a space',        plural: 'spaces'      },
  '-':  { single: 'a hyphen',       plural: 'hyphens'     },
  '_':  { single: 'an underscore',  plural: 'underscores' },
  '@':  { single: 'an @ symbol',    plural: '@ symbols'   },
  '#':  { single: 'a # symbol',     plural: '# symbols'   },
  '/':  { single: 'a slash',        plural: 'slashes'     },
  '.':  { single: 'a dot',          plural: 'dots'        },
}

const ESCAPE_LABELS = {
  '\\.':  'dot',             '\\\\': 'backslash',
  '\\n':  'newline',         '\\t':  'tab',
  '\\r':  'carriage return',
}

const SHORTHAND_LABELS = {
  '\\d': 'digit',                '\\D': 'non-digit character',
  '\\w': 'word character',       '\\W': 'non-word character',
  '\\s': 'whitespace character', '\\S': 'non-whitespace character',
}

// Returns the chunk's raw text with the quantifier suffix removed
function chunkBase(chunk) {
  return chunk.quantifier ? chunk.raw.slice(0, -chunk.quantifier.length) : chunk.raw
}

// Produces a short readable phrase for one chunk, ready to drop into a sentence
function chunkToPhrase(chunk) {
  const pre  = quantifierToPrefix(chunk.quantifier)
  const base = chunkBase(chunk)

  switch (chunk.type) {
    case TOKEN.ANCHOR:
      if (base === '\\b') return 'at a word boundary'
      if (base === '\\B') return 'at a non-word boundary'
      return null  // ^ and $ handled at sentence level

    case TOKEN.LITERAL: {
      const forms = LITERAL_FORMS[base]
      if (!pre)                 return forms?.single       ?? `"${base}"`
      if (pre === 'optionally') return `an optional ${forms?.single ?? `"${base}"`}`
      return `${pre} ${forms?.plural ?? `"${base}" characters`}`
    }

    case TOKEN.ESCAPE: {
      const label = ESCAPE_LABELS[base]
      if (!label)               return `"${base}"`
      if (!pre)                 return `a literal ${label}`
      if (pre === 'optionally') return `an optional ${label}`
      return `${pre} literal ${label}s`
    }

    case TOKEN.SHORTHAND: {
      const label = SHORTHAND_LABELS[base]
      if (!label)               return `"${base}"`
      if (!pre)                 return `a ${label}`
      if (pre === 'optionally') return `an optional ${label}`
      return `${pre} ${label}s`
    }

    case TOKEN.CHAR_CLASS: {
      const isNegated = base.startsWith('[^')
      const singular  = isNegated ? `a character not in ${base}` : `a character from ${base}`
      const plural    = isNegated ? `characters not in ${base}`  : `characters from ${base}`
      if (!pre)                 return singular
      if (pre === 'optionally') return `an optional ${singular}`
      return `${pre} ${plural}`
    }

    case TOKEN.GROUP: {
      const isNonCapturing = chunk.description.startsWith('Non-capturing')
      const label          = isNonCapturing ? 'the grouped pattern' : 'a captured group'
      if (!pre)                 return label
      if (pre === 'optionally') return `an optional ${label}`
      return `${pre} occurrences of ${label}`
    }

    case TOKEN.ALTERNATION:
      return null  // handled as a segment separator below

    default:
      return `"${base}"`
  }
}

/**
 * Produce a single plain-English sentence describing what the pattern matches
 * Works from the already-computed chunk array so no extra parsing needed
 *
 * @param {Chunk[]} chunks
 * @returns {string}
 */
export function summarizeRegex(chunks) {
  if (!chunks.length) return ''

  const first = chunks[0]
  const last  = chunks[chunks.length - 1]

  const startsAnchored = first.type === TOKEN.ANCHOR && first.raw === '^'
  const endsAnchored   = last.type  === TOKEN.ANCHOR && last.raw  === '$'

  // Strip ^ and $ anchors to inform the intro sentence, not the content
  const body = chunks.filter(c => !(c.type === TOKEN.ANCHOR && (c.raw === '^' || c.raw === '$')))

  // Split on alternation operators to produce separate alternative segments
  const segments = []
  let current = []
  for (const chunk of body) {
    if (chunk.type === TOKEN.ALTERNATION) { segments.push(current); current = [] }
    else                                  { current.push(chunk) }
  }
  segments.push(current)

  // Convert each segment to a "X, followed by Y, followed by Z" phrase
  const segmentStrings = segments
    .map(seg => {
      const phrases = seg.map(chunkToPhrase).filter(Boolean)
      if (!phrases.length) return ''
      const last = phrases.pop()
      return phrases.length ? phrases.join(', followed by ') + ', followed by ' + last : last
    })
    .filter(Boolean)

  if (!segmentStrings.length) return ''

  const body_sentence = segmentStrings.length === 1
    ? segmentStrings[0]
    : segmentStrings.join(', or alternatively ')

  const intro = startsAnchored && endsAnchored ? 'Matches the complete string:'
    : startsAnchored                           ? 'Matches strings starting with:'
    : endsAnchored                             ? 'Matches strings ending with:'
    :                                            'Matches text containing:'

  const cap = body_sentence.charAt(0).toUpperCase() + body_sentence.slice(1)
  return `${intro} ${cap}.`
}
