# Phase 7 — Chapter 1 Screening Center

วันที่ตรวจ: 5 ตุลาคม 2026 · ขอบเขต: พื้นที่สำรวจ Chapter 1 ตาม ROADMAP §48

สร้าง Doge City Screening & Quarantine Center ด้วย Block Puzzle Framework แล้ว เดินสำรวจได้ครบ 10 พื้นที่ รวม 38 เซลล์ พร้อมประตูเชื่อม 10 จุด แผนผังย่อ กล้องตามผู้เล่น จุดตรวจบันทึก และบรรยากาศด่านร้างช่วงค่ำ

## การเล่นและขอบเขต

เปิดจากหน้าเริ่มเกมด้วยลิงก์ **Chapter 1 / สำรวจ Doge City Screening Center** หรือเปิด `screening-center.html` ผ่าน local server เดิน WASD/ลูกศร กด E เปิด/ปิดประตูหรืออ่านบันทึก ESC พักและกดเล่นต่อเอง เริ่มสำรวจใหม่คืนประตู จุดตรวจ และตำแหน่งเริ่มต้น

ลิงก์สำรวจแสดงเฉพาะก่อนเริ่มรอบ เพื่อไม่พาผู้เล่นออกจากความคืบหน้าขณะพัก Chapter 0/Survival สนามนี้เป็น preview ของพื้นที่ ไม่ใช่การเปลี่ยน chapter ของ campaign กลับไปเกมหลักจะเข้าหน้าเริ่มเกม การส่งต่อ inventory/progression ยังต้องเชื่อมกับ mission flow ในระยะถัดไป

SG-12 เป็นงาน Phase 8; ภารกิจ SILENT CHECKPOINT, ISOLATION WARD, LOCKDOWN และ THE LAST BUS เป็น Phase 9 จึงยังไม่มี combat/reward/ระบบปลดล็อกภารกิจในสนามนี้ City Gate ยังปิดและไม่มีพื้นที่ Doge City ต่อจากขอบแผนที่ จุดเกิด Walker/Runner และเสบียงมีข้อมูลรองรับ แต่ไม่สร้างศัตรูจริงหรือแจกไอเทม/ระเบิด

## โครงแผนที่

| พื้นที่ | บล็อก / การหมุน | เชื่อมต่อ |
| --- | --- | --- |
| Highway Entrance | LINE_5 / 90° | Waiting Area |
| Waiting Area | O / 0° | Highway, Screening |
| Screening Area | T / 0° | Waiting, Security, Medical |
| Security Office | L / 180° | Screening, Quarantine |
| Medical Wing | J / 180° | Screening, Isolation |
| Quarantine Area | Z / 0° | Security, Control |
| Isolation Ward | S / 0° | Medical, Control |
| Control Center | T / 0° | Quarantine, Isolation, Bus |
| Bus Depot | LINE_3 / 90° | Control, City Gate |
| City Gate | LINE_2 / 90° | Bus; ทางเข้าตัวเมืองยังปิด |

สองแขนงเชื่อมกลับเข้าห้องควบคุม รูปทรงและจุดวางไม่สมมาตร แต่ละบล็อกมี theme, lighting/audio-zone metadata และข้อมูล spawns/inspection รถร้าง รถพยาบาล เต็นท์ เก้าอี้ เตียง กระเป๋า ตู้ และรถบัสสร้างจาก Three.js geometry; สิ่งกีดขวางที่เป็นของแข็งร่วม collision กับผนัง/ประตู ฝนแสดงเฉพาะโซน outdoor เสียงแวดล้อมและ audio propagation ยังเป็นงานระยะหลัง

## ไฟล์และส่วนเชื่อมต่อ

- `maps/screening-center.mjs`: topology, ports, spawns, inspection notes และ prop placement ใช้ cell coordinates เดิมก่อนหมุน; prop offsets เป็นหน่วยโลกหลังหมุน
- `screening-scene.js`: สร้างภาพฉาก/ป้าย/props และ colliders จากข้อมูลแผนที่
- `screening-center.js`: ใช้ `compileMap`, `moveCircle`, `selectInteraction`, LOS; ควบคุมการสำรวจ กล้อง แผนผัง พัก/reset และ snapshot อ่านอย่างเดียว `window.screeningCenter`
- `screening-center.html/css`: หน้า preview ที่เชื่อมจากเมนูหลัก
- `local-pages.cjs`: allowlist เฉพาะ index, map-test และ screening-center สำหรับการนำทางใน Electron ไม่เปิดเว็บไซต์หรือไฟล์อื่นผ่านหน้าต่างเกม
- `map-desktop.css`: ทั้งสองหน้าแผนที่ใช้ `desktop.js` เดิมเพื่อมีปุ่มย่อ/ขยาย/ปิดและเลือกโหมดหน้าต่าง โดยคง preload isolation และ IPC sender checks เดิม

## ผลตรวจและหลักฐาน

| การตรวจ | ผล |
| --- | --- |
| Unit | 36/36 ผ่าน: map topology, alternative routes, gate boundary, local navigation allowlist และระบบเดิม |
| Browser Screening Center | ผ่าน: ครบ 10 พื้นที่ ทุกประตูเชื่อม, inspection, collision ของรถ/ประตู, ห้ามปิดประตูทับผู้เล่น, พัก/reset, 800×600 และกลับไป Survival |
| Browser smoke | ผ่านเกมเดิม: เดิน/ยิง/reload/พัก/ศัตรู และ preview link ถูกซ่อนระหว่างพักรอบปัจจุบัน |
| Browser map | ผ่านสนาม Phase 5 เดิม: ประตูล็อก/ปลดล็อก, loot, navigation, pause/reset |
| Browser map-desktop | ผ่าน renderer ของทั้งสองแผนที่ที่ 800×600 ด้วย mock bridge; controls คลิกได้และ mode UI เปลี่ยนได้ |
| Windows package | สร้าง output แยกสำเร็จ; SHA-256 runtime 27 ไฟล์ตรงกับ source พร้อม Three.js module/core และ package metadata |
| Native Windows execution | ยังไม่ยืนยัน: Application Control บล็อก Electron ใน Phase 6 ไม่แก้นโยบายเครื่อง |

Browser ล่าสุด **4/4 ชุดผ่าน** ใช้ Edge headless/SwiftShader ไม่ใช่การรับรอง native IPC, focus/fullscreen effects หรือประสิทธิภาพ GPU จริง ชุด mock desktop ตรวจ DOM/bridge wiring เท่านั้น

รอบต้น Screening Center ผ่าน walkthrough; รอบเพิ่ม coverage พบ test bot เดินเลยจุดหมายเมื่ออ่านสถานะผ่าน RPC หน่วง และ map regression เดิมโต้ตอบประตูหลังเดินเลยระยะ ปรับ test input ให้หยุดบน animation-frame arrival พร้อมตรวจพิกัดถึงจริง คง pass assertions แล้วรอบล่าสุดผ่าน Logs รอบก่อนยังอยู่ใน `artifacts/phase7/`

Packaging รอบ refresh ใช้ output เดิมจึงถูก packager skip; integrity ตรวจพบว่า index เก่า ไม่ใช้ผลนั้นเป็นผลสำเร็จ สร้าง output ใหม่ `build-final` และตรวจ source ครบอีกครั้งแล้วผ่าน

หลักฐานอยู่ใน `artifacts/phase7/`: `unit.log`, `browser-final-results.json`, `browser-screening-corrected.log`, `browser-map-corrected.log`, `browser-smoke-latest.log`, `browser-map-desktop-latest.log`, `walkthrough.json`, screenshots, `build-final.log`, `package-integrity.json` และ build ล่าสุดที่ `build-final/DeadZone-win32-x64/` ต้องเก็บทั้งโฟลเดอร์ ไม่ใช้ output `build/` เก่าที่สร้างก่อนเพิ่ม safeguard

ตรวจซ้ำด้วย `npm test` และ `npm run test:screening` ตั้ง Puppeteer ตาม README และเปิด `node server.mjs` ก่อน Phase 7 geography เสร็จแล้ว; ขั้นถัดไปคือ Phase 8 SG-12 ใน Security Armory
