import { selectScheduleItems, toggleFollowed } from './schedule-model.js';

const state = {
  day: '2026-10-25',
  category: 'all',
  scope: 'all',
  query: '',
};

const iconByCategory = {
  keynote: 'i-keynote',
  lecture: 'i-lecture',
  competition: 'i-trophy',
  'open-mic': 'i-mic',
};

const list = document.querySelector('#agenda-list');
const dialog = document.querySelector('#schedule-dialog');
const dialogTitle = document.querySelector('#schedule-dialog-title');
const dialogDescription = document.querySelector('#schedule-dialog-description');
const copyButton = document.querySelector('[data-copy-address]');
const snackbar = document.querySelector('.snackbar');
const snackbarText = snackbar.querySelector('span');
let currentAddress = '';
let snackbarTimer;

function readFollowed() {
  try {
    const value = JSON.parse(localStorage.getItem('conference.schedule.followed') || '["opening"]');
    return new Set(Array.isArray(value) ? value : ['opening']);
  } catch {
    return new Set(['opening']);
  }
}

let followedIds = readFollowed();

function createIcon(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
}

function showSnackbar(message) {
  snackbarText.textContent = message;
  snackbar.hidden = false;
  clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() => { snackbar.hidden = true; }, 3000);
}

function openDialog(title, description, address = '') {
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  currentAddress = address;
  copyButton.hidden = !address;
  dialog.showModal();
}

function createSpeaker(speaker) {
  const figure = document.createElement('figure');
  figure.className = 'speaker';
  const image = document.createElement('img');
  image.src = speaker.image;
  image.alt = '';
  image.width = 52;
  image.height = 52;
  image.loading = 'lazy';
  const caption = document.createElement('figcaption');
  caption.textContent = speaker.name;
  figure.append(image, caption);
  return figure;
}

function createButton(label, icon, variant, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button button--${variant}`;
  button.append(createIcon(icon), document.createTextNode(label));
  button.addEventListener('click', action);
  return button;
}

function createAgendaCard(item) {
  const article = document.createElement('article');
  article.className = 'timeline-item';
  article.dataset.itemId = item.id;

  const time = document.createElement('time');
  time.className = 'timeline-time';
  time.dateTime = `${item.day}T${item.start}:00+08:00`;
  time.textContent = item.start;

  const card = document.createElement('div');
  card.className = 'agenda-card';
  const head = document.createElement('div');
  head.className = 'agenda-card__head';
  const tag = document.createElement('span');
  tag.className = 'agenda-tag';
  tag.append(createIcon(iconByCategory[item.category]), document.createTextNode(item.categoryLabel));
  head.append(tag);
  if (followedIds.has(item.id)) {
    const followed = document.createElement('button');
    followed.type = 'button';
    followed.className = 'follow-state';
    followed.setAttribute('aria-label', `取消关注${item.title}`);
    followed.append(createIcon('i-star'), document.createTextNode('已关注'));
    followed.addEventListener('click', () => {
      followedIds = toggleFollowed(followedIds, item.id);
      localStorage.setItem('conference.schedule.followed', JSON.stringify([...followedIds]));
      renderSchedule();
      showSnackbar(`已取消关注“${item.title}”`);
    });
    head.append(followed);
  }

  const title = document.createElement('h2');
  title.textContent = item.title;

  const meta = document.createElement('dl');
  meta.className = 'agenda-meta';
  const timeRow = document.createElement('div');
  const timeTerm = document.createElement('dt');
  timeTerm.append(createIcon('i-clock'));
  const timeValue = document.createElement('dd');
  timeValue.textContent = `${item.start}–${item.end}`;
  timeRow.append(timeTerm, timeValue);
  const placeRow = document.createElement('div');
  const placeTerm = document.createElement('dt');
  placeTerm.append(createIcon('i-pin'));
  const placeValue = document.createElement('dd');
  placeValue.textContent = item.location;
  placeRow.append(placeTerm, placeValue);
  meta.append(timeRow, placeRow);

  const speakerRow = document.createElement('div');
  speakerRow.className = 'speaker-row';
  const speakers = document.createElement('div');
  speakers.className = 'speaker-list';
  item.speakers.forEach((speaker) => speakers.append(createSpeaker(speaker)));
  const count = document.createElement('span');
  count.className = 'speaker-count';
  count.textContent = `等${item.guestCount}位嘉宾`;
  speakerRow.append(speakers, count);

  const actions = document.createElement('div');
  actions.className = 'agenda-actions';
  actions.append(createButton('导航', 'i-send', 'secondary', () => {
    openDialog('场地导航', `${item.title}\n${item.location}`, item.location);
  }));
  if (!followedIds.has(item.id)) {
    actions.append(createButton('关注', 'i-send', 'primary', () => {
      followedIds = toggleFollowed(followedIds, item.id);
      localStorage.setItem('conference.schedule.followed', JSON.stringify([...followedIds]));
      renderSchedule();
      showSnackbar(`已关注“${item.title}”`);
    }));
  }

  card.append(head, title, meta, speakerRow, actions);
  article.append(time, card);
  return article;
}

function renderEmpty() {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.append(createIcon('i-calendar'));
  const title = document.createElement('h2');
  title.textContent = state.day === '2026-10-26' ? '10月26日日程待接入' : '没有匹配的日程';
  const description = document.createElement('p');
  description.textContent = state.day === '2026-10-26'
    ? '正式日程数据确认后将在这里展示。'
    : '请调整分类、搜索词或日程范围。';
  empty.append(title, description);
  return empty;
}

function renderSchedule() {
  const items = selectScheduleItems(state, followedIds);
  list.replaceChildren(...(items.length ? items.map(createAgendaCard) : [renderEmpty()]));
  list.setAttribute('aria-label', state.day === '2026-10-25' ? '10月25日日程' : '10月26日日程');
}

function activateControls(selector, dataKey, value) {
  document.querySelectorAll(selector).forEach((control) => {
    const active = control.dataset[dataKey] === value;
    control.classList.toggle('is-active', active);
    if (control.hasAttribute('aria-selected')) control.setAttribute('aria-selected', String(active));
    if (control.hasAttribute('aria-pressed')) control.setAttribute('aria-pressed', String(active));
  });
}

document.querySelectorAll('[data-day]').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.day = tab.dataset.day;
    activateControls('[data-day]', 'day', state.day);
    renderSchedule();
  });
});

document.querySelectorAll('[data-scope]').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.scope = tab.dataset.scope;
    activateControls('[data-scope]', 'scope', state.scope);
    renderSchedule();
  });
});

document.querySelectorAll('[data-category]').forEach((chip) => {
  chip.addEventListener('click', () => {
    state.category = chip.dataset.category;
    activateControls('[data-category]', 'category', state.category);
    renderSchedule();
  });
});

document.querySelector('[data-search-toggle]').addEventListener('click', (event) => {
  const panel = document.querySelector('#schedule-search');
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) document.querySelector('#schedule-query').focus();
});

document.querySelector('#schedule-query').addEventListener('input', (event) => {
  state.query = event.currentTarget.value;
  renderSchedule();
});

document.querySelector('[data-filter-focus]').addEventListener('click', () => {
  document.querySelector('#schedule-categories').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.querySelector('[data-category="all"]').focus();
});

document.querySelectorAll('[data-feature]').forEach((control) => {
  control.addEventListener('click', () => {
    openDialog(control.dataset.feature, `${control.dataset.feature}的正式路由与业务接口尚未提供，当前入口已按产品导航结构保留。`);
  });
});

document.querySelectorAll('[data-dialog-close]').forEach((control) => {
  control.addEventListener('click', () => dialog.close());
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentAddress);
    showSnackbar('地址已复制');
    dialog.close();
  } catch {
    showSnackbar(`地址：${currentAddress}`);
  }
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

renderSchedule();
document.querySelector('.schedule-shell').dataset.uiReady = 'true';
