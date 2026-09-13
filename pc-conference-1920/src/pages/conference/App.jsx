import { TicketModal } from "../../shared/TicketModal.jsx";

const pillars = [
  { mark: "会", title: "主场会议", lines: ["开幕式、主题大会", "成果集中发布"], english: "MEET", color: "#11c6b0" },
  { mark: "赛", title: "创新赛事", lines: ["博士博士后", "创新创业大赛"], english: "RACE", color: "#ff7300" },
  { mark: "论", title: "专题论坛", lines: ["前沿产业与人才", "发展专题论坛"], english: "FORUM", color: "#ffb900" },
  { mark: "洽", title: "合作洽谈", lines: ["人才、项目与产业", "精准对接"], english: "CONNECT", color: "#e92f75" },
  { mark: "嘉年华", title: "嘉年华", lines: ["科技、文化、城市、", "潮玩与美食"], english: "CARNIVAL", color: "#139edf" },
];

const highlights = [
  { image: "itdc-auditorium.png", title: "群贤毕至 · 智汇湾区", description: "国际顶尖人才、院士专家、产业领军者与青年科技人才共聚松山湖" },
  { image: "itdc-wave-stage.png", title: "前沿开麦 · 思想交锋", description: "聚焦前沿产业、业界观点、创新态势与原创思想充分碰撞" },
  { image: "itdc-venue-center.png", title: "人才嘉年华 · 活力新湾区", description: "科技、文化、城市、潮玩与美食交融，打造国际人才多元体验场" },
  { image: "itdc-quantum-cube.png", title: "硬核科创 · 预见未来", description: "前沿科技成果集中亮相，在互动体验中感受创新改变未来" },
];

const companyNames = ["华为", "腾讯", "中国移动", "比亚迪", "OPPO", "大疆创新", "平安科技", "vivo", "中国联通", "招商银行", "中兴通讯", "美的", "海信", "金蝶", "TCL", "科大讯飞", "顺丰科技", "广汽集团"];
const mediaNames = ["新华社", "人民日报", "南方日报", "粤港澳大湾区门户网", "36氪", "澎湃", "科技日报", "中国青年报", "广东卫视", "南方都市报", "羊城晚报", "南方财经", "界面新闻", "经济观察报", "凤凰网科技", "新浪科技", "腾讯新闻", "央视网"];

function PartnerGrid({ kind, names }) {
  return <div className="partner-grid">{names.map((name, index) => <div className="partner-card" key={name}><img src={`./assets/partners/${kind}-${index + 1}.png`} alt={`${name}标识`} /></div>)}</div>;
}

function Brand() {
  return <div className="brand" aria-label="ITDC 第四届粤港澳大湾区人才高质量发展大会"><strong>ITDC</strong><span>第四届粤港澳大湾区<br/>人才高质量发展大会</span></div>;
}

function SectionTitle({ eyebrow, children }) {
  return <div className="section-title"><p>{eyebrow}</p><h2>{children}</h2><i /></div>;
}

function App() {
  return (
    <main className="page" data-ui-ready="true" aria-label="第四届粤港澳大湾区人才高质量发展大会首页">
      <header className="header">
        <Brand />
        <nav aria-label="主导航"><a className="active" href="./index.html">大会</a><a href="./schedule.html">日程</a><a href="./news.html">资讯</a><a href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票</a></nav>
      </header>

      <section className="hero" id="conference">
        <img src="./assets/itdc-hero-center.png" alt="明亮的湾区未来会展中心" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1>第四届粤港澳大湾区<br/>人才高质量发展大会</h1>
          <h2>暨第三届粤港澳大湾区博士博士后创新创业大赛</h2>
          <p className="theme">才汇湾区 <i/> 博创未来</p>
          <time dateTime="2026-10-25">2026.10.25–26</time>
          <p className="place">东莞 · 大湾区大学（松山湖校区）</p>
        </div>
      </section>

      <section className="pillars" id="schedule">
        {pillars.map((pillar) => <article key={pillar.mark} style={{ "--pillar": pillar.color }}><b>{pillar.mark}</b><h3>{pillar.title}</h3><p>{pillar.lines[0]}<br/>{pillar.lines[1]}</p><span>{pillar.english}</span></article>)}
      </section>

      <section className="about">
        <div className="about-copy"><SectionTitle eyebrow="ABOUT THE CONFERENCE">关于大会</SectionTitle><p>粤港澳大湾区人才高质量发展大会是服务国家战略，聚焦人才引领发展的高端平台。大会立足湾区、辐射全国，汇聚海内外顶尖人才与创新资源，推动开放合作、互利共赢的交流合作平台。</p><p>通过主场会议、创新赛事、专题论坛、合作洽谈与人才嘉年华，促进人才、科技、产业与资本的深度融合。</p></div>
        <figure><img src="./assets/itdc-auditorium.png" alt="蓝紫色大会主会场与演讲嘉宾"/><button aria-label="播放大会介绍">▶</button><figcaption><strong>才汇湾区　博创未来</strong><span>第四届粤港澳大湾区人才高质量发展大会</span></figcaption></figure>
      </section>

      <section className="highlights" id="highlights">
        <SectionTitle eyebrow="CONFERENCE HIGHLIGHTS">大会亮点</SectionTitle>
        <div className="highlight-grid">{highlights.map((item) => <article key={item.title}><img src={`./assets/${item.image}`} alt={item.title}/><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
      </section>

      <section className="partners" id="partners">
        <SectionTitle eyebrow="OUR PARTNERS">合作伙伴</SectionTitle>
        <h3>合作企业</h3><PartnerGrid kind="company" names={companyNames}/>
        <h3>合作媒体</h3><PartnerGrid kind="media" names={mediaNames}/>
      </section>

      <footer id="contact">
        <div className="footer-grid">
          <section><h3>主办单位</h3><p>粤港澳大湾区人才高质量发展联盟<br/>大会组委会<br/>广东省人才工作相关部门</p></section>
          <section><h3>承办单位</h3><p>粤港澳大湾区人才服务中心<br/>东莞市人才服务相关机构</p></section>
          <section><h3>联系我们</h3><p>大会咨询　0769–8888 6688<br/>投稿咨询　register@gbtalent.cn<br/>商务合作　business@gbtalent.cn<br/>东莞 · 松山湖科学城</p></section>
          <figure><img src="./assets/follow-qr.png" alt="微信公众号二维码"/><figcaption>微信公众号</figcaption></figure>
          <figure><img src="./assets/registration-qr.png" alt="大会小程序码"/><figcaption>大会小程序</figcaption></figure>
        </div>
        <div className="footer-bottom"><span>© 2026 第四届粤港澳大湾区人才高质量发展大会</span><span>粤ICP备00000000号　｜　粤公网安备00000000000000号</span></div>
      </footer>
      <TicketModal />
    </main>
  );
}

export { App };
