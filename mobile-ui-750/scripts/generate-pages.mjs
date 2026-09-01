import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './page-registry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');

export function generatePageHtml(page) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=750, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="color-scheme" content="dark">
  <title>${page.name} · 湾区人才大会</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../styles/tokens.css">
  <link rel="stylesheet" href="../styles/base.css">
  <link rel="stylesheet" href="../styles/components.css">
  <link rel="stylesheet" href="../styles/pages.css">
</head>
<body data-page-id="${page.id}" style="--target-height: ${page.targetHeight}px">
  <div id="app" class="mobile-canvas" aria-live="polite"></div>
  <script type="module" src="../scripts/page.js"></script>
</body>
</html>
`;
}

export function generatePages() {
  const pagesDir = resolve(projectRoot, 'pages');
  mkdirSync(pagesDir, { recursive: true });
  for (const page of PAGES) {
    writeFileSync(resolve(pagesDir, page.file), generatePageHtml(page));
  }
  return PAGES.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = generatePages();
  process.stdout.write(`Generated ${count} mobile page entries.\n`);
}
