// End a dying player's item use.
//
// A player who dies in the middle of eating is otherwise kicked about a second later. The game removes a dead
// player after 20 ticks, which drops the food list Spice of Life keeps on the player, while the bite keeps counting
// down. When it completes, that mod looks for the food list, throws inside the player's tick, and Neruina turns
// the exception into a kick. Ending the item use at the moment of death means no bite completes on a dead player.
// The death itself is not touched.

EntityEvents.death((event) => {
  const entity = event.entity
  if (entity.isPlayer() && entity.isUsingItem()) entity.stopUsingItem()
})

ServerEvents.commandRegistry((event) => {
  const Commands = event.commands
  // Operator/RCON diagnostic: the two item-use calls above must resolve on a living entity in this KubeJS build.
  // It builds an armor stand that is never added to the world.
  event.register(Commands.literal('deathuse').requires((source) => source.hasPermission(2)).executes((ctx) => {
    const stand = ctx.source.level.createEntity('minecraft:armor_stand')
    if (stand.isUsingItem()) throw new Error('A new armor stand reports that it is using an item')
    stand.stopUsingItem()
    ctx.source.sendSystemMessage(Text.of('Death item-use fix verified: both calls resolve on a living entity; nothing was added to the world.'))
    return 1
  }))
})
