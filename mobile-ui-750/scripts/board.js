import { PAGES } from './page-registry.mjs';
import { pageHash, resolvePageId } from './board-core.mjs';

const nav = document.querySelector('[data-board-nav]');
const frame = document.querySelector('[data-board-frame]');
const title = document.querySelector('[data-board-title]');
const status = document.querySelector('[data-board-status]');

const groups = [...new Set(PAGES.map((page) => page.group))];

nav.innerHTML = groups.map((group) => `
  <section class="nav-group">
    <h2>${group}</h2>
    ${PAGES.filter((page) => page.group === group).map((page) => `
      <a href="${pageHash(page.id)}" data-page-link="${page.id}">
        <span>${String(PAGES.indexOf(page) + 1).padStart(2, '0')}</span>${page.name}
      </a>`).join('')}
  </section>`).join('');

function selectPage() {
  const pageId = resolvePageId(location.hash, PAGES);
  const page = PAGES.find((item) => item.id === pageId);
  for (const link of nav.querySelectorAll('[data-page-link]')) {
    link.classList.toggle('active', link.dataset.pageLink === pageId);
    if (link.dataset.pageLink === pageId) link.scrollIntoView({ block: 'nearest' });
  }
  title.textContent = page.name;
  status.textContent = `加载中 · ${page.file}`;
  frame.src = `pages/${page.file}`;
  if (location.hash !== pageHash(pageId)) history.replaceState(null, '', pageHash(pageId));
}

frame.addEventListener('load', () => {
  const current = PAGES.find((page) => frame.src.endsWith(`/pages/${page.file}`));
  status.textContent = current ? `750px 固定画布 · ${current.name}` : '750px 固定画布';
});

frame.addEventListener('error', () => {
  status.textContent = '页面加载失败，请检查本地资源';
  status.classList.add('error');
});

window.addEventListener('hashchange', selectPage);
selectPage();
