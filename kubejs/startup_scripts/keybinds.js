KeyBindEvents.register((event) => {
  event.create(
    "kubejs:toggle_shake",
    "Toggle Screen Shake",
    GLFW.GLFW_KEY_J,
    "Prodigium Reforged",
  );
});

KeyBindEvents.modify((event) => {
  // Defaults belong in config/defaultoptions/keybindings.txt. Changing only a
  // KeyMapping's default here makes Default Options preserve its old active key.

  event.remove("desc.seasonhud.keybind.options");
  event.remove("key.simplyskills.ability2");
  event.remove("key.block_factorys_bosses.dodge_roll");
  event.remove("dropoff.key.dump");
  event.remove("dropoff.key.deposit");
  event.remove("key.advancements");

  event.addHideKey("key.block_factorys_bosses.dodge_roll");
  event.addHideKey("dropoff.key.dump");
  event.addHideKey("dropoff.key.deposit");
});
