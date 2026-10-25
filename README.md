Prodigium Reforged, with fixes
======

This is a fork of [Prodigium Reforged](https://github.com/AntoineDehan/Prodigium-Reforged), a Forge 1.20.1
modpack inspired by Terraria. Its `master` branch is upstream's `master` at
[`e411450`](https://github.com/AntoineDehan/Prodigium-Reforged/commit/e411450528c12b6314ca14bce795b0a7d5a3f0a1)
(2026-09-08) with the changes listed below on top. All but one are fixes; the one change to progression is
marked. [CUSTOMIZATIONS.md](CUSTOMIZATIONS.md) explains the larger changes, and each commit message gives its
evidence. To see every changed line:

```
git remote add upstream https://github.com/AntoineDehan/Prodigium-Reforged.git
git fetch upstream
git diff upstream/master...master
```

This is source for review and contribution, not a separately tested modpack release. Upstream's licenses and
attribution apply.

## Changes against upstream

### Spawns and world generation

- Turns off 19 biome spawn entries that name entity types Luminous Beasts and Enemy Expansion do not register
  (variants such as `hermit_king_2`, `rare_yeti`, `gladius` and `wolfsbane`), and corrects the ids or biome tags
  of seven others: Huntsman, Silver Queen, Wasp, Hermit King, Sunken, and the savanna skeleton and zombie.
- Repairs Spawn Balance Utility's `BiomeMobWeight.csv`, which replaces each biome's spawn list: it removes 763
  stray pig rows and 44 rows for unregistered entities, fixes Pottergeist's id and category, and adds 365 rows
  from the corrected spawn entries. Upstream's spawn weights are kept.
- Moves Cataclysm's seven structure sets and its Frosted Prison biome tag to the folders the game reads, with
  their spacing unchanged.
- Updates the Aether biome tag to Aether Redux's current biome ids, and the Eyestalker tag to `#minecraft:is_end`.
- Lets Respawning Structures rebuild YUNG's Better Ocean Monuments' monument; its list named only the vanilla
  monument, which that mod replaces.

### Items, recipes, loot and tags

- Corrects misspelled or renamed ids so the entries take effect: the Sol armor and cherry branch recipes, the
  Infernal Enforcer chestplate's belt, the Elder Guardian treasure bag, the Extractinator's ancient chisel, the
  Band of Regeneration in accessory loot, the Ranger, Crystallized Blood and Plated Valkyrie armor in the Expert
  Mode item locks, Gold Fuelled's gun in Universal Enchants, Backstabbing in Quark's runes, the Piglin Brute in
  Confluence's rare creatures, two structures in Respawning Structures, the Hiveheart tag, a recipe removal, two
  item tooltips, and four ids in the armor and tool tier scripts.
- Removes entries for items no mod adds: a gauntlet treasure bag, the Void Worm bag's morningstar and an ancient
  cobalt bow tooltip.
- Makes the Runes mod's six elemental stones count as Iron's Spells focus items of their school.
- Marks the Disenchanting blacklist's curses from optional mods as `required: false`, so the tag loads without
  those mods.
- Supplies the jungle cabin's accessory tag under the file name Terraria Structures reads.
- Names the 20 Quality Equipment qualities the config adds without a translation (`clumsy_tool`,
  `masterful_helmet` and others), whose tooltips showed the raw key.
- Names the boss that really unlocks two item locks: Frostmaw for diamonds, orichalcum and the enchanting
  table, the Nether Gauntlet for onyx and tungsten.
- Gives Iron's Lib's player statue and transmog tables 1.20.1 loot tables, so they drop when mined; a statue
  keeps its player, pose and side.
- **Progression change:** replaces upstream's permanent onyx removals with stage-aware chest loot
  (`kubejs/server_scripts/stage_loot.js`). Items locked by TH Item Stages stay out of chest loot until the player
  opening the chest has the stage.

### Quests

- Pays class points to the trees that exist (`berserker` and `ranger`, not `berseker` and `ranged`), and gives
  the Gunner tree the same 23 boss rewards as the Archer tree.
- Runs six command rewards with operator permission, which they need to work for every player.
- Sends the Farming quest's skill experience to the general tree (`simplyskills:tree`).
- Asks for one phantom kill in place of an advancement that could not be earned.
- Fixes one quest dependency in the Mage chapter.
- Drops the summer Farming quest's claim of more thunderstorms; Serene Seasons' config gives summer the same
  thunder as spring and autumn.
- Drops the backpack quest's claim that a backpack must be empty to upgrade: the upgrade recipe copies the
  old backpack's data, so its contents and upgrades stay.
- Corrects the Undead Army text (300 undead for the first army, 600 after), explains the Brain of Cthulhu fight,
  and brings the pet quests in line with Tameable Beasts: penguin taming, Argentavis bait and the Frostmaw bag's
  penguin gear.

### Combat and bosses

- Caps the armor formula at the incoming damage (`damage * MIN(1, 20 / (armor + 10))`), so armor below 10 no
  longer makes an entity take more damage than no armor. The curve from 10 armor up is unchanged.
- Recomputes the Parties mod's boss scaling each time a boss joins the world, never below zero
  (`party_boss_scaling.js`). Bosses generated while nobody was in their dimension kept -35% health and -17%
  damage for good.
- Gives 12 armor set bonuses in six set files their own modifier UUIDs, so sets that shared one no longer replace
  each other's bonus.
- Counts Simply Skills' lightning explosion as a Lightning spell instead of Frost.
- Reads the Expert Mode stage in a general skill tree passive as a stage, not as a tag.
- Stops In Control's general hostile rules from stacking when a mob loads again near a player with other stages
  (`fix_incontrol_stacking.js`), and lets the Invisible Bidy spawn again.
- Lets the Brain of Cthulhu be hit in phase two (client script `brain_phase_sync.js`), keeping its phase-one
  immunity and decoys.
- Spreads the Underworld Knight's and Sun Spirit's summon waves, which appeared all at one point.
- Applies the `Necro T:27` block of `armors.js` to the Sentry set: it changed the Infernal Enforcer set a second
  time and left Sentry, the third By Powder and Steel set the Gunner chapter asks for, untouched.

### Errors and scripts

- Ends a dying player's item use, so dying in the middle of a bite no longer kicks the player
  (`death_item_use.js`).
- Plays the kill streak's end sound by name; the old call failed every time a streak ended.
- Keeps the NPC system's record of spawned NPCs in the server's saved data, so a restart or reload no longer
  lets a second NPC of a type spawn (`npc_system.js`).
- Builds Universal Enchants' enchantment holders before recipes load, so its item lists apply at every start
  (`fix_universal_enchants_holders.js`).
- Plays spell sounds through the server's player in `spell_listener.js`, which called the client's player.
- Stops Achievements Optimizer from skipping item advancement checks (`skipTicksAdvancements = 0`).
- Turns off Canary's chunk palette mixin, which conflicts with Ore Stages.
- Sets upstream's four keybinding choices (Signature Ability F, Bestiary H, Skill Tree I, Swap Offhand L) in
  Default Options only, so they apply on first launch.

## Not in this fork

Branding, server lists, starter gifts, added mods and version choices, keybinding and graphics preferences, and
other balance choices are left to whoever deploys the pack. Skeletron's missing treasure bag table is not fixed
here.

## About Prodigium Reforged

<a href="https://discord.gg/FDwY6GN4F5"><img src="https://raw.githubusercontent.com/intergrav/devins-badges/v3/assets/compact-minimal/social/discord-plural_46h.png" alt="Prodigium Reforged Discord"  width="40" height="40"></a>
<img src="https://raw.githubusercontent.com/intergrav/devins-badges/v3/assets/compact-minimal/supported/forge_46h.png" alt="Forge modpack"  width="40" height="40">
<a href="https://www.youtube.com/watch?v=34dUcLdFRd0"><img src="https://raw.githubusercontent.com/intergrav/devins-badges/v3/assets/compact-minimal/social/youtube-singular_46h.png" alt="Prodigium Reforged Youtube"  width="40" height="40"></a>
<a href="https://www.curseforge.com/minecraft/modpacks/prodigium-reforged"><img src="http://cf.way2muchnoise.eu/700732.svg" alt="Curseforge project"  width="84" height="20"></a>

Prodigium Reforged is a Minecraft modpack heavily inspired by Terraria.

Current Minecraft version : 1.20.1 <br>
Modloader : Forge <br>
Mods : 273
