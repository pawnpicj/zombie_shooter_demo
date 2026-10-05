import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import {idleSearchWaypoint,enemyApproachWaypoint,navigationWaypoint} from './enemy-search.mjs';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:960,height:640}});
const page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.select('#gameMode','survival');await page.click('#start');await page.mouse.move(480,320);await page.mouse.down();
  const deadline=Date.now()+150000,held=new Set();let firing=true;
  let snapshot;
  while(Date.now()<deadline){
    snapshot=await page.evaluate(()=>window.zombieShooter);
    if(snapshot.state==='dead' || snapshot.wave>=2)break;
    const needsAmmo=snapshot.inventory.reserve===0&&snapshot.ammo<10;
    if(needsAmmo&&firing){await page.mouse.up();firing=false;}
    if(!needsAmmo&&!firing){await page.mouse.down();firing=true;}
    const nearest=snapshot.targets.sort((a,b)=>a.distance-b.distance)[0];
    if(nearest)await page.mouse.move(nearest.x,nearest.y);
    const ammoCrates=snapshot.inventory.crates.filter(c=>c.kind==='ammo');
    if(needsAmmo&&ammoCrates.some(c=>Math.hypot(c.x-snapshot.player.x,c.z-snapshot.player.z)<1.7))await page.keyboard.press('e');
    const waypoint=needsAmmo?navigationWaypoint(snapshot,ammoCrates,1.1):idleSearchWaypoint(snapshot),wanted=[];
    if(waypoint){if(Math.abs(waypoint.x-snapshot.player.x)>.5)wanted.push(waypoint.x>snapshot.player.x?'d':'a');if(Math.abs(waypoint.z-snapshot.player.z)>.5)wanted.push(waypoint.z>snapshot.player.z?'s':'w');}
    for(const key of held)if(!wanted.includes(key)){await page.keyboard.up(key);held.delete(key);}
    for(const key of wanted)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
    await sleep(70);
  }
  await page.mouse.up();
  for(const key of held)await page.keyboard.up(key);
  console.log('Combat result',snapshot);
  assert.ok(snapshot.kills>0,'Shots must damage and eliminate zombies');
  assert.ok(snapshot.score>0,'Eliminations must award score');
  assert.ok(snapshot.wave>=2,'Clearing wave should advance to next wave');
  await page.mouse.move(20,620);
  const deathDeadline=Date.now()+90000;held.clear();
  while(Date.now()<deathDeadline){
    const data=await page.evaluate(()=>window.zombieShooter);if(data.state==='dead')break;
    const waypoint=enemyApproachWaypoint(data),wanted=[];
    if(waypoint){if(Math.abs(waypoint.x-data.player.x)>.35)wanted.push(waypoint.x>data.player.x?'d':'a');if(Math.abs(waypoint.z-data.player.z)>.35)wanted.push(waypoint.z>data.player.z?'s':'w');}
    for(const key of held)if(!wanted.includes(key)){await page.keyboard.up(key);held.delete(key);}
    for(const key of wanted)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
    await sleep(70);
  }
  for(const key of held)await page.keyboard.up(key);
  const dead=await page.evaluate(()=>window.zombieShooter);
  assert.equal(dead.state,'dead','Approaching enemies without firing must allow contact damage and death');
  assert.equal(dead.hp,0);
  await page.click('#start');
  const restart=await page.evaluate(()=>window.zombieShooter);
  assert.equal(restart.state,'playing');assert.equal(restart.hp,100);assert.equal(restart.wave,1);assert.equal(restart.kills,0);assert.equal(restart.score,0);assert.equal(restart.ammo,30);
  assert.deepEqual(errors,[]);
  console.log('Combat, wave advancement, death and restart checks passed');
}finally{await browser.close();}
