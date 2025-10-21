// Unlock method adapted from uploaded site: manual open + countdown unlock
const ACTION_IDS = ['btn_action_sub','btn_action_wh_chan','btn_action_wh_group'];
const REQUIRED_SECONDS = 15;
  }, 1000);
}

function updateProgress(){
  const done = ACTION_IDS.reduce((acc,id)=> acc + (document.getElementById(id).getAttribute('data-verified') === '1' ? 1 : 0), 0);
  const display = document.getElementById('bigProgress');
  display.textContent = `You have completed ${done} of ${ACTION_IDS.length} verifications`;
  const lockedText = document.getElementById('lockedText');
  lockedText.textContent = `Please verify all buttons below to access the free AI video generator. (${done}/${ACTION_IDS.length})`;
}

function checkAllAndReveal(){
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
    document.getElementById('promptText').scrollIntoView({behavior:'smooth', block:'center'});
  }
}

document.getElementById('copyBtn').addEventListener('click', ()=>{
  const txt = document.getElementById('promptText').textContent.trim();
  navigator.clipboard.writeText(txt).then(()=>{
    const btn = document.getElementById('copyBtn');
    btn.querySelector('.inner-copy').textContent = 'Copied!';
    setTimeout(()=> btn.querySelector('.inner-copy').textContent = 'Copy prompt', 2000);
  }).catch(()=> alert('Copy failed — please select and copy manually.'));
});

// initialize progress from any verified attributes (if user reloads)
window.addEventListener('load', ()=>{
  updateProgress();
});


/* --- Added outline glow/verification behavior --- */

/* --- Enhanced verification flow: outline glow -> verifying -> done -> show single Verified button --- */
const ACTION_IDS = ['btn_action_sub','btn_action_wh_chan','btn_action_wh_group'];
const REQUIRED_SECONDS = 6;
function unlock(id, link) {
  try { window.open(link, '_blank'); } catch(e) { console.warn('open failed', e); }
  const btn = document.getElementById(id);
  if(!btn) return;
  let countdown = REQUIRED_SECONDS;
  btn.classList.add('verifying');
  const inner = btn.querySelector('.inner');
  if(inner) inner.textContent = `Verifying... ${countdown}s`;
  const iv = setInterval(()=>{
    countdown -= 1;
    if(inner) inner.textContent = `Verifying... ${countdown}s`;
    if(countdown <= 0) {
      clearInterval(iv);
      btn.classList.remove('verifying');
      btn.classList.remove('click-verify');
      btn.classList.add('done');
      if(inner) inner.textContent = 'Verified';
      btn.setAttribute('aria-disabled','true');
      btn.style.pointerEvents = 'none';
      const allDone = ACTION_IDS.every(x => {
        const el = document.getElementById(x);
        return el && el.classList.contains('done');
      });
      if(allDone) {
        const placeholder = document.getElementById('verified_placeholder');
        if(placeholder) {
          const actionsArea = document.getElementById('actions_area');
          if(actionsArea) {
            const nodes = actionsArea.querySelectorAll('.action-item, a.btn');
            nodes.forEach(n=> n.style.display = 'none');
          }
          const vb = document.createElement('div');
          vb.className = 'verified-replacement';
          vb.textContent = 'Verified';
          placeholder.appendChild(vb);
          placeholder.style.display = 'block';
        }
      }
    }
  }, 1000);
}

window.addEventListener('load', ()=>{
  ACTION_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.removeAttribute('onclick');
    const link = el.getAttribute('data-href') || el.getAttribute('href') || '#';
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      if(el.classList.contains('done') || el.classList.contains('verifying')) return;
      unlock(id, link);
    });
  });
});
