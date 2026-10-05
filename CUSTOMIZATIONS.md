# Public fixes

This fork's `master` contains reusable Prodigium Reforged correctness and
compatibility fixes, plus the stage-aware chest-loot replacement described below.
The original [upstream repository](https://github.com/AntoineDehan/Prodigium-Reforged)
is the reference; configure it as the `upstream` Git remote and compare against
`upstream/master`. The upstream base is `e411450528c12b6314ca14bce795b0a7d5a3f0a1`.

The changes repair invalid item/entity/biome/tag IDs, recipe ingredients,
duplicate armor-set modifier UUIDs, missing quest rewards and permissions,
quest dependencies, the lightning spell school, an Expert Mode stage check,
server-side sound calls and the Canary/Ore Stages palette incompatibility.
The party boss-scaling fix prevents permanent negative scaling for bosses
generated in an empty dimension. Personal caches are excluded.

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

Branding, server addresses, starter gifts, added mods and version selections,
launcher packaging, keybindings, graphics settings, other balance/progression
preferences, selected skill backports and host tuning belong in a separate
private deployment repository. Skeletron's missing bag table is unresolved in
this public patch set. Original upstream settings still present in the tree are
not endorsements or private deployment defaults.

This is source for review and contribution, not a complete launcher import or
a tested public modpack release. Existing upstream licenses and attribution
remain applicable.
