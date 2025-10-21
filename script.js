// Unlock method adapted from uploaded site: manual open + countdown unlock
const ACTION_IDS = ['btn_action_sub', 'btn_action_wh_chan', 'btn_action_wh_group'];
const REQUIRED_SECONDS = 15;

function unlock(id, link) {
  // open the link in a new tab (user gesture)
  window.open(link, '_blank');

  const btn = document.getElementById(id);
  const statusId = id.replace('btn_', 'status_');
  const statusEl = document.getElementById(statusId);
  let countdown = REQUIRED_SECONDS;

  // show verifying state
  btn.classList.add('verifying');
  btn.querySelector('.inner').textContent = `Verifying... ${countdown}s`;
  btn.style.opacity = '0.6';
  btn.style.pointerEvents = 'none';
  statusEl.textContent = 'Verifying...';

  const timer = setInterval(() => {
    countdown--;
    const inner = btn.querySelector('.inner');
    if (countdown <= 0) {
      clearInterval(timer);

      // ✅ mark as unlocked for this button
      btn.classList.remove('verifying', 'click-verify'); // 🔥 stops glow permanently
      btn.querySelector('.inner').textContent = '✅ Verified';
      statusEl.innerHTML = '<span class="verified-badge">Verified</span>';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';

      // disable further clicks and mark done
      btn.setAttribute('data-verified', '1');
      btn.removeAttribute('onclick'); // remove unlock handler

      updateProgress();
      checkAllAndReveal();
      return;
    } else {
      inner.textContent = `Verifying... ${countdown}s`;
      statusEl.textContent = `Verifying... ${countdown}s`;
    }
  }, 1000);
}

function updateProgress() {
  const done = ACTION_IDS.reduce(
    (acc, id) => acc + (document.getElementById(id).getAttribute('data-verified') === '1' ? 1 : 0),
    0
  );
  const display = document.getElementById('bigProgress');
  display.textContent = `You have completed ${done} of ${ACTION_IDS.length} verifications`;

  const lockedText = document.getElementById('lockedText');
  lockedText.textContent = `Please verify all buttons below to access the free AI video generator. (${done}/${ACTION_IDS.length})`;
}

function checkAllAndReveal() {
  const all = ACTION_IDS.every(id => document.getElementById(id).getAttribute('data-verified') === '1');
  if (all) {
    // reveal prompt and enable copy + access
    document.getElementById('lockedOverlay').style.display = 'none';
    document.getElementById('promptText').style.display = 'block';

    const copyBtn = document.getElementById('copyBtn');
    copyBtn.disabled = false;
    copyBtn.classList.add('ready');

    const gotoBtn = document.getElementById('gotoBtn');
    gotoBtn.classList.remove('disabled');
    gotoBtn.classList.add('pulse');
    gotoBtn.href = 'https://accounts.x.ai/sign-up?redirect=grok-com';
    gotoBtn.removeAttribute('aria-disabled');

    // scroll to prompt
    document.getElementById('promptText').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

document.getElementById('copyBtn').addEventListener('click', () => {
  const txt = document.getElementById('promptText').textContent.trim();
  navigator.clipboard
    .writeText(txt)
    .then(() => {
      const btn = document.getElementById('copyBtn');
      btn.querySelector('.inner-copy').textContent = 'Copied!';
      setTimeout(() => (btn.querySelector('.inner-copy').textContent = 'Copy prompt'), 2000);
    })
    .catch(() => alert('Copy failed — please select and copy manually.'));
});

// initialize progress from any verified attributes (if user reloads)
window.addEventListener('load', () => {
  updateProgress();
});
