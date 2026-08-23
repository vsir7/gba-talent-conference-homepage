const shell = document.querySelector('.batch4-shell');
const toast = document.querySelector('#batch4-toast');
let toastTimer;
function feedback(message) { if (!toast) return; clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 2300); }
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => { if (history.length > 1) history.back(); else location.href = 'profile.html'; }));
document.querySelectorAll('[data-feedback]').forEach((button) => button.addEventListener('click', () => feedback(button.dataset.feedback)));
shell?.setAttribute('data-ui-ready', 'true');
