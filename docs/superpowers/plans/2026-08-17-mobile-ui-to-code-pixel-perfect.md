# Mobile UI To Code Pixel Perfect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and install an independently named Skill that reconstructs mobile PNG/JPG UI references into real frontend code with fail-closed pixel-fidelity and production evidence.

**Architecture:** Initialize a new Skill package, copy the proven `mobile-ui-to-html` resources, then add a render-contract initializer and a deterministic capture/diff iteration runner. Keep detailed model-assisted reconstruction rules in a one-level reference and preserve the existing authoritative production acceptance tooling.

**Tech Stack:** Markdown/YAML Skill package, Node.js ESM scripts, Sharp, Playwright, copied JSON/Markdown templates, Codex Skill validators.

## Global Constraints

- Do not edit `/Users/tongyuhu/.codex/skills/mobile-ui-to-html`.
- Use `mobile-ui-to-code-pixel-perfect` as the new folder and frontmatter name.
- Treat `exact` as equal dimensions, zero RGBA mismatch, no mask, and no comparison transformation.
- Never infer a render contract when multiple viewport/DPR interpretations remain plausible.
- Keep visual fidelity, responsive adaptation, functional completeness, and production readiness as separate results.
- Do not modify or commit unrelated files in the current uncommitted repository.

---

### Task 1: Establish the new package

**Files:**
- Create: `skills/mobile-ui-to-code-pixel-perfect/`
- Create: `skills/mobile-ui-to-code-pixel-perfect/agents/openai.yaml`
- Copy: all `assets/`, `references/`, and `scripts/` from `/Users/tongyuhu/.codex/skills/mobile-ui-to-html/`

**Interfaces:**
- Consumes: the validated baseline Skill package.
- Produces: a self-contained editable copy with the new Skill identity.

- [ ] Initialize the folder with `init_skill.py` and exact interface metadata.
- [ ] Copy baseline resources without changing the source Skill.
- [ ] Mechanically replace copied package identity strings with `mobile-ui-to-code-pixel-perfect`.
- [ ] Confirm the new tree contains every baseline file.

### Task 2: Add render-contract initialization

**Files:**
- Create: `skills/mobile-ui-to-code-pixel-perfect/scripts/init_reconstruction_case.mjs`
- Test: `.harness/skill-development/mobile-ui-to-code-pixel-perfect/test-init-reconstruction-case.mjs`

**Interfaces:**
- Consumes: `--reference`, `--case-dir`, `--project-root`, `--page`, `--framework`, `--url`, explicit CSS viewport, DPR, screenshot scale, and capture mode.
- Produces: `reference/reference-metadata.json`, page evidence directories, and `manifest.json` populated from the copied template.

- [ ] Write a test that proves ambiguous input without an explicit contract exits non-zero.
- [ ] Run the test and verify it fails because the script is absent.
- [ ] Implement argument validation, inspector execution, dimension matching, directory creation, and manifest population.
- [ ] Run the test and verify ambiguous, mismatched, and matching cases behave as specified.

### Task 3: Add one-round visual iteration orchestration

**Files:**
- Create: `skills/mobile-ui-to-code-pixel-perfect/scripts/run_visual_iteration.mjs`
- Test: `.harness/skill-development/mobile-ui-to-code-pixel-perfect/test-run-visual-iteration.mjs`

**Interfaces:**
- Consumes: reference image, URL, iteration directory, locked viewport/DPR/capture options, run ID, and exact or fully specified threshold mode.
- Produces: browser screenshot, `.capture.json`, `diff.png`, `overlay.png`, `metrics.json`, and `iteration.json`.

- [ ] Write tests for exact identical-image success, changed-image failure, and incomplete threshold argument rejection.
- [ ] Run tests and verify failure because the runner is absent.
- [ ] Implement deterministic child-process orchestration around copied capture and comparison scripts.
- [ ] Run tests and confirm all behavior tests pass.

### Task 4: Rewrite the Skill workflow and references

**Files:**
- Modify: `skills/mobile-ui-to-code-pixel-perfect/SKILL.md`
- Create: `skills/mobile-ui-to-code-pixel-perfect/references/model-assisted-reconstruction.md`
- Modify: `skills/mobile-ui-to-code-pixel-perfect/assets/page-analysis.template.md`
- Modify: `skills/mobile-ui-to-code-pixel-perfect/assets/pixel-perfect-manifest.template.json`
- Modify: `skills/mobile-ui-to-code-pixel-perfect/agents/openai.yaml`

**Interfaces:**
- Consumes: RED baseline findings and deterministic script contracts.
- Produces: concise triggering metadata, a staged high-fidelity workflow, explicit completion claims, model-use boundaries, and complete evidence fields.

- [ ] Write the workflow around source integrity, contract lock, inventories, real DOM, visual iterations, responsive checks, and dual final gates.
- [ ] Add a quick-reference decision table, common failure table, and one complete command example.
- [ ] Add source-confidence, inventory, model-assistance, and visual-iteration fields to templates.
- [ ] Regenerate `agents/openai.yaml` from the completed Skill identity.

### Task 5: Validate and pressure-test

**Files:**
- Produce: `.harness/skill-development/mobile-ui-to-code-pixel-perfect/validation/`

**Interfaces:**
- Consumes: the complete staged Skill.
- Produces: structural validation, syntax results, script behavior results, and independent forward-test reports.

- [ ] Run `quick_validate.py` and the local skill validator.
- [ ] Run `node --check` for every script.
- [ ] Run initializer and iteration behavior tests.
- [ ] Run the original copied script smoke checks.
- [ ] Forward-test deadline, source-ambiguity, and release-pressure scenarios with the new Skill.
- [ ] Patch any discovered loopholes and repeat the affected tests.

### Task 6: Install without overwriting the baseline

**Files:**
- Install: `/Users/tongyuhu/.codex/skills/mobile-ui-to-code-pixel-perfect/`

**Interfaces:**
- Consumes: validated workspace package.
- Produces: a discoverable installed Skill while preserving the original Skill unchanged.

- [ ] Verify the destination does not already contain unrelated user work.
- [ ] Copy the validated package to the Codex Skills directory.
- [ ] Re-run structural validation against the installed path.
- [ ] Compare source and installed file hashes and report the result.

## Plan self-review

- Every design requirement maps to Tasks 1–6.
- The new scripts have explicit failing tests before implementation.
- No placeholders or unspecified thresholds are present.
- Source Skill preservation and dirty-worktree protection are explicit.
