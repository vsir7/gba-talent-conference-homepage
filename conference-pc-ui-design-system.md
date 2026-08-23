# 通用大会 PC 官网 UI Design System

> 版本：v2.0 · International Editorial Edition  
> 适用范围：大会、峰会、论坛、会展、开发者大会类 PC 官网  
> 设计基准：`1440px` 桌面画布  
> 核心方向：国际编辑风、不对称网格、超大文字、紫白高对比  
> 不适用范围：移动 H5、小程序、后台管理系统  
> 本规范只约束视觉语言、排版、设计 Token、通用组件外观与交互状态，不规定页面栏目、信息架构、模块顺序或大会业务内容。

---

## 0. 设计定位与参考边界

### 0.1 设计定位

本系统采用“平衡型国际编辑风”：以编辑设计的鲜明层级和非对称构图建立国际感，以科技大会所需的清晰度、可信度和可访问性约束表现强度。

```text
编辑感 70% + 科技会展可信度 30%
```

它不是常规 SaaS 官网，不以圆角卡片矩阵作为主要表达；也不是实验性艺术网站，不以牺牲信息可读性换取视觉奇观。

### 0.2 参考样本与可复用启发

| 参考大会 | 提炼的视觉规律 | 不直接复用的内容 |
|---|---|---|
| WAIC 世界人工智能大会 | 紫白氛围、文字与流体视觉非对称分区、透明导航、轻科技感 | 页面栏目、内容顺序、年度主视觉 |
| 华为开发者大会 HDC | 单一品牌符号、极大留白、克制的黑白功能界面 | Logo 造型、专属字体、页面结构 |
| South Summit | 深紫整屏色域、超大标题、7:5 占位、数字视觉锚点 | 具体文案与模块布局 |
| Slush | 分行错位标题、窄体展示字、全出血影像、文字直接参与构图 | 过暗影调和专属交互 |
| OFFF Barcelona | 硬边编辑网格、跨栏裁切、紧凑标题、少卡片设计 | 过强拼贴与创意节专属视觉 |
| MWC Barcelona | 紫蓝影像、薄字重大标题、5:7 非对称画面 | 品牌影像与栏目组织 |
| VivaTech | 紫色媒体蒙层、深浅整屏交替、醒目行动点 | 专属渐变与大会资产 |

以上参考只用于提炼视觉关系。任何新项目都必须替换 Logo、年度主视觉、人物、场馆、议程与文案。

### 0.3 不继承项

- 不继承移动端画板、安全区、Bottom Tab、触控组件和移动页面模板。
- 不规定首页必须出现哪些模块，也不规定议程、嘉宾、新闻或合作伙伴的排列顺序。
- 不复刻任何参考网站的页面结构、品牌字体、动画或专属图形。
- 不用虚构人物、会场、嘉宾、合作机构或数据填补视觉空白。

---

## 1. 核心视觉原则

### 1.1 视觉关键词

```text
紫白高对比
超大文字
非对称网格
硬边分区
全出血影像
大尺度留白
单一视觉焦点
克制科技感
国际编辑气质
```

### 1.2 八条原则

1. **文字即视觉**：大型标题、数字和日期本身就是构图元素，不依赖装饰图填满页面。
2. **有秩序的不对称**：所有错位都依附 12 栏网格，不使用随意漂浮的“伪创意”。
3. **紫白整屏对比**：白色与深紫通过大色域切换形成节奏，不把紫色限制为按钮点缀。
4. **一屏一焦点**：每个视口只保留一个主导元素——标题、图像、数字或品牌符号。
5. **减少容器感**：内容优先依靠留白、细线、色域和跨栏关系分组；卡片只在需要独立点击或边界时出现。
6. **影像有观点**：采用全出血、局部裁切、紫色蒙层或不规则跨栏，不使用模板化缩略图宫格。
7. **克制的未来感**：渐变、流体、粒子和动态只能服务主视觉，不在每个组件重复。
8. **清晰优先**：编辑化不能破坏中文阅读、键盘操作、响应式适配和 WCAG 对比度。

### 1.3 视觉强度控制

| 维度 | 推荐强度 | 说明 |
|---|---:|---|
| 大标题 | 高 | 允许占据视口宽度的 55%–85% |
| 网格不对称 | 中高 | 使用 5:7、7:5、4:8、跨栏与偏移 |
| 紫白对比 | 高 | 允许整屏深紫与整屏白色交替 |
| 渐变与光效 | 中 | 集中于主视觉或一个品牌时刻 |
| 圆角与玻璃 | 低 | 不作为全站默认语言 |
| 阴影 | 极低 | 只服务真正悬浮的浮层 |
| 拼贴与异形 | 中低 | 作为局部强调，不主导全部页面 |

---

## 2. Design Token 总表

业务组件优先调用语义 Token；禁止在页面中散落临时颜色、字号、圆角和间距值。

```css
:root {
  /* ==================================================
     Primitive colors — 品牌色值保持不变
     ================================================== */
  --conf-purple-700: #523ae5;
  --conf-purple-500: #7655f7;
  --conf-purple-300: #a993ff;
  --conf-purple-200: #d4c7f8;
  --conf-purple-100: #e7e0ff;
  --conf-purple-50: #f4f1ff;

  --conf-navy-900: #0a1533;
  --conf-ink-900: #01021b;
  --conf-gray-900: #333333;
  --conf-gray-600: #727171;
  --conf-gray-400: #bfc1d2;
  --conf-gray-300: #dadae0;
  --conf-gray-100: #f1f2f6;
  --conf-gray-50: #f8f9fa;
  --conf-white: #ffffff;

  --conf-green-500: #15d378;
  --conf-orange-500: #ffaa3d;
  --conf-red-500: #f75b62;

  /* ==================================================
     Semantic colors
     ================================================== */
  --conf-color-brand: var(--conf-purple-700);
  --conf-color-brand-highlight: var(--conf-purple-500);
  --conf-color-brand-soft: var(--conf-purple-100);
  --conf-color-brand-subtle: var(--conf-purple-50);

  --conf-color-ink: var(--conf-navy-900);
  --conf-color-text: var(--conf-gray-900);
  --conf-color-text-secondary: var(--conf-gray-600);
  --conf-color-text-disabled: var(--conf-gray-400);
  --conf-color-text-on-brand: var(--conf-white);

  --conf-color-page: var(--conf-white);
  --conf-color-page-soft: var(--conf-gray-50);
  --conf-color-page-brand: var(--conf-purple-700);
  --conf-color-surface: var(--conf-white);
  --conf-color-surface-soft: var(--conf-purple-50);
  --conf-color-border: var(--conf-gray-300);
  --conf-color-border-brand: var(--conf-purple-200);
  --conf-color-focus: var(--conf-purple-500);

  --conf-color-success: var(--conf-green-500);
  --conf-color-warning: var(--conf-orange-500);
  --conf-color-danger: var(--conf-red-500);

  /* ==================================================
     Gradients — only for branded moments
     ================================================== */
  --conf-gradient-brand:
    linear-gradient(110deg, #523ae5 0%, #7655f7 100%);
  --conf-gradient-brand-deep:
    linear-gradient(135deg, #01021b 0%, #523ae5 72%, #7655f7 100%);
  --conf-gradient-brand-air:
    radial-gradient(circle at 78% 26%, rgba(118, 85, 247, 0.28), transparent 34%),
    radial-gradient(circle at 30% 80%, rgba(82, 58, 229, 0.14), transparent 40%),
    linear-gradient(135deg, #ffffff 0%, #f4f1ff 58%, #ffffff 100%);
  --conf-gradient-media-overlay:
    linear-gradient(90deg, rgba(1, 2, 27, 0.78) 0%, rgba(82, 58, 229, 0.42) 58%, rgba(82, 58, 229, 0.08) 100%);

  /* ==================================================
     Typography
     ================================================== */
  --conf-font-display:
    "Arial Narrow", "Helvetica Neue", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  --conf-font-sans:
    "Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei",
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --conf-type-display-xxl: clamp(80px, 8.3vw, 120px);
  --conf-type-display-xl: clamp(64px, 6.1vw, 88px);
  --conf-type-display: clamp(52px, 4.45vw, 64px);
  --conf-type-h1: clamp(44px, 3.9vw, 56px);
  --conf-type-h2: clamp(38px, 3.35vw, 48px);
  --conf-type-h3: 32px;
  --conf-type-h4: 22px;
  --conf-type-body-lg: 20px;
  --conf-type-body: 16px;
  --conf-type-body-sm: 14px;
  --conf-type-label: 12px;

  --conf-leading-display: 0.94;
  --conf-leading-title: 1.08;
  --conf-leading-heading: 1.2;
  --conf-leading-body: 1.7;

  --conf-tracking-display: -0.045em;
  --conf-tracking-title: -0.025em;
  --conf-tracking-label: 0.1em;

  --conf-weight-regular: 400;
  --conf-weight-medium: 500;
  --conf-weight-semibold: 600;
  --conf-weight-bold: 700;

  /* ==================================================
     Spacing — 4px base
     ================================================== */
  --conf-space-1: 4px;
  --conf-space-2: 8px;
  --conf-space-3: 12px;
  --conf-space-4: 16px;
  --conf-space-5: 24px;
  --conf-space-6: 32px;
  --conf-space-7: 48px;
  --conf-space-8: 64px;
  --conf-space-9: 80px;
  --conf-space-10: 96px;
  --conf-space-11: 120px;
  --conf-space-12: 160px;

  /* ==================================================
     Layout
     ================================================== */
  --conf-layout-canvas: 1440px;
  --conf-layout-frame: 1320px;
  --conf-layout-content: 1200px;
  --conf-layout-text: 720px;
  --conf-layout-header: 76px;
  --conf-layout-margin: 60px;
  --conf-layout-grid-columns: 12;
  --conf-layout-grid-gap: 24px;

  /* ==================================================
     Geometry, border, shadow
     ================================================== */
  --conf-radius-none: 0;
  --conf-radius-control: 6px;
  --conf-radius-soft: 12px;
  --conf-radius-panel: 16px;
  --conf-radius-pill: 999px;

  --conf-border-hairline: 1px solid var(--conf-color-border);
  --conf-border-brand: 1px solid var(--conf-color-border-brand);
  --conf-border-strong: 2px solid currentColor;

  --conf-shadow-none: none;
  --conf-shadow-float: 0 16px 44px rgba(10, 21, 51, 0.14);
  --conf-shadow-modal: 0 24px 72px rgba(10, 21, 51, 0.20);

  /* ==================================================
     Motion
     ================================================== */
  --conf-duration-fast: 140ms;
  --conf-duration-base: 240ms;
  --conf-duration-reveal: 600ms;
  --conf-duration-marquee: 24s;
  --conf-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --conf-ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. 色彩系统

### 3.1 品牌色职责

| Token | 色值 | 主要职责 |
|---|---|---|
| Brand | `#523AE5` | 深紫整屏背景、核心 CTA、品牌图形 |
| Highlight | `#7655F7` | 渐变高光、Focus、动态强调 |
| Soft | `#E7E0FF` | 浅选中态、辅助色块 |
| Subtle | `#F4F1FF` | 浅紫呼吸区、低对比背景 |
| Brand Line | `#D4C7F8` | 细线、时间线、浅色边框 |

主色不得替换成普通政务蓝，也不新增与紫色竞争的高饱和蓝。年度视觉可以包含蓝紫过渡，但界面语义色仍以紫色为唯一品牌主轴。

### 3.2 页面色域比例

色彩比例按完整页面或一组连续页面评估，不按单屏机械执行：

| 色域 | 建议占比 | 使用方式 |
|---|---:|---|
| 白色与浅中性色 | 55%–65% | 阅读区、功能区、大尺度留白 |
| 深紫品牌色域 | 25%–35% | 关键视觉场、整屏章节、媒体蒙层 |
| 浅紫氛围色 | 5%–15% | 呼吸区、选中态、背景渐变 |
| 状态色 | 少于 3% | 成功、提醒、错误，不参与品牌装饰 |

允许出现连续的全屏深紫背景；但深紫区必须与白色区形成清晰切换，不把整站所有区块都涂成不同深浅的紫色。

### 3.3 紫白高对比组合

推荐组合：

- `#523AE5` 背景 + `#FFFFFF` 主文字。
- `#FFFFFF` 背景 + `#0A1533` 主文字 + `#523AE5` 关键强调。
- `#F4F1FF` 背景 + `#0A1533` 主文字。
- 图片 + 深色/品牌色蒙层 + 白色文字。

不推荐组合：

- 浅紫背景 + 白色正文。
- 深紫背景 + `#7655F7` 正文。
- 同屏同时使用紫、蓝、红、橙作为装饰主色。
- 通过降低文字透明度制造“高级灰”，导致正文不可读。

### 3.4 渐变规则

- 渐变只用于主视觉、核心 CTA、媒体蒙层或一次品牌转场。
- 一个视口最多保留一个主要渐变方向。
- 普通内容容器使用纯色，不使用渐变卡片。
- 紫白区切换优先采用硬切、跨栏或大面积色块；渐变不是默认过渡方式。
- 光晕透明度建议 `8%–28%`，禁止在正文背后出现强发光。

### 3.5 状态色与对比度

| 状态 | 色值 | 规则 |
|---|---|---|
| 成功 | `#15D378` | 配合图标或文字，不只靠颜色 |
| 提醒 | `#FFAA3D` | 用于非阻断风险和时间提醒 |
| 错误 | `#F75B62` | 用于错误、失败和危险操作 |
| 进行中 | 品牌紫 | 不新增蓝色状态体系 |
| 禁用 | `#BFC1D2` | 保留可辨识轮廓与文字 |

- 正文、按钮和焦点状态至少满足 WCAG AA。
- 深紫背景上的小字号正文优先使用纯白，不使用低透明白。
- Focus Ring 使用 `2px #7655F7`；位于紫色背景时改用 `2px #FFFFFF`。

---

## 4. 国际编辑型排版

### 4.1 字体角色

系统只允许两类字体角色：

1. **Display 展示字体**：用于超大标题、年度口号、大型数字和短英文。可以使用较窄字面或强几何感字体。
2. **Sans 功能字体**：用于中文标题、正文、导航、按钮、标签、表单和数据说明。

如项目没有获授权的品牌字体，使用 Token 中的系统字体回退，不从网络随意下载来源不明字体。

### 4.2 字号层级

| 层级 | 1440px 推荐值 | 行高 | 用途 |
|---|---:|---:|---|
| Display XXL | `96–120px` | `0.90–0.96` | 极短年度主题、英文大会名、关键数字 |
| Display XL | `72–88px` | `0.94–1.0` | 主视觉核心标题 |
| Display | `56–64px` | `1.0–1.08` | 强分区标题、引言 |
| H1 | `48–56px` | `1.08–1.16` | 页面级标题 |
| H2 | `40–48px` | `1.12–1.2` | 主要视觉分区标题 |
| H3 | `32px` | `1.2–1.3` | 次级分区标题 |
| H4 | `22px` | `1.35` | 小标题、内容标题 |
| Body Large | `20px` | `1.55–1.7` | 导语、重要说明 |
| Body | `16px` | `1.7` | 正文 |
| Body Small | `14px` | `1.6` | 导航、元信息、表单标签 |
| Label | `12px` | `1.4` | 章节号、日期、分类标签 |

`Display XXL` 只用于 2–12 个中文字或短英文。长中文标题应使用 `Display / H1`，不能为了“超大字”挤压到难以阅读。

### 4.3 字距与字重

- 英文 Display：`letter-spacing: -0.045em`，推荐 `600–700`。
- 中文 Display：`letter-spacing: -0.02em` 至 `0`，推荐 `600–700`。
- 大型细体英文仅可用于字符形态清晰的品牌字体，正文不使用 `300` 以下字重。
- 大写英文标签：`12px / 600`，字距 `0.08–0.12em`。
- 正文：`400`；强调正文：`500`；不使用全段粗体。

### 4.4 编辑化标题构图

允许：

- 标题分成两行，并让第二行相对第一行偏移 1–3 栏。
- 标题跨越 7–10 栏，辅助说明只占 3–5 栏。
- 标题与大数字形成上下或左右错位。
- 英文短词使用全大写，中文保持自然语序和可读换行。
- 使用章节号 `[01]`、日期、地点或关键词作为小型锚点。

禁止：

- 每个标题都居中。
- 为制造错位而打乱语义断句。
- 标题使用描边字、重投影、外发光或彩虹渐变。
- 标题过长时临时缩小到正文级字号。
- 中英文混排出现两套竞争性展示字体。

### 4.5 正文排版

- 长正文最大宽度 `640–720px`。
- 中文正文每行建议 `28–42` 个字符。
- 标题与导语间距 `24–32px`；导语与操作间距 `32–48px`。
- 正文区域不超过 2 栏；高密度内容回归规则对齐。
- 数字使用等宽数字特性：`font-variant-numeric: tabular-nums`。

---

## 5. PC 网格、构图与留白

### 5.1 画布与框架

| 项目 | 规范 |
|---|---:|
| 设计基准 | `1440px` |
| 外层 Frame | `1320px` |
| 1440 下左右边距 | `60px` |
| 常规内容宽度 | `1200px` |
| 长文宽度 | `720px` |
| 网格列数 | `12` |
| 标准列间距 | `24px` |
| 页头高度 | `72–80px`，推荐 `76px` |

```css
.conf-frame {
  width: min(var(--conf-layout-frame), calc(100% - 80px));
  margin-inline: auto;
}

.conf-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--conf-layout-grid-gap);
}
```

### 5.2 推荐非对称比例

以下是构图原语，不是页面结构模板：

| 关系 | 适用表达 |
|---|---|
| `7 + 5` | 大标题 + 图像/说明 |
| `5 + 7` | 元信息/说明 + 大图像 |
| `4 + 8` | 小型引导 + 强视觉内容 |
| `8 + 4` | 主叙事 + 操作/数据 |
| `3 + 6 + 3` | 锚点 + 核心内容 + 留白/辅助 |
| `2 offset + 8` | 大段宣言、引言或媒体 |
| `9 + 3` | 超大标题 + 垂直元信息 |

左右比例不应在连续区域中机械重复。若上一视觉场为 `7 + 5`，下一视觉场宜使用反向关系、跨栏媒体或纯文字留白，形成编辑节奏。

### 5.3 对齐规则

- 每个主要元素的起止边界必须落在网格线上。
- 不对称来自跨栏、偏移、留白和尺寸差异，不来自随机 `left/top`。
- 同一视觉场最多建立两个主对齐轴和一个辅助轴。
- 标题、说明、按钮不必共用同一左边界，但各自必须与网格或图像边缘对齐。
- 全出血媒体可以越过 Frame，文字不可无规则贴近视口边缘。

### 5.4 留白节奏

| 场景 | 推荐间距 |
|---|---:|
| 大型视觉场上下留白 | `120–160px` |
| 常规视觉分区上下留白 | `96–120px` |
| 相邻编辑块 | `64–96px` |
| 标题与说明 | `24–32px` |
| 说明与行动 | `32–48px` |
| 同组信息 | `12–24px` |
| 细线与内容 | `16–24px` |

留白是构图的一部分。不要因为局部内容较少而添加无意义插图、渐变球体或更多卡片。

### 5.5 桌面响应式边界

| 视口 | 规则 |
|---|---|
| `≥ 1600px` | Frame 保持 `1320px`，可让主视觉资产延伸到视口边缘 |
| `1440–1599px` | 使用 `1320px` Frame、`60px` 外边距 |
| `1280–1439px` | 外边距 `40px`，字号使用 `clamp()` 平滑缩放 |
| `1024–1279px` | 外边距 `32px`，12 栏保留，复杂比例可转为 `5 + 7` 或 `12` |
| `< 1024px` | 切换独立平板/移动规范，不继续压缩 PC 构图 |

---

## 6. 色域、表面、边框与几何语言

### 6.1 四类基础视觉场

| 类型 | 背景 | 前景 | 使用原则 |
|---|---|---|---|
| Light Field | `#FFFFFF` | `#0A1533` | 阅读、功能、留白 |
| Soft Field | `#F4F1FF` / `#F8F9FA` | `#0A1533` | 低对比过渡、次级信息 |
| Brand Field | `#523AE5` | `#FFFFFF` | 强品牌时刻、关键视觉场 |
| Media Field | 图片/视频 + 蒙层 | `#FFFFFF` | 影像叙事、沉浸展示 |

视觉场通常铺满容器或视口宽度。避免在一个大白底里连续堆叠多个尺寸相同的浅紫圆角盒子。

### 6.2 圆角

| Token | 数值 | 使用场景 |
|---|---:|---|
| None | `0` | 编辑分区、图片大框、数据行、硬边色块 |
| Control | `6px` | 输入框、按钮、功能控件 |
| Soft | `12px` | 小型媒体、必要的独立内容卡 |
| Panel | `16px` | 弹窗、浮动面板；少量使用 |
| Pill | `999px` | 状态、短标签、特殊 CTA |

默认编辑内容块使用 `0` 圆角。一个视口内不宜同时出现 `0 / 6 / 12 / 16 / Pill` 全部层级。

### 6.3 边框与分隔

- 常规分隔：`1px solid #DADAE0`。
- 深紫背景分隔：`1px solid rgba(255,255,255,.28)`。
- 品牌强调线：`1–2px solid #523AE5`。
- 编辑数据行可使用贯穿全宽的 Hairline。
- 不在同一元素同时使用边框、强渐变和投影。

### 6.4 阴影

- 页面内容、媒体框、普通卡片：`box-shadow: none`。
- Dropdown / Popover：`shadow-float`。
- Modal：`shadow-modal`。
- 层级优先通过色域、边界、重叠和留白建立，而不是投影。

### 6.5 玻璃效果

玻璃效果不再是系统默认材质，只允许用于：

- 主视觉影像上方的导航；
- 复杂背景上的小型浮动工具；
- 需要保留背景连续性的临时浮层。

玻璃层必须同时满足：背景确实可见、文字对比度合格、模糊不会造成性能问题。纯白背景上禁止机械使用玻璃卡。

---

## 7. 通用组件视觉规范

本节只描述组件外观，不规定组件在哪个页面、以什么顺序出现。

### 7.1 全局页头

- 高度 `72–80px`，推荐 `76px`。
- 默认无投影，可使用透明、纯白或深紫实底。
- 浅色背景：深色文字；深紫/媒体背景：白色文字。
- 导航 `14px / 500`，不使用过大的胶囊导航容器。
- 当前项通过文字反差、`2px` 下划线或短线标记表达，三者选一。
- 品牌 Logo、导航与主行动之间保留明显留白。
- 滚动后可出现 `1px` 分隔线或轻度背景模糊，但不突然增加厚重阴影。

### 7.2 按钮

| 尺寸 | 高度 | 水平内边距 | 字号 |
|---|---:|---:|---:|
| Small | `36px` | `16px` | `14px` |
| Medium | `44px` | `20px` | `14px` |
| Large | `52px` | `28px` | `16px` |
| Editorial | `56px` | `28–32px` | `14px` 大写标签或 `16px` 中文 |

```css
.conf-button--primary {
  color: #fff;
  background: #523ae5;
  border: 2px solid #523ae5;
  border-radius: var(--conf-radius-control);
}

.conf-button--inverse {
  color: #523ae5;
  background: #fff;
  border: 2px solid #fff;
  border-radius: var(--conf-radius-control);
}

.conf-button--outline {
  color: currentColor;
  background: transparent;
  border: 2px solid currentColor;
  border-radius: var(--conf-radius-control);
}

.conf-button--text {
  padding-inline: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  border-radius: 0;
}
```

- 同一区域只保留一个高权重主按钮。
- 国际编辑风优先使用硬边矩形或轻圆角按钮；胶囊按钮只用于短标签式行动。
- Hover 可采用颜色反转、箭头位移或轻微亮度变化，不增加新颜色。
- 禁用态必须降低对比度并取消位移动效。

### 7.3 文本链接与箭头行动

- 默认使用文字 + 方向箭头，间距 `12px`。
- Hover 时箭头水平移动 `4px`，文字下划线显现或延长。
- 箭头和文字必须属于同一点击区域。
- 不用无语义的“查看更多”填满每个内容块；链接文案应表达动作对象。

### 7.4 Tab、筛选与标签

- 一级 Tab 优先采用横向文字 + 底部线，不使用整排胶囊。
- 二级筛选可采用 `36px` 高、`6px` 圆角的轻边框控件。
- Tag 高度 `24–28px`，使用 `12px / 600` 大写英文或短中文。
- Brand Field 上的 Tag：透明底 + 半透明白边；Light Field 上的 Tag：浅紫底 + 深紫文字。
- 状态标签和分类标签不可共用同一颜色逻辑。

### 7.5 输入与搜索

- 标准高度 `44px`，大型搜索 `52px`。
- 默认 `6px` 圆角或无圆角下划线式输入，两种风格不得在同一区域混用。
- 背景白色，边框 `#DADAE0`；Focus 使用 `2px #7655F7`。
- Placeholder 使用 `#727171`，不能淡到不可读。
- Error 同时显示红色边界、图标与文字说明。
- 影像或深紫背景上的输入必须放入稳定实色表面，不能只靠毛玻璃保证阅读。

### 7.6 编辑内容块

默认内容块不画卡片：

```css
.conf-editorial-block {
  padding-block: 24px;
  border-top: 1px solid var(--conf-color-border);
  border-radius: 0;
  box-shadow: none;
}
```

- 使用章节号、细线、跨栏标题、图像或留白形成边界。
- 标题建议 `22–32px`，说明 `14–16px`。
- Hover 只改变文字、箭头、背景色或媒体裁切中的一个重点。
- 若内容需要整体点击、独立状态或明确容器，才升级为卡片。

### 7.7 必要卡片

```css
.conf-card {
  padding: 24px;
  color: var(--conf-color-text);
  background: var(--conf-color-surface);
  border: var(--conf-border-hairline);
  border-radius: var(--conf-radius-soft);
  box-shadow: none;
}
```

- 卡片圆角上限通常为 `12px`。
- 避免 4 列以上的同质白卡矩阵；高密度信息优先使用列表或编辑行。
- 卡内不重复套卡，不为每个元信息增加底色胶囊。
- Hover 可让背景转为 `#F4F1FF`，或让媒体放大至 `1.02`。

### 7.8 媒体框

- 可用比例：`16:9`、`3:2`、`4:5`、超宽 `2.2:1`。
- 同一视觉场可以混合两个比例，但必须共享对齐轴。
- 大型媒体优先 `0` 圆角；小型独立媒体最多 `12px` 圆角。
- 图像使用 `object-fit: cover`，视觉主体不得被响应式裁掉。
- 图片文字叠加必须使用明确蒙层和安全区。
- 允许媒体越过 Frame 到视口边缘，文字仍需落在网格内。

### 7.9 数字与统计

- 关键数字使用 `64–120px`，行高 `0.9–1.0`。
- 单位、说明或年份使用 `12–16px`，与数字形成明显尺度反差。
- 数字组优先使用细线分隔和开放式布局，不默认使用卡片。
- 数字必须有真实来源；未知数据不以占位数字装饰页面。

### 7.10 Logo 展示单元

- Logo 使用 `object-fit: contain`，四周安全区至少为 Logo 短边的 `25%`。
- 优先使用开放网格 + 细分隔线；必要时才使用白色卡片。
- 不统一给合作品牌 Logo 染成紫色，不改变比例或裁切。
- 合作等级通过空间、尺寸和分组标题表达，不通过强投影表达。

### 7.11 Dropdown、Popover、Modal 与 Toast

- Dropdown / Popover：白色实底、`12px` 圆角、`shadow-float`。
- Modal：宽度 `480–720px`、`16px` 圆角、`shadow-modal`。
- 遮罩：`rgba(10,21,51,.52)`。
- Toast：深海军蓝背景、白色文字、`6px` 圆角，展示 `2–4s`。
- 关闭按钮可点击区域不小于 `40 × 40px`。

---

## 8. 图像、年度主视觉与装饰

### 8.1 年度主视觉

- 年度主视觉必须作为可替换资产，不写死进通用组件 Token。
- 允许格式：透明 PNG、WebP、SVG、视频或受性能约束的 WebGL。
- 优先构图：文字区与视觉资产形成 `7:5` 或 `5:7`，而非默认完全居中。
- 视觉资产必须预留标题、日期、地点和行动点的安全区。
- 一个视口只使用一个主视觉体系；不并列多个竞争性 3D 物体。

### 8.2 摄影风格

- 优先真实大会、人物、场馆、城市和技术场景摄影。
- 采用大胆裁切、近景细节、人物视线或建筑几何建立编辑感。
- 色彩可统一为自然色、紫色蒙层或低饱和冷调，整组图片必须一致。
- 禁止用风格不一致的图库图拼成“国际感”。
- 真实人物不得被 AI 生成头像替代；无授权素材时使用抽象主视觉或中性占位。

### 8.3 抽象图形

允许：

- 大尺度流体、折射、波纹、光束、网格和粒子。
- 单色或双色几何图形。
- 与品牌紫一致的局部噪点和轻微纹理。
- 被网格裁切的大型字母、年份和序号。

禁止：

- 通用 AI 大脑、机器人头、芯片、地球连线等陈旧科技图标。
- 同时混合液态金属、赛博霓虹、卡通插画和写实摄影。
- 每个区块都放一颗渐变球或发光圆。
- 装饰图压住正文或制造不可控对比度。

### 8.4 图标

- 使用同一套线性或几何面性图标。
- 常规图标 `18–24px`，描边 `1.5–2px`。
- 默认色 `#0A1533` / `#727171`；深紫背景使用白色。
- 大型装饰图标不替代真正的信息层级。

---

## 9. 动效与交互节奏

### 9.1 动效角色

| 类型 | 目的 | 推荐形式 |
|---|---|---|
| Feedback | 确认可交互状态 | 颜色、下划线、箭头位移 |
| Reveal | 建立编辑阅读节奏 | 淡入 + `16–32px` 位移 |
| Media | 强化影像生命力 | `1.02` 缩放、蒙层变化 |
| Brand | 建立大会记忆点 | 单次流体、标题拆分、数字滚动 |
| Continuous | 传递持续信息 | 低速 Marquee，仅一处 |

### 9.2 时长

| 场景 | 时长 |
|---|---:|
| Hover / Focus | `140ms` |
| Tab / 控件状态 | `240ms` |
| 标题 / 媒体 Reveal | `480–600ms` |
| 大型品牌转场 | `600–900ms` |
| Marquee 单循环 | `20–32s` |

- 页面进入动效错峰间隔建议 `60–100ms`，总等待不超过 `500ms`。
- 不使用大幅弹跳、持续漂浮、鼠标追踪光球或影响阅读的循环动画。
- 视频主视觉默认静音，必须提供暂停控制；不能阻塞首屏内容显示。

### 9.3 Hover 规则

单个组件最多组合两种变化：

- 前景/背景反转；
- 箭头位移 `4px`；
- 图片缩放至 `1.02`；
- 下划线延长；
- 元素上移 `1–2px`。

禁止同时改变颜色、大小、旋转、阴影和位置。

### 9.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 可访问性与内容适应

- 正文和交互文字至少满足 WCAG AA；超大标题也不得依靠低对比度表达。
- 所有键盘操作元素必须有可见 Focus 状态。
- PC 可点击区域建议不小于 `40 × 40px`。
- 链接、状态和错误不能只靠颜色区分。
- 长中文标题优先换行、调整跨栏或增加高度，不缩小为正文级字号。
- 英文大写标签必须有清晰的中文语义或上下文。
- 动态大会信息应可更新，不设计成不可修改的装饰图片文字。
- 未确认信息显示“暂未公布”“待大会发布”或隐藏，不虚构数据。
- 图片提供替代文本；纯装饰图使用空 `alt`。
- 视频提供字幕、暂停和静音控制。
- 所有文字叠图场景必须在最复杂画面帧上验证对比度。

---

## 11. 实施示例

### 11.1 非对称编辑网格

```css
.conf-editorial-layout {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.conf-editorial-layout__headline {
  grid-column: 1 / span 7;
}

.conf-editorial-layout__meta {
  grid-column: 9 / span 3;
  align-self: end;
}

.conf-editorial-layout__media {
  grid-column: 5 / -1;
}
```

### 11.2 超大标题

```css
.conf-display-title {
  max-width: 10ch;
  margin: 0;
  color: var(--conf-color-ink);
  font-family: var(--conf-font-display);
  font-size: var(--conf-type-display-xl);
  font-weight: var(--conf-weight-bold);
  line-height: var(--conf-leading-display);
  letter-spacing: var(--conf-tracking-display);
  text-wrap: balance;
}

:lang(zh) .conf-display-title {
  max-width: 8em;
  letter-spacing: -0.02em;
}
```

### 11.3 紫色品牌视觉场

```css
.conf-brand-field {
  color: var(--conf-color-text-on-brand);
  background: var(--conf-color-page-brand);
}

.conf-brand-field a:focus-visible,
.conf-brand-field button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}
```

### 11.4 全出血媒体

```css
.conf-bleed-media {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  border-radius: 0;
}

.conf-bleed-media > img,
.conf-bleed-media > video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conf-bleed-media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--conf-gradient-media-overlay);
  pointer-events: none;
}
```

### 11.5 编辑行动链接

```css
.conf-arrow-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.conf-arrow-link svg {
  transition: transform var(--conf-duration-fast) var(--conf-ease-standard);
}

.conf-arrow-link:hover svg {
  transform: translateX(4px);
}
```

---

## 12. 禁止模式

以下表现会迅速削弱国际编辑感：

- 所有区块都使用居中标题 + 三列圆角卡片。
- 首屏之后连续出现相同宽度、相同高度的白色卡片矩阵。
- 全页只在按钮和小图标上使用紫色，缺少大色域品牌时刻。
- 每张卡都使用 `18–24px` 大圆角、玻璃背景和阴影。
- 用大量浅紫渐变球、发光粒子和 3D 装饰填补留白。
- 字号层级停留在 `36–56px`，缺少真正承担构图功能的超大文字。
- 所有内容严格左右对称，或所有视觉场都使用相同的 6:6 分栏。
- 把参考大会的栏目顺序、品牌资产或页面结构当作通用规范。
- 为追求“国际感”大面积使用英文，导致中文用户阅读困难。
- 只制作 1440px 静态稿，不验证 1280px、1024px 与浏览器缩放。

---

## 13. 设计验收清单

### 色彩

- [ ] 品牌色是否保持 `#523AE5 + #7655F7`？
- [ ] 是否存在至少一个有意义的深紫品牌视觉场，而非只有紫色按钮？
- [ ] 深紫与白色是否形成清晰、克制的色域节奏？
- [ ] 普通内容是否避免渐变卡片和装饰性状态色？
- [ ] 文字和交互状态是否满足 WCAG AA？

### 排版

- [ ] 关键标题是否达到 `72–120px` 的编辑化尺度，或有合理的内容限制说明？
- [ ] 标题换行是否符合语义，而非为了错位随意断句？
- [ ] Display 与功能字体是否职责清晰？
- [ ] 正文宽度是否控制在 `720px` 以内？
- [ ] 日期、地点、编号和数字是否形成明确的次级锚点？

### 网格与留白

- [ ] 1440px 下是否使用 12 栏和 `1320px` Frame？
- [ ] 主要构图是否采用 5:7、7:5、4:8、偏移或跨栏关系之一？
- [ ] 所有错位是否仍然落在网格线上？
- [ ] 是否避免连续使用相同的居中布局或 6:6 分栏？
- [ ] 留白是否服务焦点，而非被无意义装饰填满？

### 表面与组件

- [ ] 普通内容是否优先使用细线、留白和色域分组？
- [ ] 默认编辑块是否为 `0` 圆角、无阴影？
- [ ] 只有真正需要独立边界的内容才使用卡片？
- [ ] 一个区域是否只有一个高权重主行动？
- [ ] 页头、按钮、Tab、输入与浮层是否共用一致的几何语言？

### 图像与品牌

- [ ] 每个视口是否只有一个主要视觉焦点？
- [ ] 图像是否采用有意识的裁切、跨栏或蒙层？
- [ ] 年度主视觉是否作为可替换资产管理？
- [ ] 是否避免通用 AI 大脑、机器人和无意义科技装饰？
- [ ] 是否没有复刻参考大会的 Logo、人物、文案或内容结构？

### 动效与适配

- [ ] 动效是否服务反馈、阅读节奏或单一品牌时刻？
- [ ] 是否支持 `prefers-reduced-motion`？
- [ ] 是否验证 1440px、1280px 和 1024px 三个 PC 视口？
- [ ] 视频是否提供静音、暂停与字幕能力？
- [ ] 键盘焦点、Hover、Disabled 和 Loading 状态是否完整？

---

## 14. 最终原则

```text
紫白色域建立品牌记忆
超大文字承担主视觉职责
非对称网格创造国际编辑感
大尺度留白保持专业与呼吸
全出血影像强化大会现场感
硬边、细线和低阴影维持克制
组件服从内容，不让卡片统治页面
```

在不同大会项目中可以更换 Logo、年度主题、主视觉资产、内容栏目与页面结构，
但应保持本规范中的颜色角色、排版尺度、网格逻辑、几何语言、图像原则、状态体系和可访问性标准。
