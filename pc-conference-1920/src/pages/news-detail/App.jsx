import { TicketModal } from "../../shared/TicketModal.jsx";

const mainParagraph = "第四届粤港澳大湾区人才高质量发展大会将于2026年10月25日在东莞松山湖国际创新创业社区启幕。本届大会以“汇聚湾区英才 共创人才未来”为主题，聚焦人才高质量发展，围绕战略引领、产业协同、科技创新、青年成长等核心议题，汇聚全球智慧，共绘湾区人才发展新蓝图。";

function Brand() {
  return <div className="brand" aria-label="HTDC 粤港澳大湾区人才高质量发展大会"><i className="brand-mark" aria-hidden="true" /><strong>HTDC</strong><span>粤港澳大湾区人才<br />高质量发展大会<small>GREATER BAY AREA TALENT<br />DEVELOPMENT CONFERENCE</small></span></div>;
}

function Quote({ children, author }) {
  return <aside className="quote"><b aria-hidden="true">“</b><p>{children}</p>{author && <em>— {author}</em>}</aside>;
}

function Footer() {
  return <footer>
    <div className="footer-grid">
      <section><h3>主办单位</h3><p>广东省人力资源和社会保障厅<br />香港特别行政区政府劳工及福利局<br />澳门特别行政区政府人才发展委员会</p></section>
      <section><h3>承办单位</h3><p>东莞市人民政府<br />广东省人力资源和社会保障厅<br />粤港澳大湾区人才协同发展联盟</p></section>
      <section><h3>联系我们</h3><p>☎　0769–2289 8888<br />✉　gba_talent@dg.gov.cn<br />⌖　广东省东莞市松山湖管委会<br />　　科技大道1号</p></section>
      <figure><img src="./assets/follow-qr.png" alt="微信公众号二维码" /><figcaption>微信公众号</figcaption></figure>
      <figure><img src="./assets/registration-qr.png" alt="大会小程序二维码" /><figcaption>大会小程序</figcaption></figure>
    </div>
    <div className="footer-bottom"><span>© 2026　第四届粤港澳大湾区人才高质量发展大会　版权所有</span><span>粤ICP备 2022012345号-1　｜　粤公网安备 44019002001234号</span></div>
  </footer>;
}

function App() {
  return <main className="page" data-ui-ready="true" aria-label="HTDC 大会新闻详情页">
    <header className="header"><Brand /><nav aria-label="主导航"><a href="./index.html">大会</a><a href="./schedule.html">日程</a><a className="active" href="./news.html">资讯</a><a href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票 <b>›</b></a></nav></header>
    <section className="article-shell" id="news"><article className="article-card">
      <div className="article-head"><span className="type-chip">大会动态</span><h1>大会开幕在即 · 共话人才高质量发展新机遇</h1><p className="meta">◷　2026.10.20　｜　来源：大会组委会　｜　◉　1286</p></div>
      <Quote>第四届粤港澳大湾区人才高质量发展大会将于10月25日在东莞松山湖启幕。<br />大会汇聚国际人才、院士专家与产业领军者，共话湾区人才发展新机遇。</Quote>
      <figure className="hero-photo"><img src="./assets/htdc-opening-stage.png" alt="蓝色大会开幕会场" /><figcaption><strong>第四届粤港澳大湾区人才高质量发展大会</strong><span>汇聚湾区英才　共创人才未来</span><small>中国·东莞·松山湖　　2026.10.25</small></figcaption></figure>
      <p>{mainParagraph}</p>
      <h2>汇聚湾区英才　共启发展新篇</h2>
      <p>大会将邀请海内外院士专家、知名高校学者、跨国企业高管、独角兽企业创始人等重磅嘉宾，通过主旨演讲、圆桌对话、项目路演等形式，探讨人才与产业深度融合的创新路径，助力粤港澳大湾区建设具有全球影响力的人才高地和创新高地。</p>
      <Quote author="大会组委会">以人才链接产业，以创新驱动未来，<br />让更多青年人才在湾区成就梦想。</Quote>
      <figure className="panel-photo"><img src="./assets/htdc-forum-panel.png" alt="大会圆桌论坛" /><figcaption>高端对话：人才驱动产业创新与高质量发展</figcaption></figure>
      <h2>多元场景释放人才活力</h2>
      <p>大会期间将举办人才嘉年华、前沿科技成果展、青年创新创业大赛、人才供需对接会等多元活动，打造集交流、展示、对接、体验于一体的综合平台，推动人才链、创新链、产业链、资金链深度融合。</p>
      <p>作为粤港澳大湾区人才领域的标志性盛会，大会将持续优化服务体验，营造国际化、市场化、法治化、便利化的人才发展环境，吸引更多全球英才选择湾区、扎根湾区、建设湾区。</p>
      <strong className="closing">10月25日，东莞松山湖，我们不见不散！</strong><span className="signature">大会组委会</span>
    </article></section>
    <Footer />
    <TicketModal />
  </main>;
}

export { App };
