# Phase 8 — SG-12 Tactical Shotgun

วันที่ตรวจ: 5 ตุลาคม 2026 · ขอบเขต ROADMAP §49 / §22 · ต่อจาก Screening Center ใน Phase 7

SG-12 ใช้งานได้ใน Security Armory ของ Screening Center แล้ว เก็บด้วย E ในระยะ 1.7 เมตรและต้องไม่มีกำแพงบัง ให้ปืนครั้งเดียวพร้อมแมกกาซีน 6 นัด ไม่ซื้อจากร้านหรือสุ่มจากกล่อง ไม่เพิ่ม rack ใน Chapter 0

## วิธีลองเล่น

เปิดพื้นที่สำรวจจากหน้าเริ่มเกม เดิน Highway → Waiting → Screening เปิดประตูทางซ้ายเข้า Security แล้วตรวจจุด Armory ข้างโต๊ะยามด้วย E ปืน SG-12 เข้า Secondary และถูกถือทันที มีเป้าฝึกในทางเดิน Security กด E ใกล้แท่นเพื่อคืนตำแหน่ง/HP ของเป้า

เมาส์เล็งและคลิกค้างยิง, R รีโหลด, F วน Primary/Secondary/Sidearm, ESC พัก, ปุ่มเสียงปิดเฉพาะเสียงที่ผู้เล่นได้ยิน HUD แสดงแมกกาซีน กระสุนสำรองตามชนิด และเวลารีโหลด

สนามสำรวจเริ่มใหม่ด้วย active loadout M4X และ VX-9 ใช้ inventory แยกจาก campaign พร้อมกระสุน Shells สำรอง 18 นัด SG-12 ให้ 6 นัดตอนเก็บ รวม 24 นัด การเก็บซ้ำ/สลับปืน/ตั้งเป้าใหม่ไม่เติมกระสุน เป้าฝึกไม่มี EXP เงิน ไอเทม หรือรางวัล ไม่ใช่ infected encounter

## ค่าที่ปรับได้

| ค่า | SG-12 |
| --- | --- |
| Slot / ammo | Secondary / Shells |
| Magazine | 6 |
| Damage | 18 ต่อ pellet · 8 pellets ต่อหนึ่ง shell · สูงสุด 144 ก่อน critical/upgrades |
| Fire interval | 0.8 วินาที |
| Range | 12 เมตร |
| Reload | 3.2 วินาที |
| Stopping power | 1.2 เมตรต่อ blast ต่อเป้า โดยตรวจ collision |
| Mobility | 0.92 เท่า |
| Sound radius | 45 เมตร |

ค่าตั้งต้นเป็น balance ชั่วคราวใน `weapons.mjs` Accuracy/recoil/spread และ progression modifiers ใช้ shared weapon framework เดิม การยิงใช้ shell หนึ่งนัดสำหรับหลาย pellets และ cooldown คงอยู่ข้ามการสลับปืน รีโหลดยกเลิกเมื่อสลับ โดยไม่ใช้ reserve จนกว่าจะรีโหลดครบ ใช้ finite reserve ของชนิดที่ถืออยู่เท่านั้น

## การทำงาน

- `weapon-session.mjs`: reusable weapon session รับ inventory/progression และ sound callback; discovery, firing, reload, switching, nearest swept projectile collision, damage และ stopping force
- `weapon-sound.mjs`: pure procedural sample generation; SG-12 มี bass blast/tail/pump และ mechanical reload/dry/equip แยกจากสูตรเสียงของปืนเดิม มี 4 fire variants
- `weapon-audio.js`: WebAudio positional playback ใช้ samples ร่วมกัน ขนาดเสียง SG-12 สูงกว่าปืนเดิม แต่ mute ยังส่ง gameplay noise radius ผ่าน `weapon-noise`
- `screening-center.js`: loadout/HUD/input/visual tracers/muzzle และ practice target เชื่อมข้อมูล Armory ใน `maps/screening-center.mjs`

Stopping force ใช้ครั้งเดียวต่อ blast ต่อเป้า และเดินทีละไม่เกิน 0.15 เมตรเพื่อตรวจ collision กรณี impulse ข้ามผนังบางพบและแก้จาก unit test ไม่เพิ่มแรงผลักซ้ำแปดครั้งตามจำนวน pellets ปืนหมดระยะและกระสุนชนกำแพง/props ก่อนเป้าจะไม่ทำความเสียหายผ่านสิ่งกีดขวาง

สนามใหม่จำกัดเวลา simulation ต่อ render frame ที่ 50 ms แล้วแบ่งเป็น fixed steps เพื่อลดการกระโดดของ input เมื่อเฟรมหน่วง ภายใต้ software rendering ที่ต่ำกว่า 20 FPS simulation อาจช้ากว่าเวลาจริง รวมถึงรีโหลด; การพักหยุด simulation ทั้งหมด

## ผลตรวจ

| การตรวจ | ผล |
| --- | --- |
| Unit | 42/42 ผ่าน |
| Browser SG-12 | เก็บปืนจริง, 8 pellets/shell, impact/impulse, audio profile/noise, freeze/cancel/complete reload, F รักษาแมกกาซีน, matching reserve, mute, duplicate pickup และ reset ผ่าน |
| Browser weapons | VX-9/M4X ใน Lab, ammo/reload/switch/pause เดิมผ่าน |
| Browser screening | ครบ 10 พื้นที่และประตูทั้งหมดหลังเพิ่มปืน/เป้าฝึกผ่าน |
| Browser smoke | เกมเดิมเดิน/ยิง/reload/pause/spawn และ preview guard ผ่าน |
| Browser map-desktop | Map UI/controls ด้วย mock bridge ที่ 800×600 ผ่าน |
| Windows package | Build แยกสำเร็จ; runtime 29 ไฟล์, Three.js module/core และ package metadata ตรงกับ source |
| Native Windows execution | ยังไม่ยืนยันด้วย Application Control block เดิม ไม่แก้นโยบายเครื่อง |

Browser ล่าสุด **5/5 ชุดผ่าน** ใช้ Edge headless/SwiftShader การตรวจ audio เป็น sample generation และ WebAudio playback/profile ที่ไม่เกิด runtime error ไม่ใช่การประเมินคุณภาพเสียงด้วยการฟังหรือรับรอง GPU/native window effects

รอบต้น Unit 41/42 พบ impulse ทะลุผนัง แก้ substeps แล้ว 42/42 ผ่าน Browser รอบต้นมี arrival sampling overshoot และรอบต่อมารอ reload 6 วินาทีจริงขณะ simulation ยังเหลือ 1.65 วินาทีบน software renderer ปรับ frame jump cap และให้ test รอ simulated completion ภายใน timeout ที่เหมาะสม ไม่ลด assertions เรื่องแมกกาซีน/เวลาตั้งต้น/จำนวน reserve แล้วรอบล่าสุดผ่าน Logs เดิมเก็บไว้

หลักฐานใน `artifacts/phase8/`: `unit.log` (initial failure), `unit-final.log`, `browser-results.json` (initial), `browser-corrected-results.json`, `browser-final-results.json`, `browser-sg12-latest.log`, `browser-screening-final.log`, `weapon-checkpoint.json`, screenshots, `build.log`, `package-integrity.json` และ `build/DeadZone-win32-x64/` ต้องเก็บทั้งโฟลเดอร์ของ build ร่วมกัน

ตรวจซ้ำ: `npm test`, `npm run test:sg12` หลังเปิด `node server.mjs` และตั้ง Puppeteer ตาม README ไม่มี Chapter 1 mission flow, campaign carry-over, vending/material migration, enemy encounter หรือการเปิด City Gate เพิ่มใน Phase นี้ ขั้นถัดไปคือ Phase 9 Chapter 1 Mission Logic
