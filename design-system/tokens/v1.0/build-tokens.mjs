import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(currentDir, 'design-tokens.json');
const cssPath = path.join(currentDir, 'design-tokens.css');
const tsPath = path.join(currentDir, 'design-tokens.ts');
const tokens = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const kebab = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .toLowerCase();

function toRem(value) {
  const number = Number.parseFloat(value);
  const rem = Number((number / 16).toFixed(6));
  return `${rem}rem`;
}

function toCssValue(pathSegments, value) {
  const last = pathSegments.at(-1);
  if (pathSegments[0] === 'typography'
    && (last === 'font-size' || last === 'line-height')
    && /^\d+(?:\.\d+)?px$/.test(String(value))) {
    return toRem(value);
  }
  return String(value);
}

function flatten(value, prefix = [], output = []) {
  for (const [key, child] of Object.entries(value)) {
    if (key === 'meta') continue;
    const next = [...prefix, kebab(key)];
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child, next, output);
    } else {
      output.push([`--${next.join('-')}`, toCssValue(next, child)]);
    }
  }
  return output;
}

const css = [
  '/* Generated from design-tokens.json. Do not edit directly. */',
  ':root {',
  ...flatten(tokens).map(([name, value]) => `  ${name}: ${value};`),
  '}',
  ''
].join('\n');

const ts = [
  '// Generated from design-tokens.json. Do not edit directly.',
  `export const designTokens = ${JSON.stringify(tokens, null, 2)} as const;`,
  '',
  'export type DesignTokens = typeof designTokens;',
  ''
].join('\n');

if (process.argv.includes('--check')) {
  const checks = [
    [cssPath, css],
    [tsPath, ts]
  ];
  let failed = false;
  for (const [target, expected] of checks) {
    const actual = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (actual !== expected) {
      console.error(`OUT_OF_DATE ${path.basename(target)}`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log('Generated token files are current.');
} else {
  fs.writeFileSync(cssPath, css);
  fs.writeFileSync(tsPath, ts);
  console.log('Generated design-tokens.css and design-tokens.ts.');
}
