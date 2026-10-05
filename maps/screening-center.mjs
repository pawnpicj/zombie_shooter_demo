// Phase 7 geography. Mission triggers, combat and weapon rewards belong to later phases.
const port=(id,cell,side)=>({id,cell,side});
const point=(id,cell,label,note)=>({id,cell,kind:'objective',label,note});
const prop=(kind,cell,offset=[0,0])=>({kind,cell,offset});
export const SCREENING_ROOMS={
 city:{name:'Doge City · Threshold',description:'อาคารมืดและแสงไฟจากเพลิงไหม้อยู่ถัดไป สัญญาณผู้รอดชีวิตยังดังจากเมือง',color:0x343a3e},
 highway:{name:'Highway Entrance',description:'รถถูกทิ้งไว้กลางด่าน ถนนยังเปียกจากฝน ไม่มีเจ้าหน้าที่รับสาย',color:0x263b43},
 waiting:{name:'Waiting Area',description:'กระเป๋าและเก้าอี้ว่างยังอยู่ใต้เต็นท์ ผู้โดยสารจากไปอย่างรีบร้อน',color:0x435351},
 screening:{name:'Screening Area',description:'จุดคัดกรองหยุดทำงาน ทางซ้ายเป็นฝ่ายรักษาความปลอดภัย ทางขวาเป็นปีกแพทย์',color:0x345666},
 security:{name:'Security Office',description:'โต๊ะยามว่างเปล่า ห้องเก็บอาวุธอยู่ข้างทางเดิน Security',color:0x464a58},
 medical:{name:'Medical Wing',description:'รถพยาบาลและเตียงเคลื่อนย้ายถูกทิ้งไว้ ไฟฉุกเฉินยังติดอยู่',color:0x3e5a59},
 quarantine:{name:'Quarantine Area',description:'ทางเดินหักมุมและรอยเลือดนำไปยังห้องควบคุม',color:0x514046},
 isolation:{name:'Isolation Ward',description:'กระจกสังเกตอาการแตกร้าว แสงสีแดงส่องห้องผู้ป่วยที่เงียบผิดปกติ',color:0x4d343d},
 control:{name:'Control Center',description:'ระบบรักษาความปลอดภัยอยู่ในสถานะขัดข้อง ไม่มีคำสั่งเปิดเมือง',color:0x354b59},
 bus:{name:'Bus Depot',description:'รถบัสจอดรออยู่ แต่ไม่มีผู้ขับหรือผู้โดยสาร',color:0x33464c},
 gate:{name:'City Gate',description:'ประตู Doge City ยังปิดอยู่ การเดินทางเข้าสู่เมืองจะเป็นภารกิจในระยะถัดไป',color:0x394351}
};
export const SCREENING_CENTER={id:'doge-screening-center',cellSize:6,blocks:[
 {id:'highway',type:'LINE_5',rotation:90,x:1,z:0,environment:'highway',audioZone:'OUTDOOR',lighting:{color:0xb1c5d0,intensity:4},ports:[port('waiting',[4,0],'east')],spawns:[{id:'arrival',kind:'player',cell:[0,0]},point('road-sign',[1,0],'ตรวจป้ายด่าน','DOGE CITY / SCREENING & QUARANTINE CENTER — จุดตรวจด้านนอกเมือง')],props:[prop('car',[1,0],[1.7,0]),prop('barrier',[2,0],[-1.8,0]),prop('car',[3,0],[-1.7,0])]},
 {id:'waiting',type:'O',x:1,z:5,environment:'waiting',audioZone:'LARGE_ROOM',lighting:{color:0xe3c68c,intensity:6},ports:[port('highway',[0,0],'north'),port('screening',[0,1],'south')],spawns:[point('luggage',[1,0],'ตรวจสัมภาระ','กระเป๋ายังมีป้ายรถเที่ยวสุดท้ายติดอยู่ ไม่มีเจ้าของกลับมารับ')],props:[prop('tent',[1,0]),prop('chairs',[0,0],[-1.8,0]),prop('bags',[1,1],[1.7,1])]},
 {id:'screening',type:'T',x:0,z:7,environment:'screening',audioZone:'LARGE_ROOM',lighting:{color:0x92d6dc,intensity:8},ports:[port('waiting',[1,0],'north'),port('security',[0,0],'west'),port('medical',[2,0],'east')],spawns:[point('screening-record',[1,1],'อ่านสถานะคัดกรอง','PROCESSED 1,847 / CLEARED 1,623 / OBSERVATION 143 / ISOLATION 81 — SYSTEM FAILURE')],props:[prop('desk',[1,1],[1.8,0]),prop('chairs',[0,0],[0,-1.8]),prop('medical',[2,0],[0,1.8])]},
 {id:'security',type:'L',rotation:180,x:-2,z:7,environment:'security',audioZone:'SMALL_ROOM',lighting:{color:0xb8c5ee,intensity:6},ports:[port('screening',[0,2],'west'),port('quarantine',[0,0],'north')],spawns:[point('armory',[1,2],'ตรวจ Security Armory','พบ SG-12 Tactical Shotgun ในตู้เก็บอาวุธ'),{id:'armory-target',kind:'objective',cell:[0,1],offset:[.25,0],label:'ตั้งเป้าฝึกใหม่',note:'เป้าฝึกใน Armory — ทดสอบการยิงและแรงกระแทก ไม่มี EXP หรือรางวัล'}],props:[prop('desk',[1,2],[0,1.8]),prop('cabinet',[0,1],[1.8,0])]},
 {id:'medical',type:'J',rotation:180,x:3,z:7,environment:'medical',audioZone:'SMALL_ROOM',lighting:{color:0xbdebd6,intensity:6},ports:[port('screening',[1,2],'east'),port('isolation',[1,0],'north')],spawns:[point('medical-log',[0,2],'อ่านบันทึกการส่งต่อ','ผู้มีอาการผิดปกติถูกส่งไปปีกสังเกตอาการ การติดต่อทีมแพทย์ขาดหาย')],props:[prop('ambulance',[0,2],[1.65,0]),prop('bed',[1,1],[-1.8,0])]},
 {id:'quarantine',type:'Z',x:-1,z:10,environment:'quarantine',audioZone:'SMALL_ROOM',lighting:{color:0xe89774,intensity:4},ports:[port('security',[0,0],'north'),port('control',[2,1],'south')],spawns:[point('quarantine-record',[1,1],'ตรวจแฟ้มกักกัน','แฟ้มถูกทิ้งไว้ระหว่างการเคลื่อนย้ายผู้ป่วย ข้อมูลหลายหน้าหายไป'),{id:'quarantine-walker',kind:'enemy',enemyType:'normal',cell:[0,0]}],props:[prop('bed',[1,0],[0,-1.8]),prop('blood',[1,1],[1.5,1.5])]},
 {id:'isolation',type:'S',x:2,z:10,environment:'isolation',audioZone:'SMALL_ROOM',lighting:{color:0xff5b5b,intensity:5},ports:[port('medical',[1,0],'north'),port('control',[1,1],'south')],spawns:[point('observation',[0,1],'ตรวจห้องสังเกตอาการ','PATIENT 34 — พบการฟื้นตัวของเนื้อเยื่อผิดปกติหลังภาวะหัวใจหยุดเต้น / บันทึกจาก REGEN-X'),{id:'isolation-runner',kind:'enemy',enemyType:'runner',cell:[2,0]}],props:[prop('bed',[2,0],[0,1.8]),prop('glass',[1,0],[-1.8,0]),prop('blood',[0,1],[-1.5,-1.5])]},
 {id:'control',type:'T',x:1,z:12,environment:'control',audioZone:'LARGE_ROOM',lighting:{color:0x88b7ec,intensity:9},ports:[port('quarantine',[0,0],'north'),port('isolation',[2,0],'north'),port('bus',[1,1],'south')],spawns:[point('control-status',[1,0],'อ่านระบบควบคุม','CITY GATE: LOCKED / SCREENING CENTER: COMPROMISED / MEDICAL RESPONSE: OFFLINE / MILITARY RESPONSE: UNKNOWN')],props:[prop('desk',[1,0],[0,-1.8]),prop('cabinet',[0,0],[-1.8,0])]},
 {id:'bus',type:'LINE_3',rotation:90,x:2,z:14,environment:'bus',audioZone:'OUTDOOR',lighting:{color:0xe3c392,intensity:5},ports:[port('control',[0,0],'west'),port('gate',[2,0],'east')],spawns:[point('bus-manifest',[1,0],'ตรวจรถเที่ยวสุดท้าย','รถบัสทุกคันถูกทิ้งไว้ ตารางอพยพหยุดบันทึกก่อนออกเดินทาง'),{id:'bus-supply',kind:'loot',cell:[2,0],label:'ตรวจจุดเสบียง',note:'ตู้เสบียงปิดอยู่ เอกสารเบิกจ่ายถูกทิ้งไว้ใต้กระเป๋าผู้โดยสาร'}],props:[prop('bus',[0,0],[1.65,0]),prop('bus',[1,0],[-1.65,0]),prop('bags',[2,0],[1.8,0])]},
 {id:'gate',type:'LINE_2',rotation:90,x:2,z:17,environment:'gate',audioZone:'OUTDOOR',lighting:{color:0xd6b781,intensity:5},ports:[port('bus',[0,0],'west')],spawns:[point('city-gate',[1,0],'ตรวจประตู Doge City','CITY GATE: LOCKED — สัญญาณจากเมืองไม่ตอบกลับ ประตูหลักยังปิดอยู่')],props:[prop('barrier',[0,0],[1.8,0]),prop('gate',[1,0],[0,2.5])]}
],connections:[
 {id:'arrival-checkpoint',from:'highway:waiting',to:'waiting:highway',open:true},
 {id:'screening-entry',from:'waiting:screening',to:'screening:waiting',open:true},
 {id:'security-door',from:'screening:security',to:'security:screening'},
 {id:'medical-door',from:'screening:medical',to:'medical:screening'},
 {id:'quarantine-door',from:'security:quarantine',to:'quarantine:security'},
 {id:'isolation-door',from:'medical:isolation',to:'isolation:medical'},
 {id:'west-control-door',from:'quarantine:control',to:'control:quarantine'},
 {id:'east-control-door',from:'isolation:control',to:'control:isolation'},
 {id:'depot-door',from:'control:bus',to:'bus:control'},
 {id:'gate-checkpoint',from:'bus:gate',to:'gate:bus',open:true}
]};
