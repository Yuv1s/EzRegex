// Tokenizer
export const TOKEN = {
  ANCHOR:      'anchor',
  ESCAPE:      'escape',
  SHORTHAND:   'shorthand',
  CHAR_CLASS:  'charClass',
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
const QUANTIFIABLE = new Set([TOKEN.LITERAL, TOKEN.ESCAPE, TOKEN.SHORTHAND, TOKEN.CHAR_CLASS])

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
  '\\\\': { description: 'Matches a literal backslash',             useCase: null },
  '\\n':  { description: 'Matches a newline character',             useCase: null },
  '\\r':  { description: 'Matches a carriage-return character',     useCase: null },
  '\\t':  { description: 'Matches a tab character',                 useCase: null },
  '\\(':  { description: 'Matches a literal opening parenthesis',   useCase: null },
  '\\)':  { description: 'Matches a literal closing parenthesis',   useCase: null },
  '\\[':  { description: 'Matches a literal opening square bracket', useCase: null },
  '\\]':  { description: 'Matches a literal closing square bracket', useCase: null },
  '\\{':  { description: 'Matches a literal opening curly brace',   useCase: null },
  '\\}':  { description: 'Matches a literal closing curly brace',   useCase: null },
  '\\^':  { description: 'Matches a literal caret character',       useCase: null },
  '\\$':  { description: 'Matches a literal dollar sign',           useCase: null },
  '\\|':  { description: 'Matches a literal pipe character',        useCase: null },
  '\\+':  { description: 'Matches a literal plus sign',             useCase: null },
  '\\*':  { description: 'Matches a literal asterisk',              useCase: null },
  '\\?':  { description: 'Matches a literal question mark',         useCase: null },
}

// Shorthand class table

const SHORTHAND_DESCRIPTIONS = {
  '\\d': { description: 'Matches any digit (0 through 9)',                                                useCase: 'Commonly used for: phone numbers, zip codes, numeric IDs' },
  '\\D': { description: 'Matches any non-digit character',                                                useCase: null },
  '\\w': { description: 'Matches any word character (letters a–z, A–Z, digits 0–9, or underscore)',      useCase: 'Commonly used for: usernames, identifiers, and alphanumeric input' },
  '\\W': { description: 'Matches any non-word character (spaces, punctuation, symbols, etc.)',            useCase: null },
  '\\s': { description: 'Matches any whitespace character (space, tab, newline, carriage return)',        useCase: 'Commonly used for: splitting on whitespace or stripping blank tokens' },
  '\\S': { description: 'Matches any non-whitespace character',                                           useCase: null },
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
  // ] as first char (after optional ^) is literal, skip it so it doesn't end the scan early
  if (i < pattern.length && pattern[i] === ']') i++

  while (i < pattern.length) {
    if (pattern[i] === '\\') { i += 2; continue }
    if (pattern[i] === ']')  { i++;    break      }
    i++
  }

  return { end: i, raw: pattern.slice(start, i) }
}

// Core tokenizer

/**
 * Tokenize a raw regex pattern string into an ordered array of Chunk objects.
 *
 * Current scope: anchors (^ $ \b \B), shorthand classes (\d \w \s and negatives),
 * character classes ([...]), escape sequences, plain literals, alternation (|),
 * and quantifiers (+ * ? {n,m}) attached to their preceding token.
 * Groups are not yet handled, ( ) land as plain literals.
 *
 * @param {string} pattern  raw pattern (no slashes or flags)
 * @returns {{ chunks: Chunk[], warnings: string[] }}
 */
export function explainRegex(pattern) {
  const chunks   = []
  const warnings = []
  let   i        = 0
  let   chunkIdx = 0

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
