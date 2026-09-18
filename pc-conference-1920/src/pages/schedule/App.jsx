import { TicketModal } from "../../shared/TicketModal.jsx";

const filters = ["全部", "大会盛典", "创新赛事", "主题论坛", "合作洽谈", "嘉年华", "同期活动"];

const people = {
  li: { name: "李泽湘", role: "院士专家", image: "speaker-li-hd.png" },
  yu: { name: "余承东", role: "产业领军者", image: "speaker-yu-hd.png" },
  gao: { name: "高文", role: "院士专家", image: "speaker-gao-hd.png" },
  zhang: { name: "张宏明", role: "青年人才代表", image: "speaker-zhang-hd.png" },
};

const events = [
  {
    tag: "主场会议",
    title: "大会开幕式",
    description: "开幕致辞与主旨演讲，汇聚湾区领导、院士专家与产业领袖，共话人才发展新机遇与大湾区未来。",
    image: "itdc-wave-stage.png",
    imageTitle: <>2026 粤港澳大湾区<br />人才高质量发展大会<br /><b>开幕式</b></>,
    guests: [people.li, people.yu, people.gao],
    time: "10月25日 09:00—09:45",
    venue: "大会主会场",
  },
  {
    tag: "主场会议",
    title: "创新大讲堂：技术创新与产业未来",
    description: "权威学者与行业领军者发表主题演讲，分享前沿洞察与实践经验，引领创新思想，启迪未来发展。",
    image: "schedule-keynote.png",
    guests: [people.gao, { ...people.li, role: "创新创业导师" }, people.yu],
    time: "10月25日 09:30—11:30",
    venue: "广交会展馆 A 区 1.2 馆",
    href: "./schedule-detail.html",
  },
  {
    tag: "专题论坛",
    title: "粤港澳博士博士后创新创业学术创新高峰论坛",
    description: "聚焦博士博士后人才创新创业生态建设，探讨学术创新与成果转化路径，推动湾区产学研深度融合。",
    image: "schedule-panel.png",
    imageTitle: <>粤港澳博士博士后创新创业<br />学术创新高峰论坛</>,
    guests: [{ ...people.li, role: "创新创业导师" }, people.gao, people.zhang],
    time: "10月25日 14:00—12:00",
    venue: "分会场A",
  },
  {
    tag: "专题论坛",
    title: "专家圆桌对话会",
    description: "邀请多领域专家展开深度对话，碰撞思想火花，剖析热点议题，共谋发展新路径。",
    image: "schedule-roundtable.png",
    imageTitle: <>专家圆桌对话会</>,
    guests: [people.yu, people.gao, people.zhang],
    time: "10月25日 14:30—16:30",
    venue: "分会场B",
  },
  {
    tag: "专题论坛",
    title: "第三届博士后学术年会",
    description: "展示博士后研究成果与创新实践，促进学术交流与合作，助力青年人才成长与学术共同体建设。",
    image: "itdc-wave-stage.png",
    imageTitle: <>第三届博士后学术年会</>,
    guests: [{ ...people.li, role: "创新创业导师" }, people.yu, people.zhang],
    time: "10月25日 16:00—18:00",
    venue: "学术报告厅",
  },
];

function Brand() {
  return <div className="brand" aria-label="ITDC 第四届粤港澳大湾区人才高质量发展大会"><strong>ITDC</strong><span>第四届粤港澳大湾区<br />人才高质量发展大会</span></div>;
}

function Guest({ guest }) {
  return <article className="guest"><img src={`./assets/${guest.image}`} alt={guest.name} /><p><strong>{guest.name}</strong><span>{guest.role}</span></p></article>;
}

function AgendaCard({ item }) {
  const content = <>
      <figure className="agenda-cover"><img src={`./assets/${item.image}`} alt={`${item.title}会场`} />{item.imageTitle && <figcaption>{item.imageTitle}</figcaption>}</figure>
      <section className="agenda-copy">
        <div className="agenda-main">
          <div className="title-line"><span>{item.tag}</span><h3>{item.title}</h3></div>
          <p className="description">{item.description}</p>
          <h4>出席嘉宾</h4>
          <div className="guests">{item.guests.map((guest, index) => <Guest guest={guest} key={`${guest.name}-${index}`} />)}</div>
        </div>
        <div className="agenda-meta"><p><i className="clock" aria-hidden="true" />{item.time}</p><p><i className="pin" aria-hidden="true" />{item.venue}</p></div>
      </section>
    </>;
  return item.href ? <a className="agenda-card" href={item.href} aria-label={`查看${item.title}详情`}>{content}</a> : <article className="agenda-card">{content}</article>;
}

function App() {
  return (
    <main className="page" data-ui-ready="true" aria-label="第四届粤港澳大湾区人才高质量发展大会日程页">
      <header className="header"><Brand /><nav aria-label="主导航"><a href="./index.html">大会</a><a className="active" href="./schedule.html">日程</a><a href="./news.html">资讯</a><a href="./service.html">服务</a><a className="ticket" href="#ticket-dialog">去抢票</a></nav></header>

      <section className="hero" id="conference"><img src="./assets/itdc-wave-stage.png" alt="蓝色大会主会场" /><div className="hero-shade" /><div className="hero-copy"><h1>日程</h1><h2>两天议程 · 多元场景 · 湾区共振</h2><time>2026.10.25—26</time><p>东莞 · 大湾区大学（松山湖校区）</p></div></section>

      <section className="agenda" id="agenda"><div className="agenda-inner">
        <div className="section-title"><h2>大会日程</h2><i /></div>
        <div className="date-tabs" role="tablist" aria-label="日程日期"><button className="active" role="tab" aria-selected="true">10.25 星期日</button><button role="tab" aria-selected="false">10.26 星期一</button></div>
        <div className="filters" aria-label="活动分类筛选">{filters.map((filter, index) => <button className="filter-chip" type="button" aria-pressed={index === 0 ? "true" : "false"} key={filter}>{filter}</button>)}</div>
        <div className="agenda-list">{events.map((item) => <AgendaCard item={item} key={item.title} />)}</div>
      </div></section>

      <footer id="contact"><div className="footer-grid">
        <section><h3>主办单位</h3><p>粤港澳大湾区人才高质量发展大会组委会<br />广东省人才工作领导小组办公室</p></section>
        <section><h3>承办单位</h3><p>粤港澳大湾区人才服务中心<br />东莞市人才资源和社会保障服务机构</p></section>
        <section><h3>联系我们</h3><p>☎　0769–8888 8888<br />▣　register@gbtalent.cn<br />◎　https://www.gbtalent.cn<br />⌖　东莞 · 松山湖科学城</p></section>
        <figure><img src="./assets/follow-qr.png" alt="微信公众号二维码" /><figcaption>微信公众号</figcaption></figure>
        <figure><img src="./assets/registration-qr.png" alt="大会小程序码" /><figcaption>大会小程序</figcaption></figure>
      </div><div className="footer-bottom"><span>© 2026 第四届粤港澳大湾区人才高质量发展大会</span><span>粤ICP备00000000号　｜　粤公网安备00000000000000号</span></div></footer>
      <TicketModal />
    </main>
  );
}

export { App };
