import { Registries } from "../core/registry.js";
import { construct } from "../core/constructor.js";
Registries.statuses.add(
  "burning",
  construct(
    {
      name: "Burning",
      damage: 5,
      interval: 30,
      damageType: "fire",
      effect: "burning",
      effectChance: 0.5,
    },
    "status-effect"
  )
);
Registries.statuses.add(
  "plasma-burn",
  construct(
    {
      name: "Plasma Burn",
      damage: 6,
      interval: 25,
      damageType: "fire",
      effect: "plasma-burn",
      effectChance: 0.5,
      attributeModifiers: {
        resistances: 0.8,
      },
    },
    "status-effect"
  )
);
Registries.statuses.add(
  "plasma-burn-boosted",
  construct(
    {
      name: "Plasma Burn II",
      damage: 9,
      interval: 25,
      damageType: "fire",
      effect: "plasma-burn-boosted",
      effectChance: 0.5,
      attributeModifiers: {
        resistances: 0.6,
      },
    },
    "status-effect"
  )
);
Registries.statuses.add(
  "destabilised",
  construct(
    {
      name: "Destabilised",
      damage: 100,
      interval: 120,
      damageType: "destabilisation",
      effect: "destabilised",
      effectChance: 0.5,
    },
    "status-effect"
  )
);

Registries.statuses.add(
  "death-burn",
  construct(
    {
      name: "Death Burn",
      damage: 9,
      interval: 25,
      damageType: "fire",
      effect: "death-burn",
      effectChance: 0.5,
      attributeModifiers: {
        resistances: 0,
        speed: 0.5,
      },
    },
    "status-effect"
  )
);