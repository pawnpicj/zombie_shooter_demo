import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1200,height:800}});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const read=()=>page.evaluate(()=>window.zombieShooter),sleep=ms=>new Promise(r=>setTimeout(r,ms)),held=new Set();
async function keys(wanted){for(const k of held)if(!wanted.includes(k)){await page.keyboard.up(k);held.delete(k);}for(const k of wanted)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}}
async function aim(){const d=await read();assert.notEqual(d.state,'dead');const t=d.targets.sort((a,b)=>a.distance-b.distance)[0];if(t)await page.mouse.move(t.x,t.y);return d;}
async function walk(x,z,tolerance=.9){const end=Date.now()+40000;while(Date.now()<end){const d=await aim(),dx=x-d.player.x,dz=z-d.player.z;if(Math.abs(dx)<tolerance&&Math.abs(dz)<tolerance){await keys([]);await sleep(120);const stopped=await read();if(Math.hypot(x-stopped.player.x,z-stopped.player.z)<1.8)return;continue;}const wanted=[];if(Math.abs(dx)>=tolerance)wanted.push(dx>0?'d':'a');if(Math.abs(dz)>=tolerance)wanted.push(dz>0?'s':'w');await keys(wanted);await sleep(60);}throw Error('Waypoint '+x+','+z+' '+JSON.stringify(await read()));}
async function collect(x,z){await walk(x,z);await page.keyboard.press('e');}
async function clearWave(){await page.mouse.up();await page.mouse.move(600,400);await page.mouse.down();const end=Date.now()+100000;while(Date.now()<end){const d=await aim();if(d.campaign.phase==='objective'){await page.mouse.up();return d;}await sleep(60);}throw Error('Wave did not clear '+JSON.stringify(await read()));}
async function shop(){
 await page.keyboard.press('b');assert.equal((await read()).state,'shop');
 const freeze=await read();await sleep(300);assert.deepEqual(await read(),freeze);
}
async function leaveShop(){await page.keyboard.press('b');assert.equal((await read()).state,'playing');}
async function buyNamed(name){const buttons=await page.$$('#grenadeRows .shop-row');for(const row of buttons){if((await row.evaluate(e=>e.textContent)).includes(name)){await row.$eval('button',b=>b.click());return;}}throw Error('No grenade row '+name);}
async function throwType(key,combat=false){
 while((await read()).inventory.selectedGrenade!==key)await page.keyboard.press('q');
 let beforeKills=0;if(combat){const end=Date.now()+60000;let target;while(Date.now()<end){const d=await read();target=d.targets.sort((a,b)=>a.distance-b.distance)[0];if(target&&target.distance<12){beforeKills=d.kills;await page.mouse.move(target.x,target.y);break;}await sleep(80);}if(!target||target.distance>=12)throw Error('No nearby grenade target');}else await page.mouse.move(600,390);await page.keyboard.press('g');
 await page.waitForFunction(()=>window.zombieShooter.inventory.effects.some(e=>e.kind==='throw'),{timeout:4000});
 await page.waitForFunction(k=>window.zombieShooter.inventory.effects.some(e=>e.kind===(k==='molotov'?'fire':k==='cluster'?'fragment':'flash')),{timeout:5000},key);
 assert.equal((await read()).inventory.grenades[key],0);
 await sleep(1200);if(combat)await page.waitForFunction(k=>window.zombieShooter.kills>k,{timeout:7000},beforeKills);
}
try{
 await page.goto('http://127.0.0.1:5173/?version=1.3.0',{waitUntil:'networkidle0'});await page.click('#start');
 const initial=await read();assert.equal(initial.inventory.money,0);assert.deepEqual(initial.inventory.weapons,['m4']);
 await shop();assert.equal(await page.$$eval('#grenadeRows button',bs=>bs.every(b=>b.disabled)),true);await leaveShop();
 await page.mouse.move(600,400);await page.mouse.down();await collect(-5,18);assert.ok((await read()).inventory.materials>=6);
 await walk(0,18);await walk(0,14);const before=(await read()).inventory.reserve;await page.keyboard.press("e");assert.ok((await read()).inventory.reserve>before);
 await walk(0,18);await collect(5,18);await walk(0,18);await walk(0,0);
 const wave1=await clearWave();console.log("Supply checkpoint: wave 1 cleared, crates collected");assert.ok(wave1.inventory.money>=300);
 assert.deepEqual(wave1.inventory.grenades,{molotov:0,demolition:0,cluster:0});
 await shop();await page.click('#weaponRows .upgrade');assert.equal((await read()).inventory.upgrades.m4,1);
 await buyNamed('ขวดเพลิง');assert.equal((await read()).inventory.grenades.molotov,1);
 await page.screenshot({path:'artifacts/armory-shop.png'});await leaveShop();await throwType('molotov');
 await collect(-18,0);assert.ok((await read()).inventory.weapons.includes('smg'));assert.equal((await read()).inventory.equipped,'smg');
 await page.keyboard.press('f');assert.equal((await read()).inventory.equipped,'m4');
 await walk(-18,-15);await walk(-16,-15,1.4);await page.keyboard.press('e');assert.equal((await read()).state,'dialogue');
 await page.click('#start');await page.mouse.down();await walk(-18,-15);await walk(-18,0);await walk(0,0);
 await clearWave();assert.equal((await read()).inventory.crates.some(c=>c.weapon==="smg"),false,"Found weapons should not respawn next chapter");console.log("Supply checkpoint: wave 2 cleared, Lab SMG collected");
 await shop();await buyNamed('ทำลายล้าง');
 assert.equal((await read()).inventory.grenades.demolition,1);await leaveShop();
 await collect(18,0);assert.equal((await read()).inventory.equipped,'shotgun');
 await walk(0,0);await collect(0,-18);assert.ok((await read()).inventory.weapons.includes('marksman'));
 await walk(0,0);await walk(18,0);await walk(18,-15);await walk(16,-15,1.4);await page.keyboard.press('e');assert.equal((await read()).state,'dialogue');await page.click('#start');await throwType('demolition',true);await shop();await buyNamed('แตกกระจาย');assert.equal((await read()).inventory.grenades.cluster,1);await leaveShop();await throwType('cluster',true);console.log('Supply checkpoint: live grenade kills verified');
 const resources=await read();await page.keyboard.press('Escape');await page.click('#openShop');assert.equal((await read()).state,'shop');
 await page.keyboard.press('Escape');assert.equal((await read()).state,'paused');assert.equal((await read()).inventory.money,resources.inventory.money);
 assert.deepEqual(errors,[]);await page.screenshot({path:'artifacts/lab-supplies.png'});
 console.log('SUPPLIES_PASS: kill money, material/ammo/random crates, paid upgrades, purchase-only grenades, three grenade effects, Lab-only SMG/shotgun/DMR, weapon switching, shop pause and resources preserved');
}finally{await browser.close();}
