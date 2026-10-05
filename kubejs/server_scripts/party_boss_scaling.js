// Recompute the Parties mod (sedparties) boss scaling every time a boss is added to the
// world, including when its chunk loads from disk.
//
// sedparties 2.0-beta-p.7.1 scales a boss once, when it first joins the world, by healthMod / damageMod times
// (players in the dimension - 1), and it has no floor at zero. Bosses generated while nobody was in the dimension (for
// example during unattended Chunky runs) were therefore saved with -35% health and -17% damage for good.
//
// This script sets the same two modifiers (same UUIDs and names, so sedparties treats them as its own and does not add
// another) to the value for the players in the dimension right now, never below zero. It keeps the boss's health
// fraction: a full boss stays full, a damaged one stays as damaged. It runs one tick after the boss joins, so it always
// runs after sedparties' own handler.
//
// The values and the boss list are copied from config/sedparties-common.toml (healthMod, damageMod, markBosses).
// Keep them in sync if that config changes.

const PACK_PARTY_HEALTH_MOD = 0.35
const PACK_PARTY_DAMAGE_MOD = 0.17
const PACK_PARTY_BOSSES = [
  'mowziesmobs:ferrous_wroughtnaut', 'terra_entity:skeletron', 'terra_entity:queen_bee', 'terra_entity:brain_of_cthulhu',
  'terra_entity:eater_of_worlds', 'terra_entity:eye_of_cthulhu', 'lost_aether_content:aerwhale_king', 'meetyourfight:bellringer',
  'meetyourfight:dame_fortuna', 'meetyourfight:rosalyne', 'meetyourfight:swampjaw', 'aether:valkyrie_queen', 'aether:sun_spirit',
  'terra_entity:king_slime', 'aether:slider', 'bosses_of_mass_destruction:void_blossom', 'bosses_of_mass_destruction:gauntlet',
  'bosses_of_mass_destruction:lich', 'bosses_of_mass_destruction:obsidilith', 'minecraft:wither', 'minecraft:ender_dragon',
  'conjurer_illager:conjurer', 'minecraft:elder_guardian', 'stalwart_dungeons:nether_keeper', 'stalwart_dungeons:awful_ghast',
  'cataclysm:netherite_monstrosity', 'cataclysm:ignis', 'minecraft:warden', 'cataclysm:the_harbinger', 'alexsmobs:void_worm',
  'stalwart_dungeons:shelterer', 'cataclysm:ender_guardian', 'cataclysm:ender_golem', 'cataclysm:ancient_remnant',
  'irons_spellbooks:dead_king', 'cataclysm:the_leviathan', 'mowziesmobs:umvuthi', 'mowziesmobs:frostmaw',
  'block_factorys_bosses:sandworm', 'block_factorys_bosses:infernal_dragon', 'block_factorys_bosses:underworld_knight',
]

const $PackAttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
const $PackOperation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
const $PackAttributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
const PACK_PARTY_HEALTH_UUID = UUID.fromString('cb8fae8d-2aa9-4fc0-8028-9de2638b877f')
const PACK_PARTY_DAMAGE_UUID = UUID.fromString('2a480477-f7f5-4689-9bb4-f724f2988fb0')

// Set one sedparties modifier to `amount` (MULTIPLY_TOTAL). Returns true if anything changed.
function packPartySetModifier(entity, attribute, uuid, name, amount) {
  const inst = entity.getAttribute(attribute)
  if (inst == null) return false
  const old = inst.getModifier(uuid)
  const oldAmount = old == null ? 0 : old.getAmount()
  if (Math.abs(oldAmount - amount) < 0.000001) return false
  if (old != null) inst.removeModifier(uuid)
  if (amount > 0) inst.addPermanentModifier(new $PackAttributeModifier(uuid, name, amount, $PackOperation.MULTIPLY_TOTAL))
  return true
}

function packPartyRescale(entity) {
  if (!entity || entity.isRemoved() || !entity.isAlive()) return
  // KubeJS exposes level.players as a list of the players in this dimension (it hides Level.players()).
  const extra = Math.max(0, entity.level.players.size() - 1)
  const oldMax = entity.getMaxHealth()
  const fraction = oldMax > 0 ? entity.getHealth() / oldMax : 1
  const health = packPartySetModifier(entity, $PackAttributes.MAX_HEALTH, PACK_PARTY_HEALTH_UUID, 'partyModHealth', PACK_PARTY_HEALTH_MOD * extra)
  const damage = packPartySetModifier(entity, $PackAttributes.ATTACK_DAMAGE, PACK_PARTY_DAMAGE_UUID, 'partyModDamage', PACK_PARTY_DAMAGE_MOD * extra)
  if (health) entity.setHealth(Math.min(entity.getMaxHealth(), fraction * entity.getMaxHealth()))
  if (health || damage) {
    console.info('[party boss scaling] ' + entity.type + ' ' + String(entity.uuid) + ' at ' + Math.round(entity.x) + ' ' +
      Math.round(entity.y) + ' ' + Math.round(entity.z) + ': ' + extra + ' extra player(s), max health ' +
      Math.round(oldMax * 10) / 10 + ' -> ' + Math.round(entity.getMaxHealth() * 10) / 10)
  }
}

PACK_PARTY_BOSSES.forEach((id) => {
  EntityEvents.spawned(id, (event) => {
    const entity = event.entity
    event.server.scheduleInTicks(1, () => packPartyRescale(entity))
  })
})
