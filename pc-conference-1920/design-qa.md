# Design QA

## Scope

- Reference images: `飞书文档-PC端官网图片-2026-09-13/01-大会.png` through `06-未命名节点.png`
- Implementation: six HTML entries under `pc-conference-1920`
- Target viewport: 1920 × 1080 CSS pixels

## Visual checks

- Conference page: header, architecture hero, five colored pillars, about block, highlights, partner logos, and footer inspected.
- Schedule page: hero, date/category filters, agenda cards, speaker chips, and footer inspected.
- News page: hero, featured mosaic, news card grid, pagination, and footer inspected.
- News detail page: HTDC header, title/meta, pull quote, article images, body copy, and footer inspected.
- Service page: hero, service rail, guidance panel, support cards, and footer inspected.
- Ticket page/modal: two-column rules and QR layout inspected at 1920px.

## Runtime evidence

- All five primary pages report an actual page width of 1920px.
- Expected heights: 5076, 3382, 3366, 3152, and 1615px.
- Six routes load with zero broken images.
- Navigation between the primary pages works.
- The featured news item opens `/news-detail.html`.
- The ticket modal opens and closes from the header call-to-action.
- Browser console: zero warnings and zero errors.
- Production build and Sites packaging tests pass.

## Notes

- The first four references were authored on a 1080px design canvas and are rendered at an exact 16:9 scale factor to reach 1920px.
- The service reference is natively 1920px wide and is rendered without scaling.
- The ticket screenshot is represented both as a standalone page and as an interactive modal.

final result: passed
