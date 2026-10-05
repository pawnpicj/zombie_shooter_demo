import * as THREE from 'three';
import {compileMap} from './block-map.mjs';
import {FRAMEWORK_TEST} from './maps/framework-test.mjs';
import {moveCircle} from './rules.mjs';
import {selectInteraction} from './interaction.mjs';
const $=id=>document.getElementById(id),scene=new THREE.Scene();scene.background=new THREE.Color(0x09141b);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));document.body.prepend(renderer.domElement);
const camera=new THREE.OrthographicCamera(-30,30,20,-20,.1,150);camera.position.set(3,48,33);camera.lookAt(3,0,8);
scene.add(new THREE.HemisphereLight(0xc1e1ef,0x26382f,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-20,40,20);scene.add(sun);
const geometry=new THREE.BoxGeometry(1,1,1),world=new THREE.Group();scene.add(world);
let map,doorMeshes=new Map(),markers=new Map(),collected=new Set(),complete=false,state='playing',routeLine,elapsed=0;
const keys=new Set(),player=new THREE.Mesh(new THREE.CapsuleGeometry(.45,.7,4,8),new THREE.MeshStandardMaterial({color:0xc5f358}));player.position.y=.8;scene.add(player);
function box(color,x,y,z,w,h,d){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.85}));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);world.add(mesh);return mesh;}
function route(){const end=map.spawns.find(s=>s.id==='exit');return map.findPath(player.position,end);}
function updateRoute(){if(routeLine){scene.remove(routeLine);routeLine.geometry.dispose();routeLine.material.dispose();}const path=route();if(!path){routeLine=null;return;}const points=path.map(p=>new THREE.Vector3(p.x,.08,p.z));routeLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xb5e75e}));scene.add(routeLine);}
function build(){
 for(const child of [...world.children]){child.traverse(o=>{if(o.isMesh&&o.geometry!==geometry)o.geometry.dispose();if(o.material)o.material.dispose();});world.remove(child);}
 map=compileMap(FRAMEWORK_TEST);doorMeshes=new Map();markers=new Map();collected=new Set();complete=false;state='playing';elapsed=0;keys.clear();
 for(const block of map.blocks){const color=block.environment==='control'?0x315764:block.environment==='research'?0x425647:0x273f48;
  for(const cell of block.cells)box(color,cell.x*map.cellSize,-.12,cell.z*map.cellSize,5.95,.2,5.95);
  const light=new THREE.PointLight(block.lighting.color,block.lighting.intensity,14);light.position.set(block.cells[0].x*map.cellSize,3,block.cells[0].z*map.cellSize);world.add(light);
 }
 for(const obstacle of map.obstacles()){if(obstacle.doorId)continue;box(0x658086,obstacle.x,.75,obstacle.z,obstacle.w,1.5,obstacle.d);}
 for(const door of map.doors){const mesh=box(door.locked?0xe1aa5d:0x82c6ad,door.x,.75,door.z,door.vertical?.28:map.doorWidth,1.5,door.vertical?map.doorWidth:.28);mesh.visible=!door.open;doorMeshes.set(door.id,mesh);}
 for(const spawn of map.spawns){if(spawn.kind==='player'){player.position.set(spawn.x,.8,spawn.z);continue;}const marker=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.22,20),new THREE.MeshStandardMaterial({color:spawn.kind==='enemy'?0xbf6562:spawn.kind==='loot'?0x7accdf:0xe0cc73,emissive:spawn.kind==='objective'?0x443e13:0}));marker.position.set(spawn.x,.15,spawn.z);world.add(marker);markers.set(spawn.id,marker);}
 $('status').textContent='เปิดประตูเข้าห้องควบคุม';$('pause').textContent='พัก / ESC';updateRoute();updatePrompt();
}
function changeDoor(door){
 if(door.locked){$('status').textContent='ประตูล็อก — ใช้จุดสีเหลืองในห้องควบคุมก่อน';return;}
 // Closing a door must not embed the player in its collision box.
 if(door.open&&Math.abs(player.position.x-door.x)<(door.vertical?.6:map.doorWidth/2+.45)&&Math.abs(player.position.z-door.z)<(door.vertical?map.doorWidth/2+.45:.6)){$('status').textContent='ถอยออกจากช่องประตูก่อนปิด';return;}
 map.setDoorOpen(door.id,!door.open);doorMeshes.get(door.id).visible=!door.open;updateRoute();
}
function targets(){return [
 ...map.doors.map(door=>({id:door.id,position:door,distance:1.9,available:true,action:door.locked?'ประตูล็อก':door.open?'ปิดประตู':'เปิดประตู',activate:()=>changeDoor(door)})),
 ...map.spawns.filter(s=>s.kind==='loot'||s.kind==='objective').map(spawn=>({id:spawn.id,position:spawn,distance:1.7,priority:1,available:!collected.has(spawn.id),action:spawn.label,activate:()=>{
  if(spawn.id==='exit'&&!collected.has('control'))return;
  collected.add(spawn.id);markers.get(spawn.id).visible=false;
  if(spawn.id==='control'){map.unlockDoor('east-gate');doorMeshes.get('east-gate').material.color.set(0x82c6ad);$('status').textContent='ปลดล็อกแล้ว — เปิดประตูตะวันออกแล้วไปจุดสีเหลืองสุดทาง';}
  else if(spawn.id==='exit'){complete=true;$('status').textContent='สำรวจสำเร็จ — ทางเดินและประตูเชื่อมต่อใช้งานได้';}
  else $('status').textContent='เก็บกล่องทดสอบแล้ว';updateRoute();
 }}))];}
function current(){return state==='playing'?selectInteraction(player.position,targets()):null;}
function updatePrompt(){const target=current();$('prompt').hidden=!target;if(target)$('prompt').textContent='[ E ] '+target.action;}
function pause(){state=state==='playing'?'paused':'playing';keys.clear();$('pause').textContent=state==='paused'?'เล่นต่อ / ESC':'พัก / ESC';updatePrompt();}
window.addEventListener('keydown',event=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code))event.preventDefault();
 if(event.code==='Escape'&&!event.repeat){pause();return;}
 if(state!=='playing')return;if(event.code==='KeyE'&&!event.repeat){current()?.activate();updatePrompt();}else keys.add(event.code);
});window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',()=>{if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
$('reset').onclick=build;$('pause').onclick=pause;
function resize(){const aspect=innerWidth/innerHeight,halfHeight=Math.max(17,30/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
window.addEventListener('resize',resize);build();resize();let last=performance.now(),lastCell=null;
renderer.setAnimationLoop(now=>{let dt=Math.min(.25,(now-last)/1000);last=now;if(state==='playing')while(dt>0){const step=Math.min(1/60,dt),dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),dz=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),length=Math.hypot(dx,dz)||1;moveCircle(player.position,dx/length*6.5*step,dz/length*6.5*step,.45,map.obstacles(),Infinity);elapsed+=step;dt-=step;}
 const cell=map.cellAt(player.position)?.id;if(cell!==lastCell){updateRoute();lastCell=cell;}updatePrompt();renderer.render(scene,camera);
});
Object.defineProperty(window,'blockMapTest',{get:()=>({state,elapsed,complete,player:{x:player.position.x,z:player.position.z},zone:map.zoneAt(player.position),interaction:current()?.id??null,collected:[...collected],doors:map.doors.map(d=>({...d})),spawns:map.spawns.map(s=>({...s,cell:[...s.cell],offset:[...s.offset]})),blocks:map.blocks.map(b=>({id:b.id,type:b.type,rotation:b.rotation})),route:route(),walkable:map.isWalkable(player.position),obstacles:map.obstacles()})});
