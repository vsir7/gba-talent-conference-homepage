const pages = Object.freeze([
  { id: 'home', title: '大会首页', path: 'index.html' },
  { id: 'schedule', title: '大会日程', path: 'schedule.html' },
  { id: 'entry-service', title: '入场服务', path: 'entry-service.html' },
  { id: 'profile', title: '个人中心', path: 'profile.html' },
]);

const pagesById = new Map(pages.map((page) => [page.id, page]));
const fallbackPage = pages[0];
const page = document.querySelector('.page-board');
const directoryButtons = [...document.querySelectorAll('[data-page-id]')];
const preview = document.querySelector('#page-preview');
const previewTitle = document.querySelector('#preview-title');
const openPage = document.querySelector('#open-page');
const stage = document.querySelector('.page-board__stage');
const status = document.querySelector('#preview-status');
const retryButton = document.querySelector('#retry-preview');
let activePage = fallbackPage;

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
