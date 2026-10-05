import {waveConfig} from './rules.mjs';

// Provisional perception tuning. Tank remains a legacy Chapter 0/Survival enemy.
export const ENEMIES=Object.freeze({
  normal:Object.freeze({name:'Walker',health:1,speed:1,radius:.46,damage:10,attackInterval:.9,visionRange:18,hearingRange:30,memorySeconds:8}),
  runner:Object.freeze({name:'Runner',health:.7,speed:1.6,radius:.46,damage:10,attackInterval:.75,visionRange:20,hearingRange:32,memorySeconds:10}),
  tank:Object.freeze({name:'Tank',health:3,speed:.65,radius:.7,damage:20,attackInterval:.9,visionRange:16,hearingRange:30,memorySeconds:10})
});
export function createEnemy(type,wave=1){
  if(!Object.hasOwn(ENEMIES,type))throw new Error('Unknown enemy type');
  const definition=ENEMIES[type],config=waveConfig(wave);
  return {type,hp:config.health*definition.health,speed:config.speed*definition.speed,radius:definition.radius,
    brain:{state:'idle',lastKnownPlayerPosition:null,memory:0,attackCooldown:0,stimulus:null}};
}
export function hasLineOfSight(from,to,obstacles){
  for(const obstacle of obstacles){
    let lo=0,hi=1;
    for(const [a,b,c,size] of [[from.x,to.x,obstacle.x,obstacle.w],[from.z,to.z,obstacle.z,obstacle.d]]){
      const delta=b-a,min=c-size/2,max=c+size/2;
      if(Math.abs(delta)<1e-9){if(a<min||a>max){lo=2;break;}}
      else{const t1=(min-a)/delta,t2=(max-a)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));}
    }
    if(lo<=hi&&hi>=0&&lo<=1)return false;
  }
  return true;
}
function remember(enemy,position,stimulus){
  enemy.brain.lastKnownPlayerPosition={x:position.x,z:position.z};
  enemy.brain.memory=ENEMIES[enemy.type].memorySeconds;enemy.brain.stimulus=stimulus;
}
export function hearWeapon(enemy,position,noise){
  if(enemy.hp<=0||enemy.brain.state==='dead'||!Number.isFinite(noise.radius)||noise.radius<=0)return false;
  if(Math.hypot(position.x-noise.x,position.z-noise.z)>Math.min(noise.radius,ENEMIES[enemy.type].hearingRange))return false;
  remember(enemy,noise,'sound');enemy.brain.state='investigating';return true;
}
export function damageEnemy(enemy,amount,source){
  if(enemy.hp<=0||!Number.isFinite(amount)||amount<=0)return false;
  enemy.hp=Math.max(0,enemy.hp-amount);
  if(enemy.hp===0){enemy.brain.state='dead';enemy.brain.lastKnownPlayerPosition=null;return true;}
  if(source){remember(enemy,source,'damage');enemy.brain.state='investigating';}return false;
}
export function updateEnemy(enemy,position,player,obstacles,dt){
  const brain=enemy.brain,definition=ENEMIES[enemy.type],idle={x:0,z:0,attack:false,moving:false};
  if(enemy.hp<=0||brain.state==='dead'){brain.state='dead';return idle;}
  brain.attackCooldown=Math.max(0,brain.attackCooldown-dt);brain.memory=Math.max(0,brain.memory-dt);
  const distance=Math.hypot(player.x-position.x,player.z-position.z);
  const sees=distance<=definition.visionRange&&hasLineOfSight(position,player,obstacles);
  if(sees){remember(enemy,player,'vision');brain.state=distance<=enemy.radius+.65?'attacking':'chasing';}
  else if(brain.lastKnownPlayerPosition&&brain.memory>0){brain.state='investigating';}
  else{brain.state='idle';brain.lastKnownPlayerPosition=null;brain.stimulus=null;return idle;}
  const target=brain.lastKnownPlayerPosition,dx=target.x-position.x,dz=target.z-position.z,length=Math.hypot(dx,dz);
  if(!sees&&length<.6){brain.state='idle';brain.lastKnownPlayerPosition=null;brain.memory=0;brain.stimulus=null;return idle;}
  const attack=brain.state==='attacking'&&brain.attackCooldown===0;
  if(attack)brain.attackCooldown=definition.attackInterval;
  return {x:length>.001?dx/length:0,z:length>.001?dz/length:0,attack,moving:brain.state!=='attacking'&&length>.001};
}
