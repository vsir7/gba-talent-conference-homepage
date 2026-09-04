const ENTITY_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ENTITY_MAP[character]);
}

function statusBar() {
  return `<div class="status-bar" aria-label="状态栏">
    <span>9:41</span>
    <div class="status-icons" aria-hidden="true"><i></i><i></i><b></b></div>
  </div>`;
}

function pageHeader(page, data) {
  const back = data.back === false ? '<span class="header-spacer"></span>' : '<button class="icon-button back-button" type="button" data-action="back" aria-label="返回">‹</button>';
  const actionBehavior = data.headerRoute ? `data-route="${escapeHtml(data.headerRoute)}"` : 'data-action="header-action"';
  const action = data.headerAction ? `<button class="header-action" type="button" ${actionBehavior}>${escapeHtml(data.headerAction)}</button>` : '<span class="header-spacer"></span>';
  return `<header class="page-header">${back}<h1>${escapeHtml(data.title || page.name)}</h1>${action}</header>`;
}

function renderCard(card) {
  const image = card.image ? `<img class="card-image" src="${escapeHtml(card.image)}" alt="">` : '';
  const tag = card.tag ? `<span class="tag">${escapeHtml(card.tag)}</span>` : '';
  const meta = card.meta ? `<p class="card-meta">${escapeHtml(card.meta)}</p>` : '';
  const body = card.body ? `<p class="card-copy">${escapeHtml(card.body)}</p>` : '';
  return `<article class="content-card ${escapeHtml(card.variant || '')}">${image}<div class="card-body">${tag}<h3>${escapeHtml(card.title || '')}</h3>${meta}${body}</div></article>`;
}

function renderSection(section) {
  const heading = section.title ? `<div class="section-heading"><h2>${escapeHtml(section.title)}</h2>${section.action ? `<span>${escapeHtml(section.action)}</span>` : ''}</div>` : '';
  const copy = section.copy ? `<p class="section-copy">${escapeHtml(section.copy)}</p>` : '';
  const cards = Array.isArray(section.cards) ? `<div class="card-list">${section.cards.map(renderCard).join('')}</div>` : '';
  return `<section class="page-section ${escapeHtml(section.variant || '')}">${heading}${copy}${cards}</section>`;
}

function bottomNav(active) {
  const items = [['大会', '⌂', 'conference-home'], ['日程', '▣', 'schedule'], ['资讯', '◫', 'news'], ['服务', '◇', 'service-hall'], ['我的', '○', 'profile']];
  return `<nav class="bottom-nav" aria-label="主导航">${items.map(([label, icon, route]) => `<button class="${active === label ? 'active' : ''}" type="button" data-route="${route}"><b>${icon}</b><span>${label}</span></button>`).join('')}</nav>`;
}

function image(src, className = '', alt = '') {
  return src ? `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">` : '';
}

function button(label, className = 'primary-button', behavior = 'data-action="acknowledge"') {
  return label ? `<button type="button" class="${className}" ${behavior}>${escapeHtml(label)}</button>` : '';
}

function pills(items = [], active = 0) {
  return `<div class="pill-row">${items.map((item, index) => `<button type="button" data-filter="${escapeHtml(item)}" class="pill ${index === active ? 'active' : ''}">${escapeHtml(item)}</button>`).join('')}</div>`;
}

function renderConference(data) {
  const portalRoutes = ['schedule', 'schedule', 'schedule', 'service-hall', 'carnival', 'service-hall'];
  return `<div class="conference-brand"><strong>UA.PC</strong>${button('去抢票', 'conference-ticket', 'data-route="registration-picker"')}</div>
  <section class="conference-hero"><article class="hero-main">${image(data.hero, 'conference-visual')}<div class="hero-scrim"></div><div class="conference-copy"><h2>${escapeHtml(data.eyebrow)}</h2><p>${escapeHtml(data.headline)}</p><span>${escapeHtml(data.date)}</span></div></article><article class="hero-side">${image(data.sideHero, 'conference-visual')}<div><small>FEATURE</small><h3>湾区人才</h3><p>汇聚人才 · 一见未来</p></div></article></section>
  <div class="portal-grid">${data.portals.map(([name, icon, tone], index) => `<button type="button" data-route="${portalRoutes[index]}" class="portal ${tone}"><b>${escapeHtml(icon)}</b><span>${escapeHtml(name)}</span></button>`).join('')}</div>
  <section class="conference-about"><h2>关于大会</h2><small>ABOUT THE CONFERENCE</small><p>${escapeHtml(data.about)}</p><article>${image(data.video, 'about-video')}<button type="button" data-action="play-video" aria-label="播放">▶</button><span>粤港澳大湾区人才大会宣传片</span></article></section>
  <section class="conference-highlights"><h2>大会亮点</h2><small>CONFERENCE HIGHLIGHTS</small><div>${data.highlights.map((item) => `<article>${image(item.image, 'highlight-image')}<span><b>${escapeHtml(item.title)}</b><em>${escapeHtml(item.meta)}</em></span></article>`).join('')}</div></section>
  <section class="conference-partners"><h2>合作伙伴</h2><small>STRATEGIC PARTNERS</small><div>${data.partners.map((partner) => `<span>${escapeHtml(partner)}</span>`).join('')}</div></section><div class="ai-float">◉<span>AI助手</span></div>`;
}

function renderAssistant(data) {
  const shortcuts = [['查日程', '▣', 'schedule'], ['找会场', '⌖', 'venue-guide'], ['查报名', '♙', 'registration-review'], ['享权益', '◇', 'meal-benefits']];
  return `<section class="assistant-hero"><div class="assistant-copy"><span class="assistant-event">✦ 第四届粤港澳大湾区人才高质量发展大会</span><h2>你好， <b>${escapeHtml(data.name)}</b></h2><p>${escapeHtml(data.subtitle)}</p><div class="assistant-shortcuts">${shortcuts.map(([label, icon, route]) => `<button type="button" data-route="${route}"><b>${icon}</b><span>${label}</span></button>`).join('')}</div></div>${image(data.hero, 'assistant-robot', '')}</section>
    <div class="chat-list">${data.messages.map((message) => `<div class="chat-row ${message.role}"><span class="chat-avatar" aria-hidden="true">${message.role === 'assistant' ? '◉' : '●'}</span><div class="chat-bubble ${message.role}">${escapeHtml(message.text)}${message.time ? `<time>${escapeHtml(message.time)}</time>` : ''}</div></div>`).join('')}</div>
    <section class="guess-panel"><h2>✦ 猜你想问</h2><div>${data.prompts.map((prompt, index) => `<button type="button" data-action="ask-prompt"><b>${['▣','⌖','◇','▦'][index] || '✦'}</b><span>${escapeHtml(prompt)}</span><i>›</i></button>`).join('')}</div></section>
    <form class="chat-input" data-action-form="send-message"><input aria-label="输入问题" placeholder="问问湾小才…"><button type="submit" data-action="send-message">↑</button></form>`;
}

function renderSchedule(data) {
  const scheduleTabs = data.scheduleTabs ? `<div class="schedule-mode">${data.scheduleTabs.map((item, index) => `<button type="button" data-filter="${escapeHtml(item)}" class="${index === 0 ? 'active' : ''}">${escapeHtml(item)}</button>`).join('')}</div>` : '';
  return `<div class="date-tabs">${data.dates.map((date, index) => `<button type="button" data-filter="${escapeHtml(date)}" class="${index === 0 ? 'active' : ''}">${escapeHtml(date)}</button>`).join('')}</div>${scheduleTabs}
    ${pills(data.filters)}
    <div class="schedule-list">${data.sessions.map((session) => `<article class="schedule-item" data-route="agenda-intro"><div class="schedule-card-head"><strong>${escapeHtml(session.time)}</strong><span>${escapeHtml(session.tag)}</span></div>${image(session.image, 'schedule-banner', session.title)}<button type="button" data-route="agenda-intro" class="schedule-title">${escapeHtml(session.title)}</button><p>⌖ ${escapeHtml(session.venue)}</p>${session.copy ? `<p class="schedule-copy">${escapeHtml(session.copy)}</p>` : ''}${session.guests ? `<div class="schedule-guests">${session.guests.map((guest) => image(guest, 'schedule-guest')).join('')}<span>等${session.guests.length + 3}位嘉宾</span></div>` : ''}<div class="schedule-card-foot"><small>${escapeHtml(session.status || '')}</small><div><button type="button" data-route="venue-guide">导航</button><button type="button" data-route="registration-picker">去抢票</button></div></div></article>`).join('')}</div>`;
}

function renderMySchedule(data) {
  return `<div class="my-schedule-dates">${data.dates.map((date, index) => `<button type="button" data-filter="${escapeHtml(date)}" class="${index === 0 ? 'active' : ''}">${escapeHtml(date)}</button>`).join('')}</div><div class="my-schedule-list">${data.sessions.map((session) => `<article class="my-schedule-card"><header><strong>${escapeHtml(session.time)}</strong><span class="state-${escapeHtml(session.state)}">${escapeHtml(session.state)}</span></header><h2>${escapeHtml(session.title)}</h2>${session.subtitle ? `<h3>${escapeHtml(session.subtitle)}</h3>` : ''}<p>⌖ ${escapeHtml(session.venue)}</p><footer><span>▌ ${escapeHtml(session.category)}</span>${session.action ? `<button type="button" data-route="${escapeHtml(session.route)}">${escapeHtml(session.action)}</button>` : ''}</footer></article>`).join('')}</div>`;
}

function agendaBody(data) {
  if (data.guests) return `<div class="guest-grid">${data.guests.map((guest) => `<article>${image(guest.image, 'guest-avatar', guest.name)}<h3>${escapeHtml(guest.name)}</h3><p>${escapeHtml(guest.role)}</p></article>`).join('')}</div>`;
  if (data.timeline) return `<div class="agenda-timeline">${data.timeline.map(([time, item]) => `<div><time>${escapeHtml(time)}</time><i></i><p>${escapeHtml(item)}</p></div>`).join('')}</div>`;
  if (data.notices) return `<section class="ticket-notice"><h2>抢票须知</h2><ol class="notice-list">${data.notices.map((notice) => `<li>${escapeHtml(notice)}</li>`).join('')}</ol></section>`;
  return (data.sections || []).map(renderSection).join('');
}

function renderAgenda(data) {
  const tabRoutes = ['agenda-intro', 'agenda-guests', 'agenda-schedule', 'agenda-ticket-notice'];
  return `<article class="agenda-hero">${image(data.hero, 'agenda-image')}<div><span class="tag">${escapeHtml(data.tag)}</span><h2>${escapeHtml(data.event)}</h2>${data.time ? `<p class="agenda-detail-line"><b>◷</b>${escapeHtml(data.time)}</p><p class="agenda-detail-line"><b>⌖</b>${escapeHtml(data.venue)}</p>` : `<p>${escapeHtml(data.meta)}</p>`}</div></article>
    <div class="agenda-tabs">${data.tabs.map((tab, index) => `<button type="button" data-tab="${tabRoutes[index]}" data-route="${tabRoutes[index]}" class="${index === data.activeTab ? 'active' : ''}">${escapeHtml(tab)}</button>`).join('')}</div>
    <div class="agenda-body">${agendaBody(data)}</div>
    <div class="sticky-action">${button(data.action, 'primary-button', 'data-route="registration-picker"')}</div>`;
}

function renderSheet(data) {
  const slots = data.slots.map((slot, index) => `<button type="button" data-action="select-slot" class="slot-card${index === 0 ? ' selected' : ''}">
    <span class="choice-dot">${index === 0 ? '✓' : ''}</span><strong class="slot-time">${escapeHtml(slot.time)}</strong><time>${escapeHtml(slot.date)}</time><em>余<b>${escapeHtml(slot.remaining)}</b>张</em>
    <span class="slot-detail"><span>主题：${escapeHtml(slot.topic)}</span><span class="slot-speaker"><i>发起人：</i>${image(slot.speakerImage, 'slot-speaker-avatar', slot.speaker)}<small>${escapeHtml(slot.speaker)}</small></span></span>
  </button>`).join('');
  return `<div class="dimmed-event">${image(data.hero, 'dimmed-hero')}</div>
    <section class="bottom-sheet ticket-sheet" role="dialog" aria-modal="true"><i class="sheet-handle"></i><button type="button" data-action="back" class="sheet-close" aria-label="关闭">×</button><h2>${escapeHtml(data.sheetTitle)}</h2><h3>选择报名时段</h3><div class="slot-list">${slots}</div><h3>选择报名类型</h3><div class="type-list">${data.types.map((type, index) => `<button type="button" data-action="select-type" data-registration-route="${index === 0 ? 'phone-authorization' : 'speaker-registration'}" class="type-choice ${index === 0 ? 'selected' : ''}"><span class="choice-dot">${index === 0 ? '✓' : ''}</span>${escapeHtml(type)}</button>`).join('')}</div><div class="ticket-countdown"><span>距报名截止</span><strong><b>0 1</b><small>天</small><b>0 8</b><i>:</i><b>2 4</b><i>:</i><b>3 6</b></strong></div>${button(data.action, 'primary-button', 'data-action="registration-submit"')}</section>`;
}

function renderSpeakerForm(data) {
  const outlineRows = data.outlines.map((placeholder, index) => `<div class="outline-row"><span>${index + 1}</span><input name="outline[]" aria-label="分享要点 ${index + 1}" placeholder="${escapeHtml(placeholder)}"></div>`).join('');
  return `<p class="speaker-form-subtitle">${escapeHtml(data.subtitle)}</p>
    <section class="speaker-session-block"><h2>已选报名时段</h2><article class="speaker-session-card">${image(data.session.speakerImage, 'speaker-session-avatar', data.session.speaker)}<div><h3>${escapeHtml(data.session.title)}</h3><p>${escapeHtml(data.session.date)}　${escapeHtml(data.session.time)}</p><p>主讲人：${escapeHtml(data.session.speaker)}</p></div></article></section>
    <form class="speaker-form">
      <h2>分享内容</h2>
      <label class="speaker-field"><span>分享主题 <b>*</b></span><input name="subject" required placeholder="请输入本次分享的主题"></label>
      <label class="speaker-field"><span>内容简介 <b>*</b></span><span class="speaker-textarea"><textarea name="introduction" maxlength="300" required placeholder="请介绍分享背景、主要内容、核心观点及观众收获"></textarea><small><i data-intro-count>0</i>/300</small></span></label>
      <section class="speaker-outline"><h3>内容提纲 <b>*</b></h3><div data-outline-list>${outlineRows}</div><button type="button" data-action="add-outline">＋&nbsp; 添加分享要点</button><small>最多添加5项</small></section>
      <section class="speaker-material"><h3>分享材料</h3><label class="speaker-upload"><input type="file" name="material" accept=".ppt,.pptx,.pdf"><svg viewBox="0 0 64 72" aria-hidden="true"><path d="M13 4h25l13 13v47a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"/><path d="M38 4v15h13M30 52V29m-9 9 9-9 9 9"/></svg><strong data-upload-label>点击上传分享材料</strong><span>支持 PPT、PPTX、PDF，可提交初稿</span></label></section>
      <button type="submit" class="primary-button">提交审核</button>
      <p class="speaker-submit-note">提交后将进入大会审核，审核结果会通过消息通知。</p>
    </form>`;
}

function renderModal(data) {
  return `<div class="modal-context">${image(data.hero, 'modal-context-hero')}<span class="tag">创新大讲堂</span><h2>创新大讲堂：技术创新与产业未来</h2><p>10月25日 09:30—11:30</p><div class="context-ticket">票数与报名信息</div></div><div class="modal-backdrop"></div><section class="center-modal" role="dialog" aria-modal="true"><div class="modal-app-icon">▯</div><h2>${escapeHtml(data.modalTitle)}</h2><p>${escapeHtml(data.modalCopy)}</p><div>${data.actions.map((action, index) => button(action, index === data.actions.length - 1 ? 'modal-primary' : 'modal-secondary', index === data.actions.length - 1 ? 'data-action="authorize-phone"' : 'data-action="deny-phone"')).join('')}</div></section>`;
}

function renderResult(data) {
  return `<section class="result-state">${image(data.illustration, 'result-illustration')}<h2>${escapeHtml(data.headline)}</h2><p>${escapeHtml(data.copy)}</p><article class="result-event"><p>▱ <b>${escapeHtml(data.event)}</b></p><p>◷ ${escapeHtml(data.meta)}</p></article>${button(data.action, 'primary-button', 'data-route="schedule"')}</section>`;
}

function renderPass(data) {
  return `<section class="pass-stage"><div class="credential-card">${image(data.portrait, 'pass-portrait', data.name)}<h2>${escapeHtml(data.name)}</h2><p class="pass-company">${escapeHtml(data.company)}</p><i class="pass-divider"></i><span class="pass-state">● ${escapeHtml(data.seat)}</span><strong class="digital-time">${escapeHtml(data.digitalTime)}</strong><p class="pass-date">${escapeHtml(data.date)}</p><div class="credential-event"><p>▣ <b>${escapeHtml(data.event)}</b></p><p>◷ ${escapeHtml(data.time)}</p><p>⌖ ${escapeHtml(data.venue)}</p></div></div><div class="pass-show">▣<p>${escapeHtml(data.note)}</p></div></section>`;
}

function renderNews(data) {
  const articles = [data.featured, ...data.articles];
  return `<div class="news-tabs">${data.filters.map((item, index) => `<button type="button" data-filter="${escapeHtml(item)}" class="${index === 0 ? 'active' : ''}">${escapeHtml(item)}</button>`).join('')}</div><div class="news-card-list">${articles.map((article, index) => `<button type="button" data-route="news-detail" class="news-card">${image(article.image, 'news-card-image')}<span class="news-card-copy"><strong>${escapeHtml(article.title)}</strong>${article.body ? `<em>${escapeHtml(article.body)}</em>` : ''}<small>${escapeHtml(article.meta)}</small></span>${index === 1 ? '<i class="news-play" aria-hidden="true">▶</i>' : ''}</button>`).join('')}</div>`;
}

function renderArticle(data) {
  return `<article class="article-shell"><div class="article-body"><h2>${escapeHtml(data.headline)}</h2><p class="article-meta">${escapeHtml(data.meta)} <span>${escapeHtml(data.kicker)}</span></p>${image(data.hero, 'article-hero')}<p>${escapeHtml(data.paragraphs[0])}</p>${data.paragraphs.slice(1).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<blockquote>${escapeHtml(data.quote)}</blockquote><section class="article-related"><h3>相关推荐</h3>${data.related.map((item) => `<button type="button" data-route="news-detail">${image(item.image, 'related-image')}<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span><i>›</i></button>`).join('')}</section></div></article>`;
}

function renderService(data) {
  const miniCards = (items) => items.map(([name, copy, icon]) => `<button type="button"><b>${escapeHtml(icon)}</b><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(copy)}</small></span><i>›</i></button>`).join('');
  return `<section class="service-intro"><h2>服务大厅</h2><p>${escapeHtml(data.subtitle)}</p></section><div class="primary-service-grid">${data.primaryServices.map(([name, copy, icon, tone]) => `<button type="button" class="${tone}"><b>${escapeHtml(icon)}</b><strong>${escapeHtml(name)}</strong><small>${escapeHtml(copy)}</small><i>›</i></button>`).join('')}</div><div class="service-quick-row">${data.quick.map(([name, icon]) => `<button type="button"><b>${escapeHtml(icon)}</b><span>${escapeHtml(name)}</span></button>`).join('')}</div><section class="service-panel"><h2>探索大会</h2><div class="service-mini-grid three">${miniCards(data.exploreConference)}</div></section><section class="service-panel"><h2>湾区探索</h2><div class="service-mini-grid">${miniCards(data.exploreBay)}</div></section>`;
}

function renderDetail(data) {
  return `<section class="detail-hero">${image(data.hero, 'detail-image')}<div><span>${escapeHtml(data.eyebrow)}</span><h2>${escapeHtml(data.title)}</h2></div></section><p class="detail-intro">${escapeHtml(data.intro)}</p>${(data.sections || []).map(renderSection).join('')}`;
}

function renderServiceStory(data) {
  const action = (card, label = `查看${card.title}`) => card.route
    ? `<button type="button" data-route="${escapeHtml(card.route)}" aria-label="${escapeHtml(label)}">›</button>`
    : `<button type="button" data-action="acknowledge" aria-label="${escapeHtml(label)}">›</button>`;
  const back = '<button class="story-back" type="button" data-action="back" aria-label="返回">‹</button>';
  const sectionTitle = (title) => `<h2 class="story-section-title">${escapeHtml(title)}</h2>`;
  const footerActions = () => data.footerActions ? `<div class="story-actions">${data.footerActions.map(([label, route], index) => button(label, index ? 'primary-button' : 'outline-button', `data-route="${route}"`)).join('')}</div>` : '';

  if (data.layout === 'venue') {
    const cards = data.storyCards.map((card) => `<article class="venue-card">${image(card.image, 'venue-card-image', card.title)}<div><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.copy)}</p><div class="venue-card-actions"><button type="button" data-route="venue-guide">场地导览 ↗</button>${card.route ? `<button type="button" data-route="${escapeHtml(card.route)}">⌁ 导航前往</button>` : ''}</div></div></article>`).join('');
    return `<div class="service-story service-story--venue"><div class="venue-skyline" aria-hidden="true"></div><label class="venue-search">⌕<input aria-label="搜索场馆、活动、展位" placeholder="搜索场馆、活动、展位"></label><section class="venue-overview">${sectionTitle('大会空间总览')}<div class="venue-map">${image(data.lead.image, 'venue-map-image', '大会空间示意图')}<span class="map-tag main">主会场</span><span class="map-tag talk">创新讲堂</span><span class="map-tag match">对接洽谈</span><span class="map-tag carnival">嘉年华</span></div><div class="venue-legend"><span>● 主会场</span><span>● 创新讲堂</span><span>● 对接洽谈区</span><span>● 嘉年华区</span></div></section><div class="venue-card-list">${cards}</div><button class="venue-note" type="button" data-route="venue-guide">ⓘ 导航前往将使用第三方地图应用进行路线规划 <b>›</b></button></div>`;
  }

  if (data.layout === 'transport') {
    const [publicTransit, driving] = data.storyCards;
    const shuttleRows = [['⌖', '起点', '接驳安排会前更新'], ['⌾', '终点', '接驳安排会前更新'], ['◷', '发车时间', '具体班次待发布'], ['↑', '上车点', '接驳安排会前更新'], ['↓', '下车点', '接驳安排会前更新']];
    return `<div class="service-story service-story--transport"><div class="transport-skyline" aria-hidden="true"></div><section class="transport-destination">${image(data.lead.image, 'transport-destination-image', '')}<div><small>大会目的地</small><h2>${escapeHtml(data.lead.title)}</h2></div><button type="button" data-route="venue-guide">导航前往 ●</button></section><section class="transport-panel"><h2>到场方式</h2><div class="transport-methods">${[publicTransit, driving].map((card) => `<button type="button" data-route="venue-guide">${image(card.image, 'transport-method-image', card.title)}<span><strong>${escapeHtml(card.title)}</strong><small>${escapeHtml(card.copy)}</small></span><i>›</i></button>`).join('')}</div><p class="transport-info">ⓘ 具体到场指引以大会最新通知为准。</p></section><section class="transport-panel transport-shuttle"><h2>大会接驳</h2>${image(data.storyCards[2].image, 'transport-bus-image', '')}<div>${shuttleRows.map(([icon, label, value]) => `<p><i>${icon}</i><strong>${label}</strong><span>${value}</span></p>`).join('')}</div><small>ⓘ 大会接驳安排会前更新，敬请关注。</small></section><section class="transport-panel transport-notice"><h2>临时通知</h2><div><button type="button" data-route="notifications">${image(data.storyCards[3].image, 'transport-notice-image', '')}<span><strong>班次调整</strong><small>如有调整及时通知</small></span><i>›</i></button><button type="button" data-route="notifications">${image(data.stationImage, 'transport-notice-image', '')}<span><strong>站点调整</strong><small>如有调整及时通知</small></span><i>›</i></button></div></section><button class="transport-contact" type="button" data-route="contact-staff">◉ 更多交通接驳详情将通过 <b>消息通知</b> 推送，或可 <b>联系会务</b> 咨询。</button></div>`;
  }

  if (data.layout === 'dining') {
    const [area, opening, method, location] = data.storyCards;
    return `<div class="service-story service-story--dining"><section class="story-hero">${back}${image(data.hero, 'story-hero-image', '')}<div><h2>${escapeHtml(data.storyTitle)}</h2><p>${escapeHtml(data.storySubtitle)}</p></div></section><section class="dining-rights">${image(data.lead.image, 'dining-rights-image', '')}<div><h2>${escapeHtml(data.lead.title)} <span>● 当前有效</span></h2><dl><div><dt>姓名</dt><dd>张三</dd></div><div><dt>参会身份</dt><dd>嘉宾</dd></div></dl></div><p>具体用餐时间与地点请以大会安排为准，<br>我们将在现场指引与公告中进行通知。</p><time>◷ 当前时间：2025年6月7日（周六） 09:41</time></section><section class="dining-arrangement"><h2>用餐安排</h2>${[area, opening, method].map((card) => `<button type="button" data-route="${escapeHtml(card.route)}">${image(card.image, 'dining-row-image', '')}<span><strong>${escapeHtml(card.title)}</strong><small>${escapeHtml(card.copy)}</small></span><em>以大会通知为准</em><i>›</i></button>`).join('')}</section><section class="dining-location"><h2>用餐地点</h2><div><b>⌖</b><span><strong>会务指定餐区</strong><small>具体位置请以现场指引为准</small></span></div>${image(location.image, 'dining-location-image', '')}<p><button type="button" data-route="venue-guide">☷ 查看场地导览</button><button type="button" data-route="venue-guide">➤ 导航前往</button></p></section><section class="dining-tips"><h2>● 温馨提示</h2><ul><li>本页仅展示您的个人餐饮权益及大会现场安排信息。</li><li>用餐时间、区域、开放情况及相关规则以大会最新通知为准。</li><li>如有变动，请留意现场公告或咨询会务工作人员。</li><li>请文明用餐，遵守大会秩序与场地管理要求。</li></ul></section></div>`;
  }

  if (data.layout === 'carnival') {
    const cards = data.storyCards.map((card, index) => `<article class="carnival-card${index === 0 ? ' featured' : ''}">${image(card.image, 'carnival-card-image', card.title)}<h3>${escapeHtml(card.title)}</h3></article>`).join('');
    return `<div class="service-story service-story--carnival"><header class="carnival-mast">${back}<div><h2>${escapeHtml(data.storyTitle)}</h2><p>${escapeHtml(data.storySubtitle)}</p></div><span aria-hidden="true"></span></header><section class="carnival-banner">${image(data.hero, 'carnival-banner-image', '')}<div><h2>${escapeHtml(data.bannerTitle)}</h2><p>${escapeHtml(data.bannerSubtitle)}</p></div></section><h2 class="story-section-title"><i></i>${escapeHtml(data.sectionTitle)}<i></i></h2><div class="carnival-grid">${cards}</div></div>`;
  }

  if (data.layout === 'food') {
    const cards = data.storyCards.map((card) => `<article>${image(card.mascot, 'food-mascot-image', '')}<div><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.copy)}</p></div>${image(card.image, 'food-card-image', card.title)}${action(card)}</article>`).join('');
    return `<div class="service-story service-story--food"><section class="story-hero">${back}${image(data.hero, 'story-hero-image', '')}<div><h2>${escapeHtml(data.storyTitle)}</h2><p>${escapeHtml(data.storySubtitle)}</p></div></section>${sectionTitle(data.sectionTitle)}<div class="food-grid">${cards}</div>${footerActions()}</div>`;
  }

  if (data.layout === 'hotel') {
    const cards = data.storyCards.map((card) => `<article>${image(card.image, 'hotel-image', card.title)}<div><h3>${escapeHtml(card.title)}</h3><p>⌖ ${escapeHtml(card.copy)}</p><small>${escapeHtml(card.meta || '')}</small></div><p><button type="button" data-action="contact">☎ 联系酒店</button><button type="button" data-route="venue-guide">➤ 导航前往</button></p></article>`).join('');
    return `<div class="service-story service-story--hotel"><section class="hotel-update">${image(data.lead.image, 'hotel-update-image', '')}<div><h2>${escapeHtml(data.lead.title)}</h2><p>${escapeHtml(data.lead.copy)}</p></div></section>${sectionTitle(data.sectionTitle)}<div class="hotel-list">${cards}</div></div>`;
  }

  const cards = data.storyCards.map((card) => `<article>${image(card.image, 'study-route-image', card.title)}<div><span>${escapeHtml(card.kicker || '')}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.copy)}</p></div>${action(card)}</article>`).join('');
  return `<div class="service-story service-story--study"><section class="story-hero">${back}${image(data.hero, 'story-hero-image', '')}<div><h2>${escapeHtml(data.storyTitle)}</h2><p>${escapeHtml(data.storySubtitle)}</p></div></section><section class="study-lead">${image(data.lead.image, 'study-lead-image', '')}<div><h2>${escapeHtml(data.lead.title)}</h2><p>${escapeHtml(data.lead.copy)}</p></div></section><div class="study-tabs"><button type="button" data-filter="东莞" class="active">东莞</button><button type="button" data-filter="深圳">深圳</button></div><div class="study-routes">${cards}</div></div>`;
}

function renderFaq(data) {
  return `<section class="faq-hero"><button type="button" data-action="back" aria-label="返回">‹</button><h2>常见问题</h2><p>精选参会高频问题，快速为您解答</p></section><div class="faq-sections">${data.groups.map((group, groupIndex) => `<section class="faq-group tone-${groupIndex + 1}"><h2><b>${escapeHtml(group.icon)}</b>${escapeHtml(group.title)}</h2>${group.questions.map(([question, answer]) => `<div class="faq-item"><button type="button" data-toggle="faq" aria-expanded="false"><i>Q</i>${escapeHtml(question)}<span>⌄</span></button><p hidden>${escapeHtml(answer)}</p></div>`).join('')}</section>`).join('')}</div><p class="faq-more">ⓘ 更多问题，欢迎咨询 AI 助手或联系会务团队</p><div class="faq-support"><button type="button" data-route="ai-assistant"><b>◉</b><span><strong>问 AI 助手</strong><small>智能解答 24 小时在线</small></span><i>›</i></button><button type="button" data-route="contact-staff"><b>♧</b><span><strong>联系会务</strong><small>人工服务 工作时间响应</small></span><i>›</i></button></div>`;
}

function renderProfile(data) {
  const rows = (items) => items.map(([name, icon, route]) => `<button type="button" ${route ? `data-route="${escapeHtml(route)}"` : 'data-action="acknowledge"'}><b>${escapeHtml(icon)}</b><span>${escapeHtml(name)}</span><i>›</i></button>`).join('');
  return `<section class="profile-card">${image(data.avatar, 'profile-avatar', data.name)}<div><h2>${escapeHtml(data.name)} <span>${escapeHtml(data.badge)}</span></h2><p>${escapeHtml(data.company)}</p></div></section><section class="profile-menu primary">${rows(data.primaryMenu)}<div class="profile-actions"><button type="button" class="profile-outline" data-action="invite">立即邀请</button><button type="button" class="profile-outline" data-action="share">分享海报</button></div></section><section class="profile-menu secondary">${rows(data.secondaryMenu)}</section>`;
}

function renderNotifications(data) {
  return `<div class="notice-tabs">${data.filters.map((item, index) => `<button type="button" data-filter="${escapeHtml(item)}" class="${index === 0 ? 'active' : ''}">${escapeHtml(item)}</button>`).join('')}</div><div class="notice-cards">${data.notices.map((notice) => `<article class="notice-card ${notice.unread ? 'unread' : ''}"><b>${escapeHtml(notice.icon)}</b><div><h2>${escapeHtml(notice.title)}${notice.badge ? `<em>${escapeHtml(notice.badge)}</em>` : ''}</h2><p>${escapeHtml(notice.copy)}</p><footer><time>◷ ${escapeHtml(notice.time)}</time><span>${notice.unread ? '● 未读' : '● 已读'}</span></footer></div></article>`).join('')}</div><p class="notice-end">— 没有更多消息了 —</p>`;
}

function renderProfileInfo(data) {
  const icon = (name) => {
    const paths = {
      camera: '<path d="M9 13h7l3-5h10l3 5h7a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Zm15 7a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>',
      medal: '<path d="m16 4 8 5 8-5 5 9-4 8 5 5-7 4-1 12-6-5-6 5-1-12-7-4 5-5-4-8 5-9Zm8 9-4 8 4-2 4 2-4-8Z"/>',
      pen: '<path d="m8 35 3-11L32 3l10 10-21 21-13 1Zm8-10 5 5 15-15-5-5-15 15Zm-9 14 10-2-8-8-2 10Z"/>',
      'id-card': '<path d="M4 10h40v29H4V10Zm5 5v19h30V15H9Zm7 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-5 14c1-4 9-4 10 0H11Zm14-11h11v3H25v-3Zm0 7h11v3H25v-3Z"/>',
      shield: '<path d="M24 3c6 5 12 6 18 8v12c0 11-7 18-18 23C13 41 6 34 6 23V11c6-2 12-3 18-8Zm0 12a6 6 0 0 0-3 11v7h6v-7a6 6 0 0 0-3-11Z"/>',
      phone: '<path d="M11 5 5 10c0 17 16 33 33 33l5-6-9-8-5 5c-6-3-11-8-14-14l5-5-9-10Zm23 2c7 2 12 8 13 15h-4c-1-5-5-10-10-11l1-4Zm-2 7c4 1 7 4 8 9h-4c0-2-2-4-5-5l1-4Z"/>',
      mail: '<path d="M4 11h40v28H4V11Zm5 5 15 11 15-11H9Zm30 18V21L24 32 9 21v13h30Z"/>',
      location: '<path d="M24 3c11 0 19 8 19 18 0 12-19 25-19 25S5 33 5 21C5 11 13 3 24 3Zm0 10a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-4 4h8v8h-8v-8Z"/>',
      building: '<path d="M7 8h19v35H7V8Zm23 10h12v25H30V18ZM12 14v5h5v-5h-5Zm0 9v5h5v-5h-5Zm0 9v5h5v-5h-5Zm10-18v5h-4v-5h4Zm0 9v5h-4v-5h4Zm0 9v5h-4v-5h4Zm13-8v5h4v-5h-4Zm0 9v5h4v-5h-4Z"/>',
      briefcase: '<path d="M15 10V6h18v4h9a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5h9Zm5 0h8V9h-8v1ZM6 17v8h14v-3h8v3h14v-8H6Zm16 9v5h4v-5h-4ZM6 31v8h36v-8H28v4h-8v-4H6Z"/>',
    };
    return `<svg viewBox="0 0 48 48" aria-hidden="true">${paths[name] || ''}</svg>`;
  };
  return `<section class="info-records">${data.rows.map((row) => `<div class="info-record"><i class="tone-${escapeHtml(row.tone)}">${icon(row.icon)}</i><span>${escapeHtml(row.label)}</span>${row.photo ? image(row.photo, 'info-photo', '证件照') : `<b>${escapeHtml(row.value)}</b>`}</div>`).join('')}</section>`;
}

function renderRoleSelection(data) {
  const paths = {
    person: '<circle cx="24" cy="15" r="10"/><path d="M7 43c0-10 7-16 17-16s17 6 17 16H7Z"/>',
    company: '<path d="M6 7h22v36H6V7Zm26 13h10v23H32V20ZM12 14v5h5v-5h-5Zm0 10v5h5v-5h-5Zm0 10v5h5v-5h-5Zm10-20v5h-4v-5h4Zm0 10v5h-4v-5h4Zm14 3v6h3v-6h-3Z"/>',
    trophy: '<path d="M13 6h22v8h7v5c0 8-5 13-12 13-1 3-3 5-4 6v3h8v4H14v-4h8v-3c-2-2-3-4-4-6C11 32 6 27 6 19v-5h7V6Zm0 12H10v1c0 4 2 7 5 8-1-3-2-6-2-9Zm22 0c0 3-1 6-2 9 3-1 5-4 5-8v-1h-3Z"/>',
    expert: '<path d="m4 17 20-11 20 11-20 11L4 17Zm8 6 12 7 12-7v11c-7 7-17 7-24 0V23Zm28-3h3v15h-3V20Z"/>',
    government: '<path d="m24 4 19 10v4H5v-4L24 4ZM9 22h6v15H9V22Zm12 0h6v15h-6V22Zm12 0h6v15h-6V22ZM5 40h38v5H5v-5Z"/>',
    guest: '<circle cx="19" cy="15" r="9"/><path d="M5 40c1-10 6-15 14-15 5 0 9 2 11 5l4-3 2 6 7 1-5 5 1 7-7-4-6 4 1-7-3-3c-2 3-3 6-3 10H5v-6Z"/>',
    staff: '<path d="M17 4h14v6h8a5 5 0 0 1 5 5v28H4V15a5 5 0 0 1 5-5h8V4Zm4 4v5h6V8h-6Zm3 11a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm-10 19h20c-2-7-18-7-20 0Z"/>',
    media: '<path d="M15 19a9 9 0 0 1 18 0v10a9 9 0 0 1-18 0V19Zm-6 8h4v2c0 7 5 12 11 12s11-5 11-12v-2h4v2c0 8-6 15-13 16v4h7v4H15v-4h7v-4C14 44 9 37 9 29v-2Z"/>',
  };
  const roles = data.roles.map((role) => {
    const selected = role.label === data.selectedRole;
    return `<button type="button" class="role-choice${selected ? ' selected' : ''}" data-action="select-role" data-role-value="${escapeHtml(role.label)}" role="radio" aria-checked="${selected}"><i class="tone-${escapeHtml(role.tone)}"><svg viewBox="0 0 48 48" aria-hidden="true">${paths[role.icon] || ''}</svg></i><span>${escapeHtml(role.label)}</span><b class="role-radio" aria-hidden="true"></b></button>`;
  }).join('');
  return `<section class="role-panel" role="radiogroup" aria-label="参会角色">${roles}</section><div class="role-actions"><button type="button" class="primary-button" data-route="profile-completion">下一步</button><button type="button" class="role-skip" data-route="personal-info">跳过</button></div>`;
}

function renderProfileCompletion(data) {
  return `<p class="completion-lead">请完善以下信息</p>
    <section class="current-role"><span>当前参会角色</span><b>${escapeHtml(data.currentRole)}</b></section>
    <form class="profile-completion-form">
      <section class="completion-section basic-information"><h2>基础信息</h2>
        <label class="completion-photo"><span>证件照 <b>*</b></span><span class="photo-upload"><input type="file" name="photo" accept="image/*" required><i aria-hidden="true">▣</i><strong data-profile-upload-label>上传照片</strong><small>两寸证件照</small></span></label>
        <label class="completion-row"><span>姓名 <b>*</b></span><input name="fullName" required placeholder="请输入姓名"></label>
        <label class="completion-row muted-row"><span>手机号 <b>*</b></span><span class="phone-value"><strong>138****1024</strong><small>微信授权手机号</small></span><input type="hidden" name="phone" value="138****1024"></label>
        <label class="completion-row"><span>邮箱 <b>*</b></span><input type="email" name="email" required placeholder="请输入邮箱"></label>
        <label class="completion-row"><span>证件类型 <b>*</b></span><select name="idType" required><option value="">请选择证件类型</option><option>居民身份证</option><option>护照</option></select></label>
        <label class="completion-row"><span>证件号码 <b>*</b></span><input name="idNumber" required placeholder="请输入证件号码"></label>
      </section>
      <section class="completion-section role-information"><h2>角色信息</h2>
        <label class="completion-row"><span>所在城市 <b>*</b></span><select name="city" required><option value="">请选择所在城市</option><option>深圳市</option><option>广州市</option><option>东莞市</option></select></label>
        <label class="completion-row"><span>单位</span><input name="organization" placeholder="请输入单位名称"></label>
        <label class="completion-row"><span>职务</span><input name="jobTitle" placeholder="请输入职务"></label>
        <label class="completion-row"><span>所属行业 <b>*</b></span><select name="industry" required><option value="">请选择所属行业</option><option>人工智能</option><option>科技服务</option></select></label>
        <label class="completion-row"><span>所在地区 <b>*</b></span><select name="region" required><option value="">请选择所在地区</option><option>粤港澳大湾区</option><option>其他地区</option></select></label>
        <label class="completion-textarea"><span>个人简介</span><textarea name="biography" maxlength="200" placeholder="请简要介绍自己" data-count-target></textarea><small><i data-count>0</i>/200</small></label>
        <label class="completion-textarea"><span>合作诉求</span><textarea name="cooperation" maxlength="200" placeholder="请输入您的合作诉求" data-count-target></textarea><small><i data-count>0</i>/200</small></label>
      </section>
      <button type="submit" class="primary-button">保存</button>
    </form>`;
}

function renderForm(data) {
  return `<div class="edit-avatar">${image(data.avatar, 'profile-avatar', '头像')}<button type="button" data-action="change-avatar">更换头像</button></div><form class="info-form" data-action-form="save-profile">${data.fields.map(([label, value]) => `<label class="form-row"><span>${escapeHtml(label)}</span><input value="${escapeHtml(value)}" aria-label="${escapeHtml(label)}"><b>›</b></label>`).join('')}<button type="submit" class="primary-button">保存</button></form>`;
}

function renderBenefits(data) {
  return `${pills(data.tabs)}<div class="benefit-list">${data.benefits.map((benefit) => `<article><div class="benefit-mark">餐</div><div><span>${escapeHtml(benefit.state)}</span><h2>${escapeHtml(benefit.type)}</h2><p>${escapeHtml(benefit.date)} · ${escapeHtml(benefit.time)}</p><p>⌖ ${escapeHtml(benefit.venue)}</p></div><button type="button" data-route="meal-voucher">查看</button></article>`).join('')}</div>`;
}

function renderVoucher(data) {
  return `<section class="voucher-card"><div class="voucher-head"><span>HTDC 2026</span><b>${escapeHtml(data.state)}</b></div><h2>${escapeHtml(data.type)}</h2><div class="voucher-qr">${image(data.qr, 'credential-qr', '餐饮权益二维码')}</div><strong>${escapeHtml(data.code)}</strong><dl><div><dt>日期</dt><dd>${escapeHtml(data.date)}</dd></div><div><dt>时间</dt><dd>${escapeHtml(data.time)}</dd></div><div><dt>地点</dt><dd>${escapeHtml(data.venue)}</dd></div></dl></section><section class="voucher-notes"><h2>使用须知</h2><ol>${data.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ol></section>`;
}

function renderContact(data) {
  return `<section class="contact-intro"><div>✦</div><h2>${escapeHtml(data.subtitle)}</h2></section><div class="contact-list">${data.contacts.map((contact) => `<button type="button" data-action="contact" data-contact="${escapeHtml(contact.value)}"><b>${escapeHtml(contact.icon)}</b><span><strong>${escapeHtml(contact.title)}</strong><em>${escapeHtml(contact.value)}</em><small>${escapeHtml(contact.note)}</small></span><i>›</i></button>`).join('')}</div><aside class="emergency-note"><strong>现场帮助</strong><p>${escapeHtml(data.emergency)}</p></aside>`;
}

function renderTemplate(data) {
  const templates = {
    conference: renderConference,
    assistant: renderAssistant,
    schedule: renderSchedule,
    'my-schedule': renderMySchedule,
    agenda: renderAgenda,
    sheet: renderSheet,
    'speaker-form': renderSpeakerForm,
    modal: renderModal,
    result: renderResult,
    pass: renderPass,
    news: renderNews,
    article: renderArticle,
    service: renderService,
    detail: renderDetail,
    feature: renderDetail,
    'service-story': renderServiceStory,
    faq: renderFaq,
    profile: renderProfile,
    notifications: renderNotifications,
    'profile-info': renderProfileInfo,
    'role-selection': renderRoleSelection,
    'profile-completion': renderProfileCompletion,
    form: renderForm,
    benefits: renderBenefits,
    voucher: renderVoucher,
    contact: renderContact,
  };
  return templates[data.template]?.(data) ?? `${data.subtitle ? `<p class="page-subtitle">${escapeHtml(data.subtitle)}</p>` : ''}${(data.sections || []).map(renderSection).join('')}`;
}

export function renderScreen(page, data = {}) {
  const nav = data.nav ? bottomNav(data.nav) : '';
  const raw = `<main class="screen screen--${escapeHtml(page.kind)}" data-screen="${escapeHtml(page.id)}">
    ${statusBar()}
    ${pageHeader(page, data)}
    <div class="page-content">${renderTemplate(data)}</div>
    ${nav}
  </main>`;
  return raw.replace(/<button\b(?![^>]*\bdata-(?:action|route|tab|filter|dialog|toggle)=)(?![^>]*\btype="submit")/g, '<button data-action="acknowledge"');
}
