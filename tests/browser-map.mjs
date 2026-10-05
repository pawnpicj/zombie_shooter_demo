import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1440,height:900}});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const read=()=>page.evaluate(()=>window.blockMapTest),door=async id=>(await read()).doors.find(d=>d.id===id);
async function walk(axis,target){for(let attempt=0;attempt<8;attempt++){const current=(await read()).player[axis];if(Math.abs(current-target)<.18)break;const code=axis==='x'?(current<target?'KeyD':'KeyA'):(current<target?'KeyS':'KeyW');
 await page.evaluate(code=>window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true})),code);
 try{await page.waitForFunction((axis,target,positive,code)=>{const data=window.blockMapTest;if(positive?data.player[axis]>=target-.06:data.player[axis]<=target+.06){window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));return true;}return false;},{timeout:10000},axis,target,current<target,code);}finally{await page.evaluate(code=>window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true})),code);}
 }
 assert.ok(Math.abs((await read()).player[axis]-target)<.3,'Arrived before using the nearby door');
 assert.equal((await read()).walkable,true);
}
try{
 await mkdir('artifacts/phase5',{recursive:true});await page.goto('http://127.0.0.1:5173/map-test.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.blockMapTest?.state==='playing');
 assert.equal((await read()).zone.blockId,'entry');assert.equal((await read()).route,null);
 await page.screenshot({path:'artifacts/phase5/map-start.png'});
 const movingStart=(await read()).elapsed;await page.keyboard.down('d');await page.waitForFunction(start=>window.blockMapTest.elapsed-start>3,{},movingStart);await page.keyboard.up('d');
 const blocked=await read();assert.ok(blocked.player.x<=-3.589&&blocked.player.x>-3.7,'Closed door blocks shared collision');assert.equal(blocked.interaction,'hub-door');
 await page.keyboard.press('e');assert.equal((await door('hub-door')).open,true);
 await walk('x',8.4);await page.keyboard.press('e');assert.equal((await door('east-gate')).locked,true);assert.equal((await door('east-gate')).open,false);
 await walk('x',0);await walk('z',6);await page.keyboard.press('e');assert.equal((await door('east-gate')).locked,false);assert.equal((await read()).route,null);
 await walk('z',8.4);await page.keyboard.press('e');assert.equal((await door('annex-door')).open,true);
 await walk('z',12);await walk('x',-6);await page.keyboard.press('e');assert.ok((await read()).collected.includes('supply'));
 await page.keyboard.press('e');assert.equal((await read()).collected.filter(id=>id==='supply').length,1);
 await walk('x',0);await walk('z',0);await walk('x',8.4);await page.keyboard.press('e');assert.ok((await read()).route);
 await walk('x',9);await page.keyboard.press('e');assert.equal((await door('east-gate')).open,true,'Cannot close an occupied doorway');
 await walk('x',7.7);await page.keyboard.press('e');assert.equal((await door('east-gate')).open,false);assert.equal((await read()).route,null);
 await page.keyboard.press('e');await walk('x',24);assert.equal((await read()).zone.blockId,'wing');await page.keyboard.press('e');assert.equal((await read()).complete,true);
 await page.screenshot({path:'artifacts/phase5/map-complete.png'});
 await page.keyboard.press('Escape');const paused=await read();await new Promise(r=>setTimeout(r,300));assert.deepEqual(await read(),paused);
 await page.click('#reset');const reset=await read();assert.equal(reset.complete,false);assert.equal(reset.player.x,-18);assert.equal(reset.collected.length,0);assert.equal(reset.doors.find(d=>d.id==='east-gate').locked,true);
 await page.setViewport({width:800,height:600});await page.screenshot({path:'artifacts/phase5/map-small.png'});assert.deepEqual(errors,[]);
 console.log('MAP_PASS: wall collision, connected doors, locked gate, objective unlock, one-use loot, rotated wing, dynamic navigation, occupied-door guard, pause, reset and resize.');
}catch(error){await writeFile('artifacts/phase5/map-failure.json',JSON.stringify(await read(),null,2));throw error;}finally{await browser.close();}
