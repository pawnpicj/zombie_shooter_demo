import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1440,height:900}});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.zombieShooter);
async function move(axis,target){
 const current=(await snapshot()).player[axis];if(Math.abs(current-target)<.3)return;
 const code=axis==='x'?(current<target?'KeyD':'KeyA'):(current<target?'KeyS':'KeyW');
 await page.evaluate(code=>window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true})),code);
 try{await page.waitForFunction((axis,target,positive,code)=>{
   if((positive?window.zombieShooter.player[axis]>=target:window.zombieShooter.player[axis]<=target)){
     window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));return true;
   }return false;
 },{timeout:10000},axis,target,current<target,code);}finally{await page.evaluate(code=>window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true})),code);}
}
async function shoot(count){const initial=(await snapshot()).ammo;await page.mouse.move(720,180);await page.mouse.down();try{await page.waitForFunction(n=>window.zombieShooter.ammo<=n,{timeout:5000},initial-count);}finally{await page.mouse.up();}}
try{
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.zombieShooter?.state==='ready');
 await page.select('#gameMode','campaign');await page.click('#start');
 await move('x',-6);await move('z',12);await page.keyboard.press('e');
 assert.equal((await snapshot()).inventory.equipped,'vx9');assert.equal((await snapshot()).ammo,15);
 await shoot(2);const pistol=(await snapshot()).ammo;assert.ok(pistol<15);
 await move('x',5);await page.keyboard.press('e');assert.equal((await snapshot()).inventory.equipped,'m4x');
 await shoot(2);const rifle=(await snapshot()).ammo;assert.ok(rifle<30);
 await page.keyboard.press('f');assert.equal((await snapshot()).ammo,pistol);
 const reserve=(await snapshot()).inventory.reserves['9mm'];await page.keyboard.press('r');
 assert.ok((await snapshot()).reloadTimer>0);await page.keyboard.press('f');
 assert.equal((await snapshot()).reloadTimer,0);assert.equal((await snapshot()).ammo,rifle);
 assert.equal((await snapshot()).inventory.reserves['9mm'],reserve);
 await page.keyboard.press('f');await page.keyboard.press('r');
 await page.waitForFunction(()=>window.zombieShooter.reloadTimer===0&&window.zombieShooter.ammo===15,{timeout:5000});
 assert.equal((await snapshot()).inventory.reserves['9mm'],reserve-(15-pistol));
 assert.match(await page.$eval('#reserveAmmo',el=>el.textContent),/9mm/);
 assert.equal(await page.$eval('#magazineSize',el=>el.textContent),'15');
 await page.keyboard.press('Escape');const paused=await snapshot();await new Promise(r=>setTimeout(r,400));assert.deepEqual(await snapshot(),paused);
 await mkdir(new URL('../artifacts/phase3/',import.meta.url),{recursive:true});
 await page.screenshot({path:new URL('../artifacts/phase3/weapons.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 assert.equal(paused.core.lastWeaponSound.radius,25);assert.deepEqual(errors,[]);
 console.log('Phase 3 browser checks passed: VX-9/M4X pickup, fire, magazine preservation, reload cancellation/completion, HUD and pause.');
}finally{await browser.close();}
