const shell = document.querySelector('.batch-shell');
const snackbar = document.querySelector('#batch-snackbar');
let messageTimer;

function notify(message) {
  if (!snackbar) return;
  window.clearTimeout(messageTimer);
  snackbar.textContent = message;
  snackbar.hidden = false;
  messageTimer = window.setTimeout(() => { snackbar.hidden = true; }, 2400);
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

document.querySelectorAll('[data-faq-question]').forEach((control) => {
  control.addEventListener('click', () => {
    const expanded = control.getAttribute('aria-expanded') === 'true';
    control.setAttribute('aria-expanded', String(!expanded));
  });
});

document.querySelectorAll('[data-study-tab]').forEach((control) => {
  control.addEventListener('click', () => {
    document.querySelectorAll('[data-study-tab]').forEach((tab) => tab.classList.toggle('is-active', tab === control));
    notify(`${control.textContent.trim()}研学路线已切换`);
  });
});

function replaceIllustration(selector, source, width, height, alt) {
  const node = document.querySelector(selector);
  if (!node) return;
  const image = document.createElement('img');
  image.className = 'transport-choice__image';
  image.src = source;
  image.width = width;
  image.height = height;
  image.alt = alt;
  node.replaceWith(image);
}

const cityPin = document.querySelector('.city-brief__pin');
if (cityPin?.tagName === 'DIV') {
  const image = document.createElement('img');
  image.className = 'city-brief__pin city-brief__pin--asset';
  image.src = 'public/assets/service-batch-02/city-pin.png';
  image.width = 160;
  image.height = 143;
  image.alt = '城市漫游定位插画';
  cityPin.replaceWith(image);
}
replaceIllustration('[data-message="公共交通攻略将于会前更新"] .transport-choice__icon', 'public/assets/service-batch-02/transport-public.png', 102, 105, '公共交通插画');
replaceIllustration('[data-message="自驾导航已为您准备"] .transport-choice__icon', 'public/assets/service-batch-02/transport-car.png', 102, 105, '自驾插画');

shell?.setAttribute('data-ui-ready', 'true');
