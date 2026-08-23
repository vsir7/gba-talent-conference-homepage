# 前端生产交付验收

## 结论

- Evidence Run ID:
- Manifest SHA-256:
- Reference SHA-256:
- 页面 / 状态：
- 生产交付等级：release-ready / integration-blocked / visual-only / blocked
- 视觉还原等级：exact / thresholded / masked / blocked
- 生产构建产物：
- 生产预览 URL：
- 上线阻断项：

## 项目合同

| 项目 | 值 |
| --- | --- |
| 框架 / 版本 | |
| 包管理器 / 锁文件 | |
| 正式路由 / 入口 | |
| 数据源 / API client | |
| 鉴权 / 权限机制 | |
| 样式 / 组件 / token 体系 | |
| browserslist / 设备矩阵 | |
| 可访问性标准 | |
| 性能预算 | |
| 发布与环境约定 | |

## 生产门禁矩阵

最终验收时必须保留完整 P01–P16 行；`涉及` 行结果必须是 `pass`，N/A 行的状态和结果都必须带理由。P01、P02、P03、P05–P16 对 `release-ready` 永不可 N/A；P04 仅在页面和项目确实不涉及鉴权时可带证据 N/A。命令/检查、证据和严重度/备注不得为空。

| ID | 门禁 | 状态：涉及/N/A/待确认 | 命令或检查 | 证据 | 结果 | 严重度/备注 |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | 项目原生接入 | | | | | |
| P02 | 路由与导航 | | | | | |
| P03 | 数据与类型 | | | | | |
| P04 | 鉴权与权限 | | | | | |
| P05 | 业务状态 | | | | | |
| P06 | 交互闭环 | | | | | |
| P07 | 可访问性 | | | | | |
| P08 | 移动适配 | | | | | |
| P09 | 浏览器兼容 | | | | | |
| P10 | 性能与稳定性 | | | | | |
| P11 | 安全与隐私 | | | | | |
| P12 | 国际化与内容韧性 | | | | | |
| P13 | 资产与许可 | | | | | |
| P14 | 可维护性 | | | | | |
| P15 | 工程门禁 | | | | | |
| P16 | 生产产物预览 | | | | | |

## 工程命令

| 命令 | 完整调用 | 回执 JSON / 日志哈希 | 退出码 | 结论 |
| --- | --- | ---: | --- | --- |
| build | | | | |
| typecheck | | | | |
| lint | | | | |
| unit/component | | | | |
| e2e/smoke | | | | |
| project gate | | | | |

## 状态与交互

| 场景 | 注册测试命令 | `state:<name>` 回执 | 预期 | 实际 | 结果 |
| --- | --- | --- | --- | --- | --- |
| success | | | | | |
| loading | | | | | |
| empty | | | | | |
| error / retry | | | | | |
| no permission / expired | | | | | |
| disabled / submitting | | | | | |
| route / back / refresh | | | | | |

## 生产预览证据

- 构建产物路径：
- 构建回执 / 产物哈希：
- 受控 artifact-static 预览回执 / servedRoot / 哈希：
- 首屏 / 长图 / 底部截图：
- 路由直达与刷新：
- 控制台 / page error / failed request：
- 图片 / 字体 / 资源 404：
- 目标浏览器与设备：
- 可访问性证据：
- 性能证据：
- 安全与许可证据：
- 金刚位图标清单与校验报告：
- 普通第三方图标包元数据、import/源码哈希、DOM 绑定与许可证据：
- CSS/伪元素 data/blob 图片扫描结果：
- stylesheet/嵌套 Shadow Root/`FontFace` API 的 data/blob/Buffer 字体与 frame 可审计性结果：

## 质量门禁证据

| 名称 | 注册命令 | `quality:<name>` 回执 | 目标 | 状态 |
| --- | --- | --- | --- | --- |
| accessibility | | | | |
| performance | | | | |
| security | | | | |
| asset-license | | | | |
| browser:&lt;目标浏览器&gt; | | | | |

## 已知问题

| ID | 问题 | 严重度 P0-P3 | 本次引入/基线已有 | 是否阻断 | 负责人/下一步 |
| --- | --- | --- | --- | --- | --- |
