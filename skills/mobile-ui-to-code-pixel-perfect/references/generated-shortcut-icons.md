# 金刚位生成图标合同

> 适用范围：仅当用户明确要求重新生成金刚位图标，或明确接受生成图成为新设计基线时读取本文件。普通静态图还原优先使用有权使用的精确原始资产或原子提取资产。

## 目录

1. 分类定义
2. 强制来源规则
3. 生成工作流
4. 风格锁定与 prompt
5. 透明背景与后处理
6. 资产校验
7. 前端接入与无障碍
8. 普通小图标规则
9. 像素验收冲突

## 1. 分类定义

把满足以下特征的入口视为“金刚位”：位于首页或核心页面的高频功能入口组，以较醒目的独立图形加文字标签组成网格、宫格、横排或快捷卡片，承担主要功能导航或业务分流。

以下通常不是金刚位：

- 返回、关闭、搜索、更多、箭头、清除、日历、定位、提示、状态等辅助小图标。
- 底部 Tab 的常规导航 glyph，除非产品明确把它定义为主视觉插画入口。
- 按钮内的方向箭头、表单前缀、Chip、状态点和列表尾部 chevron。
- 品牌 Logo、合作方商标和官方认证标记。

分类不明确时，先按金刚位处理并登记判断；不要为了使用第三方库而把主入口降级成“小图标”。

## 2. 强制来源规则

一旦明确选择 `image-generation` 来源策略，本轮所有金刚位图标最终资产必须由图片生成模型生成。该策略下禁止使用：

- 第三方图标库、icon font、emoji、Unicode 字符或下载素材。
- CSS/SVG 临时几何占位。
- 从参考图裁出的金刚位图标作为最终资产。
- 把文字标签、角标、按钮或多个入口一起生成进一张图。

文字标签必须使用真实 DOM 文本。每个语义入口使用独立资产，不复用同一张图冒充不同功能。

若入口语义涉及品牌或商标，不让模型仿造官方 Logo。金刚位必须改用不含商标的原创中性隐喻；不能改写语义时标记为 `blocked`。授权品牌资产不能作为金刚位生成规则的例外通过。

## 3. 生成工作流

1. 先复制 `assets/icon-role-inventory.template.json`，盘点页面全部图标并逐项登记 `primaryEntry` 与角色；所有主入口必须归类为 `shortcut`。每个金刚位还要登记唯一入口 `domLocator`、直接指向其 `<img>` 的 `assetLocator` 和直接指向真实文本的 `labelLocator`。再复制 `assets/shortcut-icon-set.template.json`，登记每个金刚位的 `id`、DOM 标签、业务语义、目标 CSS 尺寸和页面位置，二者 ID 必须一一对应。
2. 从参考图和页面 token 提炼统一的轮廓、材质、透视、光照、色板、圆角、阴影、留白和背景规则。
3. 先生成一个“风格锚点”图标，检查其在目标 CSS 尺寸下的语义和清晰度；未通过前不批量扩展。
4. 默认调用 `$imagegen` 的内置 `image_gen` 路径。每个不同语义分别生成，不用一个多图拼版再裁切。
5. 后续图标把风格锚点作为样式参考；本地锚点先用 `view_image` 打开，再作为参考输入。每轮只调整一个明确问题。
6. 保留模型原始输出和最终工程资产；将最终文件复制到项目资产目录，不让生产代码引用 `$CODEX_HOME/generated_images` 或临时目录。
7. 每次生成都按 `assets/imagegen-raw-result.template.json` 原样归档工具返回的 data URL/输出提示，再复制 `assets/imagegen-receipt.template.json` 记录可见的 tool call/result 引用、完整 prompt 哈希、运行 ID、源输出路径与哈希；验证器会解析原始结果并要求 data URL 解码后的字节哈希等于源输出。缺少或无法解析这份回执不得声明模型生成来源已验明。工具未提供密码学签名时，这属于“工具记录与字节绑定证明”，不是独立第三方签名。
8. 记录输入参考、生成方式、可用时的模型信息、色键移除参数、alpha 中间文件、归一化报告、最终路径与全部哈希。
9. 使用 `scripts/normalize_shortcut_icon.mjs` 对已去背景的选中资产执行统一等比缩放和透明画布归一化；不要拉伸或手工凭感觉逐张裁切。
10. 运行 `scripts/validate_shortcut_icons.mjs`，再把图标接入页面并执行整页截图差分。

图片生成不可用时，把该可选生成分支标记为 blocked；不要静默回退到第三方图标。若用户改为精确源资产策略，重新冻结合同并使用 `assets/shortcut-asset-set.template.json` 建立新证据链。

## 4. 风格锁定与 prompt

锁定以下字段：

- 视觉媒介：扁平插画、微 3D、黏土、玻璃、线性填充混合等，只选一种。
- 视角和透视：正视、轻微等距或固定俯视角。
- 主体比例和统一安全区。
- 轮廓粗细、圆角、阴影方向、光源和材质强度。
- 主辅色及每个入口允许变化的颜色范围。
- 统一画布、交付像素尺寸和页面 CSS 渲染尺寸。
- 透明背景、无文字、无商标、无水印、无边框贴边。

使用以下 prompt 骨架，并为每个语义单独填充：

```text
Use case: stylized-concept
Asset type: mobile app primary shortcut icon
Primary request: 为“<业务语义>”生成一个原创功能入口图标
Input images: Image 1: style anchor reference（除首个锚点外）
Subject: <单一、明确、易识别的中性视觉隐喻>
Style/medium: <锁定的统一风格>
Composition/framing: 单一主体居中；正方形画布；主体落在统一安全区；轮廓清楚
Color palette: <锁定色板及该图标允许的变化>
Lighting/mood: <锁定光照和材质>
Constraints: 与风格锚点保持相同视角、比例、圆角、阴影和细节密度；无文字；无数字；无 Logo；无商标；无水印；无额外物体；边缘清晰
Scene/backdrop: 完全平坦的纯色抠图背景，供本地移除；背景无阴影、渐变、纹理、反射或地面
```

不要让模型生成标签文字。不要使用“像某品牌/某知名图标库”作为风格要求。

## 5. 透明背景与后处理

按 `$imagegen` 规则优先使用内置生成加色键抠除：

1. 选择不会出现在主体中的纯色背景。
2. 将源输出复制到项目或 `tmp/imagegen/`。
3. 使用安装技能中的 `remove_chroma_key.py` 生成带 alpha 的 PNG/WebP。
4. 验证 alpha 通道、透明边缘、色键残边、主体覆盖率和统一留白。
5. 只有复杂透明主体或抠除验证失败时，才说明 CLI 原生透明回退；未经用户确认不切换模型/路径。

所有后处理必须确定且可记录。允许统一裁切、等比缩放、透明边距、色键移除和格式优化；禁止通过局部重绘、拉伸或不同锐化参数制造一套风格不一致的图标。使用：

```bash
node <skill-dir>/scripts/normalize_shortcut_icon.mjs \
  --input /absolute/path/selected-alpha.png \
  --output /absolute/path/final-icon.png \
  --size 192 --subject-extent 0.74 --y-offset-ratio -0.02 \
  --run-id "$GATE_RUN_ID"
```

保留高分辨率源输出。交付尺寸以页面实际渲染尺寸的整数倍为准，并统一生成，不把多个尺寸不一的模型原图直接塞入页面。

## 6. 资产校验

运行：

```bash
node <skill-dir>/scripts/validate_shortcut_icons.mjs \
  --manifest .harness/traces/<task>/<page>/shortcut-icons.json \
  --output .harness/traces/<task>/<page>/release/shortcut-icons.validation.json \
  --run-id "$GATE_RUN_ID"
```

机器门禁检查：

- 清单明确禁止第三方金刚位图标，并声明标签由 DOM 渲染。
- 最终捕获会额外扫描同一父容器下至少三个、图像尺寸相近且不在导航栏中的醒目图文入口；任何未被库存登记为 shortcut 的候选都会阻断，用于发现常见的漏报金刚位。此启发式不能替代页面分析人员对全部入口的逐项盘点。
- 每个入口有唯一 ID、标签、语义、最终 prompt、原始图片生成工具回执和本地文件；回执、prompt、源输出与运行 ID 互相绑定。
- 文件尺寸、格式、alpha、透明边界、安全区、文件体积和哈希符合清单；alpha 中间件与最终件不得是在透明 padding 内包一块展平的不透明矩形底板。
- 不同语义的图标不使用相同哈希。
- 源输出和最终资产均可追溯。

人工复核：

- 在实际 CSS 尺寸下语义仍清楚，不依赖放大查看。
- 一组图标的视角、主体大小、光照、阴影、圆角、色彩饱和度和细节密度一致。
- 无文字、乱码、品牌、商标、水印、伪影、色键残边或意外多余物体。
- 浅色/深色背景和实际卡片颜色下均有足够边界与对比。

## 7. 前端接入与无障碍

- 使用 `<img>`、框架图片组件或项目批准的资产组件，并显式设置宽高，避免布局漂移。
- 相邻有可见标签时，图标使用空 `alt` 或 `aria-hidden="true"`；链接/按钮的可访问名称由 DOM 标签提供。
- 金刚位整体使用真实 `a` 或 `button`，保证键盘、触摸、focus、disabled/loading 和路由行为可用。
- 不把标签烘焙进位图，不用 CSS background 承载唯一的可访问语义。
- 对非首屏入口按项目策略懒加载；首屏关键入口不得因懒加载闪烁或错位。

## 8. 普通小图标规则

非主视觉辅助小图标允许使用第三方图标，但必须同时满足：

1. 优先复用项目已经安装并批准的单一图标库，不混用多个库、emoji 和字符图标。
2. 记录包名、版本、实际 `libraryImport`、导出图标名、实现源码及哈希；批准库同时登记实际 import 文件及哈希、对应 `package.json` 及哈希、许可证及哈希。验证器会读取包元数据并要求声明的 name/version 一致，还会要求实现源码存在可执行的 import/require/dynamic import 和图标名引用，不接受只填写字符串、注释或无关许可证。
3. 统一尺寸、线宽、圆角、fill/stroke、基线和点击热区。
4. 图标只做装饰时隐藏于辅助技术；独立图标按钮必须提供可访问名称。
5. 第三方图标一旦承担金刚位主入口视觉，即违反本合同，即使外观与参考图相似也不得通过。
6. 每个第三方辅助图标必须登记唯一 `domLocator` 与 `assetLocator`；实际可见图标节点必须携带与库存一致的 `data-icon-library`、`data-icon-version`、`data-icon-name`。最终捕获逐项核对，避免用一份无关许可声明替代实际使用证据。
7. CSS `background-image`、mask、list image、cursor、`content:url(...)`、伪元素以及元素属性中的 `data:`/`blob:` 图片都会被扫描；blob 一律阻断，data URL 的解码字节哈希必须命中已登记本地资产。

`implementationPath`、批准库的 import/package.json/license 路径均按最终 `manifest.json` 所在目录解析，也可使用绝对路径；每个路径必须同时登记当前 SHA-256。`implementationPath` 对应实际渲染该图标的源码；`libraryImport` 必须等于批准包名或该包的深层导入路径，并在源码的 import/require 中出现。

## 9. 像素验收冲突

图片生成模型不能保证复现参考图中原图标的每个像素。仍然执行整页 exact 差分，并按实际结果声明：

- 生成图标最终像素恰好通过整体 exact 时，可正常声明 exact。
- 生成图标造成非零差异时，整体 exact 失败；不得单独蒙掉金刚位后仍称 100%。
- 用户要求“必须生成”与“必须复现原图标像素”冲突时，优先遵守明确的生成来源要求，同时把视觉等级降为 `thresholded`（需用户批准）或 `blocked`。
- 生产 `release-ready` 与视觉 `exact` 分开报告；不要用可上线质量掩盖像素差异，也不要用像素一致掩盖生产缺口。
