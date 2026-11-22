// Iron's Spells' school resistances on every mob, also on the spawn paths that skip Forge's FinalizeSpawn event.
//
// Iron's Spells 3.4.0.1 sets them only in its listener of that event (ServerPlayerEvents.handleResistanceAttributesOnSpawn,
// read in the jar): an undead mob gets base holy resistance 0.5 and blood 1.5, else a water mob lightning 0.5; a fire
// immune mob fire 1.5; a Blaze ice 0.5 (each only where the mob has the attribute). Forge posts the event where vanilla
// sets up a mob (natural spawns, spawners, spawn eggs, /summon). A mob that a mod or vanilla adds another way does not
// get them: the Wither built from skulls, bosses raised from an altar, a bait or a corpse, and minions and converted
// mobs that are added straight to the world. Iron's damage factor is 2 minus the resistance, so such an undead boss
// took x1.0 from holy spells where a summoned one takes x1.5, and x1.0 from blood where a summoned one takes x0.5.
//
// When a mob joins the world, this applies what Iron's listener would have applied, by the same tests, to each of
// those attributes whose base value is still the jar's default for its type, which is what a mob that skipped the
// event has; a mob that had the event, or whose value something else set, is left alone. A mob it changed gets the
// tag ironSchoolResists and is not looked at again; a saved mob from before is changed the first time it loads. Any
// error changes nothing more and logs one line per mob type and server run.

const IRON_SCHOOL_RESISTS_TAG = 'ironSchoolResists'
const IRON_SCHOOL_RESISTS_JAVA = {}
const IRON_SCHOOL_RESISTS_LOGGED = {}

function ironSchoolResistsJava() {
  let java = IRON_SCHOOL_RESISTS_JAVA
  if (!java.mob) {
    let registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    let Location = Java.loadClass('net.minecraft.resources.ResourceLocation')
    let types = Java.loadClass('net.minecraft.world.entity.MobType')
    java.defaults = Java.loadClass('net.minecraft.world.entity.ai.attributes.DefaultAttributes')
    java.undead = types.UNDEAD
    java.water = types.WATER
    java.attribute = {}
    let names = ['holy', 'blood', 'lightning', 'fire', 'ice']
    names.forEach((name) => {
      java.attribute[name] = registries.ATTRIBUTE.get(new Location('irons_spellbooks:' + name + '_magic_resist'))
    })
    java.mob = Java.loadClass('net.minecraft.world.entity.Mob')
  }
  return java
}

// What Iron's listener sets on this mob: [[school, base], ...], in its order.
function ironSchoolResistsWanted(mob, java) {
  let wanted = []
  let type = mob.getMobType()
  if (type.equals(java.undead)) {
    wanted.push(['holy', 0.5])
    wanted.push(['blood', 1.5])
  } else if (type.equals(java.water)) {
    wanted.push(['lightning', 0.5])
  }
  if (mob.fireImmune()) wanted.push(['fire', 1.5])
  if (String(mob.type) === 'minecraft:blaze') wanted.push(['ice', 0.5])
  return wanted
}

// Returns the schools it set, or null when it had nothing to do.
function ironSchoolResistsApply(mob) {
  if (!mob || !mob.isLiving() || mob.isPlayer() || mob.tags.contains(IRON_SCHOOL_RESISTS_TAG)) return null
  let java = ironSchoolResistsJava()
  if (!(mob instanceof java.mob)) return null
  let wanted = ironSchoolResistsWanted(mob, java)
  if (wanted.length === 0) return null
  let supplier = java.defaults.getSupplier(mob.getType())
  let set = []
  wanted.forEach((want) => {
    let attribute = java.attribute[want[0]]
    let instance = attribute == null ? null : mob.getAttribute(attribute)
    if (instance == null || supplier == null || !supplier.hasAttribute(attribute)) return
    let base = Number(instance.getBaseValue())
    if (Math.abs(base - Number(supplier.getBaseValue(attribute))) > 0.000001 || Math.abs(base - want[1]) < 0.000001) return
    instance.setBaseValue(want[1])
    set.push(want[0] + ' ' + want[1])
  })
  if (set.length === 0) return null
  mob.addTag(IRON_SCHOOL_RESISTS_TAG)
  return set
}

function ironSchoolResistsFix(mob) {
  try {
    return ironSchoolResistsApply(mob)
  } catch (error) {
    let key = 'error'
    try {
      key = String(mob.type)
    } catch (ignored) {
      // One line for every such mob.
    }
    if (!IRON_SCHOOL_RESISTS_LOGGED[key]) {
      IRON_SCHOOL_RESISTS_LOGGED[key] = true
      console.warn('[iron school resists] ' + key + ': left as it is after an error: ' + error)
    }
    return null
  }
}

EntityEvents.spawned((event) => {
  ironSchoolResistsFix(event.entity)
})
