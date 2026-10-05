// Provisional mix: tails change acoustics, never gameplay hearing radius.
export const AUDIO_ZONES=Object.freeze({
 OUTDOOR:{tail:.12,reflections:[[.035,.10],[.085,.04]],ambient:'rain',volume:.065},
 SMALL_ROOM:{tail:.32,reflections:[[.018,.24],[.045,.17],[.09,.10],[.16,.05]],ambient:'ventilation',volume:.035},
 LARGE_ROOM:{tail:.60,reflections:[[.035,.25],[.075,.20],[.14,.13],[.28,.07]],ambient:'electrical',volume:.04},
 UNDERGROUND:{tail:.95,reflections:[[.07,.30],[.15,.23],[.29,.16],[.48,.09]],ambient:'drone',volume:.045},
 WAREHOUSE:{tail:.75,reflections:[[.055,.27],[.11,.20],[.23,.14],[.39,.08]],ambient:'metal-wind',volume:.04}
});
export const audioZone=zone=>Object.hasOwn(AUDIO_ZONES,zone)?zone:'SMALL_ROOM';
export function reflectWeapon(samples,sampleRate,zone){
 const profile=AUDIO_ZONES[audioZone(zone)],result=new Float32Array(samples.length+Math.ceil(profile.tail*sampleRate));result.set(samples);
 for(const [delay,gain] of profile.reflections){const offset=Math.round(delay*sampleRate);let low=0;for(let i=0;i<samples.length;i++){low+=.22*(samples[i]-low);result[i+offset]+=low*gain;}}
 // Keep the transient intact and leave headroom for reflections, without hard clipping.
 for(let i=0;i<result.length;i++)result[i]=Math.max(-1,Math.min(1,result[i]));return result;
}
export function createReloadTrack(gun,duration){if(!Number.isFinite(duration)||duration<=0)throw new Error('Invalid reload duration');return {gun,duration,emitted:new Set(['reload_out'])};}
export function advanceReloadTrack(track,remaining,gun){if(gun!==track.gun)return [];const elapsed=track.duration-Math.max(0,remaining),events=[];for(const [event,fraction] of [['reload_in',.55],['reload_slide',.90]])if(elapsed>=track.duration*fraction&&!track.emitted.has(event)){track.emitted.add(event);events.push(event);}return events;}
export function seededNoise(seed=1){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
