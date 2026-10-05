import test from 'node:test';
import assert from 'node:assert/strict';
import {createInventory} from '../economy.mjs';
import {createProgression} from '../progression.mjs';
import {WEAPONS,chapterLoadout} from '../weapons.mjs';
import {createWeaponSession,discoverArmory,fireWeapon,reloadWeapon,switchWeapon,tickWeaponSession,sessionStats} from '../weapon-session.mjs';
import {synthesizeWeaponSound} from '../weapon-sound.mjs';
const position={x:0,z:0},point={x:0,z:1};
function session(){const bag=createInventory();chapterLoadout(bag,1);bag.reserves.shells=18;return createWeaponSession(bag,createProgression());}
function shotgun(){const s=session();assert.ok(discoverArmory(s,position,point,[]));return s;}
test('SG-12 discovery is proximity/LOS gated, one-use and preserves existing inventory',()=>{
 const s=session();s.bag.money=500;s.bag.upgrades.m4x=2;s.bag.magazines.m4x=7;
 assert.equal(discoverArmory(s,{x:0,z:9},point,[]),false);assert.equal(discoverArmory(s,position,point,[{x:0,z:.5,w:3,d:.2}]),false);assert.equal(s.bag.weapons.includes('sg12'),false);
 assert.ok(discoverArmory(s,position,point,[]));assert.equal(s.bag.equipped,'sg12');assert.equal(s.bag.loadout.secondary,'sg12');assert.equal(s.bag.magazines.sg12,6);assert.equal(s.bag.reserves.shells,18);assert.equal(s.bag.money,500);assert.equal(s.bag.upgrades.m4x,2);assert.equal(s.bag.magazines.m4x,7);
 fireWeapon(s,position,point,()=>.5);assert.equal(discoverArmory(s,position,point,[]),false);assert.equal(s.bag.magazines.sg12,5);
});
test('SG-12 consumes one shell for eight pellets and cannot bypass rate or reload through switching',()=>{
 const s=shotgun();const stats=sessionStats(s);assert.equal(stats.pellets,8);assert.equal(stats.range,12);assert.equal(stats.reloadSeconds,3.2);assert.ok(stats.damage*stats.pellets>WEAPONS.vx9.damage*4);assert.ok(stats.stoppingPower>WEAPONS.shotgun.stoppingPower);assert.ok(stats.soundRadius>WEAPONS.m4x.soundRadius);
 assert.ok(fireWeapon(s,position,point,()=>.5));assert.equal(s.projectiles.length,8);assert.equal(s.bag.magazines.sg12,5);assert.equal(fireWeapon(s,position,point),false);
 assert.ok(reloadWeapon(s));tickWeaponSession(s,1);assert.ok(s.reloadTimer>2);switchWeapon(s,'m4x');assert.equal(s.reloadTimer,0);assert.equal(s.bag.reserves.shells,18);switchWeapon(s,'sg12');assert.equal(s.bag.magazines.sg12,5);reloadWeapon(s);tickWeaponSession(s,3.2);assert.equal(s.bag.magazines.sg12,6);assert.equal(s.bag.reserves.shells,17);assert.equal(s.bag.reserves.rifle,240);
});
test('Finite shells permit no free refill on duplicate pickup, equip, dry fire or empty reload',()=>{
 const s=shotgun();s.bag.magazines.sg12=0;s.bag.reserves.shells=0;assert.equal(reloadWeapon(s),false);assert.equal(fireWeapon(s,position,point),false);assert.equal(s.lastSound.event,'dry');assert.equal(s.projectiles.length,0);switchWeapon(s,'vx9');switchWeapon(s,'sg12');assert.equal(s.bag.magazines.sg12,0);assert.equal(s.bag.reserves.shells,0);
});
test('Pellets hit nearby targets, impart one bounded impulse per blast and award no inventory rewards',()=>{
 const s=shotgun(),t={x:0,z:4,radius:.65,hp:500},money=s.bag.money;fireWeapon(s,position,{x:0,z:10},()=>.5);tickWeaponSession(s,.1,[],[t]);assert.ok(t.hp<400);assert.ok(Math.hypot(t.x,t.z-4)<=1.200001);assert.ok(t.z>5);assert.equal(s.bag.money,money);assert.equal(s.progression.xp,0);tickWeaponSession(s,.3,[],[t]);assert.equal(s.projectiles.length,0);
});
test('Projectile range and nearest wall collision prevent damage through cover or beyond 12 meters',()=>{
 for(const [z,obstacles] of [[14,[]],[4,[{x:0,z:2,w:10,d:.3}]]]){const s=shotgun(),target={x:0,z,radius:.65,hp:500};fireWeapon(s,position,{x:0,z:20},()=>.5);tickWeaponSession(s,1,obstacles,[target]);assert.equal(target.hp,500);assert.equal(s.projectiles.length,0);}
 const s=shotgun(),target={x:0,z:3,radius:.65,hp:500};fireWeapon(s,position,{x:0,z:20},()=>.5);tickWeaponSession(s,.1,[{x:0,z:4,w:10,d:.2}],[target]);assert.ok(target.z<=3.250001,'Stopping force respects wall clearance');
});
test('SG-12 has distinct bounded fire/reload/dry/equip samples with four fire variants',()=>{
 const variants=[];for(let variant=0;variant<4;variant++){const wave=synthesizeWeaponSound(WEAPONS.sg12,'fire',variant,8000,()=>.6);assert.equal(wave.profile,'sg12');assert.equal(wave.duration,.48);assert.ok(wave.samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=1));variants.push(wave.samples);}
 assert.notDeepEqual(variants[0],variants[1]);assert.notDeepEqual(variants[1],variants[2]);assert.notDeepEqual(variants[2],variants[3]);assert.equal(synthesizeWeaponSound(WEAPONS.shotgun,'fire',0,8000,()=>.6).duration,.18);
 for(const event of ['reload','dry','equip'])assert.ok(synthesizeWeaponSound(WEAPONS.sg12,event,0,8000,()=>.6).samples.some(v=>Math.abs(v)>.01));
});
