# 页面管理看板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在一个可访问的大会页面看板中，通过左侧目录切换右侧 750px 真实页面预览。

**Architecture:** 新增独立的静态页面 `page-board.html`，将页面元数据写入 `page-board.js` 的封闭注册表。JavaScript 只从注册表解析 URL 哈希并更新 iframe，避免将哈希直接用作 URL；HTML 中保留普通链接，以便在 JavaScript 失效时仍可访问每一页。

**Tech Stack:** 静态 HTML、CSS、原生 ES Modules、Node.js 内置测试、既有设计令牌、Chrome/Playwright 验证。

**Spec:** `docs/superpowers/specs/2026-08-21-page-board-design.md`

## Global Constraints

- 仅使用 `index.html`、`schedule.html`、`entry-service.html` 与 `profile.html` 四个预定义相对路径；禁止把 URL 哈希直接注入 `iframe.src`。
- 看板右侧预览必须承载真实 `iframe`，宽版画布为 `750px`；不复制或缩放被预览页面。
- 保持 light-only 大会视觉、原生 button/a 语义、键盘焦点、安全降级和 `prefers-reduced-motion`。
- 既有页面业务代码不变；构建必须携带新看板文件。
- 当前本地 Git 仓库没有初始提交，实施期间不创建只包含局部文件的不完整初始提交。

---

### Task 1: 页面注册表与静态回归测试

**Files:**
- Create: `tests/page-board.test.mjs`

**Interfaces:**
- Consumes: `page-board.html`、`page-board.css`、`page-board.js` 的文件内容。
- Produces: 对生产文件、预定义页面注册表、750px iframe 合同、无危险 DOM 注入的静态回归保障。

- [ ] **Step 1: 写入失败测试**

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => existsSync(file(path)) ? readFileSync(file(path), 'utf8') : '';

test('page board exposes the four registered production pages', () => {
  const html = read('page-board.html');
  const js = read('page-board.js');
  assert.match(html, /<aside class="page-board__sidebar"/);
  assert.match(html, /<iframe[^>]+id="page-preview"/);
  for (const path of ['index.html', 'schedule.html', 'entry-service.html', 'profile.html']) {
    assert.match(js, new RegExp(path.replace('.', '\\.')));
  }
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/page-board.test.mjs`  
Expected: FAIL，提示 `page-board.html` 尚不存在或不含目标结构。

- [ ] **Step 3: 扩展测试以覆盖安全和宽版合同**

```js
test('page board preserves safe routing and 750px preview rules', () => {
  const css = read('page-board.css');
  const js = read('page-board.js');
  assert.match(css, /--board-preview-width:750px/);
  assert.match(css, /@media \(max-width:900px\)/);
  assert.match(js, /const pages = Object\.freeze/);
  assert.match(js, /window\.location\.hash/);
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|eval\(/);
});
```

- [ ] **Step 4: 保持测试文件，等待实现任务使其通过**

Run: `node --test tests/page-board.test.mjs`  
Expected: FAIL，直至 Task 2 和 Task 3 完成。

### Task 2: 实现目录、真实预览与可恢复路由

**Files:**
- Create: `page-board.html`
- Create: `page-board.js`

**Interfaces:**
- Consumes: Task 1 的结构和安全测试；既有四个相对页面入口。
- Produces: `PAGE_IDS` 注册表、`selectPage(id)`、`syncFromHash()` 和由 `#page-preview` 承载的真实预览。

- [ ] **Step 1: 建立语义 HTML 骨架**

```html
<main class="page-board" data-ui-ready="false">
  <aside class="page-board__sidebar" aria-label="页面目录">
    <a class="page-board__brand" href="index.html">大会页面管理</a>
    <nav id="page-directory" aria-label="页面目录"></nav>
  </aside>
  <section class="page-board__workspace" aria-labelledby="preview-title">
    <header class="page-board__toolbar">
      <p>当前预览 <strong id="preview-title"></strong></p>
      <a id="open-page" target="_blank" rel="noopener">在新标签页打开</a>
    </header>
    <div class="page-board__stage" aria-busy="true">
      <p class="page-board__loading" id="preview-status" role="status">正在加载页面…</p>
      <iframe id="page-preview" title="页面预览" width="750"></iframe>
      <button id="retry-preview" type="button" hidden>重新加载</button>
    </div>
  </section>
</main>
```

- [ ] **Step 2: 实现预定义页面注册表与目录渲染**

```js
const pages = Object.freeze([
  { id: 'home', title: '大会首页', description: '大会信息与聚合入口', path: 'index.html' },
  { id: 'schedule', title: '大会日程', description: '活动安排与关注状态', path: 'schedule.html' },
  { id: 'entry-service', title: '入场服务', description: '入场状态与现场指引', path: 'entry-service.html' },
  { id: 'profile', title: '个人中心', description: '参会资料与个人服务', path: 'profile.html' },
]);

const byId = new Map(pages.map((page) => [page.id, page]));
const fallbackPage = pages[0];

function pageFromHash() {
  return byId.get(window.location.hash.slice(1)) ?? fallbackPage;
}
```

- [ ] **Step 3: 实现切换、加载与失败重试状态**

```js
function selectPage(page, { updateHash = true } = {}) {
  preview.src = page.path;
  preview.title = `${page.title}预览`;
  previewTitle.textContent = page.title;
  openPage.href = page.path;
  stage.setAttribute('aria-busy', 'true');
  status.hidden = false;
  retryButton.hidden = true;
  directoryButtons.forEach((button) => {
    const selected = button.dataset.pageId === page.id;
    button.classList.toggle('is-current', selected);
    button.setAttribute('aria-current', selected ? 'page' : 'false');
  });
  if (updateHash && window.location.hash !== `#${page.id}`) window.location.hash = page.id;
}

preview.addEventListener('load', () => {
  stage.setAttribute('aria-busy', 'false');
  status.hidden = true;
});
preview.addEventListener('error', () => {
  stage.setAttribute('aria-busy', 'false');
  status.textContent = '页面加载失败，请重试。';
  status.hidden = false;
  retryButton.hidden = false;
});
```

- [ ] **Step 4: 运行页面看板测试确认通过**

Run: `node --test tests/page-board.test.mjs`  
Expected: PASS。

### Task 3: 实现宽版看板样式并接入生产构建

**Files:**
- Create: `page-board.css`
- Modify: `scripts/build.mjs`
- Modify: `scripts/qa-static.mjs`

**Interfaces:**
- Consumes: Task 2 的 class、id 与状态属性。
- Produces: 左侧目录 + 右侧 750px 预览工作区；构建产物中的看板文件；静态生产检查。

- [ ] **Step 1: 先扩展静态检查，以便构建遗漏时失败**

```js
const boardHtml = readFileSync('page-board.html', 'utf8');
const boardCss = readFileSync('page-board.css', 'utf8');
const boardJs = readFileSync('page-board.js', 'utf8');
assert.match(boardHtml, /id="page-preview"/);
assert.match(boardCss, /--board-preview-width:750px/);
assert.match(boardJs, /const pages = Object\.freeze/);
assert.doesNotMatch(boardJs, /innerHTML|insertAdjacentHTML|eval\(/);
```

- [ ] **Step 2: 定义看板画布和窄屏回退**

```css
:root { --board-preview-width: 750px; }
.page-board { display:grid; grid-template-columns:264px minmax(0,1fr); min-height:100dvh; }
.page-board__stage { overflow:auto; padding:32px; }
.page-board__stage iframe { display:block; width:var(--board-preview-width); min-height:900px; margin-inline:auto; border:0; }
@media (max-width:900px) {
  .page-board { grid-template-columns:1fr; }
  .page-board__sidebar { position:sticky; top:0; overflow:auto; }
  .page-board__stage { padding:16px; }
}
```

- [ ] **Step 3: 将三份看板生产文件加入构建输入**

```js
  'page-board.html',
  'page-board.css',
  'page-board.js',
```

- [ ] **Step 4: 运行静态检查、测试和构建**

Run: `npm test && npm run lint && npm run build`  
Expected: PASS，且 `dist/page-board.html`、`dist/page-board.css`、`dist/page-board.js` 存在。

### Task 4: 真实浏览器集成验证

**Files:**
- Test artifact: `.harness/traces/page-board-1280.png`

**Interfaces:**
- Consumes: Task 2 的 `#page-directory`、`#page-preview`、`#preview-title` 与 `#open-page`。
- Produces: 真实 Chrome 访问、点击目录、哈希恢复、iframe 页面宽度和网络错误证据。

- [ ] **Step 1: 在 1280px Chrome 视口验证默认首页**

```js
await page.goto('http://127.0.0.1:4173/page-board.html', { waitUntil: 'networkidle' });
expect(await page.locator('#page-preview').getAttribute('src')).toBe('index.html');
expect(await page.locator('#page-preview').evaluate((node) => node.clientWidth)).toBe(750);
```

- [ ] **Step 2: 验证目录切换与哈希恢复**

```js
await page.getByRole('button', { name: /个人中心/ }).click();
expect(page.url()).toContain('#profile');
expect(await page.locator('#page-preview').getAttribute('src')).toBe('profile.html');
await page.reload({ waitUntil: 'networkidle' });
expect(await page.locator('#preview-title').textContent()).toBe('个人中心');
```

- [ ] **Step 3: 验证 iframe 页面及新标签页链接**

```js
const frame = page.frameLocator('#page-preview');
expect(await frame.locator('.profile-shell').evaluate((node) => node.getBoundingClientRect().width)).toBe(750);
expect(await page.locator('#open-page').getAttribute('href')).toBe('profile.html');
```

- [ ] **Step 4: 记录结果**

Run: Chrome/Playwright 检查并保存 `.harness/traces/page-board-1280.png`。  
Expected: HTTP 200、无控制台/页面/资源错误，目录切换后 iframe 与 URL 同步。
