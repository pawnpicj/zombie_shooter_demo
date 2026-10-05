import {SCREENING_CENTER} from './screening-center.mjs';
// One threshold cell proves physical entry; the city itself belongs to a later chapter.
export function chapterOneMap(){const map=structuredClone(SCREENING_CENTER),gate=map.blocks.find(b=>b.id==='gate');gate.ports.push({id:'city',cell:[1,0],side:'east'});map.blocks.push({id:'city',type:'DOT',x:2,z:19,environment:'city-threshold',audioZone:'OUTDOOR',ports:[{id:'gate',cell:[0,0],side:'north'}],lighting:{color:0xe59a69,intensity:3}});map.connections.push({id:'city-threshold',from:'gate:city',to:'city:gate',locked:true});return map;}
