import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,createEnemy,hasLineOfSight,hearWeapon,updateEnemy,damageEnemy} from '../enemies.mjs';
const pos={x:0,z:0},wall=[{x:5,z:0,w:2,d:4}];
test('Walker idles outside sight and cannot see through cover',()=>{
 const e=createEnemy('normal');assert.equal(updateEnemy(e,pos,{x:30,z:0},[],.1).moving,false);assert.equal(e.brain.state,'idle');
 assert.equal(hasLineOfSight(pos,{x:10,z:0},wall),false);updateEnemy(e,pos,{x:10,z:0},wall,.1);assert.equal(e.brain.state,'idle');
 assert.equal(hasLineOfSight(pos,{x:0,z:10},wall),true);assert.ok(updateEnemy(e,pos,{x:0,z:10},wall,.1).moving);assert.equal(e.brain.state,'chasing');
});
test('hearing respects both weapon radius and enemy hearing range and copies location',()=>{
 const e=createEnemy('normal'),sound={x:20,z:0,radius:15};assert.equal(hearWeapon(e,pos,sound),false);
 sound.radius=25;assert.equal(hearWeapon(e,pos,sound),true);sound.x=100;assert.deepEqual(e.brain.lastKnownPlayerPosition,{x:20,z:0});
 assert.equal(hearWeapon(e,pos,{x:31,z:0,radius:100}),false);
 const action=updateEnemy(e,pos,{x:40,z:40},[],.1);assert.equal(e.brain.state,'investigating');assert.equal(action.x,1);assert.equal(action.z,0);
});
test('lost sight pursues last known position then expires or settles on arrival',()=>{
 const e=createEnemy('normal');updateEnemy(e,pos,{x:10,z:0},[],.1);updateEnemy(e,pos,{x:12,z:0},wall,1);
 assert.deepEqual(e.brain.lastKnownPlayerPosition,{x:10,z:0});assert.equal(e.brain.state,'investigating');
 updateEnemy(e,pos,{x:40,z:0},[],9);assert.equal(e.brain.state,'idle');
 hearWeapon(e,pos,{x:3,z:0,radius:10});updateEnemy(e,{x:3,z:0},{x:40,z:0},[],.1);assert.equal(e.brain.state,'idle');
});
test('attack needs visible melee range and obeys cooldown for both Walker and Runner',()=>{
 for(const type of ['normal','runner']){const e=createEnemy(type);assert.equal(updateEnemy(e,pos,{x:.8,z:0},[],.1).attack,true);
 assert.equal(updateEnemy(e,pos,{x:.8,z:0},[],.1).attack,false);
 assert.equal(updateEnemy(e,pos,{x:.8,z:0},[],ENEMIES[type].attackInterval).attack,true);
 assert.equal(updateEnemy(e,pos,{x:2,z:0},[{x:1,z:0,w:.2,d:2}],1).attack,false);}
});
test('damage alerts a survivor; death occurs once and dead enemies never hear or attack',()=>{
 const e=createEnemy('normal');assert.equal(damageEnemy(e,5,{x:25,z:0}),false);assert.equal(e.brain.state,'investigating');
 assert.equal(damageEnemy(e,100,pos),true);assert.equal(damageEnemy(e,100,pos),false);
 assert.equal(hearWeapon(e,pos,{x:0,z:0,radius:100}),false);assert.equal(updateEnemy(e,pos,pos,[],1).attack,false);assert.equal(e.brain.state,'dead');
});
test('Runner and legacy Tank share logic with distinct speed and durability',()=>{
 const walker=createEnemy('normal',3),runner=createEnemy('runner',3),tank=createEnemy('tank',3);
 assert.ok(runner.speed>walker.speed);assert.ok(runner.hp<walker.hp);assert.ok(tank.hp>walker.hp);assert.ok(tank.speed<walker.speed);
 assert.throws(()=>createEnemy('__proto__'));
});
