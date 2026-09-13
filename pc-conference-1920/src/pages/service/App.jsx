import { TicketModal } from "../../shared/TicketModal.jsx";

const menu = [
  ["notice", "参会须知"], ["map", "场馆导览"], ["bus", "交通接驳"],
  ["bed", "住宿餐饮"], ["building", "城市指南"], ["help", "常见问题"],
];

const notices = [
  ["qr", "入场凭证", "电子证件二维码入场；仅限本人使用"],
  ["check", "签到与入场", "现场扫码签到；提前到场安检"],
  ["id", "证件要求", "携带有效身份证件；信息与报名一致"],
  ["shield", "安检要求", "禁止危险物品；大型行李寄存"],
  ["list", "会前准备", "关注大会通知；携带名片交流"],
  ["person", "现场安全", "遵守会场秩序；听从人员指引"],
];

const support = [
  ["headset", "大会咨询", "09:00—18:00"],
  ["document", "报名咨询", "09:00—18:00"],
  ["handshake", "商务合作", "09:00—18:00"],
];

function Icon({ name, className = "" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const body = {
    notice: <><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4V2m6 2V2M8 8h8m-6 4h4m-5 5h6"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/><circle cx="12" cy="10" r="2"/></>,
    bus: <><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 9h16M8 18v2m8-2v2M7 13h.01M17 13h.01"/></>,
    bed: <><path d="M3 18V8m18 10v-7a3 3 0 0 0-3-3H9v10M3 14h18M7 8V5h5a3 3 0 0 1 3 3"/></>,
    building: <><path d="M4 21V8l7-3v16m0-10h9v10M7 10v2m0 3v2m7-3v2m3-2v2M2 21h20"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.4 1-1.4 2M12 17h.01"/></>,
    qr: <><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm11 0h2v2h-2zm3 0h2v6h-6v-2m2 0h2"/></>,
    check: <><path d="M9 4h6m-8 2h10a2 2 0 0 1 2 2v12H5V8a2 2 0 0 1 2-2Z"/><path d="m9 14 2 2 4-5"/></>,
    id: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16a3 3 0 0 1 5 0M14 10h4m-4 4h4"/></>,
    shield: <><path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z"/><path d="m8.5 12 2.3 2.3 4.7-5"/></>,
    list: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h6M7 8h.01M7 12h.01M7 16h.01"/></>,
    person: <><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3m-3-7 2-2 2 2"/></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2Z"/></>,
    document: <><path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h5M9 12h6m-6 4h4"/><circle cx="18" cy="18" r="3"/></>,
    handshake: <><path d="m3 11 4-4 4 1 2-1 4 4m-9 3 4 4a2 2 0 0 0 3 0l6-6-4-5-4 1-3 3-2-2"/><path d="m6 16-3-3 4-5"/></>,
  }[name];
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" {...common}>{body}</svg>;
}

function Brand() {
  return <div className="brand"><strong>ITDC</strong><span>第四届粤港澳大湾区<br/>人才高质量发展大会</span></div>;
}

function App() {
  return (
    <main className="page" data-ui-ready="true" aria-label="大会服务页面">
      <header className="header"><Brand/><nav><a href="./index.html">大会</a><a href="./schedule.html">日程</a><a href="./news.html">资讯</a><a className="active" href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票</a></nav></header>

      <section className="hero"><img src="./assets/itdc-hero-center.png" alt="湾区未来会展中心"/><div className="hero-shade"/><div className="hero-copy"><h1>服务</h1><h2>湾区相聚 · 服务相伴</h2><p>为每一位参会者提供清晰、便捷、可靠的大会服务</p></div></section>

      <section className="services" id="services">
        <div className="section-title"><h2>大会服务</h2><i/></div>
        <div className="service-layout">
          <nav className="service-menu" aria-label="大会服务分类">{menu.map(([icon, label], index) => <button className={index === 0 ? "active" : ""} key={label}><Icon name={icon}/><span>{label}</span></button>)}</nav>
          <article className="notice-panel"><header><h2>参会须知</h2><p>请提前了解大会入场与活动安排，做好参会准备。</p></header><ul>{notices.map(([icon, title, description]) => <li key={title}><span className="notice-icon"><Icon name={icon}/></span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></article>
        </div>
      </section>

      <section className="support"><div className="support-title"><h2>咨询支持</h2><i/></div><div className="support-cards">{support.map(([icon, title, time]) => <article key={title}><Icon name={icon}/><div><h3>{title}</h3><p>{time}</p></div><span>→</span></article>)}</div></section>

      <footer id="contact"><div className="footer-grid"><section><h3>主办单位</h3><p>粤港澳大湾区人才高质量发展<br/>大会组委会<br/>广东省人才工作局等部门</p></section><section><h3>承办单位</h3><p>粤港澳大湾区人才服务中心<br/>东莞市人才服务领导机构</p></section><section><h3>联系我们</h3><p>大会咨询　0769–8888 6688<br/>投稿邮箱　register@gbtalent.cn<br/>商务合作　business@gbtalent.cn<br/>东莞 · 松山湖科学城</p></section><figure><img src="./assets/follow-qr.png" alt="微信公众号二维码"/><figcaption>微信公众号</figcaption></figure><figure><img src="./assets/registration-qr.png" alt="大会小程序码"/><figcaption>大会小程序</figcaption></figure></div><div className="footer-bottom"><span>© 2026 第四届粤港澳大湾区人才高质量发展大会</span><span>粤ICP备00000000号　｜　粤公网安备00000000000000号</span></div></footer>
      <TicketModal />
    </main>
  );
}

export { App };
