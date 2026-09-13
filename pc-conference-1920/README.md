# PC 端大会官网 1920px HTML 还原

本项目把飞书文档中的 6 张 PC 端页面截图还原为可运行的 React + Vite 多页面网站。所有主页面固定为 1920px 宽，图片、文字、按钮、导航和弹窗均为真实 DOM 元素。

## 页面

- `/index.html`：大会首页
- `/schedule.html`：大会日程
- `/news.html`：资讯列表
- `/news-detail.html`：资讯详情
- `/service.html`：大会服务
- `/ticket.html`：抢票须知

## 本地运行

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 4310
```

生产构建：

```bash
npm run build
npm run test:sites
```
