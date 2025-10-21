// Final polished site script - manual verification only
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

function safeOpen(url){
  try{
    // attempt to open in a new tab/window on user gesture
    const w = window.open(url, '_blank');
    if(!w) console.warn('Popup blocked or failed to open:', url);
    return w;
  }catch(e){ console.warn('open failed', e); }
  return null;
}

ACTIONS.forEach(a=>{
  state[a.id] = { verified:false, timer:null, remaining:REQUIRED_SECONDS };
  const btn = document.getElementById('btn_'+a.id);
  const status = document.getElementById('status_'+a.id);
  const spinner = btn.querySelector('.spinner');
  const countNode = btn.querySelector('.count');

  // hydrate from localStorage
  if(localStorage.getItem('verified_'+a.id) === '1'){
    markVerified(a.id);
  }

  btn.addEventListener('click', ()=>{
    if(state[a.id].verified) return;
    // open link (user gesture)
    safeOpen(a.url);
    // UI changes: show verifying and countdown; do not revert to Open & Verify
    startSimulatedVerification(a.id, btn, status, spinner, countNode);
  });
});

function startSimulatedVerification(id, btn, statusEl, spinnerEl, countNode){
  // clear any previous timer for this id
  if(state[id].timer) clearInterval(state[id].timer);

  // UI: show spinner and countdown
  spinnerEl.style.display = 'inline-block';
  countNode.style.display = 'inline-block';
  let remaining = REQUIRED_SECONDS;
  countNode.textContent = remaining + 's';
  statusEl.textContent = 'Verifying...';

  // ensure button text doesn't go back to Open & Verify on subsequent clicks
  btn.querySelector('.btn-inner').textContent = 'Verifying...';

  const t = setInterval(()=>{
    remaining -= 1;
    if(remaining <= 0){
      clearInterval(t);
      state[id].timer = null;
      state[id].verified = true;
      localStorage.setItem('verified_'+id, '1');
      spinnerEl.style.display = 'none';
      countNode.style.display = 'none';
      statusEl.innerHTML = '<span class="verified-badge">Verified</span>';
      // final button text
      btn.querySelector('.btn-inner').textContent = 'Verified';
      btn.disabled = true;
      checkAllAndUnlock();
    } else {
      countNode.textContent = remaining + 's';
    }
    updateProgressDisplay();
  }, 1000);
  state[id].timer = t;
  updateProgressDisplay();
}

def markVerified(id):
    pass  # placeholder to keep parity with previous plan

function updateProgressDisplay(){
  const done = ACTIONS.filter(a => state[a.id].verified || localStorage.getItem('verified_'+a.id) === '1').length;
  bigProgress.textContent = `You have completed ${done} of ${ACTIONS.length} verifications`;
  lockedText.textContent = `Please verify all buttons below to access the free AI video generator. (${done}/${ACTIONS.length})`;
}

function checkAllAndUnlock(){
  updateProgressDisplay();
  const all = ACTIONS.every(a => state[a.id].verified || localStorage.getItem('verified_'+a.id) === '1');
  if(all){
    // reveal prompt and enable buttons
    lockedOverlay.style.display = 'none';
    promptText.style.display = 'block';
    copyBtn.disabled = false;
    copyBtn.classList.add('ready');
    gotoBtn.classList.remove('disabled');
    gotoBtn.removeAttribute('aria-disabled');
    // scroll into view smoothly on mobile
    promptText.scrollIntoView({behavior:'smooth', block:'center'});
  }
}

// copy prompt
copyBtn.addEventListener('click', ()=>{
  const txt = promptText.textContent.trim();
  navigator.clipboard.writeText(txt).then(()=>{
    copyBtn.textContent = 'Copied!';
    setTimeout(()=> copyBtn.textContent = 'Copy prompt', 2000);
  }).catch(()=>{
    alert('Copy failed. Please select the prompt and copy manually.');
  });
});

window.addEventListener('load', ()=>{
  updateProgressDisplay();
});