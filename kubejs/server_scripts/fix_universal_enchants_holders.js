// Universal Enchants 8.0.0 keeps each enchantment's settings in a holder, and builds the holder the first time
// Enchantment.isCompatibleWith is asked about that enchantment. Its holders, and the categories bound to them, sit in
// maps that are not thread-safe. KubeJS parses the recipes on several worker threads, and Quark's rune smithing
// recipes ask isCompatibleWith while they are parsed, so two workers can build holders at the same time. A holder lost
// that way keeps its enchantment's category, and that enchantment's item list in config/universalenchants has no
// effect until the next start: on a restored server copy, five of seven starts left one to four of Sharpness, Smite,
// Bane of Arthropods, Fire Aspect and Knockback with only vanilla's items.
//
// The call chain, seen in stack traces on the threads "KubeJS Recipe Event Worker N":
//   Ingredient.<init> -> Quark SmithingRuneRecipe.makeEnchantedDisplayItem -> EnchantmentHelper.selectEnchantment
//   -> Enchantment.isCompatibleWith -> Universal Enchants' EnchantmentMixin -> EnchantmentHoldersManager
//   .getEnchantmentHolder (an IdentityHashMap's computeIfAbsent) -> new EnchantmentHolder
//   -> BuiltInEnchantmentDataManager.getOrBuildCustomCategory (a HashBiMap, keyed by enchantment, first holder wins).
// An enchantment whose list had no effect had two holders: the category followed the first, which the map lost, and
// the config file was read into the second.
//
// Server scripts load on one thread before the recipes are parsed, so asking once for every enchantment here builds
// all the holders first; the recipe workers then only read them.
if (Platform.isLoaded("universalenchants")) {
  // let, not const: KubeJS's Rhino throws on a const in a block when the script also holds a closure.
  let holders = Java.loadClass("fuzs.universalenchants.world.item.enchantment.serialize.EnchantmentHoldersManager");
  let registries = Java.loadClass("net.minecraft.core.registries.BuiltInRegistries");
  registries.ENCHANTMENT.forEach((enchantment) => holders.isCompatibleWith(enchantment, enchantment, true));
}
