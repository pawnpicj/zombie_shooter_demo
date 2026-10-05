import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:960,height:640}});
const page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.select('#gameMode','survival');await page.click('#start');await page.mouse.move(480,320);await page.mouse.down();
  const deadline=Date.now()+55000;
  let snapshot;
  while(Date.now()<deadline){
    snapshot=await page.evaluate(()=>window.zombieShooter);
    if(snapshot.state==='dead' || snapshot.wave>=2)break;
    const nearest=snapshot.targets.sort((a,b)=>a.distance-b.distance)[0];
    if(nearest)await page.mouse.move(nearest.x,nearest.y);
    await sleep(70);
  }
  await page.mouse.up();
  console.log('Combat result',snapshot);
  assert.ok(snapshot.kills>0,'Shots must damage and eliminate zombies');
  assert.ok(snapshot.score>0,'Eliminations must award score');
  assert.ok(snapshot.wave>=2,'Clearing wave should advance to next wave');
  await page.mouse.move(20,620);
  await page.waitForFunction(()=>window.zombieShooter.state==='dead',{timeout:60000});
  const dead=await page.evaluate(()=>window.zombieShooter);
  assert.equal(dead.hp,0);
  await page.click('#start');
  const restart=await page.evaluate(()=>window.zombieShooter);
  assert.equal(restart.state,'playing');assert.equal(restart.hp,100);assert.equal(restart.wave,1);assert.equal(restart.kills,0);assert.equal(restart.score,0);assert.equal(restart.ammo,30);
  assert.deepEqual(errors,[]);
  console.log('Combat, wave advancement, death and restart checks passed');
}finally{await browser.close();}
