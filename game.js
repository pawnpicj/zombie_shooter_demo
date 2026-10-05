import * as THREE from 'three';
import { ARENA, MAGAZINE, waveConfig, segmentHit, moveCircle } from './rules.mjs';
import { CAMPAIGN, createCampaign, clearCampaignWave, interactCampaign } from './story.mjs';
import { revealHud } from './hud.js';
import { selectInteraction } from './interaction.mjs';
import { initSupplies } from './supplies.js';
import { STATUS, createProgression, xpRequired, gainExperience, spendPoint, combatStats, rollShot } from './progression.mjs';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a141b);
scene.fog = new THREE.FogExp2(0x0a141b, .013);
const camera = new THREE.OrthographicCamera(-30, 30, 22, -22, .1, 150);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xa8dce9, 0x36433b, 2));
const sun = new THREE.DirectionalLight(0xa1c4d0, 2.7);
sun.position.set(-15, 35, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 });
sun.shadow.bias = -.0005;
scene.add(sun);

const geometries = {
  cube: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 12)
};
const mats = new Map();
function material(color, emissive = false) {
  const key = color + ':' + emissive;
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: .85, ...(emissive ? { emissive: color, emissiveIntensity: 1.6 } : {}) }));
  return mats.get(key);
}
function mesh(shape, color, position, scale, parent = scene, glow = false) {
  const obj = new THREE.Mesh(geometries[shape], material(color, glow));
  obj.position.set(...position); obj.scale.set(...scale);
  obj.castShadow = !glow; obj.receiveShadow = !glow;
  parent.add(obj); return obj;
}
mesh('cube', 0x263536, [0, -.3, 0], [48, .5, 48]);
const grid = new THREE.GridHelper(46, 23, 0x506260, 0x354846);
grid.position.y = -.035; scene.add(grid);
for (const z of [-23.8, 23.8]) mesh('cube', 0x3a4a4e, [0, .7, z], [48, 1.5, .5]);
for (const x of [-23.8, 23.8]) mesh('cube', 0x3a4a4e, [x, .7, 0], [.5, 1.5, 48]);
for (let i = -22; i < 23; i += 3) {
  for (const z of [-23.45, 23.45]) {
    const stripe = mesh('cube', i % 2 ? 0xcfbc54 : 0x1c292a, [i, .08, z], [1.6, .08, .5]);
    stripe.rotation.y = -.3;
  }
}
const obstacles = [
  { x:-10, z:-8, w:6, d:3, h:2.4 }, { x:10, z:8, w:6, d:3, h:2.4 },
  { x:11, z:-10, w:3, d:6, h:2 }, { x:-11, z:10, w:3, d:6, h:2 },
  { x:-3, z:15, w:4, d:2, h:1.3 }, { x:3, z:-15, w:4, d:2, h:1.3 }
];
for (const [i, o] of obstacles.entries()) {
  const group = new THREE.Group(); scene.add(group);
  mesh('cube', i % 2 ? 0x566750 : 0x415a61, [o.x, o.h/2, o.z], [o.w, o.h, o.d], group);
  for (let j = -o.w/2+.35; j < o.w/2; j += .7)
    mesh('cube', 0x314347, [o.x+j, o.h/2, o.z+o.d/2+.015], [.06, o.h-.15, .03], group);
  mesh('cube', 0xc5d07d, [o.x, o.h+.03, o.z], [o.w-.15, .035, .12], group);
}
for (const x of [-20, 20]) for (const z of [-19, 0, 19]) {
  mesh('cylinder', 0x34474b, [x, .65, z], [.55, 1.3, .55]);
  mesh('cylinder', 0xbc6045, [x, .8, z], [.565, .17, .565]);
  obstacles.push({ x, z, w:1.1, d:1.1 });
}
for (const x of [-22, 22]) for (const z of [-21, 21]) {
  mesh('cube', 0x34464e, [x, 2, z], [.2, 4, .2]);
  mesh('cube', 0x94e8d6, [x, 4, z], [1, .15, .5], scene, true);
  const lamp = new THREE.PointLight(0x6fe7d2, 15, 12, 2);
  lamp.position.set(x, 3.5, z); scene.add(lamp);
}

// Cutaway lab props, floor labels and interactive research stations.
function floorLabel(text,x,z,color='#a3c7cb',width=8) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
  const ctx=canvas.getContext('2d');ctx.font='bold 48px Arial';ctx.textAlign='center';
  ctx.fillStyle=color;ctx.fillText(text,384,95);
  const texture=new THREE.CanvasTexture(canvas);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(width,width*160/768),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
  label.rotation.x=-Math.PI/2;label.position.set(x,.028,z);scene.add(label);
}
floorLabel('REGEN-X / BIOCONTAINMENT',0,-21,'#77b7c1',16);
floorLabel('SECURITY',-16,-19,'#8daeb6',6);
floorLabel('RESEARCH',16,-19,'#8daeb6',6);
floorLabel('EXTRACTION',0,22,'#b5ee81',7);
for(const [x,z] of [[-16,-4],[16,4]]) {
  mesh('cube',0x8ba4a4,[x,.8,z],[1.8,.2,3.5]);
  mesh('cube',0xc3ccbc,[x,1,z+.2],[1.6,.2,2.8]);
  mesh('cube',0xdfded0,[x,1.18,z-1.15],[1.25,.25,.5]);
  for(const dx of [-.7,.7])for(const dz of [-1.4,1.4])mesh('cube',0x536b72,[x+dx,.38,z+dz],[.13,.75,.13]);
  mesh('cube',0x5e534b,[x,1.12,z+.3],[.8,.04,1.5]);
  obstacles.push({x,z,w:1.8,d:3.5});
}
for(const [x,z] of [[-7,-17],[7,17]]) {
  mesh('cylinder',0x3e545f,[x,.25,z],[.85,.5,.85]);
  mesh('cylinder',0x31464e,[x,3,z],[.85,.3,.85]);
  const glass=mesh('cylinder',0x95e4d4,[x,1.6,z],[.75,2.5,.75]);
  glass.material=new THREE.MeshStandardMaterial({color:0x72cabe,transparent:true,opacity:.3,roughness:.2,depthWrite:false});
  mesh('cylinder',0x6bd29d,[x,1.4,z],[.28,1.8,.28],scene,true);
  obstacles.push({x,z,w:1.7,d:1.7});
}
for(const o of obstacles.slice(0,6)){
  mesh('cube',0x142a34,[o.x,o.h+.38,o.z],[.95,.65,.12]);
  mesh('cube',0x66b9b7,[o.x,o.h+.38,o.z-.07],[.78,.45,.025],scene,true);
}
const stations=CAMPAIGN.map((chapter,index)=>{
  const g=new THREE.Group();g.position.set(chapter.point.x,0,chapter.point.z);scene.add(g);
  if(index<2){
    mesh('cube',0x375564,[0,.7,0],[1.5,1.4,1],g);
    mesh('cube',0x0d2029,[0,1.65,-.12],[1.55,.8,.2],g);
    mesh('cube',0x73dce2,[0,1.65,-.235],[1.25,.55,.04],g,true);
    obstacles.push({x:chapter.point.x,z:chapter.point.z,w:1.5,d:1});
  }else{
    mesh('cube',0x28674d,[0,.01,0],[5,.04,3],g);
    mesh('cube',0xb6e675,[0,.035,0],[4.5,.03,.12],g,true);
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.8,1.95,40),new THREE.MeshBasicMaterial({color:0xc5f358,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.set(chapter.point.x,.04,chapter.point.z);scene.add(ring);
  return {mesh:g,ring};
});
function actor(zombie = false, type = 'normal') {
  const g = new THREE.Group();
  const skin = zombie ? type === 'tank' ? 0xa5ac65 : 0x88b88b : 0xd4b794;
  const clothing = zombie ? type === 'runner' ? 0x804641 : type === 'tank' ? 0x716541 : 0x46594d : 0x5c8794;
  mesh('cube', clothing, [0, 1.1, 0], [.62, .75, .42], g);
  mesh('cube', skin, [0, 1.75, 0], [.44, .45, .43], g);
  if (!zombie) {
    mesh('cube', 0x273f48, [0, 1.99, 0], [.51, .15, .48], g);
    mesh('cube', 0x26383e, [0, 1.17, -.08], [.68, .52, .44], g);
    mesh('cube', 0xafd9c2, [0, 1.18, .165], [.3, .18, .07], g);
    mesh('cube', 0x14212c, [.27, 1.25, -.66], [.13, .16, .9], g);
    mesh('cube', 0x92b6b9, [.27, 1.3, -.25], [.17, .13, .3], g);
  } else {
    for (const x of [-.13, .13]) mesh('cube', 0xf1b64b, [x, 1.8, -.225], [.065, .05, .02], g, true);
  }
  const legs = [];
  for (const x of [-.19, .19]) {
    const leg = new THREE.Group(); leg.position.set(x, .74, 0); g.add(leg);
    mesh('cube', 0x283d40, [0, -.29, 0], [.24, .6, .26], leg);
    mesh('cube', 0x172629, [0, -.59, -.06], [.27, .18, .38], leg);
    legs.push(leg);
    mesh('cube', skin, [x*2.2, 1.21, zombie ? -.28 : -.16], [.19, .2, zombie ? .7 : .45], g);
  }
  g.userData.legs = legs;
  if (type === 'tank') g.scale.setScalar(1.45);
  if (type === 'runner') g.scale.setScalar(.85);
  scene.add(g); return g;
}
const player = actor();
const playerLight = new THREE.PointLight(0xbfff66, 3, 5);
player.add(playerLight); playerLight.position.y = 2;
const muzzle = mesh('sphere', 0xffdf83, [.27, 1.25, -1.13], [.15, .15, .15], player, true);
muzzle.visible = false;
const aimMarker = new THREE.Mesh(new THREE.RingGeometry(.18, .25, 24), new THREE.MeshBasicMaterial({ color: 0xc5f358, transparent:true, opacity:.65, side:THREE.DoubleSide }));
aimMarker.rotation.x = -Math.PI/2; aimMarker.position.y = .025; scene.add(aimMarker);
const zombies = [], bullets = [], particles = [], pickups = [], corpses = [];
const keys = new Set();
const pointer = new THREE.Vector2(0, 0);
const ray = new THREE.Raycaster(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), aim = new THREE.Vector3(0, 0, -8);
let gameMode='campaign', campaign=createCampaign(), clearedAnnounced=false;
let supplies;
function getCombatStats(){const base=combatStats(progression,1);return supplies?supplies.modifyStats(base):base;}
let progression=createProgression(), statsReturnState='playing', criticalTimer=0;
let state = 'ready', hp = 100, wave = 0, kills = 0, score = 0, ammo = MAGAZINE;
let waveLeft = 0, spawnTimer = 0, nextWaveTimer = 0, shotTimer = 0, reloadTimer = 0, invincible = 0, dashTimer = 0, dashCooldown = 0;
let elapsed = 0, shooting = false, noticeTimer = 0, flashTimer = 0, damageFlash = 0, muted = false, audio;
let dashDirection = new THREE.Vector2(0, -1), best = 0;
try { best = Number(localStorage.getItem('dead-zone-best')) || 0; } catch {}
function tone(freq, duration, volume, type = 'sawtooth') {
  if (muted || !audio) return;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(freq, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, freq * .35), audio.currentTime + duration);
  gain.gain.setValueAtTime(volume, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
}
function notice(text) { $('waveNotice').textContent = text; noticeTimer = 2.8; $('waveNotice').style.opacity = 1; }
function remove(array, i) { scene.remove(array[i].mesh); array.splice(i, 1); }
function clear(array) { for (const o of array) scene.remove(o.mesh); array.length = 0; }
function updateHud() {
  supplies?.updateHud();
  $('playerLevel').textContent='LEVEL '+String(progression.level).padStart(2,'0');
  $('xpText').textContent=progression.xp+' / '+xpRequired(progression.level)+' EXP';
  $('xpBar').style.width=(progression.xp/xpRequired(progression.level)*100)+'%';
  $('openStats').textContent='STATUS / '+progression.points+' Points'+' · TAB';
  $('openStats').classList.toggle('has-points',progression.points>0);
  $('openStats').disabled=!['playing','paused','stats'].includes(state);

  $('waveLabel').textContent=gameMode==='campaign'?'CHAPTER':'WAVE';
  $('protocolLabel').textContent=gameMode==='campaign'?'OPERATION VIRUS X':'SURVIVAL PROTOCOL';
  $('missionHud').hidden=gameMode!=='campaign';
  if(gameMode==='campaign'){
    const chapter=CAMPAIGN[campaign.chapter];
    $('missionChapter').textContent=chapter.label;
    $('missionText').textContent=campaign.complete?'ภารกิจสำเร็จ / สูตรและตัวอย่างเชื้อปลอดภัย':campaign.phase==='objective'?chapter.cleared:chapter.objective;
    $('missionCounter').textContent=campaign.complete?'3 / 3 COMPLETE':campaign.phase==='objective'?'AREA CLEAR':(zombies.length+waveLeft)+' HOSTILES';
  }
  const target=state==='playing'?currentInteraction():null;
  $('interactPrompt').hidden=!target||target.id!=='mission';
  $('lootPrompt').hidden=!target||target.id==='mission';
  if(target)$(target.id==='mission'?'interactPrompt':'lootPrompt').textContent='[ E ] '+target.action;
  stations.forEach((station,i)=>{
    station.ring.visible=gameMode==='campaign' && i===campaign.chapter && !campaign.complete;
    station.ring.material.color.set(campaign.phase==='objective'?0xc5f358:0xdd885b);
  });
  $('hpText').textContent = Math.ceil(hp) + ' / ' + progression.maxHp + ' HP';
  $('hpBar').style.width = (hp/progression.maxHp*100) + '%'; $('hpBar').style.background = hp/progression.maxHp < .3 ? '#ff755f' : '#c5f358';
  $('wave').textContent = String(wave).padStart(2, '0');
  $('kills').textContent = String(kills).padStart(3, '0');
  $('score').textContent = String(score).padStart(5, '0');
  $('ammo').textContent = ammo;
  $('reloadText').textContent = reloadTimer > 0 ? 'กำลังรีโหลด… ' + reloadTimer.toFixed(1) + 's' : dashCooldown > 0 ? 'พุ่งหลบพร้อมใน ' + dashCooldown.toFixed(1) + 's · R รีโหลด' : 'R รีโหลด · SPACE พุ่งหลบพร้อม';
  $('weaponName').textContent = supplies?.weaponLabel() || 'M4 / LEVEL 1';
  if(ammo===0&&!supplies?.canReload())$('reloadText').textContent='กระสุนหมด / หากล่องกระสุนใน Lab [E]';
}
function showOverlay(mode) {
  $('gameModeRow').hidden=mode!=='dead';
  $('overlay').classList.remove('hidden');
  document.body.classList.remove('playing'); $('crosshair').style.display = 'none';
  $('controls').style.display = mode === 'dead' ? 'none' : 'grid';
  $('title').innerHTML = mode === 'dead' ? 'YOU <span>FELL</span>' : 'PAU<span>SED</span>';
  $('eyebrow').textContent = mode === 'dead' ? 'SURVIVAL REPORT / SECTOR 07' : 'SURVIVAL PROTOCOL / ON HOLD';
  $('description').innerHTML = mode === 'dead' ? 'รอดถึงเวฟ ' + wave + ' · กำจัด ' + kills + ' ตัว<br>คะแนน ' + score + ' · สถิติสูงสุด ' + best : 'พักหายใจ แล้วกลับไปจัดการฝูงซอมบี้';
  $('start').textContent = mode === 'dead' ? 'เล่นอีกครั้ง →' : 'กลับสู่สนามรบ →';
  $('tip').textContent = mode === 'dead' ? 'เคลื่อนที่ตลอดเวลา · ใช้ที่กำบัง · พุ่งหลบตอนถูกล้อม' : 'กด ESC เพื่อเล่นต่อ';
}
function statusValue(key,stats){
  return key==='powerAttack'?stats.damage.toFixed(1)+' DMG':
    key==='attackSpeed'?(1/stats.shotInterval).toFixed(2)+' นัด/วินาที':
    key==='movementSpeed'?stats.movementSpeed.toFixed(2)+' m/s':
    key==='gunReload'?stats.reloadSeconds.toFixed(2)+' วินาที':
    Math.round(stats.criticalMultiplier*100)+'%';
}
function renderStats(){
  $('statsLevel').textContent='JOHN VALENTINE / LEVEL '+progression.level;
  $('availablePoints').textContent=progression.points+' Points';
  $('maxHpValue').textContent='พลังชีวิต '+Math.ceil(hp)+' / '+progression.maxHp+' HP · คริติคอล '+Math.round(getCombatStats().criticalChance*100)+'%';
  const current=getCombatStats();
  for(const key of Object.keys(STATUS)){
    const row=document.querySelector('[data-stat="'+key+'"]');
    row.querySelector('.stat-rank').textContent='Level '+progression.ranks[key];
    const upgraded={...progression,ranks:{...progression.ranks,[key]:progression.ranks[key]+1}};
    row.querySelector('.stat-effect').textContent=statusValue(key,current)+' → '+statusValue(key,supplies.modifyStats(combatStats(upgraded,1)));
    row.querySelector('button').disabled=progression.points<1;
  }
}
function openStats(){
  if(!['playing','paused'].includes(state))return;
  statsReturnState=state;state='stats';keys.clear();shooting=false;
  $('overlay').classList.add('hidden');$('statsOverlay').hidden=false;
  document.body.classList.remove('playing');$('crosshair').style.display='none';
  $('interactPrompt').hidden=true;renderStats();updateHud();
  $('closeStats').focus();
}
function closeStats(){
  if(state!=='stats')return;
  $('statsOverlay').hidden=true;state='paused';
  if(statsReturnState==='playing')start();
  else showOverlay('paused');
}
function awardExperience(amount){
  const result=gainExperience(progression,amount,hp);hp=result.hp;
  if(result.levels){
    damageFlash=0;$('damage').style.opacity=0;
    notice('LEVEL '+progression.level+' / +'+(result.levels*3)+' Points / HP FULL');
    tone(900,.3,.075,'sine');updateHud();
  }
}
for(const [key,definition] of Object.entries(STATUS)){
  const row=document.createElement('div');row.className='upgrade-row';row.dataset.stat=key;
  row.innerHTML='<div><b>'+definition.label+'</b><span class="stat-rank"></span><p>'+definition.detail+'</p><small class="stat-effect"></small></div><button aria-label="เพิ่ม '+definition.label+' หนึ่งแต้ม">+1</button>';
  row.querySelector('button').addEventListener('click',()=>{
    if(state!=='stats'||!spendPoint(progression,key))return;
    tone(750,.07,.04,'square');renderStats();updateHud();
  });
  $('statusList').appendChild(row);
}
$('openStats').addEventListener('click',openStats);
$('closeStats').addEventListener('click',closeStats);
function radio(speaker,text){
  revealHud(['#radio']);
  $('radioSpeaker').textContent=speaker;$('radioText').textContent=text;
  $('radio').hidden=false;
}
function showReport(report,completed=false){
  state=completed?'won':'dialogue';shooting=false;keys.clear();
  $('overlay').classList.remove('hidden');document.body.classList.remove('playing');
  $('crosshair').style.display='none';$('interactPrompt').hidden=true;
  $('controls').style.display='none';$('gameModeRow').hidden=!completed;
  $('title').innerHTML=completed?'HOPE <span>REMAINS</span>':'PROJECT <span>X</span>';
  $('eyebrow').textContent=report.speaker;
  $('description').textContent=report.report;
  $('tip').textContent=completed?'คะแนน '+score+' · กำจัด '+kills+' ผู้ติดเชื้อ · John Valentine / Mission Complete':report.next;
  $('start').textContent=report.action;
  $('radio').hidden=true;
}
function currentInteraction(){
  const report=CAMPAIGN[campaign.chapter];
  return selectInteraction(player.position,[{
    id:'mission',action:campaign.chapter===2?'ถอนกำลังพร้อมตัวอย่าง':'กู้ข้อมูล '+report.marker,
    position:report.point,distance:2.8,priority:10,
    available:gameMode==='campaign'&&campaign.phase==='objective'&&!campaign.complete,
    activate:completeMissionInteraction
  },...(supplies?.interactionTargets()??[])]);
}
function interact(){
  if(state!=='playing')return;
  currentInteraction()?.activate();
}
function completeMissionInteraction(){
  const report=CAMPAIGN[campaign.chapter];
  if(!interactCampaign(campaign,player.position))return;
  score+=500;tone(650,.2,.06,'sine');
  if(campaign.complete){
    best=Math.max(best,score);try{localStorage.setItem('dead-zone-best',String(best));}catch{}
  }
  updateHud();showReport(report,campaign.complete);
}
function nextWave() {
  revealHud(['#missionHud']);
  clearedAnnounced=false;
  wave++; supplies?.restock(); waveLeft = waveConfig(wave).total; spawnTimer = .5; nextWaveTimer = 0;
  if (wave > 1) hp = Math.min(progression.maxHp, hp + 12);
  notice('WAVE ' + String(wave).padStart(2, '0') + ' / ' + waveLeft + ' HOSTILES');
  if(gameMode==='campaign'){
    const chapter=CAMPAIGN[campaign.chapter];
    radio(campaign.chapter===0?'ศูนย์บัญชาการ → JOHN VALENTINE':campaign.chapter===1?'JOHN VALENTINE → ศูนย์บัญชาการ':'ศูนย์บัญชาการ → JOHN VALENTINE',
      campaign.chapter===0?'Valentine เข้าถึง REGEN-X Lab แล้ว บุคลากรทั้งหมดขาดการติดต่อ ตรวจสอบระบบรักษาความปลอดภัยและค้นหาสาเหตุของการระบาด':
      campaign.chapter===1?'บันทึกยืนยันว่า Virus X มาจากสูตรรักษาผู้ป่วย ผมกำลังเข้าถึงคลังวิจัยเพื่อกู้สูตรและตัวอย่างเชื้อ':
      'ประตูถอนกำลังเปิดแล้ว John ฝ่าฝูงสุดท้ายและนำตัวอย่างออกมา ทีมแพทย์กำลังรอคุณ');
  }
  tone(400, .2, .08, 'sine'); updateHud();
}
function start() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
  if (audio?.state === 'suspended') audio.resume();
  const continuing=state==='paused'||state==='dialogue';
  if(state==='dialogue')nextWave();
  if (!continuing) {
    gameMode=$('gameMode').value;campaign=createCampaign();progression=createProgression();supplies.reset();$('radio').hidden=true;$('statsOverlay').hidden=true;criticalTimer=0;$('criticalFeedback').style.opacity=0;
    for (const list of [zombies, bullets, particles, pickups, corpses]) clear(list);
    hp = 100; wave = kills = score = elapsed = 0; ammo = MAGAZINE;
    waveLeft = spawnTimer = nextWaveTimer = shotTimer = reloadTimer = invincible = dashTimer = dashCooldown = damageFlash = flashTimer = 0;
    player.position.set(0, 0, gameMode==='campaign'?18:0); player.rotation.y = 0; muzzle.visible = false;
    nextWave();
  }
  keys.clear(); shooting = false; state = 'playing';
  $('overlay').classList.add('hidden'); document.body.classList.add('playing');
  $('crosshair').style.display = 'block';
  revealHud();
  $('controls').style.display='grid';$('gameModeRow').hidden=true;
  $('pause').disabled=false;updateHud();
}
function pause() {
  if (state === 'playing') { state = 'paused'; keys.clear(); shooting = false; showOverlay('paused'); }
  else if (state === 'paused') start();
}
function reload() {
  if (state === 'playing' && reloadTimer <= 0 && ammo < MAGAZINE && supplies.canReload()) { reloadTimer = getCombatStats().reloadSeconds; tone(650, .09, .035, 'square'); }
}
function spawnZombie() {
  const config = waveConfig(wave);
  const roll = Math.random();
  const type = wave >= 3 && roll < .13 ? 'tank' : wave >= 2 && roll < .35 ? 'runner' : 'normal';
  const body = actor(true, type);
  const edge = Math.floor(Math.random() * 4), offset = (Math.random()-.5)*40;
  body.position.set(edge < 2 ? (edge === 0 ? -22 : 22) : offset, 0, edge >= 2 ? (edge === 2 ? -22 : 22) : offset);
  zombies.push({ mesh:body, hp:config.health * (type === 'tank' ? 3 : type === 'runner' ? .7 : 1), speed:config.speed * (type === 'runner' ? 1.6 : type === 'tank' ? .65 : 1), radius:type === 'tank' ? .7 : .46, type, phase:Math.random()*6.28, side:Math.random()>.5 ? 1 : -1, attack:0 });
}
function burst(position, color, count = 7) {
  for (let i=0; i<count; i++) {
    const body = mesh('cube', color, [position.x, .8, position.z], [.09, .09, .09], scene, true);
    particles.push({ mesh:body, velocity:new THREE.Vector3((Math.random()-.5)*7, Math.random()*5, (Math.random()-.5)*7), life:.25+Math.random()*.3 });
  }
}
function dropMed(position) {
  const g = new THREE.Group(); g.position.copy(position);
  mesh('cube', 0x266e59, [0, .25, 0], [.65, .4, .65], g);
  mesh('cube', 0xb8ff91, [0, .465, 0], [.42, .025, .12], g, true);
  mesh('cube', 0xb8ff91, [0, .465, 0], [.12, .025, .42], g, true);
  scene.add(g); pickups.push({ mesh:g, life:18 });
}
function killZombie(index) {
  const z = zombies[index], pos = z.mesh.position.clone();
  supplies.reward(z.type);supplies.drop(pos);
  burst(pos, 0xa2c55d);
  const corpse = mesh('cube', 0x34453c, [pos.x, .05, pos.z], [.6, .09, 1]);
  corpse.rotation.y = z.mesh.rotation.y; corpses.push({ mesh:corpse, life:18 });
  if (corpses.length > 65) remove(corpses, 0);
  remove(zombies, index); kills++; score += z.type === 'tank' ? 250 : z.type === 'runner' ? 130 : 100;
  awardExperience(z.type==='tank'?60:z.type==='runner'?30:20);
  if (Math.random() < .12 || kills % 16 === 0) dropMed(pos);
}
function fire() {
  const direction = new THREE.Vector3(aim.x-player.position.x, 0, aim.z-player.position.z).normalize();
  if (direction.lengthSq() < .001) return;
  const stats=getCombatStats(),shot=rollShot(stats);
  ammo--; shotTimer = stats.shotInterval;
  const origin = player.localToWorld(new THREE.Vector3(.27, 1.25, -1.14));
  for(let pellet=0;pellet<stats.pellets;pellet++){
    const spread=(pellet-(stats.pellets-1)/2)*.11,dir=direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread);
    const tracer = mesh('cube', 0xffdf8e, [origin.x, .9, origin.z], [.06, .06, .75], scene, true);
    tracer.rotation.y = player.rotation.y-spread;
    bullets.push({ mesh:tracer, vx:dir.x*52, vz:dir.z*52, life:.95, damage:shot.damage, critical:shot.critical });
  }
  flashTimer = .055; muzzle.visible = true; tone(145+Math.random()*35, .055, .038);
  if (ammo === 0) reload();
}
function segmentBox(ax, az, bx, bz, o) {
  let lo=0, hi=1;
  for (const [a,b,c,extent] of [[ax,bx,o.x,o.w/2],[az,bz,o.z,o.d/2]]) {
    const d=b-a;
    if (Math.abs(d)<1e-8) { if(a<c-extent || a>c+extent) return null; }
    else {
      let first=(c-extent-a)/d, last=(c+extent-a)/d;
      if(first>last) [first,last]=[last,first];
      lo=Math.max(lo,first); hi=Math.min(hi,last);
      if(lo>hi) return null;
    }
  }
  return lo;
}
function update(dt) {
  elapsed += dt;
  supplies.tick(dt);
  criticalTimer=Math.max(0,criticalTimer-dt);$('criticalFeedback').style.opacity=criticalTimer>0?1:0;
  invincible=Math.max(0,invincible-dt); shotTimer-=dt; dashCooldown=Math.max(0,dashCooldown-dt);
  flashTimer-=dt; muzzle.visible=flashTimer>0;
  damageFlash=Math.max(0,damageFlash-dt*2.5); $('damage').style.opacity=damageFlash;
  if (reloadTimer>0) { reloadTimer-=dt; if(reloadTimer<=0) {ammo+=supplies.reload(MAGAZINE-ammo); reloadTimer=0; tone(800,.06,.04,'square');} }
  const move = new THREE.Vector2((keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0), (keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0));
  if(move.lengthSq()>0) move.normalize();
  if(keys.has('Space') && dashCooldown<=0 && dashTimer<=0) {
    dashDirection.copy(move.lengthSq()>0 ? move : new THREE.Vector2(Math.sin(player.rotation.y)*-1, Math.cos(player.rotation.y)*-1));
    dashTimer=.18; dashCooldown=2.5; invincible=Math.max(invincible,.25); tone(350,.15,.035,'sine');
  }
  const speed = dashTimer>0 ? Math.max(22,getCombatStats().movementSpeed*2) : getCombatStats().movementSpeed;
  const dir = dashTimer>0 ? dashDirection : move;
  moveCircle(player.position, dir.x*speed*dt, dir.y*speed*dt, .45, obstacles);
  dashTimer=Math.max(0,dashTimer-dt);
  ray.setFromCamera(pointer,camera); ray.ray.intersectPlane(ground,aim);
  aimMarker.position.set(aim.x,.025,aim.z);
  const dx=aim.x-player.position.x, dz=aim.z-player.position.z;
  if(Math.hypot(dx,dz)>.01) player.rotation.y=Math.atan2(-dx,-dz);
  player.userData.legs.forEach((leg,i)=>leg.rotation.x=move.lengthSq() ? Math.sin(elapsed*14+i*Math.PI)*.45 : 0);
  playerLight.intensity = dashTimer>0 ? 14 : 3;
  if(shooting && shotTimer<=0 && reloadTimer<=0 && ammo>0) fire();
  if(waveLeft>0) {
    spawnTimer-=dt;
    if(spawnTimer<=0) {spawnZombie();waveLeft--;spawnTimer=waveConfig(wave).interval;}
  }
  for(let i=zombies.length-1; i>=0; i--) {
    const z=zombies[i], pos=z.mesh.position;
    let x=player.position.x-pos.x, zz=player.position.z-pos.z, length=Math.hypot(x,zz)||1;
    x/=length; zz/=length;
    // Steer around nearby cover before movement, choosing a stable passing side.
    const ahead={x:pos.x+x*1.6,z:pos.z+zz*1.6};
    for(const o of obstacles) {
      if(Math.abs(ahead.x-o.x)<o.w/2+z.radius+.2 && Math.abs(ahead.z-o.z)<o.d/2+z.radius+.2) {
        const nx=-zz*z.side, nz=x*z.side;
        x=x*.25+nx;zz=zz*.25+nz;const n=Math.hypot(x,zz);x/=n;zz/=n;break;
      }
    }
    // Local separation prevents the horde from collapsing into a single point.
    let sx=0,sz=0;
    for(const other of zombies) {
      if(other===z) continue;
      const ax=pos.x-other.mesh.position.x,az=pos.z-other.mesh.position.z,d=Math.hypot(ax,az);
      if(d>0 && d<z.radius+other.radius) {sx+=ax/d*.75;sz+=az/d*.75;}
    }
    moveCircle(pos,(x*z.speed+sx)*dt,(zz*z.speed+sz)*dt,z.radius,obstacles);
    z.mesh.rotation.y=Math.atan2(-x,-zz);
    z.mesh.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(elapsed*z.speed*5+z.phase+j*Math.PI)*.4);
    z.attack-=dt;
    if(pos.distanceTo(player.position)<z.radius+.65 && z.attack<=0 && invincible<=0) {
      hp=Math.max(0,hp-supplies.absorbDamage(z.type==='tank'?20:10)); invincible=.45;z.attack=.9;damageFlash=.9;
      tone(60,.15,.09,'triangle');
      if(hp===0) {
        state='dead';shooting=false;keys.clear();best=Math.max(best,score);
        try{localStorage.setItem('dead-zone-best',String(best));}catch{}
        updateHud();showOverlay('dead');return;
      }
    }
  }
  for(let i=bullets.length-1;i>=0;i--) {
    const b=bullets[i], p=b.mesh.position, ax=p.x,az=p.z,bx=ax+b.vx*dt,bz=az+b.vz*dt;
    let target=-1, hitT=1.01;
    for(const o of obstacles) {const t=segmentBox(ax,az,bx,bz,o);if(t!==null && t<hitT){hitT=t;target=-2;}}
    for(let j=0;j<zombies.length;j++) {
      const z=zombies[j],zp=z.mesh.position;
      if(segmentHit(ax,az,bx,bz,zp.x,zp.z,z.radius+.14)) {
        const dx=bx-ax,dz=bz-az,den=dx*dx+dz*dz||1;
        const projected=((zp.x-ax)*dx+(zp.z-az)*dz)/den;
        const perpendicular=(zp.x-ax)**2+(zp.z-az)**2-projected*projected*den;
        const entry=Math.max(0,projected-Math.sqrt(Math.max(0,(z.radius+.14)**2-perpendicular)/den));
        if(entry<hitT){hitT=entry;target=j;}
      }
    }
    p.x=bx;p.z=bz;b.life-=dt;
    if(target!==-1) {
      const hitPos=new THREE.Vector3(ax+(bx-ax)*hitT,0,az+(bz-az)*hitT);
      if(target>=0) {
        zombies[target].hp-=b.damage;burst(hitPos,b.critical?0xffcf69:0xb5cf64,b.critical?6:3);
        if(b.critical){criticalTimer=.55;$('criticalFeedback').textContent='CRITICAL / '+Math.round(b.damage);}
        if(zombies[target].hp<=0) killZombie(target);
      } else burst(hitPos,0xefbb68,3);
      remove(bullets,i);
    } else if(b.life<=0 || Math.abs(p.x)>24 || Math.abs(p.z)>24) remove(bullets,i);
  }
  for(let i=particles.length-1;i>=0;i--) {
    const p=particles[i];p.life-=dt;p.velocity.y-=15*dt;p.mesh.position.addScaledVector(p.velocity,dt);
    p.mesh.scale.multiplyScalar(Math.exp(-dt*3));if(p.life<=0)remove(particles,i);
  }
  for(let i=pickups.length-1;i>=0;i--) {
    const p=pickups[i];p.life-=dt;p.mesh.position.y=Math.sin(elapsed*3)*.07;
    if(Math.hypot(p.mesh.position.x-player.position.x,p.mesh.position.z-player.position.z)<1.2 && hp<progression.maxHp) {
      hp=Math.min(progression.maxHp,hp+30);tone(850,.18,.06,'sine');remove(pickups,i);notice('+30 HP / MEDKIT');
    } else if(p.life<=0)remove(pickups,i);
  }
  for(let i=corpses.length-1;i>=0;i--) {corpses[i].life-=dt;if(corpses[i].life<=0)remove(corpses,i);}
  if(waveLeft===0 && zombies.length===0) {
    if(gameMode==='campaign'){
      if(!clearedAnnounced){
        clearedAnnounced=true;score+=wave*200;clearCampaignWave(campaign);revealHud(['#missionHud']);
        notice('AREA CLEAR / ตรวจสอบจุดภารกิจ');
        radio('JOHN VALENTINE / '+CAMPAIGN[campaign.chapter].marker,CAMPAIGN[campaign.chapter].cleared);
      }
    }else{
      if(nextWaveTimer===0){nextWaveTimer=3.5;score+=wave*200;notice('SECTOR CLEAR / +12 HP');}
      nextWaveTimer-=dt;
      if(nextWaveTimer<=0)nextWave();
    }
  }
  updateHud();
}
function resize() {
  const aspect=innerWidth/innerHeight;
  const vertical=Math.max(22,30/aspect);
  camera.left=-vertical*aspect;camera.right=vertical*aspect;camera.top=vertical;camera.bottom=-vertical;
  camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
}
function updateCamera() {
  const x=player.position.x*.22,z=player.position.z*.22;
  camera.position.set(x,38,z+30);camera.lookAt(x,0,z);
  camera.updateMatrixWorld();
}
resize();updateCamera();
window.addEventListener('resize',resize);
window.addEventListener('keydown',event=>{
  if(!event.repeat&&supplies.key(event.code)){event.preventDefault();return;}
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();
  if(event.code==='Tab' && ['playing','paused','stats'].includes(state)){
    event.preventDefault();if(!event.repeat){state==='stats'?closeStats():openStats();}return;
  }
  if(event.code==='Escape' && !event.repeat){if(state==='stats')closeStats();else pause();return;}
  if(state==='playing'){keys.add(event.code);if(event.code==='KeyR')reload();if(event.code==='KeyE' && !event.repeat)interact();}
});
window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('pointermove',event=>{
  pointer.set(event.clientX/innerWidth*2-1,-event.clientY/innerHeight*2+1);
  $('crosshair').style.left=event.clientX+'px';$('crosshair').style.top=event.clientY+'px';
});
renderer.domElement.addEventListener('pointerdown',event=>{if(event.button===0 && state==='playing')shooting=true;});
window.addEventListener('pointerup',()=>shooting=false);
window.addEventListener('blur',()=>{if(state==='playing')pause();else if(state==='stats')statsReturnState='paused';});
document.addEventListener('visibilitychange',()=>{if(document.hidden && state==='playing')pause();else if(document.hidden && state==='stats')statsReturnState='paused';});
renderer.domElement.addEventListener('contextmenu',event=>event.preventDefault());
renderer.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();state='paused';showOverlay('paused');
  $('description').textContent='การแสดงผล 3 มิติหยุดทำงาน กรุณารีเฟรชหน้าเพื่อเริ่มใหม่';
  $('start').disabled=true;
});
$('start').addEventListener('click',start);$('pause').addEventListener('click',pause);
$('mute').addEventListener('click',()=>{muted=!muted;$('mute').textContent='เสียง: '+(muted?'ปิด':'เปิด');});
$('start').disabled=false;$('start').textContent='เริ่มภารกิจ →';
if(matchMedia('(pointer: coarse)').matches)$('tip').textContent='เวอร์ชันนี้ใช้คีย์บอร์ดและเมาส์ กรุณาเล่นบนคอมพิวเตอร์';
supplies=initSupplies({scene,mesh,player,notice,tone,burst,
  getState:()=>state,getAim:()=>aim,cancelReload:()=>{reloadTimer=0;shotTimer=0;shooting=false;},
  freeze:next=>{state=next;keys.clear();shooting=false;$('overlay').classList.add('hidden');$('crosshair').style.display='none';$('interactPrompt').hidden=true;document.body.classList.remove('playing');},
  restore:previous=>{state='paused';if(previous==='playing')start();else{showOverlay('paused');updateHud();}},
  harmZombies:(x,z,radius,damage)=>{for(let i=zombies.length-1;i>=0;i--){const enemy=zombies[i];if(Math.hypot(enemy.mesh.position.x-x,enemy.mesh.position.z-z)<=radius+enemy.radius){enemy.hp-=damage;if(enemy.hp<=0)killZombie(i);}}}
});
updateHud();
let last=performance.now();
renderer.setAnimationLoop(now=>{
  const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
  if(state==='playing') {
    let remaining=dt;
    while(remaining>0 && state==='playing') {
      const step=Math.min(1/60,remaining);update(step);remaining-=step;
    }
  }
  if(noticeTimer>0 && state==='playing'){noticeTimer-=dt;if(noticeTimer<=0)$('waveNotice').style.opacity=0;}
  updateCamera();renderer.render(scene,camera);
});
// Read-only telemetry for runtime verification and future HUD integrations.
Object.defineProperty(window,'zombieShooter',{get:()=>({state,gameMode,core:{elapsed,camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z,left:camera.left,right:camera.right,top:camera.top,bottom:camera.bottom},obstacles:obstacles.map(o=>({...o})),interaction:currentInteraction()?.id??null},inventory:supplies.snapshot(),maxHp:progression.maxHp,progression:{...progression,ranks:{...progression.ranks}},combatStats:getCombatStats(),campaign:{chapter:campaign.chapter,phase:campaign.phase,evidence:[...campaign.evidence],complete:campaign.complete},objective:{...CAMPAIGN[campaign.chapter].point},hp,wave,kills,score,ammo,reloadTimer,zombies:zombies.length,remaining:waveLeft,bullets:bullets.length,player:{x:player.position.x,z:player.position.z},threeRevision:THREE.REVISION,targets:zombies.map(z=>{const point=z.mesh.position.clone().project(camera);return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2,distance:z.mesh.position.distanceTo(player.position)};})})});
