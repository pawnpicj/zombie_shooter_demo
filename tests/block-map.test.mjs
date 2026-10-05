import test from 'node:test';
import assert from 'node:assert/strict';
import {BLOCKS,rotatedCells,compileMap} from '../block-map.mjs';
import {FRAMEWORK_TEST} from '../maps/framework-test.mjs';
import {moveCircle} from '../rules.mjs';
import {hasLineOfSight,createEnemy} from '../enemies.mjs';
const clone=()=>structuredClone(FRAMEWORK_TEST);
test('all eleven footprints rotate without changing area or connectivity',()=>{
 assert.equal(Object.keys(BLOCKS).length,11);
 for(const [type,shape] of Object.entries(BLOCKS))for(const rotation of [0,90,180,270]){
  const cells=rotatedCells(type,rotation);assert.equal(new Set(cells.map(c=>c.join(','))).size,shape.length);
  assert.equal(Math.min(...cells.map(c=>c[0])),0);assert.equal(Math.min(...cells.map(c=>c[1])),0);
  const reached=new Set([cells[0].join(',')]);for(let i=0;i<shape.length;i++)for(const [x,z] of cells)if(cells.some(([a,b])=>reached.has([a,b].join(','))&&Math.abs(a-x)+Math.abs(b-z)===1))reached.add([x,z].join(','));
  assert.equal(reached.size,shape.length);
 }
 assert.deepEqual(rotatedCells('L',90),[[2,0],[1,0],[0,0],[0,1]]);assert.throws(()=>rotatedCells('L',45));assert.throws(()=>rotatedCells('__proto__'));
});
test('placement rotates ports and spawns together and preserves metadata without input mutation',()=>{
 const data=clone(),original=structuredClone(data),map=compileMap(data),end=map.spawns.find(s=>s.id==='exit');
 assert.deepEqual({x:end.x,z:end.z},{x:24,z:0});assert.equal(map.doors.find(d=>d.id==='east-gate').x,9);
 assert.equal(map.zoneAt(end).environment,'research');assert.equal(map.zoneAt({x:-18,z:0}).audioZone,'OUTDOOR');
 for(const spawn of map.spawns)assert.equal(map.isWalkable(spawn),true);
 for(const spawn of map.spawns.filter(s=>s.kind==='enemy'))assert.ok(createEnemy(spawn.enemyType).hp>0);
 map.unlockDoor('east-gate');assert.deepEqual(data,original);
});
test('reject overlap, duplicate IDs, unsupported cells, interior ports and nonmatching connections',()=>{
 for(const alter of [
  d=>d.blocks[1].x=-3,d=>d.blocks[1].id='entry',d=>d.blocks[0].spawns[0].cell=[1,0],
  d=>d.blocks[1].ports[0].side='east',d=>d.connections[0].to='hub:entry',
  d=>d.blocks[0].ports.push({...d.blocks[0].ports[0],id:'duplicate-face'}),
  d=>d.blocks[0].x=.5,d=>d.blocks[0].spawns[0].offset=[Infinity,0]
 ]){const data=clone();alter(data);assert.throws(()=>compileMap(data));}
});
test('adjacent modules remain separated unless a connected door is open',()=>{
 const data={blocks:[{id:'a',type:'DOT',x:0,z:0},{id:'b',type:'DOT',x:1,z:0}]},map=compileMap(data);
 assert.equal(map.findPath({x:0,z:0},{x:6,z:0}),null);assert.equal(hasLineOfSight({x:0,z:0},{x:6,z:0},map.obstacles()),false);
});
test('door state updates navigation and collision together; locks resist opening and planning',()=>{
 const map=compileMap(clone()),start=map.spawns.find(s=>s.kind==='player'),end=map.spawns.find(s=>s.id==='exit');
 assert.equal(map.findPath(start,end),null);assert.equal(map.findPath(start,end,{allowClosed:true}),null);
 assert.equal(map.setDoorOpen('east-gate',true),false);map.unlockDoor('east-gate');
 assert.ok(map.findPath(start,end,{allowClosed:true}));assert.equal(map.findPath(start,end),null);
 map.setDoorOpen('hub-door',true);map.setDoorOpen('east-gate',true);assert.equal(map.findPath(start,end).length,8);
 assert.ok(map.findPath(start,end,{radius:.7}));assert.equal(map.findPath(start,end,{radius:1.3}),null);assert.throws(()=>map.findPath(start,end,{radius:NaN}));
 assert.equal(map.obstacles().some(o=>o.doorId==='east-gate'),false);map.setDoorOpen('east-gate',false);assert.equal(map.findPath(start,end),null);
 assert.equal(map.obstacles().some(o=>o.doorId==='east-gate'),true);
 assert.equal(map.findPath(start,{x:200,z:200}),null);
});
test('shared player collision blocks closed doors and traverses an open route without leaving the map',()=>{
 const map=compileMap(clone()),player={x:-6,z:0};
 for(let i=0;i<120;i++)moveCircle(player,6.5/60,0,.45,map.obstacles(),Infinity);
 assert.ok(player.x<=-3.589);assert.equal(map.isWalkable(player),true);
 const east={x:6,z:0};for(let i=0;i<60;i++)moveCircle(east,6.5/60,0,.45,map.obstacles(),Infinity);
 assert.equal(east.x,8.41);assert.equal(map.isWalkable(east),true,'Tangency remains walkable despite floating-point rounding');
 map.setDoorOpen('hub-door',true);map.unlockDoor('east-gate');map.setDoorOpen('east-gate',true);
 const path=map.findPath(player,{x:24,z:0});for(const point of path){for(let i=0;i<100&&Math.hypot(point.x-player.x,point.z-player.z)>.05;i++){
  const distance=Math.hypot(point.x-player.x,point.z-player.z),step=Math.min(distance,6.5/60);moveCircle(player,(point.x-player.x)/distance*step,(point.z-player.z)/distance*step,.45,map.obstacles(),Infinity);assert.ok(map.isWalkable(player));
 }}assert.ok(Math.hypot(player.x-24,player.z)<.05);
});
