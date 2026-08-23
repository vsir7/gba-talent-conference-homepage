import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const designPath = path.join(root, 'design.md');
const cssPath = path.join(root, 'design-system', 'tokens', 'design-tokens.css');
const markdown = fs.readFileSync(designPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

test('design specification has a complete production structure', () => {
  const requiredSections = [
    '## 0. 文档使用规则',
    '## 2. 七张设计图逐图识别',
    '## 4. Design Tokens',
    '## 5. 核心组件规范',
    '## 8. 冲突项的最终统一决定',
    '## 10. AI 前端开发约束',
    '## 11. 交付验收清单'
  ];
  for (const heading of requiredSections) assert.match(markdown, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const fenceCount = (markdown.match(/^```/gm) || []).length;
  assert.equal(fenceCount % 2, 0, 'Markdown code fences must be balanced');
  assert.ok((markdown.match(/^\|---/gm) || []).length >= 10, 'Expected production token and component tables');
});

test('specification exposes the H5 production baseline and foundation inheritance', () => {
  const requiredContracts = [
    '版本：`V2.0`',
    'mobile-foundation-design-spec.md',
    '### 3.1 H5 设计与生产基准',
    'viewport-fit=cover',
    '-webkit-text-size-adjust: 100%',
    '48 × 48px',
    '200% 文本缩放',
    '320px'
  ];
  for (const contract of requiredContracts) {
    assert.ok(markdown.includes(contract), `Missing H5 contract: ${contract}`);
  }

  assert.equal(markdown.includes('user-scalable=no` 关闭缩放'), false, 'H5 must not disable page zoom');
  assert.equal(markdown.includes('design-system/mobile-foundation.css'), false, 'Generic ordinal spacing tokens must not be imported');
});

test('common H5 components have explicit production contracts', () => {
  const requiredComponents = [
    '### 5.30 Dialog（对话框）',
    '### 5.31 BottomSheet / ActionSheet（底部面板）',
    '### 5.32 Toast / Snackbar（轻提示）',
    '### 5.33 Radio / Switch（单选与开关）',
    '### 5.34 Avatar（头像）',
    '### 5.35 TabBar（可选底部导航）'
  ];
  for (const heading of requiredComponents) assert.ok(markdown.includes(heading), `Missing component section ${heading}`);
});

test('all seven screenshot patterns map to named components', () => {
  const requiredPatterns = [
    'MediaHero',
    'NewsCard',
    'MapOverview',
    'MapLegend',
    'ProfileHeader',
    'AvatarBadge',
    'ApprovalSummaryCard',
    'FeatureEntryCard',
    'NoticeBar',
    'IdentityTile.compact',
    'Checkbox',
    'AgreementRow',
    'MessageCard',
    'FeedbackState'
  ];
  for (const name of requiredPatterns) assert.ok(markdown.includes(name), `Missing component contract ${name}`);
});

test('title colors use the dedicated purple semantic layer', () => {
  const requiredTitleContracts = [
    'color.title.primary',
    'color.title.brand',
    'color.title.emphasis',
    'color.title.inverse',
    '--color-title-primary',
    '--color-title-brand',
    '--color-title-emphasis'
  ];
  for (const contract of requiredTitleContracts) {
    assert.ok(markdown.includes(contract), `Missing title color contract: ${contract}`);
  }
});

test('superseded ambiguous rules do not remain', () => {
  const banned = [
    '高度：`56px`，不含系统安全区',
    '人物图建议 `4:5`',
    '推荐两列或三列自适应网格',
    '大会/活动 Hero | `16:9` 或 `2:1`',
    '普通信息卡使用 `border.default` 或 `shadow-card`'
  ];
  for (const phrase of banned) assert.equal(markdown.includes(phrase), false, `Superseded rule remains: ${phrase}`);
});

test('CSS variables referenced by the specification exist in generated tokens', () => {
  const references = [...markdown.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((match) => match[1]);
  const unique = [...new Set(references)];
  assert.ok(unique.length > 0, 'Expected CSS variable examples');
  for (const name of unique) assert.ok(css.includes(`${name}:`), `Missing generated CSS variable ${name}`);

  const declarations = [...markdown.matchAll(/^(--[a-z0-9-]+):/gm)].map((match) => match[1]);
  for (const name of new Set(declarations)) assert.ok(css.includes(`${name}:`), `Documented token is not generated: ${name}`);
});

test('specification has no unfinished placeholder markers', () => {
  assert.equal(/\b(?:TBD|TO-DO|FIXME|PLACEHOLDER)\b/i.test(markdown), false);
});
