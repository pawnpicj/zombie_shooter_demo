import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),puppeteer=require(process.env.PUPPETEER_MODULE||'puppeteer');
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],defaultViewport:{width:1200,height:800}});
const page=await browser.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const readPanels=()=>page.evaluate(()=>['#radio','#missionHud','.weapon'].map(selector=>{
  const element=document.querySelector(selector),rect=element.getBoundingClientRect();
  return {selector,compact:element.classList.contains('hud-compact'),peek:element.classList.contains('hud-peek'),height:rect.height,width:rect.width};
}));
try{
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.click('#start');await page.mouse.move(600,400);
  const full=await readPanels();
  assert.ok(full.every(panel=>!panel.compact));
  await page.keyboard.press('Escape');
  await sleep(7000);
  assert.ok((await readPanels()).every(panel=>!panel.compact),'Panels must remain expanded before ten seconds');
  await page.waitForFunction(()=>['#radio','#missionHud','.weapon'].every(selector=>document.querySelector(selector).classList.contains('hud-compact')),{timeout:8000});
  const compact=await readPanels();
  for(let i=0;i<3;i++)assert.ok(compact[i].height<full[i].height,'Each panel should shrink');
  await page.keyboard.press('Escape');
  assert.ok((await readPanels()).every(panel=>!panel.compact),'Resuming should show details again for ten seconds');
  await page.mouse.down();
  const deadline=Date.now()+45000;
  while(Date.now()<deadline){
    const data=await page.evaluate(()=>window.zombieShooter);
    assert.equal(data.state,'playing');
    const target=data.targets.sort((a,b)=>a.distance-b.distance)[0];
    if(target)await page.mouse.move(target.x,target.y);
    const panels=await readPanels();
    if(panels.every(panel=>panel.compact))break;
    await sleep(80);
  }
  await page.mouse.up();
  assert.ok((await readPanels()).every(panel=>panel.compact));
  await page.mouse.move(600,400);
  await page.screenshot({path:'artifacts/compact-hud.png'});
  for(const selector of ['#radio','#missionHud','.weapon']){
    const rect=await page.$eval(selector,element=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};});
    await page.mouse.move(rect.x+rect.w/2,rect.y+rect.h/2);
    await page.waitForFunction(selector=>document.querySelector(selector).classList.contains('hud-peek'),{},selector);
    assert.ok((await readPanels()).find(panel=>panel.selector===selector).height>compact.find(panel=>panel.selector===selector).height);
    assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y).tagName,{x:rect.x+rect.w/2,y:rect.y+rect.h/2}),'CANVAS','Hover must not block shooting');
    await page.mouse.move(600,400);
    await page.waitForFunction(selector=>!document.querySelector(selector).classList.contains('hud-peek'),{},selector);
  }
  assert.deepEqual(errors,[]);
  console.log('HUD_PASS: visible before 10s, all three panels collapse, resume resets, hover reveals and clicks reach arena');
}finally{await browser.close();}
