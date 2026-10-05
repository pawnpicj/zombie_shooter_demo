import * as THREE from 'three';
import {synthesizeWeaponSound} from './weapon-sound.mjs';
import {reflectWeapon,audioZone,createReloadTrack,advanceReloadTrack} from './audio-profiles.mjs';
import {WEAPONS} from './weapons.mjs';
// AudioLoader uses original local WAVs; procedural fallback keeps first shots immediate.
export function createWeaponAudio(camera,player,isMuted,{engine,getEnvironment=()=> 'SMALL_ROOM'}={}){
 let listener,track=null,last=null,assetLoaded=0;const loader=new THREE.AudioLoader(),assets=new Map(),pending=new Set(),buffers=new Map(),voices=new Set(),errors=[],history=[];
 const getListener=()=>engine?engine.getListener():(listener??(listener=new THREE.AudioListener(),player.add(listener),listener));
 function remove(voice){if(!voices.has(voice))return;if(voice.source)voice.source.onended=null;if(voice.isPlaying)voice.stop();voice.disconnect();voice.gain.disconnect();voice.removeFromParent();voices.delete(voice);}
 function load(id,event,variant){const file=event==='fire'?'fire_'+variant:event,key=id+':'+file;if(!pending.has(key)){pending.add(key);loader.load(new URL('./sounds/weapons/'+id+'/'+file+'.wav',import.meta.url).href,b=>{assets.set(key,b);assetLoaded++;for(const cacheKey of buffers.keys())if(cacheKey.startsWith(key+':'))buffers.delete(cacheKey);},undefined,()=>errors.push(key));}return {key,file};}
 function playSample(event,gun,variant=Math.floor(Math.random()*4)){
  if(isMuted())return;const id=Object.keys(WEAPONS).find(k=>WEAPONS[k]===gun)??Object.keys(WEAPONS).find(k=>WEAPONS[k].name===gun.name);if(!id)throw new Error('Unknown audio weapon');
  const l=getListener(),context=l.context;if(context.state==='suspended')context.resume().catch(()=>{});const zone=audioZone(getEnvironment()),asset=load(id,event,variant),key=asset.key+':'+zone;if(event==='fire')for(let v=0;v<4;v++)load(id,event,v);
  if(!buffers.has(key)){const base=assets.get(asset.key),samples=base?base.getChannelData(0):synthesizeWeaponSound(gun,event,variant,context.sampleRate).samples,result=event==='fire'?reflectWeapon(samples,context.sampleRate,zone):samples,b=context.createBuffer(1,result.length,context.sampleRate);b.getChannelData(0).set(result);buffers.set(key,b);}
  const rate=event==='fire'?.97+Math.random()*.06:1,volume=event==='fire'?(gun.soundProfile==='sg12'?.3:.22):.10,position={x:player.position.x,y:1.25,z:player.position.z};
  if(engine)engine.playBuffer(buffers.get(key),{position,volume,radius:gun.soundRadius,rate,priority:2,kind:'weapon:'+event});
  else{if(voices.size>=16)remove(voices.values().next().value);const voice=new THREE.PositionalAudio(l);voice.setBuffer(buffers.get(key));voice.setRefDistance(6);voice.setMaxDistance(gun.soundRadius);voice.setVolume(volume);voice.setPlaybackRate(rate);voice.onEnded=()=>{voice.isPlaying=false;remove(voice);};player.add(voice);voices.add(voice);voice.play();}
  last={variant,profile:gun.soundProfile??'standard',event,environment:zone,rate,bufferCount:buffers.size,source:assets.has(asset.key)?'local-wav':'procedural',position};history.push({...last});if(history.length>32)history.shift();return last;
 }
 function play(event,gun,{reloadSeconds}={}){if(event==='equip')track=null;if(event==='reload'){track=createReloadTrack(gun.name,reloadSeconds??gun.reloadSpeed);return playSample('reload_out',gun,0);}return playSample(event,gun);}
 function syncReload(remaining,gun){if(!track)return;if(track.gun!==gun.name){track=null;return;}for(const event of advanceReloadTrack(track,remaining,gun.name))playSample(event,gun,0);if(remaining<=0)track=null;}
 return {play,syncReload,cancelReload(){track=null;},mute(){for(const voice of [...voices])remove(voice);engine?.silence();},snapshot:()=>({assetLoaded,assetErrors:[...errors],pendingAssets:pending.size-assetLoaded-errors.length,bufferCount:buffers.size,last:last?{...last}:null,history:history.map(e=>({...e,position:{...e.position}})),reload:track?{gun:track.gun,emitted:[...track.emitted]}:null})};
}
