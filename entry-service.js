const page = document.querySelector('.entry-shell');
const dialog = document.querySelector('#entry-dialog');
const dialogTitle = document.querySelector('#entry-dialog-title');
const dialogDescription = document.querySelector('#entry-dialog-description');

const openDialog = (title, description) => {
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  if (typeof dialog.showModal === 'function') dialog.showModal();
};

document.querySelector('[data-back]')?.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else window.location.assign('index.html');
});

document.querySelector('[data-result]')?.addEventListener('click', () => {
  openDialog('完整入场结果', '姓名：张小华\n参会身份：普通参会人员\n审核状态：报名已通过\n当前状态：可入场\n主会场：大湾区大学（松山湖校区）体育馆');
});

document.querySelector('[data-support]')?.addEventListener('click', () => {
  openDialog('联系会务', '正式会务电话或在线客服尚未接入当前静态演示版本。请以大会官方最新通知中的联系方式为准。');
});

document.querySelectorAll('[data-dialog-close]').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

page?.setAttribute('data-ui-ready', 'true');
