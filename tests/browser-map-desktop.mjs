import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:800,height:600}}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
// Renderer-only bridge fixture. This does not validate native IPC/window effects.
await page.evaluateOnNewDocument(()=>{let mode='windowed';window.bridgeCalls=[];window.deadZoneWindow={onState(){},getState:async()=>({mode,width:800,height:600,maximized:false}),setMode:async value=>({mode:mode=value,width:800,height:600,maximized:false}),setSize:async()=>({mode,width:960,height:640,maximized:false}),minimize:()=>window.bridgeCalls.push('minimize'),maximize:()=>window.bridgeCalls.push('maximize'),close:()=>window.bridgeCalls.push('close')};});
try{await mkdir('artifacts/phase7',{recursive:true});for(const file of ['screening-center.html','map-test.html']){
 await page.goto('http://127.0.0.1:5173/'+file,{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.body.classList.contains('desktop-windowed'));
 assert.equal(await page.$eval('#displayMode',el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;}),true,'Window menu remains clickable above world');
 await page.click('#winMin');assert.deepEqual(await page.evaluate(()=>window.bridgeCalls),['minimize']);
 await page.select('#displayMode','borderless');await page.waitForFunction(()=>document.body.classList.contains('desktop-borderless'));assert.equal(await page.$eval('#windowBar',el=>getComputedStyle(el).display),'none');
 await page.select('#displayMode','fullscreen');await page.waitForFunction(()=>document.querySelector('#windowSize').disabled);
 await page.select('#displayMode','windowed');await page.waitForFunction(()=>!document.querySelector('#windowSize').disabled);
 await page.screenshot({path:'artifacts/phase7/desktop-'+file.replace('.html','.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.$eval('#pause',el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;}),true,'Pause control remains visible and clickable at desktop minimum size');
 }assert.deepEqual(errors,[]);console.log('MAP_DESKTOP_RENDERER_PASS: both maps initialize the bridge UI, expose clickable controls and update modes with a mock bridge. Native execution remains unverified.');
}finally{await browser.close();}
