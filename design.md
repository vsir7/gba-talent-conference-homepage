# 第四届粤港澳大湾区人才高质量发展大会｜移动端设计规范

> 版本：`V2.0`（紫色标题版 / H5 生产基线）  
> 更新日期：2026-08-18  
> 适用范围：大会 H5 / 移动 Web 为主，微信小程序为兼容目标；不适用于 PC 官网  
> 证据范围：用户提供的 7 张移动端 UI 设计图、[移动端基础通用设计规范](/Users/tongyuhu/Documents/ChatGPT/dahui/mobile-foundation-design-spec.md)  
> 规范状态：可用于生产设计、组件实现和 AI 前端开发；若获得原始 Figma 标注，应按本文“证据优先级”增量校准  
> 说明：以下尺寸与色值由截图反推，属于统一后的工程基准，不等同于原始 Figma 标注。业务文案、日期、人物、场馆和状态只作为界面内容样例，不作为产品规则。
> 版本说明：V2.0 在 V1.0 生产基线上新增独立紫色标题语义层；V1.0 冻结归档见 [design-v1.0.md](/Users/tongyuhu/Documents/ChatGPT/dahui/design-v1.0.md)。

---

## 0. 文档使用规则

### 0.1 规范性用语

- **必须（MUST）**：生产实现不可偏离；偏离需要设计负责人书面确认。
- **应该（SHOULD）**：默认执行；只有明确的业务或平台限制才可偏离，并记录原因。
- **可以（MAY）**：可选能力，不影响系统一致性。
- 未标注的尺寸、颜色或变体不得由页面临时创造；先在 Token 或组件变体层补充。

### 0.2 证据优先级

发生冲突时按以下顺序处理：

1. 法律、无障碍、浏览器与操作系统硬约束。
2. 本文明确标记为 `PRODUCTION` 的项目生产规则与机器 Token。
3. [移动端基础通用设计规范](/Users/tongyuhu/Documents/ChatGPT/dahui/mobile-foundation-design-spec.md) 中适用于 H5 的基础规则。
4. 用户最新确认且已通过生产可用性审查的原始设计文件或 Figma 标注。
5. 七张截图中重复出现的视觉规律。
6. 单张截图中的一次性表现。

截图和 Figma 用于视觉校准，但不得覆盖可访问性、H5 浏览器兼容、触控可用性和本文已统一的生产值。

### 0.3 数值来源标签

| 标签 | 含义 | 使用方式 |
|---|---|---|
| `OBSERVED` | 直接从截图识别出的颜色、结构或物理尺寸 | 用于追溯，不直接当 CSS 逻辑像素 |
| `INFERRED` | 根据截图比例推测的逻辑尺寸 | 必须注明置信度，获得原始标注后复核 |
| `NORMALIZED` | 为解决多图冲突而选定的统一值 | 设计与开发的默认值 |
| `PRODUCTION` | 为可访问性、响应式或平台兼容主动调整的值 | 优先于截图中的不可用表现 |

### 0.4 截图证据清单

| 图 | 物理尺寸 | 页面 | 关键证据 | 置信度 |
|---|---:|---|---|---|
| 1 | `852 × 1845px` | 议程详情 | `2:1` 媒体 Hero、四列紧凑嘉宾、章节卡、全宽 CTA | 高 |
| 2 | `852 × 1845px` | 资讯列表 | 下划线 Tab、横向 `3:2` 图文列表、类型标签 | 高 |
| 3 | `852 × 1845px` | 场地导览 | 浮层返回、搜索、地图图例、四类场馆主题色、双操作 | 高 |
| 4 | `852 × 1845px` | 报名详情 | 资料头图、认证徽章、审核摘要、三列指标、紧凑信息行 | 高 |
| 5 | `852 × 1845px` | 大会首页 | 自由高度品牌 Hero、双入口、通知条、议程、三列嘉宾、资讯聚合 | 高 |
| 6 | `852 × 1845px` | 大会报名 | 超宽摘要 Banner、四列身份、横向表单、多选、上传、协议 | 高 |
| 7 | `941 × 1672px` | 消息中心 | 分段控制器、消息优先级、已读/未读和列表终止状态 | 高 |

前六张图可能来自约 `426px` 宽逻辑画布的二倍导出，但没有原始标注，故仅记为 `INFERRED / 中置信度`。本文选择 `390px` 作为常用生产验收宽度，同时必须在 `430px` 宽度复核宽屏布局，避免把推测画布当成唯一事实。

### 0.5 产品与主题范围

- 本版本是大会参会者 H5 的项目级规范，服务报名、日程、资讯、消息和场地导航；不自动扩展为通用后台、PC 官网或其他品牌系统。
- V2.0 明确采用 `light-only` 浅色主题；不得只为跟随系统偏好而临时反转颜色或局部实现深色模式。
- H5 可声明 `color-scheme: light`，使浏览器原生表单和系统控件与当前主题一致。
- 若未来支持深色主题，必须建立完整的语义颜色模式、图片/阴影适配、对比度测试和逐组件验收，不允许页面级零散覆盖。
- 默认语言为 `zh-CN`，默认时区为 `Asia/Shanghai`；其他语言属于架构预留，不代表本版本已经提供翻译内容。

---

## 1. 设计定位

### 1.1 风格关键词

- 湾区科技感：深紫黑负责可信与秩序，蓝紫渐变负责创新与大会识别。
- 明亮轻盈：大面积近白底、柔和紫雾、低对比描边和轻阴影。
- 会务服务导向：页面首先解决报名、日程、导航、资讯、通知等现场任务。
- 卡片化组织：复杂信息进入白色卡片，层级依靠间距、字号和标题，不依赖重边框。
- 图像驱动：大会主视觉、场馆插画、人物肖像承担情绪和品牌表达；功能区域保持克制。

### 1.2 核心原则

1. **紫色用于标题、品牌身份和关键行为。** 标题按层级使用深紫黑、品牌紫和强调紫；大段正文、输入值和辅助信息继续使用中性深色与灰蓝。
2. **一张卡片只承载一个主要任务。** 主操作最多一个；次操作使用描边或文字按钮。
3. **信息密度随任务变化。** 报名表单强调可填写性，资讯列表强调浏览效率，议程详情强调阅读节奏。
4. **装饰图不能损害可读性。** 图文叠加必须增加白色雾化遮罩，并保留文字安全区。
5. **以真实 DOM 实现。** 文字、按钮、标签、表单和列表不可合并为整张截图或背景图。
6. **状态必须同时使用文字。** 不可只靠颜色表达已读、通过、提醒、必填或选中。

### 1.3 页面节奏与防同质化

- 一屏只允许一个视觉主角：品牌 Hero、重点状态卡或主要任务区三者选一。
- 不得把每个标题、列表项和说明都放进独立阴影卡；简单列表使用留白和分割线。
- 同一屏最多两个大面积品牌渐变区域；普通内容区不使用渐变文字。
- 页面必须有“疏—密—疏”节奏：Hero/状态摘要留白较大，任务列表更紧凑，模块之间重新拉开 24px。
- 3D 视觉集中在品牌 Hero、场馆和主入口；功能表单、消息和资讯列表保持线性图标与真实内容优先。
- 新页面不得仅复制“白卡 + 紫色图标 + 渐变按钮”结构；必须先确定页面主任务，再选择必要容器。

---

## 2. 七张设计图逐图识别

| 图 | 页面 | 识别到的核心模式 | 纳入规范的内容 | 需统一或修正 |
|---|---|---|---|---|
| 1 | 议程详情 | 居中导航栏、图文 Hero、章节卡、嘉宾横排、场地信息、底部主按钮 | 详情页信息层级、章节标题、人物卡、图文叠加、全宽 CTA | 使用 `GuestCard.compact` 四列；`compact` 断点按内容数量降级 |
| 2 | 资讯列表 | 下划线 Tab、横向图文卡、分类标签、视频播放蒙层 | 资讯卡、3:2 缩略图、标题/摘要/日期结构、媒体类型标识 | 列表卡圆角和间距与其他页面不同，统一为紧凑卡变体 |
| 3 | 场地导览 | 搜索框、总览地图、多主题场馆卡、双按钮、功能色分区 | 搜索、地图图例、场馆卡、描边/实心双操作 | 返回按钮有白色方形底，统一为“默认裸图标，复杂背景时使用浮层变体” |
| 4 | 我的报名详情 | 用户身份头图、审核状态卡、键值信息表、危险操作 | 用户身份、成功状态、信息行、底部操作层级 | 原图黑色标题统一迁移为深紫黑；状态标题保留状态色 |
| 5 | 大会首页 | 无常规导航的品牌 Hero、入口卡、通知条、当前/即将开始议程、嘉宾、资讯 | 首页模板、营销入口、议程状态、内容聚合 | 卡片和文字密度偏高；统一最小字号与分区间距，避免继续压缩 |
| 6 | 大会报名 | 身份选择、表单、复选标签、上传、协议、提交按钮 | 表单控件、选择瓦片、多选标签、上传区、校验规则 | 选项尺寸和表单行高不完全一致，统一到控件高度体系 |
| 7 | 消息中心 | 分段 Tab、消息卡、重要/提醒标签、已读/未读 | 消息卡、状态标签、分段控制器、列表终止状态 | 画布比例与前六张不同；只提取组件规律，不照搬像素坐标 |

### 2.1 共同视觉母题

- 页面背景：白色至极浅紫的径向雾化渐变。
- 主品牌色：深蓝 + 高饱和蓝紫。
- 主按钮：蓝紫横向渐变、白色文字、轻紫色投影。
- 主容器：白色或 92%–96% 透明白，圆角 16–20px，极浅蓝紫阴影。
- 文字：V2.0 将原图中接近黑色或深海军蓝的标题统一为紫色语义层；正文为灰蓝，辅助信息为浅灰蓝。
- 图标：圆角线性或轻拟物 3D 图标，功能层必须保持同一套线性图标风格。
- 辅助色：青色用于洽谈，粉色用于嘉年华，绿色用于成功，橙色用于提醒，红色用于危险。

---

## 3. 基础画布与响应式规则

### 3.1 H5 设计与生产基准

- `OBSERVED`：前六张截图宽 `852px`，第七张宽 `941px`。
- `INFERRED`：前六张可能对应约 `426px` 逻辑画布，但没有 Figma 标注，不作为硬编码基准。
- `NORMALIZED`：设计交付常用参考宽度为 `390px`，宽屏参考为 `430px`。
- `PRODUCTION`：必须支持 `320px–480px`；H5 最大内容宽度 `480px`，更宽设备居中显示。
- 默认左右页边距 `16px`；`414px–480px` 使用 `20px`。
- 卡片间距 `12px`；模块间距固定为 `24px`，同一模块内部可使用 `16px`。
- 页面根容器和承载可变文字的内容区不得使用固定高度，内容必须自然撑开；图片比例框、图标容器等纯视觉元素可按组件规范固定尺寸。

H5 文档头必须包含移动视口和安全区声明；不得通过 `user-scalable=no` 或 `maximum-scale=1` 禁止用户缩放：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100dvh;
  margin: 0;
  font-family: var(--typography-font-family);
  font-size: var(--typography-body-medium-font-size);
  line-height: var(--typography-body-medium-line-height);
}

button, input, textarea, select {
  font: inherit;
}

img, svg, video {
  max-width: 100%;
}
```

- 设计标注与布局 Token 使用 CSS 逻辑 `px`；字号和行高由生成器输出为 `rem`，随浏览器根字号缩放。
- 不用 `100vh` 独占移动浏览器可视区；首选 `100dvh`，必要时以 `100svh` 作为保守回退。
- 不固定页面根高度，不锁定页面缩放，不用横向滚动容纳基础内容。

断点定义：

| 名称 | 范围 | 行为 |
|---|---:|---|
| `compact` | `320–359px` | 表单标签转为上下布局；场馆卡转为上图下文；四列选项允许两列 |
| `regular` | `360–413px` | 默认 `390px` 设计行为；16px 页边距 |
| `wide` | `414–480px` | 20px 页边距；允许四列紧凑嘉宾和四列身份网格 |

```css
.app-shell {
  width: 100%;
  max-width: var(--layout-viewport-max);
  min-height: 100dvh;
  margin-inline: auto;
  background: var(--gradient-page);
}

.page-container {
  padding-inline: var(--space-16);
}

@media (min-width: 414px) {
  .page-container { padding-inline: var(--layout-gutter-wide); }
}
```

### 3.2 安全区

- Web/H5 不自行绘制系统状态栏；原生壳或自定义小程序导航栏才绘制对应区域。
- 顶部：`padding-top: env(safe-area-inset-top)`。
- 固定底栏：`padding-bottom: max(12px, env(safe-area-inset-bottom))`。
- 固定按钮不得覆盖最后一块内容，正文底部预留“底栏高度 + 24px”。

### 3.3 小程序换算

- Token 以 CSS 逻辑像素为源数据。
- 以 `375px` 逻辑宽度映射 `750rpx` 时，可用 `1px ≈ 2rpx`。
- 不要把截图物理像素直接写入代码；截图宽度并不等于 CSS 视口宽度。

### 3.4 平台导航边界

- H5/移动 Web 自定义 AppBar 使用 `48px` 内容高度。
- 使用原生 iOS/Android 导航栏时，遵循系统高度；iOS 常见内容高度为 `44px`。
- 微信小程序自定义导航必须读取胶囊按钮和状态栏实际尺寸，不得硬编码截图状态栏。
- 系统状态栏、微信胶囊和浏览器 UI 不属于页面设计 Token。

### 3.5 H5 浏览器与输入行为

- 按钮和可点击容器使用原生 `button/a/input` 语义；只有无法使用原生元素时才补充 `role`、键盘事件与焦点管理。
- 文本框按数据选择 `type="tel|email|number|search"`、`inputmode` 与 `autocomplete`，确保移动键盘和自动填充正确。
- 输入框字号不得小于 `16px`；聚焦、校验或键盘弹出时不能改变页面整体缩放。
- 只在 `@media (hover: hover) and (pointer: fine)` 内提供 hover 样式；触屏交互必须有按压反馈。
- 不全局禁用 `-webkit-tap-highlight-color`；如品牌样式覆盖默认反馈，必须提供清晰的 pressed/focus-visible 状态。
- 横向手势区使用 `touch-action: pan-y` 或更精确的行为声明，避免阻断页面纵向滚动；不要无条件 `preventDefault()`。
- 弹层打开时锁定背景滚动，关闭后恢复原滚动位置；不得通过固定 `body` 导致页面跳回顶部。
- 路由切换后管理标题、滚动位置与焦点：普通新页滚到顶部，返回恢复原位置，主标题接收程序化焦点但不产生可见突跳。

### 3.6 浏览器兼容矩阵与降级策略

生产支持矩阵以本规范依赖的动态视口能力为最低基线：动态视口单位在 Safari `15.4` 与 Chromium `108` 起具备稳定支持。矩阵每季度或重大活动发布前复核一次，不以开发者个人设备代替支持声明。

| 运行环境 | 最低基线 | 发布验证要求 |
|---|---:|---|
| iPhone / iPad Safari、iOS WKWebView | iOS / Safari `15.4+` | 最低版本真机 + 当前主流版本真机 |
| Android Chrome / Android System WebView | Chromium `108+` | 最低内核模拟或云真机 + 当前主流真机 |
| 微信内 H5（iOS / Android） | 目标系统上的微信最新稳定版 | iOS、Android 各至少一台真机；记录微信版本与内核信息 |
| 桌面浏览器移动预览 | 当前与前一主版本 | 只作开发辅助，不替代移动真机验收 |
| 微信小程序 | 由小程序项目单独声明基础库版本 | 不套用 H5 浏览器矩阵；共用 Token，分别验证运行时 |

动态视口必须按“旧能力先声明、新能力后覆盖”的顺序渐进增强：

```css
.viewport-fill {
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
}

.safe-bottom {
  padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
}
```

- 不支持动态视口单位时退回 `100vh`；核心报名、日程、导航和提交功能仍必须可用。
- 图片必须设置 `width/height` 属性或等价固有比例以预留空间；`aspect-ratio` 用于增强布局，不得成为防止布局跳动的唯一手段。
- `:has()`、View Transitions、Popover 等较新能力只能渐进增强；核心流程不得依赖其存在。
- 每次兼容矩阵调整必须依据近 90 天真实访问数据、官方兼容资料和真机验证，并记录变更原因。

参考依据：[动态视口单位](https://web.dev/blog/viewport-units)、[安全区 `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)、[`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio)。

---

## 4. Design Tokens

### 4.0 单一事实源

机器可读 Token 以 [design-tokens.json](/Users/tongyuhu/Documents/ChatGPT/dahui/design-system/tokens/design-tokens.json) 为唯一事实源：

- [design-tokens.css](/Users/tongyuhu/Documents/ChatGPT/dahui/design-system/tokens/design-tokens.css) 由 JSON 自动生成，供 H5/移动 Web 使用。
- [design-tokens.ts](/Users/tongyuhu/Documents/ChatGPT/dahui/design-system/tokens/design-tokens.ts) 由 JSON 自动生成，供 TypeScript/组件库使用。
- [build-tokens.mjs](/Users/tongyuhu/Documents/ChatGPT/dahui/design-system/tokens/build-tokens.mjs) 负责生成和漂移检查。
- 页面代码不得复制颜色或尺寸常量；必须引用语义 Token 或组件 Token。
- JSON 修改后必须重新生成 CSS/TypeScript，并运行 Token 验证。
- 基础层继承 [mobile-foundation-design-spec.md](/Users/tongyuhu/Documents/ChatGPT/dahui/mobile-foundation-design-spec.md)，项目层在本文统一大会品牌、业务组件和截图特征，组件层只允许定义局部例外。
- 三层优先级为：`Foundation → Project → Component`。组件例外不得反向修改基础 Token，也不得在页面局部重新声明全局变量。
- 不直接引入通用规范示例中的 CSS；本项目 `--space-4` 等变量按实际像素命名，避免与序号型间距命名发生冲突。
- 浏览器、主题、语言、时区和性能预算存放在 JSON `meta` 中，供 TypeScript、CI 和发布流程读取；`meta` 不生成 CSS 变量。

文档为了可读性可使用短名，开发必须映射到唯一机器路径：

| 文档短名 | JSON 路径 | CSS 变量示例 |
|---|---|---|
| `brand.600` | `color.brand.600` | `--color-brand-600` |
| `color.title.primary` | `color.title.primary` | `--color-title-primary` |
| `color.title.brand` | `color.title.brand` | `--color-title-brand` |
| `color.title.emphasis` | `color.title.emphasis` | `--color-title-emphasis` |
| `text.primary` | `color.text.primary` | `--color-text-primary` |
| `bg.page` | `color.surface.page` | `--color-surface-page` |
| `border.focus` | `color.border.focus` | `--color-border-focus` |
| `title.page` | `typography.pageTitle` | `--typography-page-title-font-size` |
| `title.card` | `typography.cardTitle` | `--typography-card-title-font-size` |
| `body.md` | `typography.bodyMedium` | `--typography-body-medium-font-size` |
| `label.md` | `typography.labelMedium` | `--typography-label-medium-font-size` |
| `space.16` | `space.16` | `--space-16` |
| `radius.md` | `radius.md` | `--radius-md` |

未列出的值不得自行推断 CSS 变量名，必须查询 JSON 或生成 CSS。

版本规则：

- `PATCH`：只修正文案、注释或不改变输出值的说明。
- `MINOR`：新增向后兼容 Token、组件或变体。
- `MAJOR`：删除/重命名 Token、改变既有组件默认行为或需要页面迁移。
- `V1.0` 是紫色标题调整前的冻结基线，文档与机器 Token 分别位于 `design-v1.0.md` 和 `design-system/tokens/v1.0/`。
- `V2.0` 新增 `color.title.*` 专用标题语义层，改变标题默认颜色，因此按需要组件迁移的主版本管理。
- V2.0 不改变正文、表单值、辅助信息和状态色的原有语义。
- 每次发布必须同时更新 JSON `meta.version`、本文版本、生成物和契约测试；不得只修改 Markdown。

#### 4.0.1 V1.0 → V2.0 标题色迁移表

| V1.0 用法 | V2.0 处理 | 迁移动作 |
|---|---|---|
| AppBar / 通用页面标题使用 `text.primary` | `color.title.primary` | 替换为深紫黑，保留稳定、高对比的导航层级 |
| 卡片、列表、表单分组标题使用 `text.primary` | `color.title.primary` | 只迁移标题节点，不迁移正文和表单值 |
| 大会名、活动 Hero 使用 `text.brand` / `brand.700` | `color.title.brand` | 统一为品牌紫，避免页面继续混用深蓝 |
| 详情章节、首页分区和重点卡片标题颜色未固定 | `color.title.emphasis` | 统一为鲜明紫，一屏最多 3 个强调标题 |
| 深色、渐变或图像底上的标题 | `color.title.inverse` | 使用白色，必须叠加可读性遮罩并通过对比度验证 |
| 审核、提醒、错误结果标题 | 保留 `color.state.*Text` | 状态色优先于紫色标题，必须同时提供文字和图标 |
| 正文、输入值、日期和辅助信息 | 保留 `color.text.*` | 不得为了紫色化而改动非标题文字 |

### 4.1 颜色原子

截图聚类中反复出现的高饱和色集中在 `#3626DC`、`#745DF0` 一带，深色集中在 `#070E57`、`#0B1B4A` 一带。工程中统一为以下色阶。

| Token | 值 | 用途 |
|---|---:|---|
| `brand.900` | `#070E57` | 深色品牌图标、特殊资产 |
| `brand.800` | `#0B1B79` | 品牌资产和交互强调；不再作通用标题色 |
| `brand.700` | `#111FC2` | 选中态、链接强调；不再作通用标题色 |
| `brand.600` | `#3626DC` | 主色、选中态、主图标 |
| `brand.500` | `#5740F2` | 主按钮渐变起点 |
| `brand.400` | `#745DF0` | 主按钮渐变中段、次级强调 |
| `brand.300` | `#9A86F7` | 图标背景、装饰 |
| `brand.100` | `#ECE9FF` | 选中底色、淡标签 |
| `brand.50` | `#F7F5FF` | 极浅品牌背景 |
| `accent.blue` | `#6F8EFF` | 创新讲堂、信息提示 |
| `accent.cyan` | `#56C4D0` | 对接洽谈区 |
| `accent.pink` | `#D95CC2` | 嘉年华区 |
| `success.500` | `#20B866` | 成功图标、实心状态装饰 |
| `success.600` | `#128653` | 审核通过、成功状态文字 |
| `success.50` | `#EAF9F1` | 成功标签背景 |
| `warning.500` | `#F47B20` | 提醒图标、实心状态装饰 |
| `warning.600` | `#B84D00` | 提醒状态文字 |
| `warning.50` | `#FFF2E7` | 提醒标签背景 |
| `danger.500` | `#FF4D5A` | 错误图标、必填星号 |
| `danger.600` | `#C72C3A` | 取消报名、错误状态文字 |
| `danger.50` | `#FFF0F2` | 重要/错误标签背景 |

### 4.2 语义颜色

| Token | 值 | 说明 |
|---|---:|---|
| `color.title.primary` | `#241252` | 深紫黑；AppBar、通用页面、卡片和列表标题 |
| `color.title.brand` | `#35208F` | 品牌紫；大会名、活动 Hero、用户姓名和活动名 |
| `color.title.emphasis` | `#4B2ED6` | 强调紫；章节标题、首页分区和重点功能卡标题 |
| `color.title.inverse` | `#FFFFFF` | 深色、渐变或已验证图像遮罩上的标题 |
| `text.primary` | `#101426` | 关键值、表单值和需要高显著的非标题文字 |
| `text.brand` | `#0B1B79` | 可交互强调与品牌辅助文字；不作默认标题色 |
| `text.secondary` | `#5C6380` | 正文与说明 |
| `text.tertiary` | `#6E758F` | 日期、占位符、弱提示；生产修正后满足正文对比度 |
| `text.inverse` | `#FFFFFF` | 渐变或深色底上的文字 |
| `text.link` | `#3626DC` | 链接 |
| `bg.page` | `#F7F7FD` | 页面基底 |
| `bg.surface` | `#FFFFFF` | 卡片、输入框 |
| `bg.surface-glass` | `rgba(255,255,255,.94)` | 覆盖在装饰背景上的卡片 |
| `bg.subtle` | `#F4F3FC` | 标签、次级按钮、图标底 |
| `border.default` | `#E3E5F3` | 卡片/控件边框 |
| `border.subtle` | `#ECECF5` | 列表分割线 |
| `border.focus` | `#5740F2` | 焦点与选中边框 |
| `overlay.image` | `rgba(255,255,255,.72)` | Hero 图文可读性遮罩 |

#### 4.2.1 紫色标题语义规则

- 颜色优先级固定为：业务状态色 → 反白标题 → 品牌/强调标题 → 默认深紫黑标题。不得由页面自由选色。
- 白底上 `color.title.primary / brand / emphasis` 的 WCAG 对比度分别约为 `16.36:1 / 11.97:1 / 7.89:1`，均高于普通文本 `4.5:1` 底线。
- `color.title.emphasis` 是视觉高光，一个手机首屏最多用于 3 个标题；其余标题回落至 `color.title.primary` 或 `color.title.brand`。
- 同一组件的标题不得同时使用渐变文字、发光、投影和高饱和底色；V2.0 标题为单一实色。
- 标题与正文必须分开绑定：标题用 `color.title.*`，正文、输入值、日期和说明继续用 `color.text.*`。
- 审核通过、提醒、错误等结果标题必须使用对应 `color.state.*Text`；状态语义不为紫色统一让路。

### 4.3 品牌渐变

```css
--gradient-brand: linear-gradient(100deg, #3E2BFF 0%, #6548F4 52%, #8057E8 100%);
--gradient-brand-soft: linear-gradient(135deg, rgba(87,64,242,.16), rgba(154,134,247,.06));
--gradient-page:
  radial-gradient(circle at 82% 8%, rgba(137,112,255,.12), transparent 28%),
  radial-gradient(circle at 8% 32%, rgba(111,142,255,.08), transparent 24%),
  #F7F7FD;
--gradient-image-mask: linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.82) 48%, rgba(255,255,255,.08) 100%);
```

使用限制：

- 主渐变只用于主 CTA、选中分段、少量品牌徽标和活动状态条。
- 同一屏最多出现 2 个大面积主渐变区域。
- 正文背景不使用高饱和渐变。
- 白字放在渐变上时，必须保证最弱位置仍有足够对比度；必要时加深渐变而不是加文字阴影。

### 4.4 字体与字阶

```css
--typography-font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
  "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
```

| Token | 字号 / 行高 | 字重 | 用途 |
|---|---:|---:|---|
| `display.large` | `32 / 40px` | `700` | 短营销标题、关键成功结果；最多两行 |
| `display` | `28 / 38px` | `700` | 首页大会名称、活动 Hero 主标题 |
| `title.immersive` | `24 / 32px` | `600` | 无常规 AppBar 的沉浸式页面标题 |
| `title.page` | `20 / 28px` | `600` | 二级页面导航标题；由截图观测值统一 |
| `title.section` | `20 / 28px` | `600` | 主要分区标题、状态大标题 |
| `title.card` | `18 / 26px` | `600` | 默认卡片标题、消息标题 |
| `title.cardCompact` | `17 / 24px` | `600` | 紧凑列表卡标题 |
| `body.lg` | `17 / 26px` | `400` | 强调正文、关键信息 |
| `body.md` | `16 / 24px` | `400` | H5 默认正文、输入文字、表单值 |
| `body.sm` | `14 / 22px` | `400` | 描述、辅助信息 |
| `label.md` | `14 / 20px` | `500` | 控件标签、选项、短元信息 |
| `label.sm` | `13 / 18px` | `500` | 紧凑标签、状态文字 |
| `caption` | `12 / 18px` | `400` | 日期、注释、免责声明 |
| `micro` | `11 / 16px` | `500` | 极少量角标；不得承载正文或关键状态 |
| `button` | `16 / 24px` | `600` | 主要按钮 |
| `metric` | `24 / 32px` | `600` | 倒计时、关键数字 |
| `metric.large` | `28 / 36px` | `600` | 单一主指标、结果数字 |

排版规则：

- 中文标题不额外增加字距；英文和数字默认使用系统字体数字形态。
- 主标题最多 2 行；卡片标题最多 2 行；列表摘要最多 2 行。
- H5 默认正文和输入文字必须为 `16px`，避免移动 Safari 聚焦输入时自动放大；正文最小字号 `14px`。
- `12–13px` 只用于辅助标签、日期和法律说明；`11px` 仅限非关键角标，且必须通过 200% 文本缩放验收。
- 避免使用 `800/900` 字重；大会 Hero 可使用 `700`，其余标题以 `600` 为主。
- 长段正文左对齐，不使用两端对齐。
- 中文正文不使用 `font-weight: 500` 伪装层级；正文依靠字号、色彩和间距区分。
- CSS 生成物将字号与行高转换为 `rem`，设计与 Token 源仍以 `px` 记录，便于设计交付和跨端换算。

### 4.5 间距

使用 4px 基础网格。

```css
--space-4: 4px;
--space-8: 8px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
--space-32: 32px;
--space-40: 40px;
--space-48: 48px;
--space-64: 64px;
```

全局间距只保留 4px/8px 网格上的稳定档位。`2px / 6px / 10px` 不能作为全局 Space Token；图标光学校正、标签细节等例外必须放入具体组件 Token，并注明用途。

使用语义：

- 图标与文字：默认 `8px`；紧凑组件可使用组件级 `6px` 光学间距。
- 标签内部：默认横向 `8px`、纵向 `4px`；宽标签横向 `12px`。
- 卡片内部：默认 `16px`，紧凑列表 `12px`，重点状态卡 `20–24px`。
- 卡片间：`12px`。
- 模块间：`16–24px`。
- 页面标题至首内容：`16–20px`。

### 4.6 圆角

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-pill: 999px;
```

| 组件 | 统一圆角 |
|---|---:|
| 标签、状态胶囊 | `999px` |
| 输入框、小按钮、缩略图 | `8px` |
| 选择瓦片、次级操作 | `12px` |
| 默认卡片、列表卡 | `16px` |
| Hero、重点状态卡、入口大卡 | `20px` |
| 仅大型营销容器 | 组件 Token `component.hero.marketingRadius = 24px` |

禁止在同一组等价卡片中混用不同圆角。

### 4.7 描边与阴影

```css
--border-width: 1px;
--shadow-card: 0 6px 20px rgba(34, 42, 121, .07);
--shadow-card-raised: 0 10px 28px rgba(54, 38, 220, .12);
--shadow-button: 0 8px 18px rgba(87, 64, 242, .22);
--shadow-float: 0 4px 16px rgba(24, 28, 84, .10);
```

- `Card.elevated`（默认信息卡）必须无可见描边，仅使用 `shadow-card`。
- `Card.outlined` 只用于输入、选择、分段控制器和需要明确边界的静态容器，使用 `border.default`，不使用卡片阴影。
- `Card.glass` 只用于复杂品牌背景上的 Hero/状态区，使用半透明白底和 `shadow-float`。
- 浮层、固定操作条、复杂背景上的返回按钮才使用 `shadow-float`。
- 不使用黑色重阴影、发光描边或多层霓虹效果承载普通功能。

### 4.8 图标

| Token | 尺寸 | 用途 |
|---|---:|---|
| `icon.xs` | `16px` | 元信息、日期、地点 |
| `icon.sm` | `20px` | 按钮、输入、列表 |
| `icon.md` | `24px` | 导航、返回、主要功能 |
| `icon.lg` | `32px` | 状态卡、入口卡 |
| `icon.xl` | `48px` | 大型状态图标 |
| `component.tag.iconSize` | `14px` | 标签内局部光学例外 |
| `component.hero.iconMin/MaxSize` | `48–64px` | 重点营销入口、成功状态 |

- 功能图标统一使用圆角线性风格，默认 `2px` 视觉线宽。
- 3D 图标只用于 Hero、身份入口和场馆插画，不进入表单字段、普通列表或导航栏。
- 图标按钮视觉尺寸可以小于 48px，但 H5 默认点击热区不得小于 `48 × 48px`；仅原生 iOS 控件兼容底线可为 `44 × 44px`。

### 4.9 动效

```css
--motion-duration-instant: 100ms;
--motion-duration-fast: 160ms;
--motion-duration-normal: 240ms;
--motion-duration-slow: 320ms;
--motion-duration-complex: 400ms;
--motion-ease-standard: cubic-bezier(.2, 0, 0, 1);
--motion-ease-enter: cubic-bezier(0, 0, 0, 1);
--motion-ease-exit: cubic-bezier(.3, 0, 1, 1);
```

- 按压反馈：`100–160ms`，可缩放到 `0.98` 并降低亮度，不移动布局。
- Tab 切换：指示器使用 `240ms` 标准缓动。
- 进入使用 `ease-enter`，离开使用 `ease-exit`；复杂面板最长 `400ms`。
- 卡片展开：使用 `grid-template-rows` 与透明度 `240–320ms`；禁止直接动画 `height/top/left`。
- 尊重 `prefers-reduced-motion`，关闭缩放、漂浮和复杂渐变动画。
- 不给长列表的每张卡设置入场动画。

### 4.10 控件尺寸

| Token | 值 | 用途 |
|---|---:|---|
| `size.control.compact` | `36px` | 只读/低频紧凑控件，外部热区仍为 48px |
| `size.control.sm` | `40px` | 卡内次级按钮 |
| `size.control.md` | `44px` | 原生 iOS 兼容或紧凑次级控件 |
| `size.control.lg` | `48px` | 输入框、默认主按钮、自定义 AppBar |
| `size.control.xl` | `52px` | 单页唯一的重点提交按钮 |
| `size.control.list` | `56px` | 列表行、ActionSheet 选项、舒适信息行 |
| `size.touchTarget` | `48px` | H5 所有独立交互目标默认最小点击热区 |
| `size.touchTargetIosMin` | `44px` | 仅原生 iOS 控件兼容底线 |

视觉容器小于 `48px` 时，必须通过伪元素或父级按钮扩大热区，且热区不得相互重叠；相邻目标之间至少保留 `8px` 可辨识间隔。

### 4.11 不透明度与层级

| Token | 值 | 用途 |
|---|---:|---|
| `opacity.disabled` | `0.42` | 禁用装饰和非文本图标 |
| `opacity.muted` | `0.64` | 次级装饰 |
| `opacity.decorationMin/Max` | `0.08 / 0.22` | 城市线稿、晶体、雾化装饰 |
| `zIndex.sticky` | `100` | 普通吸顶内容 |
| `zIndex.appBar` | `200` | 自定义顶部导航 |
| `zIndex.bottomBar` | `300` | 底部操作区 |
| `zIndex.overlay` | `400` | 遮罩 |
| `zIndex.modal` | `500` | 对话框 |
| `zIndex.toast` | `600` | Toast 与全局反馈 |

禁止页面自行使用 `9999` 等任意层级。

### 4.12 主题模式

- 本版本只发布浅色模式，机器声明为 `meta.themeMode = light-only`。
- 组件必须只消费语义颜色，不因浅色模式而直接绑定 `#FFFFFF/#000000`；这保证未来新增主题时不重写组件结构。
- 不得使用半成品 `@media (prefers-color-scheme: dark)`；系统切换深色时仍保持完整、可读的项目浅色主题。
- 浏览器顶栏、表单控件和页面背景的主题元信息必须与浅色模式一致；页面路由切换时同步更新 `theme-color`。
- 深色主题正式进入范围时，应新增独立模式 Token 与对比度回归测试，并按版本规则发布。

---

## 5. 核心组件规范

### 5.1 页面导航栏 `AppBar`

- `AppBar.custom`：H5、移动 Web 和自定义小程序导航默认最小内容高度 `48px`，不含系统安全区；文本放大时允许增高。
- `AppBar.native`：原生导航使用平台系统高度，不覆盖系统布局；iOS 常见内容高度为 `44px`。
- 标题：居中，使用 `title.page` + `color.title.primary`。
- 左侧返回按钮：H5 使用 `48 × 48px` 点击区，`24px` 图标。
- `back.plain`：纯色或浅色背景必须使用裸图标。
- `back.floating`：照片、插画或线稿背景导致对比不足时，使用 `40 × 40px` 半透明白底浮层，外部热区仍为 `48 × 48px`。
- 右侧没有操作时仍保留等宽占位，确保标题真实居中。
- 使用 `HomeBrandHero` 的大会首页不得再显示 AppBar；其他二级页面必须显示 AppBar。

### 5.2 页面背景 `PageBackground`

- 默认使用 `gradient-page`。
- 装饰性城市线稿、不规则晶体和大会主视觉必须低对比并位于内容层后方。
- 装饰图建议透明度 `8%–22%`；不得穿过输入框文字或长正文。
- 同一页最多使用一组主背景装饰，避免每张卡片各自发光。

### 5.2.1 Hero 与 Banner

Hero 不使用一个模糊的通用比例，必须选择下列命名变体：

| 变体 | 选择条件 | 尺寸规则 | 图文规则 |
|---|---|---|---|
| `HomeBrandHero` | 大会首页首屏 | `component.hero.homeHeight = clamp(240px, 66vw, 280px)` | 大会名、口号、日期、地点为 DOM；主视觉位于右侧或背景 |
| `MediaHero` | 议程详情、活动详情 | `aspect-ratio: 2 / 1` | 左侧文字安全区 52%，右侧媒体；使用 `gradient.imageMask` |
| `EventSummaryBanner` | 报名页顶部大会摘要 | `aspect-ratio: 3.6 / 1`，最小高度 `104px` | 左侧标题/日期/地点，右侧 3D 图标；`compact` 固定改为 `2.8 / 1` 并自然增高 |
| `ProfileBackdrop` | 我的报名详情用户资料头部 | 自由高度，`component.hero.profileMinHeight = 220px` | 头像和身份信息为 DOM，城市/晶体为装饰资产 |

Hero 图片不得包含日期、状态、姓名、倒计时或按钮等可变业务文字。

- `HomeBrandHero / MediaHero / EventSummaryBanner` 主标题默认使用 `color.title.brand`；需要强调单个关键词时才使用 `color.title.emphasis`。
- 标题位于深色主视觉或品牌渐变上时使用 `color.title.inverse`，不得继续使用深紫导致低对比。

### 5.3 卡片 `Card`

**`Card.elevated`：默认信息卡**

- 白底，圆角 `16px`，内边距 `16px`。
- 无可见描边，只使用 `shadow-card`。
- 用于报名信息、消息、场馆、资讯和章节内容。

**`Card.compact`：紧凑信息卡**

- 圆角 `16px`，内边距 `12px`。
- 用于资讯列表、通知条和高密度元信息。

**`Card.hero`：重点卡片**

- 圆角 `20px`，内边距 `20–24px`。
- 用于审核结果、Hero 入口、活动头图。

**`Card.outlined`：边界卡片**

- 白底，`1px solid border.default`，无阴影。
- 只用于选择器、表单控件组、分段控制器和需要明确点击边界的容器。

所有通用卡片标题默认使用 `color.title.primary`；只有品牌主题卡使用 `color.title.brand`，当前分区的唯一重点卡可使用 `color.title.emphasis`。

简单标题、正文、图例和分割列表不应为了“统一”全部套卡片；当父级白色容器已经建立分组时，子项使用分割线或留白，不再嵌套第二层阴影卡片。

### 5.4 章节标题 `SectionHeader`

- 只用于议程详情、活动介绍、嘉宾和场地信息等结构化详情章节；首页聚合区使用 `SectionLinkHeader`。
- 左侧使用 `3 × 20px` 的蓝紫短竖线，圆角 `2px`。
- 标题使用 `title.section` + `color.title.emphasis`。
- 可选的淡色序号放在右上角，透明度不高于 `8%`，不可替代真实标题。
- 有“查看更多”时使用文字 + 16px 箭头，点击区至少 48px 高。

### 5.5 主按钮 `Button / Primary`

- `Button.primary`：默认单行高度 `48px`，实现为 `min-height: 48px`，文本换行时允许增高。
- `Button.submit`：仅用于表单最终提交，默认单行高度 `52px`，实现为 `min-height: 52px`，同一页最多一个。
- 最小宽度：`96px`；全宽按钮占内容宽度。
- 圆角：`12px`，不使用胶囊形作为默认主按钮。
- 背景：`gradient-brand`；文字：白色 `button`。
- 左右内边距：`20px`；图标与文字间距：`8px`。
- 阴影：`shadow-button`，固定底栏内可减弱。

状态：

- `pressed`：整体亮度降低 6%，缩放 `0.98`。
- `disabled`：背景 `color.state.disabledBg`，文字 `color.state.disabledText`，无阴影，并保留可识别禁用语义。
- `loading`：保留按钮宽度，用进度图标替换前置图标，禁止重复提交。

### 5.6 次级与危险按钮

- 次级按钮：白底、`1px solid brand.400`、文字 `brand.600`；默认高 `48px`，卡内紧凑变体可为 `40px`，但完整热区仍为 `48px`。
- 三级按钮：无容器或 `bg.subtle`，文字 `brand.600`。
- 危险按钮：白底或透明底，文字 `danger.600`；默认不使用红色实心大按钮。
- 同一操作组顺序：次级在左，主要在右；竖向排列时主要在上，危险操作与主要操作至少间隔 `12px`。

### 5.7 Tab

存在两种合法变体，按信息语义选择，不互相替代。

**下划线 Tab**

- 用于“资讯：全部/通知/动态/视频”等内容频道导航。
- 默认单行高度 `48px`，文字 `16px`；文本缩放时使用 `min-height` 并允许增高。
- 选中文字 `brand.700`、字重 `600`；指示器 `28 × 4px`、圆角 `2px`。
- 适合 2–5 个栏目；过多时横向滚动。

**分段控制器**

- 用于“全部消息/系统通知/活动提醒”等同一列表范围切换。
- 默认单行高度 `48px`，外框 `1px solid brand.100`，圆角 `12px`；实现使用 `min-height`。
- 选中段使用 `gradient-brand`，文字白色；未选中为透明底。
- 仅用于 2–4 个等权、短标签选项。

### 5.8 标签与状态 `Tag`

- 单行默认高度 `22–26px`，横向内边距默认 `8px`；宽标签使用 `12px`。文本放大时允许标签增高和换行。
- 字号 `12–13px`，圆角 `999px`。
- 普通分类：`brand.50` 背景 + `brand.600` 文字。
- 成功：`success.50` + `success.600`。
- 提醒：`warning.50` + `warning.600`。
- 重要/错误：`danger.50` + `danger.600`。
- 必须显示文字；“未读”同时保留 6px 圆点与文字。

### 5.9 输入框 `TextField`

- 单行输入默认高度 `48px`，实现为 `min-height: 48px`；多行输入最小高度 `96px`，均允许随文本缩放增高。
- 圆角：`8px`；边框：`1px solid border.default`。
- 左右内边距：`16px`。
- 输入文字：`body.md / text.primary`；占位：`body.sm / text.tertiary`。
- 聚焦：边框 `border.focus`，增加 `shadow.focusRing`。
- 错误：边框 `danger.600`，错误文案位于字段下方，不能只显示红框。
- 桌面式“左标签 + 右输入”在小于 `360px` 时改为上下排列，避免输入区过窄。

### 5.10 选择瓦片与多选标签

**身份选择瓦片**

- `IdentityTile.compact`：用于报名身份；`360px` 以上固定四列，组件级光学间距 `10px`，最小高度 `56px`，单项允许收缩但文字不得小于 `13px`；`320–359px` 改为两列。
- `IdentityTile.comfortable`：用于长身份名或附带说明的选择；使用 `repeat(auto-fit, minmax(100px, 1fr))`，形成两列或三列。
- 两种变体均使用 `12px` 圆角、白底和浅边框，不允许页面自行决定列数。
- 选中：`brand.50` 背景、`brand.500` 边框、右下角选中标记。
- 图标使用 `size.icon.sm = 20px`，文字统一 `label.md = 14/20px`，不保留全局 15px 模糊档位。

**多选标签**

- 最小高度 `40px`；圆角 `10px`。
- `TagSelect.compact`：仅用于图 6 这类 2–4 字短标签，`360px` 以上最多一行 6 项，文字必须至少 `12px`；不足空间时自动换行。
- `TagSelect.default`：长标签使用 `flex-wrap`，单项最小宽度 `88px`，不限制每行数量。
- 选中与身份瓦片保持同一套边框和底色，不另造颜色。

### 5.11 上传区 `Uploader`

- 宽度 100%，最小高度 `112px`，圆角 `12px`。
- `1px dashed color.border.upload`，白色或极浅紫底。
- 中心依次为上传图标、主提示、格式/大小说明。
- 上传后显示文件名、大小、进度、失败原因和删除操作。
- 支持拖拽的文案仅在真实支持拖拽的环境出现；小程序端使用“点击上传”。

### 5.12 搜索框 `SearchBar`

- `SearchBar.default` 默认可见高度 `48px`，实现为 `min-height: 48px`，圆角 `24px`，点击热区同为 `48px`。
- `SearchBar.compact` 仅用于空间受限的复合工具栏，可见高度 `44px`，外部交互热区仍为 `48px`。
- `SearchBar.default`：纯色页面使用白底，无浮层阴影。
- `SearchBar.floating`：城市线稿或插画背景上使用 `surface.glass` 与 `shadow-float`。
- 搜索图标 `20px`，占位符 `body.md / text.secondary`。
- 清除按钮点击区 `48 × 48px`。
- 搜索结果页需要空状态、加载态和无网络态。

### 5.13 资讯卡 `NewsCard`

- 容器：紧凑卡片，横向布局。
- 缩略图：推荐 `3:2`，宽度使用 `component.newsCard.imageWidthMin/Max = 38%–42%`，圆角使用 `component.newsCard.imageRadius = 8px`，`object-fit: cover`。
- 内容：标题使用 `title.cardCompact` + `color.title.primary`，最多 2 行；摘要最多 2 行；底部放日期和类型标签。
- 右箭头属于整卡可点击提示，不应成为唯一点击目标。
- 视频封面叠加居中播放按钮，按钮直径使用 `component.newsCard.videoPlayMin/MaxSize = 40–48px`，同时保留“视频”文字标签。
- 宽度小于 `component.newsCard.stackBreakpoint = 340px` 时可改为上图下文，不继续压缩正文。

### 5.14 消息卡 `MessageCard`

- 左侧功能图标容器使用 `component.messageCard.iconContainerSize = 48px`；图标使用 `component.messageCard.iconSize = 28px`。
- 右侧内容依次为：标题 + 状态标签、摘要、时间、已读状态。
- 未读：标题使用 `title.card` + `color.title.brand` + `600`，同时显示蓝紫圆点 + “未读”；已读：标题使用 `color.title.primary` + `500`，状态用灰色。
- 整卡可点击；点击后立即更新已读状态，并提供失败回滚。
- 列表结束使用弱文本和短分割线，不使用空白大卡片。

### 5.15 议程卡 `AgendaCard`

- 状态条置于卡片左上角，使用短标签而非大面积覆盖。
- 信息顺序：状态 → 活动名 → 时间 → 地点 → 行动。
- 活动名默认使用 `color.title.brand`；当前正在进行的唯一议程可使用 `color.title.emphasis`。
- “正在发生”可配图片背景；“即将开始”优先白底信息卡 + 倒计时。
- 倒计时数字使用 `metric`，数字之间留等宽间隔，单位使用 `caption`。
- 倒计时归零后必须转为“正在进行”或“已结束”，不可继续显示 `00:00:00`。

### 5.16 嘉宾卡 `GuestCard`

- 人物图片区统一为接近 `1:1`，使用 `object-fit: cover`，统一肩线、头部留白和背景亮度。
- `GuestCard.standard`：首页使用，固定三列；姓名 `16px / 600 / color.title.brand`，职位 `12–14px / 1–2 行`。
- `GuestCard.compact`：议程详情使用；`360px` 以上固定四列，姓名 `14px / 600 / color.title.brand`，职位最多两行；`320–359px` 在嘉宾不超过四位时使用两列，超过四位时使用 `GuestCarousel`。
- `GuestCarousel`：嘉宾超过当前区块展示上限时使用，卡片宽度由对应 standard/compact 变体决定，不得另设第三套样式。
- 图片与文字区分层，避免文字直接压在人物衣服上。

### 5.17 场馆卡 `VenueCard`

- 插画与文字在宽屏移动端可左右布局；`< 360px` 改为上图下文。
- 场馆主题色仅用于图标和小标签：主会场紫、讲堂蓝、洽谈青、嘉年华粉。
- 场馆名统一使用 `color.title.primary`，不跟随四类场馆主题色，避免标题体系失控。
- 底部双按钮等宽：左描边“查看导览”，右渐变“导航前往”。
- 使用第三方地图前明确提示，并在调用失败时提供地址复制。

### 5.18 键值信息行 `InfoRow`

- `InfoRow.compact`：报名详情等只读信息使用，最小高度 `48px`。
- `InfoRow.default`：包含说明或可操作内容时使用，最小高度 `56px`。
- 标签宽度稳定，使用 `text.secondary`；值右对齐，使用 `text.primary`。
- 行间使用 `border.subtle` 分割。
- 邮箱、长单位名等允许换行或中间断行，不能溢出容器。

### 5.19 底部操作区 `BottomActionBar`

- 仅在操作需要随时可达时固定；普通长页可以放在内容流底部。
- 固定时使用半透明白底和顶部细线/轻阴影。
- 内边距：`12px 16px max(12px, env(safe-area-inset-bottom))`。
- 主要按钮全宽；若有两个按钮，次级占 40%，主要占 60%。

### 5.20 首页功能入口 `FeatureEntryCard`

- `FeatureEntryCard.primary`：大会报名等首要入口，入口组网格占 `3fr`，使用品牌渐变和 3D 图标。
- `FeatureEntryCard.secondary`：开放麦报名等同级但次要入口，入口组网格占 `2fr`，使用浅色背景、品牌文字和单个 3D 图标。
- 两张卡组成一个入口组，整体使用 `Card.hero`；卡内点击热区覆盖完整卡片。
- 标题使用 `color.title.brand`，最多一行；说明最多两行；右箭头是状态提示，不是唯一点击目标。
- `compact` 下仍保持双列，但主卡不得小于容器的 56%；若文案溢出，改为上下两张，不缩小字号。

### 5.21 重要通知条 `NoticeBar`

- 高度最小 `48px`，圆角 `12px`，使用 `Card.compact` 密度。
- 结构固定为：类别标签 → 单行标题 → 可选未读红点 → 右箭头。
- 标题使用 `color.title.primary` 并单行截断；整条可点击。
- `NoticeBar.important` 使用品牌浅底；真正错误或危险通知才使用危险色，不以红色制造普通运营紧迫感。

### 5.22 用户资料头 `ProfileHeader` 与 `AvatarBadge`

- `ProfileHeader` 包含头像、姓名、身份标签、大会名称和装饰背景；不承载审核状态详情。
- 头像使用 `component.profileHeader.avatarSize = 72px`，圆形裁切，描边使用 `component.profileHeader.avatarBorderWidth = 3px`。
- `AvatarBadge.verified` 固定在头像右下，视觉尺寸 `24px`、点击/说明热区 `48px`；必须提供“已认证”可访问文本。
- 姓名使用 `title.section` + `color.title.brand`；身份使用普通品牌标签，不用绿色成功色。
- 装饰背景不得降低姓名和身份信息的对比度。

### 5.23 审核摘要 `ApprovalSummaryCard`

- 使用 `Card.hero`，结构固定为：状态图标 → 结论标题/说明 → 状态标签 → 分割线 → 指标区。
- 指标区 `regular/wide` 固定三列：参会身份、提交时间、审核时间；`compact` 改为单列或两列加一行。
- 结论标题使用对应 `color.state.*Text`，状态颜色只用于图标、结论标题和标签，指标文字保持 `text.primary/secondary`。
- 支持 `pending / approved / rejected / cancelled` 四种状态；每种状态必须有明确文字和图标。

### 5.24 地图总览 `MapOverview` 与 `MapLegend`

- `MapOverview` 固定使用 `16:9` 容器、`object-fit: contain`，必须完整显示全部场馆标记。
- 标记和场馆主题色固定映射：主会场紫、创新讲堂蓝、对接洽谈青、嘉年华粉。
- 标记必须同时包含文字名称或编号，不能只依赖颜色。
- `MapLegend` 位于地图下方，使用无阴影的横向图例；空间不足时换行，不横向压缩文字。
- 地图图片只是空间总览；场馆列表和文字地址仍是可访问、可导航的真实 DOM。

### 5.25 复选框与协议 `Checkbox / AgreementRow`

- `Checkbox` 可见框 `24 × 24px`，完整交互热区至少 `48 × 48px`。
- 选中态使用 `brand.600` 实心底和白色对勾；焦点态使用 `border.focus` 外环。
- `AgreementRow.required` 在行首显示危险色星号，并通过 `required/aria-required` 暴露语义。
- 协议名称使用真实链接，链接与复选框均可独立获得焦点。
- 校验失败时在协议组下方显示文字错误，不只把复选框变红。

### 5.26 操作信息行 `ActionRow`

- 结构固定为：`component.actionRow.leadingIconSize = 24px` 图标 → 标题/可选说明 → `component.actionRow.arrowIconSize = 16px` 箭头。
- 最小高度使用 `component.actionRow.minHeight = 64px`，圆角使用 `radius.lg = 16px`；整行可点击。
- 用于“合作需求与材料”等入口，不用于只读键值信息。
- 标题使用 `color.title.primary`；标题和说明不得与箭头重叠；长文案允许说明两行。

### 5.27 分区链接标题 `SectionLinkHeader`

- 左侧分区标题使用 `title.section` + `color.title.emphasis`，右侧显示“查看更多”文字或箭头；二者属于同一个 48px 高点击入口。
- 首页“嘉宾”“资讯”等聚合区使用此组件，不使用详情页的章节竖线和淡色序号。
- 只有结构化详情章节使用 `SectionHeader`；聚合首页必须使用 `SectionLinkHeader`。

### 5.28 浏览量 `ViewCount`

- 由 `16px` 眼睛图标和 `caption` 数字组成，使用 `text.tertiary`。
- 数字按产品本地化规则显示，例如 `8,554` 或 `1.2万`，同一页面不得混用格式。
- 浏览量是辅助元信息，不可抢占标题和日期层级。

### 5.29 反馈状态 `FeedbackState`

| 变体 | 必备内容 | 行动 |
|---|---|---|
| `loading` | 与最终结构一致的骨架，不使用无限旋转覆盖整页 | 无 |
| `empty` | 场景化图标、明确说明 | 提供唯一下一步，例如“返回首页”或“清除筛选” |
| `error` | 错误摘要和可读原因 | “重试”；不可恢复时提供返回路径 |
| `offline` | 离线提示和最后更新时间 | “重新连接” |
| `end` | 弱文字和短分割线 | 无按钮 |

- 骨架圆角、行高和间距必须与真实组件一致，避免加载完成时布局跳动。
- Toast 用于轻量反馈，表单错误必须就近显示；不可用 Toast 代替字段错误。

### 5.30 Dialog（对话框）

- 只用于必须中断当前流程的确认、风险说明或关键选择；普通说明优先使用页面内提示或 BottomSheet。
- 宽度为 `min(calc(100vw - 48px), 320px)`，圆角 `16px`，内边距 `24px`；不得贴边。
- 标题使用 `title.card` + `color.title.primary`，正文使用 `body.md` + `text.secondary`；正文自然换行，不固定对话框高度。
- 操作按钮 1–2 个：横排时右侧为主要操作；320px 或 200% 文本缩放导致拥挤时改为竖排，主要操作在上。
- 打开后焦点进入对话框，键盘焦点被约束在对话框内；关闭后焦点返回触发元素。
- 使用 `role="dialog"`、`aria-modal="true"` 与可关联标题；浏览器返回键或 Escape 的行为必须与显式关闭一致。
- 破坏性操作须明确写出后果，不能只用“确定/取消”作为脱离上下文的按钮文案。

### 5.31 BottomSheet / ActionSheet（底部面板）

- `BottomSheet` 用于补充内容、筛选和移动端连续任务；`ActionSheet` 只用于一组短操作，不承载复杂表单。
- 顶部圆角 `20px`，宽度 100%，最大高度 `min(80dvh, 720px)`；内容超出时仅面板内容区滚动。
- 顶部可提供 `32 × 4px` 拖拽指示条，但不能把它作为唯一关闭方式；必须有可访问的关闭按钮或明确取消项。
- ActionSheet 列表项最小高度 `56px`，独立操作热区不小于 `48 × 48px`；危险操作与普通操作分组。
- 底部内边距包含 `env(safe-area-inset-bottom)`；软键盘出现时面板不得遮挡当前字段和提交操作。
- 打开、焦点约束、返回焦点和背景滚动锁定规则与 Dialog 一致。

### 5.32 Toast / Snackbar（轻提示）

- `Toast` 用于无需操作、短时间可理解的结果；`Snackbar` 用于可撤销或需要一个轻量动作的结果。
- 最小高度 `44px`，左右页边距至少 `16px`；有操作按钮时按钮热区至少 `48 × 48px`。
- 普通提示显示至少 3 秒；包含操作或较长文字时至少 5 秒，并允许辅助技术获得足够读取时间。
- 成功、失败、离线等信息使用 `aria-live="polite"`；阻断性错误使用就近错误或 Dialog，不依赖瞬时 Toast。
- 同时只显示一个；新消息按队列处理，不层叠。固定底栏存在时 Toast 位于底栏上方并避让安全区。
- 禁止仅用 Toast 承载表单字段错误、法律告知或不可恢复错误。

### 5.33 Radio / Switch（单选与开关）

- `Radio` 用于互斥选项；2–5 个短选项优先直接展示，更多选项进入选择页或 BottomSheet。
- Radio 可见控件 `24 × 24px`，整行最小高度 `48px`；使用 `fieldset/legend` 或等价分组语义。
- `Switch` 只用于立即生效的开/关设置，不用于提交型选择，不用“是/否”代替业务动作。
- Switch 建议视觉尺寸 `48 × 28px`，但整行热区至少 `48 × 48px`；必须提供可读标签和当前状态。
- 选中、禁用、错误和焦点状态必须有形态或文字差异，不能只换颜色。
- 标签点击必须能触发对应控件；连续快速点击时状态更新必须防抖并提供失败回滚。

### 5.34 Avatar（头像）

- 尺寸档位固定为 `24 / 32 / 40 / 48 / 64px`；业务资料头的 `72px` 头像属于 `ProfileHeader` 组件例外。
- 默认圆形裁切，人物照片使用 `object-fit: cover`；机构标识可使用 `8px` 圆角方形变体。
- 无图片时使用姓名首字、机构简称或默认图形；不得显示破图图标。
- 头像仅展示时无需单独成为焦点；可点击时外部热区至少 `48 × 48px` 并提供明确可访问名称。
- 状态点和认证徽章不得遮挡主要面部区域，也不得成为状态的唯一表达。

### 5.35 TabBar（可选底部导航）

- 当前七张设计图没有证明产品必须使用全局 TabBar，因此默认信息架构不启用；只有产品确认存在 3–5 个稳定一级目的地时才使用。
- 内容高度 `56px`，另加 `env(safe-area-inset-bottom)`；每个导航项的热区覆盖等分区域且不小于 `48 × 48px`。
- 图标 `24px`，标签使用 `caption`；选中态同时改变图标形态/字重与文字，不只依赖颜色。
- 不放置“返回”、临时活动、提交、扫码等动作；中心悬浮按钮不得破坏其他导航项的等宽热区。
- 页面内容底部必须预留 TabBar 与安全区高度；键盘弹出时按业务决定隐藏或避让，但不可覆盖表单字段。
- H5 浏览器返回、深链和刷新后必须保持路由与选中项一致。

---

## 6. 图片、插画与品牌资产

### 6.1 图片比例

| 类型 | 比例 | 裁切 |
|---|---:|---|
| 首页品牌 Hero | 自由高度 | 使用构图安全区，不按媒体比例硬裁 |
| 议程/活动媒体 Hero | `2:1` | 保留左侧文字安全区，允许右侧媒体裁切 |
| 报名摘要 Banner | `3.6:1`，`compact` 固定为 `2.8:1` | 图标 `contain`，文字不进图片 |
| 资讯缩略图 | `3:2` | `object-fit: cover` |
| 嘉宾肖像 | 接近 `1:1` | 统一头顶、肩线和背景亮度 |
| 场馆插画 | `1:1` | `object-fit: contain` |
| 用户头像 | `1:1` | 圆形裁切 |
| 地图总览 | `16:9` | 不裁掉标记与图例 |

### 6.2 图文叠加

- Hero 文字区必须位于预设安全区，不把关键文字压在高细节图像上。
- 使用 `gradient-image-mask`，而不是给每行文字加白色描边。
- 图片中不得预烘焙可变业务文字，例如日期、状态、按钮、倒计时。
- 装饰图可作为背景资产；功能文字、标签和按钮必须是 DOM。

### 6.3 视觉资产一致性

- 同一页面避免混用写实照片、等距 3D 插画和扁平卡通三种主风格。
- 大会品牌 Hero 可使用高质感 3D；场馆导览统一使用等距 3D；列表功能图标统一使用线性图标。
- 嘉宾照片背景统一为冷白或浅紫，肤色不得被蓝紫滤镜污染。
- 图片需提供 WebP/AVIF 与回退格式，长列表缩略图启用懒加载。

### 6.4 H5 性能预算

性能预算属于发布门槛，而不是上线后的优化建议。Core Web Vitals 按真实用户数据的第 75 百分位（p75）验收：

| 指标/资产 | 生产上限 | 说明 |
|---|---:|---|
| LCP | `≤ 2500ms` | 首屏主要内容可见速度 |
| INP | `≤ 200ms` | 交互响应性 |
| CLS | `≤ 0.1` | 页面视觉稳定性 |
| 首路由 JavaScript | `≤ 200KiB gzip` | 不含按需加载的非首屏模块 |
| 首路由 CSS | `≤ 80KiB gzip` | 包含关键样式与 Token |
| 单张 Hero / LCP 图片 | `≤ 300KiB` | 超出必须提供压缩依据和网络实测 |
| 单张列表缩略图 | `≤ 100KiB` | 长列表必须懒加载 |

- 所有内容图片必须声明 `width`、`height` 或等价 `aspect-ratio`，禁止图片加载后推动正文产生布局跳动。
- 首屏 LCP 图片不得懒加载；应使用响应式 `srcset/sizes`，并只在确认它是 LCP 资源时提高优先级。
- 首屏以外图片使用原生懒加载；失败时显示稳定占位，不收缩容器。
- 非首屏场馆图、嘉宾列表和视频能力必须按需加载；不得因 3D 资产阻塞报名与日程主流程。
- 不因追求动效引入大型运行时；持续动画、模糊和滤镜必须在中低端真机验证帧率，并尊重减少动态效果设置。
- 实验室数据用于发布前阻断明显回归；上线后以近 28 天真实用户 p75 为准。任何预算例外必须记录页面、原因、负责人和到期时间。

Core Web Vitals 阈值依据：[web.dev 官方定义](https://web.dev/articles/defining-core-web-vitals-thresholds)。

---

## 7. 页面模板

### 7.1 首页

```text
系统安全区
大会品牌 Hero（名称 / 口号 / 日期 / 地点）
双主入口（大会报名 / 开放麦报名）
重要通知条
当前议程 / 即将开始
嘉宾横向列表
资讯列表
页面尾部
```

- Hero 可以无 AppBar，但必须保证首屏关键文字与系统状态栏不冲突。
- 首屏只保留两个同级入口；更多服务进入二级页。
- 七张图未提供全局底部导航证据，因此默认不启用；若产品信息架构后续确认存在 3–5 个稳定一级目的地，按 `5.35 TabBar` 启用并处理安全区。

### 7.2 标准列表页

```text
AppBar
频道 Tab / 搜索（按需）
列表卡 × N
加载 / 空 / 错误 / 到底状态
```

- 资讯使用下划线 Tab；消息使用分段控制器。
- 列表左右边距和卡片宽度全页一致。

### 7.3 标准详情页

```text
AppBar
活动 Hero / 状态摘要
章节卡 × N
相关人物 / 场地 / 材料
主要行动
安全区
```

- 章节顺序服从用户任务，不按装饰编号强行排序。
- `Action.flow`：普通详情页默认使用，按钮位于内容流末尾。
- `Action.sticky`：仅当主要任务需要跨长页随时可达（如关注日程或确认报名）时使用；必须配置 `BottomActionBar` 并为正文预留底部空间。
- 同一页面不得同时出现同文案的流内与固定主按钮。

### 7.4 表单页

```text
AppBar
大会摘要
身份选择
基础信息
多选信息
材料上传
协议确认
提交按钮
安全区
```

- 提交前只校验必要项；错误定位到字段并自动滚入视口。
- 用户返回时保存草稿；清空或取消需二次确认。

### 7.5 场地导览页

```text
品牌背景 + AppBar
搜索框
总览地图与图例
场馆卡 × N
第三方导航提示
安全区
```

- 地图标记颜色与场馆卡主题色必须一一对应。
- 不把图片地图作为唯一导航方式，必须同时提供文字地址。

---

## 8. 冲突项的最终统一决定

| 冲突 | 图片中的表现 | 最终规范 |
|---|---|---|
| 画布来源 | 前六张为 `852 × 1845`，第七张为 `941 × 1672` | 不宣称原始逻辑画布；`390px` 为常用生产验收宽度，另在 `430px` 验证宽屏，支持 `320–480px` |
| 页面左右边距 | 约 16–20px 不等 | `16px` 默认，`>=414px` 使用 `20px` |
| 页面标题颜色 | 黑色、深蓝混用 | AppBar 与普通标题统一 `color.title.primary`；品牌/活动标题使用 `color.title.brand`；章节/首页分区使用 `color.title.emphasis` |
| AppBar 高度 | 截图观感约 44–48px | 自定义导航默认最小 `48px`、文本放大时可增高；原生导航服从平台，iOS 常见 `44px` |
| 返回按钮 | 裸箭头与白色方形底并存 | `back.plain` 用于纯色背景；`back.floating` 只用于复杂背景；H5 热区均为 48px |
| 卡片圆角 | 约 12–24px | 紧凑/默认 `16px`，重点 `20px`，大型营销容器 `24px` |
| 卡片边界 | 有时靠阴影、有时靠描边 | `Card.elevated` 只用轻阴影；`Card.outlined` 只用描边；`Card.glass` 只用于复杂背景 |
| 主按钮颜色 | 多组不同蓝紫渐变 | 统一 `gradient-brand`；页面局部不再自定义新渐变 |
| 主按钮形态 | 胶囊与圆角矩形混用 | 默认 `12px` 圆角矩形；小型状态动作可用胶囊 |
| Tab | 下划线与分段填充并存 | 内容频道用下划线；同一数据范围切换用分段控制器 |
| 图标风格 | 线性图标与 3D 图标混用 | 功能控件用线性图标；Hero/场馆/入口允许 3D |
| 正文颜色 | 深蓝、黑色、灰蓝混用 | 标题使用 `color.title.*`，正文 `text.secondary`，输入/关键值 `text.primary`，辅助 `text.tertiary` |
| Hero 比例 | 首页自由构图、详情约 2:1、报名摘要超宽 | 分成 `HomeBrandHero / MediaHero / EventSummaryBanner / ProfileBackdrop` 四个变体 |
| 身份列数 | 报名页一行四项 | `IdentityTile.compact` 在 360px 以上固定四列，compact 断点改两列 |
| 多选密度 | 一行可见六个短标签 | `TagSelect.compact` 允许最多六个短标签，但字体不得小于 12px，空间不足自动换行 |
| 嘉宾图片比例 | 原图接近方形 | 统一接近 `1:1`，不再使用 `4:5` |
| 嘉宾列数 | 首页三列、详情四列 | 首页使用 `GuestCard.standard` 三列；详情使用 `GuestCard.compact` 四列；compact 断点降级 |
| 搜索高度 | 原图比输入框更紧凑 | H5 `SearchBar.default` 与普通输入框统一 48px；复合工具栏才可用 44px 紧凑视觉高度，外部热区仍为 48px |
| 默认正文 | 截图中约 14–16px 混用 | H5 默认正文与输入统一 `16 / 24px`；辅助正文 `14 / 22px`，不再把 15px 作为全局正文档位 |
| 最小触控 | 截图中有 40–44px 小控件 | H5 默认 `48 × 48px`；仅原生 iOS 控件允许 44px 平台兼容底线 |
| 全局间距 | 截图存在 2/6/10px 光学微调 | 全局只保留 4px/8px 网格；微调进入组件 Token，不扩散为全局 Space Token |
| 只读信息行 | 报名详情较紧凑 | `InfoRow.compact` 48px；包含说明或操作时 `InfoRow.default` 56px |
| 消息图标 | 原图约 44–48px | 图标容器统一为 48px |
| 底部 CTA | 流内与近底部固定视觉混用 | 默认 `Action.flow`；跨长页需持续可达时使用 `Action.sticky`，两者不得重复 |

V2.0 对标题颜色做了明确的方向性调整：图 2、3、4、6 中部分接近黑色的 AppBar、卡片和表单分组标题，将统一迁移为深紫黑 `color.title.primary`。这是用户确认的 V2.0 品牌化决策，属于 `NORMALIZED`，不是对截图色值的原样复制。

---

## 9. 状态与可访问性

### 9.1 必备状态

每个交互组件必须先按能力声明状态，不要求无意义地为所有组件复制同一套状态：

- 所有可交互组件：默认、按下、焦点、禁用。
- 发起异步任务的组件：额外提供加载、成功、失败与防重复提交。
- 可选择组件：额外提供选中、未选中、部分选中（适用时）。
- 导航组件：额外提供当前项、非当前项和不可达状态；不虚构“成功/失败”。
- 列表：骨架屏、空状态、错误态、无网络、加载更多、已经到底。
- 表单：未填写、聚焦、已填写、校验中、错误、只读。
- 消息：已读、未读、重要、提醒。
- 报名：草稿、待审核、已通过、未通过、已取消。
- 议程：未开始、即将开始、进行中、已结束、已取消。

### 9.2 可访问性硬规则

- H5 所有独立可点击目标默认至少 `48 × 48px`；仅原生 iOS 控件可采用 `44 × 44px` 平台兼容底线。
- 正文对比度至少 `4.5:1`；大字至少 `3:1`。
- 图标按钮提供可访问名称，如 `aria-label="返回"`。
- Tab 使用正确的 `tablist/tab/tabpanel` 语义，并支持键盘切换。
- 表单标签与控件程序化关联；必填、错误、帮助信息均可被读屏读取。
- 不使用仅颜色区分状态；同时提供图标或文字。
- 支持 200% 文本缩放：容器使用 `min-height` 而非固定高度，按钮、标签、表单与弹层允许换行或增高，不遮挡、不截断关键内容。
- 320px 视口下不得出现双向滚动；除地图、数据表等明确例外外，内容必须单列重排并保持阅读顺序。
- 所有键盘可操作元素必须有清晰 `:focus-visible`；不得用 `outline: none` 移除焦点而不提供等价样式。
- 动态成功、失败和加载完成信息使用 `aria-live`；加载状态同时更新可见文案，不只展示旋转图标。
- 固定底栏、Dialog 和 BottomSheet 必须避让软键盘；聚焦字段和主要操作不得被键盘覆盖。
- 遵循 `prefers-reduced-motion: reduce`，关闭非必要缩放、视差、持续渐变和列表入场动画。
- 图片、图标、Canvas 和地图必须提供等价替代信息；纯装饰资产使用空替代文本或隐藏读屏语义。

### 9.3 国际化、日期与内容适应

- 本版本默认语言 `zh-CN`，默认时区 `Asia/Shanghai`；服务端和接口传输时间必须使用带时区的 ISO 8601 值，显示层再按活动时区格式化。
- 面向大会的日期优先写为“10月25日（周六）”，不使用容易产生歧义的 `10/25/26`；跨年日期必须显示年份。
- 同一页面的时间统一使用 24 小时制；时间范围使用连接号并保留两端分钟，例如 `14:30–16:30`。
- 数量和浏览量必须调用统一格式化函数；同一页面不得混用 `12,000 / 1.2万 / 12k`。
- 文案不得通过字符串拼接组成句子；姓名、机构、地点、日期和状态使用独立数据字段与可本地化模板。
- H5 DOM 必须设置正确 `lang`；语言切换后同步更新页面标题、读屏语言与日期/数字格式。
- 当前未发布 `zh-Hant/en` 翻译，但组件必须以英文约 `1.4×` 长度、繁体中文等长或略长内容进行压力测试，不以缩小字号解决溢出。
- 人名、机构名和地址允许自然换行；证件号、电话、邮箱使用适当的 `overflow-wrap`，但不得任意拆分可读单词。
- 翻译缺失时回退到 `zh-CN` 并记录日志，不直接显示翻译 key，也不混用机器临时翻译。

---

## 10. AI 前端开发约束

以下内容可直接作为 AI 开发任务的固定约束：

1. 只使用本文定义的颜色、间距、圆角、阴影、字阶和组件变体；标题只允许使用 `color.title.*` 或已定义状态色；新增 token 前先说明原因。
2. 页面宽度以流式布局实现，禁止按截图使用大量绝对定位。
3. UI 必须使用真实 DOM；禁止把整页截图、文字截图或按钮截图当作实现。
4. 业务数据必须来自结构化数据或接口；不得写进背景图片或 CSS 伪元素。
5. 图片只承载照片、品牌主视觉、地图底图和插画；图上状态、按钮、标签、时间均为 DOM。
6. 使用 `env(safe-area-inset-top/bottom)` 处理安全区。
7. 页面需在 `320 / 375 / 390 / 414 / 430 / 480px` 六档验证，不能只验证设计稿宽度。
8. 所有列表标题和摘要定义行数限制及溢出策略；长邮箱、长单位名允许换行。
9. 所有异步操作提供加载、失败和重试；提交按钮防重复点击。
10. 所有导航、按钮、Tab、复选框、上传控件达到 H5 默认 48px 最小热区。
11. 使用统一 SVG 图标库；不使用 emoji 代替产品图标。
12. 页面截图验收只能用于比对，不能作为页面实现层。
13. H5 必须使用 `viewport-fit=cover`、`100dvh`、安全区变量与 `-webkit-text-size-adjust: 100%`；禁止关闭页面缩放。
14. 字号和行高使用生成 Token 的 `rem` 值；布局、边距、圆角和图标继续使用 CSS 逻辑 `px`。
15. 任何固定高度控件都必须在 200% 文本缩放下验证；内容溢出时允许组件增高，不得缩小字体解决。
16. 只实现 `light-only` 浅色主题；不得生成未经规范定义的局部深色模式。
17. 日期、时间、数量和文案必须通过统一格式化/本地化层输出，默认 `zh-CN + Asia/Shanghai`，不得在组件内手拼字符串。
18. 核心流程必须在 Safari 15.4+、Chromium 108+ 和目标微信稳定版中可用；新 Web 能力只作渐进增强。
19. 页面必须满足 `meta.performanceBudget`；超出预算时 AI 必须报告具体指标，不得以“资源较多”笼统放行。
20. 组件规范中的局部数值必须引用 `component.*` Token；JSON 尚未定义时先补 Token 和测试，不得直接硬编码。
21. 不得把 `text.primary`、`text.brand` 或 `brand.*` 直接当作新标题色；必须按 AppBar/通用、品牌/Hero、章节/强调、反白或状态五种语义映射。

### 10.1 Token 接入

CSS 必须直接引入生成文件：

```css
@import "./design-system/tokens/design-tokens.css";

.app-bar__title,
.card__title {
  color: var(--color-title-primary);
}

.hero__title {
  color: var(--color-title-brand);
}

.section-header__title {
  color: var(--color-title-emphasis);
}

.primary-button {
  min-height: var(--size-control-lg);
  color: var(--color-text-inverse);
  background: var(--gradient-brand);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-button);
}
```

TypeScript 必须从生成模块导入：

```ts
import { designTokens } from './design-system/tokens/design-tokens';

const minimumTouchTarget = designTokens.size.touchTarget;
```

更新 Token 的唯一流程：

```bash
node design-system/tokens/build-tokens.mjs
node --test tests/design-tokens.test.mjs
```

不得直接编辑生成的 CSS 和 TypeScript 文件。

### 10.2 组件选择矩阵

| 业务情境 | 必须使用 | 禁止使用 |
|---|---|---|
| 首页品牌首屏 | `HomeBrandHero` | 固定 `16:9` 媒体裁切 |
| 议程详情头图 | `MediaHero` | `EventSummaryBanner` |
| 报名页大会摘要 | `EventSummaryBanner` | `MediaHero` |
| 我的报名资料头 | `ProfileBackdrop + ProfileHeader` | 普通媒体 Hero |
| 首页嘉宾 | `GuestCard.standard` 三列 | 四列紧凑卡 |
| 详情页嘉宾 | `GuestCard.compact` 四列及断点降级 | `4:5` 图片 |
| 报名身份 | `IdentityTile.compact` | comfortable 自由列数 |
| 长身份名称 | `IdentityTile.comfortable` | 四列强塞 |
| 资讯分类 | `Tab.underline` | 分段控制器 |
| 消息范围 | `Tab.segmented` | 下划线频道 Tab |
| 只读报名信息 | `InfoRow.compact` | 默认 56px 行高 |
| 含说明/操作的信息 | `InfoRow.default` 或 `ActionRow` | 紧凑只读行 |
| 普通详情主操作 | `Action.flow` | 重复固定按钮 |
| 长页持续主操作 | `Action.sticky + BottomActionBar` | 同文案流内按钮 |

### 10.3 组件接口最低要求

```ts
export type CardVariant = 'elevated' | 'compact' | 'hero' | 'outlined' | 'glass';
export type HeroVariant = 'home-brand' | 'media' | 'event-summary' | 'profile-backdrop';
export type GuestVariant = 'standard' | 'compact';
export type IdentityTileVariant = 'compact' | 'comfortable';
export type TabVariant = 'underline' | 'segmented';
export type InfoRowDensity = 'compact' | 'default';
export type ActionPlacement = 'flow' | 'sticky';
export type FeedbackVariant = 'loading' | 'empty' | 'error' | 'offline' | 'end';
export type ThemeMode = 'light';
export type SupportedLocale = 'zh-CN';

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export interface DialogProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  destructive?: boolean;
  closeOnEscape?: boolean; // 默认 true
  onClose: () => void;
}

export interface BottomSheetProps {
  open: boolean;
  titleId: string;
  dismissible?: boolean; // 默认 true；阻断流程必须显式设为 false
  onClose: () => void;
}

export interface ToastMessage {
  id: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  message: string;
  actionLabel?: string;
  durationMs?: number; // 普通默认 3000，有操作时默认 5000
}

export interface SelectionControlProps extends InteractiveProps {
  name: string;
  checked: boolean;
  required?: boolean;
  errorId?: string;
}

export interface AvatarProps {
  src?: string;
  alt: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

export interface TabBarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  current: boolean;
}
```

- 组件变体必须通过显式属性选择，不允许根据页面路径隐式猜测。
- 默认值必须在组件文档中声明；没有默认值的关键变体必须由调用方显式传入。
- 有可见文字的控件优先使用文字作为可访问名称；只有图标按钮或可见文字不足时才传 `ariaLabel/ariaLabelledBy`，不得用重复 `aria-label` 覆盖更准确的可见文案。
- 加载、错误、禁用、选中和已读状态必须来自数据属性或组件状态，不能通过选择器猜测文本内容。
- Dialog 与 BottomSheet 必须由统一 Overlay 管理器处理焦点、滚动锁定、返回键和层级，页面不得重复实现。
- Toast 必须通过全局队列呈现；队列策略、持续时间和 `aria-live` 级别不得由业务页面临时决定。

### 10.4 AI 输出自检

AI 完成页面后必须回答并验证：

1. 使用了哪些命名组件变体，选择依据是什么？
2. 是否存在 JSON Token 之外的颜色、尺寸、阴影或层级？
3. `320 / 390 / 430 / 480px` 以及 200% 文本缩放下是否出现溢出、遮挡或不可读文字？
4. 是否所有可变文字、标签、按钮和状态均为真实 DOM？
5. 是否存在整页截图背景、隐藏 DOM、`opacity: 0` 替换或不可交互的视觉伪实现？
6. 是否通过 Token、可访问性、组件状态和截图对比验证？
7. Safari 15.4、Chromium 108 与目标微信内核的核心流程是否可用，降级结果是什么？
8. 是否满足 LCP/INP/CLS 与首路由资源预算，证据文件在哪里？
9. 默认语言、时区、长文案和 1.4× 英文长度压力测试是否通过？
10. 本次实现新增了哪些 `component.*` Token；是否仍存在孤立组件数值？

---

## 11. 交付验收清单

### 视觉一致性

- [ ] 页面使用的关键数值可追溯为 `OBSERVED / INFERRED / NORMALIZED / PRODUCTION`。
- [ ] 页面背景、卡片、主按钮均调用 token，无页面自定义相近色。
- [ ] 所有标题均映射到 `color.title.*` 或明确的 `color.state.*Text`，没有使用原子 `brand.*` 或正文 `text.*` 代替标题语义。
- [ ] AppBar 标题、返回按钮和页边距在所有二级页一致。
- [ ] 等价卡片的圆角、内边距、阴影一致。
- [ ] 同类状态使用同一套颜色、文字和图标。
- [ ] 线性功能图标与 3D 展示图标没有混用职责。
- [ ] Hero、嘉宾、身份选择和信息行使用了选择矩阵规定的命名变体。

### 响应式

- [ ] `320 / 375 / 390 / 414 / 430 / 480px` 均无横向溢出。
- [ ] 320px 下表单可转为上下布局，场馆卡可转为上下布局。
- [ ] 长标题、长单位名、邮箱、地点、嘉宾职位已验证换行。
- [ ] 固定底栏未遮挡最后一项内容，全面屏安全区正确。

### 交互与状态

- [ ] 按钮、Tab、列表、表单、上传均具备加载/错误/禁用状态。
- [ ] 报名与议程状态可以随数据变化，不是图片中的静态文字。
- [ ] 已读/未读、通过/失败、提醒/重要不只靠颜色表达。
- [ ] 第三方导航失败时可复制地址。

### 工程质量

- [ ] `design-tokens.json` 是唯一 Token 值来源，CSS/TypeScript 均由脚本生成且漂移检查通过。
- [ ] 文字、按钮和数据均为真实 DOM。
- [ ] 图片使用合适比例、响应式尺寸与懒加载。
- [ ] H5 独立交互热区默认不小于 48px；原生 iOS 兼容例外有明确记录。
- [ ] 字体放大和减少动态效果设置可正常工作。
- [ ] 页面没有使用 `user-scalable=no` 或 `maximum-scale=1` 禁止缩放，根字号和文本缩放未被覆盖。
- [ ] Dialog、BottomSheet、Toast、Radio、Switch 和可选 TabBar 均按命名组件实现，不存在页面级临时弹层。
- [ ] 通过浏览器截图进行逐页比对，但页面实现不包含截图替换层。
- [ ] 文档和代码不存在未完成占位词、未命名变体或让 AI 自由二选一的关键规则。

### 验证工件

生产发布前必须生成可复核工件；口头确认、“本机看起来正常”或单张设计稿对比不能替代证据。

| 工件 | 最低内容 | 建议存放位置 |
|---|---|---|
| 真实组件样例页 | 本文全部基础组件、业务组件、变体和关键状态；不得用截图代替 DOM | `design-system/qa/component-gallery/` |
| 响应式截图 | `320 / 375 / 390 / 414 / 430 / 480px`，普通与最长文案 | `design-system/qa/screenshots/` |
| 文本缩放证据 | 100% 与 200% 对比，覆盖表单、Tab、弹层、底栏和四列组件 | `design-system/qa/text-scale/` |
| 无障碍报告 | 自动扫描结果、键盘路径、焦点顺序、读屏抽查和人工剩余项 | `design-system/qa/accessibility/` |
| 浏览器矩阵 | 设备、系统、浏览器/微信版本、内核、通过项、缺陷与降级结果 | `design-system/qa/browser-matrix.md` |
| 性能报告 | Lighthouse/实验室结果、资源体积，以及上线后的真实用户 p75 | `design-system/qa/performance/` |
| 视觉差异报告 | 设计稿、真实 DOM 截图、可解释差异和审批结果 | `design-system/qa/visual-diff/` |

- 组件样例页必须覆盖默认、按下、焦点、禁用以及该组件真实具备的业务状态；不得为不适用状态制造伪样例。
- 自动化无障碍扫描不得存在 Critical/Serious 未处理项；自动化通过不代表人工键盘和读屏验收可以省略。
- 截图回归必须来自真实浏览器 DOM，并在同一视口、字体和设备像素比下对比；禁止截图替换层。
- 200% 文本缩放和最长文案必须作为独立用例，不得只通过改变浏览器视口间接模拟。
- 真机矩阵至少覆盖一台最低 iOS 基线、一台当前 iOS、一台 Android 当前主流设备，以及 iOS/Android 微信内 H5。
- 性能预算在 CI 中使用实验室数据阻断明显回归；上线后用真实用户数据复核 p75，连续两个统计周期超标必须创建治理任务。

### 发布门槛

- [ ] Token 测试退出码为 0，对比度检查无失败。
- [ ] `npm run test:design-system` 与项目完整 `npm test` 均退出码为 0，不以“与本次改动无关”放行主分支红测。
- [ ] Markdown 可完整渲染，表格和代码块无断裂。
- [ ] 七张截图中的核心模式均能映射到明确组件或页面模板。
- [ ] 原始设计稿未提供的值均明确标注为推测或生产统一值。
- [ ] 浏览器矩阵、200% 文本缩放、键盘/读屏、性能预算和真实 DOM 视觉差异均有同版本、带时间戳的验证工件。
- [ ] 控制台无未处理错误，核心接口/图片/字体无 4xx/5xx，离线与失败路径均可恢复。
- [ ] 浅色主题、默认语言和时区与 `design-tokens.json.meta` 一致，不存在页面级例外。
- [ ] 所有规范中的组件局部数值均能追溯到 `component.*` 或基础 Token；无孤立硬编码。
- [ ] 设计负责人和前端负责人共同确认本版本后，版本号才可从生产基线升级为冻结版。
