import * as THREE from 'three';
import {BLOCKS,rotatedCells} from './block-map.mjs';
import {SCREENING_CENTER,SCREENING_ROOMS} from './maps/screening-center.mjs';
// Visual geometry is code-native; the block configuration owns all placements.
export function buildScreeningScene(scene,map){
 const root=new THREE.Group();scene.add(root);const cube=new THREE.BoxGeometry(1,1,1),colliders=[],gateMeshes=[];
 function box(color,x,y,z,w,h,d,opacity=1){const m=new THREE.Mesh(cube,new THREE.MeshStandardMaterial({color,roughness:.58,metalness:.16,transparent:opacity<1,opacity}));m.position.set(x,y,z);m.scale.set(w,h,d);root.add(m);return m;}
 function label(text,x,z,color='#b9d5df',size=2.5){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(8,20,29,.82)';ctx.fillRect(0,0,768,96);ctx.font='bold 42px Arial';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text.toUpperCase(),384,63);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));sprite.position.set(x,2.5,z);sprite.scale.set(size*3,size*.375,1);root.add(sprite);}
 for(const block of map.blocks){
  for(const cell of block.cells){box(SCREENING_ROOMS[block.id].color,cell.x*6,-.13,cell.z*6,5.96,.24,5.96);if(block.audioZone==='OUTDOOR')box(0x77958f,cell.x*6-.7,.003,cell.z*6,.1,.01,1.2);}
  const first=block.cells[0];label(SCREENING_ROOMS[block.id].name,first.x*6,first.z*6-1.3);
  const light=new THREE.PointLight(block.lighting.color,block.lighting.intensity,13,1.5);light.position.set(first.x*6,3,first.z*6);root.add(light);
 }
 for(const wall of map.obstacles().filter(o=>!o.doorId))box(0x556773,wall.x,.9,wall.z,wall.w,1.8,wall.d);
 const doorMeshes=new Map();for(const door of map.doors){const mesh=box(0x93b9a2,door.x,.9,door.z,door.vertical?.28:map.doorWidth,1.8,door.vertical?map.doorWidth:.28);mesh.visible=!door.open;doorMeshes.set(door.id,mesh);}
 for(const block of SCREENING_CENTER.blocks){const rotated=rotatedCells(block.type,block.rotation??0);for(const prop of block.props??[]){const index=BLOCKS[block.type].findIndex(c=>c[0]===prop.cell[0]&&c[1]===prop.cell[1]),cell=rotated[index],x=(block.x+cell[0])*6+prop.offset[0],z=(block.z+cell[1])*6+prop.offset[1];
  const solid=(w,d)=>colliders.push({x,z,w,d,prop:prop.kind});
  if(['car','ambulance','bus'].includes(prop.kind)){const bus=prop.kind==='bus',ambulance=prop.kind==='ambulance',w=1.25,d=bus?4.7:3.6;box(ambulance?0xc6d8d2:bus?0xa89965:0x697784,x,.65,z,w,1.1,d);box(0x253846,x,1.3,z,w*.9,.5,d*.57);for(const dz of [-d*.3,d*.3])for(const dx of [-w*.5,w*.5])box(0x131f27,x+dx,.3,z+dz,.22,.45,.5);if(ambulance){box(0xb05152,x,1.62,z,.9,.12,.25);box(0x7c3038,x+w*.51,.85,z,.02,.25,.7);}solid(w,d);}
  else if(prop.kind==='bed'){box(0xa0bcba,x,.55,z,1.05,.35,2.1);box(0xcbd7ca,x,.8,z-.65,.8,.18,.55);solid(1.05,2.1);}
  else if(prop.kind==='desk'||prop.kind==='medical'){box(0x6a7f7b,x,.65,z,1.2,1.1,1.4);box(0x274253,x,1.36,z,.7,.3,.25);solid(1.2,1.4);}
  else if(prop.kind==='cabinet'){box(0x394b58,x,1,z,.8,2,1.5);box(0xb59f70,x,1.1,z+.77,.15,.15,.03);solid(.8,1.5);}
  else if(prop.kind==='chairs'){for(const shift of [-.65,.65]){box(0x738a8d,x+shift,.45,z,.55,.1,.55);box(0x738a8d,x+shift,.7,z+.25,.55,.6,.12);}solid(1.9,.7);}
  else if(prop.kind==='bags'){box(0x8b745b,x,.25,z,.45,.5,.7);box(0x506577,x+.4,.16,z+.4,.35,.32,.5);solid(1,.95);}
  else if(prop.kind==='barrier'){box(0xd2b06c,x,.55,z,.7,1.1,1.6);solid(.7,1.6);}
  else if(prop.kind==='blood'){box(0x592e3a,x,.015,z,.75,.018,1.5);}
  else if(prop.kind==='glass'){box(0x95c8d3,x,1,z,.08,1.6,1.3,.35);solid(.1,1.3);}
  else if(prop.kind==='tent'){for(const dx of [-2.3,2.3])for(const dz of [-2.3,2.3])box(0x9dafb6,x+dx,1.25,z+dz,.08,2.5,.08);box(0xa0b7ae,x,2.6,z,4.6,.08,4.6,.22);}
  else if(prop.kind==='gate'){gateMeshes.push(box(0x81949d,x,1.5,z,5.7,3,.22));label('DOGE CITY · GATE LOCKED',x,z,'#e7ba7d',2);gateMeshes.push(root.children.at(-1));solid(5.7,.22);}
 }}
 const markers=new Map();for(const spawn of map.spawns.filter(s=>s.kind==='objective'||s.kind==='loot')){const m=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.08,16),new THREE.MeshStandardMaterial({color:0xe2c785,emissive:0x69572c}));m.position.set(spawn.x,.08,spawn.z);root.add(m);markers.set(spawn.id,m);}
 return {root,colliders,doorMeshes,markers,gateMeshes};
}
