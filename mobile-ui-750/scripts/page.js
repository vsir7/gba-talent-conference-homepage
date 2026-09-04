import { renderPageById } from './page-runtime.mjs?v=20260903-5';
import { PAGE_BY_ID } from './page-registry.mjs?v=20260903-5';

const root = document.querySelector('#app');
const pageId = document.body.dataset.pageId;

try {
  root.innerHTML = renderPageById(pageId);
} catch (error) {
  root.innerHTML = `<main class="screen"><section class="render-error"><h1>页面加载失败</h1><p>${String(error.message)}</p></section></main>`;
  throw error;
}

function goTo(page) {
  const target = PAGE_BY_ID.get(page);
  if (target) window.location.href = `./${target.file}`;
}

function showStatus(message) {
  let region = root.querySelector('[data-runtime-status]');
  if (!region) {
    region = document.createElement('div');
    region.className = 'runtime-status';
    region.dataset.runtimeStatus = '';
    region.setAttribute('role', 'status');
    root.querySelector('.screen')?.append(region);
  }
  region.textContent = message;
}

root.addEventListener('click', (event) => {
  const control = event.target.closest('button');
  if (!control) return;

  if (control.dataset.route) {
    goTo(control.dataset.route);
    return;
  }

  if (control.dataset.filter) {
    control.parentElement?.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === control));
    showStatus(`已切换：${control.textContent.trim()}`);
    return;
  }

  if (control.dataset.toggle === 'faq') {
    const item = control.closest('.faq-item');
    const answer = item?.querySelector('p');
    const expanded = control.getAttribute('aria-expanded') === 'true';
    control.setAttribute('aria-expanded', String(!expanded));
    item?.classList.toggle('open', !expanded);
    if (answer) answer.hidden = expanded;
    return;
  }

  switch (control.dataset.action) {
    case 'back':
      if (history.length > 1) history.back();
      else goTo('conference-home');
      break;
    case 'select-slot':
    case 'select-type': {
      const action = control.dataset.action;
      root.querySelectorAll(`[data-action="${action}"]`).forEach((item) => item.classList.remove('selected'));
      control.parentElement?.querySelectorAll('.choice-dot').forEach((dot) => { dot.textContent = ''; });
      control.classList.add('selected');
      const dot = control.querySelector('.choice-dot');
      if (dot) dot.textContent = '✓';
      break;
    }
    case 'select-role': {
      root.querySelectorAll('[data-action="select-role"]').forEach((item) => {
        const selected = item === control;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-checked', String(selected));
      });
      break;
    }
    case 'registration-submit': {
      const selectedType = root.querySelector('[data-action="select-type"].selected');
      goTo(selectedType?.dataset.registrationRoute || 'phone-authorization');
      break;
    }
    case 'add-outline': {
      const list = root.querySelector('[data-outline-list]');
      const count = list?.querySelectorAll('.outline-row').length || 0;
      if (!list || count >= 5) {
        showStatus('最多添加5项分享要点');
        break;
      }
      const row = document.createElement('div');
      row.className = 'outline-row';
      row.innerHTML = `<span>${count + 1}</span><input name="outline[]" aria-label="分享要点 ${count + 1}" placeholder="请输入第${count + 1}个分享要点">`;
      list.append(row);
      row.querySelector('input')?.focus();
      break;
    }
    case 'authorize-phone':
      goTo('registration-review');
      break;
    case 'deny-phone':
      goTo('agenda-intro');
      break;
    case 'play-video':
      control.classList.toggle('is-playing');
      control.textContent = control.classList.contains('is-playing') ? 'Ⅱ' : '▶';
      showStatus(control.classList.contains('is-playing') ? '宣传片播放中' : '宣传片已暂停');
      break;
    case 'change-avatar':
      showStatus('头像选择器已打开（静态原型）');
      break;
    case 'contact': {
      const value = control.dataset.contact || '';
      if (/^[\d+\-\s]+$/.test(value)) window.location.href = `tel:${value.replace(/\s/g, '')}`;
      else if (value.includes('@')) window.location.href = `mailto:${value}`;
      else showStatus(`联系方式：${value}`);
      break;
    }
    case 'header-action':
    case 'acknowledge':
      showStatus(`${control.textContent.trim()}已响应`);
      break;
    default:
      break;
  }
});

root.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.matches('.chat-input')) {
    const input = form.querySelector('input');
    const value = input?.value.trim();
    if (!value) return;
    const message = document.createElement('div');
    message.className = 'chat-bubble user';
    message.textContent = value;
    root.querySelector('.chat-list')?.append(message);
    input.value = '';
    showStatus('问题已发送');
    return;
  }
  if (form.matches('.info-form')) showStatus('个人信息已保存');
  if (form.matches('.speaker-form')) goTo('registration-review');
  if (form.matches('.profile-completion-form')) goTo('personal-info');
});

root.addEventListener('input', (event) => {
  if (event.target.matches('textarea[name="introduction"]')) {
    const counter = root.querySelector('[data-intro-count]');
    if (counter) counter.textContent = String(event.target.value.length);
  }
  if (event.target.matches('input[type="file"]')) {
    const label = root.querySelector('[data-upload-label]');
    if (label) label.textContent = event.target.files?.[0]?.name || '点击上传分享材料';
    const profileLabel = root.querySelector('[data-profile-upload-label]');
    if (profileLabel) profileLabel.textContent = event.target.files?.[0]?.name || '上传照片';
  }
  if (event.target.matches('[data-count-target]')) {
    const counter = event.target.parentElement?.querySelector('[data-count]');
    if (counter) counter.textContent = String(event.target.value.length);
  }
});
