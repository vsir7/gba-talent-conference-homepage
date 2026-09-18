import { TicketModal } from "../../shared/TicketModal.jsx";

const guests = [
  { name: "林嘉言", role: "首席科学家", note: "引领前沿科技\n探索产业未来", image: "speaker-yu-hd.png" },
  { name: "周若宁", role: "副院长", note: "产学研协同\n助力创新发展", image: "speaker-zhang-hd.png" },
  { name: "许文川", role: "主任", note: "聚焦产业实践\n促进成果转化", image: "speaker-gao-hd.png" },
];

const agenda = [
  ["09:30 — 09:50", "开场致辞：湾区人才协同发展"],
  ["09:50 — 10:40", "主题分享：技术创新与产业未来"],
  ["10:40 — 11:30", "圆桌对话：人才、技术与产业融合"],
];

const notes = [
  "本次活动需提前报名并获取电子门票，凭票入场。",
  "门票仅限本人使用，不可转让、不可售卖。",
  "请于活动开始前 30 分钟到达会场，完成签到入场。",
  "场内请自觉遵守会场秩序，关闭手机或调至静音状态。",
  "如因不可抗力导致活动调整，请以大会官网最新通知为准。",
];

function Brand() {
  return <div className="brand" aria-label="ITDC 第四届粤港澳大湾区人才高质量发展大会"><strong>ITDC</strong><span>第四届粤港澳大湾区<br />人才高质量发展大会</span></div>;
}

function SectionLabel({ title, english }) {
  return <div className="section-label"><h2>{title}</h2><span>{english}</span><i /></div>;
}

function App() {
  return (
    <main className="page" data-ui-ready="true" aria-label="创新大讲堂日程详情页">
      <header className="header"><Brand /><nav aria-label="主导航"><a href="./index.html">大会</a><a className="active" href="./schedule.html">日程</a><a href="./news.html">资讯</a><a href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票 <b>›</b></a></nav></header>

      <section className="detail-hero">
        <div className="hero-left"><p className="breadcrumb"><a href="./schedule.html">大会日程</a><span>/</span>创新大讲堂</p><span className="category">创新大讲堂</span><h1 aria-label="创新大讲堂：技术创新与产业未来">创新大讲堂：<br />技术创新与产业未来</h1></div>
        <div className="date-panel"><strong>10</strong><i>/</i><strong>25</strong><p>2026<br />SAT.</p><time>09:30 — 11:30</time></div>
        <div className="venue"><span className="venue-pin" aria-hidden="true" /><p>广州市海珠区<br />广交会展馆 A 区 1.2 馆</p></div>
      </section>

      <section className="content">
        <figure className="stage-visual"><img src="./assets/schedule-keynote.png" alt="蓝色创新大讲堂会场" /><figcaption><strong>创新大讲堂</strong><span>技术创新与产业未来</span></figcaption></figure>

        <section className="detail-row intro"><SectionLabel title="活动简介" english={<>ABOUT<br />THIS SESSION</>} /><p>本场创新大讲堂将聚焦技术创新如何驱动产业变革与高质量发展，邀请来自学术界、产业界和投资界的专家学者，分享前沿技术趋势、产业应用实践与未来发展机遇，探讨科技创新与产业升级的深度融合，共同展望产业未来的新图景。</p></section>

        <section className="detail-row guests-row"><SectionLabel title="出席嘉宾" english="GUESTS" /><div className="guest-list">{guests.map((guest) => <article className="speaker" key={guest.name}><img src={`./assets/${guest.image}`} alt={guest.name} /><div><h3>{guest.name}</h3><b>{guest.role}</b><i /><p>{guest.note.split("\n").map((line) => <span key={line}>{line}</span>)}</p></div></article>)}</div></section>

        <section className="detail-row agenda-row"><SectionLabel title="详细议程" english="AGENDA" /><div className="agenda-lines">{agenda.map(([time, title]) => <div className="agenda-line" key={time}><time>{time}</time><strong>{title}</strong></div>)}</div></section>

        <section className="detail-row notes-row"><SectionLabel title="抢票须知" english="TICKET NOTES" /><ol>{notes.map((note, index) => <li key={note}><b>{index + 1}</b><span>{note}</span></li>)}</ol><a className="ticket-card" href="#ticket-dialog"><img src="./assets/follow-qr.png" alt="微信扫码抢票二维码" /><div><strong>微信扫码抢票</strong><span>打开微信，扫描左侧二维码<br />立即报名参会</span></div><b>›</b></a></section>
      </section>

      <footer><div className="footer-grid"><section><h3>主办单位</h3><p>粤港澳大湾区人才高质量发展大会组委会<br />广东省人才工作领导小组办公室</p></section><section><h3>承办单位</h3><p>粤港澳大湾区人才服务中心<br />东莞市人才发展和社会保障服务机构</p></section><section><h3>联系我们</h3><p>☎　0769–8888 8888<br />✉　register@gbtalent.cn<br />◎　https://www.gdtalent.cn<br />⌖　东莞 · 松山湖科学城</p></section><figure><img src="./assets/follow-qr.png" alt="微信公众号二维码" /><figcaption>微信公众号</figcaption></figure><figure><img src="./assets/registration-qr.png" alt="大会小程序码" /><figcaption>大会小程序</figcaption></figure></div><div className="footer-bottom"><span>© 2026 第四届粤港澳大湾区人才高质量发展大会　版权所有</span><span>粤ICP备00000000号-1　｜　粤公网安备 00000000000000号</span></div></footer>
      <TicketModal />
    </main>
  );
}

export { App };
