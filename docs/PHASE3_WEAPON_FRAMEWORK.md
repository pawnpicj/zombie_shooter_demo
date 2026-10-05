# Phase 3 — Weapon Framework

วันที่: 5 ตุลาคม 2026

## Implementation

- `weapons.mjs` เป็นข้อมูลปืนและ reusable inventory logic: damage, fireRate (วินาทีต่อ shot), accuracy (0–1), range (เมตร), recoil (radians), recovery, reloadSpeed (วินาที), magazineSize, ammoType, stoppingPower, soundRadius, mobility และเสียง
- VX-9: 15 นัด / 9mm; M4X: 30 นัด / rifle เพิ่มจุดเก็บใน Lab ที่ (-5,12) และ (5,12) สำหรับเล่น framework ในแผนที่ปัจจุบัน ไม่ได้สร้าง Chapter 1 หรือ SG-12
- M4/SMG ใช้ rifle ร่วมกัน; Shotgun ใช้ shells, 6 นัด; DMR ใช้ heavy, 10 นัด ปืนเดิมยังเก็บและอัปเกรดได้ Damage/rate ของปืนเดิมคงสูตรเดิม แต่ magazine, recoil และ ammo type เปลี่ยนตาม framework
- Magazine แยกแต่ละปืน เติมครั้งเดียวเมื่อเก็บครั้งแรก สลับปืนไม่คืนกระสุน; reserve แยกชนิด มีจำนวนจำกัด กล่องกระสุนเติมชนิดที่ปืนที่ถือใช้อยู่
- การรีโหลดหัก reserve เมื่อครบเวลาจริง สลับปืนยกเลิกรีโหลดโดยไม่หัก reserve คูลดาวน์และ recoil นับด้วย simulation time จึงหยุดขณะพักเกม; สลับปืนไม่ข้าม cooldown
- Primary: M4/SMG/DMR/M4X; Secondary: Shotgun; Sidearm: VX-9 มีได้ช่องละหนึ่งปืน F วนเฉพาะ loadout การเก็บปืนในช่องเดียวกันแทนปืนที่ใส่อยู่ แต่เก็บ ownership, upgrades และ magazine ของปืนเดิมไว้ เลือกปืนเก่ากลับเข้าช่องผ่านร้านได้
- `chapterLoadout(bag,1)` เตรียม VX-9/M4X และเก็บ inventory เดิมไว้ เป็น hook ที่ทดสอบแล้ว แต่ยังไม่เรียกจาก pilot missions เพราะภารกิจเหล่านี้ทั้งหมดอยู่ใน Chapter 0 ไม่มีการทำ chapter transition ใน Phase นี้
- Bullet spread ใช้ accuracy และ recoil ที่เพิ่มขณะยิง/คืนตัวตามเวลา Bullet จำกัดระยะทางจริง รวมเฟรมสุดท้ายก่อนหมดอายุ Shotgun มี stopping power ขยับศัตรูผ่าน collision helper
- `weapon-audio.js` ใช้ THREE.AudioListener/PositionalAudio และสร้าง AudioBuffer สี่แบบต่อปืนในเครื่อง รองรับ fire/reload/dry/equip พร้อม playback variation 0.97–1.03 และ cleanup ของ audio nodes ไม่ต้องดาวน์โหลดเสียง ไม่มี recorded samples หรือ AudioLoader assets
- ทุก shot ส่ง `weapon-noise` CustomEvent ที่มี weapon, x, z, radius, time และเก็บล่าสุดใน read-only telemetry ไม่เปลี่ยน enemy AI ใน Phase นี้ การปิดเสียงไม่ลบ gameplay noise event
- HUD แสดง magazine capacity และ reserve ammo type ตามปืน แก้ prompt ให้หายทันทีเมื่อเก็บของ และตั้ง camera ให้ตรง spawn ก่อนเปิดร้าน/พักทันทีหลังเริ่มเกม

## Balance and scope

ค่าปืนใหม่และ reserve เริ่มต้นเป็นค่า provisional ใน `WEAPONS`/`INITIAL_AMMO` ปรับได้จากที่เดียว ยังไม่ใช่ balance ที่ผ่านการรับรองจากการเล่นจริงระยะยาว ไม่เปลี่ยนสูตรวัสดุ ไม่เพิ่มตู้ขาย แผนที่ใหม่ หรือ SG-12 ซึ่งเป็นงาน Phase ถัดไป

## Validation

Unit tests: 21/21 ผ่าน ครอบคลุม finite ammo, magazine conservation, cooldown ขณะสลับ, three-slot ownership, chapter loadout preservation, recoil recovery และ progression multipliers

Browser ตรวจด้วย Edge/SwiftShader โดยเปิดผ่าน Playwright และให้ Puppeteer เชื่อมต่อ CDP เนื่องจาก Puppeteer launcher ตรงเปิด Edge ไม่สำเร็จ Adapter อยู่ใน `artifacts/phase3/tools/puppeteer-local.cjs` ไม่ได้เพิ่ม dependency ของเกม

ผล Browser ล่าสุด **8/8 ผ่าน**: weapons, smoke, core, combat, level, HUD, campaign, supplies Logs และ screenshot อยู่ใน `artifacts/phase3/`

รอบแรก core ไม่ผ่านเพราะ DOM prompt ไม่หายทันทีหลังเก็บของ และ supplies ไม่ผ่านเพราะ camera ยังอยู่ก่อน spawn ใน snapshot ที่เปิดร้านทันที แก้ runtime ทั้งสองจุดและตรวจซ้ำผ่าน เก็บ logs รอบแรกไว้ด้วย; supplies test ปรับ expectation ของ F ให้ตรงกับ three-slot loadout และตรวจเลือก M4 เดิมจาก ownership แทน

สถานะ: implementation และ Browser validation เสร็จแล้ว; Windows validation ยังไม่ยืนยัน

Electron runtime ดาวน์โหลดไม่สำเร็จในการตรวจครั้งนี้ จึงยังไม่ได้ตรวจ source Windows self-test หรือ packaged Windows build ของ Phase 3 ผล Windows ของ Phase 2 เป็นหลักฐานเดิม ไม่ใช่ผลตรวจโค้ดใหม่

## Reproduce

```powershell
npm install
npm test
npm start
# อีก terminal; ตั้ง PUPPETEER_MODULE และ CHROME_PATH ตามเครื่อง
npm run test:weapons
```

สำหรับเครื่องที่ตรวจครั้งนี้:

```powershell
$env:PUPPETEER_MODULE = Join-Path (Get-Location) 'artifacts/phase3/tools/puppeteer-local.cjs'
node tests/browser-weapons.mjs
```
