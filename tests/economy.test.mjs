import test from 'node:test';
import assert from 'node:assert/strict';
import {createInventory,rewardKill,upgradeWeapon,upgradeCost,buyGrenade,lootBox,collectLabWeapon,weaponStats,useSpeed,useShield,absorbDamage,takeReload,useGrenade} from '../economy.mjs';
import {combatStats,createProgression} from '../progression.mjs';
test('kill money is separate from points; purchases cannot overspend',()=>{
 const b=createInventory();assert.equal(buyGrenade(b,'molotov'),false);assert.equal(buyGrenade(b,'__proto__'),false);
 rewardKill(b,'normal');rewardKill(b,'runner');rewardKill(b,'tank');assert.equal(b.money,135);
 assert.equal(buyGrenade(b,'molotov'),true);assert.equal(b.money,15);assert.equal(b.grenades.molotov,1);
 assert.equal(buyGrenade(b,'molotov'),false);assert.equal(useGrenade(b),'molotov');assert.equal(useGrenade(b),null);
});
test('loot never awards grenades or weapons; material crate is guaranteed materials',()=>{
 const b=createInventory();for(const random of [0,.26,.51,.76])lootBox(b,'random',()=>random);
 assert.equal(b.materials,5);assert.equal(b.reserve,330);assert.equal(b.speedPotions,1);assert.equal(b.shieldCells,1);
 assert.deepEqual(b.grenades,{molotov:0,demolition:0,cluster:0});assert.deepEqual(b.weapons,['m4']);
 assert.equal(lootBox(b,'materials',()=>.99).amount,10);assert.equal(b.materials,15);
 assert.equal(lootBox(b,'weapon'),null);
});
test('weapon upgrade needs money AND materials and preserves other weapons',()=>{
 const b=createInventory();b.money=500;assert.equal(upgradeWeapon(b),false);assert.equal(b.money,500);
 b.materials=20;assert.equal(upgradeWeapon(b),true);assert.equal(b.money,320);assert.equal(b.materials,14);assert.equal(b.upgrades.m4,1);
 assert.deepEqual(upgradeCost(b),{money:300,materials:10});assert.equal(upgradeWeapon(b,'shotgun'),false);
 const base=combatStats(createProgression());assert.ok(weaponStats(base,b).damage>base.damage);
 assert.equal(collectLabWeapon(b,'shotgun'),true);assert.equal(collectLabWeapon(b,'shotgun'),false);
 b.equipped='shotgun';assert.equal(weaponStats(base,b).pellets,5);assert.equal(b.upgrades.shotgun,0);
});
test('ammo is finite; shield absorbs first and consumables cannot be used twice',()=>{
 const b=createInventory();b.reserve=7;assert.equal(takeReload(b,30),7);assert.equal(b.reserve,0);assert.equal(takeReload(b,30),0);
 assert.equal(useSpeed(b),false);b.speedPotions=2;assert.equal(useSpeed(b),true);assert.equal(useSpeed(b),false);assert.equal(b.speedPotions,1);
 b.shieldCells=1;assert.equal(useShield(b),true);assert.equal(absorbDamage(b,20),0);assert.equal(b.shield,40);assert.equal(absorbDamage(b,50),10);assert.equal(b.shield,0);assert.equal(useShield(b),false);
 assert.deepEqual(createInventory().grenades,{molotov:0,demolition:0,cluster:0});
});
