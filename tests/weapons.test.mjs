import test from 'node:test';
import assert from 'node:assert/strict';
import {createInventory,weaponStats,lootBox} from '../economy.mjs';
import {createProgression,combatStats} from '../progression.mjs';
import {WEAPONS,acquireWeapon,equipWeapon,activeWeapons,consumeRound,tickWeapons,refillMagazine,addAmmo,spreadAngle,chapterLoadout} from '../weapons.mjs';
test('switching preserves magazines and cannot bypass fire cooldown',()=>{
 const b=createInventory();consumeRound(b,.13);acquireWeapon(b,'vx9');equipWeapon(b,'vx9');
 assert.equal(consumeRound(b,.22),false);tickWeapons(b,.13);assert.equal(consumeRound(b,.22),true);
 equipWeapon(b,'m4');assert.equal(b.magazines.m4,29);assert.equal(b.magazines.vx9,14);
 assert.equal(acquireWeapon(b,'vx9'),false);assert.equal(b.magazines.vx9,14);
});
test('reload uses only matching finite ammo and preserves other magazines',()=>{
 const b=createInventory();acquireWeapon(b,'vx9');equipWeapon(b,'vx9');b.magazines.vx9=0;b.reserves['9mm']=7;
 assert.equal(refillMagazine(b),7);assert.equal(refillMagazine(b),0);assert.equal(b.reserves.rifle,240);assert.equal(b.magazines.m4,30);
 lootBox(b,'ammo');assert.equal(b.reserves['9mm'],90);assert.equal(b.reserves.rifle,240);
 assert.equal(addAmmo(b,10,'unknown'),false);assert.equal(addAmmo(b,-1),false);
});
test('three slots retain displaced ownership and upgrades for later selection',()=>{
 const b=createInventory();for(const key of ['smg','marksman','shotgun','vx9','m4x']){acquireWeapon(b,key);equipWeapon(b,key);}
 assert.deepEqual(activeWeapons(b),['m4x','shotgun','vx9']);assert.equal(b.weapons.length,6);
 b.upgrades.smg=2;equipWeapon(b,'smg');assert.equal(b.upgrades.smg,2);assert.equal(activeWeapons(b).length,3);
 assert.equal(equipWeapon(b,'__proto__'),false);
});
test('chapter loadout preserves inventory and never refills an owned gun',()=>{
 const b=createInventory();b.money=500;b.materials=20;acquireWeapon(b,'m4x');b.magazines.m4x=3;b.upgrades.m4x=2;
 assert.equal(chapterLoadout(b,1),true);assert.equal(b.magazines.m4x,3);assert.equal(b.upgrades.m4x,2);assert.equal(b.money,500);assert.equal(b.materials,20);
 assert.deepEqual(activeWeapons(b),['m4x','vx9']);assert.ok(b.weapons.includes('m4'));assert.equal(chapterLoadout(b,2),false);
});
test('recoil builds and recovers; data-driven weapons retain progression effects',()=>{
 const b=createInventory();acquireWeapon(b,'vx9');equipWeapon(b,'vx9');const p=createProgression();
 const base=weaponStats(combatStats(p),b);assert.equal(base.damage,25);assert.equal(base.shotInterval,.22);
 const before=spreadAngle(b,0,1);consumeRound(b,.22);assert.ok(spreadAngle(b,0,1)>before);tickWeapons(b,2);assert.equal(b.recoil.vx9,0);
 p.ranks.powerAttack=2;p.ranks.attackSpeed=2;p.ranks.gunReload=2;const upgraded=weaponStats(combatStats(p),b);
 assert.ok(upgraded.damage>base.damage);assert.ok(upgraded.shotInterval<base.shotInterval);assert.ok(upgraded.reloadSeconds<base.reloadSeconds);
 for(const gun of Object.values(WEAPONS))for(const key of ['damage','fireRate','accuracy','range','recoil','reloadSpeed','magazineSize','stoppingPower','soundRadius'])assert.ok(Number.isFinite(gun[key]));
});
