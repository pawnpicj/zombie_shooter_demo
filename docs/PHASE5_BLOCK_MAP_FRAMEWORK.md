# Phase 5 — Block Puzzle Map Framework

วันที่: 5 ตุลาคม 2026

## Implementation

`block-map.mjs` เป็น compiler และ navigation API ที่ไม่ผูกกับ Three.js รองรับ DOT, LINE_2, LINE_3, LINE_5, I, O, T, L, J, S, Z และ rotation 0/90/180/270 องศา ใช้ grid ที่ x ไปทางตะวันออกและ z ไปทางใต้ Rotation หมุนตามเข็มนาฬิกาและ normalize footprint ให้มุมบนซ้ายกลับเป็น (0,0) ก่อนวางที่ x/z ของบล็อก

ข้อมูลบล็อกรองรับ unique ID, type, rotation, grid placement, boundary ports, player/enemy/loot/objective spawn points, environment, lighting และ audioZone การหมุนใช้ transform เดียวกันทั้ง footprint, ports, port direction และ spawn offsets

Connections ระบุคู่ port ของคนละบล็อก ต้องอยู่ติดกันและหันเข้าหากัน ช่องต่อที่ไม่เชื่อมยังมีผนัง แม้บล็อกจะวางติดกัน Compiler ป้องกันการวางทับ, ID ซ้ำ, port อยู่ด้านในบล็อก, duplicate boundary ports, spawn อยู่นอก footprint และ connections ที่ไม่ตรงกัน

ผนังและประตูสร้างเป็น rectangles สำหรับ `moveCircle` และ `hasLineOfSight` เดิม ประตูล็อกเปิดไม่ได้ `setDoorOpen`/`unlockDoor` เปลี่ยนข้อมูลเดียวกับที่ใช้สร้าง collision และ navigation จึงไม่มี graph เก่าค้างอยู่หลังเปลี่ยนสถานะประตู

`findPath` ใช้ BFS บน cell adjacency ภายในแต่ละ module และเดินข้าม module ผ่านประตูที่เปิดเท่านั้น `allowClosed` ใช้วางแผนผ่านประตูปิดที่ไม่ล็อก; ไม่ถือว่าเดินผ่านประตูปิดได้จริง `radius` จำกัดเส้นทางตามความกว้างของช่องประตู ค่าเริ่มต้น 0.45 เมตร รองรับ Walker/Runner/Tank ด้วย radius ของแต่ละชนิด และคืน null เมื่อไม่มีเส้นทาง

`cellAt`, `zoneAt`, `isWalkable`, `obstacles` เปิดข้อมูล spatial และ geometry ให้ระบบอื่นใช้ `isWalkable` มี epsilon เล็กเพื่อให้จุดสัมผัสผนังจาก floating-point physics ยังนับว่าเดินได้

## Test map

`maps/framework-test.mjs` เป็นข้อมูลสนาม 15 cells: DOT ทางเข้า, LINE_2 ทางเดิน, O ห้องควบคุม, L หมุน 90 องศาเป็นปีกตะวันออก, T ห้องเก็บของ มีประตูเชื่อม 4 จุด, locked gate, จุด player/enemy/loot/objective และ audio/lighting metadata

`map-test.html` / `map-test.js` เป็นสนามสำรวจแยกจาก pilot campaign ใช้ Three.js, `moveCircle` และ shared E interaction ของเกมเดิม มี wall collision, door interaction, control objective เพื่อ unlock gate, one-use loot, end objective, route preview, pause/blur, reset และ responsive HUD

จุดสีแดงแสดงตำแหน่งเกิด Walker/Runner สำหรับตรวจ map data ไม่ spawn ศัตรูจริงหรือเริ่ม combat ในสนามนี้ Audio zones เป็น metadata ยังไม่มี reverb หรือ room-based sound propagation ไม่มี Chapter 1 map และไม่เปลี่ยนฉาก Chapter 0 ซึ่งเป็นขอบเขต Phase 6/7

เปิดจากลิงก์ “สำรวจสนามทดสอบแผนที่” บนหน้าเริ่มเกม หรือ `/map-test.html` เดินด้วย WASD/ลูกศร กด E ที่ประตูหรือจุดสีเหลือง/ฟ้า ESC พักเกม ประตูปิดทับตัวละครไม่ได้

## Authoring example

```js
{
  id: 'room', type: 'L', rotation: 90, x: 2, z: 0,
  environment: 'research', audioZone: 'SMALL_ROOM',
  lighting: { color: 0x90d5e6, intensity: 5 },
  ports: [{ id: 'entry', cell: [0, 2], side: 'south' }],
  spawns: [{ id: 'objective', kind: 'objective', cell: [0, 0] }]
}
```

Port/spawn `cell` ใช้พิกัดของ shape ก่อนหมุน `offset` เป็นสัดส่วน cell ใน local axes; default (0,0) อยู่กลาง cell การเชื่อมใช้ `from: 'blockId:portId'` และ `to` ในรายการ connections ดูตัวอย่างครบใน `maps/framework-test.mjs`

## Validation

Unit ล่าสุด: 33/33 ผ่าน ทดสอบทุก footprint ทั้งสี่ rotation, topology, transformed ports/spawns, invalid placement, locks, door graph/collision, clearance radius, positive/negative wall tangency และเดินตาม route จริงด้วย shared player collision

Browser ล่าสุด **2/2 ผ่าน**: map integration และ smoke regression ของเกมหลัก ตรวจสนามครบลำดับด้วย keyboard input จริง: ประตูปิดบล็อกการเดิน, locked gate, objective unlock, loot ครั้งเดียว, rotated wing, route เปลี่ยนตามประตู, ปิดประตูทับผู้เล่นไม่ได้, pause, reset, resize และไม่มี runtime errors เกมหลักผ่านเดิน/ยิง/reload/pause ตรวจ screenshot ที่ 1440×900 และ 800×600 แล้ว ปรับ HUD จอเล็กเป็นแถบล่างเพื่อไม่บังสนาม Logs/screenshots อยู่ `artifacts/phase5/`

สถานะ: framework และสนามทดสอบพร้อมใช้งาน ผ่าน unit/Browser validation; native Windows validation ยังไม่ยืนยัน

รอบแรก test จับเวลาจากเริ่มหน้าแทนเริ่มกดเดิน จึงยังเดินไม่ถึงประตูเมื่อ assertion ทำงาน ปรับ timing ให้เริ่มจาก simulation time ตอนกดเดิน รอบถัดไปพบ boundary tangency ที่ x=8.41 ถูกจัดว่าไม่ walkable จาก float rounding จึงเพิ่ม epsilon และ regression assertion จุดสัมผัสด้านบวก เก็บผลเก่าต่างหาก

Native Windows source/build ยังไม่ยืนยันจากข้อจำกัด Electron runtime เดิม ไม่ใช้ผล Phase 2 เป็นหลักฐานของโค้ดล่าสุด

```powershell
npm test
npm start
# อีก terminal พร้อม PUPPETEER_MODULE/CHROME_PATH ที่ใช้ได้
npm run test:map
```

Phase ถัดไปคือ Phase 6 — Chapter 0 Validation
