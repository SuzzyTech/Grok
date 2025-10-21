// Config
const ACTIONS = [
  { id: 'action_sub', url: 'https://www.youtube.com/@SuzzyTech?sub_confirmation=1' },
  { id: 'action_wh_chan', url: 'https://whatsapp.com/channel/0029Vb6czaK3GJP2Dngjjj09' },
  { id: 'action_wh_group', url: 'https://chat.whatsapp.com/DnPNfu7Di8c66664EEE9NE?mode=ems_copy_t' }
];
const REQUIRED_SECONDS = 15;

// State
const state = {};

// Elements
const progressEl = document.getElementById('progress');
const copyBtn = document.getElementById('copyBtn');
const gotoBtn = document.getElementById('gotoBtn');
const promptMask = document.getElementById('promptMask');
const promptText = document.getElementById('promptText');

// Setup buttons
function setup(){
  ACTIONS.forEach(a=>{
    state[a.id] = { verified:false, timer:null, remaining:REQUIRED_SECONDS };
    const btn = document.querySelector(`#btn_${a.id}`);
    const status = document.getElementById(`status_${a.id}`);

    // If stored in localStorage, mark verified
    if(localStorage.getItem('verified_'+a.id)==='1'){
      markVerified(a.id);
    }

    btn.addEventListener('click', ()=>{
      startVerification(a, btn, status);
    });
  });
  updateProgress();
}

function startVerification(action, btn, statusEl){
  if(state[action.id].verified) return;
  // open link
  const win = window.open(action.url, '_blank');
  btn.disabled = true;
  statusEl.textContent = 'Counting...';
  let remaining = REQUIRED_SECONDS;
  const timerId = setInterval(()=>{
    remaining -= 1;
    statusEl.textContent = remaining + 's';
    if(remaining <= 0){
      clearInterval(timerId);
      state[action.id].verified = true;
      localStorage.setItem('verified_'+action.id, '1');
      markVerified(action.id);
    }
  }, 1000);
  state[action.id].timer = timerId;
}

function markVerified(id){
  const btn = document.querySelector(`#btn_${id}`);
  const status = document.getElementById(`status_${id}`);
  if(btn){ btn.textContent = 'Verified'; btn.classList.remove('primary'); btn.classList.add('ghost'); btn.disabled = true; }
  if(status){ status.innerHTML = '<span style="color:#7bf7a3;font-weight:800">Verified</span>'; }
  updateProgress();
  checkAll();
}

function updateProgress(){
  const count = ACTIONS.filter(a => state[a.id].verified || localStorage.getItem('verified_'+a.id)==='1').length;
  progressEl.textContent = `${count} / ${ACTIONS.length} verified`;
}

function checkAll(){
  const all = ACTIONS.every(a => state[a.id].verified || localStorage.getItem('verified_'+a.id)==='1');
  if(all){
    unlockPrompt();
  }
}

function unlockPrompt(){
  // reveal prompt
  if(promptMask){ promptMask.style.display = 'none'; promptText.style.display = 'block'; }
  copyBtn.disabled = false;
  gotoBtn.setAttribute('aria-disabled', 'false');
  gotoBtn.classList.remove('ghost');
  gotoBtn.classList.add('primary');
  updateProgress();
}

copyBtn.addEventListener('click', ()=>{
  const txt = promptText.textContent.trim();
  navigator.clipboard.writeText(txt).then(()=>{
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent = 'Copy prompt', 2000);
  }).catch(()=>{
    alert('Copy failed. Please select the text and copy manually.');
  });
});

// On load
window.addEventListener('load', ()=>{
  setup();
});