const dialog = document.querySelector('#action-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const noticeButton = document.querySelector('.notice-bar');
const noticeDetails = document.querySelector('#notice-details');
const reminderButton = document.querySelector('[data-reminder]');
const snackbar = document.querySelector('.snackbar');
const snackbarText = snackbar.querySelector('span');

let snackbarTimer;

function showSnackbar(message) {
  snackbarText.textContent = message;
  snackbar.hidden = false;
  clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() => {
    snackbar.hidden = true;
  }, 3000);
}

function openDialog(title, description) {
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  dialog.showModal();
}

document.querySelectorAll('[data-dialog-title]').forEach((control) => {
  control.addEventListener('click', () => {
    openDialog(control.dataset.dialogTitle, control.dataset.dialogDescription);
  });
});

noticeButton.addEventListener('click', () => {
  const expanded = noticeButton.getAttribute('aria-expanded') === 'true';
  noticeButton.setAttribute('aria-expanded', String(!expanded));
  noticeDetails.hidden = expanded;
});

function setReminder(pressed, announce = false) {
  reminderButton.setAttribute('aria-pressed', String(pressed));
  reminderButton.querySelector('span').textContent = pressed ? '已关注' : '关注日程';
  if (announce) showSnackbar(pressed ? '已关注创新大讲堂' : '已取消关注创新大讲堂');
}

const storedReminder = window.localStorage.getItem('conference-reminder-innovation-lecture') === 'true';
setReminder(storedReminder);

reminderButton.addEventListener('click', () => {
  const next = reminderButton.getAttribute('aria-pressed') !== 'true';
  window.localStorage.setItem('conference-reminder-innovation-lecture', String(next));
  setReminder(next, true);
});

dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

window.__conferenceHome = Object.freeze({
  openDialog,
  setReminder,
  showSnackbar
});
