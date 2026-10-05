export const FRAMEWORK_TEST={id:'framework-test',cellSize:6,blocks:[
 {id:'entry',type:'DOT',x:-3,z:0,environment:'entry',audioZone:'OUTDOOR',ports:[{id:'exit',cell:[0,0],side:'east'}],spawns:[{id:'player',kind:'player',cell:[0,0]}]},
 {id:'corridor',type:'LINE_2',x:-2,z:0,environment:'corridor',ports:[{id:'entry',cell:[0,0],side:'west'},{id:'hub',cell:[1,0],side:'east'}]},
 {id:'hub',type:'O',x:0,z:0,environment:'control',audioZone:'LARGE_ROOM',lighting:{color:0x90d5e6,intensity:5},ports:[{id:'entry',cell:[0,0],side:'west'},{id:'wing',cell:[1,0],side:'east'},{id:'annex',cell:[0,1],side:'south'}],spawns:[{id:'control',kind:'objective',label:'ปลดล็อกประตูฝั่งตะวันออก',cell:[0,1]}]},
 {id:'wing',type:'L',rotation:90,x:2,z:0,environment:'research',audioZone:'SMALL_ROOM',ports:[{id:'entry',cell:[0,2],side:'south'}],spawns:[{id:'exit',kind:'objective',label:'จบการสำรวจสนามทดสอบ',cell:[0,0]},{id:'runner-spawn',kind:'enemy',enemyType:'runner',cell:[1,2]}]},
 {id:'annex',type:'T',x:-1,z:2,environment:'storage',audioZone:'WAREHOUSE',ports:[{id:'entry',cell:[1,0],side:'north'}],spawns:[{id:'supply',kind:'loot',label:'เก็บกล่องทดสอบ',cell:[0,0]},{id:'walker-spawn',kind:'enemy',enemyType:'normal',cell:[1,1]}]}
],connections:[
 {id:'entry-link',from:'entry:exit',to:'corridor:entry',open:true},
 {id:'hub-door',from:'corridor:hub',to:'hub:entry'},
 {id:'east-gate',from:'hub:wing',to:'wing:entry',locked:true},
 {id:'annex-door',from:'hub:annex',to:'annex:entry'}
]};
