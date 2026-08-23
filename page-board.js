const pages = Object.freeze([
  { id: 'home', title: '大会首页', path: 'index.html' },
  { id: 'schedule', title: '大会日程', path: 'schedule.html' },
  { id: 'entry-service', title: '入场服务', path: 'entry-service.html' },
  { id: 'service-hall', title: '服务大厅', path: 'service-hall.html' },
  { id: 'profile', title: '个人中心', path: 'profile.html' },
  { id: 'tech-interaction', title: '科创互动', path: 'tech-interaction.html' },
  { id: 'dining-service', title: '餐饮服务', path: 'dining-service.html' },
  { id: 'carnival', title: '嘉年华', path: 'carnival.html' },
  { id: 'attendance-guide', title: '参会指南', path: 'attendance-guide.html' },
  { id: 'food-street', title: '美食街区', path: 'food-street.html' },
  { id: 'city-walk', title: 'City Walk', path: 'city-walk.html' },
  { id: 'transportation', title: '交通接驳', path: 'transportation.html' },
  { id: 'faq', title: '常见问题', path: 'faq.html' },
  { id: 'youth-study', title: '青年人才研学', path: 'youth-study.html' },
  { id: 'accommodation', title: '住宿信息', path: 'accommodation.html' },
  { id: 'venue-guide', title: '场地导览', path: 'venue-guide.html' },
  { id: 'schedule-search', title: '搜索日程', path: 'schedule-search.html' },
  { id: 'agenda-detail', title: '议程详情', path: 'agenda-detail.html' },
  { id: 'guest-detail', title: '嘉宾详情', path: 'guest-detail.html' },
  { id: 'notifications', title: '消息中心', path: 'notifications.html' },
  { id: 'personal-info', title: '个人信息', path: 'personal-info.html' },
  { id: 'meal-benefits', title: '餐饮权益', path: 'meal-benefits.html' },
  { id: 'contact-staff', title: '联系会务', path: 'contact-staff.html' },
  { id: 'cooperation-materials', title: '合作需求与材料', path: 'cooperation-materials.html' },
  { id: 'registration-detail', title: '我的报名详情', path: 'registration-detail.html' },
  { id: 'edit-registration', title: '修改报名资料', path: 'edit-registration.html' },
  { id: 'open-mic-detail', title: '我的开放麦', path: 'open-mic-detail.html' },
  { id: 'entry-result', title: '入场结果', path: 'entry-result.html' },
  { id: 'meal-voucher', title: '餐饮权益凭证', path: 'meal-voucher.html' },
  { id: 'ai-assistant', title: 'AI助手', path: 'ai-assistant.html' },
  { id: 'conference-registration', title: '大会报名', path: 'conference-registration.html' },
  { id: 'information', title: '资讯列表', path: 'information.html' },
  { id: 'home-approved', title: '大会首页（已报名）', path: 'home-approved.html' },
  { id: 'guest-feature', title: '嘉宾详情（李泽湘）', path: 'guest-feature.html' },
]);

const pagesById = new Map(pages.map((page) => [page.id, page]));
const fallbackPage = pages[0];
const page = document.querySelector('.page-board');
const directory = document.querySelector('#page-directory');
const directoryButtons = [...document.querySelectorAll('[data-page-id]')];
const pageFilter = document.querySelector('#page-filter');
const preview = document.querySelector('#page-preview');
const previewTitle = document.querySelector('#preview-title');
const openPage = document.querySelector('#open-page');
const stage = document.querySelector('.page-board__stage');
const status = document.querySelector('#preview-status');
const retryButton = document.querySelector('#retry-preview');
let activePage = fallbackPage;

const pageGroups = Object.freeze([
  { id: 'conference', title: '大会基础', pages: ['home', 'home-approved', 'service-hall'] },
  { id: 'schedule', title: '日程与嘉宾', pages: ['schedule', 'schedule-search', 'agenda-detail', 'guest-detail', 'guest-feature', 'notifications'] },
  { id: 'services', title: '服务与探索', pages: ['entry-service', 'tech-interaction', 'dining-service', 'carnival', 'attendance-guide', 'food-street', 'city-walk', 'transportation', 'faq', 'youth-study', 'accommodation', 'venue-guide'] },
  { id: 'profile', title: '个人中心', pages: ['profile', 'personal-info', 'meal-benefits', 'contact-staff', 'cooperation-materials', 'registration-detail', 'edit-registration', 'open-mic-detail', 'entry-result', 'meal-voucher'] },
  { id: 'more', title: '报名与资讯', pages: ['conference-registration', 'information', 'ai-assistant'] },
]);

function organizeDirectory() {
  const buttonsById = new Map(directoryButtons.map((button) => [button.dataset.pageId, button]));
  for (const group of pageGroups) {
    const heading = document.createElement('h2');
    heading.className = 'page-board__group-label';
    heading.dataset.groupId = group.id;
    heading.textContent = group.title;
    directory.append(heading);
    for (const id of group.pages) {
      const button = buttonsById.get(id);
      if (button) directory.append(button);
    }
  }
}

function filterDirectory() {
  const keyword = pageFilter?.value.trim().toLocaleLowerCase('zh-CN') ?? '';
  directoryButtons.forEach((button) => {
    const content = button.textContent.toLocaleLowerCase('zh-CN');
    button.hidden = Boolean(keyword) && !content.includes(keyword);
  });
  directory.querySelectorAll('[data-group-id]').forEach((heading) => {
    const group = pageGroups.find((item) => item.id === heading.dataset.groupId);
    heading.hidden = !group?.pages.some((id) => !buttonsByIdForFilter(id).hidden);
  });
}

function buttonsByIdForFilter(id) {
  return directoryButtons.find((button) => button.dataset.pageId === id) ?? { hidden: true };
}

function pageFromHash() {
  return pagesById.get(window.location.hash.slice(1)) ?? fallbackPage;
}

function renderPage(nextPage) {
  activePage = nextPage;
  preview.src = nextPage.path;
  preview.title = `${nextPage.title}预览`;
  previewTitle.textContent = nextPage.title;
  openPage.href = nextPage.path;
  stage.setAttribute('aria-busy', 'true');
  status.textContent = `正在加载${nextPage.title}…`;
  status.hidden = false;
  retryButton.hidden = true;
  directoryButtons.forEach((button) => {
    const selected = button.dataset.pageId === nextPage.id;
    button.classList.toggle('is-current', selected);
    button.setAttribute('aria-current', selected ? 'page' : 'false');
  });
}

function selectPage(nextPage) {
  if (window.location.hash !== `#${nextPage.id}`) {
    window.location.hash = nextPage.id;
    return;
  }
  renderPage(nextPage);
}

function syncFromHash() {
  renderPage(pageFromHash());
}

directoryButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    selectPage(pagesById.get(button.dataset.pageId) ?? fallbackPage);
  });
});

organizeDirectory();
pageFilter?.addEventListener('input', filterDirectory);

preview.addEventListener('load', () => {
  stage.setAttribute('aria-busy', 'false');
  status.hidden = true;
});

preview.addEventListener('error', () => {
  stage.setAttribute('aria-busy', 'false');
  status.textContent = `${activePage.title}加载失败，请重试。`;
  status.hidden = false;
  retryButton.hidden = false;
});

retryButton.addEventListener('click', () => renderPage(activePage));
window.addEventListener('hashchange', syncFromHash);
syncFromHash();
page?.setAttribute('data-ui-ready', 'true');
