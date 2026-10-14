// Keep stage-locked items out of chest loot until the player opening the
// chest has the stage. The item lists and the stage names come from the TH Item Stages lock files, and the stage is
// looked up in TH Item Stages' own store, the one the lock itself reads, so the lock and this rule cannot drift apart.
// LootJS's hasAnyStage would not do: it asks KubeJS's stages, which Game Stages provides, a separate store in which
// the lock files' stage names are never granted. A chest emptied without a player (hopper, explosion) counts as
// "no stage", and so does a lookup that fails: then every locked item stays out of chest loot. This replaces the upstream
// onyx gem removals that used to be in chest_loot.js.
let stageLootItemStages = null;
try {
  stageLootItemStages = Java.loadClass("com.decursioteam.thitemstages.utils.StageUtil");
} catch (e) {
  console.error("[stage loot] TH Item Stages cannot be reached, so every locked item stays out of chest loot: " + e);
}

function stageLootHasItemStage(player, stage) {
  if (stageLootItemStages == null || player == null) return false;
  try {
    return stageLootItemStages.hasStage(player, stage) == true;
  } catch (e) {
    console.error("[stage loot] item stage lookup failed for " + stage + ": " + e);
    return false;
  }
}

LootJS.modifiers((event) => {
  const LOCK_FILES = ["restriction1", "restriction2", "restriction3", "restrictionNetherite"];

  LOCK_FILES.forEach((name) => {
    const data = JsonIO.read("config/thitemstages/restrictions/" + name + ".json");
    if (!data) {
      console.warn("[stage loot] cannot read " + name + ".json");
      return;
    }
    const lock = data["Restriction Data"];
    const stage = String(lock.stage);
    const ids = [];
    lock.itemList.forEach((entry) => {
      const id = String(entry.item);
      if (Item.exists(id)) ids.push(id);
    });

    const rule = event.addLootTypeModifier(LootType.CHEST).not((n) => {
      n.playerPredicate((player) => stageLootHasItemStage(player, stage));
    });
    ids.forEach((id) => {
      rule.removeLoot(id);
    });
    console.info("[stage loot] " + stage + ": " + ids.length + " locked items removed from chest loot for players without the stage");
  });
});
