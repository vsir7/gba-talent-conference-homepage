# H5 Mobile Design System Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the conference mobile design system to inherit the researched cross-platform foundation while making H5 the primary implementation target.

**Architecture:** Keep `design-tokens.json` as the only machine-readable source of truth. Store design values as logical pixels, generate H5 typography variables as `rem`, and keep layout/control variables in CSS logical pixels. Treat the generic specification as a foundation and `design.md` as the conference-specific override layer.

**Tech Stack:** Markdown, JSON Design Tokens, Node.js ESM generator, CSS Custom Properties, TypeScript, Node test runner.

**Spec:** `/Users/tongyuhu/Documents/ChatGPT/dahui/mobile-foundation-design-spec.md`

## Global Constraints

- Primary target is H5/mobile Web at 320–480 CSS px.
- Default body and input typography is 16/24; secondary body is 14/22.
- Cross-platform default touch target is 48×48; 44×44 is the iOS/platform minimum exception.
- Spacing uses absolute-value token names and a 4px atomic / 8px primary rhythm.
- Conference brand colors, imagery, business components, and page templates remain project-specific.
- `design-tokens.json` remains the only editable token source; generated CSS and TypeScript are never edited directly.

---

### Task 1: Lock the upgraded H5 contract with tests

**Files:**
- Modify: `tests/design-tokens.test.mjs`
- Modify: `tests/design-system-doc.test.mjs`

**Interfaces:**
- Consumes: current token schema and Markdown headings.
- Produces: assertions for version 2.0.0, 16px body/input typography, 48px touch target, H5 rem output, 4/8 spacing, inherited foundation, and new generic component contracts.

- [ ] **Step 1: Add failing token assertions**

Assert `meta.version === "2.0.0"`, `typography.bodyMedium.fontSize === "16px"`, `size.touchTarget === "48px"`, compact/standard control sizes, and the five-level motion scale.

- [ ] **Step 2: Add failing documentation assertions**

Assert that `design.md` declares inheritance from the generic specification, includes H5 viewport/text scaling rules, and documents Dialog, BottomSheet, Toast/Snackbar, Radio/Switch, and optional TabBar contracts.

- [ ] **Step 3: Run the design-system tests and confirm they fail**

Run: `npm run test:design-system`

Expected: FAIL on the new v2.0.0/H5 contract assertions.

### Task 2: Upgrade the machine-readable token source

**Files:**
- Modify: `design-system/tokens/design-tokens.json`
- Modify: `design-system/tokens/build-tokens.mjs`
- Generate: `design-system/tokens/design-tokens.css`
- Generate: `design-system/tokens/design-tokens.ts`

**Interfaces:**
- Consumes: Task 1 assertions.
- Produces: v2.0.0 tokens and H5-ready generated artifacts.

- [ ] **Step 1: Upgrade semantic typography and font fallbacks**

Set default body/input to 16/24, add compact/default title variants, 11px micro exception, 28px large metric, and the four permitted weights.

- [ ] **Step 2: Normalize spacing, radius, icons, controls, and motion**

Remove 2/6/10 from the global spacing scale, keep 24px radius and 14/64px icons as component-only exceptions, set touch target to 48px, add 40px small and 56px list controls, and use 100/160/240/320/400ms motion tokens.

- [ ] **Step 3: Generate H5 artifacts**

Convert typography font-size and line-height pixel source values to `rem` in generated CSS while preserving the JSON/TypeScript logical-pixel values.

Run: `npm run tokens:build`

### Task 3: Upgrade `design.md` as the H5 project layer

**Files:**
- Modify: `design.md`

**Interfaces:**
- Consumes: the upgraded tokens from Task 2 and the generic foundation specification.
- Produces: a self-contained v2.0.0 H5-first production specification.

- [ ] **Step 1: Update scope, inheritance, and precedence**

Put accessibility/system constraints first, project-approved rules second, generic foundation third, and screenshots/Figma visual calibration after them.

- [ ] **Step 2: Add the H5 runtime baseline**

Document viewport metadata, 100% text sizing, `text-size-adjust`, rem typography output, CSS logical-pixel layout tokens, safe areas, dynamic viewport units, 320px reflow, and the prohibition on disabling zoom.

- [ ] **Step 3: Synchronize all numeric tables**

Update typography, spacing, radius, icon, motion, control, search, input, Tab, checkbox, and touch target rules to match the token source.

- [ ] **Step 4: Add missing common component contracts**

Add Dialog, BottomSheet/ActionSheet, Toast/Snackbar, Radio/Switch, Avatar, and an optional TabBar contract without enabling a bottom navigation architecture that the seven screenshots do not establish.

- [ ] **Step 5: Strengthen H5 accessibility and AI constraints**

Require 200% text scaling, flexible component heights, semantic focus management, keyboard-safe fixed actions, 48px default hit areas, and no direct use of unregistered values.

### Task 4: Regenerate, verify, and review drift

**Files:**
- Verify: `design.md`
- Verify: `design-system/tokens/design-tokens.json`
- Verify: generated CSS/TypeScript
- Verify: `tests/design-*.test.mjs`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: verified production-ready H5 design-system baseline.

- [ ] **Step 1: Run generated-artifact drift check**

Run: `npm run tokens:check`

Expected: `Generated token files are current.`

- [ ] **Step 2: Run design-system tests**

Run: `npm run test:design-system`

Expected: all design-system tests pass.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`

Expected: report exact pass/fail state and identify any unrelated existing failure without changing unrelated application behavior.

- [ ] **Step 4: Review the final diff**

Confirm there are no direct edits to generated files beyond generator output, no 15px default input text, no 44px cross-platform default touch token, no generic `space-N` ordinal naming, and no unfinished placeholders.
