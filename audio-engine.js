import * as THREE from 'three';
import {AUDIO_ZONES,audioZone} from './audio-profiles.mjs';
import {synthesizeAmbient,synthesizeCue} from './sound-synthesis.mjs';
import {hasLineOfSight} from './enemies.mjs';
export function createAudioEngine(camera,scene,isMuted,getObstacles=()=>[]){
 const cueCounts={};const anchor=new THREE.Object3D();scene.add(anchor);const voices=new Set(),ambient=new Map(),buffers=new Map();let listener,unlocked=false,active=false,zone='SMALL_ROOM',lastCue=null,played=0,dropped=0,footsteps=0,lastPosition=null,stepDistance=0;
 function getListener(){if(!listener){listener=new THREE.AudioListener();anchor.add(listener);}return listener;}
 function unlock(){if(isMuted())return;const context=getListener().context;unlocked=true;if(context.state==='suspended')context.resume().catch(()=>{});}
 function remove(voice){if(!voices.has(voice)&&!voice.userData.ambient)return;if(voice.source)voice.source.onended=null;if(voice.isPlaying)voice.stop();voice.disconnect();voice.gain.disconnect();for(const filter of voice.filters)filter.disconnect();voice.removeFromParent();voices.delete(voice);voice.userData.ambient=false;}
 function silence(){for(const voice of [...voices])remove(voice);for(const voice of ambient.values())remove(voice);ambient.clear();stepDistance=0;lastPosition=null;}
 function setActive(value){active=Boolean(value);if(!active||isMuted())silence();}
 function buffer(key,makeSamples){if(!buffers.has(key)){const samples=makeSamples(),context=getListener().context,b=context.createBuffer(1,samples.length,context.sampleRate);b.getChannelData(0).set(samples);buffers.set(key,b);}return buffers.get(key);}
 function playBuffer(b,{position,volume=.15,radius=24,rate=1,priority=1,kind='cue',occluded=false}={}){
  if(isMuted()||!active||!unlocked)return null;
  if(position&&Math.hypot(position.x-anchor.position.x,position.z-anchor.position.z)>radius){dropped++;return null;}
  if(voices.size>=24){const candidate=[...voices].filter(v=>v.userData.priority<=priority).sort((a,b)=>a.userData.priority-b.userData.priority)[0];if(!candidate){dropped++;return null;}remove(candidate);}
  const voice=new THREE.PositionalAudio(getListener());voice.position.set(position?.x??anchor.position.x,position?.y??1.25,position?.z??anchor.position.z);voice.setBuffer(b);voice.setRefDistance(6);voice.setMaxDistance(radius);voice.setRolloffFactor(1.25);voice.setVolume(volume*(occluded?.35:1));voice.setPlaybackRate(rate);voice.userData={priority,kind};
  if(occluded){const filter=voice.context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1100;voice.setFilter(filter);}
  voice.onEnded=()=>{voice.isPlaying=false;remove(voice);};scene.add(voice);voices.add(voice);voice.play();played++;cueCounts[kind]=(cueCounts[kind]??0)+1;return {kind,position:{x:voice.position.x,y:voice.position.y,z:voice.position.z},radius,rate,occluded};
 }
 function cue(kind,position,{type='normal'}={}){if(isMuted()||!active||!unlocked)return null;const variant=kind==='step'?(zone==='OUTDOOR'?0:zone==='WAREHOUSE'?2:1):type==='runner'?2:type==='tank'?0:1,sampleRate=getListener().context.sampleRate,key='cue:'+kind+variant,b=buffer(key,()=>synthesizeCue(kind,sampleRate,variant));const radius=kind==='alarm'?28:kind==='growl'?20:kind==='step'?8:18,occluded=kind!=='impact'&&!hasLineOfSight(anchor.position,position,getObstacles());const result=playBuffer(b,{position,volume:kind==='alarm'?.09:kind==='step'?.045:kind==='impact'?.055:kind==='growl'?.10:.15,radius,occluded,kind});if(result)lastCue={...result,type,zone};return result;}
 function update(dt,{playing,position,environment}){
  anchor.position.set(position.x,1.65,position.z);anchor.quaternion.copy(camera.quaternion);zone=audioZone(environment);setActive(playing);
  if(!active||isMuted()||!unlocked||getListener().context.state!=='running')return;
  if(!ambient.has(zone)){const voice=new THREE.Audio(listener),b=buffer('ambient:'+zone,()=>synthesizeAmbient(zone,listener.context.sampleRate));voice.setBuffer(b);voice.setLoop(true);voice.setVolume(0);voice.userData.ambient=true;voice.userData.volume=0;anchor.add(voice);voice.play();ambient.set(zone,voice);}
  for(const [id,voice] of ambient){const target=id===zone?AUDIO_ZONES[id].volume:0,current=voice.userData.volume,volume=current+(target-current)*Math.min(1,dt*6);voice.userData.volume=volume;voice.gain.gain.setTargetAtTime(volume,listener.context.currentTime,.025);if(id!==zone&&volume<.0005){remove(voice);ambient.delete(id);}}
  if(lastPosition){const delta=Math.hypot(position.x-lastPosition.x,position.z-lastPosition.z);if(delta<2)stepDistance+=delta;if(stepDistance>=1.65){stepDistance=0;cue('step',position);footsteps++;}}lastPosition={x:position.x,z:position.z};
 }
 return {getListener,unlock,setActive,silence,playBuffer,cue,update,snapshot:()=>({unlocked,active:active&&!isMuted(),muted:isMuted(),zone,context:listener?.context.state??'uninitialized',listener:{x:anchor.position.x,y:anchor.position.y,z:anchor.position.z},voiceCount:voices.size,ambient:[...ambient].map(([id,v])=>({zone:id,volume:v.userData.volume,playing:v.isPlaying})),played,dropped,footsteps,cueCounts:{...cueCounts},lastCue:lastCue?{...lastCue,position:{...lastCue.position}}:null,voices:[...voices].map(v=>({kind:v.userData.kind,position:{x:v.position.x,y:v.position.y,z:v.position.z},positional:v instanceof THREE.PositionalAudio}))})};
}
