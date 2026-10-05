import * as THREE from 'three';
import {WEAPONS,GRENADES,createInventory,rewardKill,upgradeCost,upgradeWeapon,buyGrenade,lootBox,collectLabWeapon,weaponStats,useSpeed,useShield,absorbDamage,takeReload,useGrenade} from './economy.mjs';
const $=id=>document.getElementById(id);
export function initSupplies(api){
  let bag=createInventory(),returnState='playing',throwCooldown=0;
  const crates=[],effects=[];
  const shieldAura=new THREE.Mesh(new THREE.SphereGeometry(1.1,16,12),new THREE.MeshBasicMaterial({color:0x71dcff,transparent:true,opacity:.17,depthWrite:false}));shieldAura.position.y=1.1;shieldAura.visible=false;api.player.add(shieldAura);
  const names={materials:'วัสดุ',random:'กล่องสุ่ม',ammo:'กระสุน',speed:'ยาวิ่ง',shield:'โล่พลังงาน'};
  function label(text,color){
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=64;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#07151bdf';ctx.fillRect(0,0,320,64);
    ctx.font='bold 22px Tahoma';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,160,40);
    const texture=new THREE.CanvasTexture(canvas),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));
    sprite.position.y=1.9;sprite.scale.set(4.5,.9,1);return sprite;
  }
  function addCrate(kind,x,z,weapon=null,dropped=false){
    const g=new THREE.Group();g.position.set(x,0,z);
    const color=weapon?WEAPONS[weapon].color:kind==='materials'?0xe4ba72:kind==='ammo'?0x7ec792:0x87cde1;
    api.mesh('cube',0x233d48,[0,.4,0],[1.05,.8,.8],g);
    api.mesh('cube',color,[0,.82,0],[1.08,.08,.85],g,true);
    api.mesh('cube',color,[0,.43,-.42],[.13,.5,.04],g,true);
    g.add(label(weapon?WEAPONS[weapon].name:names[kind],'#c8ebdf'));api.scene.add(g);
    crates.push({mesh:g,kind,weapon,active:true,cooldown:0,dropped});
  }
  function removeCrate(c){
    api.scene.remove(c.mesh);c.mesh.traverse(obj=>{if(obj.isSprite){obj.material.map.dispose();obj.material.dispose();}});
  }
  function clearEffects(){
    for(const effect of effects){api.scene.remove(effect.mesh);if(effect.ring){effect.mesh.geometry.dispose();effect.mesh.material.dispose();}}
    effects.length=0;
  }
  function restock(){
    for(let i=crates.length-1;i>=0;i--){if(crates[i].dropped){removeCrate(crates[i]);crates.splice(i,1);}}
    for(const c of crates){c.active=!c.weapon||!bag.weapons.includes(c.weapon);c.cooldown=c.active?0:Infinity;c.mesh.visible=c.active;}
  }
  function reset(){
    bag=createInventory();throwCooldown=0;clearEffects();restock();$('shopOverlay').hidden=true;
  }
  for(const [kind,x,z] of [['materials',-5,18],['random',5,18],['ammo',0,14],['materials',-18,10],['materials',18,10],['random',-18,-8],['random',18,-8],['ammo',0,-10]])addCrate(kind,x,z);
  for(const [weapon,x,z] of [['smg',-18,0],['shotgun',18,0],['marksman',0,-18]])addCrate('weapon',x,z,weapon);
  function interactionTargets(){return crates.map((c,index)=>({id:'crate-'+index,action:c.weapon?'เก็บ '+WEAPONS[c.weapon].name:'เปิด '+names[c.kind],position:c.mesh.position,distance:2.2,available:c.active,activate:()=>collectCrate(c)}));}
  function collectCrate(c){
    if(api.getState()!=='playing'||!c.active||Math.hypot(c.mesh.position.x-api.player.position.x,c.mesh.position.z-api.player.position.z)>=2.2)return false;
    if(c.weapon){
      collectLabWeapon(bag,c.weapon);bag.equipped=c.weapon;api.cancelReload();api.notice('LAB WEAPON / '+WEAPONS[c.weapon].name);
    }else{
      const reward=lootBox(bag,c.kind);api.notice('+'+reward.amount+' / '+names[reward.kind]);
    }
    c.active=false;c.mesh.visible=false;c.cooldown=c.kind==='ammo'?25:Infinity;
    api.tone(850,.12,.04,'sine');updateHud();return true;
  }
  function renderShop(){
    $('shopBalance').textContent='$ '+bag.money+' · วัสดุ '+bag.materials;
    $('weaponRows').replaceChildren();
    for(const key of bag.weapons){
      const gun=WEAPONS[key],cost=upgradeCost(bag,key),row=document.createElement('div');row.className='shop-row';
      row.innerHTML='<div><b>'+gun.name+' <small>Level '+(bag.upgrades[key]+1)+'</small></b><p>พลังโจมตี +15% ต่อ Level · $ '+cost.money+' + '+cost.materials+' วัสดุ</p></div><div class="shop-actions"><button class="equip"></button><button class="upgrade">อัปเกรด</button></div>';
      const equip=row.querySelector('.equip');equip.textContent=bag.equipped===key?'ใช้อยู่':'ใช้ปืนนี้';equip.disabled=bag.equipped===key;
      equip.onclick=()=>{bag.equipped=key;api.cancelReload();renderShop();updateHud();};
      const upgrade=row.querySelector('.upgrade');upgrade.disabled=bag.money<cost.money||bag.materials<cost.materials;
      upgrade.onclick=()=>{if(upgradeWeapon(bag,key)){api.tone(700,.08,.04,'sine');renderShop();updateHud();}};
      $('weaponRows').appendChild(row);
    }
    $('grenadeRows').replaceChildren();
    for(const [key,g] of Object.entries(GRENADES)){
      const row=document.createElement('div');row.className='shop-row';
      row.innerHTML='<div><b>'+g.name+' <small>มี '+bag.grenades[key]+'</small></b><p>'+g.description+' · $ '+g.price+'</p></div><button>ซื้อ +1</button>';
      row.querySelector('button').disabled=bag.money<g.price;
      row.querySelector('button').onclick=()=>{if(buyGrenade(bag,key)){bag.selectedGrenade=key;api.tone(700,.08,.04,'sine');renderShop();updateHud();}};
      $('grenadeRows').appendChild(row);
    }
  }
  function openShop(){
    if(!['playing','paused'].includes(api.getState()))return;
    returnState=api.getState();api.freeze('shop');$('shopOverlay').hidden=false;renderShop();$('closeShop').focus();
  }
  function closeShop(){
    if(api.getState()!=='shop')return;
    $('shopOverlay').hidden=true;api.restore(returnState);
  }
  $('openShop').onclick=openShop;$('closeShop').onclick=closeShop;
  function cycleGrenade(){const keys=Object.keys(GRENADES);bag.selectedGrenade=keys[(keys.indexOf(bag.selectedGrenade)+1)%keys.length];updateHud();}
  function cycleWeapon(){if(bag.weapons.length<2)return;bag.equipped=bag.weapons[(bag.weapons.indexOf(bag.equipped)+1)%bag.weapons.length];api.cancelReload();api.notice(WEAPONS[bag.equipped].name);}
  function ring(x,z,radius,color,duration,kind,damage=0){
    const mesh=new THREE.Mesh(new THREE.RingGeometry(.1,radius,36),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));
    mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.08,z);api.scene.add(mesh);
    effects.push({mesh,ring:true,kind,life:duration,total:duration,radius,damage,tick:0});
  }
  function blast(x,z,radius,damage,color){
    api.harmZombies(x,z,radius,damage);api.burst(new THREE.Vector3(x,0,z),color,24);ring(x,z,radius,color,.5,'flash');api.tone(75,.3,.08,'triangle');
  }
  function detonate(key,x,z){
    if(key==='molotov'){ring(x,z,3.2,0xff742d,6,'fire',40);api.notice('MOLOTOV / BURNING');}
    else if(key==='demolition')blast(x,z,5,220,0xffd66f);
    else{
      blast(x,z,3,120,0xff92b5);
      for(let i=0;i<6;i++){
        const angle=i*Math.PI/3,mesh=api.mesh('sphere',0xff92b5,[x,.35,z],[.18,.18,.18],api.scene,true);
        effects.push({mesh,kind:'fragment',life:.35+i*.045,x:Math.max(-22,Math.min(22,x+Math.cos(angle)*3.8)),z:Math.max(-22,Math.min(22,z+Math.sin(angle)*3.8))});
      }
    }
  }
  function throwGrenade(){
    if(api.getState()!=='playing'||throwCooldown>0)return;
    const key=useGrenade(bag);if(!key){api.notice('ระเบิดหมด / ซื้อที่ร้าน [B]');return;}
    const from=api.player.position.clone(),target=api.getAim().clone(),delta=target.sub(from);delta.y=0;
    if(delta.length()>14)delta.setLength(14);
    const mesh=api.mesh('sphere',GRENADES[key].color,[from.x,1.3,from.z],[.2,.2,.2],api.scene,true);
    effects.push({mesh,kind:'throw',life:.7,total:.7,key,from,to:from.clone().add(delta)});
    throwCooldown=.9;updateHud();
  }
  function updateHud(){
    $('moneyValue').textContent='$ '+bag.money;$('materialValue').textContent='วัสดุ '+bag.materials;
    $('reserveAmmo').textContent=bag.reserve;shieldAura.visible=bag.shield>0;
    $('itemCounts').textContent='ยาวิ่ง '+bag.speedPotions+' [V] · โล่ '+bag.shieldCells+' [C]'+(bag.shield>0?' · Shield '+Math.ceil(bag.shield):'')+(bag.speedTimer>0?' · วิ่ง '+Math.ceil(bag.speedTimer)+'s':'');
    const grenade=GRENADES[bag.selectedGrenade];$('grenadeCounts').textContent=grenade.name+' ×'+bag.grenades[bag.selectedGrenade]+' · Q เปลี่ยน / G ขว้าง';
    $('openShop').disabled=!['playing','paused'].includes(api.getState());
    // The shared interaction selector in game.js owns both E prompts.
  }
  function tick(dt){
    bag.speedTimer=Math.max(0,bag.speedTimer-dt);throwCooldown=Math.max(0,throwCooldown-dt);
    for(const c of crates){if(!c.active&&Number.isFinite(c.cooldown)){c.cooldown-=dt;if(c.cooldown<=0){c.active=true;c.mesh.visible=true;}}}
    for(let i=effects.length-1;i>=0;i--){
      const effect=effects[i];effect.life-=dt;
      if(effect.kind==='throw'){
        const t=Math.min(1,1-effect.life/effect.total);effect.mesh.position.lerpVectors(effect.from,effect.to,t);effect.mesh.position.y=1.3+Math.sin(t*Math.PI)*4;
      }else if(effect.kind==='fragment'){
        effect.mesh.position.x+=(effect.x-effect.mesh.position.x)*Math.min(1,dt*15);effect.mesh.position.z+=(effect.z-effect.mesh.position.z)*Math.min(1,dt*15);
      }else if(effect.kind==='fire'){
        effect.tick-=dt;if(effect.tick<=0){api.harmZombies(effect.mesh.position.x,effect.mesh.position.z,effect.radius,effect.damage*.2);api.burst(effect.mesh.position,0xff873e,2);effect.tick=.2;}
        effect.mesh.material.opacity=.4+Math.sin(effect.life*12)*.1;
      }else if(effect.kind==='flash')effect.mesh.material.opacity=Math.max(0,effect.life/effect.total*.6);
      if(effect.life<=0){
        api.scene.remove(effect.mesh);if(effect.ring){effect.mesh.geometry.dispose();effect.mesh.material.dispose();}
        effects.splice(i,1);
        if(effect.kind==='throw')detonate(effect.key,effect.to.x,effect.to.z);
        if(effect.kind==='fragment')blast(effect.x,effect.z,2,100,0xff92b5);
      }
    }
  }
  window.addEventListener('blur',()=>{if(api.getState()==='shop')returnState='paused';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&api.getState()==='shop')returnState='paused';});
  return {reset,restock,interactionTargets,updateHud,tick,openShop,closeShop,
    key(code){if(code==='KeyB'){api.getState()==='shop'?closeShop():openShop();return true;}if(code==='Escape'&&api.getState()==='shop'){closeShop();return true;}
      if(api.getState()!=='playing')return false;
      if(code==='KeyG')throwGrenade();else if(code==='KeyQ')cycleGrenade();else if(code==='KeyF')cycleWeapon();
      else if(code==='KeyV'){if(useSpeed(bag))api.notice('SPRINT / +35% / 12s');else api.notice('ไม่มียาวิ่ง หรือยากำลังทำงาน');}
      else if(code==='KeyC'){if(useShield(bag))api.notice('SHIELD / '+bag.shield);else api.notice('ไม่มีโล่สำรอง หรือโล่เต็ม');}
      else return false;updateHud();return true;},
    reward(type){return rewardKill(bag,type);},
    drop(position){if(Math.random()<.16)addCrate('random',position.x,position.z,null,true);},
    modifyStats(base){return weaponStats(base,bag);},
    absorbDamage(damage){return absorbDamage(bag,damage);},
    reload(missing){return takeReload(bag,missing);},
    canReload(){return bag.reserve>0;},
    weaponLabel(){return WEAPONS[bag.equipped].name+' / LEVEL '+(bag.upgrades[bag.equipped]+1);},
    snapshot(){return {...bag,weapons:[...bag.weapons],upgrades:{...bag.upgrades},grenades:{...bag.grenades},crates:crates.filter(c=>c.active).map(c=>({kind:c.kind,weapon:c.weapon,x:c.mesh.position.x,z:c.mesh.position.z})),effects:effects.map(e=>({kind:e.kind,life:e.life,x:e.mesh.position.x,z:e.mesh.position.z}))};}
  };
}
