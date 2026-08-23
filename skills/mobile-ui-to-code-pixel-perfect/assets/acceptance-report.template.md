# UI 像素验收报告

## 最终结论

- Evidence Run ID:
- Manifest SHA-256:
- Reference SHA-256:
- 页面 / 状态：
- Gate Run ID：
- Manifest / SHA-256：
- 代码 revision / dirty：
- 视觉还原等级：exact / thresholded / masked / blocked
- 生产交付等级：release-ready / integration-blocked / visual-only / blocked
- 允许使用的声明：
- 清单：
- 最终捕获：
- 最终指标：

## 渲染合同

| 项目 | 值 |
| --- | --- |
| 参考图 / SHA-256 | |
| Source quality：original-uncompressed / compressed-derivative / unknown-provenance | |
| CSS 视口 / DPR / screenshot scale | |
| isMobile / hasTouch | |
| 目标像素尺寸 | |
| 浏览器 / 版本 / OS | |
| locale / timezone / theme | |
| 字体与字重 | |
| 捕获状态与滚动位置 | |
| 合同选择依据 / 被否决候选 | |
| 验收阈值 / 蒙版 | |
| 阈值批准人 / 时间 / 原因 | |
| 生产构建产物 / SHA-256 | |
| 正式路由 / 最终 URL / HTTP 状态 | |
| Node / Playwright | |

## 迭代记录

| 轮次 | 截图 | 本轮变量组 | exact mismatch | tolerated mismatch | similarity | 差异包围盒 | 修复动作 | 结果 |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |

## 最终证据

- `reference-metadata.json`：
- `.capture.json`：
- 连续候选截图稳定性 `metrics.json`：
- `diff.png`：
- `overlay.png`：
- `metrics.json`：
- 三次候选截图 SHA-256：
- 候选两两 exact 结果：
- 每轮迭代 ledger：
- 最终 URL / HTTP 状态：
- HTTP 4xx/5xx / failed request / console 汇总：
- 375 / 390 / 414 或项目目标宽度截图：
- 控制台、图片、字体、溢出和交互检查：
- 金刚位生成清单 / 校验报告：
- 原始/提取/生成素材清单与哈希：
- 普通小图标库 / 版本 / 许可：
- `release-readiness.md`：
- build / typecheck / lint / test / production preview 日志：
- `final/visual-fidelity-result.json` / gate 退出码 / `visualGrade` / `exact100PercentEligible`：
- `final/production-acceptance-result.json` / gate 退出码 / `productionReady`（仅生产交付）：

## 已闭环差异

| 位置 | 差异类型 | 参考表现 | 首轮实现 | 修复动作 | 复验 |
| --- | --- | --- | --- | --- | --- |

## 剩余限制

只记录有证据的未闭环项、静态图未提供的信息和 exact 阻断条件。
