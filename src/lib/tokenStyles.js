/**
 * Token colours are grouped by *meaning*, not one hue per token type — four
 * families plus neutral literals, instead of an eight-colour rainbow:
 *
 *   position   ^  $  \b        where in the string
 *   set        [a-z]  \d  \w   which characters
 *   structure  (...)  |        how the pattern is assembled
 *   escape     \.  \n  \t      a special character taken literally
 *   literal                    plain text — deliberately uncoloured, it is
 *                              the bulk of most patterns and colouring it
 *                              is what makes these displays unreadable
 */
export const TOKEN_STYLE = {
  anchor:      { text: 'text-tok-position',  soft: 'bg-tok-position/15'  },
  charClass:   { text: 'text-tok-set',       soft: 'bg-tok-set/15'       },
  shorthand:   { text: 'text-tok-set',       soft: 'bg-tok-set/15'       },
  group:       { text: 'text-tok-structure', soft: 'bg-tok-structure/15' },
  alternation: { text: 'text-tok-structure', soft: 'bg-tok-structure/15' },
  escape:      { text: 'text-tok-escape',    soft: 'bg-tok-escape/15'    },
  literal:     { text: 'text-ink-muted',     soft: 'bg-ink-muted/15'     },
  unknown:     { text: 'text-danger',        soft: 'bg-danger/15'        },
}

export function styleFor(type) {
  return TOKEN_STYLE[type] ?? TOKEN_STYLE.unknown
}
