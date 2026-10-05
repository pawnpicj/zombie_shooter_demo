import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {idleSearchWaypoint,navigationWaypoint} from './enemy-search.mjs';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1200,height:800}});
const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const read=()=>page.evaluate(()=>window.zombieShooter);
async function fightToLevel(level){
  await page.mouse.down();const deadline=Date.now()+90000,held=new Set();
  while(Date.now()<deadline){
    const data=await read();assert.equal(data.state,'playing');
    if(data.progression.level>=level){for(const key of held)await page.keyboard.up(key);await page.mouse.up();return data;}
    const target=data.targets.sort((a,b)=>a.distance-b.distance)[0];
    if(target)await page.mouse.move(target.x,target.y);
    const waypoint=idleSearchWaypoint(data),wanted=[];
    if(waypoint){if(Math.abs(waypoint.x-data.player.x)>.5)wanted.push(waypoint.x>data.player.x?'d':'a');if(Math.abs(waypoint.z-data.player.z)>.5)wanted.push(waypoint.z>data.player.z?'s':'w');}
    for(const key of held)if(!wanted.includes(key)){await page.keyboard.up(key);held.delete(key);}
    for(const key of wanted)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
    await sleep(70);
  }throw new Error('Level did not increase '+JSON.stringify(await read()));
}
async function collectAmmo(){
 const held=new Set(),end=Date.now()+20000,goal={x:0,z:14};
 try{while(Date.now()<end){const data=await read();assert.equal(data.state,'playing');if(Math.hypot(data.player.x-goal.x,data.player.z-goal.z)<1.7){for(const key of held)await page.keyboard.up(key);held.clear();const before=data.inventory.reserve;await page.keyboard.press('e');assert.ok((await read()).inventory.reserve>before,'Ammo crate supplies the finite reserve used by the reload-speed test');return;}
 const point=navigationWaypoint(data,[goal],1.1);assert.ok(point,'Ammo crate must be reachable');const wanted=[];
 if(Math.abs(point.x-data.player.x)>.35)wanted.push(point.x>data.player.x?'d':'a');if(Math.abs(point.z-data.player.z)>.35)wanted.push(point.z>data.player.z?'s':'w');
 for(const key of held)if(!wanted.includes(key)){await page.keyboard.up(key);held.delete(key);}for(const key of wanted)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}await sleep(60);
 }throw new Error('Ammo crate approach timed out');}finally{for(const key of held)await page.keyboard.up(key);}
}
try{
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.select('#gameMode','survival');await page.click('#start');
  const baseline=await read();assert.equal(baseline.progression.level,1);
  const lv2=await fightToLevel(2);
  assert.equal(lv2.maxHp,120);assert.equal(lv2.hp,120);assert.equal(lv2.progression.points,3);
  await page.keyboard.press('Tab');assert.equal((await read()).state,'stats');
  const frozen=await read();await sleep(600);assert.deepEqual(await read(),frozen,'Stats menu must pause game');
  for(const key of ['powerAttack','attackSpeed','movementSpeed'])await page.click('[data-stat="'+key+'"] button');
  const spent=await read();assert.equal(spent.progression.points,0);
  assert.ok(spent.combatStats.damage>baseline.combatStats.damage);
  assert.ok(spent.combatStats.shotInterval<baseline.combatStats.shotInterval);
  assert.ok(spent.combatStats.movementSpeed>baseline.combatStats.movementSpeed);
  assert.equal(await page.$$eval('.upgrade-row button',buttons=>buttons.every(button=>button.disabled)),true);
  await page.keyboard.press('Tab');assert.equal((await read()).state,'playing');
  const lv3=await fightToLevel(3);assert.equal(lv3.maxHp,140);assert.equal(lv3.hp,140);assert.equal(lv3.progression.points,3);
  await page.keyboard.press('Tab');
  for(const key of ['gunReload','criticalDamage'])await page.click('[data-stat="'+key+'"] button');
  const all=await read();assert.equal(all.progression.points,1);
  assert.ok(all.combatStats.reloadSeconds<baseline.combatStats.reloadSeconds);
  assert.ok(all.combatStats.criticalMultiplier>baseline.combatStats.criticalMultiplier);
  assert.equal(all.combatStats.criticalChance,.1);
  assert.ok(Object.values(all.progression.ranks).every(rank=>rank===1));
  await page.screenshot({path:'artifacts/status-upgrades.png'});
  await page.keyboard.press('Escape');assert.equal((await read()).state,'playing');
  await page.waitForFunction(()=>window.zombieShooter.reloadTimer===0,{timeout:10000});
  if((await read()).inventory.reserve===0)await collectAmmo();
  if((await read()).ammo===30){
    await page.mouse.move(600,350);await page.mouse.down();
    await page.waitForFunction(()=>window.zombieShooter.ammo<30,{timeout:10000});await page.mouse.up();
  }
  await page.keyboard.press('r');
  await page.waitForFunction(()=>window.zombieShooter.reloadTimer>0,{timeout:4000});
  const reloading=await read();assert.ok(reloading.reloadTimer<=all.combatStats.reloadSeconds+.01);
  await page.keyboard.press('Escape');assert.equal((await read()).state,'paused');
  await page.click('#openStats');assert.equal((await read()).state,'stats');
  assert.equal((await read()).progression.points,1,'Unspent points must be saved');
  await page.keyboard.press('Escape');assert.equal((await read()).state,'paused','Closing from pause must stay paused');
  assert.deepEqual(errors,[]);
  console.log('LEVEL_PASS: kill XP, +20 max HP and full heal, 3 points, five combat upgrades, no overspend, menu pause, reload speed and saved stacks');
}catch(error){await writeFile('artifacts/level-failure.json',JSON.stringify(await read(),null,2));throw error;}finally{await browser.close();}
