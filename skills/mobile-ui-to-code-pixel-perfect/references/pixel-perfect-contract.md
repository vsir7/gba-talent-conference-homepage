# 像素级还原合同

## 目录

1. 可验证定义
2. 静态图能与不能提供的信息
3. 渲染合同字段
4. 验收等级
5. 尺寸与 DPR 规则
6. 字体与渲染稳定性
7. 容差与蒙版规则
8. 完成声明

## 1. 可验证定义

把 UI 还原看成两个确定性函数的比较：

```text
reference pixels = source(state, viewport, renderer, assets, fonts)
candidate pixels = browser(code, state, viewport, renderer, assets, fonts)
```

只有两端的状态和渲染条件一致，逐像素比较才有意义。

“100% 一致”要求同时满足：

- 参考图与候选截图方向校正后的宽高相同。
- 参考状态、滚动位置、弹层、Tab、输入值和数据相同。
- CSS 视口、DPR 和截图缩放相同。
- 浏览器 `isMobile`、`hasTouch` 和输入上下文相同。
- 浏览器引擎、版本、操作系统字体栅格化环境和颜色模式已登记。
- 精确字体文件及对应字重已加载完成。
- 所有图片、图标和背景资源已加载完成。
- 动画、过渡、光标闪烁、随机数据、当前时间和异步占位已稳定。
- 未使用排除蒙版。
- 未在比较前展平透明背景、缩放、裁切、自动对齐或执行其他会隐藏 RGBA 差异的变换。
- 同一合同下至少三次由独立新浏览器进程串行产生的候选截图，解码后 RGBA 像素两两零差异；各捕获的 ID、路径、进程身份和时间必须不同。图片容器哈希可因元数据不同而不同。
- `exactMismatchPixels = 0`。

这里的“100%”只覆盖合同登记的页面、状态、参考视口和渲染环境。不要把一个状态的通过外推为所有宽度、所有浏览器或所有交互状态都一致。

当前浏览器截图与比较器以标准 8-bit sRGB RGBA 可见输出为验收平面。若源文件包含 16-bit 通道、特殊 ICC 配置或浏览器无法保留的额外精度，exact 只证明两者的登记浏览器可见 8-bit RGBA 输出一致，不证明源文件的高位深样本或容器字节一致。

## 2. 静态图能与不能提供的信息

静态图能直接提供：

- 最终可见像素、画布尺寸、模块几何、颜色、阴影、图像裁切和当前文字换行。
- 当前状态下可见的状态栏、安全区、固定区、Tab、弹层和滚动位置线索。

静态图不能可靠提供：

- CSS 视口与导出倍率的唯一对应关系。
- 字体文件、变量字体轴、浏览器和操作系统的字体栅格化设置。
- DOM 语义、可访问性、点击区和焦点顺序。
- 屏幕外内容、滚动规则、响应式断点和其他设备表现。
- hover、focus、loading、disabled、error、success 等未展示状态。
- 动画时序、后端数据、跳转逻辑和完整业务流程。

只复刻静态图可见状态时，在交付中明确边界。用户要求补齐静态图未提供的行为时，使用产品文档、已有代码或用户确认作为新的设计源。

若当前最高质量来源只是聊天导出、压缩图或二次截图，仍可把该文件登记为参考并证明“与该文件逐像素一致”，但必须把 `sourceQuality` 标为 `compressed-derivative` 或 `unknown-provenance`。这种 exact 不证明恢复了压缩前的原始设计像素。

## 3. 渲染合同字段

每个页面、每个目标状态分别登记：

| 维度 | 必填内容 |
| --- | --- |
| Reference | 文件绝对路径、SHA-256、方向校正后像素尺寸、色彩空间、透明通道 |
| State | 状态名、路由、查询参数、数据 fixture、滚动位置、Tab、弹层、表单值 |
| Viewport | CSS width/height、DPR、截图 scale、捕获模式、目标像素宽高 |
| Renderer | 浏览器引擎与版本、OS、isMobile、hasTouch、locale、timezone、color scheme、reduced motion、scrollbar、预热截图、settle 时间 |
| Typography | 字体文件、font-family、weight、style、size、line-height、letter-spacing |
| Assets | 原始资产或提取资产路径、哈希、裁切和 object-fit/object-position |
| Stabilization | fonts ready、images decoded、network state、动画禁用、数据稳定条件 |
| Acceptance | exact/thresholded、阈值、蒙版、确认人和确认时间 |

将合同保存在 `.harness/traces/<task>/<page>/manifest.json`。合同改变后重新建立基线，不把改变前后的指标混在同一轮中。

## 4. 验收等级

### exact

要求尺寸一致、无蒙版、所有被评估像素 RGBA 差异为零。允许声明：

> 该页面的该状态在已登记渲染合同下，与参考图达到逐像素 100% 一致。

### thresholded

按用户明确批准的通道容差、最大不匹配比例和最低像素相似度验收。允许声明：

> 该页面已通过约定的像素差分阈值；实际指标为……

不得出现“100%”“完全一致”或“零差异”。

### masked

排除动态或不可控区域后验收。无论未遮罩区域是否零差异，都只能声明：

> 该页面在登记的排除区域之外通过像素验收。

列出蒙版路径、排除像素数、排除比例和原因。不要用蒙版隐藏可修复的布局、字体或素材差异。

### blocked

参考源、渲染环境、字体、资产、浏览器捕获或差分工具缺失时使用。列出已完成部分、阻断证据和最小补充材料。

## 5. 尺寸与 DPR 规则

区分三个尺寸：

```text
CSS viewport width × height
deviceScaleFactor (DPR)
screenshot pixel width × height
```

Playwright `screenshot scale=css` 通常让输出像素尺寸接近 CSS 尺寸；`scale=device` 通常让输出像素尺寸接近 CSS 尺寸乘 DPR。始终以实际截图元数据复核，不只依赖公式。

常见宽度只能作为候选：

| 图像宽度 | 常见候选 |
| --- | --- |
| 320–480 | CSS 宽度等于图像宽度、DPR 1、scale=css |
| 640 | 320 CSS px × DPR 2 |
| 720 | 360 CSS px × DPR 2 |
| 750 | 375 CSS px × DPR 2 |
| 780 | 390 CSS px × DPR 2 |
| 828 | 414 CSS px × DPR 2 |
| 1125 | 375 CSS px × DPR 3 |
| 1170 | 390 CSS px × DPR 3 |
| 1242 | 414 CSS px × DPR 3 |

不要只凭宽度选择合同。合同必须由用户明确确认、设计元数据或独立于图片宽度的可审计项目证据选定，并使用 `assets/render-contract-selection.template.json` 记录候选、取舍、来源和哈希。代理为推进开发选择的工作配置只能标为 provisional，不能进入 exact 最终门禁。长截图也必须登记有证据的 CSS viewport height，因为 vh、sticky、懒加载和虚拟列表受它影响。禁止为了让比较通过而在差分前自动缩放、拉伸或裁剪候选图。

## 6. 字体与渲染稳定性

字体通常是零差异失败的最大来源。执行以下规则：

- 获取原始字体文件和精确字重；不要用 `font-weight: 600` 假设浏览器一定存在对应实例。
- 使用 `@font-face` 本地化字体，并让 `document.fonts.ready` 成为捕获条件。
- 核对中文、英文、数字、金额、日期和百分比实际 computed font。
- 核对变量字体的 `font-variation-settings`、字距、行高、text-rendering 和字体平滑差异。
- 禁止用换字体掩盖布局问题。
- 精确字体不可获得且替代字体产生可见差异时，把 exact 标记为 blocked。

即使代码参数相同，不同操作系统和浏览器版本也可能产生不同的字形抗锯齿。参考图的原始渲染环境未知时，优先寻找设计工具、字体和设备信息；无法恢复时只能使用用户批准的 thresholded 等级。

把候选截图自稳定性作为参考图比较的前置门禁：使用全新浏览器进程串行捕获至少三次并进行 exact 比较，禁止并发截图。候选之间仍有差异时，说明渲染链路不确定，不能把其中任意一张作为 100% 结论依据。

## 7. 容差与蒙版规则

默认使用 exact，不默认应用抗锯齿忽略、背景展平、模糊、缩放、自动对齐或边缘裁切。`exact` 模式禁止使用 `--background`；透明像素的 RGB 或 alpha 任一不同都必须被计为差异。

使用 thresholded 时必须显式登记：

- `channelTolerance`：单通道允许的最大绝对误差，范围 0–255。
- `maxMismatchRatio`：超过通道容差的像素比例上限。
- `minPixelSimilarity`：基于所有被评估 RGBA 通道平均绝对误差的相似度下限。

阈值只对已登记合同有效。批准记录必须包含准确的三个数值、页面、状态、批准人、批准时间、原因和原始消息/审批来源，并使用 `assets/threshold-approval.template.json` 保存与哈希绑定。不要因为一次失败临时放宽阈值；先判断差异是几何、字体、颜色、阴影、资产还是栅格化造成的。

蒙版只能用于确实动态且无法冻结的内容，例如用户头像、实时行情或系统级时间；优先固定数据和时间。任何蒙版都必须经过用户确认，并在报告中可视化。

## 8. 完成声明

允许的声明必须与机器结果一致：

| 结果 | 允许用语 |
| --- | --- |
| exact pass，无蒙版 | 在登记合同下逐像素 100% 一致 |
| thresholded pass | 通过约定像素差分阈值 |
| masked pass | 排除登记区域后通过像素验收 |
| 人工目测 + 结构检查 | 完成人工视觉对齐和结构检查，未完成自动像素验收 |
| 无法捕获或比较 | 验收 blocked，并说明原因 |

不要把源图与实现图并排展示当成机器验收。必须同时提供差分图、叠加图、指标 JSON 和渲染捕获报告。

像素比较脚本只证明两张输入图片的像素关系，不能单独证明渲染合同、严格捕获状态或三次稳定性。视觉最终门禁运行 `scripts/verify_visual_fidelity.mjs`，核对显式合同、至少三份由独立进程产生的严格捕获、完整两两 exact 稳定性证据，以及原图与稳定候选的最终差分。只有其结果 `exact100PercentEligible = true` 才可在登记状态与合同范围内使用 100% 声明。

生产质量是另一条证据链。用户要求上线交付时，继续读取 [production-delivery-contract.md](production-delivery-contract.md)，运行生产命令、受控预览和项目门禁；不得用视觉通过替代生产通过。
