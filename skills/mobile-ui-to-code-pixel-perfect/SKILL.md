---
name: mobile-ui-to-code-pixel-perfect
description: Use when a user provides mobile PNG/JPG UI screenshots, long screenshots, exported mockups, or browser captures and requires highly faithful frontend reconstruction, screenshot-to-code implementation, pixel-level matching, exact visual comparison, or production-grade mobile H5, Vue, React, uni-app, or Mini Program delivery.
---

# Mobile UI Image to Pixel-Perfect Frontend

## Objective

Reconstruct a mobile UI raster source as real, maintainable frontend code, then drive the implementation toward the highest defensible visual fidelity with deterministic browser captures and machine image comparison.

The target is not “looks similar.” The target is:

1. the correct reference state;
2. an explicit render contract;
3. real DOM or target-platform native primitives;
4. measured, iterative repair;
5. repeatable screenshot evidence;
6. an honest claim bounded by the evidence.

Use model vision, OCR, and code generation to accelerate analysis and drafting. Never use model judgment as the final visual gate.

## Claim Contract

| Claim | Required evidence |
| --- | --- |
| **Exact / 100% at the registered state** | Equal image dimensions; zero RGBA mismatch; no masks, transforms, automatic alignment, or hidden regions; at least three fresh serial captures that are pairwise exact; candidate compared to the untouched original reference under one frozen render contract. |
| **Thresholded pixel-level match** | User-approved thresholds recorded before the run; equal dimensions; metrics within those thresholds; stable repeated captures; no post-hoc threshold changes. |
| **Blocked** | Missing or ambiguous render contract, inaccessible registered reference, unavailable font/key asset that leaves a nonzero mismatch, unstable rendering, or inability to capture and compare the real page. |

“Exact” applies only to the registered viewport, state, browser, fonts, data, and capture method. It does not imply unprovided states or widths also match.

Report these independently:

- reference-state visual fidelity;
- other viewport/responsive behavior;
- interaction and state completeness;
- production readiness.

Visual exactness does not prove production readiness. A successful build does not prove visual exactness.

The local evidence chain detects stale, inconsistent, and tampered pixel metrics by recomputing pixels, but it is not a cryptographic attestation system. If mutually untrusted parties may forge capture reports or approvals, run the gate in controlled CI, pin the verifier and dependency lock, compare immutable artifact snapshots, and preserve signed build logs/artifacts.

Read [references/pixel-perfect-contract.md](references/pixel-perfect-contract.md) before choosing a claim.

## Required References

Read only what the task needs:

- [references/pixel-perfect-contract.md](references/pixel-perfect-contract.md): evidence levels and allowed wording.
- [references/raster-reconstruction.md](references/raster-reconstruction.md): raster measurement and reconstruction.
- [references/defect-taxonomy.md](references/defect-taxonomy.md): systematic visual defect checks.
- [references/model-assisted-reconstruction.md](references/model-assisted-reconstruction.md): safe use of vision, OCR, and coding models.
- [references/production-delivery-contract.md](references/production-delivery-contract.md): additionally required when the user requests 上线、可发布、生产级、正式页面、正式路由、接入现有项目、production-ready, or release delivery.
- [references/generated-shortcut-icons.md](references/generated-shortcut-icons.md): only when the task explicitly requires newly generated shortcut icons. Exact authorized source assets take priority in ordinary reconstruction.

## Non-Negotiable Rules

1. **Use the highest-quality registered source.** Prefer the full-resolution original. If only a chat export or compressed derivative exists, classify it honestly and compare only against those supplied pixels; do not call it the pre-compression original.
2. **Lock the render contract before styling.** Record the CSS viewport, DPR, screenshot scale, pixel dimensions, browser, fonts, locale, theme, state, data, scroll position, and capture mode.
3. **Do not infer the contract from width alone.** Widths such as 750, 780, 828, 1125, 1170, and 1242 may represent different viewport/DPR/export combinations. A contract is eligible for exact tuning only when selected by an explicit user confirmation, design metadata, or auditable project evidence independent of image width. An agent-selected working configuration remains provisional.
4. **Implement real UI.** Text, buttons, labels, forms, tabs, cards, lists, and controls must be DOM/CSS or target-platform native primitives.
5. **Never disguise the source image as implementation.** Do not use the page screenshot, a composite crop, rasterized text, canvas, or stitched tiles to cover the viewport.
6. **Prefer exact assets.** Use, in order: authorized original assets; losslessly extracted atomic assets; an exact licensed match; generated substitutes only when no exact asset exists and the user accepts the resulting limitation. One extraction may contain one atomic asset, not a card, control, text region, or module.
7. **Never invent thresholds.** SSIM, Delta E, mismatch ratio, or channel tolerance values are valid only when an authorized user explicitly accepts the exact numbers, page, and state before comparison. Preserve that approval with assets/threshold-approval.template.json and its SHA-256.
8. **Treat OCR and model output as hypotheses.** Verify text, hierarchy, coordinates, fonts, colors, and assets against source evidence.
9. **Change one related variable group per iteration.** Preserve the causal link between a repair and the metric change.
10. **Prove stability.** Before final comparison, capture at least three times serially using new browser processes and require pairwise exact equality.
11. **Keep development and release evidence separate.** Development-server screenshots accelerate iteration but do not prove a production artifact.
12. **Do not weaken claims under time pressure.** Deadline pressure can reduce scope, never the evidence standard.
13. **Do not evade the grade with synonyms.** Phrases such as “高度还原,” “肉眼无差异,” “几乎完全一致,” or “像素级完成” must state the machine visual grade and evidence result beside them; otherwise use a weaker factual description.

## Inputs and Blocking Conditions

Collect:

- original reference path and source;
- page/state name and whether it is a viewport, long screenshot, or component crop;
- target repository, framework, route, and run command;
- available fonts, icons, images, copy, data, and states;
- expected reference viewport/device if known;
- required implementation scope: visible state only, interaction, responsive behavior, or production integration.

Continue with verifiable work when information is incomplete, but mark the exact gate blocked when:

- no stable registered reference file can be accessed;
- source compression/cropping/scale is unknown and materially changes geometry;
- more than one viewport/DPR contract remains plausible;
- exact fonts or key assets are unavailable and substitutes leave measured differences;
- the real page cannot be captured in a browser;
- rendering is nondeterministic;
- the user asks for states that the source does not show.

Track implementation progress and exact-gate status separately: implementation may proceed as provisional while exact remains blocked. State the minimum evidence needed to unblock exactness. Do not silently guess.

If the user accepts a generated or redesigned asset as a new baseline, create a new task/state ID, reference hash, and claim. Never overwrite the original-reference evidence chain and then report equality to the new baseline as restoration of the old image.

## Evidence Layout

Use one directory per page/state:

    .harness/traces/<task-id>/<page-state>/
    ├── reference/
    ├── analysis/
    ├── captures/
    ├── diffs/
    ├── iterations/
    ├── release/
    ├── final/
    └── manifest.json

Copy:

- assets/pixel-perfect-manifest.template.json to manifest.json;
- assets/page-analysis.template.md to analysis/page-analysis.md;
- assets/acceptance-report.template.md to final/acceptance-report.md;
- assets/release-readiness.template.md when production delivery is in scope.

Every evidence path is relative to the page/state evidence directory or absolute. Never mix evidence from different gate runs.

## Workflow

### 1. Inspect source integrity

Open the original at native resolution, then run:

    node <skill-dir>/scripts/inspect_reference.mjs \
      --input /absolute/path/reference.png \
      --out-dir /absolute/path/evidence/reference \
      --tile-height 844 \
      --overlap 80

Record the SHA-256, oriented pixel dimensions, alpha/color metadata, compression warning, and whether it is a viewport or long screenshot. Tiles are for inspection only; the unchanged original remains the comparison source.

Classify status bars, browser chrome, device frames, and Home Indicators as either target-owned UI or environment-owned chrome. If environment-owned pixels are part of the registered image but the capture environment cannot reproduce them, full-frame exact is blocked. Do not fake operating-system chrome in DOM merely to pass; use a separately supplied content-only reference or an equivalent capture environment.

### 2. Select an explicit render contract

Do not let a model select a viewport silently. Copy assets/render-contract-selection.template.json, record every plausible candidate and the independent evidence that selected or rejected it, then initialize the case:

    node <skill-dir>/scripts/init_reconstruction_case.mjs \
      --reference /absolute/path/reference.png \
      --case-dir /absolute/path/evidence \
      --project-root /absolute/path/project \
      --page home \
      --framework uni-app \
      --url http://127.0.0.1:3000/home \
      --contract-evidence /absolute/path/contract-selection.json \
      --css-width 390 \
      --css-height 844 \
      --dpr 3 \
      --screenshot-scale device \
      --browser chromium \
      --is-mobile true \
      --has-touch true \
      --locale zh-CN \
      --timezone Asia/Shanghai \
      --color-scheme light

The initializer fails closed when selection evidence is missing, does not match the requested contract, or the declared viewport/DPR/scale does not produce the reference pixel size. If several mappings fit, an agent may choose one only as a provisional implementation configuration; do not start exact tuning until a valid evidence source explicitly selects it.

Freeze:

- original path and hash;
- target state, data, scroll position, and overlays;
- CSS viewport, DPR, screenshot scale, and expected pixels;
- browser/version, OS, mobile/touch context;
- fonts and weights;
- locale, timezone, color scheme, reduced motion, and scrollbar policy;
- wait condition and capture mode;
- acceptance mode and any pre-approved thresholds.

After freezing, do not rescale, crop, align, recolor, or mask the reference to obtain a pass.

### 3. Build semantic inventories before code

Create four inventories in analysis/:

1. **Text inventory** — exact copy, confidence, location, line breaks, font family/weight/size/line height/letter spacing.
2. **Component inventory** — hierarchy, repeated groups, scroll/fixed/sticky behavior, controls, and states.
3. **Asset inventory** — role, source, crop bounds if atomic, dimensions, fit/position, license, and hash.
4. **State inventory** — selected tabs, expanded/collapsed areas, forms, overlays, loading/empty/error/success, and scroll position.

OCR may propose text, and a vision model may propose hierarchy, but every accepted item must be checked against the original or authoritative project evidence.

### 4. Map the target project

Inspect the existing stack before implementation:

- route and page entry;
- component and token systems;
- reset/base CSS;
- package manager and lockfile;
- asset and font loading;
- API/client/state conventions;
- build, typecheck, lint, unit, E2E, and preview commands.

Use the project’s native framework and primitives. Do not create an isolated demo shell unless the user explicitly requests one.

### 5. Implement in fidelity layers

Work in this order:

1. **Canvas and shell** — viewport, page background, safe areas, status/navigation bars, scroll container, fixed regions, z-index.
2. **Geometry** — content track, module bounds, grid/flex behavior, padding, gaps, card sizes, alignment, image boxes.
3. **Typography** — exact font files, weights, size, line height, letter spacing, baseline, wrapping, truncation, numeral width.
4. **Visual styling** — colors, borders, radii, shadows, opacity, gradients, image crop/position, icons.
5. **State and behavior** — the exact visible state first, then requested interaction and other states.

Use normal layout for normal flow. Absolute positioning is valid only when the source genuinely shows fixed or layered geometry. Mark readiness with a deterministic signal such as [data-ui-ready="true"].

### 6. Run a deterministic visual iteration

For a live page:

    node <skill-dir>/scripts/run_visual_iteration.mjs \
      --reference /absolute/path/reference.png \
      --url http://127.0.0.1:3000/route \
      --out-dir /absolute/path/evidence/iterations/01 \
      --iteration 01 \
      --run-id <fresh-run-id> \
      --width 390 --height 844 --dpr 3 \
      --screenshot-scale device \
      --wait-for '[data-ui-ready="true"]' \
      --expected-status 200 \
      --expected-final-url http://127.0.0.1:3000/route \
      --mode exact

For an already captured candidate, replace --url with:

    --candidate /absolute/path/candidate.png

The runner writes the capture, report, diff, overlay, metrics, and an append-only iteration ledger. It rejects incomplete threshold contracts and returns nonzero when the comparison fails.

### 7. Repair by evidence, not taste

Read the mismatch bounding box, heatmap, overlay, and metrics. Repair in this order:

1. render contract or canvas mismatch;
2. page shell and fixed regions;
3. module geometry and cumulative vertical drift;
4. typography and line wrapping;
5. colors, borders, shadows, and radii;
6. assets and cropping;
7. browser rasterization differences.

For every round, record:

    observed difference
    → likely cause
    → affected files/selectors
    → one variable group changed
    → expected metric/bounds effect
    → actual result

Reject a metric improvement if a required element disappears, text changes, interaction breaks, or the implementation uses a prohibited raster shortcut.

### 8. Handle long screenshots explicitly

Long screenshots require:

- an independently evidenced CSS viewport height, even though the final output is full-page; viewport height affects vh units, sticky/fixed behavior, lazy loading, and virtual lists;
- overlap-aware section inspection;
- detection of repeated sticky/fixed regions;
- lazy-load and virtual-list stabilization;
- scroll-state recording;
- cumulative drift checks at every major boundary;
- bottom safe-area and fixed-action checks.

Do not implement overlapping tiles as positioned images. Capture the reconstructed page with the corresponding full-page contract.

### 9. Prove deterministic rendering

Before the final reference comparison:

1. start from one frozen build/server state;
2. launch a fresh browser process;
3. capture serially at least three times from unique fresh browser processes with Service Workers blocked;
4. compare every candidate pair using exact mode;
5. require zero decoded RGBA mismatch for every pair. PNG/JPG container hashes may differ because of metadata; capture IDs, paths, process identities, and timestamps must still prove three fresh captures.

If the candidates differ, find the source: animation, clock, caret, random data, delayed font/image, network race, responsive observer, scrollbar, GPU/browser difference, or unstable fixture. Do not mask instability unless the user explicitly accepts a masked, non-exact claim.

### 10. Verify responsive and functional behavior separately

After the reference viewport passes, check requested widths such as 375, 390, and 414. Without reference images for those widths, report layout quality only—not pixel equality.

Also verify:

- visible text and controls are real and accessible;
- scrolling and fixed/sticky behavior;
- target interactions and navigation;
- loading/empty/error/success states when required;
- console, network, image, font, and overflow errors;
- no viewport-covering screenshot or composite raster shortcut.

### 11. Run the final visual and production gates

Create a fresh gate run ID. Recapture from the final artifact or agreed server, compare candidates for stability, then compare the final candidate to the untouched reference.

Register the final strict capture reports, every candidate-pair exact metric, and the final reference comparison in manifest.json, then run the visual-only fail-closed verifier:

    node <skill-dir>/scripts/verify_visual_fidelity.mjs \
      --manifest /absolute/path/evidence/manifest.json \
      --output /absolute/path/evidence/final/visual-fidelity-result.json \
      --run-id <gate-run-id>

The verifier freshly recomputes every candidate pair and the final reference comparison from the registered image files. Stored metrics JSON is audit input, never trusted as the verdict.

If production delivery is requested, additionally follow [references/production-delivery-contract.md](references/production-delivery-contract.md), prove the production build, official route, real data/state policy, tests, controlled preview, accessibility, performance, security, and asset provenance, then run:

    node <skill-dir>/scripts/verify_acceptance.mjs \
      --manifest /absolute/path/evidence/manifest.json \
      --output /absolute/path/evidence/final/production-acceptance-result.json \
      --run-id <gate-run-id>

The production verifier is not a substitute for the dedicated visual verifier. Keep the visual grade and production grade separate in the report.

## Quick Decisions

| Situation | Decision |
| --- | --- |
| Image width supports multiple viewport/DPR mappings | Block exact tuning until one explicit contract is selected. |
| Source is compressed | Compare only to that exact file and disclose that source fidelity is bounded by it. |
| Exact font identity is missing | Use the closest draft font and disclose the unknown. Exact remains blocked while font regions differ; a stable zero-RGBA final result may still prove equality to the registered file. |
| Model output looks prettier than the source | Reject it; fidelity is the goal. |
| Diff improves because content disappeared | Treat as regression. |
| One exact comparison passes | Continue to the stability gate. |
| User accepts tolerance | Record numeric thresholds and approval before the run. |
| Visual pass exists but production evidence is missing | Report the visual grade and production grade separately. |

## Common Failure Rationalizations

| Rationalization | Correct response |
| --- | --- |
| “750 px obviously means 375 at 2x.” | It is only a candidate until project/device evidence selects it. |
| “SSIM 0.985 is industry standard.” | There is no universal task threshold; get prior user approval. |
| “The model says it matches.” | Model assessment is not acceptance evidence. |
| “Using the screenshot as a background guarantees fidelity.” | It violates the real-frontend contract. |
| “Only anti-aliasing remains.” | Prove the source with exact metrics and environment evidence; otherwise keep the lower claim. |
| “The deadline is today.” | Reduce scope or report blocked; do not weaken the claim. |
| “The build passed.” | Build status and visual fidelity are different gates. |

## Final Output

Return:

- implementation paths and target route;
- original reference hash and frozen render contract;
- inventories and material assumptions;
- per-iteration evidence path;
- final candidate, diff, overlay, and metrics;
- stability evidence from at least three serial captures;
- visual grade with allowed claim wording;
- responsive/functional results;
- production grade, if requested;
- remaining blockers and the smallest evidence needed to remove them.

Never claim “100%,” “exact,” “pixel perfect,” or “production ready” without the corresponding evidence.
