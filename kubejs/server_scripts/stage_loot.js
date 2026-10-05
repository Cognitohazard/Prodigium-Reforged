// Keep stage-locked items out of chest loot until the player opening the
// chest has the stage. The item lists come from the TH Item Stages lock files, so the lock and this rule cannot
// drift apart. A chest emptied without a player (hopper, explosion) counts as "no stage". This replaces the upstream
// onyx gem removals that used to be in chest_loot.js.
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
      n.hasAnyStage(stage);
    });
    ids.forEach((id) => {
      rule.removeLoot(id);
    });
    console.info("[stage loot] " + stage + ": " + ids.length + " locked items removed from chest loot for players without the stage");
  });
});
