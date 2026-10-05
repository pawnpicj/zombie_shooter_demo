import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgression,xpRequired,gainExperience,spendPoint,combatStats,rollShot} from '../progression.mjs';
test('XP at the threshold increases max HP, fully heals and grants three saved points',()=>{
  const p=createProgression();
  assert.deepEqual(gainExperience(p,80,35),{levels:0,hp:35});
  const result=gainExperience(p,20,35);
  assert.deepEqual(result,{levels:1,hp:120});
  assert.equal(p.level,2);assert.equal(p.maxHp,120);assert.equal(p.points,3);assert.equal(p.xp,0);
  assert.equal(xpRequired(p.level),150);
});
test('large XP rewards grant every level, three points per level and preserve leftover XP',()=>{
  const p=createProgression();
  assert.deepEqual(gainExperience(p,750,10),{levels:4,hp:180});
  assert.equal(p.level,5);assert.equal(p.points,12);assert.equal(p.xp,50);
  assert.throws(()=>gainExperience(p,-1,100));
});
test('points accumulate and cannot overspend or upgrade unknown stats',()=>{
  const p=createProgression();
  assert.equal(spendPoint(p,'powerAttack'),false);
  gainExperience(p,100,100);
  assert.equal(spendPoint(p,'__proto__'),false);assert.equal(p.points,3);
  assert.equal(spendPoint(p,'powerAttack'),true);
  gainExperience(p,150,120);assert.equal(p.points,5);
  for(let i=0;i<5;i++)assert.equal(spendPoint(p,'powerAttack'),true);
  assert.equal(p.points,0);assert.equal(p.ranks.powerAttack,6);
  assert.equal(spendPoint(p,'powerAttack'),false);assert.equal(p.points,0);
});
test('all five choices change actual combat values and critical damage affects critical hits only',()=>{
  const p=createProgression(),base=combatStats(p);
  gainExperience(p,250,100);
  for(const stat of Object.keys(p.ranks))assert.equal(spendPoint(p,stat),true);
  const improved=combatStats(p);
  assert.ok(improved.damage>base.damage);
  assert.ok(improved.shotInterval<base.shotInterval);
  assert.ok(improved.movementSpeed>base.movementSpeed);
  assert.ok(improved.reloadSeconds<base.reloadSeconds);
  assert.ok(improved.criticalMultiplier>base.criticalMultiplier);
  assert.equal(improved.criticalChance,.1);
  assert.equal(rollShot(improved,.05).critical,true);
  assert.equal(rollShot(improved,.5).critical,false);
  assert.equal(rollShot(improved,.05).damage,improved.damage*improved.criticalMultiplier);
  assert.equal(rollShot(improved,.5).damage,improved.damage);
  assert.deepEqual(createProgression().ranks,{powerAttack:0,attackSpeed:0,movementSpeed:0,gunReload:0,criticalDamage:0});
});
