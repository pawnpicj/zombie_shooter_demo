const api=window.deadZoneWindow;
if(api){
  document.body.classList.add('desktop');
  const bar=document.createElement('div');
  bar.id='windowBar';
  bar.innerHTML='<span>DEAD ZONE <small>WINDOWS EDITION</small></span><div><button id="winMin" aria-label="ย่อหน้าต่าง">−</button><button id="winMax" aria-label="ขยายหรือคืนขนาดหน้าต่าง">□</button><button id="winClose" aria-label="ปิดเกม">×</button></div>';
  document.body.appendChild(bar);
  const controls=document.createElement('div');
  controls.className='desktop-controls';
  controls.innerHTML='<select id="displayMode" aria-label="โหมดหน้าต่าง"><option value="windowed">หน้าต่างมีขอบ</option><option value="borderless">หน้าต่างไร้ขอบ / F10</option><option value="fullscreen">เต็มหน้าจอ / F11</option></select><select id="windowSize" aria-label="ขนาดหน้าต่าง"><option value="">ขนาดหน้าต่าง</option><option value="960x640">960 × 640</option><option value="1280x720">1280 × 720</option><option value="1600x900">1600 × 900</option><option value="1920x1080">1920 × 1080</option></select><button id="desktopClose" aria-label="ปิดเกม">×</button>';
  document.querySelector('header .status').prepend(controls);
  function apply(state){
    for(const mode of ['windowed','borderless','fullscreen'])document.body.classList.toggle('desktop-'+mode,state.mode===mode);
    document.querySelector('#displayMode').value=state.mode;
    document.querySelector('#windowSize').disabled=state.mode==='fullscreen';
    document.querySelector('#winMax').textContent=state.maximized?'❐':'□';
  }
  api.onState(apply);apply(await api.getState());
  const change=async(fn)=>{
    document.activeElement?.blur();
    try{apply(await fn());}catch(error){console.error('Window control:',error);}
    document.querySelector('#windowSize').value='';
  };
  document.querySelector('#displayMode').addEventListener('change',event=>{
    const mode=event.target.value;change(()=>api.setMode(mode));
  });
  document.querySelector('#windowSize').addEventListener('change',event=>{
    if(!event.target.value)return;
    const [w,h]=event.target.value.split('x').map(Number);change(()=>api.setSize(w,h));
  });
  document.querySelector('#winMin').onclick=()=>api.minimize();
  document.querySelector('#winMax').onclick=()=>api.maximize();
  document.querySelector('#winClose').onclick=()=>api.close();
  document.querySelector('#desktopClose').onclick=()=>api.close();
}
