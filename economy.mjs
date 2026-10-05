import {WEAPONS,createArsenal,acquireWeapon,addAmmo} from './weapons.mjs';
export {WEAPONS} from './weapons.mjs';
export const GRENADES={
  molotov:{name:'ระเบิดขวดเพลิง',price:120,description:'ไฟเผาพื้นที่ 6 วินาที',color:0xff863c},
  demolition:{name:'ระเบิดทำลายล้าง',price:180,description:'ระเบิดวงกว้าง รัศมี 5 เมตร',color:0xffde70},
  cluster:{name:'ระเบิดแตกกระจาย',price:240,description:'แตกเป็นระเบิดย่อย 6 ลูก',color:0xff93b4}
};
export function createInventory(){
  const bag={...createArsenal(),money:0,materials:0,weapons:['m4'],equipped:'m4',upgrades:Object.fromEntries(Object.keys(WEAPONS).map(key=>[key,0])),grenades:{molotov:0,demolition:0,cluster:0},selectedGrenade:'molotov',speedPotions:0,shieldCells:0,shield:0,speedTimer:0};
  Object.defineProperty(bag,'reserve',{enumerable:true,get(){return this.reserves[WEAPONS[this.equipped].ammoType];},set(value){this.reserves[WEAPONS[this.equipped].ammoType]=value;}});
  return bag;
}
export function rewardKill(bag,type){const value=type==='tank'?75:type==='runner'?35:25;bag.money+=value;return value;}
export function upgradeCost(bag,key=bag.equipped){const level=bag.upgrades[key];return {money:180+level*120,materials:6+level*4};}
export function upgradeWeapon(bag,key=bag.equipped){
  if(!Object.hasOwn(WEAPONS,key)||!bag.weapons.includes(key))return false;
  const cost=upgradeCost(bag,key);if(bag.money<cost.money||bag.materials<cost.materials)return false;
  bag.money-=cost.money;bag.materials-=cost.materials;bag.upgrades[key]++;return true;
}
export function buyGrenade(bag,key){
  if(!Object.hasOwn(GRENADES,key)||bag.money<GRENADES[key].price)return false;
  bag.money-=GRENADES[key].price;bag.grenades[key]++;return true;
}
export function lootBox(bag,kind,random=Math.random){
  if(kind==='materials'){const amount=6+Math.floor(random()*5);bag.materials+=amount;return {kind:'materials',amount};}
  if(kind==='ammo'){addAmmo(bag,90);return {kind:'ammo',amount:90};}
  if(kind!=='random')return null;
  const type=['materials','ammo','speed','shield'][Math.min(3,Math.floor(random()*4))];
  if(type==='materials'){bag.materials+=5;return {kind:type,amount:5};}
  if(type==='ammo'){addAmmo(bag,90);return {kind:type,amount:90};}
  if(type==='speed'){bag.speedPotions++;return {kind:type,amount:1};}
  bag.shieldCells++;return {kind:type,amount:1};
}
export function collectLabWeapon(bag,key){
  return acquireWeapon(bag,key);
}
export function weaponStats(base,bag){
  const gun=WEAPONS[bag.equipped],rank=bag.upgrades[bag.equipped];
  return {...base,damage:base.damage/19*gun.damage*(1+rank*.15),shotInterval:base.shotInterval/.13*gun.fireRate,
    reloadSeconds:base.reloadSeconds/1.35*gun.reloadSpeed,movementSpeed:base.movementSpeed*gun.mobility*(bag.speedTimer>0?1.35:1),
    pellets:gun.pellets,range:gun.range,accuracy:gun.accuracy,recoil:gun.recoil,stoppingPower:gun.stoppingPower,soundRadius:gun.soundRadius};
}
export function useSpeed(bag){if(bag.speedPotions<1||bag.speedTimer>0)return false;bag.speedPotions--;bag.speedTimer=12;return true;}
export function useShield(bag){if(bag.shieldCells<1||bag.shield>=120)return false;bag.shieldCells--;bag.shield=Math.min(120,bag.shield+60);return true;}
export function absorbDamage(bag,damage){const absorbed=Math.min(bag.shield,damage);bag.shield-=absorbed;return damage-absorbed;}
export function takeReload(bag,missing){const amount=Math.min(missing,bag.reserve);bag.reserve-=amount;return amount;}
export function useGrenade(bag){const key=bag.selectedGrenade;if(bag.grenades[key]<1)return null;bag.grenades[key]--;return key;}
