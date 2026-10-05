// Pure procedural samples: shared by Browser and Electron, no downloaded media.
export function synthesizeWeaponSound(gun,event,variant,sampleRate,random=Math.random){
 if(event.startsWith('reload_')){const stage={reload_out:0,reload_in:1,reload_slide:2}[event];if(stage===undefined)throw new Error('Unknown reload cue');const duration=.13,samples=new Float32Array(Math.ceil(duration*sampleRate));for(let i=0;i<samples.length;i++){const t=i/sampleRate;samples[i]=((random()*2-1)*.5+Math.sin(t*2*Math.PI*(gun.soundFrequency*3+stage*180))*.25)*Math.exp(-t/(stage===2?.025:.016));}return {samples,duration,profile:gun.soundProfile??'standard',variant};}
 const special=gun.soundProfile==='sg12',duration=special?(event==='fire'?.48:event==='reload'?.72:event==='equip'?.16:.12):(event==='fire'?.18:event==='reload'?.25:.09);
 const samples=new Float32Array(Math.ceil(sampleRate*duration)),frequency=gun.soundFrequency*(1+(variant-1.5)*.018)*(event==='fire'?1:event==='dry'?3:4);
 for(let i=0;i<samples.length;i++){
  const t=i/sampleRate,noise=random()*2-1;
  if(!special){samples[i]=(noise*(event==='fire'?.6:.2)+Math.sin(2*Math.PI*frequency*t)*.4)*Math.exp(-t/(duration/7));continue;}
  let value=0;
  if(event==='fire'){value=noise*.65*Math.exp(-t/.026)+Math.sin(2*Math.PI*frequency*t)*.45*Math.exp(-t/.095);for(const at of [.14,.24])if(t>=at)value+=noise*.26*Math.exp(-(t-at)/.016);}
  else if(event==='reload'){for(const at of [.03,.25,.5])if(t>=at)value+=(noise*.5+Math.sin(2*Math.PI*frequency*t)*.2)*Math.exp(-(t-at)/.022);}
  else value=(noise*.45+Math.sin(2*Math.PI*frequency*t)*.3)*Math.exp(-t/.018);
  samples[i]=Math.max(-1,Math.min(1,value));
 }return {samples,duration,profile:special?'sg12':'standard',variant};
}
