Registry.statuses.add(
  "burning",
  construct({
    name: "Burning",
    damage: 5,
    interval: 30,
    damageType: "fire",
    effect: "burning",
    effectChance: 0.5
  }, "status-effect")
);
Registry.statuses.add(
  "plasma-burn",
  construct({
    name: "Plasma Burn",
    damage: 6,
    interval: 20,
    damageType: "fire",
    effect: "plasma-burn",
    effectChance: 0.5
  }, "status-effect")
);
