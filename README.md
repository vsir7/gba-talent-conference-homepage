# 大会首页静态部署包

将本目录中的全部文件和子目录原样上传到任意静态 Web 服务器目录，然后访问该目录下的 `index.html` 即可。

## 运行要求

- 不需要 Node.js、npm、数据库或后端服务。
- 所有样式、脚本和图片均为本地相对路径，不依赖外部 CDN。
- 可以部署在域名根目录，也可以部署在任意子目录。
- 请保持 `design-system/` 与 `public/` 的目录结构不变。

## 文件入口

- 页面入口：`index.html`
- 页面样式：`styles.css`
- 交互脚本：`app.js`
- 设计变量：`design-system/tokens/design-tokens.css`
- 图片素材：`public/assets/reference/`
