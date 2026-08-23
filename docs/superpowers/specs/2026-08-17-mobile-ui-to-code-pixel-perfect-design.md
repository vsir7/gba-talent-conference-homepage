# Mobile UI To Code Pixel Perfect Skill Design

## Objective

Create an independently discoverable Codex Skill named `mobile-ui-to-code-pixel-perfect` by copying the existing `mobile-ui-to-html` package and strengthening it for PNG/JPG mobile UI reconstruction where the primary outcome is the highest defensible visual fidelity.

The Skill must produce real, maintainable frontend code in the target project's native stack. It must never obtain a favorable screenshot by placing the supplied page image, large composite crops, or rasterized text over the viewport.

## Success contract

The Skill separates three outcomes:

1. `exact`: a frozen reference state, viewport, DPR, browser, OS, fonts, assets, data, and capture method produce equal-size reference and candidate images with zero RGBA mismatch pixels and no mask or hidden transformation.
2. `thresholded`: the user explicitly approves non-zero thresholds before the final gate; the report names the true metrics and never uses `100%`, `exact`, or `完全一致`.
3. `blocked`: source ambiguity, unavailable fonts/assets, unstable rendering, inaccessible browser state, or missing production evidence prevents the requested claim while allowing verified partial work to continue.

Responsive quality and production readiness are reported separately from reference-state pixel fidelity.

## Baseline failures to correct

Pre-skill pressure tests showed four recurring risks:

- Inferring `375@2x` or `390@3x` directly from image width without proving that interpretation.
- Inventing acceptance values such as `1 CSS px`, `SSIM 0.985`, or `Delta E 2` without user approval.
- Treating one screenshot comparison as stable evidence.
- Mixing visual similarity, functional behavior, and production release readiness in one completion claim.

The new package turns these into fail-closed contracts rather than prose suggestions.

## Architecture

### Core workflow

`source integrity -> render-contract lock -> semantic/visual inventory -> real-DOM implementation -> deterministic capture -> exact/approved-threshold diff -> localized repair loop -> responsive checks -> production gate -> authoritative report`

### Reused baseline

Copy all existing reference, asset, and deterministic tooling from `mobile-ui-to-html`, including reference inspection, atomic asset extraction, page capture, image comparison, icon provenance, production preview, command receipts, and final acceptance verification.

### Additions

1. `scripts/init_reconstruction_case.mjs`
   - Create the evidence directory structure.
   - Inspect the original image through the copied inspector.
   - Refuse to guess an ambiguous viewport/DPR contract.
   - Populate a page manifest from the bundled template only after an explicit contract matches the reference dimensions.

2. `scripts/run_visual_iteration.mjs`
   - Execute one deterministic capture-and-diff round.
   - Preserve capture reports, metrics, diff, overlay, command arguments, reference/candidate hashes, and next-action classification.
   - Use `exact` by default; accept threshold parameters only when all values are explicitly supplied.

3. `references/model-assisted-reconstruction.md`
   - Define model use as draft assistance, OCR/text augmentation, asset inventory, and repair planning.
   - Forbid model self-assessment from acting as the final visual gate.

4. Expanded manifest and analysis templates
   - Record source quality, contract provenance, text/asset/component inventories, model assistance, user-approved thresholds, iteration evidence, and unresolved assumptions.

## Implementation rules

- Reuse target-project components, tokens, routes, data clients, and tests.
- Render product text, controls, lists, tabs, forms, and states with real DOM/native UI primitives.
- Prefer original licensed assets. Register every extracted or generated asset and its hash.
- Use OCR as a candidate extractor only; verify every visible string against the original pixels or authoritative copy.
- Repair differences in this order: canvas/contract, shell geometry, component geometry, typography, color/effects, atomic assets, rasterization residue.
- Change one related variable group per iteration and retain every round's evidence.
- Do not loosen thresholds, add masks, resize, crop, blur, flatten, or auto-align after seeing a failed result.

## Validation

- Run Codex Skill structural validation.
- Syntax-check every copied and added Node script.
- Test initializer rejection for ambiguous and dimension-mismatched render contracts.
- Test initializer success for an explicit matching contract.
- Test exact visual iteration with identical images and failure with changed pixels.
- Test threshold mode refuses incomplete threshold arguments.
- Forward-test the completed Skill under deadline, missing-source, and release-pressure scenarios.

## Deployment

Keep an editable source copy in the current workspace and install the validated package at `~/.codex/skills/mobile-ui-to-code-pixel-perfect/`. Do not modify the existing `mobile-ui-to-html` Skill.
