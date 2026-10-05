import test from 'node:test';
import assert from 'node:assert/strict';
import { waveConfig, segmentHit, moveCircle, ARENA } from '../rules.mjs';
test('fast bullets hit enemies between frames rather than tunnelling',()=>{
  assert.equal(segmentHit(-10,0,10,0,0,0,.5),true);
  assert.equal(segmentHit(-10,0,10,0,0,1,.5),false);
  assert.equal(segmentHit(0,0,0,0,0,0,.5),true);
  assert.equal(segmentHit(0,0,1,0,2,0,.5),false);
});
test('cover blocks movement while allowing sliding along its face',()=>{
  const obstacles=[{x:0,z:0,w:4,d:4}], pos={x:-2.7,z:0};
  for(let i=0;i<20;i++) moveCircle(pos,.15,.07,.45,obstacles);
  assert.ok(pos.x<=-2.449);
  assert.ok(pos.z>1.3);
});
test('arena confines both movement axes and resolves embedded circles',()=>{
  const pos={x:22,z:22};
  moveCircle(pos,100,100,.5,[]);
  assert.deepEqual(pos,{x:ARENA-.5,z:ARENA-.5});
  const embedded={x:0,z:0};
  moveCircle(embedded,0,0,.5,[{x:0,z:0,w:4,d:4}]);
  assert.ok(Math.abs(embedded.x)>=2.5 || Math.abs(embedded.z)>=2.5);
});
test('later waves get larger while speed and spawn interval stay bounded',()=>{
  assert.equal(waveConfig(1).total,12);
  assert.ok(waveConfig(5).total>waveConfig(1).total);
  assert.ok(waveConfig(5).health>waveConfig(1).health);
  assert.equal(waveConfig(100).interval,.18);
  assert.equal(waveConfig(100).speed,4.4);
});