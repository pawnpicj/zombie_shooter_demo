# Phase 2 — Core Player Systems

วันที่: 2026-10-05

Phase นี้ตรวจรับระบบผู้เล่นเดิมและปรับจุดเชื่อม E interaction โดยรักษา pilot campaign, Survival, progression และ inventory เดิม ขอบเขตตาม ROADMAP §43

## สิ่งที่ปรับ

- เพิ่ม `interaction.mjs`: target ระบุ id, action, position, distance, availability, priority และ activate callback; เลือกเฉพาะ target ที่ใช้งานได้และอยู่ในระยะ
- Mission มี priority เหนือ loot เช่นเดิม ทั้งสองใช้ selector เดียวกันสำหรับคำสั่ง E และข้อความ HUD จึงแสดง prompt เฉพาะสิ่งที่จะถูกใช้งาน
- Supplies เปิดเผย interaction targets และตรวจระยะ/active อีกครั้งตอนเก็บ ป้องกันการรับรางวัลซ้ำ
- ขยาย read-only telemetry ด้วย elapsed, camera, obstacles และ interaction id สำหรับตรวจ runtime โดยไม่เพิ่มคำสั่งแก้ state
- Windows self-test รอ visible/focused renderer ก่อน resume และตรวจ minimize → auto-pause → restore/focus → คง paused → explicit resume สามรอบ
- เพิ่ม `npm run test:core` และ browser core checks

## เกณฑ์ตรวจรับ

| ระบบ | หลักฐาน |
| --- | --- |
| Movement | core browser ตรวจ WASD และ normalized diagonal speed จาก simulation time |
| Camera | core browser ตรวจ follow position และ resize aspect หลัง event เสร็จ |
| Collision | core browser ชนโต๊ะจริงใน Lab; unit ตรวจ cover sliding, arena bounds และ embedded circle |
| Health / Damage | combat ตรวจ enemy damage จน HP เป็น 0; level ตรวจเพิ่ม max HP และฟื้นเต็ม; supplies ตรวจ shield |
| Death / Restart | combat ตรวจตายแล้วเริ่มใหม่พร้อม reset HP/wave/kills/score/ammo |
| Interaction | unit ตรวจระยะ/availability/priority; core ตรวจ prompt ตรง action และเก็บครั้งเดียว; campaign ตรวจ mission gate |
| Basic HUD | core ตรวจข้อความ HP; smoke/level/HUD ตรวจ ammo, progression และ compact panels |
| Pause / Resume | browser ตรวจ frozen simulation/cleared held input; desktop ตรวจ native minimize/restore และ window modes |

## R01 และข้อจำกัดการทดสอบ

Phase 1 พบ packaged resume self-test ไม่เสถียร แต่ยังไม่ยืนยัน root cause ของรอบนั้น ใน Phase 2 แก้ test precondition ให้รอ focus/visibility ก่อนกลับเข้าเกม และตรวจว่าการเล่นยังทำงานหลัง resume ไม่ยกเลิก auto-pause ของผู้เล่น

การเรียก `win.blur()` เพียงอย่างเดียวไม่ทำให้ renderer blur สม่ำเสมอในสภาพแวดล้อมนี้ จึงใช้ minimize จริงสำหรับ native check และทดสอบ blur handler บน browser แยกกัน

Core test ใช้ keyup ใน renderer ที่จุดหมายเพื่อไม่ให้ความหน่วงของ protocol ทำให้เดินเลย และรอ camera resize condition แทน fixed delay Browser tests ใช้ SwiftShader จึงไม่ใช่ GPU performance certification

## ผลการตรวจ

สถานะ: **COMPLETE**

- Unit: **16/16 ผ่าน**
- Browser: ผลตรวจล่าสุด **7/7 ผ่าน** — core, smoke, combat, level, HUD, campaign, supplies
- Windows source self-test ผ่าน; packaged self-test **3/3 ครั้งผ่าน** แต่ละครั้งตรวจ minimize/restore/explicit resume สามรอบ
- Windows build ผ่านที่ `artifacts/phase2/build/DeadZone-win32-x64/DeadZone.exe`; ไม่ทับ `dist`
- Packaged runtime **14/14 ไฟล์** ตรงกับ source

รอบ regression แรก core และ campaign ไม่ผ่าน: core เดินเลยจุดทดสอบ/ตรวจ camera ก่อน resize เสร็จ จึงปรับ test timing ตามเงื่อนไขจริง; campaign เก็บ DMR ไม่สำเร็จในการเดินสคริปต์รอบนั้น รันเดี่ยวซ้ำโดยไม่เปลี่ยน campaign test ผ่านครบทั้งสามภารกิจ จึงยังมีความเสี่ยงจาก randomness/timing ใน walkthrough เดิม เก็บ `browser-results.json` เป็นผล batch แรก และ `final-results.json` เป็นผลตรวจล่าสุด พร้อม log campaign ทั้งสองรอบ

ผล Windows ลดปัญหา R01 ภายใต้ precondition ที่ตรวจได้ แต่ไม่ได้พิสูจน์ root cause ของรอบ Phase 1 หรือรับรองทุก focus timing ของ Windows

หลักฐานอยู่ใน `artifacts/phase2/`; Phase 1 report และหลักฐานเก็บเป็น baseline เดิม

## ขอบเขตถัดไป

ยังไม่มี per-weapon magazine/ammo, VX-9/M4X, enemy awareness, maps ใหม่, ตู้ขายจริง หรือวัสดุสี่ประเภท งานเหล่านี้อยู่ใน Phase ถัดไป ไม่เปลี่ยน balance ระหว่างตรวจระบบผู้เล่น

Phase 3 คือ Weapon Framework โดยต้องรักษา legacy weapons และ progression ตาม §56
