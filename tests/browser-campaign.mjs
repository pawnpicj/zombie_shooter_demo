import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1200,height:800}});
const page=await browser.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const snapshot=()=>page.evaluate(()=>window.zombieShooter);
const held=new Set();
async function keys(wanted){
  for(const key of held)if(!wanted.includes(key)){await page.keyboard.up(key);held.delete(key);}
  for(const key of wanted)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
}
async function aim(){
  const data=await snapshot(),target=data.targets.sort((a,b)=>a.distance-b.distance)[0];
  if(target)await page.mouse.move(target.x,target.y);
  assert.notEqual(data.state,'dead','John must survive the scripted walkthrough '+JSON.stringify(data));
  return data;
}
async function walk(x,z,tolerance=1){
  const deadline=Date.now()+35000;
  while(Date.now()<deadline){
    const data=await aim(),dx=x-data.player.x,dz=z-data.player.z;
    if(Math.abs(dx)<tolerance && Math.abs(dz)<tolerance){await keys([]);return;}
    const wanted=[];
    if(Math.abs(dx)>=tolerance)wanted.push(dx>0?'d':'a');
    if(Math.abs(dz)>=tolerance)wanted.push(dz>0?'s':'w');
    await keys(wanted);
    await sleep(60);
  }
  throw new Error('Could not reach waypoint '+x+','+z+' '+JSON.stringify(await snapshot()));
}
try{
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>window.zombieShooter?.state==='ready');
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
  await page.screenshot({path:new URL('../artifacts/campaign-title.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
  assert.equal(await page.$eval('#gameMode',el=>el.value),'campaign');
  await page.click('#start');
  await page.keyboard.press('e');
  assert.deepEqual((await snapshot()).campaign.evidence,[],'Evidence cannot be collected before combat');
  await page.mouse.down();
  await walk(0,14);await page.keyboard.press("e");await walk(0,0);await walk(0,-18);await page.keyboard.press("e");assert.equal((await snapshot()).inventory.equipped,"marksman");await page.mouse.up();await page.mouse.move(600,400);await page.mouse.down();await walk(0,0);
  for(let chapter=0;chapter<3;chapter++){
    const deadline=Date.now()+90000;
    while(Date.now()<deadline){
      const data=await aim();
      if(data.campaign.phase==='objective')break;
      await sleep(65);
    }
    await page.mouse.up();
    assert.equal((await snapshot()).campaign.phase,'objective');
    await page.screenshot({path:new URL('../artifacts/campaign-chapter-'+(chapter+1)+'.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
    if(chapter===0){await walk(-18,0);await walk(-18,-15);await walk(-16,-15,1.4);}
    if(chapter===1){await walk(18,0);await walk(18,-15);await walk(16,-15,1.4);}
    if(chapter===2){await walk(0,20);}
    assert.equal(await page.$eval('#interactPrompt',el=>el.hidden),false,'E prompt should appear near active station');
    await page.keyboard.press('e');
    const report=await snapshot();
    assert.equal(report.campaign.evidence.length,chapter+1);
    assert.equal(report.state,chapter===2?'won':'dialogue');
    assert.equal(await page.$eval('#overlay',el=>el.classList.contains('hidden')),false);
    console.log('Mission '+(chapter+1)+' completed: '+report.campaign.evidence.join(', '));
    if(chapter<2){
      await page.click('#start');await page.mouse.down();
      if(chapter===0){await walk(-18,-15);await walk(-18,0);await walk(0,0);}
      else {await walk(18,-15);await walk(18,0);await walk(0,0);}
      await walk(0,-10);await page.keyboard.press('e');await walk(0,0);
      assert.equal((await snapshot()).wave,chapter+2);
    }
  }
  const final=await snapshot();
  assert.equal(final.campaign.complete,true);assert.equal(final.state,'won');
  assert.deepEqual(final.campaign.evidence,['security-log','formula-x','extracted']);
  await page.screenshot({path:new URL('../artifacts/campaign-ending.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
  await page.click('#start');
  const restart=await snapshot();
  assert.equal(restart.state,'playing');assert.equal(restart.campaign.chapter,0);assert.deepEqual(restart.campaign.evidence,[]);
  assert.equal(restart.wave,1);assert.equal(restart.hp,100);
  assert.deepEqual(errors,[]);
  console.log('CAMPAIGN_PASS: three combats, nearby E interaction, story reports, extraction and replay');
}finally{await browser.close();}
