# Phase 10 — Audio Pass

เพิ่มเสียงตามตำแหน่งและสภาพพื้นที่ให้ Chapter 1, preview และเกม Lab/Survival เดิม ใช้เสียงสร้างจากโค้ดในโครงการ ไม่ดาวน์โหลดเสียงบุคคลอื่น ไม่เพิ่มภารกิจหรือพื้นที่ใหม่

## เสียงอาวุธ

- ใช้ THREE.AudioListener / THREE.PositionalAudio / THREE.AudioLoader ร่วมกัน มี WAV เดิมของโครงการ 63 ไฟล์: ทุกปืน 4 fire variants, reload_out/in/slide, dry และ equip โหลดจาก local path พร้อม procedural fallback สำหรับนัดแรก ถ้าโหลดไม่สำเร็จเสียงยังทำงานและมีข้อมูล error สำหรับตรวจ
- Playback rate ของเสียงยิงจำกัด 0.97–1.03 เสียงกลไกใช้ rate 1 SG-12 คง blast/bass/pump เดิม; VX-9/M4X และ legacy guns คงเสียงเฉพาะของแต่ละปืน
- Reload แยกถอดแมกกาซีน/ใส่/ขึ้นลำที่ 0%, 55%, 90% ของเวลา reload ที่ใช้จริง อัปเกรด Status เปลี่ยนเวลาได้ การพักไม่เลื่อนจังหวะ เปลี่ยนปืน/เริ่มใหม่ยกเลิก track; ไม่มี cue ย้อนกลับหลัง unmute
- เสียงสะท้อนเปลี่ยนตาม OUTDOOR, SMALL_ROOM, LARGE_ROOM, UNDERGROUND และ WAREHOUSE ห้องสามชนิดแรกมีในแผนที่ปัจจุบัน อีกสองชนิดรองรับเป็น profile เท่านั้น ไม่เพิ่มห้องใหม่
- กำแพงและเป้าหมายมี impact cue ใช้ตำแหน่งที่กระสุนชนจริง; gameplay soundRadius/AI hearing และ finite ammo เดิมไม่เปลี่ยน เสียงสะท้อนไม่เพิ่มรัศมี AI และ muted shot ยังแจ้งเสียงใน gameplay

## บรรยากาศและผู้ติดเชื้อ

- รับเสียงที่ความสูง 1.65 เมตรเหนือตำแหน่ง John โดยหันทิศตามกล้อง ระยะเสียงไม่อ้างความสูงของกล้องมุมเฉียง เสียงยิงและผู้ติดเชื้อเกิดจากตำแหน่งในโลก
- Outdoor ใช้ฝน/ลม, Small Room ใช้ ventilation, Large Room ใช้ electrical hum; Underground drone และ Warehouse metal-wind เป็น profile ที่เตรียมไว้ Loop มี fade ที่ขอบและเปลี่ยนพื้นที่โดย crossfade สั้นเพื่อลด click
- Growl/attack/hit/death ของ Walker/Runner และ legacy Tank มีลักษณะต่างกัน แหล่งเสียงไกลเกินรัศมีไม่เล่น เมื่อมีสิ่งกีดขวางลด gain และใช้ low-pass เสียงไม่ทำให้ศัตรูรู้ตำแหน่งผู้เล่นเพิ่มเอง
- เพิ่มเสียงประตูเปิด/ปิด/ล็อก, ฝีเท้าตามการเดินจริง, power-down และ alarm ของ LOCKDOWN เสียง ambience/ฝีเท้าเป็น presentation ไม่สร้าง gameplay noise ใหม่
- จำกัด one-shot 24 voices และให้เสียงปืนมี priority สูงกว่า creature/impact cues เสียงที่จบ/ถูกแทนที่ disconnect และปล่อย node ไม่สะสม source ใหม่ไม่จำกัด
- Pause, blur, report, Status, terminal, death, completion และ mute หยุดเสียงที่กำลังเล่นและ ambience เสียงที่เริ่มหลังกลับมาเป็นเหตุการณ์ใหม่ Legacy UI tones ใช้ context เดียวและหยุดเมื่อพักด้วย

## ไฟล์และการตรวจซ้ำ

`audio-profiles.mjs` เป็น profile/reflection/reload timeline, `sound-synthesis.mjs` เป็น cue/ambient samples, `audio-engine.js` ดูแล listener, positional playback, ambient และ cleanup; `weapon-audio.js` โหลด weapon bank และเชื่อม reload

`sounds/manifest.json` บันทึก SHA-256/จำนวน frames ของ WAV ทุกไฟล์ สร้างซ้ำด้วย `node tools/generate-audio.mjs` หรือ `npm run audio:generate` ได้ผลเดิม ใช้ `node --test tests/*.test.mjs` และ `npm run test:audio` หลังเปิด `node server.mjs` และตั้ง Puppeteer ตาม README

`window.deadZoneAudio` เป็น read-only telemetry แยกจาก gameplay snapshot เพื่อให้การโหลดไฟล์/จบ audio source แบบ asynchronous ไม่เปลี่ยน frozen gameplay snapshot การทดสอบ `tests/audio-harness.html` เป็น component fixture ของเสียง ไม่ใช่การแก้ state ของเกมจริง

Unit 54/54 ผ่าน: reflection/tails, simulated reload timeline, bounded ambient/cue samples, weapon variants/stages และ WAV manifest/integrity รวมระบบเดิม Browser 8/8 ชุดผ่าน: audio component, Chapter 1 + audio, SG-12, weapons, smoke, map-desktop fixture, Chapter 0 + transfer/replay และ preview ครบสิบพื้นที่

Windows build สำเร็จและ SHA-256 ตรงกับ source: code 38 ไฟล์ + WAV/manifest 64 ไฟล์, Three.js module/core และ package metadata หลักฐานอยู่ที่ `artifacts/phase10/`: `unit-final.log`, `latest-*.log`, audio-engine/Chapter 1 checkpoints, `package-integrity.json` และ `build/DeadZone-win32-x64/` ต้องเก็บทั้งโฟลเดอร์ร่วมกัน รอบ Unit แรก 53/54 พบ assertion แยก +0/-0 ที่ขอบเสียง ซึ่งเป็น silence เท่ากัน แก้ assertion ใช้ขนาด sample แล้วผ่าน โดยเก็บ log เดิมไว้

การตรวจ WebAudio ยืนยันการโหลด/เล่น/node/ตำแหน่ง/เหตุการณ์ ไม่ใช่การรับรองคุณภาพเสียงด้วยการฟังหรือการทดสอบ spatial perception ของผู้ฟัง Native Windows ยังยืนยันไม่ได้ภายใต้ Application Control เดิม Desktop fixture ยืนยัน UI ใน renderer เท่านั้น

เสียงและ mix เป็น procedural prototype ปรับคุณภาพ/ระดับเสียงจากการฟังในรอบ polish ได้ หยุดหลัง Phase 10 ขั้นถัดไป Phase 11 Polish
