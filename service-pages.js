const tuning = document.createElement('link');
tuning.rel = 'stylesheet';
tuning.href = 'service-pages-tuning.css';
document.head.append(tuning);

const rework = document.createElement('link');
rework.rel = 'stylesheet';
rework.href = 'service-pages-rework.css';
document.head.append(rework);

await import('./service-pages-rework.js');

const shell = document.querySelector('.feature-shell');
const snackbar = document.querySelector('#feature-snackbar');
let timer;

function notify(message) {
  if (!snackbar) return;
  window.clearTimeout(timer);
  snackbar.textContent = message;
  snackbar.hidden = false;
  timer = window.setTimeout(() => { snackbar.hidden = true; }, 2600);
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

shell?.setAttribute('data-ui-ready', 'true');
