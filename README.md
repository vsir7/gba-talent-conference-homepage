# 大会静态部署包

这是第四届粤港澳大湾区人才高质量发展大会的静态前端包。将全部文件和子目录原样上传到任意静态 Web 服务器目录，即可直接访问。

## 运行要求

- 不需要 Node.js、npm、数据库或后端服务。
- 所有样式、脚本和图片均为本地相对路径，不依赖外部 CDN。
- 页面默认适配手机，并在 `750px` 画布下启用专门的宽版信息重排；不通过缩放或横向滚动塞入内容。
- 可部署在域名根目录或任意子目录；请保持 `design-system/` 与 `public/` 的目录结构不变。

## 页面入口

- `index.html`：大会首页
- `schedule.html`：大会日程
- `entry-service.html`：入场服务

## 主要文件

- `styles.css`、`schedule.css`、`entry-service.css`：页面样式
- `app.js`、`schedule.js`、`schedule-model.js`、`entry-service.js`：交互逻辑
- `design-system/tokens/`：设计变量
- `public/assets/reference/`、`public/assets/schedule/`、`public/assets/entry-service/`：本地图片素材
