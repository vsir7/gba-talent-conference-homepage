import { TicketModal } from "../../shared/TicketModal.jsx";

const newsCards = [
  { image: "news-skyline.png", tag: "大会动态", title: "湾区人才协同发展大会重磅议题发布", description: "聚焦区域协同、产业创新与人才生态，多维议题共探湾区人才发展新路径。", date: "2026.10.17" },
  { image: "news-carnival.png", tag: "大会动态", title: "人才嘉年华将在松山湖开启多元体验", description: "科技、文化、城市、潮玩与美食交融，打造属于人才的多元体验场。", date: "2026.10.16" },
  { image: "news-expo.png", tag: "大会动态", title: "前沿科技成果展亮点抢先看", description: "一批硬核科技成果将集中亮相，见证湾区创新力量的突破与发展。", date: "2026.10.15" },
  { image: "news-open-mic.png", tag: "大会动态", title: "湾区人才开放麦报名正式启动", description: "短演表达与交流平台，汇聚青年声音，激发人才创新活力。", date: "2026.10.14" },
  { image: "news-station.png", tag: "通知公告", title: "大会交通与入场指引正式发布", description: "地铁、公交、自驾全攻略，助您高效出行，畅享大会体验。", date: "2026.10.13" },
  { image: "news-handshake.png", tag: "媒体报道", title: "合作伙伴持续扩容，共建人才发展生态", description: "携手更多优质伙伴，汇聚湾区力量，共建开放共融的人才发展生态。", date: "2026.10.12" },
];

function Brand() {
  return <div className="brand" aria-label="ITDC 第四届粤港澳大湾区人才高质量发展大会"><strong>ITDC</strong><span>第四届粤港澳大湾区<br />人才高质量发展大会</span></div>;
}

function Feature({ className = "", image, title, description, date, href }) {
  const content = <><img src={`./assets/${image}`} alt={title} /><div className="feature-copy"><h3>{title}</h3>{description && <p>{description}</p>}<time>{date}</time></div></>;
  return href ? <a className={`feature ${className}`} href={href}>{content}</a> : <article className={`feature ${className}`}>{content}</article>;
}

function App() {
  return (
    <main className="page" data-ui-ready="true" aria-label="第四届粤港澳大湾区人才高质量发展大会资讯页">
      <header className="header"><Brand /><nav aria-label="主导航"><a href="./index.html">大会</a><a href="./schedule.html">日程</a><a className="active" href="./news.html">资讯</a><a href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票</a></nav></header>

      <section className="hero" id="news"><img src="./assets/itdc-hero-center.png" alt="明亮的湾区未来会展中心" /><div className="hero-shade" /><div className="hero-copy"><h1>资讯</h1><p>聚焦大会动态 · 洞察湾区人才新趋势</p><i /></div></section>

      <section className="latest"><div className="latest-inner">
        <h2>最新资讯</h2>
        <div className="tabs" role="tablist" aria-label="资讯分类"><button className="active" role="tab" aria-selected="true">全部</button><button role="tab">大会动态</button><button role="tab">通知公告</button></div>
        <div className="feature-grid">
          <Feature className="feature-main" href="./news-detail.html" image="itdc-auditorium.png" title="大会开幕在即 · 共话人才高质量发展新机遇" description="第四届粤港澳大湾区人才高质量发展大会将于10月25日在东莞松山湖启幕。" date="2026.10.20" />
          <div className="feature-side"><Feature image="news-panel.png" title="全球人才汇聚湾区，重点嘉宾阵容陆续揭晓" date="2026.10.19" /><Feature image="news-competition.png" title="博士博士后创新创业大赛进入决赛阶段" date="2026.10.18" /></div>
        </div>
        <div className="news-grid">{newsCards.map((item) => <article className="news-card" key={item.title}><img src={`./assets/${item.image}`} alt={item.title} /><div className="news-copy"><span>{item.tag}</span><h3>{item.title}</h3><p>{item.description}</p><time>{item.date}</time></div></article>)}</div>
        <nav className="pagination" aria-label="资讯分页"><a className="current" href="#page-1">1</a><a href="#page-2">2</a><a href="#page-3">3</a><a className="next" href="#next">下一页 ›</a></nav>
      </div></section>

      <footer id="contact"><div className="footer-grid">
        <section><h3>主办单位</h3><p>粤港澳大湾区人才高质量发展<br />大会组委会<br />广东省人才工作领导部门</p></section>
        <section><h3>承办单位</h3><p>粤港澳大湾区人才服务中心<br />东莞市人才资源服务机构</p></section>
        <section><h3>联系我们</h3><p>大会咨询　0769–8888 8888<br />投稿邮箱　register@gbtalent.cn<br />商务合作　business@gbtalent.cn<br />东莞 · 松山湖科学城</p></section>
        <figure><img src="./assets/follow-qr.png" alt="微信公众号二维码" /><figcaption>微信公众号</figcaption></figure>
        <figure><img src="./assets/registration-qr.png" alt="大会小程序码" /><figcaption>大会小程序</figcaption></figure>
      </div><div className="footer-bottom"><span>© 2026 第四届粤港澳大湾区人才高质量发展大会</span><span>粤ICP备00000000号　｜　粤公网安备00000000000000号</span></div></footer>
      <TicketModal />
    </main>
  );
}

export { App };
