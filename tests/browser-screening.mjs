import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {compileMap} from '../block-map.mjs';
import {SCREENING_CENTER} from '../maps/screening-center.mjs';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1440,height:900}}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));const read=()=>page.evaluate(()=>window.screeningCenter),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function walk(point){
 // Release input on animation-frame arrival, avoiding RPC sampling overshoot.
 // Only input events are dispatched; no game state is mutated.
 for(const axis of ['x','z'])for(let attempts=0;attempts<8;attempts++){
  const data=await read();assert.equal(data.state,'playing');assert.ok(data.walkable);const delta=point[axis]-data.player[axis];if(Math.abs(delta)<.18)break;
  const positive=delta>0,key=axis==='x'?(positive?'d':'a'):(positive?'s':'w'),code='Key'+key.toUpperCase();await page.keyboard.down(key);
  try{await page.waitForFunction((axis,target,positive,code)=>{const data=window.screeningCenter,door=data.doors.find(d=>d.id===data.interaction);if((positive?data.player[axis]>=target-.06:data.player[axis]<=target+.06)||(door&&!door.open)){window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));return true;}return false;},{timeout:8000},axis,point[axis],positive,code);}finally{await page.keyboard.up(key);}
  const next=await read(),door=next.doors.find(d=>d.id===next.interaction);if(door&&!door.open){await page.keyboard.press('e');assert.ok((await read()).doors.find(d=>d.id===door.id).open);}
 }
 const end=await read();assert.ok(Math.hypot(end.player.x-point.x,end.player.z-point.z)<.3,'Arrived at cell center');assert.ok(end.walkable);
}
async function visit(id){const data=await read(),map=compileMap(SCREENING_CENTER);for(const door of data.doors)map.setDoorOpen(door.id,door.open);const goal=map.spawns.find(s=>s.id===id),path=map.findPath(data.player,goal,{allowClosed:true});assert.ok(path,'Reachable inspection '+id);for(const p of path)await walk(p);assert.equal((await read()).interaction,id);await page.keyboard.press('e');assert.ok((await read()).inspected.includes(id));await page.keyboard.press('e');assert.equal((await read()).inspected.filter(s=>s===id).length,1);}
try{
 await mkdir('artifacts/phase7',{recursive:true});await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle0'});await page.click('a[href="./screening-center.html"]');await page.waitForFunction(()=>window.screeningCenter?.state==='playing');
 assert.equal((await read()).zone.blockId,'highway');assert.equal((await read()).activeEnemies,0);assert.equal((await read()).blocks.length,10);
 await page.screenshot({path:'artifacts/phase7/entrance.png'});
 // Props also collide: the first abandoned car sits next to the highway lane.
 await walk({x:6,z:6});await page.keyboard.down('d');await sleep(550);await page.keyboard.up('d');assert.ok((await read()).player.x<6.64,'Abandoned vehicle blocks movement');await walk({x:6,z:6});
 for(const id of ['road-sign','luggage','screening-record','armory','quarantine-record','control-status','observation','medical-log','screening-record','bus-manifest','bus-supply','city-gate']){await visit(id);if(id==='screening-record'||id==='observation'||id==='bus-manifest')await page.screenshot({path:'artifacts/phase7/'+id+'.png'});}
 const done=await read();assert.equal(done.visited.length,10);assert.equal(done.complete,true);assert.equal(done.cityGateOpen,false);assert.equal(done.activeEnemies,0);await writeFile('artifacts/phase7/walkthrough.json',JSON.stringify(done,null,2));await page.screenshot({path:'artifacts/phase7/city-gate.png'});
 assert.ok(done.doors.every(d=>d.open),'Walkthrough crosses every connection, including Medical Wing entrance');
 const gateDoor=done.doors.find(d=>d.id==='gate-checkpoint');await walk({x:gateDoor.x,z:gateDoor.z});assert.equal((await read()).interaction,gateDoor.id);await page.keyboard.press('e');assert.ok((await read()).doors.find(d=>d.id===gateDoor.id).open,'Occupied doorway cannot close');
 await walk({x:gateDoor.x,z:gateDoor.z+1.3});await page.keyboard.press('e');assert.equal((await read()).doors.find(d=>d.id===gateDoor.id).open,false);await page.keyboard.down('w');await sleep(700);await page.keyboard.up('w');const blocked=await read();assert.ok(blocked.player.z>gateDoor.z+.58,'Closed connection blocks physical traversal');assert.ok(blocked.walkable);await page.keyboard.press('e');assert.ok((await read()).doors.find(d=>d.id===gateDoor.id).open);
 await page.keyboard.press('Escape');const paused=await read();await page.keyboard.down('w');await sleep(300);await page.keyboard.up('w');assert.deepEqual(await read(),paused,'Paused inspection and movement are frozen');await page.click('#resume');assert.equal((await read()).state,'playing');
 await page.setViewport({width:800,height:600});await page.screenshot({path:'artifacts/phase7/small.png'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
 await page.click('#reset');const reset=await read();assert.equal(reset.complete,false);assert.deepEqual(reset.visited,['highway']);assert.deepEqual(reset.inspected,[]);assert.equal(reset.player.z,0);assert.equal(reset.doors.find(d=>d.id==='security-door').open,false);
 await page.click('header .status a');await page.waitForFunction(()=>window.zombieShooter?.state==='ready');await page.select('#gameMode','survival');await page.click('#start');assert.equal((await page.evaluate(()=>window.zombieShooter)).state,'playing');
 assert.deepEqual(errors,[]);console.log('SCREENING_PASS: 10 zones, both branches, inspection, prop/door collision, occupied-door guard, pause/reset, resize and return to Survival.');
}catch(error){if(await read())await writeFile('artifacts/phase7/failure.json',JSON.stringify(await read(),null,2));throw error;}finally{await browser.close();}
