# Public fixes

This fork's `master` contains reusable Prodigium Reforged correctness and
compatibility fixes, plus the stage-aware chest-loot replacement and the Honey
Comb bee cut described below.
The original [upstream repository](https://github.com/AntoineDehan/Prodigium-Reforged)
is the reference; configure it as the `upstream` Git remote and compare against
`upstream/master`. The upstream base is `e411450528c12b6314ca14bce795b0a7d5a3f0a1`.

The changes repair invalid item/entity/biome/tag IDs, recipe ingredients,
duplicate armor-set modifier UUIDs, missing quest rewards and permissions,
quest dependencies, the lightning spell school, an Expert Mode stage check,
server-side sound calls and the Canary/Ore Stages palette incompatibility.
The party boss-scaling fix prevents permanent negative scaling for bosses
generated in an empty dimension. Personal caches are excluded.

Achievements Optimizer 1.0.5 inventory-event skipping is disabled
(`skipTicksAdvancements=0`). Its nominal tick counter actually discards five
inventory-change calls before processing the sixth, without a queued retry.
This can leave item advancements pending until another relevant inventory
update. The other optimizer behavior is retained; this does not change the
separate FTB Quests detection settings. An affected-player comparison remains
the gameplay verification step.

The armor formula is capped at the incoming damage:
`damage * MIN(1, 20 / (armor + 10))`. Positive armor below 10 no longer makes
an entity take more damage than having no armor. The curve at 10 armor and
above is unchanged, as are toughness and player damage normalization. This
applies to living entities, including mobs, not just players. It does not
give low armor a damage reduction of its own.

Netherite Battlemage armor (Iron's Spells' `ExtendedArmorItem`) and Dragon Bones
armor (Bosses'Rise's `DragonBonesItem`) build their own attribute modifiers in
`getDefaultAttributeModifiers`, so the item modifications in `armors.js` never
reached them. `armor_class_values.js` applies the same values through Forge's
`ItemAttributeModifierEvent`, which also feeds tooltips: Battlemage chestplate,
leggings and boots 5, 4 and 2 armor without toughness, and +125 mana and +0.1
summon damage on the helmet; Dragon Bones chestplate, leggings and boots 12, 11
and 9 armor, 3, 2 and 2 toughness and +1% damage reduction each. Armor and
toughness keep the items' own modifier ids. Checked by an item attribute dump on
a test server.

Pet quest descriptions match Tameable Beasts 7.1.3: penguins use Frozen Fish
for taming; Argentavis spawns from Y 100 and supports hand-fed bait below
10 health or bait arrows at any health. The penguin equipment quests now
explain the existing Frostmaw treasure-bag source: one equal-weight roll
among Icepop, Ice Helmet and Ice Chestplate. Quest IDs, objectives, rewards,
recipes and loot tables are unchanged.

Keybinding defaults use Default Options as their single authority. The four
upstream scripted choices (Signature Ability F, Bestiary H, Skill Tree I and
Swap Offhand L) are consolidated into `config/defaultoptions/keybindings.txt`.
KeyBindJS 2001-2.3.0 changes only the default key, leaving the active key behind;
Default Options 18.0.4 then interprets the mismatch as a personal binding and
skips it on first launch. Key registration and removal remain unchanged.
Existing saved bindings are preserved; use individual reset buttons or Reset
Keys to adopt defaults deliberately. This is a startup compatibility fix, not
a forced migration of player preferences.

The Brain of Cthulhu's client phase is derived from Terra Entity's synchronized
skill index. In 1.1.16-hotfix2 the phase field changes only on the server, while
client target selection still checks that field, preventing phase-two melee
hits in vanilla and Better Combat. The client script preserves phase-one
immunity, excludes the three decoys and leaves server damage rules unchanged.
The quest explains the minion phase, real boss and decoys. The script passed
48 checks with the pack's Rhino interpreter and Java-object fixtures; this
does not substitute for a graphical multiplayer combat test.

Spawn repairs cover both the biome modifiers and Spawn Balance Utility's CSV,
which replaces biome spawn lists when `balanceBiomeSpawnValues` is enabled.
The CSV removes 763 erroneous pig rows and 44 unregistered-entity rows, corrects
Pottergeist's ID/category, and adds 365 missing rows from the corrected spawn
definitions. The original pack weights are retained, including flying fish at 38,
Huntsman at 40, Silver Queen at 30 and Wasp at 35. Extra farm animals, additional
rare variants and other deployment-specific spawn balancing are not included.

Cataclysm's seven structure-set files and Frosted Prison biome tag are moved to
directories the game reads, retaining their original contents and spacing.
The jungle-cabin item tag supplies the accessories omitted by the mod's invalid
filename. The impossible phantom advancement task is replaced with one phantom
kill, retaining its dependencies and reward; this is a quest-completion workaround.

`kubejs/server_scripts/stage_loot.js` replaces permanent onyx removals in
`chest_loot.js` with a progression rule for all chest loot. It reads the four
TH Item Stages restriction files (`restriction1`, `restriction2`, `restriction3`,
`restrictionNetherite`) and removes their existing items unless the player
generating the loot has the required stage. This is an intentional extension
of upstream progression rules: items become available after their stage instead
of remaining permanently excluded. Loot generated without a player is treated
as having no stage; already-generated chest contents are not rewritten, and a
later visitor does not restore filtered loot. It does not change entity drops
or treasure-bag tables. The stage-present branch still needs an in-game check;
source and syntax checks alone do not establish multiplayer behavior.

A player's item use ends at death (`kubejs/server_scripts/death_item_use.js`).
Vanilla removes a dead player after 20 ticks, which drops the player's Forge
capabilities, while an item use started before death keeps counting down. When
a bite completes after that, Spice of Life: Carrot Edition 1.15.1 looks up the
player's food list in `FoodTracker.onFoodEaten` and throws
`FoodListNotFoundException` inside the player's tick. With Neruina the player
is kicked about a second after dying; without it the server would crash. The
script calls `stopUsingItem()` on a player in the death event and leaves the
death itself untouched. Operator-only `/deathuse` checks that the two calls it
relies on resolve on a living entity in the installed KubeJS build, without
adding an entity to the world. The script passed its checks with the pack's
Rhino interpreter and fake entities; confirming it in play needs a death in
the middle of a bite.

The kill streak's end sound in `kubejs/server_scripts/armor_effects.js` plays
through `/playsound`, at the player for everyone within 16 blocks, as
`playSound` would. Iron's RPG Tweaks ships
`irons_rpg_tweaks:item.identification_scroll.identify` in its assets but
registers no sound event for it, so `playSound` failed with "No such element
... in registry minecraft:sound_event" whenever a streak ended. The loop's
player is now a `let`: KubeJS's Rhino keeps a `const` declared in a loop body
at its value from the first pass, so a second streak ending in the same tick
would have played at the first player.

The Nether, Sol and Prior armor effects in `kubejs/server_scripts/spell_listener.js`
read the target of the spell being cast from Iron's Spells' cast data. Iron's
Spells 3.4.0.1 stores no cast data for Heal or Greater Heal, and Fortify's cast
data is an area (`TargetAreaCastData`) that has no `getTarget`. So for a player
wearing one of these sets the handler threw on each such cast, with `Cannot call
method "getTarget" of null` or `Cannot find function getTarget`. It now skips a
cast without a single target. Such a cast gives no armor effect, as before, since
the handler had always failed there; a cast with a target is handled as before.
The handler passed its checks with the pack's Rhino interpreter, fake players and
a Java object standing in for Fortify's cast data.

Iron's Lib 1.0.2 ships the block loot tables of `irons_lib:player_statue`,
`irons_lib:transmog_table` and `irons_patreon_lib:transmog_table` only under
1.21's folder name `loot_table`, which 1.20.1 does not read, so these blocks
dropped nothing when broken. The datapack holds the jar's tables under
`loot_tables`. The statue's 1.21 `copy_components` becomes 1.20.1's `copy_nbt`
of the keys its block entity saves, as in the jar's own 1.20.1 table for
`irons_patreon_lib:player_statue`, so a mined statue keeps its player, pose and
side. The older `irons_patreon_lib` transmog table drops the `irons_lib` one,
as the jar's table says.

The Underworld Knight's and the Sun Spirit's summon waves
(`kubejs/server_scripts/bosses_abilities/knight/` and `sun spirit/`) gave each
summon random coordinates through a `const` in the loop. KubeJS's Rhino keeps
such a `const` at its first value for the rest of the call, so every mob of a
wave appeared at the same point. The loops use `let`.

Universal Enchants' holders are built while the server scripts load
(`kubejs/server_scripts/fix_universal_enchants_holders.js`). Universal Enchants
8.0.0 builds an enchantment's holder the first time `isCompatibleWith` is asked
about it, in maps that are not thread-safe, and binds the enchantment's category
to the first holder. Quark's rune smithing recipes ask that while KubeJS parses
recipes on several worker threads, so a holder could be lost, and its
enchantment's item list in `config/universalenchants` then had no effect until
the next start. On a restored server copy five of seven starts lost one to four
of the vanilla weapon enchantments' lists; with the script, none of four did.
The script's header and its commit message give the full call chain.

The Honey Comb's bees are cut in `kubejs/startup_scripts/fix_honeycomb_bees.js`.
Terra Curio 0.1.13's `confluence:bee_projectile` hits for a constant set in
its `onHitEntity`: 5 or 6, or 6 to 8 for a giant bee. The pack's two cuts on
it, In Control's `damagemultiply 0.1` in `config/incontrol/spawn.json` and
Attributizer's attack damage -85% in `entity/misc.json`, act on a mob's
attributes and never reach this projectile, which has none; both are left as
they are. Each bee hit lands x0.25: the script lowers its amount at Forge's
highest `LivingHurtEvent` priority. Minecraft's half-second hit window keeps
the amount a hurt was called with, and a cut in `LivingHurtEvent` changes only
what lands, so the window would keep the bee's full amount and the next hit
within it would land only what is above that. In this pack the window keeps
nothing: Universal Enchants' `no_projectile_immunity`, true in
`config/universalenchants-server.toml` (and its default), closes it after
every hit of a `#minecraft:is_projectile` damage type on an entity other than
a player, and the bee's `mob_projectile` is one. So a bee's hit on a mob
leaves no window, and clears any open one as it does without the script, and
the cut is exact. If that setting is turned off or Universal Enchants leaves
the pack, and when a bee hits a player, the window keeps the bee's full
amount; a bee's hit inside a window another hit opened lands x0.25 of what is
above that hit. Code that acts on the hit before `LivingHurtEvent` (the attack
event, pre-damage hooks, the hurt mob's own `hurt` method, such as a Cataclysm
boss's damage bucket) sees the bee's uncut hit, once. Cancelling the bee's hit
and hurting the target again with the lower amount would keep the window small
without Universal Enchants, but it would run twice everything that acts on a
hit before the attack event and the hurt mob's own `hurt` method, so the
script does not do that. Six curios release bees: the Honey Comb, Bee Cloak,
Stinger Necklace, Sweetheart Necklace, Honey Balloon and Amber Horseshoe
Balloon, once per hurt above zero however many are worn: 1 to 3 bees, or 1 to
4 with the Hive Pack, which also makes half of them giant. Every second bee of
a release is not spawned, so 1, 2, 3 or 4 bees become 1, 1, 2 or 2: x0.6 bees
with the Hive Pack and x0.15 of the bees' damage in all, the 85% cut the pack
meant, and x0.17 without it. Terra Curio releases them on every hurt but the
void and `/kill`, from a fall, fire, drowning, poison or wither too, and on
the same hurts the Bee Cloak, Star Cloak and Star Veil drop 3 stars
(`confluence:star_cloak`, a constant 10, not cut). Only a hurt with a living
attacker other than the wearer now releases either: Terra Curio makes both
releases inside the hurt's `LivingHurtEvent` at normal priority, after the
script has noted the hurt, and on the other hurts the script cancels the bees
and stars as they join the level. A tick of Majrusz's Bleeding names the
entity that started the bleeding as its attacker, so it releases them, unlike
poison, fire and falls. The Honey effect each release gives the
wearer is unchanged. Taking away bees as well as cutting their hits, and the
attacker rule, are balance choices. Bees and stars loaded from disk, without
an owner or on the client are left alone, and two releases of one wearer in
the same game tick count as one. Simply Swords' Hiveheart bee is another
entity and is unchanged. Setting `HONEYCOMB_ATTACKED_ONLY` to false in the
script turns the attacker rule off. A change to the script takes effect at a
restart. It passed its checks with the pack's Rhino interpreter, fake events
and a model of Forge's hit window with Universal Enchants' reset, and on a
test server with this pack, a fake player and a fixed-health target:
each bee-shaped hit of 5 to 8 landed x0.25 and an arrow right after it landed
in full, while a melee pair kept its window; releases held 1 or 2 bees (mean
1.53 with the Hive Pack, 1.3 without); fire, falls, poison and the wearer's
own hit released no bee and no star while a mob's hits did; and twelve real
bee hits all landed x0.25 (45 of 45 checks, 2026-11-21).

Iron's Spells 3.4.0.1 sets its school resistances only in its listener of
Forge's FinalizeSpawn event (`ServerPlayerEvents.handleResistanceAttributesOnSpawn`):
an undead mob gets base holy resistance 0.5 and blood 1.5, else a water mob
lightning 0.5; a fire immune mob fire 1.5; a Blaze ice 0.5. Forge posts that
event where vanilla sets up a mob (natural spawns, spawners, spawn eggs,
`/summon`), but not where a mod or vanilla adds a mob another way: the Wither
built from skulls, bosses raised from an altar, a bait or a corpse, minions and
converted mobs. Iron's damage factor is 2 minus the resistance, so such an
undead boss took holy and blood spells at x1.0 where a summoned one takes x1.5
and x0.5. `kubejs/server_scripts/fix_iron_school_resists.js` applies the same
tests when a mob joins the world, only to an attribute whose base is still the
default for its type, and tags the mob `ironSchoolResists`; a mob that had the
event, or whose value something else set, is left alone, and a saved mob is
changed the first time it loads. It passed its checks with the pack's Rhino
interpreter and fake mobs. On a test server a Wither built from skulls had
holy, blood and fire resistance 1, 1 and 1 without it and 0.5, 1.5 and 1.5
with it; a Wither Skeleton that had the event kept 0.5 and 1.5 and no tag.

Branding, server addresses, starter gifts, added mods and version selections,
launcher packaging, keybindings, graphics settings, other balance/progression
preferences, selected skill backports and host tuning belong in a separate
private deployment repository. Skeletron's missing bag table is unresolved in
this public patch set. Original upstream settings still present in the tree are
not endorsements or private deployment defaults.

This is source for review and contribution, not a complete launcher import or
a tested public modpack release. Existing upstream licenses and attribution
remain applicable.
