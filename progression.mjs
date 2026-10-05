export const STATUS = {
  powerAttack:{label:'Power Attack',detail:'พลังโจมตี +10% ต่อแต้ม'},
  attackSpeed:{label:'Attack Speed',detail:'อัตราการยิง +8% ต่อแต้ม'},
  movementSpeed:{label:'Movement Speed',detail:'ความเร็วเคลื่อนที่ +5% ต่อแต้ม'},
  gunReload:{label:'Gun Reload',detail:'ความเร็วรีโหลด +10% ต่อแต้ม'},
  criticalDamage:{label:'Critical Damage',detail:'ตัวคูณคริติคอล +20 จุดเปอร์เซ็นต์ต่อแต้ม'}
};
export function createProgression(){
  return {level:1,xp:0,points:0,maxHp:100,ranks:Object.fromEntries(Object.keys(STATUS).map(key=>[key,0]))};
}
export function xpRequired(level){return 100+(level-1)*50;}
export function gainExperience(progress,amount,hp){
  if(!Number.isFinite(amount) || amount<0)throw new Error('Invalid experience');
  progress.xp+=amount;let levels=0;
  while(progress.xp>=xpRequired(progress.level)){
    progress.xp-=xpRequired(progress.level);progress.level++;progress.maxHp+=20;progress.points+=3;levels++;
  }
  return {levels,hp:levels>0?progress.maxHp:hp};
}
export function spendPoint(progress,key){
  if(!Object.hasOwn(STATUS,key) || progress.points<1)return false;
  progress.points--;progress.ranks[key]++;return true;
}
export function combatStats(progress,wave=1){
  const r=progress.ranks,tier=Math.max(0,Math.floor((wave-1)/3));
  return {
    damage:(19+tier*6)*(1+r.powerAttack*.1),
    shotInterval:Math.max(.07,.13-tier*.009)/(1+r.attackSpeed*.08),
    movementSpeed:6.5*(1+r.movementSpeed*.05),
    reloadSeconds:1.35/(1+r.gunReload*.1),
    criticalChance:.1,criticalMultiplier:1.5+r.criticalDamage*.2
  };
}
export function rollShot(stats,random=Math.random()){
  const critical=random<stats.criticalChance;
  return {critical,damage:stats.damage*(critical?stats.criticalMultiplier:1)};
}
