// Walk a safe cross-shaped route in the existing Lab when no enemy is aware.
// Tests still use actual keyboard/mouse input; this never mutates game state.
import {hasLineOfSight} from '../enemies.mjs';
export function idleSearchWaypoint(snapshot){
  if(!snapshot.enemies?.length||!snapshot.enemies.every(e=>e.state==='idle'))return null;
  const target=[...snapshot.enemies].sort((a,b)=>Math.hypot(a.x-snapshot.player.x,a.z-snapshot.player.z)-Math.hypot(b.x-snapshot.player.x,b.z-snapshot.player.z))[0];
  const destination=Math.abs(target.x)>Math.abs(target.z)?{x:Math.sign(target.x)*14,z:0}:{x:0,z:Math.sign(target.z)*14};
  if((destination.x===0&&Math.abs(snapshot.player.x)>1)||(destination.z===0&&Math.abs(snapshot.player.z)>1))return {x:0,z:0};
  return destination;
}
// A test-only bot approaches an enemy to verify contact damage/death. Waiting
// motionless behind cover is no longer a reliable death precondition after Phase 4.
export function enemyApproachWaypoint(snapshot){
 return navigationWaypoint(snapshot,snapshot.enemies??[],1.1)??idleSearchWaypoint(snapshot);
}
export function navigationWaypoint(snapshot,goals,distance=1.1){
 if(!goals.length)return null;
 const obstacles=snapshot.core.obstacles.map(o=>({...o,w:o.w+.86,d:o.d+.86}));
 const nodes=[];for(let x=-22;x<=22;x+=2)for(let z=-22;z<=22;z+=2)if(hasLineOfSight({x,z},{x:x+.001,z:z+.001},obstacles))nodes.push({x,z});
 const source=[...nodes].filter(n=>hasLineOfSight(snapshot.player,n,obstacles)).sort((a,b)=>Math.hypot(a.x-snapshot.player.x,a.z-snapshot.player.z)-Math.hypot(b.x-snapshot.player.x,b.z-snapshot.player.z))[0];
 if(!source)return null;
 const key=p=>p.x+','+p.z,grid=new Map(nodes.map(n=>[key(n),n])),queue=[source],parents=new Map([[key(source),null]]);
 for(let i=0;i<queue.length;i++){
  const current=queue[i];
  if(goals.some(e=>Math.hypot(e.x-current.x,e.z-current.z)<distance&&hasLineOfSight(current,e,snapshot.core.obstacles))){
   const path=[];for(let id=key(current);id!==null;id=parents.get(id))path.push(grid.get(id));path.reverse();
   return path.find(n=>Math.hypot(n.x-snapshot.player.x,n.z-snapshot.player.z)>.5)??current;
  }
  for(const [dx,dz] of [[2,0],[-2,0],[0,2],[0,-2]]){const next=grid.get(key({x:current.x+dx,z:current.z+dz}));if(next&&!parents.has(key(next))&&hasLineOfSight(current,next,obstacles)){parents.set(key(next),key(current));queue.push(next);}}
 }
 return null;
}
