// Netherite Battlemage armor (Iron's Spells' ExtendedArmorItem) and Dragon Bones armor (Bosses'Rise's DragonBonesItem)
// build their own attribute modifiers in getDefaultAttributeModifiers, so the item modifications in armors.js never
// reach them: in play they keep their mods' armor and toughness and lack the added attributes. Forge's
// ItemAttributeModifierEvent runs for every stack's modifiers, on the server and for tooltips, and applies the values
// armors.js names: armor and toughness replace the item's own amounts under the item's own modifier ids, and the
// other attributes are added with armors.js's ids and names.
const $ArmorClassAttributes = Java.loadClass("net.minecraft.world.entity.ai.attributes.Attributes");
const $ArmorClassModifier = Java.loadClass("net.minecraft.world.entity.ai.attributes.AttributeModifier");
const $ArmorClassOperation = Java.loadClass(
  "net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation"
);
const $ArmorClassRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries");
const $ArmorClassLocation = Java.loadClass("net.minecraft.resources.ResourceLocation");
const $ArmorClassUUID = Java.loadClass("java.util.UUID");

const ARMOR_CLASS_VALUES = {
  "irons_spellbooks:netherite_mage_helmet": {
    slot: "head",
    add: [
      ["irons_spellbooks:max_mana", "33c4993a-970b-4ff8-9ff3-e73c07c11bb1", "max mana", 125],
      ["irons_spellbooks:summon_damage", "33c4993a-970b-4ff8-9ff3-e73c07c11bb1", "summon damage", 0.1],
    ],
  },
  "irons_spellbooks:netherite_mage_chestplate": { slot: "chest", armor: 5, toughness: 0 },
  "irons_spellbooks:netherite_mage_leggings": { slot: "legs", armor: 4, toughness: 0 },
  "irons_spellbooks:netherite_mage_boots": { slot: "feet", armor: 2, toughness: 0 },
  "block_factorys_bosses:dragon_bones_chestplate": {
    slot: "chest",
    armor: 12,
    toughness: 3,
    add: [["puffish_attributes:player.resistance", "1ba470c3-9218-4af3-895a-57231ef1d6c6", "+1% Damage Reduction", 0.01]],
  },
  "block_factorys_bosses:dragon_bones_leggings": {
    slot: "legs",
    armor: 11,
    toughness: 2,
    add: [["puffish_attributes:player.resistance", "ee8cf846-987b-497e-888a-216b2703ab21", "+1% Damage Reduction", 0.01]],
  },
  "block_factorys_bosses:dragon_bones_boots": {
    slot: "feet",
    armor: 9,
    toughness: 2,
    add: [["puffish_attributes:player.resistance", "e8dd8d6d-2294-4642-aa7e-36b86e495faf", "+1% Damage Reduction", 0.01]],
  },
};

// The item's own modifier of `attribute` keeps its id and name and gets `amount`; none is added for 0.
function armorClassReplace(event, attribute, amount) {
  let first = null;
  event.getModifiers().get(attribute).forEach((modifier) => {
    if (first === null) first = modifier;
  });
  if (first === null) return;
  event.removeAttribute(attribute);
  if (amount !== 0) {
    event.addModifier(
      attribute,
      new $ArmorClassModifier(first.getId(), first.getName(), amount, $ArmorClassOperation.ADDITION)
    );
  }
}

ForgeEvents.onEvent("net.minecraftforge.event.ItemAttributeModifierEvent", (event) => {
  const key = $ArmorClassRegistries.ITEMS.getKey(event.getItemStack().getItem());
  const values = key === null ? null : ARMOR_CLASS_VALUES[String(key)];
  if (!values || String(event.getSlotType().getName()) !== values.slot) return;
  if (values.armor !== undefined) armorClassReplace(event, $ArmorClassAttributes.ARMOR, values.armor);
  if (values.toughness !== undefined) armorClassReplace(event, $ArmorClassAttributes.ARMOR_TOUGHNESS, values.toughness);
  (values.add || []).forEach((entry) => {
    const attribute = $ArmorClassRegistries.ATTRIBUTES.getValue(new $ArmorClassLocation(entry[0]));
    if (attribute === null) return;
    event.addModifier(
      attribute,
      new $ArmorClassModifier($ArmorClassUUID.fromString(entry[1]), entry[2], entry[3], $ArmorClassOperation.ADDITION)
    );
  });
});
