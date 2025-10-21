// Final build - fully manual 15s simulated verification, moving inner gradient, overlay-safe buttons, pulse on unlock
const ACTIONS = [
  { id: 'action_sub', url: 'https://www.youtube.com/@SuzzyTech?sub_confirmation=1' },
  { id: 'action_wh_chan', url: 'https://whatsapp.com/channel/0029Vb6czaK3GJP2Dngjjj09' },
  { id: 'action_wh_group', url: 'https://chat.whatsapp.com/DnPNfu7Di8c66664EEE9NE?mode=ems_copy_t' }
];

const REQUIRED_SECONDS = 15;
const state = {};

const bigProgress = document.getElementById('bigProgress');
const lockedOverlay = document.getElementById('lockedOverlay');
const lockedText = document.getElementById('lockedText');
const promptText = document.getElementById('promptText');
const copyBtn = document.getElementById('copyBtn');
const gotoBtn = document.getElementById('gotoBtn');

function safeOpen(url) {
  try {
    const w = window.open(url, '_blank');
    if (!w) console.warn('Popup blocked:', url);
    return w;
  } catch (e) {
    console.warn('open failed', e);
  }
  return null;
}

ACTIONS.forEach(a => {
  state[a.id] = { verified: false, timer: null, remaining: REQUIRED_SECONDS };
  const btn = document.getElementById('btn_' + a.id);
  const status = document.getElementById('status_' + a.id);
  const spinner = btn.querySelector('.spinner');
  const countNode = btn.querySelector('.count');
  const liveGrad = btn.querySelector('.live-gradient');

  if (localStorage.getItem('verified_' + a.id) === '1') {
    markVerified(a.id);
  }

  btn.addEventListener('click', () => {
    if (state[a.id].verified) return;
    safeOpen(a.url);
    startSimulatedVerification(a.id, btn, status, spinner, countNode, liveGrad);
  });
});

function startSimulatedVerification(id, btn, statusEl, spinnerEl, countNode, liveGrad) {
  if (state[id].timer) clearInterval(state[id].timer);

  btn.classList.add('verifying');
  liveGrad.style.display = 'block';
  btn.querySelector('.inner').textContent = 'Verifying...';

  let remaining = REQUIRED_SECONDS;
  countNode.style.display = 'inline-block';
  countNode.textContent = remaining + 's';
  statusEl.textContent = 'Verifying...';

  const t = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(t);
      state[id].timer = null;
      state[id].verified = true;
      localStorage.setItem('verified_' + id, '1');
      btn.classList.remove('verifying');
      spinnerEl.style.display = 'none';
      countNode.style.display = 'none';
      statusEl.innerHTML = '<span class="verified-badge">Verified</span>';
      btn.querySelector('.inner').textContent = 'Verified';
      btn.disabled = true;
      liveGrad.style.display = 'none';
      checkAllAndUnlock();
    } else {
      countNode.textContent = remaining + 's';
      spinnerEl.style.display = 'inline-block';
    }
    updateProgressDisplay();
  }, 1000);
  state[id].timer = t;
  updateProgressDisplay();
}

function markVerified(id) {
  const btn = document.getElementById('btn_' + id);
  const status = document.getElementById('status_' + id);
  if (btn) {
    btn.disabled = true;
    btn.querySelector('.spinner').style.display = 'none';
    btn.querySelector('.count').style.display = 'none';
    btn.querySelector('.inner').textContent = 'Verified';
  }
  if (status) status.innerHTML = '<span class="verified-badge">Verified</span>';
  state[id].verified = true;
  updateProgressDisplay();
  checkAllAndUnlock();
}

function updateProgressDisplay() {
  const done = ACTIONS.filter(a => state[a.id].verified || localStorage.getItem('verified_' + a.id) === '1').length;
  bigProgress.textContent = `You have completed ${done} of ${ACTIONS.length} verifications`;
  lockedText.textContent = `Please verify all buttons below to access the free AI video generator. (${done}/${ACTIONS.length})`;
}

function checkAllAndUnlock() {
  updateProgressDisplay();
  const all = ACTIONS.every(a => state[a.id].verified || localStorage.getItem('verified_' + a.id) === '1');
  if (all) {
    lockedOverlay.style.display = 'none';
    promptText.style.display = 'block';
    copyBtn.disabled = false;
    copyBtn.classList.add('ready');
    gotoBtn.classList.remove('disabled');
    gotoBtn.classList.add('pulse');
    gotoBtn.removeAttribute('aria-disabled');
    promptText.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

copyBtn.addEventListener('click', () => {
  const txt = promptText.textContent.trim();
  navigator.clipboard.writeText(txt).then(() => {
    copyBtn.querySelector('.inner-copy').textContent = 'Copied!';
    setTimeout(() => copyBtn.querySelector('.inner-copy').textContent = 'Copy prompt', 2000);
  }).catch(() => {
    alert('Copy failed. Please copy manually.');
  });
});

window.addEventListener('load', () => {
  updateProgressDisplay();
});
