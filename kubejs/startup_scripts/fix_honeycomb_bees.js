// The Honey Comb's bees (Terra Curio 0.1.13, entity `confluence:bee_projectile`, class BeeProjectile; read in the
// jar's bytecode). The pack means to cut them by 85%, with two rules that never reach them:
// - `config/incontrol/spawn.json`: `confluence:bee_projectile` damagemultiply 0.1, speedmultiply 0.25;
// - Attributizer, `Prodigium_datapack/data/attributizer/attributizer/entity/misc.json`: its attack damage -85% and
//   other attributes.
// The bee is a projectile, not a living entity: it has no attributes, and its hit is a constant in onHitEntity, 5 or 6
// and for a giant bee 6 to 8, as a mob_projectile hit whose direct entity is the bee and whose cause is its owner. Both
// rules are left as they are, and this script makes the cut in two parts:
// - each hit of such a bee lands x0.25;
// - of the bees one release spawns, every second one is not spawned: 1, 2, 3 or 4 bees become 1, 1, 2 or 2.
// With the Hive Pack a release spawned 2.5 bees on average and now 1.5 (x0.6), so the bees deal x0.15 in all, the
// pack's 85%; without it 2 and now 1.33 (x0.67), x0.17 in all.
//
// The hit (Forge 47.4.0's LivingEntity.hurt, read in the patched jar). A hit outside the half-second hit window opens
// it and keeps its amount there; a hit inside the window lands only what is above the kept amount and keeps its own
// instead. Either way the window keeps the amount the hurt was called with, and LivingHurtEvent, where this script
// lowers a bee's hit to x0.25, changes only what lands, so the window would keep the bee's full amount and take it
// from the next hit within half a second. In this pack it keeps nothing: Universal Enchants 8.0.0's
// no_projectile_immunity, true in `config/universalenchants-server.toml` (and its default), closes the window in
// LivingHurtEvent after every hit of a `#minecraft:is_projectile` damage type on an entity other than a player, and
// vanilla's tag holds mob_projectile. So a bee's hit on a mob leaves no window, and clears any open one (as it does
// without this script), and the cut is exact. Limits:
// - if no_projectile_immunity is turned off or Universal Enchants leaves the pack, the window keeps the bee's full
//   amount, and the same attacker's next hit within half a second lands only what is above it;
// - on a player, which Universal Enchants leaves out, the window keeps the bee's full amount;
// - a bee's hit inside a window that another hit opened lands x0.25 of what is above that hit;
// - code that acts on the hit before LivingHurtEvent sees the bee's uncut 5 to 8, once: the attack event, pre-damage
//   hooks and the hurt mob's own hurt method (a Cataclysm boss's damage bucket counts it whole, for one).
// Cancelling the bee's hit and hurting the target again with x0.25 would put the cut amount in the window without
// Universal Enchants, but it would run twice everything that acts on a hit before the attack event (Majrusz Library's
// pre-damage changes among them) and the hurt mob's own hurt method, so this script does not do that.
//
// A release (IHoneycomb.apply): Terra Curio's LivingHurtEvent handler calls it on every hurt of an entity wearing one
// of the six curios that release bees (Honey Comb, Bee Cloak, Stinger Necklace, Sweetheart Necklace, Honey Balloon,
// Amber Horseshoe Balloon), once per hurt however many of them are worn, when the amount is above 0, except a fall out
// of the world and /kill. It adds RandomSource.nextInt(1, 4) bees, nextInt(1, 5) with the Hive Pack (upper bound
// excluded), one after another in the same tick, each owned by the wearer from its constructor. Each call also gives
// the wearer Honey for 5 seconds; this script leaves that as it is, so Honey still comes on every hurt, poison, fire
// and falls included, also where the rule below cancels the bees. Nothing else in the pack spawns this entity, so both
// cuts reach all six items. Simply Swords' Hiveheart bee (`simplyswords:simplybeeentity`, a sting) is another entity,
// untouched. On the same hurt the Bee Cloak, Star Cloak and Star Veil drop 3 stars (IStarCloak.apply; entity
// `confluence:star_cloak`, class StarCloakEntity, owned by the wearer from its constructor; each hits for a constant
// 10, damage type `confluence:star_cloak`). Their hits are not cut.
//
// Only a hurt with a living attacker other than the wearer releases bees or stars: the damage source's entity is a
// living entity other than the hurt one (a mob's or another player's hit, an arrow or spell they sent, their
// explosion). A tick of Majrusz's Bleeding is such a hurt: it names the entity that started the bleeding as its
// attacker (Progressive Difficulty's BleedingDamage.dealDamage), so it releases bees and stars, unlike Poison, fire
// and falls. On a hurt without one (poison, wither, fire, a fall, drowning, a boss's damage that names no attacker)
// or caused by the wearer themselves, the bees and stars that Terra Curio adds are cancelled as they join the level,
// before the 1, 1, 2, 2 count. Terra Curio's handler runs at NORMAL and makes both releases inside that hurt's
// LivingHurtEvent, after this script's hurt listener (at HIGHEST) has cut a bee's hit and noted the hurt. The note is
// the last hurt seen: when another hurt happens inside one before Terra Curio's handler (another mod's effect), the
// release follows that inner hurt, or goes through when the inner hurt was another entity's. HONEYCOMB_ATTACKED_ONLY
// false turns this rule off. A bee or star that is not spawned is cancelled at HIGHEST, before the join listeners at
// lower priorities see it. A bee or star loaded from disk with its chunk, one without an owner (a /summon) and the
// client's copies are left alone. A release is told apart by its owner and the game tick, so two wearers' releases in
// one tick stay separate; two releases of one wearer in one tick (two hurts in one tick, which hurt immunity mostly
// prevents) count as one. The count is kept for the current tick only.
//
// Forge keeps a listener until the server stops and KubeJS's global object survives a script reload, so the flag
// below keeps `/kubejs reload startup_scripts` from registering the listeners twice; a change to this file takes
// effect at a restart. An error here would reach the game's damage or spawn code, so each listener catches it and
// logs its first one: an error before the cut lands the bee's hit uncut, one after it lets that hurt's release go
// through, and a bee or star whose release fails spawns.
const $HoneycombBeeForge = Java.loadClass('net.minecraftforge.common.MinecraftForge')
const $HoneycombBeePriority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority')
const HONEYCOMB_BEE_TYPE = 'confluence:bee_projectile'
const HONEYCOMB_STAR_TYPE = 'confluence:star_cloak'
const HONEYCOMB_BEE_HIT = 0.25
const HONEYCOMB_ATTACKED_ONLY = true
// The current game tick and, for it, how many bees each owner's release has added so far.
let honeycombBeeTick = null
let honeycombBeeReleased = {}
// The last hurt seen: its entity's UUID and whether it had a living attacker other than that entity.
let honeycombBeeHurt = null

function honeycombBeeIs(entity) {
  return entity !== null && entity !== undefined && String(entity.getType()) === HONEYCOMB_BEE_TYPE
}

function honeycombBeeListen(eventClass, name, handle) {
  let logged = false
  $HoneycombBeeForge.EVENT_BUS.addListener($HoneycombBeePriority.HIGHEST, false, Java.loadClass(eventClass), (event) => {
    try {
      handle(event)
    } catch (error) {
      if (!logged) console.error('Honey Comb bees, ' + name + ', its first error until the next start: ' + error)
      logged = true
    }
  })
}

if (!global.honeycombBeesHooked) {
  global.honeycombBeesHooked = true
  honeycombBeeListen('net.minecraftforge.event.entity.living.LivingHurtEvent', 'hurt', (event) => {
    honeycombBeeHurt = null
    let source = event.getSource()
    if (honeycombBeeIs(source.getImmediate())) event.setAmount(event.getAmount() * HONEYCOMB_BEE_HIT)
    if (!HONEYCOMB_ATTACKED_ONLY) return
    let uuid = String(event.getEntity().getUuid())
    let attacker = source.getActual()
    let attacked = attacker !== null && attacker !== undefined && attacker.isLiving() && String(attacker.getUuid()) !== uuid
    honeycombBeeHurt = { uuid: uuid, attacked: attacked }
  })
  honeycombBeeListen('net.minecraftforge.event.entity.EntityJoinLevelEvent', 'release', (event) => {
    if (event.loadedFromDisk()) return
    let entity = event.getEntity()
    let type = String(entity.getType())
    let bee = type === HONEYCOMB_BEE_TYPE
    if (!bee && type !== HONEYCOMB_STAR_TYPE) return
    let level = event.getLevel()
    if (level.isClientSide()) return
    let owner = entity.getOwner()
    if (owner === null || owner === undefined) return
    let key = String(owner.getUuid())
    if (honeycombBeeHurt !== null && honeycombBeeHurt.uuid === key && !honeycombBeeHurt.attacked) {
      event.setCanceled(true)
      return
    }
    if (!bee) return
    let now = Number(level.getTime())
    if (now !== honeycombBeeTick) {
      honeycombBeeTick = now
      honeycombBeeReleased = {}
    }
    let count = (honeycombBeeReleased[key] || 0) + 1
    honeycombBeeReleased[key] = count
    if (count % 2 === 0) event.setCanceled(true)
  })
}
