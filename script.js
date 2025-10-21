
const ACTION_IDS=['btn_action_sub','btn_action_wh_chan','btn_action_wh_group'];
const REQUIRED_SECONDS=6;
function unlock(id,link){
  window.open(link,'_blank');
  const btn=document.getElementById(id);
  if(!btn)return;
  let countdown=REQUIRED_SECONDS;
  btn.classList.add('verifying');
  const inner=btn.querySelector('.inner');
  if(inner)inner.textContent=`Verifying... ${countdown}s`;
  const iv=setInterval(()=>{
    countdown--;
    if(inner)inner.textContent=`Verifying... ${countdown}s`;
    if(countdown<=0){
      clearInterval(iv);
      btn.classList.remove('verifying');btn.classList.remove('click-verify');btn.classList.add('done');
      if(inner)inner.textContent='Verified';
      btn.setAttribute('aria-disabled','true');btn.style.pointerEvents='none';
      const allDone=ACTION_IDS.every(x=>document.getElementById(x).classList.contains('done'));
      if(allDone){
        const area=document.getElementById('actions_area');
        area.querySelectorAll('.action-item,a.btn').forEach(e=>e.style.display='none');
        const ph=document.getElementById('verified_placeholder');
        const vb=document.createElement('div');vb.className='verified-replacement';vb.textContent='Verified';
        ph.appendChild(vb);ph.style.display='block';
        document.getElementById('lockedOverlay').style.display='none';
        document.getElementById('promptText').style.display='block';
        const cbtn=document.getElementById('copyBtn');cbtn.disabled=false;cbtn.classList.add('glow');
        const abtn=document.getElementById('gotoBtn');abtn.classList.remove('disabled');abtn.classList.add('glow');
      }
    }
  },1000);
}
window.addEventListener('load',()=>{
  ACTION_IDS.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const link=el.getAttribute('href')||'#';
    el.addEventListener('click',e=>{e.preventDefault();if(el.classList.contains('done')||el.classList.contains('verifying'))return;unlock(id,link);});
  });
  const cbtn=document.getElementById('copyBtn');
  cbtn.addEventListener('click',()=>{
    const txt=document.getElementById('promptText').textContent;
    navigator.clipboard.writeText(txt);
    cbtn.querySelector('.inner-copy').textContent='Copied!';
    setTimeout(()=>cbtn.querySelector('.inner-copy').textContent='Copy prompt',2000);
  });
});
