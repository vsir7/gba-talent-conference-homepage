# Mobile Design System Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `design.md` from an inferred screenshot summary into a traceable, unambiguous, production-ready mobile design-system contract.

**Architecture:** Keep `design.md` as the single human-readable source of truth. Organize it as evidence and confidence, primitive tokens, semantic tokens, named component variants, page-selection rules, machine-readable CSS/JSON/TypeScript contracts, and verifiable acceptance gates.

**Tech Stack:** Markdown, CSS custom properties, JSON Design Tokens, TypeScript token exports, Node.js validation scripts.

## Global Constraints

- The seven supplied screenshots are the highest-priority visual evidence.
- Screenshot business copy and data are examples, not product requirements.
- Production accessibility corrections must be marked separately from screenshot-derived values.
- H5, WeChat Mini Program, and mobile Web must share semantic tokens while handling platform navigation and safe areas separately.
- Real DOM is required; screenshot replacement is prohibited.

---

### Task 1: Evidence and Measurement Contract

**Files:**
- Modify: `design.md`

**Interfaces:**
- Consumes: seven supplied PNG screenshots and the approved audit findings.
- Produces: explicit source dimensions, inferred canvas confidence, production viewport rules, and value-origin labels.

- [x] **Step 1:** Record all screenshot dimensions and distinguish physical pixels from logical CSS pixels.
- [x] **Step 2:** Replace the unsupported single `390px` source-canvas claim with separate reference and production baselines.
- [x] **Step 3:** Define `observed`, `normalized`, and `production-correction` value origins.
- [x] **Step 4:** Verify no text claims that inferred values are original Figma measurements.

### Task 2: Complete Token Contract

**Files:**
- Modify: `design.md`

**Interfaces:**
- Consumes: evidence contract from Task 1.
- Produces: canonical primitive, semantic, component, breakpoint, opacity, z-index, control-size, typography, and motion tokens.

- [x] **Step 1:** Complete the human-readable token tables.
- [x] **Step 2:** Make CSS variables contain every canonical token used by component rules.
- [x] **Step 3:** Add equivalent JSON and TypeScript token contracts with matching names and values.
- [x] **Step 4:** Validate that all text and gradient pairings meet the declared contrast rules.

### Task 3: Components, Variants, and Selection Rules

**Files:**
- Modify: `design.md`

**Interfaces:**
- Consumes: semantic and component tokens from Task 2.
- Produces: deterministic component variants and page templates.

- [x] **Step 1:** Correct AppBar, GuestCard, IdentityTile, InfoRow, SearchBar, MessageCard, and Hero conflicts.
- [x] **Step 2:** Add FeatureEntryCard, NoticeBar, ProfileHeader, AvatarBadge, ApprovalSummaryCard, MapOverview, MapLegend, Checkbox, AgreementRow, ActionRow, SectionLinkHeader, ViewCount, and explicit feedback-state components.
- [x] **Step 3:** Replace ambiguous “or/may/recommended” choices with named variants and exact selection conditions.
- [x] **Step 4:** Add component accessibility, content overflow, loading, disabled, error, and platform rules.

### Task 4: Production Verification

**Files:**
- Verify: `design.md`

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: a passing validation report or an explicit list of remaining gaps.

- [x] **Step 1:** Render Markdown and verify headings, tables, code blocks, and internal structure.
- [x] **Step 2:** Parse CSS, JSON, and TypeScript token examples and compare canonical values.
- [x] **Step 3:** Scan for placeholders and unresolved selection ambiguity.
- [x] **Step 4:** Re-check all seven screenshot patterns against the component inventory.
- [x] **Step 5:** Verify contrast, safe-area, touch-target, responsive, and real-DOM gates.
