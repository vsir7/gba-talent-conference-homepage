const page = document.querySelector('.profile-shell');
const dialog = document.querySelector('#profile-dialog');
const dialogTitle = document.querySelector('#profile-dialog-title');
const dialogDescription = document.querySelector('#profile-dialog-description');
const snackbar = document.querySelector('.profile-snackbar');
const snackbarText = snackbar.querySelector('span');
let snackbarTimer;

const messages = {
  '参会详情': ['我的参会', '张小湾\n参会身份：普通参会人员\n审核状态：报名已通过\n大会时间：10月25日—10月26日\n大会地点：东莞 · 松山湖'],
  '我的日程': ['我的日程', '下一场活动为 10:30「创新大讲堂：技术创新与产业未来」。'],
  '我的开放麦': ['我的开放麦', '您的开放麦报名已通过，会务组将按现场安排通知您。'],
  '餐饮权益': ['餐饮权益', '今日餐饮权益可用，请以现场餐饮服务说明为准。'],
  '合作需求': ['合作需求', '合作需求及已提交材料将在正式业务系统接入后展示。'],
  '个人信息': ['个人信息', '个人资料编辑入口将在正式业务系统接入后开放。'],
  '联系会务': ['联系会务', '请以大会官方最新通知中的会务联系方式为准。'],
  '退出登录': ['退出登录', '当前为静态演示页面，未接入实际登录状态。'],
  'AI助手': ['AI助手', 'AI 助手即将为您提供大会问答、路线和日程建议。'],
};

function openDialog(title, description) {
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function showSnackbar(message) {
  snackbarText.textContent = message;
  snackbar.hidden = false;
  window.clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() => { snackbar.hidden = true; }, 2800);
}

document.querySelectorAll('[data-profile-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const [title, description] = messages[button.dataset.profileAction] || ['提示', '该功能正在准备中。'];
    openDialog(title, description);
  });
});

document.querySelector('[data-notification]')?.addEventListener('click', () => {
  showSnackbar('您有一条新的大会服务通知。');
});

document.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
page?.setAttribute('data-ui-ready', 'true');
