let bossRef = null;
let running = false;
let waveCount = 0;

EntityEvents.hurt((event) => {
  const entity = event.entity;
  const server = event.server;

  if (entity.type !== "aether:sun_spirit") return;
  if (running) return;

  running = true;
  bossRef = entity;
  waveCount = 0;

  const summonMinions = () => {
    if (!bossRef || bossRef.isRemoved() || waveCount >= 5) {
      running = false;
      bossRef = null;
      waveCount = 0;
      return;
    }

    let dimension = entity.level.dimension.toString();

    for (let i = 0; i < 3; i++) {
      // let, not const: KubeJS's Rhino keeps a const declared in a loop at its value from the first pass.
      let x = bossRef.x + (Math.random() - 0.5) * 4;
      let y = bossRef.y;
      let z = bossRef.z + (Math.random() - 0.5) * 4;
      server.runCommandSilent(
        `execute in ${dimension} run summon aether:fire_minion ${x} ${y} ${z}`,
      );
    }

    waveCount++;
    server.scheduleInTicks(400, summonMinions);
  };

  summonMinions();
});
