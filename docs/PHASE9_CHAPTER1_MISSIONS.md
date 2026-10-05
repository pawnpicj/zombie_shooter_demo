# Phase 9 — Chapter 1 Mission Logic

Chapter 1 เชื่อมจากการสกัดตัวอย่างใน Chapter 0 และมีปุ่มเริ่ม Chapter 1 แยกในหน้าหลักเพื่อทดสอบ ไม่ใช้ inventory ใหม่เมื่อเดินทางต่อจาก Chapter 0

## ภารกิจ

1. **SILENT CHECKPOINT** — อ่านบันทึกใน Screening Area: 1,847 processed / 1,623 cleared / 143 observation / 81 isolation และ SYSTEM FAILURE ก่อนปลดล็อก Isolation Ward
2. **ISOLATION WARD** — ตรวจห้องสังเกตอาการและ Patient 34 / REGEN-X ก่อนเข้าห้องควบคุม ข้อมูลนี้เป็นเนื้อเรื่องของเกม
3. **LOCKDOWN** — เปิดระบบ Control Center เกิดไฟดับ 2 วินาที simulation และปลดล็อกประตู ฝูง 18 ตัว (Walker 15 / Runner 3) ทยอยออกจากปีกกักกัน ใช้ perception, finite hearing/memory, navigation, doors, collision และ projectile hit ของระบบเดิม ต้องกำจัดครบแล้วกลับไปอ่าน BLACK-7 / SEAL DOGE CITY / EVAC DENIED จึงเปิด Bus Depot
4. **THE LAST BUS** — อ่านรถอพยพที่ถูกทิ้ง รับวิทยุผู้รอดชีวิตและคำสั่ง Command รถเสบียงเป็นทางเลือก เปิดแล้วเจอ Walker 3 ตัว เมื่อกำจัดและกลับมาเก็บจึงได้ Rifle +60, Shells +12, Shield Cell +1 และรักษา 40 HP ครั้งเดียว ไม่มี grenade drop
5. **ENTER DOGE CITY** — เปิดประตูด้วย E แล้วเดินข้ามช่องประตูจริงถึง z ≥112 จึงจบ ไม่จบจากการกด E หรือ cutscene รถเสบียงไม่ใช่เงื่อนไข ด้านเมืองมีเพียง threshold หนึ่ง cell และฉากอาคาร/เพลิง/ควัน ไม่ขยายแผนที่เมือง

แต่ละภารกิจตรวจผ่าน Browser ก่อนเพิ่มภารกิจถัดไป Logs stage1–stage5 เก็บใน `artifacts/phase9/` รายงานหยุด simulation, AI, การยิง, cooldown, reload และผลระเบิด Pause/blur ใช้หลักเดียวกัน Death/Retry และปุ่มเริ่มใหม่กลับไปข้อมูลตอนเข้าด่าน ไม่เติมของให้ inventory ที่เล่นอยู่

## ระบบที่เชื่อม

- ส่งต่อ HP, Level, EXP, Points, Status ranks, เงิน,วัสดุ,ยาวิ่ง,โล่,ระเบิด,weapon ownership/upgrades และแมกกาซีน/สำรองแต่ละชนิดผ่าน JSON ที่ตรวจ schema แล้ว Browser ใช้ sessionStorage; Electron ใช้ narrow IPC ที่ตรวจ sender และ main frame เดิม
- Chapter loadout ใช้ M4X/VX-9 และเก็บ SG-12 ด้วย E ที่ Security Armory ยังคงอาวุธเก่าและแมกกาซีนเดิม ปืนที่มีแล้วไม่รับแมกกาซีนใหม่ ไม่มีเป้าฝึกใน campaign
- Tab เปิด Status และใช้ Points; ตู้บริการที่ Control Center เปิดด้วย E ที่ x6,z72 ซื้อระเบิดและอัปเกรดปืนที่ถือด้วยเงิน/วัสดุ ไม่มีขายอาวุธหรือร้านที่เปิดได้จากทุกที่
- V ใช้ยาวิ่ง / C ใช้โล่ / Q เลือกระเบิด / G ขว้าง มี fuse และ collision/LOS สำหรับพื้นที่ความเสียหาย ใช้สูตรผลระเบิดเดิมโดยจำกัดที่ทางเดินในแผนที่
- Kill ให้เงิน/EXP ครั้งเดียว Level up ฟื้น HP ตามระบบ progression เดิม Projectile hit แจ้งตำแหน่งต้นทางให้ AI; mute ยังส่งเสียงใน gameplay
- อัตราศัตรู เวลา spawn และรางวัลเสบียงเป็น balance ชั่วคราว วัสดุและราคาอัปเกรดยังใช้สูตร legacy เดิม การแบ่งวัสดุสี่ประเภท/สูตรย้ายข้อมูลยังรอข้อกำหนด ไม่แต่งสูตรใหม่
- Preview แบบสำรวจแผนที่ยังแยกจาก campaign พร้อมเป้าฝึกและ reset เดิม Chapter 0/Survival ยังใช้ flow เดิม

## การตรวจและขอบเขต

Unit ล่าสุด 49/49 ผ่าน ตรวจ transfer, การปฏิเสธข้อมูลผิด, ลำดับภารกิจ, เงื่อนไขครบฝูง, navigation/one-use kill reward และ gate crossing รวมกับระบบเดิม

Browser Chapter 0 transition เล่นครบสามภารกิจ แล้วตรวจ progression/HP/inventory/magazines/reserves ตรงกับตอน extraction และตรวจ fresh replay ผ่าน Browser Chapter 1 เล่นครบตั้งแต่หน้าหลักจนข้ามประตู รวม Status, ตู้บริการ, ซื้อ/ขว้างระเบิด, pause, optional bus, shield, frozen completion และ viewport 800×600

Browser ล่าสุด 7/7 ชุดผ่าน: Chapter 0 + transfer/replay, Chapter 1, SG-12, screening preview, weapons, smoke และ map-desktop fixture Windows package build สำเร็จ เทียบ SHA-256 runtime 35 ไฟล์, Three.js module/core และ package metadata ตรงกับ source หลักฐานอยู่ใน `artifacts/phase9/`: walkthrough/transfer JSON, screenshots, logs, `package-integrity.json` และ `build/DeadZone-win32-x64/` ต้องเก็บทั้งโฟลเดอร์ร่วมกัน

รอบ regression แรกพบ test อ่าน activeEnemies กับคิว spawn คนละ snapshot ขณะตัวสุดท้ายกำลังเกิด จึงไปตรวจรางวัลก่อนกำจัดครบ แก้ test ให้อ่าน snapshot เดียวโดยคง assertions เดิม แล้วรอบล่าสุดผ่าน หลักฐานเดิมเก็บใน `initial-bus-sampling-race.log/json` ไม่ใช่การลดจำนวนศัตรูเพื่อให้ผ่าน

Browser ใช้ Edge/SwiftShader ไม่รับรอง GPU performance หรือผล native window จริง Windows native execution ยังยืนยันไม่ได้เพราะ Application Control บล็อก Electron ตามผลตรวจเดิม ไม่แก้นโยบายเครื่อง Entry checkpoint อยู่ใน session เดียวและใช้สำหรับ retry/reload ไม่ใช่ระบบ save ถาวร; กลับหน้าหลักหรือปิดแอปเริ่ม session ใหม่

ตรวจซ้ำ: เปิด `node server.mjs`, ตั้ง `PUPPETEER_MODULE` ตาม README แล้วใช้ `node --test tests/*.test.mjs`, `node tests/browser-chapter-one.mjs` และ `$env:CHAPTER1_TRANSITION_TEST='1'; node tests/browser-campaign.mjs` สำหรับ transfer

หยุดหลัง Phase 9 ขั้นถัดไปคือ Phase 10 Audio Pass
