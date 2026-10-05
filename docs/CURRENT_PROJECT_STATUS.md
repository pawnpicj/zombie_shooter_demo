# CURRENT PROJECT STATUS — DEAD ZONE: VIRUS X

สถานะล่าสุด 5 ตุลาคม 2026: Phase 10 Audio Pass เสร็จ มี positional weapon/creature audio, WAV 63 ไฟล์, reload 3 จังหวะ, เสียงสะท้อน/ambient 5 profiles, indoor/outdoor zones, door/footstep/impact และ LOCKDOWN cues พร้อม pause/mute/cleanup ผ่าน Unit 54/54 และ Browser 8/8 ชุด Chapter 0 carry-over และ Chapter 1 ยังเล่นผ่าน Windows package เทียบ code 38 ไฟล์ + audio 64 ไฟล์ (รวม manifest), Three.js และ metadata ตรงกับ source แต่ native execution ยังไม่ยืนยันด้วย Application Control เดิม ดู [PHASE10_AUDIO_PASS.md](PHASE10_AUDIO_PASS.md) รายงานด้านล่างเป็น baseline จาก Phase 1 ขั้นถัดไป Phase 11 Polish

วันที่ตรวจ: 5 ตุลาคม 2026 · เวอร์ชันเกม: 1.3.0 · ขอบเขต: Phase 1 — Audit Existing Project

## ผลการตรวจ

เกมปัจจุบันเป็นต้นแบบ Lab แบบ cutaway หนึ่งแผนที่ มีเนื้อเรื่องสามภารกิจและโหมด Survival ระบบผู้เล่น การยิง Level เงิน และไอเทมมี implementation ที่ใช้ต่อได้ จึงควรพัฒนาต่อจากของเดิมเป็นช่วงเล็ก ๆ

เนื้อเรื่องสามภารกิจที่มีอยู่ตรงกับ **Chapter 0** ของ ROADMAP แต่ตัวแปร `campaign.chapter` และ HUD ยังใช้คำว่า Chapter แทนลำดับภารกิจ ยังไม่มี Chapter 1 หรือพื้นที่ Doge City Screening Center

Phase 1 ตรวจ source, เอกสาร, dependency และ tests ของโครงการ โดยแยก generated artifacts และ dependency ออกจาก source ของเกม ไม่ได้เพิ่ม gameplay หรือเริ่ม Phase 2

## 1. โครงสร้างปัจจุบัน

ใช้ JavaScript ES modules สำหรับเกมและ CommonJS สำหรับ Electron ไม่มี frontend bundler, TypeScript หรือ framework UI เกมใช้ Three.js ผ่าน import map ที่ชี้ไปยัง dependency ภายในโครงการ

| ไฟล์ | หน้าที่ | สถานะและข้อสังเกต |
| --- | --- | --- |
| `game.js` — ประมาณ 600 บรรทัด | สร้างฉาก/ตัวละคร, input, camera, state, health, combat, enemy update, mission presentation, loop | จุดรวมระบบหลัก ต้องทยอยแยกเฉพาะส่วนที่ขวางการต่อยอด |
| `rules.mjs` | ขอบสนาม, wave configuration, bullet segment/circle collision, circle/box movement | ฟังก์ชันคำนวณแยกจาก renderer และมี unit tests |
| `progression.mjs` | EXP, Level, HP สูงสุด, Points, Status, critical calculation | ใช้ต่อได้; helper ยังมีสูตร wave tier แต่ runtime เรียกด้วย wave 1 |
| `story.mjs` | ข้อมูลสามภารกิจ, evidence, combat-clear/proximity checks | แยกข้อมูลและ logic บางส่วนแล้ว; ยังเป็น flow เฉพาะ Lab |
| `economy.mjs` | Weapon/grenade definitions, inventory, money, upgrades, loot, consumables | Pure logic ใช้ต่อได้; material/reserve ยังเป็นตัวเลขรวม |
| `supplies.js` — 162 บรรทัด | กล่อง, weapon racks, shop UI, grenade effects, sprint/shield runtime | รับ dependency ผ่าน API object แต่ยังรวม world/UI/runtime และพิกัด Lab |
| `hud.js` | ย่อ HUD หลัง 10 วินาทีและขยายเมื่อ hover | แยกจาก gameplay; timer ใช้เวลาจริงและทำงานขณะพักเกมด้วย |
| `index.html`, `style.css` | HUD, pause, Status, shop, responsive/desktop styling | UI ทำงานร่วมกับ DOM IDs ที่ gameplay อ้างโดยตรง |
| `desktop.js`, `preload.cjs` | Window controls และ narrow IPC bridge | รองรับเฉพาะ Electron; Browser ใช้เกมเดียวกัน |
| `electron-main.cjs` | เปิด local files, โหมดหน้าต่าง, settings, desktop self-test | Context isolation/sandbox เปิด, renderer ไม่มี Node integration |
| `server.mjs` | Node HTTP static server ที่ 127.0.0.1:5173 | ใช้สำหรับ Browser; แอป Windows ไม่ต้องรัน server |
| `tests/` | Unit และ Browser integration tests | 4 unit-test files / 14 cases และ 6 Browser scripts |
| `README.md`, `STORY.md` | วิธีเล่นและเนื้อเรื่อง pilot | อธิบาย v1.3 ปัจจุบัน; ไม่ได้หมายความว่าข้อกำหนดใหม่ใน ROADMAP ทำเสร็จแล้ว |
| `rolemap/ROADMAP.md` | Roadmap และข้อยืนยันล่าสุด §56 | แหล่งอ้างอิงสำหรับงานระยะต่อไป |

Dependency ที่ติดตั้ง: Three.js 0.180.0, Electron 44.5.1, Electron Packager 20.3.0
เครื่องทดสอบ: Windows x64, Node.js 24.16.0, npm 11.13.0, Chrome 154.0.8037.94, Puppeteer 25.2.0

โฟลเดอร์นี้ไม่ได้อยู่ใน Git repository ที่คำสั่งตรวจพบ จึงใช้ SHA-256 manifest ของ runtime/source tests เพื่อยืนยันว่า audit ไม่เปลี่ยนโค้ด

## 2. ระบบ gameplay ที่มีอยู่

| ระบบ | สิ่งที่มีจริง |
| --- | --- |
| ผู้เล่น | WASD/ลูกศร, เมาส์เล็ง, ยิงค้าง, พุ่งหลบ, animation ขาแบบ procedural |
| Camera/Collision | Orthographic camera ตามผู้เล่นบางส่วน; ขอบสนามและการชนที่กำบัง; simulation substeps สูงสุด 1/60 วินาที |
| Health/Death | HP, damage, invulnerability สั้น ๆ, medkit, death summary, restart |
| State/Pause | Ready/playing/paused/dialogue/won/dead/stats/shop; blur และ hidden tab พักเกม; เมนูพัก simulation |
| Level/Status | EXP จาก kills; +20 max HP และ heal เต็มต่อ Level; +3 Points; 5 Status และ critical chance/damage |
| อาวุธ | M4, SMG, Shotgun แบบ pellet spread, DMR; เก็บอาวุธจาก Lab และสลับด้วย F; paid upgrades แยกกระบอก |
| กระสุน | Magazine รวม 30 นัด; reserve มีจำนวนจริง ใช้เมื่อ reload; ทุกปืนใช้ reserve และ magazine state เดียวกัน |
| ศัตรู | Normal/Walker-like, Runner ตั้งแต่ wave 2, Tank ตั้งแต่ wave 3; chase, cover steering, local separation, melee, damage/death |
| เงิน/วัสดุ | Kill rewards; เงินและ material count รวม; upgrade ต้องมีเงินและวัสดุเพียงพอ |
| Loot | Material/random/ammo crates; random ให้ material/ammo/sprint/shield; ไม่ให้ปืนหรือระเบิด |
| ไอเทม | Sprint potion +35% 12 วินาที; shield ดูดซับ damage ก่อน HP พร้อม aura |
| ระเบิด | Molotov fire zone, demolition AoE, cluster +6 fragments; ซื้อเท่านั้น; Q/G เลือก/ขว้าง |
| Shop | กด B เปิดได้ทุกที่ขณะเล่น/พัก; อัปเกรดปืนที่มีและซื้อระเบิด; ยังไม่มีตู้ในฉาก |
| Lab missions | Clear enemies → SECURITY log → RESEARCH formula/sample → EXTRACTION; E และ proximity gate; จบและเล่นใหม่ได้ |
| Survival | Waves เพิ่มจำนวน/health/speed; ไม่มี Chapter 1 |
| HUD | HP, weapon/ammo, objective, Points/EXP, currencies/consumables; radio/mission/weapon compact และ hover |
| Windows | Windowed/borderless/fullscreen, presets, minimize/maximize/close; เปลี่ยนหน้าต่างโดยคง run state |
| Persistence | High score ใน localStorage และ window settings ของ Electron เท่านั้น; ยังไม่มี game save/load |

ระหว่างสามภารกิจใน Lab จะคง progression/inventory ไว้ แต่หลังจบ pilot ปุ่มเริ่มใหม่จะ reset run ทั้งหมด ไม่มีเส้นทางส่งต่อไป Chapter 1 ในขณะนี้

## 3. เทียบกับแต่ละ Phase ของ ROADMAP

“มีระบบเดิม” หมายถึง implementation ที่นำมาต่อยอดได้ ไม่ได้เป็นการปิด Phase ถัดไปล่วงหน้า

| Phase | สถานะ ณ Phase 1 | ช่องว่าง |
| --- | --- | --- |
| 1 — Audit | รายงานและ baseline ของการตรวจครั้งนี้ | ผลการทดสอบอยู่ด้านล่าง |
| 2 — Core Player | ระบบพื้นฐานมีอยู่ | ยืนยัน interface/state ownership และ E interaction ที่ใช้ร่วมกันก่อนขยายฉาก |
| 3 — Weapon Framework | มีการยิง/reload/switch/config multipliers | VX-9/M4X, magazines/reserves แยกปืน/ชนิด, accuracy/range/recoil, slots, audio/noise events |
| 4 — Basic Enemy Framework | Normal และ Runner มี chase/attack/death | Idle/detection/alert state, vision/hearing, last-known position และ sound reaction |
| 5 — Block Puzzle Maps | ยังไม่มี | DOT, LINE_2/3/5, I/O/T/L/J/S/Z, rotation, connections, navigation, door/spawn/objective data |
| 6 — Chapter 0 Validation | มี pilot สามภารกิจ | ยืนยัน regression หลัง shared-system changes และแยก Chapter ID จาก Mission ID |
| 7 — Chapter 1 Areas | ยังไม่มี | Highway, waiting/screening, security/medical, quarantine/isolation, control, buses, gate |
| 8 — SG-12 | มี legacy Shotgun | SG-12 ใหม่ที่ Security Armory, 6 shells, short range, stopping power, loudness/audio profile |
| 9 — Chapter 1 Missions | ยังไม่มี | Silent Checkpoint → Isolation Ward → Lockdown → Last Bus → เดินเข้าประตูเมือง |
| 10 — Audio Pass | มี global oscillator tones | Positional samples/variants, reload/dry-fire, ambience, indoor/outdoor audio zones |
| 11 — Polish | มีพื้นฐาน lighting/feedback/UI | ทำหลัง Chapter 1 เล่นได้; ยังไม่ได้วัด FPS/performance สำหรับแผนที่ใหม่ |

ไม่เพิ่ม future chapters, future weapon/enemy concepts หรือบทบาทระยะยาวของ Marcus ระหว่าง audit

## 4. ข้อตกลงล่าสุดที่ยังต้อง implement

| ข้อตกลง §56 | ปัจจุบัน | งานที่ยังเหลือ |
| --- | --- | --- |
| Legacy roster อยู่ Chapter 0/Survival | ทุก mode ใช้ definitions ชุดเดียว | Roster/filter ตาม chapter/mode โดยรักษา SMG/DMR/Tank เดิม |
| Chapter 1: VX-9, M4X, SG-12 และ Walker/Runner | ยังไม่มี Chapter 1 definitions | สร้างใน Phase ที่เกี่ยวข้อง; อย่านำ legacy names มาเท่ากับอาวุธใหม่โดยอัตโนมัติ |
| อาวุธจากพื้นที่เนื้อเรื่อง | พบจากพิกัด Lab เท่านั้น | ให้ map/loot configuration ระบุ discovery points รวมถึง Security Armory |
| ตู้อัปเกรด/ระเบิด | Global shop จาก B | Physical terminal + E/proximity/access guard; ยังคง purchase-only grenades |
| Carry progression/inventory ข้าม Chapter | คงข้อมูลระหว่าง Lab missions; จบแล้ว restart/reset | แยก new run ออกจาก chapter transition และเก็บ ownership/upgrades |
| Polymer, Weapon Parts, High-Grade, Gun Powder | `materials: 0` ตัวเลขเดียว | Typed inventory, configurable loot/recipes, UI และ migration policy |
| วัสดุใหม่มี balance ที่กำหนด | ยังไม่ได้กำหนด | TODO: สูตร upgrade, จำนวน/น้ำหนักดรอป และการแปลงวัสดุเดิม; ไม่อ้างค่าที่เดาเป็นข้อตกลง |
| สาม weapon slots | ถือปืนที่เก็บทั้งหมดและวน F | Loadout selection และ storage/ownership policy ในขั้น weapon framework |

## 5. ระบบที่ควรใช้ต่อ

- `rules.mjs`: collision math และ wave definitions; แยก arena bounds ออกจากสมมุติฐาน Lab เมื่อถึง map framework
- `progression.mjs`: Level/Points/critical logic; รักษาความสัมพันธ์กับ weapon stats
- `economy.mjs`: transaction guards, purchase-only grenades, loot restrictions; ค่อยขยาย inventory schema
- `story.mjs`: เก็บเนื้อเรื่องนอก render code และตรวจ clear/proximity ได้แล้ว; ต่อด้วย generic objective state
- `supplies.js`: API dependency injection ใช้เป็นจุดเชื่อมที่ดี; แยก loot spawn data และ terminal access ภายหลัง
- `hud.js` และ native shell: ใช้ต่อโดยรักษา compact timing, pause semantics และ window controls
- Read-only `window.zombieShooter` telemetry และ tests เดิม: ใช้ตรวจ regression ระหว่างการแยกระบบ

## 6. หนี้ทางเทคนิคและข้อจำกัด

รายการต่อไปนี้แยกจากข้อผิดพลาด runtime ที่ตรวจพบ ไม่ได้หมายความว่าเกมปัจจุบันเล่นไม่ได้

| ID | หลักฐานใน source | ผลต่อ roadmap / แนวทาง |
| --- | --- | --- |
| T01 | `game.js` รวม render/input/player/combat/enemy/UI/state ใน ประมาณ 600 บรรทัด | ขยายหลาย map/enemy เสี่ยงกระทบ pilot; แยกอย่าง incremental เฉพาะระบบที่ต้องเปลี่ยน |
| T02 | `rules.mjs:2`, `game.js:172,357,429`, `economy.mjs:13` | Magazine/reserve รวม ใช้กับ 15/30/6 นัดและ ammo 3 ชนิดไม่ได้; ทำ per-weapon state ใน Phase 3 |
| T03 | `game.js:170,393`, `economy.mjs:40` | Stats ส่วนหนึ่งเป็น shared base; ไม่มี per-weapon range/accuracy/recoil/stoppingPower/soundRadius |
| T04 | ฉาก/obstacles/stations ใน `game.js`; spawn coordinates ใน `supplies.js:39` | ข้อมูล map ปน renderer; ยังไม่มี block connectors, rotation หรือ navigation |
| T05 | `game.js:360,422` | ศัตรู chase player จริงทุกตัว ไม่มี idle/awareness; การยิงไม่ notify hearing |
| T06 | `game.js:177,333` | Global Web Audio oscillator; ไม่มี Three positional audio หรือ audio assets |
| T07 | `story.mjs`, `game.js:305,318,333` | `chapter` เป็น Mission index และ radio/transition มีเงื่อนไขเฉพาะสามภารกิจ |
| T08 | `supplies.js:74`, `economy.mjs:13` | Shop ทุกที่และ material scalar ไม่ตรงข้อตกลงใหม่; ไม่ควรลบระบบเงิน/loot ที่ทำงานอยู่ |
| T09 | `game.js:333` และ persistence calls | ไม่มี serializer/version/migration/save; chapter handoff ต้องไม่เรียก new-run reset |
| T10 | Browser scripts ใช้ Math.random และ timeouts; Puppeteer มาจากโครงการอื่น | ผลเส้นทาง/loot อาจต่างกัน; browser test setup ยังไม่ self-contained ใน package.json |
| T11 | Separation loop ใน `game.js:465`; HUD writes ใน update ทุก substep | มี O(n²) และ DOM updates ที่ควรวัดเมื่อถึง performance phase; ยังไม่มี profiling เพื่ออ้างว่าเป็น bottleneck จริง |
| T12 | HUD/README ใช้ “Chapter” สำหรับ pilot missions | แยก vocabulary ของ chapter/mission ให้ชัดก่อน Chapter 1 โดยไม่เปลี่ยนเนื้อเรื่อง |

ระบบ safe room และ persistent save ยังไม่ทำตามข้อจำกัดใน ROADMAP; ไม่ควรเพิ่มระบบใหญ่ก่อนมีความจำเป็น

## 7. Baseline การรันและการทดสอบ

| การตรวจ | ผล |
| --- | --- |
| Unit tests (`npm test`) | ผ่าน 14/14 |
| Browser integration | ผ่าน 6/6: smoke, combat, level, HUD, campaign, supplies |
| Windows audit build | ผ่าน; สร้างแยกใน `artifacts/phase1/build/` โดยไม่ทับ `dist` |
| Desktop source self-test | ผ่าน |
| Packaged desktop self-test | รอบแรกไม่ผ่าน resume assertion; รันซ้ำด้วย build เดิมผ่าน |
| Source integrity | runtime/tests 25 ไฟล์ไม่เปลี่ยน; runtime ใน app.asar 13 ไฟล์ตรงกับ source |

**R01 — Desktop resume self-test ไม่เสถียร:** รอบแรกพบ `paused` แทน `playing` หลังคลิกกลับเข้าเกม (`electron-main.cjs:108`); รอบซ้ำผ่านโดยไม่แก้โค้ด เก็บผลทั้งสองรอบไว้ สาเหตุยังไม่ยืนยัน อาจเกี่ยวกับ focus/visibility timing เพราะเกมพักเมื่อเสีย focus (`game.js:564`, `game.js:566`) ต้องตรวจใน Phase 2 ก่อนสรุปว่าเป็นบั๊กการเล่นจริง

`Invalid display mode` ใน desktop error log เป็นการทดสอบ rejection ของค่าไม่ถูกต้องที่ตั้งใจไว้ แยกจาก resume assertion ข้างต้น


หลักฐานทั้งหมดเก็บที่ `artifacts/phase1/`:
- `environment.json`: เครื่องมือที่ใช้
- `unit.log`, `unit-result.json`: unit baseline
- `browser-*.log`, `browser-results.json`: integration baseline
- `build.log`, `build-result.json`: audit build
- Source/packaged desktop logs และ screenshot
- Runtime SHA-256 manifests ก่อน/หลัง audit

ข้อจำกัด coverage:
- Browser tests ใช้ headless Chrome กับ SwiftShader; ไม่ใช่ผล FPS บน GPU ของผู้เล่น
- Desktop self-test ตรวจ shell/renderer และรักษา run state; ไม่ได้เล่นทั้ง campaign ใน .exe
- การฟังคุณภาพเสียงจริง ความตึงเครียด gameplay และ balance ไม่ได้รับการยืนยันจาก automated checks
- ไม่ได้ทดสอบผู้เล่นหลายคน มือถือ หรือ future maps เพราะไม่ได้อยู่ใน implementation ปัจจุบัน

## 8. งานถัดไปที่แนะนำ — Phase 2 เท่านั้น

1. ตรวจ R01 ให้ได้ข้อสรุปและทำ focus/resume self-test ให้เสถียร พร้อมใช้ baseline นี้ตรวจรับ movement/camera/collision/health/damage/death/E/HUD ที่มีอยู่ก่อนเขียนเพิ่ม
2. กำหนด player/run context ให้ชัด แยก state/input/health เฉพาะส่วนที่ shared systems ต้องใช้ แทนการย้ายทั้งโครงการ
3. เตรียม E interaction contract ที่ให้ target ระบุ action, distance, availability และ callback โดยรักษา mission-clear gate กับ loot เดิม
4. รักษา public telemetry และทดสอบ Browser/Windows หลังการเปลี่ยนที่มีผลจริง
5. ปิด Phase 2 เมื่อ core regression ผ่าน แล้วจึงเริ่ม per-weapon ammo/definitions ใน Phase 3

เกณฑ์ตรวจรับ Phase 2: เดิน/ชน/กล้อง/HP/รับ damage/ตาย/เริ่มใหม่/พัก/กลับเกม/E prompts ทำงาน; ภารกิจ pilot ทั้งสามและ Survival ยังเล่นได้; menus/window modes ไม่ล้าง state

วัสดุใหม่ สูตรอัปเกรด loadout mapping และตำแหน่งตู้ต้องออกแบบในขั้นที่เกี่ยวข้อง ใช้ TODO จนมีข้อกำหนดชัดเจน ไม่กระโดดไปสร้าง Chapter 1 หรือเปลี่ยน balance ระหว่าง Phase 1

## 9. สิ่งที่เปลี่ยนใน Phase 1

สร้างรายงานนี้และบันทึกสถานะ Phase 1 ใน ROADMAP พร้อมหลักฐาน baseline ที่ `artifacts/phase1/` ไม่แก้ runtime, tests, package configuration หรือ gameplay และไม่เริ่ม Phase 2

Phase 1 เสร็จในขอบเขต audit; R01 เป็นผลตรวจที่ต้องติดตาม ไม่ได้ปิดว่า Windows self-test เสถียรแล้ว



## Latest implementation update — 2026-10-05

Phase 2 completed after this audit. See [PHASE2_CORE_SYSTEMS.md](PHASE2_CORE_SYSTEMS.md) for changes, final validation, and remaining test limitations. Sections above remain the Phase 1 baseline.
