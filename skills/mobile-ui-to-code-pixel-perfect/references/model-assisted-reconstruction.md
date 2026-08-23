# Model-Assisted Raster Reconstruction

## Contents

1. Model role
2. Evidence hierarchy
3. Source analysis
4. First-draft generation
5. Visual repair loop
6. Long screenshots
7. Prohibited shortcuts
8. Completion boundary

## 1. Model Role

Vision models, OCR, and coding models are accelerators, not acceptance authorities.

Use them for:

- proposing a text and element inventory;
- describing layout hierarchy and repeated components;
- drafting DOM/component structure;
- producing a first implementation in the target stack;
- proposing a localized repair hypothesis from a crop, overlay, and metrics.

Do not use a model’s “looks correct” judgment as the final visual gate. Browser capture plus deterministic image comparison is authoritative.

## 2. Evidence Hierarchy

When evidence conflicts, prefer:

1. authorized original assets and font files;
2. the full-resolution original raster source;
3. authoritative copy, routes, data contracts, and project source;
4. measured geometry and browser-computed styles;
5. OCR or model observations;
6. unverified model guesses.

Lower-ranked evidence may fill gaps temporarily but cannot override higher-ranked evidence without an explicit reason.

## 3. Source Analysis

Give the model:

- the original image or native-resolution inspection tiles;
- the explicit viewport/DPR/screenshot-scale contract;
- the target framework, component system, and design tokens;
- authoritative text where available;
- known asset and font paths;
- the exact selected state;
- the rule that the source screenshot may not be embedded as the page.

Before asking for code, request structured outputs:

- major regions and hierarchy;
- repeated component groups;
- text candidates with confidence and location;
- asset regions and the proposed source strategy;
- fixed, sticky, scroll, safe-area, and overlay behavior;
- uncertainties that affect fidelity.

Verify these outputs against the source before implementation.

## 4. First-Draft Generation

The first draft must:

- use the target project’s framework and existing primitives;
- render visible text and controls as real DOM or native UI;
- include every verified visible element;
- use normal document layout unless layering is genuinely present;
- use exact local assets when available;
- expose a deterministic readiness signal such as data-ui-ready=true;
- keep data, animation, clock, and randomness stable for capture.

The first draft is a measured starting point, not a completion claim.

## 5. Visual Repair Loop

Do not ask a model to “make it more similar” without evidence. Provide:

- a localized reference crop;
- the matching candidate crop;
- diff and overlay;
- mismatch bounds and image metrics;
- relevant DOM bounds and computed styles;
- the files and selectors that may be changed;
- the current iteration ledger.

Require one repair statement:

    observed difference
    → likely cause
    → files/selectors
    → one related variable group
    → expected metric or bounds effect

Capture and compare again after the change. Keep the change only when visual evidence improves without removing content, breaking interaction, or introducing a prohibited shortcut.

## 6. Long Screenshots

For long screenshots:

- create overlapping inspection tiles without changing the original source;
- detect sticky or fixed elements that may repeat across stitched captures;
- verify lazy-loaded content and virtual lists;
- measure cumulative vertical drift at every major section boundary;
- preserve the registered scroll state and bottom safe area;
- compare using the corresponding full-page capture contract.

Never position the inspection tiles as the implementation.

## 7. Prohibited Shortcuts

Reject:

- the reference screenshot as a page background or foreground;
- whole-card, whole-control, module, or text-region crops;
- model-generated visible text inside images;
- transformed, rescaled, auto-aligned, or recolored references for exact comparison;
- thresholds chosen after seeing the result;
- masks used to hide deterministic mismatches;
- model self-assessment as the final gate;
- responsive exactness claims without matching references.

## 8. Completion Boundary

Keep three boundaries explicit:

1. **Code assistance complete** — the model produced or repaired code.
2. **Visual gate complete** — stable browser captures passed the registered exact or thresholded comparison.
3. **Production gate complete** — build, official route, data/state, tests, controlled preview, accessibility, performance, security, and asset provenance passed when required.

Only the second boundary supports a visual fidelity claim. Only the third supports a production-readiness claim.
