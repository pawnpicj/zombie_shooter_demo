const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const testMode = process.argv.includes('--self-test');
const testRoot=app.isPackaged?path.join(path.dirname(app.getPath('exe')),'test-artifacts'):path.join(__dirname,'artifacts');
if (testMode) app.setPath('userData', path.join(testRoot, 'desktop-test-profile'));
let win, mode = 'windowed', previousMode = 'windowed', normalBounds, settingsPath;
const modes = ['windowed', 'borderless', 'fullscreen'];
const sizes = [[960,640],[1280,720],[1600,900],[1920,1080]];
function state() { return { mode, maximized:win.isMaximized(), width:win.getContentSize()[0], height:win.getContentSize()[1] }; }
function broadcast() { if (win && !win.isDestroyed()) win.webContents.send('window:state', state()); }
function save() {
  if (testMode || !win || win.isDestroyed()) return;
  const bounds = win.getNormalBounds();
  try { fs.writeFileSync(settingsPath, JSON.stringify({ mode, width:bounds.width, height:bounds.height })); } catch {}
}
function setMode(value) {
  if (!modes.includes(value)) throw new Error('Invalid display mode');
  if (value === mode) return state();
  if (mode === 'fullscreen') win.setFullScreen(false);
  if (value === 'fullscreen') { previousMode = mode; normalBounds=win.getNormalBounds(); win.setFullScreen(true); }
  mode = value; broadcast(); save(); return state();
}
function setSize(width,height) {
  if (!sizes.some(size=>size[0]===width && size[1]===height)) throw new Error('Invalid window size');
  if(mode==='fullscreen') setMode(previousMode);
  if(win.isMaximized()) win.unmaximize();
  win.setContentSize(width,height);win.center();broadcast();save();return state();
}
function verifySender(event) {
  if (!win || event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) throw new Error('Untrusted window command');
}
app.whenReady().then(async()=>{
  settingsPath=path.join(app.getPath('userData'),'window-settings.json');
  let settings={};
  if(!testMode) {try{settings=JSON.parse(fs.readFileSync(settingsPath,'utf8'));}catch{}}
  const width=Math.max(800,Math.min(1920,Number(settings.width)||1280));
  const height=Math.max(600,Math.min(1080,Number(settings.height)||800));
  win=new BrowserWindow({
    width,height,minWidth:800,minHeight:600,title:'DEAD ZONE — Zombie Shooter',
    frame:false,thickFrame:true,useContentSize:true,show:false,backgroundColor:'#080e12',autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{ if(url !== win.webContents.getURL()) event.preventDefault(); });
  win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
  const actions={
    'window:get':()=>state(),
    'window:mode':(_event,value)=>setMode(value),
    'window:size':(_event,width,height)=>setSize(width,height),
    'window:minimize':()=>win.minimize(),
    'window:maximize':()=>{if(mode==='fullscreen')setMode(previousMode);win.isMaximized()?win.unmaximize():win.maximize();broadcast();},
    'window:close':()=>win.close()
  };
  for(const [channel,action] of Object.entries(actions)) ipcMain.handle(channel,(event,...args)=>{verifySender(event);return action(event,...args);});
  win.webContents.on('before-input-event',(event,input)=>{
    if(input.type!=='keyDown' || input.isAutoRepeat)return;
    if(input.key==='F11' || input.key==='Enter' && input.alt) {event.preventDefault();setMode(mode==='fullscreen'?previousMode:'fullscreen');}
    if(input.key==='F10') {event.preventDefault();setMode(mode==='borderless'?'windowed':'borderless');}
    if(input.key.toLowerCase()==='r' && (input.control || input.meta)) event.preventDefault();
  });
  for(const event of ['resize','maximize','unmaximize','enter-full-screen','leave-full-screen']) win.on(event,broadcast);
  win.on('leave-full-screen',()=>{if(mode==='fullscreen'){mode=previousMode;broadcast();}});
  win.on('close',save);
  win.on('closed',()=>{win=null;});
  await win.loadFile(path.join(__dirname,'index.html'));
  if(modes.includes(settings.mode))setMode(settings.mode);
  win.show();
  if(testMode) {
    try {
      const assert=require('node:assert/strict');
      async function focusRenderer(){
        win.restore();win.show();win.focus();win.webContents.focus();
        const deadline=Date.now()+5000;
        while(Date.now()<deadline){
          if(win.isFocused()&&await win.webContents.executeJavaScript('document.hasFocus() && !document.hidden'))return;
          await new Promise(resolve=>setTimeout(resolve,50));
        }
        throw new Error('Self-test could not focus the visible game window');
      }
      await focusRenderer();
      const deadline=Date.now()+20000;
      while(Date.now()<deadline) {
        if(await win.webContents.executeJavaScript('Boolean(window.zombieShooter && window.deadZoneWindow)'))break;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.state'),'ready');
      assert.equal(await win.webContents.executeJavaScript('typeof require'),'undefined');
      assert.equal(await win.webContents.executeJavaScript('(() => {const select=document.querySelector("#displayMode");const rect=select.getBoundingClientRect();return document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)===select;})()'),true,'Display menu should be clickable above the game overlay');
      await win.webContents.executeJavaScript('document.querySelector("#start").click()');
      const initial=await win.webContents.executeJavaScript('window.zombieShooter');
      assert.equal(initial.state,'playing');
      await win.webContents.executeJavaScript('document.querySelector("#pause").click()');
      const paused=await win.webContents.executeJavaScript('window.zombieShooter');
      assert.equal(paused.state,'paused');
      await win.webContents.executeJavaScript('window.deadZoneWindow.setMode("borderless")');
      assert.equal(mode,'borderless');assert.equal(win.isFullScreen(),false);
      assert.equal(await win.webContents.executeJavaScript('document.body.classList.contains("desktop-borderless")'),true);
      await win.webContents.executeJavaScript('window.deadZoneWindow.setMode("fullscreen")');
      await new Promise(resolve=>setTimeout(resolve,1000));
      assert.equal(win.isFullScreen(),true);
      await win.webContents.executeJavaScript('window.deadZoneWindow.setMode("windowed")');
      await new Promise(resolve=>setTimeout(resolve,1000));
      assert.equal(win.isFullScreen(),false);
      await win.webContents.executeJavaScript('window.deadZoneWindow.setSize(960,640)');
      const [actualWidth,actualHeight]=win.getContentSize(); assert.ok(Math.abs(actualWidth-960)<=3 && Math.abs(actualHeight-640)<=3, 'Window dimensions should match preset within Windows DPI rounding');
      assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.score'),paused.score);
      assert.deepEqual(await win.webContents.executeJavaScript('window.zombieShooter.campaign'),paused.campaign);
      assert.deepEqual(await win.webContents.executeJavaScript('window.zombieShooter.progression'),paused.progression);
      assert.deepEqual(await win.webContents.executeJavaScript('window.zombieShooter.inventory'),paused.inventory);
      assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.state'),'paused');
      assert.equal(await win.webContents.executeJavaScript('window.deadZoneWindow.setMode("invalid").then(()=>false,()=>true)'),true);
      const image=await win.webContents.capturePage();
      fs.mkdirSync(testRoot,{recursive:true});
      fs.writeFileSync(path.join(testRoot,'desktop.png'),image.toPNG());
      // Display changes can move native focus. Resume only after the same precondition as a real click.
      for(let attempt=0;attempt<3;attempt++){
        await focusRenderer();
        assert.equal(await win.webContents.executeJavaScript('document.querySelector("#start").click(); window.zombieShooter.state'),'playing');
        await new Promise(resolve=>setTimeout(resolve,200));
        assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.state'),'playing','Resume remains active with focused window');
        win.minimize();
        const blurDeadline=Date.now()+3000;
        while(Date.now()<blurDeadline&&await win.webContents.executeJavaScript('window.zombieShooter.state')!=='paused')await new Promise(resolve=>setTimeout(resolve,50));
        assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.state'),'paused','Minimizing the window pauses gameplay');
        await focusRenderer();
        assert.equal(await win.webContents.executeJavaScript('window.zombieShooter.state'),'paused','Regaining focus does not resume automatically');
      }
      assert.equal(await win.webContents.executeJavaScript('document.querySelector("#start").click(); window.zombieShooter.state'),'playing');
      console.log('DESKTOP_TEST_PASS: rendering, isolated preload, borderless, fullscreen, resizing, preserved game and resume');
      app.exit(0);
    } catch(error) {console.error('DESKTOP_TEST_FAIL:',error);app.exit(1);}
  }
});
app.on('window-all-closed',()=>app.quit());
