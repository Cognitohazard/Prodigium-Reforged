# Public fixes

This fork's `master` contains reusable Prodigium Reforged correctness and
compatibility fixes. The original [upstream repository](https://github.com/AntoineDehan/Prodigium-Reforged)
is the reference; configure it as the `upstream` Git remote and compare against
`upstream/master`. The upstream base is `e411450528c12b6314ca14bce795b0a7d5a3f0a1`.

The changes repair invalid item/entity/biome/tag IDs, recipe ingredients,
duplicate armor-set modifier UUIDs, missing quest rewards and permissions,
quest dependencies, the lightning spell school, an Expert Mode stage check,
server-side sound calls and the Canary/Ore Stages palette incompatibility.
The party boss-scaling fix prevents permanent negative scaling for bosses
generated in an empty dimension. Personal caches are excluded.

Branding, server addresses, starter gifts, added mods and version selections,
launcher packaging, keybindings, graphics settings, balance/progression rules,
selected skill backports and host tuning belong in a separate private
deployment repository. They are not part of this public patch set. Original
upstream settings still present in the tree are not endorsements or private
deployment defaults.

This is source for review and contribution, not a complete launcher import or
a tested public modpack release. Existing upstream licenses and attribution
remain applicable.
