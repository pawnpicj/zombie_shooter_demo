import {audioZone,AUDIO_ZONES} from './audio-profiles.mjs';
export function synthesizeCue(kind,sampleRate,variant=0,random=Math.random){
 const duration={growl:.75,attack:.28,hit:.14,impact:.12,death:.60,door:.30,locked:.12,alarm:.8,'power-down':.8,step:.10}[kind];if(!duration)throw new Error('Unknown audio cue');
 const samples=new Float32Array(Math.ceil(duration*sampleRate));let low=0;
 for(let i=0;i<samples.length;i++){const t=i/sampleRate,n=random()*2-1;low+=.12*(n-low);let value;
  if(kind==='growl'||kind==='death'){const hz=(kind==='death'?90-60*t/duration:68+variant*13)+Math.sin(t*26)*12;value=(Math.sin(t*Math.PI*2*hz)+.28*Math.sin(t*Math.PI*2*hz*1.47))*.32+low*.7;}
  else if(kind==='alarm')value=Math.sin(t*Math.PI*2*(520+Math.sin(t*14)*120))*.23;
  else if(kind==='power-down')value=Math.sin(t*Math.PI*2*(150-110*t/duration))*.4+low*.3;
  else if(kind==='door')value=low*.8+Math.sin(t*2*Math.PI*210)*.25*Math.exp(-t/.04)+(t>.18?n*.35*Math.exp(-(t-.18)/.015):0);
  else if(kind==='attack')value=(low+.4*Math.sin(t*2*Math.PI*(145+variant*25)))*.6;
  else value=n*.48*Math.exp(-t/.022)+Math.sin(t*2*Math.PI*(kind==='locked'?780:kind==='step'?110+variant*80:kind==='impact'?1200:110))*.2*Math.exp(-t/.03);
  const envelope=Math.min(1,t/.006)*Math.pow(Math.sin(Math.PI*(1-t/duration)/2),2);samples[i]=Math.max(-.95,Math.min(.95,value*envelope));
 }return samples;
}
export function synthesizeAmbient(zone,sampleRate,random=Math.random){
 const kind=AUDIO_ZONES[audioZone(zone)].ambient,duration=4,samples=new Float32Array(duration*sampleRate);let low=0,last=0;
 for(let i=0;i<samples.length;i++){const t=i/sampleRate,n=random()*2-1;low+=.015*(n-low);last+=.12*(n-last);let value;
  if(kind==='rain')value=n*.20+last*.35+low*Math.sin(t*Math.PI*.5)*.3;
  else if(kind==='ventilation')value=low*.8+Math.sin(t*Math.PI*2*60)*.055+Math.sin(t*Math.PI*2*120)*.018;
  else if(kind==='electrical')value=low*.5+Math.sin(t*Math.PI*2*50)*.065+Math.sin(t*Math.PI*2*150)*.015;
  else if(kind==='drone')value=low*.8+Math.sin(t*Math.PI*2*38)*.1+Math.sin(t*Math.PI*2*76)*.035;
  else value=low+Math.sin(t*Math.PI*2*83)*.045*Math.pow(Math.sin(t*Math.PI*.5),2);
  const fade=Math.min(1,t/.03,(duration-t)/.03);samples[i]=value*Math.max(0,fade);
 }return samples;
}
