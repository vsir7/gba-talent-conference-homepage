# Conference Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, responsive H5 rendition of the provided conference-home reference using real DOM and generated shortcut icons.

**Architecture:** A dependency-free `index.html` hosts the semantic view. `styles.css` supplies the deterministic visual system and `app.js` owns small interactive feedback. Generated shortcut PNGs live in `public/assets/icons`; visual-evidence files are isolated in `.harness/`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in test runner, locally generated PNG assets.

## Global Constraints

- Reference state: 853 x 1844 long screenshot, Chinese locale, top of page.
- Text, cards, navigation and labels must be DOM, not screenshot composites.
- Five common-service shortcuts use individual generated PNG assets and DOM labels.
- No external network assets or dependencies.
- Exact 100 percent pixel equality is not claimed unless the strict no-mask comparison passes.

---

### Task 1: Establish runnable page and DOM contract

**Files:**
- Create: `package.json`
- Create: `tests/conference-home.test.mjs`
- Create: `index.html`
- Create: `app.js`

**Interfaces:**
- Produces `data-ui-ready="true"` on the page root and five `[data-shortcut]` buttons.
- Produces `window.__conferenceHome` with `selectNav(id)` for nav interaction.

- [ ] Write a failing Node test asserting the page file, ready state, five shortcut buttons and five generated shortcut assets.
- [ ] Run `node --test tests/conference-home.test.mjs` and verify it fails because `index.html` is absent.
- [ ] Implement the minimal semantic document and interaction hook required by the test.
- [ ] Re-run the test and verify it passes.

### Task 2: Implement the visual system

**Files:**
- Create: `styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes semantic sections from Task 1.
- Produces the long conference home composition: hero, task card, notice, event cards, shortcut card, lecture cards and fixed tab bar.

- [ ] Add CSS tokens for the pale lavender surface, deep blue type, purple gradients, radii and shadows.
- [ ] Match the 390px mobile layout first, then prevent horizontal overflow at 375px and 414px.
- [ ] Keep all card titles, metadata and action labels as visible DOM text.

### Task 3: Verify and record visual evidence

**Files:**
- Create: `.harness/traces/20260811-conference-home/conference-home/manifest.json`
- Create: `.harness/traces/20260811-conference-home/conference-home/analysis/page-analysis.md`
- Create: `.harness/traces/20260811-conference-home/conference-home/analysis/icon-role-inventory.json`

**Interfaces:**
- Uses the captured reference and production page URL.
- Produces repeatable screenshots and comparison metrics.

- [ ] Start the static preview server.
- [ ] Capture the full page with the registered reference viewport contract.
- [ ] Compare dimensions and pixels, recording the actual outcome without an artificial threshold.
- [ ] Run the Node tests and browser smoke checks for the primary interactions.
