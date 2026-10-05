# DEAD ZONE: VIRUS X
## Master Development Roadmap

## 1. Project Overview

DEAD ZONE: VIRUS X is a 3D survival horror / action game built with Three.js.

Core gameplay pillars:

- Survival horror
- Shooting combat
- Exploration
- Story investigation
- Block Puzzle based maps
- Environmental storytelling
- Resource management
- Zombie and mutant encounters

The game should prioritize atmosphere, tension, exploration, and meaningful combat rather than becoming a pure arcade shooter.

---

# 2. Core Story

REGEN-X was a medical research project designed to develop treatments for severe tissue damage.

Virus X was part of the REGEN-X research.

During testing, Virus X produced uncontrolled effects.

When containment failed, patients and research personnel became infected.

John Valentine, a special operations soldier, was deployed into the research facility after communications were lost.

His original mission was:

- Recover research data
- Determine what happened
- Recover the REGEN-X formula
- Recover a Virus X sample
- Extract from the facility

John later discovers that the infected enemies he has been fighting were originally patients, researchers, medical personnel, and security staff.

The game must never provide real-world instructions for creating pathogens or biological agents.

Virus X and REGEN-X are entirely fictional.

---

# 3. Game Structure

Current planned structure:

```text
PROLOGUE
CHAPTER 0 — THE LAST SIGNAL
REGEN-X Research Facility

        ↓

CHAPTER 1 — DOGE CITY
Doge City Screening & Quarantine Center

        ↓

Doge City

        ↓

Future Chapters
```

Future chapters will be designed later.

Do not invent future chapters unless explicitly requested.

---

# 4. Chapter 0 — THE LAST SIGNAL

Chapter 0 already represents the pilot/prologue.

Location:

REGEN-X Research Laboratory.

The entire chapter currently uses one cutaway laboratory map.

The player must clear enemies before interacting with mission objectives.

Interaction key:

```text
E
```

---

## Mission 1 — Last Signal

Objectives:

- Eliminate infected enemies
- Reach the SECURITY console
- Recover the final log from Dr. Mira

The log reveals:

- Virus X originated from REGEN-X research
- The research originally had medical value
- Containment failed
- Virus X caused unexpected effects

---

## Mission 2 — A Formula Worth Saving

Objectives:

- Reach the RESEARCH console
- Recover REGEN-X research files
- Recover the Virus X sample

John reports that:

- The research is incomplete
- The sample must be returned for analysis
- The infected cannot be cured immediately inside the laboratory

---

## Mission 3 — Extraction

Objectives:

- Survive the final infected wave
- Reach the extraction point
- Leave with the REGEN-X research and Virus X sample

The facility is quarantined.

Medical teams begin analyzing the recovered materials.

---

# 5. Chapter 1 — DOGE CITY

John does NOT begin directly inside Doge City.

Chapter 1 begins at:

# Doge City Screening & Quarantine Center

This facility is located directly outside the main entrance to Doge City.

Its purpose was to screen civilians before allowing entry or evacuation.

The screening center became one of the first major outbreak sites outside the REGEN-X laboratory.

---

# 6. Chapter 1 Atmosphere

Opening mood:

- Evening or nighttime
- Light rain or wet environment is preferred
- Emergency lighting
- Abandoned vehicles
- Ambulances
- Civilian luggage
- Medical tents
- Checkpoint barriers
- Flickering lights
- Distant sirens
- No obvious large zombie horde immediately

The opening should create the feeling:

```text
Something happened here very recently.
```

Do not begin Chapter 1 with nonstop combat.

The tension should gradually increase.

---

# 7. Chapter 1 Mission Structure

## Mission 1 — SILENT CHECKPOINT

Primary objective:

```text
Investigate the Doge City Screening Center.
```

John arrives at the highway entrance.

Environmental storytelling should include:

- Abandoned civilian vehicles
- Ambulances
- Medical equipment
- Masks
- Bags
- Screening documents
- Blood trails
- Empty security positions

Example screening terminal:

```text
DOGE CITY SCREENING STATUS

Processed: 1,847
Cleared: 1,623
Observation: 143
Isolation: 81

STATUS:
SYSTEM FAILURE
```

These values can remain configurable.

---

# 8. Mission 2 — ISOLATION WARD

John enters the Isolation Wing.

Atmosphere:

- Emergency red lights
- Locked doors
- Broken observation windows
- Medical rooms
- Distant impacts behind doors
- Low visibility

Story discovery:

Patients showing abnormal symptoms had been moved here.

Some showed unusual tissue recovery.

A research log may mention:

```text
Patient 34 displayed abnormal tissue recovery following cardiac arrest.
```

Do not provide real-world scientific procedures.

The information must remain fictional and narrative-focused.

---

# 9. Mission 3 — LOCKDOWN

John reaches the facility security/control system.

System status:

```text
DOGE CITY EMERGENCY PROTOCOL

CITY GATE: LOCKED
SCREENING CENTER: COMPROMISED
MEDICAL RESPONSE: OFFLINE
MILITARY RESPONSE: UNKNOWN
```

When the player activates the system:

- Power interruption occurs
- Isolation doors unlock
- A large infected encounter begins

Objective:

```text
SURVIVE THE OUTBREAK
```

After the encounter John discovers:

```text
AUTHORIZATION:
BLACK-7

ORDER:
SEAL DOGE CITY

EVACUATION STATUS:
DENIED
```

This should be the first hint that the quarantine may not have been purely accidental.

---

# 10. Mission 4 — THE LAST BUS

John reaches the evacuation bus area.

Several buses remain abandoned.

Environmental storytelling:

- Empty buses
- Locked buses
- Blood
- Emergency supplies
- Personal belongings

One optional bus can contain infected enemies.

Opening it should be optional.

Possible reward:

- Ammunition
- Medical item
- Story document

---

# 11. Chapter 1 Survivor

Possible early survivor:

# Marcus Hale

Background:

Former Doge City police officer.

Marcus survived by locking himself inside a security/control room.

Possible dialogue:

```text
Marcus:
"They told us nobody leaves the city."

John:
"Who?"

Marcus:
"Military."

John:
"Why?"

Marcus:
"You tell me.
You're wearing their uniform."
```

Marcus should create tension between John and the military command structure.

Do not make Marcus permanently important yet.

His future role can be decided later.

---

# 12. Entering Doge City

After restoring the gate system John reaches the main city entrance.

The player sees Doge City for the first time.

Visual elements:

- Mostly dark skyline
- Fires in distant buildings
- Emergency lights
- Smoke
- Distant sirens
- Damaged vehicles
- Possible crashed helicopter

John receives a survivor transmission:

```text
"If anyone can hear this...
we're still alive."
```

John reports:

```text
John:
"Command, I have survivors inside the city."

Command:
"Your mission is the sample, Valentine."
```

New objective:

```text
ENTER DOGE CITY
```

The player should physically walk through the city gate.

Do not replace this with a cutscene unless specifically requested later.

---

# 13. Block Puzzle Map System

The game's maps should use a modular Block Puzzle design.

Maps are created from reusable puzzle-shaped room/area modules.

The system should support rotations.

The system must be reusable for future chapters.

---

# 14. Supported Block Types

## Single Block

```text
■
```

Size:

```text
1x1
```

Possible use:

- Small storage
- Terminal room
- Loot room
- Save room
- Small checkpoint

---

## Line 2

```text
■■
```

or

```text
■
■
```

Possible use:

- Short corridor
- Gate
- Small room connection

---

## Line 3

```text
■■■
```

Possible use:

- Corridor
- Road section
- Medical wing
- Small combat lane

---

## Line 5

```text
■■■■■
```

Possible use:

- Highway
- Long corridor
- Horde encounter
- Chase section

---

# 15. Tetromino Blocks

## I Block

```text
■■■■
```

Rotatable.

Purpose:

- Road
- Corridor
- Shooting lane

---

## O Block

```text
■■
■■
```

Purpose:

- Arena
- Waiting area
- Large room
- Combat encounter

---

## T Block

```text
■■■
 ■
```

Purpose:

- Objective hub
- Screening area
- Control center
- Multiple paths

---

## L Block

```text
■
■
■■
```

Purpose:

- Security office
- Exploration
- Ambush
- Hidden room opportunities

---

## J Block

```text
 ■
 ■
■■
```

Purpose:

- Medical wing
- Exploration
- Alternate route

---

## S Block

```text
 ■■
■■
```

Purpose:

- Horror section
- Isolation wing
- Limited visibility
- Ambush encounters

---

## Z Block

```text
■■
 ■■
```

Purpose:

- Quarantine ward
- Mutated enemy section
- Indirect sightlines

---

# 16. Chapter 1 Block Layout

Recommended gameplay flow:

```text
JOHN START

    ↓

LINE 5
Highway Entrance

    ↓

O BLOCK
Waiting Area

    ↓

T BLOCK
Main Screening Area

   ↙       ↘

L BLOCK     J BLOCK
Security     Medical Wing

   ↓            ↓

Z BLOCK      S BLOCK
Quarantine   Isolation

      ↘      ↙

       T BLOCK
     Control Center

          ↓

       LINE 3
       Bus Depot

          ↓

       LINE 2
       City Gate

          ↓

       DOGE CITY
```

This is a gameplay layout concept, not a strict architectural blueprint.

The final map should not appear perfectly symmetrical.

---

# 17. Map Block Requirements

Every map block must support:

- Unique block ID
- Block type
- Rotation
- Position
- Door connection points
- Enemy spawn points
- Loot spawn points
- Objective spawn points
- Lighting settings
- Environment theme
- Audio zone
- Optional locked connections

Avoid hardcoding maps directly into render code.

Use configuration/data definitions.

Example conceptual structure:

```js
{
    id: "screening_main",
    type: "T",
    rotation: 0,

    connections: [
        "north",
        "west",
        "east"
    ],

    environment: "screening",

    enemies: [],

    loot: [],

    objectives: []
}
```

Exact implementation can differ based on the existing architecture.

---

# 18. Combat Philosophy

DEAD ZONE should NOT become a run-and-gun arcade shooter.

Combat should feel dangerous.

Core principles:

- Ammunition matters
- Enemies should pressure positioning
- Reload timing matters
- Weapon choice matters
- Loud weapons attract enemies
- Encounters should interact with map layout

---

# 19. Weapon System

Initial weapon roster:

```text
VX-9
M4X Tactical Rifle
SG-12 Tactical Shotgun
```

Future weapons may include:

```text
VX-45 Heavy Pistol
MP-7X SMG
ARX-45 Assault Rifle
DMR-8 Marksman Rifle
HX-90 Heavy Weapon
```

Do NOT implement future weapons until requested.

---

# 20. VX-9 Pistol

Role:

John's standard sidearm.

Gameplay characteristics:

```text
Damage      Low-Medium
Fire Rate   Medium
Accuracy    High
Range       Medium
Mobility    High
```

Suggested starting magazine:

```text
15
```

Ammo:

```text
9mm
```

The exact balance values should remain configurable.

---

# 21. M4X Tactical Rifle

Role:

John's primary weapon at the beginning of Chapter 1.

Characteristics:

```text
Damage      Medium
Fire Rate   High
Accuracy    High
Range       Medium-High
Mobility    Medium
```

Suggested magazine:

```text
30
```

Ammo:

```text
Rifle Ammo
```

Do not provide unlimited rifle ammunition.

---

# 22. SG-12 Tactical Shotgun

The SG-12 should be the first major weapon discovery in Chapter 1.

Location:

```text
Security Armory
Doge City Screening Center
```

Characteristics:

```text
Damage          Very High
Fire Rate       Low
Range           Short
Stopping Power  Very High
Mobility        Medium-Low
```

Suggested capacity:

```text
6
```

The SG-12 should immediately feel significantly more powerful than the pistol.

Its disadvantages:

- Slow reload
- Limited ammunition
- Shorter effective range
- Very loud

---

# 23. Weapon Stats

Weapons should support configurable stats:

```text
damage
fireRate
accuracy
range
recoil
reloadSpeed
magazineSize
ammoType
stoppingPower
soundRadius
```

Do not scatter weapon values across gameplay code.

Weapons should be data-driven.

Example:

```js
const weaponDefinitions = {
    vx9: {
        name: "VX-9",
        type: "pistol",

        damage: 25,
        magazineSize: 15,

        ammoType: "9mm",

        fireRate: 0.22,

        soundRadius: 15
    },

    m4x: {
        name: "M4X Tactical Rifle",
        type: "rifle",

        damage: 34,
        magazineSize: 30,

        ammoType: "rifle",

        fireRate: 0.09,

        soundRadius: 25
    }
};
```

These values are examples and should be tuned through gameplay testing.

---

# 24. Ammo System

Keep ammunition understandable.

Initial ammunition categories:

```text
9mm Ammo

Rifle Ammo

Shotgun Shells

Heavy Ammo
```

For Chapter 1 only these are required:

```text
9mm
Rifle Ammo
Shotgun Shells
```

---

# 25. Weapon Slots

Recommended loadout:

```text
Primary Weapon
Secondary Weapon
Sidearm
```

Example:

```text
Primary:
M4X

Secondary:
SG-12

Sidearm:
VX-9
```

The player should not carry every weapon simultaneously.

---

# 26. Weapon Audio

Gun audio is an important part of gameplay.

Use:

```text
THREE.AudioListener
THREE.PositionalAudio
THREE.AudioLoader
```

Weapon audio must support spatial positioning.

Do not use a single gunshot sample repeatedly.

Each weapon should support multiple firing variations.

Example audio structure:

```text
sounds/
  weapons/

    vx9/
      fire_01.ogg
      fire_02.ogg
      fire_03.ogg
      fire_04.ogg

      reload_mag_out.ogg
      reload_mag_in.ogg
      reload_slide.ogg

      dry_fire.ogg
      equip.ogg

    m4x/

    sg12/
```

---

# 27. Gunshot Variation

When firing:

Randomly select one compatible gunshot sample.

Minor playback variation may be used.

Example concept:

```js
playbackRate = random between 0.97 and 1.03
```

Do not exaggerate pitch randomization.

The weapon must still sound consistent.

---

# 28. Environmental Weapon Audio

Weapon sounds should react to environment type.

Audio environments:

```text
OUTDOOR

SMALL_ROOM

LARGE_ROOM

UNDERGROUND

WAREHOUSE
```

Example:

Outdoor pistol:

```text
Gunshot
+
Short outdoor tail
```

Indoor pistol:

```text
Gunshot
+
Room reflection
```

Underground:

```text
Gunshot
+
Longer echo/reverb
```

Do not require completely separate recordings for every environment if the current architecture can apply environmental audio effects.

---

# 29. Gunshot Gameplay Mechanic

Gunshots must not only be cosmetic.

Every weapon should have:

```text
soundRadius
```

Nearby zombies can react to loud weapons.

Example conceptual balance:

```text
VX-9
Sound Radius: Low-Medium

M4X
Sound Radius: Medium-High

SG-12
Sound Radius: High
```

Therefore:

```text
More powerful weapon
=
More attention from infected
```

This mechanic should interact with Block Puzzle maps.

Example:

Firing a shotgun in an S Block isolation ward may attract infected from adjacent connected blocks.

---

# 30. Enemy System

Start simple.

Initial required infected:

## Walker

Characteristics:

- Slow
- Basic infected
- Usually encountered in groups
- Low individual threat
- Dangerous when surrounding the player

---

## Runner

Characteristics:

- Fast
- Aggressive
- Lower durability than heavy infected
- Pressures the player to reposition

Runner should appear later than Walker.

Do not expose every enemy type immediately.

---

# 31. Future Enemy Types

Future concepts only:

```text
Crawler
Spitter
Brute
Regenerator
Stalker
Hive Carrier
```

Do not implement these until requested.

---

# 32. Enemy Hearing

Enemies should eventually support:

```text
visionRange
hearingRange
alertState
lastKnownPlayerPosition
```

Weapon sound events should notify eligible enemies.

Do not have every zombie on the entire map instantly know the player's location.

Sound propagation should respect reasonable distance and eventually map connectivity.

---

# 33. Interaction System

Primary interaction key:

```text
E
```

Used for:

- Terminals
- Doors
- Objectives
- Items
- Logs
- Consoles
- Story interactions

Interaction UI should clearly show:

```text
[E] Interact
```

or contextual variants:

```text
[E] Open

[E] Read

[E] Access Terminal

[E] Pick Up
```

---

# 34. Mission System

Mission logic must be separate from rendering code.

Mission system should support:

```text
missionId
objectiveId
objectiveState
requiredEnemyClear
interactionTarget
nextObjective
storyEvent
```

Example:

```text
Mission:
Silent Checkpoint

Objective:
Reach Screening Console

State:
ACTIVE
```

After completion:

```text
Objective:
Investigate Isolation Wing
```

---

# 35. Story Log System

Story should primarily be delivered using:

- Terminals
- Documents
- Radio dialogue
- Environmental storytelling
- Short text sequences

Do not require cinematic cutscenes yet.

Logs should be stored separately from gameplay code.

Example:

```text
story/
  chapter0.json
  chapter1.json
```

or equivalent architecture.

---

# 36. Save / Safe Room

Future-ready architecture should support:

- Save points
- Storage
- Equipment selection
- Story log review

Do not build a complex safe-room system unless the existing game needs it immediately.

---

# 37. Visual Style

Preferred overall direction:

```text
Dark
Industrial
Medical
Military
Abandoned
Wet surfaces
Emergency lights
Strong shadows
Limited visibility
```

Avoid overly colorful arcade visuals.

Important colors may include:

- Emergency red
- Medical cold white
- Security blue
- Warning amber
- Infection green only when appropriate

Do not overuse colored lights.

---

# 38. UI Style

UI should be:

- Minimal
- Tactical
- Dark
- Easy to read
- Suitable for survival horror

Possible HUD elements:

```text
Health
Current Weapon
Ammo
Objective
Interaction prompt
```

Avoid displaying excessive RPG statistics during normal gameplay.

---

# 39. Technical Architecture

Before changing the project:

Inspect the entire existing codebase.

Do NOT rewrite the project from scratch.

Preserve working functionality.

Systems should remain modular.

Recommended separation:

```text
src/

  core/

  player/

  combat/

  weapons/

  enemies/

  audio/

  maps/

  missions/

  story/

  ui/

  config/
```

This is a recommendation.

Do not restructure the entire project unnecessarily if the existing structure already works.

---

# 40. Data-Driven Requirement

Prefer configuration over hardcoded logic.

Examples:

Weapon definitions should be data-driven.

Enemy definitions should be data-driven.

Map block definitions should be data-driven.

Mission definitions should be data-driven where practical.

---

# 41. Development Rules

Follow these rules strictly.

## Rule 1

Do not rewrite working systems without a clear reason.

## Rule 2

Do not remove existing features.

## Rule 3

Do not redesign the game without explicit instruction.

## Rule 4

Implement one roadmap phase at a time.

## Rule 5

Build and test after meaningful changes.

## Rule 6

Fix introduced errors before moving to another phase.

## Rule 7

Prefer reusable systems.

## Rule 8

Avoid giant files that contain unrelated gameplay systems.

## Rule 9

Avoid hardcoded mission-specific behavior when a generic system can handle it cleanly.

## Rule 10

Do not invent story canon.

If story information is missing, leave a TODO or placeholder.

---

# 42. Development Roadmap

## PHASE 1 — Audit Existing Project

Status: **COMPLETE — audited 2026-10-05**. Report: [docs/CURRENT_PROJECT_STATUS.md](../docs/CURRENT_PROJECT_STATUS.md). See §57 for baseline results and follow-up.

Before writing major new code:

1. Inspect project architecture.
2. Identify existing gameplay systems.
3. Identify working systems.
4. Identify missing systems.
5. Identify technical debt that blocks the roadmap.
6. Run the existing project.
7. Record baseline errors.
8. Do not redesign anything yet.

Output:

```text
docs/CURRENT_PROJECT_STATUS.md
```

---

# 43. PHASE 2 — Core Player Systems

Status: **COMPLETE — verified 2026-10-05**. See [PHASE2_CORE_SYSTEMS.md](../docs/PHASE2_CORE_SYSTEMS.md) and §58.

Verify or implement:

```text
Player movement
Camera
Collision
Health
Damage
Death
Interaction
Basic HUD
```

Do not proceed until these systems work.

---

# 44. PHASE 3 — Weapon Framework

Create reusable weapon architecture supporting:

```text
Weapon definition
Magazine
Ammo reserve
Fire
Reload
Fire rate
Accuracy
Recoil
Damage
Weapon switching
Weapon sounds
Sound radius
```

Initial weapons:

```text
VX-9
M4X
```

---

# 45. PHASE 4 — Basic Enemy Framework

Implement:

```text
Walker
```

Required features:

```text
Idle
Detect player
Move toward player
Attack
Take damage
Die
React to weapon sound
```

Then implement:

```text
Runner
```

using the same reusable enemy framework.

---

# 46. PHASE 5 — Block Puzzle Map Framework

Implement reusable block definitions:

```text
DOT
LINE_2
LINE_3
LINE_5

I
O
T
L
J
S
Z
```

Requirements:

- Rotation
- Placement
- Connections
- Navigation compatibility
- Spawn locations
- Objective locations
- Door locations

Build at least one test map before integrating Chapter 1.

---

# 47. PHASE 6 — Chapter 0 Validation

Ensure the existing pilot supports:

```text
Mission 1
Mission 2
Mission 3
```

Do not redesign Chapter 0 unless needed to support shared systems.

Move hardcoded systems into reusable architecture only when safe.

---

# 48. PHASE 7 — Chapter 1 Screening Center

Create:

```text
Highway Entrance
Waiting Area
Screening Area
Security Office
Medical Wing
Quarantine Area
Isolation Ward
Control Center
Bus Depot
City Gate
```

Use Block Puzzle architecture.

---

# 49. PHASE 8 — SG-12 Shotgun

Player discovers:

```text
SG-12
```

inside:

```text
Security Armory
```

Implement:

- Shotgun firing
- Short range
- High stopping power
- Limited magazine
- Slow reload
- High sound radius
- Unique audio profile

---

# 50. PHASE 9 — Chapter 1 Mission Logic

Implement sequentially:

```text
Mission 1
SILENT CHECKPOINT

Mission 2
ISOLATION WARD

Mission 3
LOCKDOWN

Mission 4
THE LAST BUS

Final Objective
ENTER DOGE CITY
```

Each mission must be playable before implementing the next.

---

# 51. PHASE 10 — Audio Pass

Implement:

```text
Positional gun audio
Gunshot variants
Reload sounds
Dry fire
Environmental audio
Zombie audio
Ambient audio
Indoor/outdoor audio zones
```

Prioritize weapon impact and atmosphere.

---

# 52. PHASE 11 — Polish

After Chapter 1 is fully playable:

Improve:

```text
Lighting
Animations
Audio transitions
Zombie reactions
Weapon feedback
Impact effects
UI feedback
Performance
Loading
Bug fixes
```

Do not perform major visual polish before gameplay systems work.

---

# 53. Codex Working Procedure

For every task:

```text
1. Inspect relevant files.

2. Explain what currently exists.

3. Determine the smallest safe implementation.

4. Implement.

5. Run build.

6. Run tests where available.

7. Run the game if practical.

8. Fix errors.

9. Report changed files.

10. Report remaining issues.

11. Update ROADMAP.md.
```

---

# 54. Codex Start Instruction

Use the following instruction when beginning work:

```text
You are working on my existing Three.js game project:

DEAD ZONE: VIRUS X

This document is the current source of truth for the game's development roadmap.

First inspect the entire existing repository before making major changes.

Do not rewrite the project from scratch.

Preserve all currently working functionality.

Your first objective is to determine the current state of the project and map existing systems against this roadmap.

Create or update:

docs/CURRENT_PROJECT_STATUS.md

Document:

- existing architecture
- existing gameplay features
- missing roadmap features
- known errors
- systems that can be reused
- systems that require refactoring
- recommended next implementation task

Then begin only the earliest incomplete roadmap phase.

Important rules:

- Implement one phase at a time.
- Do not implement future phases early.
- Prefer modular and data-driven systems.
- Do not invent story canon.
- Do not delete working features.
- Do not make large architecture changes without necessity.
- Keep Chapter 0 playable while adding Chapter 1.
- Run the build after significant changes.
- Fix errors introduced by your changes.
- Update ROADMAP.md when tasks are completed.

The current priority order is:

1. Audit existing project
2. Core systems
3. Weapon framework
4. Enemy framework
5. Block Puzzle Map framework
6. Validate Chapter 0
7. Chapter 1 Screening Center
8. SG-12 Shotgun
9. Chapter 1 mission flow
10. Audio
11. Polish

Begin by inspecting the repository.
Do not start by rewriting code.
```

---

# 55. Definition of Done for Chapter 1 Prototype

Chapter 1 is considered playable when:

```text
John starts outside Doge City.

John can travel through the Screening Center.

Block Puzzle map modules work.

Walker and Runner enemies work.

VX-9 works.

M4X works.

SG-12 can be discovered.

Ammo and reload work.

Gunshots use positional audio.

Gunshots can attract infected.

Mission objectives progress correctly.

Security and research interactions work.

Lockdown encounter works.

Bus Depot can be explored.

City Gate can be opened.

John can enter Doge City.

The game does not break Chapter 0.
```

That is the first major milestone.

Do not expand Doge City itself until this milestone is stable.
---

# 56. Confirmed Project Decisions — 2026-10-05

These decisions reflect the user's clarification after reviewing this roadmap. Apply them when implementing the relevant phase.

## 56.1 Chapter-specific roster

- Preserve the existing SMG, DMR, and Tank in Chapter 0 and Survival.
- Chapter 1 uses VX-9, M4X, and the discoverable SG-12.
- Chapter 1 initially uses Walker and Runner.
- Preserving existing weapons and enemies is not authorization to implement the other future weapon or enemy concepts.
- Keep Chapter 0 and Survival playable while implementing Chapter 1.

## 56.2 Weapon acquisition and supply terminals

- New weapons are found in story areas, not restricted to the laboratory.
- The Chapter 1 SG-12 is discovered in the Security Armory of the Screening Center.
- Weapons are not sold and are not awarded by random loot boxes.
- Replace the freely accessible shop with physical upgrade/grenade vending terminals in the environment.
- Use the shared E interaction system to access these terminals.
- Terminals only upgrade owned weapons and sell grenades.
- Molotov, demolition, and cluster grenades are obtained through purchases only.
- Do not add grenade drops, random-box grenade rewards, or grenade crafting.
- Money and upgrade materials remain distinct from Level upgrade Points.

## 56.3 Progression between chapters

- Carry Level, allocated Status upgrades, unspent Points, money, materials, and consumable inventory from Chapter 0 into Chapter 1.
- A normal chapter transition must not perform the current new-game inventory/progression reset.
- Preserve ownership and upgrade data for previously obtained weapons when introducing the new chapter loadout system.
- Active loadout selection and legacy weapon mapping must be reconciled with the three-slot system during the weapon-framework phase.
- Exact legacy material migration remains to be defined before converting existing saved or in-progress inventory.

## 56.4 Material inventory

Introduce these four distinct material categories:

| Data ID | Display name |
| --- | --- |
| polymer | Polymer |
| weapon_parts | Weapon Parts |
| high_grade | High-Grade |
| gun_powder | Gun Powder |

- Track material quantities separately instead of using one generic material count.
- Materials support weapon upgrades through the upgrade terminal.
- Preserve material crates and the existing random-loot reward categories: materials, ammunition, sprint potions, and energy shields.
- Material types, quantities, drop weights, and upgrade requirements must be configurable.
- Gun Powder is an abstract game inventory item; its presence does not enable grenade crafting.
- TODO: define upgrade recipes, drop quantities/weights, and how existing generic materials migrate to these categories.
- Do not invent these balance values as confirmed requirements.

## 56.5 Work sequence

- Begin with Phase 1: audit the current implementation and record its status in docs/CURRENT_PROJECT_STATUS.md.
- Include the differences between existing systems and the confirmed decisions above in that audit.
- Implement one roadmap phase at a time.
- This clarification records the agreed design; it does not mark the vending-terminal, material-category, or chapter-transition implementations as complete.

## 57. Phase 1 Audit Completion — 2026-10-05

Phase 1 is COMPLETE as an audit. See [CURRENT_PROJECT_STATUS.md](../docs/CURRENT_PROJECT_STATUS.md).

- Audited the existing version 1.3.0 implementation against this roadmap and the decisions in §56.
- Unit tests: 14/14 passed. Browser integration scripts: 6/6 passed.
- Isolated Windows audit build passed at artifacts/phase1/build/DeadZone-win32-x64; the existing dist build was not overwritten.
- Desktop source self-test passed. Packaged desktop self-test failed its resume assertion on the first run, then passed on an identical-build retry without code changes. Both results are preserved.
- R01: focus/resume timing is a possible explanation, not a confirmed root cause or confirmed gameplay bug. Investigate and stabilize this check in Phase 2.
- SHA-256 verification: all 25 runtime/test/config files remained unchanged; all 13 packaged runtime files match source.
- Evidence, logs, manifests, and screenshots: artifacts/phase1/.
- No gameplay implementation changed in this phase. The vending terminal, four material categories, and Chapter 1 carry-over decisions in §56 remain pending.
- No other phase is marked complete. Next work is Phase 2 core verification, R01 investigation, and incremental shared interfaces; do not skip ahead to Chapter 1 maps or unconfirmed recipes.

## 58. Phase 2 Core Player Systems Completion — 2026-10-05

Phase 2 is COMPLETE. See [PHASE2_CORE_SYSTEMS.md](../docs/PHASE2_CORE_SYSTEMS.md).

- Verified movement, camera, collision, health, damage, death/restart, E interaction, and basic HUD.
- Added a shared E target contract for mission and loot; prompt selection and activation use the same priority/availability/range checks.
- Preserved current pilot campaign, Survival, Level/Points, economy, weapons and consumables.
- Added read-only core telemetry and browser core checks.
- Stabilized desktop self-test focus preconditions and added actual minimize/restore/explicit resume checks; auto-pause remains enabled.
- Final validation: 16 unit cases and seven browser scripts passed. The initial browser batch had core timing and campaign DMR acquisition failures; the core test was corrected and campaign passed an unchanged serial retry. Initial batch results are preserved.
- Windows source self-test passed; isolated packaged build passed self-test on three separate launches with three minimize/resume cycles each; 14 packaged runtime files match source.
- Phase 1 R01 historical root cause remains unconfirmed. Legacy randomized walkthrough timing remains a test limitation.
- Evidence: artifacts/phase2/. Existing dist executable was not replaced.
- Stop after Phase 2. The next authorized phase should be Phase 3 Weapon Framework, preserving legacy weapons and §56 decisions.

