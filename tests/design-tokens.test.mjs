import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const tokenDir = path.join(root, 'design-system', 'tokens');
const jsonPath = path.join(tokenDir, 'design-tokens.json');
const cssPath = path.join(tokenDir, 'design-tokens.css');
const tokens = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const css = fs.readFileSync(cssPath, 'utf8');

const required = [
  ['color', 'brand', '600'],
  ['color', 'title', 'primary'],
  ['color', 'title', 'brand'],
  ['color', 'title', 'emphasis'],
  ['color', 'title', 'inverse'],
  ['color', 'text', 'primary'],
  ['color', 'text', 'tertiary'],
  ['gradient', 'brand'],
  ['typography', 'pageTitle'],
  ['typography', 'cardTitleCompact'],
  ['typography', 'labelMedium'],
  ['size', 'touchTarget'],
  ['size', 'touchTargetIosMin'],
  ['size', 'appBarCustom'],
  ['layout', 'viewportReference'],
  ['layout', 'wideCanvas'],
  ['breakpoint', 'wideMin'],
  ['component', 'guestCard', 'compactColumns'],
  ['component', 'identityTile', 'compactColumns'],
  ['component', 'appBar', 'backTouchTarget'],
  ['component', 'input', 'paddingInline'],
  ['component', 'dialog', 'maxWidth'],
  ['component', 'bottomSheet', 'listItemHeight'],
  ['component', 'switch', 'touchTarget'],
  ['component', 'tag', 'iconSize'],
  ['component', 'profileHeader', 'avatarSize'],
  ['component', 'actionRow', 'minHeight'],
  ['component', 'newsCard', 'imageWidthMin'],
  ['component', 'messageCard', 'iconSize']
];

for (const keys of required) {
  let value = tokens;
  for (const key of keys) value = value?.[key];
  assert.notEqual(value, undefined, `Missing token ${keys.join('.')}`);
}

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255);
  const linear = rgb.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a, b) {
  const high = Math.max(luminance(a), luminance(b));
  const low = Math.min(luminance(a), luminance(b));
  return (high + 0.05) / (low + 0.05);
}

for (const color of [
  tokens.color.title.primary,
  tokens.color.title.brand,
  tokens.color.title.emphasis,
  tokens.color.text.primary,
  tokens.color.text.secondary,
  tokens.color.text.tertiary,
  tokens.color.state.successText,
  tokens.color.state.warningText,
  tokens.color.state.dangerText
]) {
  assert.ok(contrast(color, '#FFFFFF') >= 4.5, `${color} fails 4.5:1 on white`);
}

const gradientColors = tokens.gradient.brand.match(/#[0-9A-Fa-f]{6}/g);
for (const color of gradientColors) {
  assert.ok(contrast(color, '#FFFFFF') >= 4.5, `${color} fails white text contrast`);
}

assert.equal(tokens.meta.version, '2.0.0');
assert.equal(tokens.meta.edition, 'purple-title');
assert.equal(tokens.meta.primaryPlatform, 'H5');
assert.equal(tokens.meta.foundationSpec, 'mobile-foundation-design-spec.md');
assert.equal(tokens.meta.themeMode, 'light-only');
assert.equal(tokens.meta.defaultLocale, 'zh-CN');
assert.equal(tokens.meta.defaultTimeZone, 'Asia/Shanghai');
assert.equal(tokens.meta.browserSupport.safariIosMin, '15.4');
assert.equal(tokens.meta.browserSupport.chromiumMin, '108');
assert.equal(tokens.meta.performanceBudget.webVitals.lcpP75Max, '2500ms');
assert.equal(tokens.meta.performanceBudget.webVitals.inpP75Max, '200ms');
assert.equal(tokens.meta.performanceBudget.webVitals.clsP75Max, '0.1');

assert.equal(tokens.typography.bodyLarge.fontSize, '17px');
assert.equal(tokens.typography.bodyMedium.fontSize, '16px');
assert.equal(tokens.typography.cardTitle.fontSize, '18px');
assert.equal(tokens.typography.cardTitleCompact.fontSize, '17px');
assert.equal(tokens.typography.labelMedium.fontSize, '14px');
assert.equal(tokens.typography.labelSmall.fontSize, '13px');

assert.equal(tokens.size.touchTarget, '48px');
assert.equal(tokens.size.touchTargetIosMin, '44px');
assert.equal(tokens.size.control.sm, '40px');
assert.equal(tokens.size.control.list, '56px');
assert.equal(tokens.size.searchBar, '48px');
assert.equal(tokens.size.searchBarCompact, '44px');
assert.equal(tokens.layout.wideCanvas, '750px');

assert.equal(tokens.space['2'], undefined, '2px must not be a global spacing primitive');
assert.equal(tokens.space['6'], undefined, '6px must not be a global spacing primitive');
assert.equal(tokens.space['10'], undefined, '10px must not be a global spacing primitive');
assert.equal(tokens.radius['2xl'], undefined, '24px radius is component-specific, not global');
assert.equal(tokens.component.hero.marketingRadius, '24px');
assert.equal(tokens.component.tag.iconSize, '14px');
assert.equal(tokens.component.appBar.backTouchTarget, '48px');
assert.equal(tokens.component.input.paddingInline, '16px');
assert.equal(tokens.component.checkbox.visualSize, '24px');
assert.equal(tokens.component.switch.width, '48px');
assert.equal(tokens.component.dialog.maxWidth, '320px');
assert.equal(tokens.component.profileHeader.avatarSize, '72px');
assert.equal(tokens.component.actionRow.minHeight, '64px');
assert.equal(tokens.component.newsCard.imageWidthMin, '38%');
assert.equal(tokens.component.newsCard.imageWidthMax, '42%');
assert.equal(tokens.component.messageCard.iconSize, '28px');

assert.equal(tokens.motion.durationInstant, '100ms');
assert.equal(tokens.motion.durationFast, '160ms');
assert.equal(tokens.motion.durationNormal, '240ms');
assert.equal(tokens.motion.durationSlow, '320ms');
assert.equal(tokens.motion.durationComplex, '400ms');

assert.match(css, /--typography-body-medium-font-size: 1rem;/);
assert.match(css, /--typography-body-medium-line-height: 1\.5rem;/);
assert.match(css, /--typography-card-title-font-size: 1\.125rem;/);
assert.match(css, /--layout-gutter: 16px;/, 'layout dimensions must remain CSS logical pixels');
assert.equal(tokens.component.guestCard.compactColumns, '4');
assert.equal(tokens.component.identityTile.compactColumns, '4');

execFileSync(process.execPath, [path.join(tokenDir, 'build-tokens.mjs'), '--check'], {
  cwd: root,
  stdio: 'inherit'
});

console.log('Design token contract passed.');
