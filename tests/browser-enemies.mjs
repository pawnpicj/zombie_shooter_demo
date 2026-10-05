import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1200,height:800}});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const read=()=>page.evaluate(()=>window.zombieShooter);
try{
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});await page.select('#gameMode','survival');await page.click('#start');
 await page.waitForFunction(()=>window.zombieShooter.enemies.length>=4&&window.zombieShooter.enemies.some(e=>Math.hypot(e.x,e.z)<24),{timeout:15000});
 const before=await read();assert.ok(before.enemies.every(e=>e.state==='idle'),'No global awareness before detection');
 // Muting changes audio output only. Actual shooting must still notify nearby enemies.
 await page.click('#mute');await page.mouse.move(1190,790);await page.mouse.down();
 await page.waitForFunction(()=>window.zombieShooter.ammo<30,{timeout:5000});await page.mouse.up();
 await page.waitForFunction(()=>window.zombieShooter.enemies.some(e=>e.stimulus==='sound'),{timeout:5000});
 const heard=await read(),near=heard.enemies.find(e=>e.stimulus==='sound');
 assert.equal(near.state,'investigating');assert.deepEqual(near.lastKnownPlayerPosition,{x:0,z:0});
 for(const enemy of heard.enemies)if(Math.hypot(enemy.x,enemy.z)>25.5)assert.equal(enemy.state,'idle','Distant enemies do not hear the whole map');
 await page.waitForFunction(id=>window.zombieShooter.enemies.some(e=>e.id===id&&e.state==='chasing'&&e.stimulus==='vision'),{timeout:20000},near.id);
 await page.keyboard.press('Escape');const paused=await read();await new Promise(r=>setTimeout(r,400));assert.deepEqual(await read(),paused);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>window.zombieShooter.hp<100,{timeout:25000});
 assert.ok((await read()).enemies.some(e=>e.state==='attacking'));
 await mkdir(new URL('../artifacts/phase4/',import.meta.url),{recursive:true});await page.screenshot({path:'artifacts/phase4/enemies.png'});
 assert.deepEqual(errors,[]);console.log('ENEMIES_PASS: idle spawn, distance-limited hearing while muted, last known position, sight acquisition, pause and melee damage.');
}finally{await browser.close();}
