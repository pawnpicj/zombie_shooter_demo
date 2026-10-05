// Balance is provisional and centralized here. Legacy weapons retain their damage/rate.
const define = (name, slot, ammoType, damage, fireRate, magazineSize, extras = {}) => Object.freeze({
  name, slot, ammoType, damage, fireRate, magazineSize, accuracy:.99, range:49.4,
  recoil:.008, recoilRecovery:.12, reloadSpeed:1.35, stoppingPower:0,
  soundRadius:25, mobility:1, pellets:1, pelletSpread:.11, color:0x9bcdb4, soundFrequency:160, ...extras
});
export const WEAPONS = Object.freeze({
  m4:define('M4','primary','rifle',19,.13,30),
  smg:define('SMG','primary','rifle',19*.72,.13/1.65,30,{reloadSpeed:1.35*.85,color:0x73d9ec,accuracy:.97,recoil:.012,soundFrequency:210}),
  shotgun:define('SHOTGUN','secondary','shells',19*.58,.13/.38,6,{reloadSpeed:1.35*1.25,pellets:5,range:18,accuracy:.98,recoil:.06,soundRadius:35,stoppingPower:.4,color:0xffb270,soundFrequency:85}),
  marksman:define('DMR','primary','heavy',19*2.5,.13/.48,10,{reloadSpeed:1.35*1.1,range:60,accuracy:.997,recoil:.025,color:0xd5a0ff,soundFrequency:115}),
  vx9:define('VX-9','sidearm','9mm',25,.22,15,{range:28,reloadSpeed:1.1,mobility:1.08,soundRadius:15,color:0xc5daed,soundFrequency:280}),
  m4x:define('M4X Tactical Rifle','primary','rifle',34,.09,30,{range:42,recoil:.014,soundRadius:25,color:0xabc880,soundFrequency:135}),
  sg12:define('SG-12 Tactical Shotgun','secondary','shells',18,.8,6,{pellets:8,pelletSpread:.035,range:12,accuracy:.98,recoil:.09,reloadSpeed:3.2,stoppingPower:1.2,soundRadius:45,mobility:.92,color:0xe6bb83,soundFrequency:70,soundProfile:'sg12'})
});
export const AMMO_NAMES = Object.freeze({'9mm':'9mm',rifle:'Rifle',shells:'Shells',heavy:'Heavy'});
export const INITIAL_AMMO=Object.freeze({rifle:240,'9mm':90,shells:36,heavy:60});
export function createArsenal(){return {magazines:{m4:WEAPONS.m4.magazineSize},reserves:{...INITIAL_AMMO},loadout:{primary:'m4',secondary:null,sidearm:null},recoil:{},cooldown:0};}
export function acquireWeapon(bag,key){
  if(!Object.hasOwn(WEAPONS,key)||bag.weapons.includes(key))return false;
  bag.weapons.push(key);bag.magazines[key]=WEAPONS[key].magazineSize;bag.upgrades[key]??=0;
  return true;
}
export function equipWeapon(bag,key){
  if(!Object.hasOwn(WEAPONS,key)||!bag.weapons.includes(key))return false;
  bag.loadout[WEAPONS[key].slot]=key;bag.equipped=key;return true;
}
export function activeWeapons(bag){return Object.values(bag.loadout).filter(Boolean);}
export function magazine(bag){return bag.magazines[bag.equipped];}
export function consumeRound(bag,interval){
  if(magazine(bag)<=0||bag.cooldown>0)return false;
  bag.magazines[bag.equipped]--;bag.cooldown=interval;
  const key=bag.equipped;bag.recoil[key]=Math.min(.18,(bag.recoil[key]||0)+WEAPONS[key].recoil);return true;
}
export function tickWeapons(bag,dt){
  bag.cooldown=Math.max(0,bag.cooldown-dt);
  for(const key of Object.keys(bag.recoil))bag.recoil[key]=Math.max(0,bag.recoil[key]-WEAPONS[key].recoilRecovery*dt);
}
export function refillMagazine(bag){
  const gun=WEAPONS[bag.equipped],type=gun.ammoType;
  const amount=Math.min(gun.magazineSize-magazine(bag),bag.reserves[type]);
  bag.reserves[type]-=amount;bag.magazines[bag.equipped]+=amount;return amount;
}
export function addAmmo(bag,amount,type=WEAPONS[bag.equipped].ammoType){
  if(!Object.hasOwn(AMMO_NAMES,type)||!Number.isFinite(amount)||amount<0)return false;
  bag.reserves[type]+=amount;return true;
}
export function spreadAngle(bag,pellet,random=Math.random()){
  const gun=WEAPONS[bag.equipped];
  return (pellet-(gun.pellets-1)/2)*gun.pelletSpread+(random*2-1)*((1-gun.accuracy)*.5+(bag.recoil[bag.equipped]||0));
}
// Chapter transition hook: preserves ownership, upgrades, magazines and all other inventory.
export function chapterLoadout(bag,chapter){
  if(chapter!==1)return false;
  for(const key of ['vx9','m4x'])acquireWeapon(bag,key);
  bag.loadout={primary:'m4x',secondary:null,sidearm:'vx9'};bag.equipped='m4x';return true;
}
