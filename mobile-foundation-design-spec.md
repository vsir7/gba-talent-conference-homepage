# 互联网大厂移动端基础设计规范（不含色彩）

> 版本：1.0.0  
> 状态：Production Baseline  
> 调研日期：2026-08-18  
> 适用范围：iOS、Android、HarmonyOS、H5、Hybrid、微信小程序及其他移动端小程序  
> 明确排除：品牌色、功能色、中性色、文字颜色、背景色、边框颜色、渐变与深色模式配色

---

## 0. 使用说明

本文件不是对某一家厂商规范的照搬，而是基于 Apple Human Interface Guidelines、Google Material 3 / Android、HarmonyOS Design、Ant Design Mobile、腾讯 TDesign Mobile 与 W3C WCAG 的官方资料，整理出的跨平台生产级基础规范。

规范按三层组织：

1. **官方事实**：厂商明确公布的标准，用于解释来源与平台差异。
2. **统一规范**：本文件解决冲突后的默认设计值，是后续设计与开发的执行基线。
3. **平台映射**：当系统原生组件已有成熟规范时，保留平台原生行为，不为了视觉一致强制覆盖。

使用优先级：

1. 无障碍和系统行为要求；
2. 本文件中的语义 Token；
3. 平台原生组件规范；
4. 业务组件局部规则；
5. 单个页面的特殊值。

禁止页面随意新增字号、间距、圆角、控件高度和图标尺寸。确需新增时，必须先进入 Token 层并记录使用场景。

---

## 1. 官方规范调研结论

### 1.1 对比摘要

| 体系 | 官方规范中的重点 | 可直接借鉴 | 不直接照搬的部分 |
|---|---|---|---|
| Apple HIG | iOS 系统字体为 SF Pro；默认正文 17pt；推荐语义化 Text Styles；支持 Dynamic Type；按钮命中区域至少 44×44pt | 系统字体优先、动态字号、语义文字样式、44pt 最小触控区 | iOS 的 pt 数值不能直接当 Android dp/sp 或 H5 px 使用 |
| Google Material 3 / Android | 15 个语义文字角色；正文常用 16sp/24sp；字体使用 sp；布局以 8dp 网格为主、细部以 4dp 对齐；触控目标至少 48×48dp | 语义化排版、4/8 网格、48dp 触控区、响应式布局 | 57sp 等大号 Display 更适合品牌展示，不适合一般业务页面 |
| HarmonyOS Design | 提供 HarmonyOS Sans；支持可变字重与多语言排版；强调多设备适配与统一组件资源 | 中文字体栈、多语言、连续字重、跨设备适配 | 不在非鸿蒙平台强制下载或嵌入 HarmonyOS Sans |
| Ant Design Mobile | 使用 CSS Variables；源码内置 9–18px 字号阶梯、默认主字号 13px；圆角基础值为 4/8/12px；采用系统字体回退栈 | Token 化、系统字体栈、组件变量化、紧凑业务界面经验 | 9/10px 不满足本规范的常规可读性要求；13px 不作为长正文默认值 |
| 腾讯 TDesign Mobile | 用 Design Token 统一多技术栈；覆盖移动 Web、小程序、Flutter 等；组件 API 与视觉保持跨框架一致 | 跨端 Token、组件状态统一、技术栈解耦 | 不把某个框架的实现尺寸视为所有终端的物理尺寸 |
| W3C WCAG 2.2 | 文本应支持放大至 200% 且不丢失内容或功能；文本间距修改后不应破版；AA 级目标尺寸最低 24×24 CSS px（含例外） | 200% 字号测试、重排测试、无障碍验收 | 24px 是合规底线，不是移动产品的推荐触控尺寸；本规范采用更严格的 44/48 标准 |

### 1.2 冲突处理结论

#### 正文字号

- Apple 默认正文：17pt。
- Material 3 `bodyLarge`：16sp / 24sp。
- Ant Design Mobile 当前源码默认主字号：13px。
- **统一结论**：H5、小程序和自绘跨端界面默认正文使用 **16px / 24px**；iOS 原生界面映射系统 `Body`（默认 17pt）；13–14px 仅用于辅助内容，不用于长篇主要正文。

#### 最小字号

- Apple 对 iOS/iPadOS 给出的最低建议为 11pt。
- Ant Design Mobile 存在 9px、10px 的内部字号 Token。
- **统一结论**：生产界面绝对下限为 **11px/pt/sp**，且只允许用于低频、非关键、短文本；普通说明文字不得小于 12，主要信息不得小于 14。

#### 触控目标

- Apple：至少 44×44pt。
- Android / Material：至少 48×48dp。
- WCAG 2.2 AA：最低 24×24 CSS px，存在间距等例外。
- **统一结论**：自绘跨端组件默认使用 **48×48** 命中区；iOS 原生组件不得低于 44×44pt。视觉图标可以更小，但实际命中区不能缩小。

#### 间距网格

- Android 官方强调 8dp 网格，图标和细部使用 4dp 网格。
- 国内移动组件库普遍存在 4、8、12、16 等连续档位。
- **统一结论**：采用 **4 为原子单位、8 为主节奏** 的双层网格。

---

## 2. 单位与坐标体系

### 2.1 各平台单位

| 平台 | 尺寸单位 | 字体单位 | 规则 |
|---|---|---|---|
| iOS / iPadOS | pt | pt + Dynamic Type | 使用系统 Text Style，不锁死无障碍字号 |
| Android | dp | sp | 字体必须使用 sp，不得用 dp 代替 |
| HarmonyOS | vp | fp | 字体使用可随系统设置缩放的单位 |
| H5 / Hybrid | CSS px、rem | rem 优先 | 根字号保持用户可缩放；不得禁用页面缩放 |
| 微信小程序 | rpx 或 px | rpx/px 按框架能力 | 设计基准与实际触控尺寸分开；适配极窄屏 |

### 2.2 设计稿基准

- 推荐移动设计画板宽度：390。
- 必须同时检查：320、360、375、390、414、430 宽度。
- 长页面高度不作为布局依据，页面必须自然滚动。
- 设计稿中的 1 个逻辑单位只用于表达相对尺寸，不等于 1 个物理像素。
- 刘海、状态栏、底部 Home Indicator、圆角屏、折叠屏等区域由安全区处理，不写死设备型号高度。

### 2.3 H5 基础设置

```css
html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  text-rendering: optimizeLegibility;
}

*, *::before, *::after {
  box-sizing: border-box;
}
```

禁止设置 `user-scalable=no` 或 `maximum-scale=1`。

---

## 3. 字体规范

### 3.1 字体家族

默认使用系统字体，减少字体下载、首屏闪动、字形缺失和跨平台基线偏差。

```css
--font-family-sans: -apple-system, BlinkMacSystemFont,
  "SF Pro Text", "SF Pro Display",
  "PingFang SC", "HarmonyOS Sans SC",
  "Noto Sans CJK SC", "Noto Sans SC",
  "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;

--font-family-mono: ui-monospace, "SFMono-Regular", Menlo,
  Monaco, Consolas, "Liberation Mono", monospace;
```

规则：

- 中文界面优先由操作系统选择苹方、HarmonyOS Sans、Noto Sans CJK 等可用字体。
- 不直接将 SF Pro 或系统字体文件打包进应用；原生端通过系统 API 调用。
- 品牌字体只允许用于短标题、海报或品牌展示，不替代正文系统字体。
- 字体缺失时必须有完整 fallback，不允许只写单一中文字体。
- 金额、倒计时、数据表格可启用等宽数字：`font-variant-numeric: tabular-nums`。

### 3.2 字重

| Token | 数值 | 用途 |
|---|---:|---|
| `font.weight.regular` | 400 | 正文、说明、输入内容 |
| `font.weight.medium` | 500 | 标签、次级操作、列表标题 |
| `font.weight.semibold` | 600 | 页面标题、区块标题、主要按钮 |
| `font.weight.bold` | 700 | 强调数字、极少量一级标题 |

约束：

- 普通移动界面只使用 400/500/600/700 四档。
- 不使用 100/200/300 的细字重承载信息。
- 800/900 只允许在营销视觉中使用，不进入基础组件。
- 同一行文字最多出现两档字重。
- 中文正文加粗优先使用 500 或 600，避免大面积 700 造成字面拥挤。
- 字重不可用时，允许由系统选择最接近档位，但不得通过描边模拟粗体。

### 3.3 统一语义字号表

以下数值是 H5、小程序、自绘跨端界面的默认基线；原生应用按第 3.4 节映射。

| 语义 Token | 字号 / 行高 | 字重 | 典型用途 | 使用限制 |
|---|---:|---:|---|---|
| `display.lg` | 32 / 40 | 700 | 活动主题、关键结果、短数字 | 每屏最多 1 处；不用于长标题 |
| `heading.page` | 24 / 32 | 700 | 页面大标题、沉浸式页面标题 | 普通导航栏标题不用此档 |
| `heading.section` | 20 / 28 | 600 | 一级区块标题、导航栏标题 | 1–2 行 |
| `heading.card` | 18 / 26 | 600 | 卡片标题、二级区块标题 | 建议不超过 2 行 |
| `title.item` | 16 / 24 | 600 | 列表标题、表单分组标题 | 与正文用字重区分 |
| `body.lg` | 17 / 26 | 400 | 文章导语、高可读正文 | 内容阅读型页面优先 |
| `body.md` | 16 / 24 | 400 | 默认正文、输入内容 | 全局正文基线 |
| `body.sm` | 14 / 22 | 400 | 次级说明、卡片摘要 | 不用于长篇主要正文 |
| `label.lg` | 16 / 22 | 500/600 | 大按钮、关键标签 | 单行短文本 |
| `label.md` | 14 / 20 | 500 | 标签页、筛选、普通按钮 | 单行短文本 |
| `label.sm` | 13 / 18 | 500 | 小标签、状态胶囊 | 不超过 8 个汉字为宜 |
| `caption` | 12 / 18 | 400 | 时间、来源、辅助说明 | 不承载关键操作或关键结果 |
| `micro` | 11 / 16 | 400/500 | 极短角标、图表刻度、法律脚注 | 绝对下限；禁止长文 |
| `number.lg` | 28 / 36 | 600/700 | 金额、倒计时、核心指标 | 使用等宽数字 |

### 3.4 原生平台映射

| 统一语义 | iOS 建议 | Android / Material 3 建议 | HarmonyOS 建议 |
|---|---|---|---|
| 默认正文 | 系统 `Body`，默认 17pt | `bodyLarge`，16sp/24sp | 系统正文语义样式，使用 fp |
| 次级正文 | `Subheadline` / `Footnote` | `bodyMedium` / `bodySmall` | 系统次级正文语义样式 |
| 页面标题 | `Title 1`–`Title 3`，按层级选择 | `headlineSmall` / `titleLarge` | 系统标题语义样式 |
| 卡片标题 | `Headline` | `titleMedium` | 系统强调标题语义样式 |
| 按钮标签 | `Headline` 或控件默认字体 | `labelLarge` | 系统控件标签样式 |

原生组件优先使用系统语义样式，不为追求 H5 的逐像素一致而关闭 Dynamic Type、字体缩放或平台字距。

### 3.5 行高

- 中文正文目标行高为字号的 1.45–1.60 倍。
- 标题目标行高为字号的 1.25–1.45 倍。
- 单行按钮和标签可使用固定容器居中，但文字行高仍需明确设置。
- 三行及以上正文不得使用紧缩行高。
- 行高应以无裁切、无上下碰撞为第一优先级，不使用 `line-height: 1` 承载中文正文。

### 3.6 字距与段落

- 中文正文默认 `letter-spacing: normal`。
- 不对中文正文普遍添加正字距。
- 大号标题可在实机测试后使用轻微负字距，但不得导致字形粘连。
- 英文全大写短标签可适当增加字距；中文标签不跟随此规则。
- 普通正文段后距建议为 8–12。
- 阅读型长文段后距建议为 16。
- 数字、日期、时间、金额不得因自动换行破坏语义；必要时使用不换行容器。

### 3.7 文本长度与截断

- 页面标题：优先单行；极端长度允许两行，不以缩小字号解决。
- 卡片标题：默认最多两行。
- 摘要：默认最多两至三行。
- 按钮、标签页、筛选项：单行；文案超长时调整布局或改写文案。
- 用户输入、姓名、机构名、地址等不可控内容不能永久截断，必须提供查看完整内容的方式。
- 省略号必须使用单字符 `…`，不使用三个句点代替。

---

## 4. 间距与布局

### 4.1 原子间距

以 4 为最小原子单位，以 8 为主要视觉节奏。

| Token | 值 | 用途 |
|---|---:|---|
| `space.0` | 0 | 无间距 |
| `space.1` | 4 | 图标内部、极小间隔 |
| `space.2` | 8 | 紧凑元素、标签组 |
| `space.3` | 12 | 标题与正文、卡片内部小间隔 |
| `space.4` | 16 | 默认页面边距、卡片内边距 |
| `space.5` | 20 | 宽屏页面边距、区块内部 |
| `space.6` | 24 | 区块间距、弹窗内边距 |
| `space.8` | 32 | 大区块间隔 |
| `space.10` | 40 | 页面章节间隔 |
| `space.12` | 48 | 强分区间隔 |
| `space.16` | 64 | 沉浸式留白 |

禁止使用 5、7、9、11、13、15、17 等无明确原因的间距值。1 和 2 仅用于发丝线、光学校正或图标描边，不进入常规布局间距。

### 4.2 页面边距

| 视口宽度 | 页面左右边距 | 说明 |
|---:|---:|---|
| 320–359 | 12–16 | 优先保证内容与触控区完整 |
| 360–413 | 16 | 默认移动端基线 |
| 414–599 | 20 | 宽手机和小型折叠屏外屏 |
| 600 及以上 | 24–32 + 内容最大宽度 | 平板和展开态进入响应式布局 |

- 页面边距必须与导航栏、卡片、列表的主对齐线一致。
- 卡片内边距默认 16；信息密集型卡片可用 12；弹窗默认 24。
- 同级卡片垂直间距默认 12 或 16。
- 区块标题与区块内容间距默认 12。
- 底部固定操作区需叠加安全区：`env(safe-area-inset-bottom)`。

### 4.3 响应式原则

- 320 宽视口下不得出现页面级横向滚动。
- 文字放大 200% 时允许组件增高和内容换行，不允许裁切关键内容。
- 两列或多列卡片在窄屏下应降为单列或横向可控滚动。
- 固定宽度只用于图标、头像、缩略图等原子元素；文本容器使用弹性宽度。
- 表格在手机端应转为卡片、键值列表或受控横向滚动，不压缩成不可读小字。

---

## 5. 圆角、边框与形状

### 5.1 圆角 Token

| Token | 值 | 用途 |
|---|---:|---|
| `radius.xs` | 4 | 小标签、缩略图、紧凑控件 |
| `radius.sm` | 8 | 输入框、小卡片、普通按钮 |
| `radius.md` | 12 | 默认卡片、弹窗内部模块 |
| `radius.lg` | 16 | 大卡片、底部面板、重点容器 |
| `radius.xl` | 20 | 沉浸式大容器 |
| `radius.full` | 999 | 胶囊按钮、圆形头像、状态标签 |

规则：

- 同一组件只使用一个主圆角，不混用多个近似值。
- 内层圆角一般小于外层圆角 4。
- 圆形元素使用 `50%`；胶囊形使用 `radius.full`。
- 不以超大圆角掩盖间距和层级问题。

### 5.2 边框

- 标准边框：1 个逻辑单位。
- 发丝分隔线：使用平台 hairline 方案，不写死为物理 1px。
- 2 个逻辑单位仅用于选中、聚焦或强边界状态。
- 边框样式和宽度属于本规范；具体颜色由独立色彩规范定义。

---

## 6. 图标与图形元素

### 6.1 图标尺寸

| Token | 值 | 用途 |
|---|---:|---|
| `icon.xs` | 16 | 标签、辅助信息 |
| `icon.sm` | 20 | 输入框、列表辅助操作 |
| `icon.md` | 24 | 默认导航和功能图标 |
| `icon.lg` | 32 | 空状态、重点入口 |
| `icon.xl` | 48 | 结果页、功能引导 |

### 6.2 图标规则

- 常规功能图标使用 24 视觉尺寸，放入 44 或 48 的命中容器。
- 同一层级图标保持统一画布、描边粗细、端点风格和视觉重量。
- 20–24 的线性图标建议以约 1.5–2 的描边为起点，再做光学修正。
- 图标与文字间距默认 8；紧凑标签可用 4。
- 纯图标按钮必须有可访问名称，如 `aria-label` 或原生无障碍描述。
- 不以图片内嵌文字替代真实文本。
- 方向性图标必须适配 RTL 语言；品牌 Logo 不镜像。

---

## 7. 触控与控件尺寸

### 7.1 命中区域

| 场景 | 视觉尺寸 | 最小命中区域 |
|---|---:|---:|
| 图标按钮 | 20–24 | 44×44；跨端默认 48×48 |
| 复选框/单选框 | 20–24 | 44×44；Android 48×48 |
| 小标签关闭按钮 | 12–16 | 44×44 或由整个标签承接点击 |
| 列表行 | 内容自适应 | 高度至少 48，默认 56 |
| 主要按钮 | 容器高度 48 | 与视觉区域一致 |

相邻独立触控目标之间建议至少保留 8 的可辨识间隔。若视觉间隔不足，必须保证命中区域不重叠。

### 7.2 控件高度 Token

| Token | 高度 | 用途 |
|---|---:|---|
| `control.compact` | 36 | 极少量紧凑筛选；外部命中区仍需 ≥44 |
| `control.sm` | 40 | 小型辅助按钮；外部命中区仍需 ≥44 |
| `control.md` | 44 | iOS 常规控件、搜索框 |
| `control.lg` | 48 | 默认按钮、输入框、标签页 |
| `control.xl` | 52 | 强调按钮、大输入框 |
| `control.list` | 56 | 标准单行列表 |

生产默认使用 `control.lg`。36 和 40 不得用于主操作或高频操作。

---

## 8. 基础组件规范

### 8.1 顶部导航栏 App Bar

- 使用系统原生导航栏时遵循平台尺寸与安全区。
- 自绘 H5/小程序导航栏内容区默认高 48，另加顶部安全区。
- 页面标题使用 `heading.section` 或原生标题语义样式。
- 返回按钮视觉图标 24，命中区域至少 44×44，跨端默认 48×48。
- 左右操作区预留对称空间，标题视觉居中不等于 DOM 绝对居中。
- 标题超长时优先截断或进入大标题布局，不缩至 14 以下。

### 8.2 底部导航 Tab Bar

- 每个项目的宽度均分，整个项目可点击。
- 图标 24，标签使用 `caption` 或 `label.sm`。
- 图标与标签间距 4。
- 内容区高度建议 56；另加底部安全区。
- 常规一级导航建议 3–5 项，超过 5 项应重新组织信息架构。
- 未读角标不得遮挡图标主体，角标本身不单独承担点击。

### 8.3 标签页 Tabs / Segmented Control

- 标签栏高度默认 48。
- 标签使用 `label.md`；当前项可升至 600 字重。
- 单个标签命中区至少 44×44，默认 48 高。
- 标签过多时采用横向滚动，不压缩字号。
- 指示器与文字之间保持稳定间距，切换时不应造成布局跳动。
- 分段控制器建议 2–4 项；文案必须短且同一语法结构。

### 8.4 按钮 Button

| 类型 | 高度 | 左右内边距 | 字体 | 圆角 |
|---|---:|---:|---|---:|
| 大按钮 | 52 | 24 | `label.lg` / 600 | 12 或 full |
| 默认按钮 | 48 | 20 | `label.lg` / 600 | 8–12 |
| 中按钮 | 44 | 16 | `label.md` / 500–600 | 8 |
| 小按钮 | 36 | 12 | `label.sm` / 500 | 8 或 full |

- 页面主要操作优先使用 48 或 52 高度。
- 文本按钮也必须拥有至少 44 高命中区。
- 图标与文字间距 8；小按钮可用 4。
- 加载状态保持按钮原宽度，避免页面跳动。
- 禁用、加载、按下、聚焦等状态必须存在；状态颜色由色彩规范定义。
- 同一操作区最多一个主操作。

### 8.5 输入框 Input / Textarea

- 单行输入框高度默认 48，大型输入框 52。
- 输入内容使用 `body.md`，不得小于 16；移动 Web 使用 16 可减少 iOS 浏览器聚焦自动放大风险。
- 字段标签使用 `body.sm` 或 `label.md`。
- 辅助说明和错误说明使用 `caption`，行高 18，允许多行增高。
- 左右内边距默认 16；紧凑型可用 12。
- 前后图标 20–24，图标容器满足命中区要求。
- Textarea 最小高度 96，内容增长时优先自动增高。
- 不以 placeholder 代替字段标签。
- 错误状态不能只依赖颜色，必须包含文本或图标语义。

### 8.6 搜索框 Search

- 高度 44 或 48，默认 48。
- 搜索图标 20，输入文字 16/24。
- 左右内边距 12–16。
- 清除按钮视觉尺寸 16–20，实际命中区域至少 44。
- “取消”操作使用 14–16 字号，命中区至少 44 高。

### 8.7 列表与 Cell

| 内容结构 | 最小高度 | 建议内边距 |
|---|---:|---:|
| 单行纯文字 | 48 | 垂直 12、水平 16 |
| 单行含图标 | 56 | 垂直 12、水平 16 |
| 标题 + 副标题 | 64–72 | 垂直 12–16、水平 16 |
| 多行复杂内容 | 自适应 | 垂直 16、水平 16 |

- 标题使用 `title.item` 或 `body.md` + 500。
- 副标题使用 `body.sm`，时间和来源使用 `caption`。
- 前置图标 24，头像常用 40 或 48，缩略图常用 64–80。
- 整行可点击时，不再制造互相重叠的局部点击区。
- 右侧箭头 20–24，仅表示可进入下一级，不用于普通静态内容。

### 8.8 卡片 Card

- 默认圆角 12 或 16。
- 默认内边距 16；紧凑卡片 12；重点卡片 20–24。
- 标题与正文间距 8；正文与操作区间距 16。
- 同级卡片间距 12 或 16。
- 卡片可点击时整卡承接点击，并提供明确按下反馈。
- 不同时使用过多描边、阴影和分隔线表达同一层级。

### 8.9 复选框、单选框与开关

- 复选框/单选框视觉尺寸 20–24，默认 24。
- 标签文字使用 14–16，标签与控件间距 8–12。
- 整个“控件 + 文案”区域可点击，命中高度至少 44，跨端默认 48。
- 多选项垂直间距至少 8；复杂说明使用 12–16。
- 开关优先使用平台原生组件；自绘时建议约 52×32，且整个区域可点击。
- 开关用于即时生效，不能替代需要提交确认的复选框。

### 8.10 标签 Tag / Badge

| 类型 | 高度 | 字体 | 水平内边距 |
|---|---:|---|---:|
| 小标签 | 20 | `micro` | 6 |
| 默认标签 | 24 | `caption` / 500 | 8 |
| 可交互标签 | 28–32 | `label.sm` | 10–12 |

- 可交互标签的外部命中区必须扩展到至少 44 高。
- 标签文案尽量不超过 8 个汉字。
- 角标只展示短数字或短状态，不承载长句。

### 8.11 对话框 Dialog

- 手机端宽度：`min(320px, calc(100vw - 48px))`；极窄屏保留至少 24 页面边距。
- 圆角 16；内容内边距 24。
- 标题使用 `heading.card`，正文使用 `body.md` 或 `body.sm`。
- 标题与正文间距 12，正文与操作区间距 24。
- 按钮高度至少 48；两个并列按钮间距 8–12。
- 超过两个主要操作时改为纵向排列或操作列表。
- 内容过长时仅内容区滚动，标题和关键操作保持可见。
- 弹出后焦点进入对话框，关闭后返回触发控件。

### 8.12 底部面板 Bottom Sheet / Action Sheet

- 顶部圆角 16–20。
- 顶部拖拽指示条建议 32×4，仅作视觉提示，不单独承接点击。
- 标题区内边距 16–24，列表项高度至少 52，默认 56。
- 底部叠加安全区。
- 半屏面板需有明确关闭手段；全屏面板使用标准页面导航结构。
- 破坏性操作与普通操作应有结构分组；具体颜色另由色彩规范规定。

### 8.13 Toast / Snackbar

- 文字使用 14/20，最多 2–3 行。
- 内边距默认垂直 12、水平 16。
- 最小高度 44；包含操作时高度至少 48。
- 宽度根据内容自适应，最大不超过视口约 80%。
- 纯提示停留约 2–3 秒；需要阅读或操作的内容不得自动过快消失。
- 重要错误不能只用 Toast，必须在相关位置提供持久反馈。

### 8.14 空状态、加载与骨架屏

- 空状态图形常用 48–96，根据页面层级选择。
- 标题使用 16–18，说明使用 14–16，操作按钮高度 44–48。
- 图形、标题、说明、操作之间使用 12/8/24 的稳定节奏。
- 骨架屏应匹配真实内容结构，不用一整块占位代替复杂页面。
- 加载超过约 1 秒应提供可感知反馈；超过约 10 秒应补充进度或解释。

### 8.15 头像与缩略图

| Token | 尺寸 | 用途 |
|---|---:|---|
| `avatar.xs` | 24 | 标签、评论附属信息 |
| `avatar.sm` | 32 | 紧凑列表 |
| `avatar.md` | 40 | 默认列表 |
| `avatar.lg` | 48 | 重点列表、个人信息 |
| `avatar.xl` | 64 | 个人主页、结果页 |

- 头像使用圆形；机构 Logo 可使用 8–12 圆角方形。
- 图片必须定义固定宽高或比例，防止加载前后布局跳动。
- 缩略图采用一致比例；常用 1:1、4:3、3:2、16:9。

---

## 9. 动效基础 Token

本节只规定通用节奏，不规定色彩和材质。

| Token | 时长 | 用途 |
|---|---:|---|
| `motion.instant` | 100ms | 按下反馈、细微状态变化 |
| `motion.fast` | 160ms | 小元素进入退出 |
| `motion.normal` | 240ms | 页面内组件切换 |
| `motion.slow` | 320ms | 面板、弹窗、页面级过渡 |
| `motion.emphasis` | 400ms | 少量重点引导 |

建议缓动：

```css
--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
--motion-ease-enter: cubic-bezier(0, 0, 0, 1);
--motion-ease-exit: cubic-bezier(0.3, 0, 1, 1);
```

- 支持系统“减少动态效果”设置。
- 不使用动效阻塞操作。
- 列表大量元素不得逐个长时间错峰进入。

---

## 10. 无障碍与内容适应

### 10.1 必须满足

- H5 文本可放大至 200%，无内容或功能丢失。
- iOS 支持 Dynamic Type；Android 使用 sp；HarmonyOS 使用可缩放字体单位。
- 320 CSS px 宽度下内容可重排，不出现页面级双向滚动。
- 所有可交互元素具有可访问名称、角色、状态和可预测的焦点顺序。
- 纯图标操作提供文本替代。
- 错误、成功、警告和选中状态不能只依赖颜色表达。
- 动态消息通过适当的原生语义或 `aria-live` 通知辅助技术。
- 键盘弹出后，当前字段与错误说明不能被底部操作区遮挡。

### 10.2 文本放大时的组件行为

- 固定高度容器改为 `min-height`。
- 按钮允许增高，但主要按钮文字通常不超过两行。
- 标签页文案过长时允许滚动或调整信息架构，不缩小至 12 以下。
- 卡片、列表、表单项随内容增高。
- 图标与文本共同表达含义时，重要图标随字号等级适当放大。
- 不在主要信息上使用不可关闭的多行截断。

### 10.3 色彩相关边界

本文件不定义任何颜色值。文本可读性、边界对比度、状态对比度、深色模式和高对比度模式，必须在独立色彩规范和无障碍验收中完成。

---

## 11. Design Token 标准

### 11.1 命名层级

采用三层 Token：

1. **Primitive**：原始值，如 `font.size.16`、`space.4`、`radius.12`。
2. **Semantic**：语义角色，如 `typography.body.md`、`size.control.lg`。
3. **Component**：组件引用，如 `button.height.default`、`input.padding.inline`。

组件代码优先引用 Semantic 或 Component Token，不直接散落原始数值。

### 11.2 CSS Token 基线

```css
:root {
  /* Font family */
  --font-family-sans: -apple-system, BlinkMacSystemFont,
    "SF Pro Text", "SF Pro Display", "PingFang SC",
    "HarmonyOS Sans SC", "Noto Sans CJK SC", "Noto Sans SC",
    "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: ui-monospace, "SFMono-Regular", Menlo,
    Monaco, Consolas, "Liberation Mono", monospace;

  /* Font weight */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Semantic font size */
  --font-size-display-lg: 2rem;       /* 32 */
  --font-size-heading-page: 1.5rem;   /* 24 */
  --font-size-heading-section: 1.25rem; /* 20 */
  --font-size-heading-card: 1.125rem; /* 18 */
  --font-size-title-item: 1rem;       /* 16 */
  --font-size-body-lg: 1.0625rem;     /* 17 */
  --font-size-body-md: 1rem;          /* 16 */
  --font-size-body-sm: 0.875rem;      /* 14 */
  --font-size-label-lg: 1rem;         /* 16 */
  --font-size-label-md: 0.875rem;     /* 14 */
  --font-size-label-sm: 0.8125rem;    /* 13 */
  --font-size-caption: 0.75rem;       /* 12 */
  --font-size-micro: 0.6875rem;       /* 11 */
  --font-size-number-lg: 1.75rem;     /* 28 */

  /* Semantic line height */
  --line-height-display-lg: 2.5rem;      /* 40 */
  --line-height-heading-page: 2rem;      /* 32 */
  --line-height-heading-section: 1.75rem; /* 28 */
  --line-height-heading-card: 1.625rem;  /* 26 */
  --line-height-title-item: 1.5rem;      /* 24 */
  --line-height-body-lg: 1.625rem;       /* 26 */
  --line-height-body-md: 1.5rem;         /* 24 */
  --line-height-body-sm: 1.375rem;       /* 22 */
  --line-height-label-lg: 1.375rem;      /* 22 */
  --line-height-label-md: 1.25rem;       /* 20 */
  --line-height-label-sm: 1.125rem;      /* 18 */
  --line-height-caption: 1.125rem;       /* 18 */
  --line-height-micro: 1rem;             /* 16 */
  --line-height-number-lg: 2.25rem;      /* 36 */

  /* Spacing */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4 */
  --space-2: 0.5rem;   /* 8 */
  --space-3: 0.75rem;  /* 12 */
  --space-4: 1rem;     /* 16 */
  --space-5: 1.25rem;  /* 20 */
  --space-6: 1.5rem;   /* 24 */
  --space-8: 2rem;     /* 32 */
  --space-10: 2.5rem;  /* 40 */
  --space-12: 3rem;    /* 48 */
  --space-16: 4rem;    /* 64 */

  /* Radius */
  --radius-xs: 0.25rem; /* 4 */
  --radius-sm: 0.5rem;  /* 8 */
  --radius-md: 0.75rem; /* 12 */
  --radius-lg: 1rem;    /* 16 */
  --radius-xl: 1.25rem; /* 20 */
  --radius-full: 999rem;

  /* Control size */
  --control-height-compact: 2.25rem; /* 36 */
  --control-height-sm: 2.5rem;       /* 40 */
  --control-height-md: 2.75rem;      /* 44 */
  --control-height-lg: 3rem;         /* 48 */
  --control-height-xl: 3.25rem;      /* 52 */
  --control-height-list: 3.5rem;     /* 56 */
  --touch-target-min: 3rem;          /* 48 */

  /* Icon */
  --icon-size-xs: 1rem;    /* 16 */
  --icon-size-sm: 1.25rem; /* 20 */
  --icon-size-md: 1.5rem;  /* 24 */
  --icon-size-lg: 2rem;    /* 32 */
  --icon-size-xl: 3rem;    /* 48 */

  /* Layout */
  --page-gutter-compact: 0.75rem; /* 12 */
  --page-gutter: 1rem;            /* 16 */
  --page-gutter-wide: 1.25rem;    /* 20 */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);

  /* Motion */
  --motion-duration-instant: 100ms;
  --motion-duration-fast: 160ms;
  --motion-duration-normal: 240ms;
  --motion-duration-slow: 320ms;
  --motion-duration-emphasis: 400ms;
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-enter: cubic-bezier(0, 0, 0, 1);
  --motion-ease-exit: cubic-bezier(0.3, 0, 1, 1);
}
```

注意：本 Token 代码有意不包含任何颜色、阴影颜色或渐变 Token。

### 11.3 Token 版本管理

- Token 采用语义化版本号。
- 新增 Token：次版本升级。
- 修改含义但保持兼容：次版本升级并提供迁移说明。
- 删除、重命名或改变核心数值导致视觉破坏：主版本升级。
- 废弃 Token 至少保留一个次版本，并标注替代项。

---

## 12. AI 设计与前端开发约束

将本节直接提供给生成 UI 或开发页面的 AI：

1. 只使用本规范定义的字体、字号、字重、行高、间距、圆角、控件高度和图标尺寸。
2. 不生成任何新的颜色 Token；配色由项目独立色彩规范提供。
3. 默认正文为 16/24、400；辅助正文为 14/22；12/18 只用于辅助说明；11/16 仅作极短非关键信息。
4. 不使用 9px、10px 文字，不使用 300 及以下细字重。
5. 主要按钮和输入框默认高 48，图标按钮命中区域默认 48×48。
6. 布局使用 4 的原子网格和 8 的主节奏，不引入任意间距值。
7. 页面左右边距默认 16；卡片内边距默认 16；同级卡片间距 12 或 16。
8. 普通图标使用 24，辅助图标使用 20，图标与文字间距默认 8。
9. 所有文本容器允许换行和增高；不得用固定高度裁切动态内容。
10. 支持顶部和底部安全区，底部固定操作不得遮挡内容或键盘。
11. 320 宽度和 200% 字号放大必须保持可用。
12. 交互组件必须包含默认、按下、禁用、加载、聚焦及错误等必要状态；状态色由项目色彩规范决定。
13. 原生 iOS/Android/HarmonyOS 组件优先保持平台语义和无障碍行为，不为逐像素一致关闭系统能力。
14. 任何新增尺寸必须先提出 Token 变更，不得在页面代码中散落 magic number。

---

## 13. 生产验收清单

### 排版

- [ ] 全局字体使用系统字体栈，有完整中文 fallback。
- [ ] 主要正文不小于 16；次级信息不小于 14；说明不小于 12。
- [ ] 没有 9px、10px 文字；11px 仅用于允许的例外场景。
- [ ] 字重仅使用 400/500/600/700。
- [ ] 中文正文行高处于 1.45–1.60 倍范围。
- [ ] 标题、正文、标签均引用语义 Token。
- [ ] 金额、倒计时和表格数字按需使用等宽数字。

### 布局

- [ ] 间距来自 4/8 网格 Token，没有无依据的散点值。
- [ ] 默认页面边距 16，宽屏按规范增大。
- [ ] 320 宽度无页面级横向滚动。
- [ ] 安全区、键盘、状态栏和底部系统区域已处理。
- [ ] 长标题、长机构名、长地址和大数字经过压力测试。

### 组件

- [ ] 主按钮和输入框默认高度 48。
- [ ] 所有独立触控目标达到 44，跨端默认达到 48。
- [ ] 视觉图标较小时，命中区仍达到要求。
- [ ] 卡片、列表、弹窗和面板使用统一内边距与圆角。
- [ ] 加载、空、错误、禁用、聚焦、按下状态完整。
- [ ] 组件在文本换行后不会遮挡或重叠。

### 无障碍

- [ ] H5 文本放大 200% 无内容或功能损失。
- [ ] iOS Dynamic Type、Android sp、HarmonyOS 可缩放字体单位已启用。
- [ ] 图标按钮、输入框、选项、弹窗都有可访问名称和角色。
- [ ] 焦点顺序符合视觉和业务顺序。
- [ ] 状态表达不只依赖颜色。
- [ ] 减少动态效果设置得到支持。

### Token 与工程

- [ ] 页面代码不直接散落字号、间距、圆角和高度数值。
- [ ] Figma Variables、CSS Variables 和原生 Token 命名保持同一语义。
- [ ] Token 修改有版本号、变更记录和迁移说明。
- [ ] 本文件未混入任何色彩 Token。

---

## 14. 官方资料来源

以下仅使用官方规范、官方开发文档或厂商官方开源仓库：

1. Apple Human Interface Guidelines — Typography  
   https://developer.apple.com/design/human-interface-guidelines/typography
2. Apple Human Interface Guidelines — Buttons / 44×44pt hit region  
   https://developer.apple.com/design/human-interface-guidelines/buttons
3. Google Android Developers — Material 3 Typography  
   https://developer.android.com/develop/ui/compose/designsystems/material3
4. Google Android Developers — Grids and units  
   https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units
5. Google Android Developers — Minimum touch target sizes  
   https://developer.android.com/develop/ui/compose/accessibility/api-defaults
6. Google Android Developers — Content composition and 16dp compact margins  
   https://developer.android.com/design/ui/mobile/guides/layout-and-content/content-structure
7. HarmonyOS Design — Design overview and variable fonts  
   https://developer.huawei.com/consumer/cn/design/
8. HarmonyOS Design — HarmonyOS Sans and official design resources  
   https://developer.huawei.com/consumer/cn/design/resource/
9. Ant Design Mobile — Official repository and CSS Variable architecture  
   https://github.com/ant-design/ant-design-mobile
10. Ant Design Mobile — Current default typography and radius variables  
    https://github.com/ant-design/ant-design-mobile/blob/master/src/global/theme-default.less
11. Tencent TDesign Mobile — Official design system  
    https://tdesign.tencent.com/
12. Tencent TDesign Mobile Vue — Official repository  
    https://github.com/Tencent/tdesign-mobile-vue
13. W3C WCAG 2.2 — Resize Text, Text Spacing, Reflow and Target Size  
    https://www.w3.org/TR/WCAG22/

---

## 15. 最终执行基线（一页版）

如果团队只保留最核心规则，执行以下 16 条：

1. 系统字体优先，中文必须有完整 fallback。
2. 默认正文 16/24、400；阅读型正文可用 17/26。
3. 页面区块标题 20/28、600；卡片标题 18/26、600。
4. 次级正文 14/22；说明 12/18；绝不使用 9/10。
5. 字重只使用 400/500/600/700。
6. 间距以 4 为原子单位、8 为主节奏。
7. 页面边距默认 16，卡片内边距默认 16。
8. 圆角只使用 4/8/12/16/20/full。
9. 常规图标 24，辅助图标 20，图文间距 8。
10. 按钮和输入框默认高 48。
11. 触控目标至少 44，跨端默认 48。
12. 列表默认高 56，多行内容自适应增高。
13. 所有组件处理长文案、换行、安全区和键盘。
14. 320 宽视口可重排，文本放大 200% 不破版。
15. 页面不得新增未登记的 magic number。
16. 本文件不包含色彩；所有颜色由独立色彩规范管理。
