const shell = document.querySelector('.batch3-shell');
const snackbar = document.querySelector('#batch3-snackbar');
let timer;

function notify(message) {
  if (!snackbar) return;
  window.clearTimeout(timer);
  snackbar.textContent = message;
  snackbar.hidden = false;
  timer = window.setTimeout(() => { snackbar.hidden = true; }, 2400);
}

document.querySelectorAll('[data-message]').forEach((control) => {
  control.addEventListener('click', () => notify(control.dataset.message));
});

document.querySelectorAll('[data-go-back]').forEach((control) => {
  control.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'service-hall.html';
  });
});

const agendaSearch = document.querySelector('#agenda-search');
if (agendaSearch) {
  const cards = [...document.querySelectorAll('[data-search-card]')];
  const count = document.querySelector('#search-result-count');
  const filter = () => {
    const query = agendaSearch.value.trim().toLowerCase();
    let total = 0;
    cards.forEach((card) => {
      const matched = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !matched;
      if (matched) total += 1;
    });
    if (count) count.textContent = query ? `找到 ${total} 个相关日程` : '为您找到 4 个相关日程';
  };
  agendaSearch.addEventListener('input', filter);
  document.querySelectorAll('[data-search-chip]').forEach((chip) => chip.addEventListener('click', () => {
    agendaSearch.value = chip.dataset.searchChip;
    filter();
    agendaSearch.focus();
  }));
}

document.querySelectorAll('[data-follow-agenda]').forEach((control) => {
  control.addEventListener('click', () => {
    const following = control.getAttribute('aria-pressed') === 'true';
    control.setAttribute('aria-pressed', String(!following));
    control.classList.toggle('is-following', !following);
    control.textContent = following ? '关注日程' : '已关注日程';
    notify(following ? '已取消关注日程' : '已关注该日程');
  });
});

document.querySelectorAll('[data-notice-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.noticeTab;
    document.querySelectorAll('[data-notice-tab]').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-notice-card]').forEach((card) => {
      card.hidden = target !== 'all' && card.dataset.noticeCard !== target;
    });
  });
});

document.querySelectorAll('[data-notice-card]').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.remove('is-unread');
    notify('消息已标记为已读');
  });
});

/* Route fixtures are kept here so the four semantic pages reproduce the supplied reference state. */
if (document.querySelector('.search-header')) {
  document.querySelector('.search-header h1').textContent = '日程搜索';
  document.querySelector('#agenda-search').placeholder = '搜索活动名称、主题、嘉宾';
  document.querySelectorAll('.search-chips button').forEach((chip, index) => {
    chip.textContent = ['创新大讲堂', '人工智能开放麦', '博士博士后招聘区', ''][index] || '';
    chip.hidden = index === 3;
  });
  document.querySelector('#search-result-count').textContent = '共 4 条结果';
  const fixtures = [
    ['主题演讲', '创新大讲堂：AI驱动的产业变革与未来', '2025-05-22 09:30 – 10:30', '主会场A · 一层大宴会厅'],
    ['开放麦', '人工智能开放麦：技术碰撞与观点分享', '2025-05-22 14:00 – 15:30', '分会场B · 会议中心302'],
    ['招聘专区', '博士博士后招聘区专场对接会', '2025-05-22 10:00 – 16:30', '招聘区 · 二层多功能厅'],
    ['专题论坛', '新能源前沿论坛：绿色技术与可持续发展', '2025-05-22 16:00 – 17:30', '分会场C · 会议中心305'],
  ];
  document.querySelectorAll('.result-card').forEach((card, index) => {
    const [tag, title, time, venue] = fixtures[index];
    card.querySelector('.batch3-chip').textContent = tag;
    card.querySelector('h3').textContent = title;
    card.querySelector('p').innerHTML = `◷　${time}<br>⌖　${venue}`;
  });
}

if (document.querySelector('.agenda-detail-header')) {
  document.querySelector('.agenda-hero__copy > span').textContent = '即将开始';
  document.querySelector('.agenda-hero__copy h2').textContent = '创新大讲堂';
  document.querySelector('.agenda-hero__copy p').textContent = 'AI浪潮下共创湾区未来';
  const facts = document.querySelectorAll('.agenda-fact strong');
  facts[0].textContent = '10月25日（周六）14:30 – 16:30';
  facts[1].textContent = '大湾区大学（松山湖校区）体育馆';
  document.querySelector('.agenda-intro').textContent = '在人工智能加速演进的时代浪潮下，创新已成为推动湾区高质量发展的核心动能。本场大讲堂汇聚产学研领军人物，围绕AI技术前沿趋势、产业创新实践与湾区协同发展展开深度分享。';
}

if (document.querySelector('.guest-detail-header')) {
  document.querySelector('.guest-hero__copy p').innerHTML = '香港科技大学教授<br>XbotPark 创始人';
  document.querySelectorAll('.guest-hero__tags span').forEach((tag, index) => { tag.textContent = ['大会嘉宾', '创新创业专家'][index]; });
  document.querySelector('.bio-card p').textContent = '李泽湘教授是香港科技大学电子与计算机工程学系教授，XbotPark创新基地（松山湖机器人基地）创始人。他长期致力于科技创新与高端人才培养，推动硬科技创业生态的发展，已孵化和投资了超过100家硬科技企业。';
  document.querySelector('#guest-agendas-title').textContent = '参与议程';
  document.querySelector('#keyword-title').textContent = '研究方向 / 关键词';
}

if (document.querySelector('.notice-header')) {
  document.querySelectorAll('[data-notice-tab]').forEach((tab, index) => { tab.textContent = ['全部消息', '系统通知', '活动提醒'][index]; });
  const fixtures = [
    ['大会报名审核已通过', '恭喜您！您的大会报名已通过审核，欢迎参加2025全球人工智能产业大会。', '今天 09:15'],
    ['人工智能产业专题开放麦报名通过', '您报名的“人工智能产业专题开放麦：新趋势·新机遇”已通过审核，期待您的精彩分享！', '昨天 16:42'],
    ['创新大讲堂将于30分钟后开始', '您已报名的“创新大讲堂：技术创新与产业未来”将于10:30在3号厅开始，请提前入场。', '今天 10:00'],
    ['午餐权益当前可用', '您的午餐权益已生效，可于11:30–13:30在松山湖国际会议中心一层自助餐区使用。', '今天 11:20'],
    ['大会接驳班次调整通知', '受交通管制影响，14:00前往会场的接驳车班次调整至13:30发车，请您合理安排时间。', '今天 12:05'],
  ];
  document.querySelectorAll('.notice-card').forEach((card, index) => {
    const [title, body, time] = fixtures[index];
    card.querySelector('h2').firstChild.textContent = title;
    card.querySelector('p').textContent = body;
    card.querySelector('time').textContent = time;
  });
}

shell?.setAttribute('data-ui-ready', 'true');
