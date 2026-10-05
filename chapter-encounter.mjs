import {createEnemy,damageEnemy,hearWeapon,updateEnemy,ENEMIES} from './enemies.mjs';
import {moveCircle} from './rules.mjs';
export function createChapterEncounter({map,obstacles,player,onKill,onAttack,onSpawn,onDoor,onCue=()=>{}}){
 const enemies=[];let queue=[],timer=0,alarm=0,sequence=0;
 function start(points,count,tag){queue=Array.from({length:count},(_,i)=>({point:points[i%points.length],type:i%5===4?'runner':'normal',tag}));timer=0;}
 function hear(noise){for(const e of enemies)hearWeapon(e,e,noise);}
 function tick(dt){
  timer-=dt;if(queue.length&&timer<=0){const next=queue[0],p=next.point;const blocked=enemies.some(e=>e.hp>0&&Math.hypot(e.x-p.x,e.z-p.z)<1.1);if(!blocked){queue.shift();timer=.65;const e={...createEnemy(next.type,3),id:'infected-'+ ++sequence,x:p.x,z:p.z,tag:next.tag};e.onHit=(amount,source)=>{if(e.hp<=0)return;if(damageEnemy(e,amount,source))onKill(e);else onCue('hit',e,{type:e.type});};enemies.push(e);onSpawn(e);}}
  alarm-=dt;if(queue.length||enemies.some(e=>e.hp>0)){if(alarm<=0){alarm=2;const tag=queue[0]?.tag??enemies.find(e=>e.hp>0)?.tag;hear({x:12,z:tag==='bus'?90:72,radius:32});}}
  for(const e of enemies){const action=updateEnemy(e,e,player,obstacles(),dt);if(e.hp>0){e.voiceTimer=(e.voiceTimer??0)-dt;if(e.voiceTimer<=0){e.voiceTimer=3.5+Math.random()*3;onCue('growl',e,{type:e.type});}}if(action.attack){onCue('attack',e,{type:e.type});onAttack(ENEMIES[e.type].damage);}if(!action.moving)continue;
   const goal=e.brain.lastKnownPlayerPosition,path=map.findPath(e,goal,{allowClosed:true,radius:e.radius});if(!path)continue;const waypoint=path.length>1?path[1]:goal;
   for(const d of map.doors)if(!d.open&&!d.locked&&Math.hypot(e.x-d.x,e.z-d.z)<2)onDoor(d.id);
   const dx=waypoint.x-e.x,dz=waypoint.z-e.z,len=Math.hypot(dx,dz)||1;
   const bodies=enemies.filter(other=>other!==e&&other.hp>0).map(other=>({x:other.x,z:other.z,w:other.radius*1.5,d:other.radius*1.5}));
   moveCircle(e,dx/len*e.speed*dt,dz/len*e.speed*dt,e.radius,[...obstacles(),...bodies,{x:player.x,z:player.z,w:.8,d:.8}],Infinity);
  }
 }
 return {enemies,start,hear,tick,get remaining(){return queue.length;},get alive(){return enemies.filter(e=>e.hp>0).length;}};
}
