// Final upgraded site script (retry)
const ACTIONS = [
  { id: 'action_sub', url: 'https://www.youtube.com/@SuzzyTech?sub_confirmation=1' },
  { id: 'action_wh_chan', url: 'https://whatsapp.com/channel/0029Vb6czaK3GJP2Dngjjj09' },
  { id: 'action_wh_group', url: 'https://chat.whatsapp.com/DnPNfu7Di8c66664EEE9NE?mode=ems_copy_t' }
];
const REQUIRED_SECONDS = 15;

// State
const state = {}; // id -> {verified, timer, remaining}

// Elements
const bigProgress = document.getElementById('bigProgress');
const lockedOverlay = document.getElementById('lockedOverlay');
const lockedText = document.getElementById('lockedText');
const promptText = document.getElementById('promptText');
const copyBtn = document.getElementById('copyBtn');
const gotoBtn = document.getElementById('gotoBtn');

function safeOpen(url){
  try{
    const w = window.open(url, '_blank');
    if(!w) console.warn('Popup blocked or failed to open:', url);
    return w;
  }catch(e){ console.warn('open failed', e); }
  return null;
}

// Initialize actions
ACTIONS.forEach(a=>{
  state[a.id] = { verified:false, timer:null, remaining:REQUIRED_SECONDS };
  const btn = document.getElementById('btn_'+a.id);
  const status = document.getElementById('status_'+a.id);
  const spinner = btn.querySelector('.spinner');
  const countNode = btn.querySelector('.count');
  // load from localStorage
  if(localStorage.getItem('verified_'+a.id) === '1'){
    markVerified(a.id);
  }

  btn.addEventListener('click', (e)=>{
    if(state[a.id].verified) return;
    // open url (user gesture)
    safeOpen(a.url);
    // start visual verification only for that action
    startSimulatedVerification(a.id, btn, status, spinner, countNode);
  });
});

function startSimulatedVerification(id, btn, statusEl, spinnerEl, countNode){
  // clear existing
  if(state[id].timer) clearInterval(state[id].timer);
  spinnerEl.style.display = 'inline-block';
  countNode.style.display = 'inline-block';
  let remaining = REQUIRED_SECONDS;
  countNode.textContent = remaining + 's';
  statusEl.textContent = 'Verifying...';
  btn.classList.add('verifying');
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
      btn.classList.remove('verifying');
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

function updateProgressDisplay(){
  const done = ACTIONS.filter(a => state[a.id].verified || localStorage.getItem('verified_'+a.id) === '1').length;
  bigProgress.textContent = done + ' / ' + ACTIONS.length;
  lockedText.textContent = 'Locked — ' + done + '/' + ACTIONS.length + ' verified';
}

function markVerified(id){
  const btn = document.getElementById('btn_'+id);
  const status = document.getElementById('status_'+id);
  if(btn){ btn.disabled = true; btn.querySelector('.spinner').style.display = 'none'; btn.querySelector('.count').style.display = 'none'; }
  if(status){ status.innerHTML = '<span class="verified-badge">Verified</span>'; }
  state[id].verified = true;
  updateProgressDisplay();
  checkAllAndUnlock();
}

function checkAllAndUnlock(){
  updateProgressDisplay();
  const all = ACTIONS.every(a => state[a.id].verified || localStorage.getItem('verified_'+a.id) === '1');
  if(all){
    lockedOverlay.style.display = 'none';
    promptText.style.display = 'block';
    copyBtn.disabled = false;
    gotoBtn.classList.remove('disabled');
    gotoBtn.removeAttribute('aria-disabled');
    lockedText.textContent = 'Unlocked — All verified ✅';
    promptText.scrollIntoView({behavior:'smooth', block:'center'});
  }
}

// Copy prompt
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