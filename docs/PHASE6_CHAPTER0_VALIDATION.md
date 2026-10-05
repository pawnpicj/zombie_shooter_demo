# Phase 6 — Chapter 0 Validation

วันที่ตรวจ: 5 ตุลาคม 2026 · Chapter 0 pilot เดิม · เวอร์ชัน 1.3.0

Chapter 0 ผ่านการเล่นอัตโนมัติครบ Mission 1, Mission 2 และ Mission 3 ผ่าน Browser หลังรวมระบบอาวุธ ศัตรู และ map framework จาก Phase 3–5 ไม่ได้ออกแบบ Lab ใหม่หรือเชื่อม Chapter 1

## การเปลี่ยนแปลง

- เปลี่ยนป้าย HUD ของ campaign จาก `CHAPTER` เป็น `MISSION` ให้ตรงกับลำดับภารกิจใน Chapter 0 ตัวแปร `campaign.chapter` เดิมยังคงไว้เพื่อความเข้ากันได้
- เพิ่ม assertions ใน campaign walkthrough: โต้ตอบนอกระยะไม่ได้หลักฐาน, หลักฐานเก็บครั้งเดียว, รายงานหยุด simulation, เงิน/วัสดุ/Level/Points/อาวุธ/อัปเกรด/ไอเทม/แมกกาซีน/กระสุนสำรองคงอยู่ระหว่างภารกิจ และ replay รีเซ็ตค่าตั้งต้น
- ปรับ preconditions ของชุดทดสอบ Survival/Level ให้เดินค้นหาศัตรูและเติมกระสุนจากกล่องจริง ระบบใหม่ไม่รับประกันว่าซอมบี้จะเดินมาหาผู้เล่นที่ซ่อนอยู่ และกระสุนสำรองมีจำนวนจำกัด
- เพิ่ม helper หาเส้นทางสำหรับ test bot เท่านั้น ใช้ telemetry อ่านสถานะแล้วกด WASD/E และเล็ง/ยิงจริง ไม่แก้สถานะเกมหรือเพิ่มสิทธิ์พิเศษให้ผู้เล่น

## ผลตรวจ

| การตรวจ | ผล |
| --- | --- |
| Unit tests | 33/33 ผ่าน |
| Browser campaign | ผ่านครบทั้ง 3 Mission, security-log → formula-x → extracted, จบเกมและ replay |
| Browser core/combat/level/hud/supplies/weapons/enemies | ผ่านทั้งหมด รวมกับ campaign เป็น 8/8 ชุดล่าสุด |
| Windows package | สร้าง isolated build สำเร็จจาก runtime source และ production dependency |
| Package integrity | SHA-256 ของ runtime 20 ไฟล์ตรงกับ source; Three.js modules และ package metadata ตรงกัน |
| Electron archive | SHA-256 ตรงกับ checksum ของ Electron 44.5.1 ที่ติดตั้ง |
| Native Windows execution | **ยังไม่ยืนยัน**: Windows Application Control บล็อก Electron executable |

Browser checks ใช้ Edge แบบ headless และ SwiftShader จึงไม่ใช่การรับรองประสิทธิภาพบน GPU จริง การทดสอบ campaign เป็น scripted walkthrough หนึ่งรอบ ไม่ครอบคลุมทุกผลสุ่มหรือทุกวิธีเล่น

Initial batch มี combat/level ล้มเหลว: combat เคยรอให้เสียชีวิตทั้งที่อยู่หลัง cover และอีกรอบใช้กระสุนหมดก่อนฆ่าตัวสุดท้าย; level ขอ reload หลัง reserve หมด ปรับ input/preconditions โดยไม่ลด assertions แล้วผ่าน เก็บ logs เดิมและรอบแก้ไว้ใน `artifacts/phase6/` ไม่ถือ initial failures ว่าผ่าน

Windows packaging รอบแรกติด pnpm dependency traversal จึงสร้าง staging directory ที่มีเฉพาะ runtime กับ Three.js และใช้ archive ที่ตรวจ checksum แล้ว รอบสุดท้ายสร้างสำเร็จ ตรวจ ASAR เทียบ source เพิ่มเติม แต่การเปิด native self-test ถูก Windows ปฏิเสธด้วยข้อความ `An Application Control policy has blocked this file.` ไม่แก้นโยบายหรือใช้ผล Windows จาก Phase 2 มาอ้างแทน

## หลักฐานและการตรวจซ้ำ

- `artifacts/phase6/unit.log`
- `artifacts/phase6/browser-results.json` — initial batch
- `artifacts/phase6/browser-repaired.json`, `browser-level-final.log`, `browser-combat-final2.log` — corrected runs
- `artifacts/phase6/browser-final-results.json` — latest per-suite results
- `artifacts/phase6/campaign-checkpoints.json`, `campaign-restart.json`
- `artifacts/phase6/electron-integrity.json`, `package-integrity.json`, `build-final.log`, `native-status.json`
- `artifacts/phase6/build/DeadZone-win32-x64/` — build ที่ยังไม่ได้ยืนยันการรัน native ต้องเก็บทั้งโฟลเดอร์ร่วมกัน

ใช้ `npm test` และ Browser scripts ใน `tests/` โดยตั้ง `PUPPETEER_MODULE`/`CHROME_PATH` ตาม README ต้องเปิด `node server.mjs` ก่อน การทดสอบ campaign บันทึก checkpoint ลง `artifacts/phase6/`

ขอบเขต Phase 6 ฝั่ง Browser เสร็จแล้ว Native smoke test ต้องตรวจบน Windows ที่อนุญาต executable นี้ ขั้นถัดไปตาม roadmap คือ Phase 7 Chapter 1 Screening Center ซึ่งยังไม่ได้เริ่ม
