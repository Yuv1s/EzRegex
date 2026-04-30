# EzRegex — Build Roadmap

> A planning and progress document for **EzRegex**, a visual regex playground that explains patterns in plain English.

This roadmap captures the full development plan: the vision, the technical decisions, the build order, the prompts used, and the lessons learned along the way. It exists for two reasons:

1. **For me** - a single source of truth so I always know what's next and why each piece exists.
2. **For visitors** - to show how the project was actually built, including the workflow, the AI-assisted parts, and the parts I engineered by hand.

---

## Table of Contents

- [Project Vision](#project-vision)
- [Audience](#audience)
- [Tech Stack & Architectural Decisions](#tech-stack--architectural-decisions)
- [AI Workflow & Transparency](#ai-workflow--transparency)
- [Build Plan](#build-plan)
  - [Step 1 — Scaffold ✅](#step-1--scaffold-)
  - [Step 2 — Polished Shell ✅](#step-2--polished-shell-)
  - [Step 3 — Live Regex Matching ✅](#step-3--live-regex-matching-)
  - [Step 4 — Flag Toggles ✅](#step-4--flag-toggles-)
  - [Step 5 — Examples Panel](#step-5--examples-panel)
  - [Step 6 — Plain-English Breakdown](#step-6--plain-english-breakdown)
  - [Step 7 — Polish Pass](#step-7--polish-pass)
  - [Step 8 — Deploy to Vercel](#step-8--deploy-to-vercel)
- [Git Loop](#git-loop)
- [Lessons Learned](#lessons-learned)

---

## Project Vision

Most regex tools assume you already know regex. They give you a blank input field and expect you to bring a pattern. That's a problem, the people who'd benefit most from a regex tool are the ones still learning, and they're shut out by tools that demand fluency upfront.

**EzRegex flips that.** It's a regex playground that:

- Lets you test patterns against real strings with live, color coded match highlighting
- Explains what your regex actually means in plain English, updated as you type
- Comes with a categorized library of common examples you can load and modify

The goal isn't to replace heavyweight tools like regex101 for power users. It's to be the **clearest, fastest way to understand regex** which is useful for a developer who needs a quick refresher, and approachable for someone learning the syntax for the first time.

---

## Audience

EzRegex is built for three overlapping groups, in order of priority:

1. **Students learning regex** - week 2 of a CS course, encountering `\d+` for the first time and wanting to *see* it work
2. **Developers who write regex occasionally** - the largest group; people who use regex once a month and always reach for a tool to refresh their memory
3. **Power users** - secondary audience; the polished UX and plain-English breakdown should still feel respectful of their time, even if they don't need the training-wheels features

The design intentionally does **not** target "complete non technical people." Someone who has never written a regex isn't going to start here regardless. Designing for "the curious learner".

---

## Tech Stack & Architectural Decisions

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React (Vite, JavaScript) | Live state updates are React's strength, and reactivity is the whole interaction model. Vite for instant dev server + simple deploys. JavaScript over TypeScript to limit scope on a portfolio project. |
| **Styling** | Tailwind CSS | Fast iteration, consistent design tokens, dark mode built-in. Standard in modern React projects. |
| **State** | React `useState` / `useEffect` | No global store needed. The app is a single screen with a handful of inputs, Redux/Zustand would be overengineering. |
| **Regex engine** | Native JavaScript `RegExp` | Already in the browser. No external library. Means no Python/PCRE flavor differences to worry about. |
| **Plain-English parser** | Custom-built | Hand-written tokenizer in `src/lib/regexExplainer.js`. The interesting engineering of the project. |
| **Backend** | None | No auth, no persistence, no data the user shares. Everything runs client-side. Means free hosting and zero ops complexity. |
| **Hosting** | Vercel | Free tier, auto-deploy on every push to `main`, optimized for Vite. |
| **Fonts** | Inter (sans) + JetBrains Mono (code) | Inter for clean UI text, JetBrains Mono for code/regex (designed for legibility of programming syntax). |
| **Accent color** | Indigo `#6366F1` | Distinctive without being overdone. Differentiates from the sea of blue-accented dev tools. |

### Why no backend

The architectural choice that defines the whole project. Going client sided means:

- **No login friction** - open and use
- **No privacy concerns** - your test strings never leave your browser
- **Zero infrastructure cost** - Vercel free tier handles it indefinitely
- **Faster** - no network round trips for matching
- **Forces good scoping** - if a feature needs a backend, it doesn't belong in v1

---

## AI Workflow & Transparency

This project was built with **Claude Code** as a pair programmer in VS Code. I want to be upfront about that becuase modern development uses AI assistance, and pretending otherwise would be dishonest.

**How I used AI:**

- **Scaffolding** — Vite setup, Tailwind config, layout structure, header, dark mode toggle, placeholder content. All things I could write myself but would take hours and aren't where the value of this project lives.
- **Boilerplate** — JSON example data, small UI components, repetitive styling.
- **Sounding board** — talking through design decisions, debugging tricky CSS, writing this roadmap.

**What I built myself:**

- **The plain-English regex breakdown parser** (`src/lib/regexExplainer.js`) - the differentiating feature of the app. I wrote the tokenizer, the explanation logic, and the highlighting connection between regex and explanation by hand, because that's the part I most want to understand deeply.
- **Architectural decisions** - every choice in the table above is mine.
- **Product direction** - the audience targeting, the focus on plain English explanation as the differentiator, the decision to skip features like multi language regex flavors and URL sharing.

**Verification:** the commit history shows iterative work over multiple sessions, not a single one shot dump.

---

## Build Plan

The plan is to ship a polished, deployed v1 in 7 focused steps. Each step ends with a working app that's better than the last and a clean commit. No "WIP" branches, no half-finished features sitting in the codebase.

---

### Step 1 — Scaffold ✅

**Goal:** working Vite + React project, pushed to GitHub.

**What was done:**
- `npm create vite@latest` with JavaScript + React (no TypeScript, no React Compiler — keeping scope small)
- Initialized git, made first commit
- Created GitHub repo, connected origin, pushed
- Resolved a nested folder mistake along the way (project files got pushed inside an extra `EzRegex/` folder; flattened to root)

**Commit messages:** `initial Vite + React scaffold`, `fix: flatten nested EzRegex folder to repo root`

---

### Step 2 — Polished Shell ✅

**Goal:** the app *looks* finished even though nothing works yet. Three-column layout, dark mode, header, custom favicon. Setting up the visual foundation first means every subsequent feature drops into something that already feels like a real product.

**Prompt used:**

```
I'm building a React app called "EzRegex" — a regex playground with a live
plain-English breakdown feature. The Vite + React project is already
scaffolded. I want to set up the polished shell now and build the actual
logic in subsequent steps.

Set up:
- Tailwind CSS configured and working
- Folder structure: src/components/, src/lib/, src/data/
- Three-column responsive layout: left sidebar (Examples), center main panel
  (Editor + Test String + Results), collapsing to single-column on mobile
- Dark mode by default with a toggle in the header (class-based dark mode)
- Header: "EzRegex" wordmark on the left, GitHub link + dark mode toggle on
  the right
- Inter (sans) and JetBrains Mono (code) loaded from Google Fonts
- Accent color: indigo-500 (#6366F1)

Fill the panels with clearly-labeled placeholder content. Create empty stub
files for src/lib/regexEngine.js, src/lib/regexExplainer.js, and
src/data/examples.json. Do not implement any matching, example loading, or
parsing logic. Update README with project name, one-line description,
work-in-progress note, install instructions, tech stack section.
```

**Also done in this step:**
- Custom favicon designed in Gemini Nano Banana, transparent background, multiple sizes via realfavicongenerator.net
- Updated `<title>` and meta description tags

**Commit message:** `scaffold three-column layout with Tailwind and dark mode`

---

### Step 3 — Live Regex Matching ✅

**Goal:** the regex actually works. Type a pattern, type a test string, see matches highlight in real time.

**Prompt:**

```
Now wire up the regex input and test string textarea so that as the user
types either, matches are highlighted in real-time in the test string. Use
the native JavaScript RegExp object. Handle invalid regex gracefully (show
a small error message under the input, don't crash). Put the matching logic
in src/lib/regexEngine.js. Show me the diff before applying it and explain
the highlighting approach in plain English.
```

**Commit message:** `live regex matching with error handling`

---

### Step 4 — Flag Toggles ✅

**Goal:** the four common regex flags (`g`, `i`, `m`, `s`) are toggleable, with tooltips so beginners learn what they do.

**Prompt:**

```
Add flag toggles (g, i, m, s) as small pill buttons next to the regex
input. Wire them into the matching engine in src/lib/regexEngine.js.
Active flags should have a clear visual state (filled with accent color).
Hovering should show a tooltip explaining what each flag does (e.g., "g —
global, find all matches").
```

**Commit message:** `regex flag toggles with tooltips`

---

### Step 5 — Examples Panel

**Goal:** new users have something to click. The examples panel is the on-ramp for everyone who arrives without a regex of their own.

**Prompt:**

```
Build the Examples panel. Populate src/data/examples.json with about 15
examples across three categories:
- Validation: email, US phone number, URL, IPv4 address, US ZIP code
- Extraction: numbers (integers and decimals), dates (YYYY-MM-DD),
  hashtags, @mentions
- Cleanup: extra whitespace, HTML tags, trailing punctuation

Each example should have: id, category, label, regex pattern, flags,
sample test string (with content that will produce visible matches),
one-line description.

Then build the panel UI: categorized clickable cards. Clicking a card
loads the regex, flags, and sample test string into the editor. The
cards should display the regex in monospace and the description below it.
```

**Commit message:** `examples panel with 15 categorized starter regexes`

---

### Step 6 — Plain-English Breakdown

**Goal:** the differentiating feature. As the user types a regex, a separate "pretty-rendered" view of that regex appears below the input, with each chunk styled and clickable. Beside or below it, a stack of **breakdown cards** explains every chunk in plain English. The two views are **linked bidirectionally** — hovering or clicking a chunk on either side highlights its counterpart.

**This is the step I'm building by hand.** The prompt below is for *design help only* — Claude Code should explain the approach, not write the implementation.

**Breakdown card format (per chunk):**

- **Line 1** — the literal regex syntax for that chunk (monospace, e.g. `[\w.-]+`)
- **Line 2** — plain-English description of what it matches (e.g. "Match one or more characters that are a letter, number, underscore, dot, or hyphen")
- **Line 3 (optional)** — a "commonly used for…" use-case note (e.g. "Often used for the username or domain part of an email"). Trivial tokens like `^` and `$` skip this line.

**Chunking strategy:** logical units, not individual tokens. Quantifiers attach to their target — `[\w.-]+` is **one** chunk, not two. `{2,6}` attaches to the previous token. Readable for learners without being overwhelming.

**Interactivity (bidirectional link):**

- Hover a chunk in the rendered regex → its breakdown card highlights
- Hover a breakdown card → the corresponding regex chunk highlights
- Click a chunk in the regex → its card scrolls into view and briefly highlights
- Click a card → the corresponding regex chunk briefly highlights
- Bonus: keyboard navigation through chunks with arrow keys, Enter to jump

**Parser scope (what to handle in v1):** anchors (`^`, `$`, `\b`), character classes (`[abc]`, `[a-z]`, `[^abc]`), shorthand classes (`\d`, `\w`, `\s` and their negatives), quantifiers (`+`, `*`, `?`, `{n}`, `{n,m}`), groups (capturing and non-capturing), alternation (`|`), literal characters, common escapes (`\.`, `\\`, `\n`, `\t`). Exotic features (lookahead, backreferences, named groups) can show a generic "advanced feature" card for now and be expanded later.

**Prompt (design phase only):**

```
I want to build the plain-English breakdown myself — this is the
differentiating feature of EzRegex. Help me design the approach before I
implement.

The breakdown UX has three connected pieces:

1. The regex INPUT FIELD (a normal text box where the user types — already
   built in earlier steps).

2. A PRETTY-RENDERED REGEX display, separate from the input. It shows the
   same regex but each chunk is wrapped in a span with a stable chunk ID,
   styled distinctly, and interactive (hover and click both work).

3. A BREAKDOWN PANEL of cards, one per chunk, each showing:
   - Line 1: the literal regex syntax for that chunk (monospace)
   - Line 2: a plain-English description of what it matches
   - Line 3 (optional, only when meaningful): a "commonly used for..." note
     about typical use cases. Trivial tokens like ^ and $ can skip this.

The two displays are LINKED BIDIRECTIONALLY by chunk ID:
   - Hovering a chunk in the regex display highlights its breakdown card
   - Hovering a breakdown card highlights the corresponding regex chunk
   - Clicking a chunk in the regex smooth-scrolls its card into view AND
     highlights it
   - Clicking a card briefly highlights the corresponding regex chunk
   - Bonus: keyboard navigation through chunks with arrow keys, Enter to
     jump

CHUNKING STRATEGY: logical units, not individual tokens. A quantifier
attaches to its target: [\w.-]+ is ONE chunk, not two. {2,6} attaches to
the previous token. This makes the breakdown readable for learners
without overwhelming them.

PARSER SCOPE: handle the common 80% of regex syntax cleanly. Anchors
(^, $, \b), character classes ([abc], [a-z], [^abc]), shorthand classes
(\d, \w, \s and their negatives), quantifiers (+, *, ?, {n}, {n,m}),
groups (capturing, non-capturing), alternation (|), literal characters,
and common escapes (\., \\, \n, \t). Exotic features (lookahead,
backreferences, named groups) can show a generic "advanced feature"
description rather than a full breakdown for v1.

DON'T WRITE THE IMPLEMENTATION YET. Give me:
1. The function signature for the parser (input regex string → output what
   exactly?)
2. The shape of a "chunk" object (id, raw text, position, description,
   useCase, etc.)
3. A walkthrough of the tricky parsing cases:
   - Quantifiers attaching to previous tokens
   - Escapes inside character classes ([\w.-] — the dot is literal here,
     not "any char")
   - Nested groups
   - Detecting where one chunk ends and the next begins
4. Sample output for the regex ^[\w.-]+@[\w.-]+\.[a-z]{2,6}$ — the full
   array of chunk objects, populated, so I know what I'm building toward.

Then I'll attempt the implementation in src/lib/regexExplainer.js and
we'll review.
```

**Quality bar for this feature:**
- Updates live as the user types (not on a button press)
- Each chunk highlights both in the regex and in the explanation, in matching colors
- Hovering an explanation chunk highlights the corresponding regex chunk and vice versa
- Click-to-jump scrolls the right card into view smoothly
- Invalid regex shows "Can't parse — fix the syntax error first" instead of crashing or going blank
- Handles 80% of common regex tokens cleanly. Exotic edge cases can be incomplete; common cases must be flawless.

**Commit message (after I implement it):** `plain English regex breakdown`

---

### Step 7 — Polish Pass

**Goal:** the difference between "side project" and "portfolio piece." Most people would stop after Step 6. The polish pass is what just adds that final touch.

**Prompt:**

```
Final polish pass:
- Subtle 150ms fade animations when match results update
- Mobile responsive: sidebar becomes a slide-out drawer (hamburger button)
  below 768px
- Accessibility: proper labels on all inputs, keyboard navigation for
  example cards (Enter/Space to load), focus rings on all interactive
  elements
- Update the README with: real screenshots (or placeholder image links I
  can replace), feature list, tech stack, link to live demo, brief "how
  it works" section explaining the plain-English breakdown
- Add a footer with attribution and a "built with React + Vite" note
```

**Commit message:** `accessibility, animations, mobile drawer, polished README`

---

### Step 8 — Deploy to Vercel

**Goal:** live URL the world can visit.

**Steps:**
1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. Click **Add New → Project**
3. Find `EzRegex` in the repo list, click **Import**
4. Accept defaults (Vercel auto-detects Vite), click **Deploy**
5. ~30 seconds later: live URL like `ezregex.vercel.app`
6. Add the URL to the README as the **Live Demo** link
7. Commit and push

**Commit message:** `added live demo link to README`

---

## Git Loop

The three commands run after every step:

```bash
git add -A
git commit -m "your message here"
git push
```
---

## Lessons Learned

*Filled in as the build progresses.*

### Step 1 — Scaffold

- **`git init` belongs in the project folder, not the parent.** First push had everything nested inside an extra folder because git was tracking from one directory up. Lost ~20 minutes flattening it. Worth it as a permanent muscle-memory fix.
- **PowerShell blocks unsigned scripts by default.** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` is a one time fix every Windows dev needs. Should have known this from setup days but forgot.
- **VS Code's terminal inherits PATH at launch.** If you install something while VS Code is open, you have to fully quit and relaunch, not just restart the terminal panel.

### Step 2 — Polished Shell

- **Designing the shell before writing logic actually saves time.** Every subsequent feature gets to drop into a layout that already looks like a product, which makes feature work feel finished sooner. Reverse order would mean rebuilding the visual layer after the fact.
- **Gemini's "transparent backgrounds" aren't actually transparent.** The checkered pattern is rendered into the image. remove.bg is a nice 10 second fix.
- **Frameworks are wrappers around web fundamentals.** Got stuck on changing the tab title before realizing it's just `<title>` in `index.html` - the same HTML tag from 1991. Useful reminder: when stuck in a framework, ask whether the answer lives in the underlying web platform.

### Step 3 — Live Regex Matching

- *(fill in once complete — what worked, what didn't, surprises)*

### Step 4 — Flag Toggles

- *(fill in once complete — what worked, what didn't, surprises)*

---

*Last updated after Step 4.*

*Thanks for following along!*
