<div align="center">
  <img src="./src/assets/EzRegexLogo.png" alt="EzRegex Logo" width="120" />

  # EzRegex

  **Regex made readable.**

  [![Live Demo](https://img.shields.io/badge/Live-Demo-6366F1?style=flat)](https://ezregex.vercel.app)
  [![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://ezregex.vercel.app)
  [![Built with React](https://img.shields.io/badge/Built_with-React-61DAFB?style=flat&logo=react)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

A visual regex playground with live match highlighting and plain-English breakdowns of every part of your pattern - no docs required.

**[Live demo →](https://ezregex.vercel.app)** *(https://ezregex.vercel.app)*

---

![EzRegex - main view showing the editor, match highlighting, and breakdown panel](./src/assets/main.png)

---

## Features

- **Live match highlighting** - matches are highlighted in your test string as you type, using a transparent overlay that preserves cursor position and scroll
- **Plain-English breakdown** - every token in your regex (anchors, character classes, groups, quantifiers, etc.) is explained in human-readable language, one card per token
- **Bidirectional hover** - hover or click any colored chunk in the regex display to highlight its explanation card, and vice versa
- **One-sentence summary** - a single natural-language sentence summarises what the whole regex matches, shown directly below the input
- **25 categorised examples** - searchable library across Validation, Extraction, Cleanup, and Code categories, with live active-state highlighting
- **Flag toggles** - `g`, `i`, `m`, `s` flags with tooltip descriptions, keyboard accessible
- **Dark / light mode** - class-based toggle, defaults to dark
- **Mobile responsive** - examples panel becomes a slide-out drawer on screens below 768 px
- **Accessible** - all inputs labelled, `aria-live` match count, keyboard navigation throughout, focus-visible rings on every interactive element

---

## How it works

### Match highlighting

The test string textarea sits on top of a transparent `div` (the "backdrop"). Both share identical font, size, padding, and scroll position. Matches are wrapped in `<mark>` spans inside the backdrop, which shows through the transparent textarea text. This lets you see highlighting without any `contenteditable` complexity.

### Plain-English breakdown

`src/lib/regexExplainer.js` is a hand-written tokenizer that walks the pattern character by character and emits typed *chunks*:

| Chunk type | Example | Description |
|------------|---------|-------------|
| `anchor` | `^`, `\b` | Start/end assertions |
| `shorthand` | `\d`, `\w`, `\s` | Built-in character classes |
| `charClass` | `[a-z0-9_]` | Custom character sets with range detection |
| `group` | `(...)`, `(?:...)` | Capturing and non-capturing groups |
| `escape` | `\.`, `\n` | Escaped literals and special sequences |
| `quantifier` | `+`, `{2,5}?` | Repetition, attached to the preceding token |
| `alternation` | `\|` | Or-branches |
| `literal` | `abc` | Plain characters |

Each chunk carries a `description` and optional `useCase`. The `summarizeRegex` function then folds all chunks into a single natural sentence, handling leading/trailing anchors and alternation branches.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Fonts | Inter (UI), JetBrains Mono (code) |
| Language | JavaScript (ESM, no TypeScript) |
| Regex engine | Native browser `RegExp` |
| Hosting | Vercel (free tier) |

---

## Project structure

```
src/
  components/
    Header.jsx        - branding, dark-mode toggle, mobile hamburger
    Sidebar.jsx       - examples panel, slide-out drawer on mobile
    EditorPanel.jsx   - regex input, flag toggles, summary, test string
    ResultsPanel.jsx  - breakdown cards with bidirectional highlighting
    RegexDisplay.jsx  - coloured, interactive regex chunk display
    Footer.jsx        - attribution
  lib/
    regexEngine.js    - parseRegex, getMatches, buildHighlightedHtml
    regexExplainer.js - tokeniser, chunk descriptions, summarizeRegex
  data/
    examples.json     - 25 categorised example regexes
```

---

## Acknowledgements

Built by [yuv1s](https://github.com/yuv1s). AI-assisted scaffolding and boilerplate; the regex tokenizer and product decisions are hand-written.
