export const CHAPTER_ONE_MISSIONS=[
 {name:'SILENT CHECKPOINT',objective:'ตรวจบันทึกสถานะที่ Screening Area',point:'screening-record'},
 {name:'ISOLATION WARD',objective:'ตรวจห้องสังเกตอาการใน Isolation Ward',point:'observation'},
 {name:'LOCKDOWN',objective:'เข้าถึงระบบควบคุม',point:'control-status'},
 {name:'THE LAST BUS',objective:'ตรวจรถบัสอพยพ',point:'bus-manifest'},
 {name:'ENTER DOGE CITY',objective:'เดินผ่านประตูเข้าสู่เมือง',point:'city-gate'}
];
export function createChapterOne(){return {mission:0,phase:'objective',evidence:[],complete:false,gateOpen:false,encounterStarted:false,spawned:0,kills:0,optionalOpened:false,optionalComplete:false};}
export function interactChapterOne(progress,id){
 if(progress.complete||progress.phase!=='objective')return false;
 if(progress.mission===0&&id==='screening-record'){progress.evidence.push('screening-failure');progress.mission=1;return true;}
 if(progress.mission===1&&id==='observation'){progress.evidence.push('patient-34');progress.mission=2;return true;}
 if(progress.mission===2&&id==='control-status'){
  if(!progress.encounterStarted){progress.encounterStarted=true;progress.phase='blackout';return true;}
  progress.evidence.push('black-7');progress.mission=3;return true;
 }
 if(progress.mission===3&&id==='bus-manifest'){progress.evidence.push('evacuation-abandoned');progress.mission=4;return true;}
 return false;
}
export function clearLockdown(progress,alive){if(progress.mission!==2||progress.phase!=='combat'||progress.spawned!==18||alive!==0)return false;progress.phase='objective';return true;}
export function openCityGate(progress){if(progress.mission!==4||progress.complete)return false;progress.gateOpen=true;return true;}
export function crossCityGate(progress,position){if(!progress.gateOpen||progress.complete||position.z<112||Math.abs(position.x-12)>1)return false;progress.complete=true;progress.phase='complete';progress.evidence.push('entered-doge-city');return true;}
