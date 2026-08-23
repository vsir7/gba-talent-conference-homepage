const page = document.querySelector('.service-shell');
const snackbar = document.querySelector('#service-snackbar');
let snackbarTimer;

function announce(message) {
  window.clearTimeout(snackbarTimer);
  snackbar.textContent = `${message}页面正在按设计稿逐页开发中。`;
  snackbar.hidden = false;
  snackbarTimer = window.setTimeout(() => { snackbar.hidden = true; }, 2600);
}

document.querySelectorAll('[data-pending]').forEach((button) => {
  button.addEventListener('click', () => announce(button.dataset.pending));
});

page?.setAttribute('data-ui-ready', 'true');
