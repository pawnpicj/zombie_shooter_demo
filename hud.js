const panels=['#radio','#missionHud','.weapon'].map(selector=>({selector,element:document.querySelector(selector),timer:null}));
export function revealHud(selectors=panels.map(panel=>panel.selector)){
  for(const panel of panels){
    if(!selectors.includes(panel.selector) || !panel.element)continue;
    clearTimeout(panel.timer);
    panel.element.classList.remove('hud-compact','hud-peek');
    panel.timer=setTimeout(()=>{
      panel.element.classList.remove('hud-peek');
      panel.element.classList.add('hud-compact');
    },10000);
  }
}
// Track hover without intercepting clicks or blocking shots into the arena.
window.addEventListener('pointermove',event=>{
  const playing=document.body.classList.contains('playing');
  for(const {element} of panels){
    if(!element)continue;
    if(!playing || element.hidden || !element.classList.contains('hud-compact')){
      element.classList.remove('hud-peek');continue;
    }
    const rect=element.getBoundingClientRect();
    element.classList.toggle('hud-peek',event.clientX>=rect.left && event.clientX<=rect.right && event.clientY>=rect.top && event.clientY<=rect.bottom);
  }
});
window.addEventListener('blur',()=>panels.forEach(({element})=>element?.classList.remove('hud-peek')));
