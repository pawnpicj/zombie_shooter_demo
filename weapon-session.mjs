import {WEAPONS,activeWeapons,acquireWeapon,equipWeapon,consumeRound,tickWeapons,refillMagazine,magazine,spreadAngle} from './weapons.mjs';
import {weaponStats} from './economy.mjs';
import {combatStats,rollShot} from './progression.mjs';
import {moveCircle} from './rules.mjs';
import {hasLineOfSight} from './enemies.mjs';
export function createWeaponSession(bag,progression,onSound=()=>{},onImpact=()=>{}){return {bag,progression,onSound,onImpact,reloadTimer:0,dryTimer:0,projectiles:[],sequence:0,shots:0,pellets:0,hits:0,lastSound:null};}
export const sessionStats=s=>weaponStats(combatStats(s.progression),s.bag);
function sound(s,event){s.lastSound={event,weapon:s.bag.equipped,radius:WEAPONS[s.bag.equipped].soundRadius};s.onSound(event,WEAPONS[s.bag.equipped]);}
export function reloadWeapon(s){if(s.reloadTimer>0||magazine(s.bag)>=WEAPONS[s.bag.equipped].magazineSize||s.bag.reserve<=0)return false;s.reloadTimer=sessionStats(s).reloadSeconds;sound(s,'reload');return true;}
export function switchWeapon(s,key){const selected=key??activeWeapons(s.bag)[(activeWeapons(s.bag).indexOf(s.bag.equipped)+1)%activeWeapons(s.bag).length];if(selected===s.bag.equipped||!equipWeapon(s.bag,selected))return false;s.reloadTimer=0;sound(s,'equip');return true;}
export function discoverArmory(s,position,point,obstacles){
 if(Math.hypot(position.x-point.x,position.z-point.z)>1.7||!hasLineOfSight(position,point,obstacles)||!acquireWeapon(s.bag,'sg12'))return false;
 switchWeapon(s,'sg12');return true;
}
export function fireWeapon(s,from,aim,random=Math.random){
 if(s.reloadTimer>0)return false;if(magazine(s.bag)<=0){if(s.dryTimer<=0){sound(s,'dry');s.dryTimer=.4;}reloadWeapon(s);return false;}
 const dx=aim.x-from.x,dz=aim.z-from.z,length=Math.hypot(dx,dz);if(length<.001)return false;
 const stats=sessionStats(s);if(!consumeRound(s.bag,stats.shotInterval))return false;const shot=rollShot(stats,random()),sequence=++s.sequence;
 for(let i=0;i<stats.pellets;i++){const angle=Math.atan2(dx,dz)+spreadAngle(s.bag,i,random());s.projectiles.push({id:++s.pellets,shot:sequence,source:{x:from.x,z:from.z},x:from.x,z:from.z,vx:Math.sin(angle)*52,vz:Math.cos(angle)*52,remaining:stats.range,damage:shot.damage,stoppingPower:stats.stoppingPower});}
 s.shots++;sound(s,'fire');if(magazine(s.bag)===0)reloadWeapon(s);return true;
}
export function segmentBox(ax,az,bx,bz,o){let lo=0,hi=1;for(const [a,b,c,extent] of [[ax,bx,o.x,o.w/2],[az,bz,o.z,o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<c-extent||a>c+extent)return null;}else{let first=(c-extent-a)/d,last=(c+extent-a)/d;if(first>last)[first,last]=[last,first];lo=Math.max(lo,first);hi=Math.min(hi,last);if(lo>hi)return null;}}return lo;}
function segmentCircle(ax,az,bx,bz,target){const dx=bx-ax,dz=bz-az,x=ax-target.x,z=az-target.z,a=dx*dx+dz*dz,c=x*x+z*z-target.radius*target.radius;if(c<=0)return 0;if(a<1e-12)return null;const b=2*(x*dx+z*dz),disc=b*b-4*a*c;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;}
export function tickWeaponSession(s,dt,obstacles=[],targets=[]){
 const impulses=[],impactShots=new Set();
 tickWeapons(s.bag,dt);s.dryTimer=Math.max(0,s.dryTimer-dt);if(s.reloadTimer>0){s.reloadTimer=Math.max(0,s.reloadTimer-dt);if(s.reloadTimer===0)refillMagazine(s.bag);}
 for(let i=s.projectiles.length-1;i>=0;i--){const p=s.projectiles[i],distance=Math.min(p.remaining,52*dt),bx=p.x+p.vx/52*distance,bz=p.z+p.vz/52*distance;let first=Infinity,target=null;
  for(const o of obstacles){const t=segmentBox(p.x,p.z,bx,bz,o);if(t!==null&&t<first)first=t;}
  for(const candidate of targets){if(candidate.hp<=0)continue;const t=segmentCircle(p.x,p.z,bx,bz,candidate);if(t!==null&&t<first){first=t;target=candidate;}}
  if(target){if(target.onHit)target.onHit(p.damage,p.source);else target.hp=Math.max(0,target.hp-p.damage);target.damageTaken=(target.damageTaken??0)+p.damage;s.hits++;if(target.lastImpulseShot!==p.shot){impulses.push({target,p});target.lastImpulseShot=p.shot;}}
  if(first!==Infinity&&!impactShots.has(p.shot)){impactShots.add(p.shot);s.onImpact({x:p.x+(bx-p.x)*first,z:p.z+(bz-p.z)*first,target:target?.id??null});}
  p.x=bx;p.z=bz;p.remaining-=distance;if(first!==Infinity||p.remaining<=1e-8)s.projectiles.splice(i,1);
 }
 // A large shotgun impulse must not tunnel across a thin wall before collision.
 for(const {target,p} of impulses){const steps=Math.max(1,Math.ceil(p.stoppingPower/.15));for(let i=0;i<steps;i++)moveCircle(target,p.vx/52*p.stoppingPower/steps,p.vz/52*p.stoppingPower/steps,target.radius,obstacles,Infinity);}
}
