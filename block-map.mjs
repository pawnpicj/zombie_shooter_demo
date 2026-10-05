const shapes={DOT:[[0,0]],LINE_2:[[0,0],[1,0]],LINE_3:[[0,0],[1,0],[2,0]],LINE_5:[[0,0],[1,0],[2,0],[3,0],[4,0]],
 I:[[0,0],[1,0],[2,0],[3,0]],O:[[0,0],[1,0],[0,1],[1,1]],T:[[0,0],[1,0],[2,0],[1,1]],
 L:[[0,0],[0,1],[0,2],[1,2]],J:[[1,0],[1,1],[0,2],[1,2]],S:[[1,0],[2,0],[0,1],[1,1]],Z:[[0,0],[1,0],[1,1],[2,1]]};
export const BLOCKS=Object.freeze(Object.fromEntries(Object.entries(shapes).map(([key,cells])=>[key,Object.freeze(cells.map(cell=>Object.freeze(cell)))])));
const directions=['north','east','south','west'],vectors=[[0,-1],[1,0],[0,1],[-1,0]];
const key=(x,z)=>`${x},${z}`;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
function transform(type,rotation=0){
 assert(Object.hasOwn(BLOCKS,type),'Unknown block type: '+type);
 assert([0,90,180,270].includes(rotation),'Rotation must be 0, 90, 180 or 270');
 const turn=rotation/90,rotate=([x,z])=>{for(let i=0;i<turn;i++)[x,z]=[-z,x];return [x,z];};
 const cells=BLOCKS[type].map(rotate),minX=Math.min(...cells.map(c=>c[0])),minZ=Math.min(...cells.map(c=>c[1]));
 return {turn,point:point=>{const [x,z]=rotate(point);return [x-minX,z-minZ];}};
}
export function rotatedCells(type,rotation=0){const t=transform(type,rotation);return BLOCKS[type].map(t.point);}
export function compileMap(config){
 const size=config.cellSize??6,thickness=config.wallThickness??.28,gap=config.doorWidth??2.4;
 assert(Number.isFinite(size)&&size>2,'Invalid cell size');
 assert(Number.isFinite(thickness)&&thickness>0&&thickness<size/2,'Invalid wall thickness');
 assert(Number.isFinite(gap)&&gap>1&&gap<size-thickness,'Invalid door width');
 assert(Array.isArray(config.blocks)&&config.blocks.length>0,'Map needs blocks');
 const cells=new Map(),blocks=[],ports=new Map(),spawns=[],spawnIds=new Set(),blockIds=new Set(),portFaces=new Set();
 for(const data of config.blocks){
  assert(typeof data.id==='string'&&data.id.length>0&&!blockIds.has(data.id),'Duplicate/invalid block ID');blockIds.add(data.id);
  assert(Number.isInteger(data.x)&&Number.isInteger(data.z),'Block placement must use integer grid coordinates');
  const rotation=data.rotation??0,t=transform(data.type,rotation),footprint=rotatedCells(data.type,rotation);
  const block={id:data.id,type:data.type,rotation,x:data.x,z:data.z,environment:data.environment??'laboratory',audioZone:data.audioZone??'SMALL_ROOM',lighting:{color:0x9cdacb,intensity:3,...data.lighting},cells:[]};
  assert(Number.isFinite(block.lighting.intensity)&&block.lighting.intensity>=0,'Invalid lighting');
  for(const [lx,lz] of footprint){const x=data.x+lx,z=data.z+lz,id=key(x,z);assert(!cells.has(id),'Overlapping block at '+id);const cell={id,x,z,blockId:block.id};cells.set(id,cell);block.cells.push(cell);}
  for(const port of data.ports??[]){
   assert(typeof port.id==='string'&&port.id.length>0,'Invalid port ID');const id=block.id+':'+port.id;assert(!ports.has(id),'Duplicate port ID');
   assert(BLOCKS[data.type].some(c=>c[0]===port.cell?.[0]&&c[1]===port.cell?.[1]),'Port outside block');
   const side=directions.indexOf(port.side);assert(side>=0,'Invalid port side');
   const [lx,lz]=t.point(port.cell),index=(side+t.turn)%4,[dx,dz]=vectors[index],x=data.x+lx,z=data.z+lz;
   assert(!footprint.some(c=>c[0]===lx+dx&&c[1]===lz+dz),'Port must lie on block boundary');
   const face=key(x,z)+':'+index;assert(!portFaces.has(face),'Duplicate port boundary');portFaces.add(face);
   ports.set(id,{id,blockId:block.id,cell:key(x,z),x,z,side:directions[index],direction:index});
  }
  for(const spawn of data.spawns??[]){
   assert(typeof spawn.id==='string'&&spawn.id.length>0&&!spawnIds.has(spawn.id),'Duplicate/invalid spawn ID');spawnIds.add(spawn.id);
   assert(['player','enemy','loot','objective'].includes(spawn.kind),'Invalid spawn kind');
   assert(BLOCKS[data.type].some(c=>c[0]===spawn.cell?.[0]&&c[1]===spawn.cell?.[1]),'Spawn outside block');
   const offset=spawn.offset??[0,0];assert(offset.length===2&&offset.every(v=>Number.isFinite(v)&&Math.abs(v)<.35),'Invalid spawn offset');
   const [lx,lz]=t.point([spawn.cell[0]+offset[0],spawn.cell[1]+offset[1]]);
   spawns.push({...spawn,cell:[...spawn.cell],offset:[...offset],blockId:block.id,x:(data.x+lx)*size,z:(data.z+lz)*size});
  }
  blocks.push(block);
 }
 const doors=[],usedPorts=new Set(),edges=new Map();
 for(const connection of config.connections??[]){
  assert(typeof connection.id==='string'&&connection.id.length>0&&!doors.some(d=>d.id===connection.id),'Duplicate/invalid door ID');
  const a=ports.get(connection.from),b=ports.get(connection.to);assert(a&&b,'Unknown connection port');
  assert(a.blockId!==b.blockId,'Connections must join different blocks');
  assert(!usedPorts.has(a.id)&&!usedPorts.has(b.id),'Port already connected');
  const [dx,dz]=vectors[a.direction];assert(a.x+dx===b.x&&a.z+dz===b.z&&(a.direction+2)%4===b.direction,'Ports must be adjacent and face each other');
  usedPorts.add(a.id);usedPorts.add(b.id);
  const door={id:connection.id,a:a.cell,b:b.cell,x:(a.x+b.x)*size/2,z:(a.z+b.z)*size/2,vertical:dx!==0,locked:Boolean(connection.locked),open:Boolean(connection.open)&&!connection.locked};
  doors.push(door);edges.set([a.cell,b.cell].sort().join('|'),door);
 }
 const walls=[],seen=new Set();
 for(const cell of cells.values())for(let i=0;i<4;i++){
  const [dx,dz]=vectors[i],neighbor=cells.get(key(cell.x+dx,cell.z+dz));if(neighbor?.blockId===cell.blockId)continue;
  const edge=[cell.id,key(cell.x+dx,cell.z+dz)].sort().join('|');if(seen.has(edge))continue;seen.add(edge);
  const x=(cell.x+dx*.5)*size,z=(cell.z+dz*.5)*size,vertical=dx!==0,door=edges.get(edge);
  const rectangle=(center,length)=>vertical?{x,z:center,w:thickness,d:length}:{x:center,z,w:length,d:thickness};
  if(door){const length=(size-gap)/2;walls.push(rectangle((vertical?z:x)-(gap+length)/2,length),rectangle((vertical?z:x)+(gap+length)/2,length));}
  else walls.push(rectangle(vertical?z:x,size+thickness));
 }
 const bounds={minX:Math.min(...[...cells.values()].map(c=>c.x))*size-size/2,maxX:Math.max(...[...cells.values()].map(c=>c.x))*size+size/2,minZ:Math.min(...[...cells.values()].map(c=>c.z))*size-size/2,maxZ:Math.max(...[...cells.values()].map(c=>c.z))*size+size/2};
 const cellAt=point=>cells.get(key(Math.floor(point.x/size+.5),Math.floor(point.z/size+.5)))??null;
 function neighbors(cell,allowClosed=false,radius=.45){return vectors.map(([dx,dz])=>cells.get(key(cell.x+dx,cell.z+dz))).filter(next=>{
  if(!next)return false;if(next.blockId===cell.blockId)return true;const door=edges.get([cell.id,next.id].sort().join('|'));return Boolean(door&&gap>radius*2&&(door.open||allowClosed&&!door.locked));
 });}
 function findPath(from,to,{allowClosed=false,radius=.45}={}){
  assert(Number.isFinite(radius)&&radius>=0,'Invalid navigation radius');if(radius>=size/2-thickness/2)return null;
  const start=cellAt(from),end=cellAt(to);if(!start||!end)return null;
  const queue=[start],previous=new Map([[start.id,null]]);
  for(let i=0;i<queue.length&&!previous.has(end.id);i++)for(const next of neighbors(queue[i],allowClosed,radius))if(!previous.has(next.id)){previous.set(next.id,queue[i].id);queue.push(next);}
  if(!previous.has(end.id))return null;const route=[];for(let id=end.id;id!==null;id=previous.get(id)){const cell=cells.get(id);route.push({x:cell.x*size,z:cell.z*size,cell:id});}return route.reverse();
 }
 const obstacles=()=>[...walls.map(w=>({...w})),...doors.filter(d=>!d.open).map(d=>({x:d.x,z:d.z,w:d.vertical?thickness:gap,d:d.vertical?gap:thickness,doorId:d.id}))];
 return {id:config.id??'map',cellSize:size,doorWidth:gap,blocks,doors,spawns,bounds,cellAt,findPath,
  zoneAt(point){const cell=cellAt(point);if(!cell)return null;const block=blocks.find(b=>b.id===cell.blockId);return {blockId:block.id,environment:block.environment,audioZone:block.audioZone,lighting:{...block.lighting}};},
  obstacles,
  isWalkable(point,radius=.45){if(!cellAt(point)||!Number.isFinite(radius)||radius<0)return false;return !obstacles().some(o=>Math.hypot(point.x-Math.max(o.x-o.w/2,Math.min(point.x,o.x+o.w/2)),point.z-Math.max(o.z-o.d/2,Math.min(point.z,o.z+o.d/2)))<radius-1e-8);},
  setDoorOpen(id,open){const door=doors.find(d=>d.id===id);if(!door||open&&door.locked)return false;door.open=Boolean(open);return true;},
  unlockDoor(id){const door=doors.find(d=>d.id===id);if(!door)return false;door.locked=false;return true;}
 };
}
