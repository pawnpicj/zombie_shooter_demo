import {createInventory} from './economy.mjs';
import {createProgression} from './progression.mjs';
import {WEAPONS} from './weapons.mjs';
const copy=value=>JSON.parse(JSON.stringify(value));
const integer=(value,min=0)=>Number.isSafeInteger(value)&&value>=min;
export function validateTransfer(payload){
 const p=copy(payload);if(!p||p.version!==1||!['chapter0','standalone'].includes(p.source))throw new Error('Invalid chapter transfer');
 const b=p.inventory,r=p.progression;if(!b||!r||!integer(r.level,1)||!integer(r.xp)||!integer(r.points)||!integer(r.maxHp,100)||!r.ranks||!Object.keys(createProgression().ranks).every(k=>integer(r.ranks[k])))throw new Error('Invalid progression');
 if(!Number.isFinite(p.hp)||p.hp<=0||p.hp>r.maxHp)throw new Error('Invalid HP');
 if(!Array.isArray(b.weapons)||!b.weapons.length||new Set(b.weapons).size!==b.weapons.length||!b.weapons.every(k=>Object.hasOwn(WEAPONS,k))||!b.weapons.includes(b.equipped))throw new Error('Invalid weapon ownership');
 for(const k of ['money','materials','speedPotions','shieldCells'])if(!integer(b[k]))throw new Error('Invalid inventory '+k);
 for(const k of ['shield','speedTimer','cooldown'])if(!Number.isFinite(b[k])||b[k]<0)throw new Error('Invalid inventory '+k);
 if(!b.magazines||!b.reserves||!b.upgrades||!b.loadout||!b.grenades||!b.recoil)throw new Error('Missing inventory');
 if(Object.keys(b.magazines).some(k=>!b.weapons.includes(k))||Object.keys(b.upgrades).some(k=>!Object.hasOwn(WEAPONS,k)||!integer(b.upgrades[k]))||Object.keys(b.recoil).some(k=>!Object.hasOwn(WEAPONS,k)||!Number.isFinite(b.recoil[k])||b.recoil[k]<0))throw new Error('Invalid arsenal');
 if(!['primary','secondary','sidearm'].every(k=>Object.hasOwn(b.loadout,k)))throw new Error('Incomplete loadout');
 for(const k of b.weapons)if(!integer(b.magazines[k])||b.magazines[k]>WEAPONS[k].magazineSize||!integer(b.upgrades[k]))throw new Error('Invalid magazine/upgrade');
 for(const k of Object.keys(createInventory().reserves))if(!integer(b.reserves[k]))throw new Error('Invalid reserve');
 for(const [slot,k] of Object.entries(b.loadout))if(!['primary','secondary','sidearm'].includes(slot)||(k!==null&&(!b.weapons.includes(k)||WEAPONS[k].slot!==slot)))throw new Error('Invalid loadout');
 for(const k of ['molotov','demolition','cluster'])if(!integer(b.grenades[k]))throw new Error('Invalid consumables');
 if(!['molotov','demolition','cluster'].includes(b.selectedGrenade))throw new Error('Invalid selected grenade');
 if(p.source==='chapter0'&&JSON.stringify(p.evidence)!==JSON.stringify(['security-log','formula-x','extracted']))throw new Error('Chapter 0 extraction is required');
 const clean=createInventory();for(const k of ['money','materials','weapons','equipped','magazines','reserves','loadout','upgrades','grenades','selectedGrenade','speedPotions','shieldCells','shield','speedTimer','cooldown','recoil'])clean[k]=copy(b[k]);
 return {version:1,source:p.source,inventory:copy(clean),progression:{level:r.level,xp:r.xp,points:r.points,maxHp:r.maxHp,ranks:copy(r.ranks)},hp:p.hp,evidence:p.source==='chapter0'?[...p.evidence]:[]};
}
export function createTransfer(snapshot){if(snapshot.state!=='won'||!snapshot.campaign.complete)throw new Error('Finish Chapter 0 first');return validateTransfer({version:1,source:'chapter0',inventory:snapshot.inventory,progression:snapshot.progression,hp:snapshot.hp,evidence:snapshot.campaign.evidence});}
export function standaloneTransfer(){return validateTransfer({version:1,source:'standalone',inventory:createInventory(),progression:createProgression(),hp:100,evidence:[]});}
export function hydrateTransfer(payload){const p=validateTransfer(payload),bag=createInventory();for(const k of Object.keys(p.inventory))if(k!=='reserve')bag[k]=copy(p.inventory[k]);return {bag,progression:p.progression,hp:p.hp};}
const storageKey='dead-zone-chapter1-entry';
export async function storeTransfer(payload){const p=validateTransfer(payload);if(window.deadZoneWindow?.storeChapter)await window.deadZoneWindow.storeChapter(p);else sessionStorage.setItem(storageKey,JSON.stringify(p));}
export async function readTransfer(){const p=window.deadZoneWindow?.readChapter?await window.deadZoneWindow.readChapter():JSON.parse(sessionStorage.getItem(storageKey)||'null');return p?validateTransfer(p):null;}
export async function clearTransfer(){if(window.deadZoneWindow?.clearChapter)await window.deadZoneWindow.clearChapter();sessionStorage.removeItem(storageKey);}
