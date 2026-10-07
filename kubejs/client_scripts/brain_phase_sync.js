// Terra Entity 1.1.16-hotfix2 changes BrainOfCthulhu.stage only on the server.
// Its client isPickable() still checks that field, so phase-two melee targeting
// fails in both vanilla and Better Combat. The skill index IS synchronized:
// 0-3 = spawn/phase one, 4-8 = transition/phase two.
// Repair only the client's derived phase; the server still decides all damage.
ClientEvents.tick(event => {
  if (!event.player) return;
  event.player.level.getEntities().forEach(entity => {
    // BrainFake overrides isPickable()/hurt() and must remain a decoy.
    if (entity.type !== 'terra_entity:brain_of_cthulhu') return;
    const index = entity.getSkills().index;
    // Do not guess the meaning of a future version's additional skill states.
    if (index < 0 || index > 8) return;
    const phase = index >= 4 ? 2 : 1;
    if (entity.stage !== phase) entity.stage = phase;
  });
});
