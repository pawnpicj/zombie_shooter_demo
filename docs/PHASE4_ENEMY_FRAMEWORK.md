# Phase 4 — Basic Enemy Framework

วันที่: 5 ตุลาคม 2026

## Behavior

`enemies.mjs` แยกข้อมูลศัตรูและ logic ออกจาก Three.js: Walker (ใช้ ID เดิม `normal`), Runner และ Tank เดิม ใช้ state machine เดียวกัน มี idle, investigating, chasing, attacking, dead

- เริ่ม idle และไม่รู้ตำแหน่งผู้เล่นทั้งแผนที่
- ตรวจพบผู้เล่นใน visionRange เมื่อเส้นจากศัตรูถึงผู้เล่นไม่ผ่านที่กำบัง การมองเห็นเป็น omnidirectional ใน Phase นี้ ไม่มี cone หรือระบบแสง
- ยิงปืนส่ง `weapon-noise` จาก Phase 3 ศัตรูได้ยินเมื่ออยู่ในระยะที่น้อยกว่าหรือเท่ากับทั้ง soundRadius ของปืนและ hearingRange ของศัตรู ไม่เปิด alert ทุกตัว การ mute ไม่เปลี่ยน gameplay hearing
- เสียงผ่านที่กำบังได้ในแผนที่ Lab ปัจจุบัน ยังไม่มีระบบห้องหรือ map connectivity สำหรับจำกัด sound propagation
- ศัตรูไปยังสำเนาตำแหน่งที่ได้ยินหรือเห็นล่าสุด ไม่ติดตามตำแหน่งจริงของผู้เล่นหลังสูญเสียการมองเห็น ความจำหมดหรือถึงจุดตรวจแล้วกลับ idle
- Vision reacquisition เปลี่ยนกลับ chasing; melee ต้องเห็นผู้เล่นและอยู่ในระยะ พร้อม attack cooldown
- Damage แจ้งตำแหน่งต้นทางกระสุน ณ เวลายิง หรือจุดระเบิด ศัตรูที่รอดเริ่ม investigating; death เกิดครั้งเดียวและศัตรูตายไม่รับเสียงหรือโจมตี
- ใช้ cover steering, collision และ crowd separation เดิมในการเคลื่อนที่ ไม่เพิ่ม pathfinding บน graph ใน Phase นี้
- Simulation time ควบคุม memory และ attack cooldown การพักเกมหยุด AI; read-only telemetry เพิ่ม enemy ID/type/HP/position/state/stimulus/lastKnownPlayerPosition

Walker ช้าและทนกว่า Runner; Runner เร็วและโจมตีถี่กว่า เริ่มปรากฏเวฟ 2 ตามเดิม Tank ยังอยู่เวฟ 3 เป็นต้นไปใน Chapter 0/Survival ไม่มีการเพิ่มศัตรูอนาคตหรือแผนที่ Chapter 1

## Configurable provisional tuning

| Enemy | Vision | Hearing | Memory | Attack interval |
| --- | --- | --- | --- | --- |
| Walker | 18 m | 30 m | 8 s | 0.9 s |
| Runner | 20 m | 32 m | 10 s | 0.75 s |
| Tank (legacy) | 16 m | 30 m | 10 s | 0.9 s |

ค่าทั้งหมดอยู่ใน `ENEMIES` และเป็นค่าเริ่มต้นที่ยังต้องปรับจากการเล่นจริง การยิงมีความหมายต่อ awareness แล้ว ผู้เล่นอาจต้องเดินค้นหาศัตรูที่อยู่นอกระยะเสียง/หลังที่กำบังเพื่อเคลียร์เวฟ

## Validation

Unit: 27/27 ผ่าน รวม sight occlusion, range-limited hearing, last known position copy/expiry, arrival, melee cooldown, damage/death และ Walker/Runner/Tank configuration

Browser ล่าสุด **6/6 ผ่าน**: enemies, weapons, core, combat, campaign, supplies `npm run test:enemies` ตรวจการ spawn idle, การได้ยินขณะ mute, จำกัดระยะเสียง, การได้ vision, pause และ melee damage โดยใช้ input จริง

Combat และ campaign รอบแรกหลังเปิด server ไม่ผ่าน เพราะสคริปต์เดิมยืนยิงกลางแผนที่และคาดว่าศัตรูทุกตัวจะไล่ตาม ปืนยิงผ่าน cover ไม่ได้ และศัตรูไกลยัง idle จึงปรับสคริปต์ให้เดินค้นหาเมื่อศัตรูทุกตัว idle ด้วย keyboard input จริงผ่าน helper `tests/enemy-search.mjs` ไม่เปิด global alert ไม่เพิ่มกระสุนหรือแก้ state ใน tests ผลใหม่ผ่านทั้งการเคลียร์เวฟ การตาย/เริ่มใหม่ และสามภารกิจ เก็บผลรอบเดิมกับผลล่าสุดไว้แยกกัน

สถานะ: implementation และ Browser validation เสร็จแล้ว; Windows validation ยังไม่ยืนยัน

รอบแรกเปิด Browser tests ก่อน local server ทำงานจึงได้ ERR_CONNECTION_REFUSED เปิด server ใหม่และเก็บผลรอบตรวจจริงแยกเป็น `*-final.log` ใน `artifacts/phase4/` ใช้ Edge/SwiftShader ผ่าน Playwright/Puppeteer adapter เดิมจาก Phase 3

Windows source/packaged build ยังไม่ได้ยืนยันจากข้อจำกัด Electron runtime ที่บันทึกไว้ใน Phase 3 การผ่าน Browser ไม่ได้แทนการตรวจ native Windows

## Reproduce

```powershell
npm install
npm test
npm start
# อีก terminal; ตั้ง PUPPETEER_MODULE/CHROME_PATH ให้ตรงกับเครื่อง
npm run test:enemies
```

Phase ถัดไปใน roadmap คือ Phase 5 — Block Puzzle Map Framework
