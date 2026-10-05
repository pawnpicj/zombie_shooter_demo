import test from 'node:test';
import assert from 'node:assert/strict';
import {compileMap} from '../block-map.mjs';
import {SCREENING_CENTER,SCREENING_ROOMS} from '../maps/screening-center.mjs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import localPages from '../local-pages.cjs';
test('Screening Center has the ten required zones, 38 cells and the intended block shapes',()=>{
 const map=compileMap(SCREENING_CENTER);
 assert.deepEqual(map.blocks.map(b=>b.type),['LINE_5','O','T','L','J','Z','S','T','LINE_3','LINE_2']);
 assert.equal(map.blocks.reduce((n,b)=>n+b.cells.length,0),38);assert.equal(map.doors.length,10);
 assert.deepEqual(map.blocks.map(b=>SCREENING_ROOMS[b.id].name),['Highway Entrance','Waiting Area','Screening Area','Security Office','Medical Wing','Quarantine Area','Isolation Ward','Control Center','Bus Depot','City Gate']);
 const start=map.spawns.find(s=>s.kind==='player');assert.equal(map.zoneAt(start).blockId,'highway');
 for(const spawn of map.spawns){assert.equal(map.zoneAt(spawn).blockId,spawn.blockId);assert.ok(map.isWalkable(spawn));}
 assert.deepEqual(map.spawns.filter(s=>s.kind==='enemy').map(s=>s.enemyType),['normal','runner']);
});
test('All zones and inspection points connect; either medical or security branch reaches Control Center',()=>{
 const map=compileMap(SCREENING_CENTER),start=map.spawns.find(s=>s.kind==='player'),control=map.spawns.find(s=>s.id==='control-status');
 for(const block of map.blocks)for(const cell of block.cells)assert.ok(map.findPath(start,{x:cell.x*6,z:cell.z*6},{allowClosed:true}),cell.id);
 assert.equal(map.findPath(start,control),null,'Initially closed internal doors block traversal');
 for(const door of map.doors)map.setDoorOpen(door.id,true);
 map.setDoorOpen('security-door',false);map.unlockDoor('medical-door');assert.ok(map.findPath(start,control));
 map.setDoorOpen('medical-door',false);assert.equal(map.findPath(start,control),null);
 map.setDoorOpen('security-door',true);assert.ok(map.findPath(start,control));
 const end=map.spawns.find(s=>s.id==='city-gate');assert.ok(map.findPath(start,end));
 assert.equal(map.cellAt({x:end.x,z:end.z+6}),null,'No Doge City expansion beyond the gate');
});
test('Navigation permits only exact authored local pages and rejects other files and remote URLs',()=>{
 const root=path.resolve('app-fixture');
 for(const file of ['index.html','map-test.html','screening-center.html'])assert.ok(localPages.isLocalPage(pathToFileURL(path.join(root,file)).href,root));
 for(const url of ['https://example.com/',pathToFileURL(path.join(root,'game.js')).href,pathToFileURL(path.join(root,'../index.html')).href,pathToFileURL(path.join(root,'index.html')).href+'?next=https://example.com'])assert.equal(localPages.isLocalPage(url,root),false);
});
