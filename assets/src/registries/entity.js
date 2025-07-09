import { Registries } from "../core/registry.js";
Registries.entities.add("tonk", {
  type: "modular-tank",
});
Registries.entities.add("scrap-player", {
  type: "player",
  name: "Player",
  health: 100,
  light: 100,
  components: [
    {
      image: "entity.scrap-sentinel.head",
      width: 32,
      height: 32,
    },
    {
      image: "entity.scrap-sentinel.body",
      width: 32,
      height: 32,
    },
    {
      type: "leg-component",
      image: "entity.scrap-sentinel.legs",
      width: 32,
      height: 32,
    },
  ],
  armType: {
    width: 32,
    height: 11,
    yOffset: 13,
    image: "arm.scrap",
  },
  team: "player",
  width: 25,
  height: 25,
  speed: 3,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [
        {
          item: "scrap",
          count: 20,
        },
      ],
      outputs: [
        {
          item: "scrap-storage",
          count: 1,
        },
      ],
      time: 150,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 10,
        },
      ],
      outputs: [
        {
          item: "scrap-drill",
          count: 1,
        },
      ],
      time: 300,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 25,
        },
      ],
      outputs: [
        {
          item: "scrap-assembler",
          count: 1,
        },
      ],
      time: 600,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 40,
        },
      ],
      outputs: [
        {
          item: "scrap-compressor",
          count: 1,
        },
      ],
      time: 600,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 30,
        },
      ],
      outputs: [
        {
          item: "scrap-smelter",
          count: 1,
        },
      ],
      time: 600,
    },
  ],
});
Registries.entities.add("iti-player", {
  type: "player",
  name: "Integrity",
  health: 350,
  light: 100,
  components: [
    {
      image: "npc.iti.player.head",
      width: 32,
      height: 32,
      xOffset: -3,
    },
    {
      image: "npc.iti.generic.body",
      width: 32,
      height: 32,
    },
    {
      type: "leg-component",
      image: "npc.iti.generic.legs",
      width: 32,
      height: 32,
    },
  ],
  armType: {
    width: 32,
    height: 11,
    yOffset: 13,
    image: "arm.iti",
  },
  team: "player",
  width: 25,
  height: 25,
  speed: 4,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [
        {
          item: "scrap",
          count: 20,
        },
      ],
      outputs: [
        {
          item: "scrap-storage",
          count: 1,
        },
      ],
      time: 150,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 10,
        },
      ],
      outputs: [
        {
          item: "scrap-drill",
          count: 1,
        },
      ],
      time: 300,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 25,
        },
      ],
      outputs: [
        {
          item: "scrap-assembler",
          count: 1,
        },
      ],
      time: 600,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 40,
        },
      ],
      outputs: [
        {
          item: "scrap-compressor",
          count: 1,
        },
      ],
      time: 600,
    },
    {
      inputs: [
        {
          item: "scrap",
          count: 30,
        },
      ],
      outputs: [
        {
          item: "scrap-smelter",
          count: 1,
        },
      ],
      time: 600,
    },
  ],
});
Registries.entities.add("scavenger", {
  name: "Scavenger",
  type: "equipped-entity",
  health: 150,
  speed: 2.5,
  components: [
    {
      image: "entity.scrap-sentinel.head",
      width: 32,
      height: 32,
    },
    {
      image: "entity.scrap-sentinel.body",
      width: 32,
      height: 32,
    },
    {
      type: "leg-component",
      image: "entity.scrap-sentinel.legs",
      width: 32,
      height: 32,
    },
  ],
  width: 25,
  height: 25,
  aiType: "scavenger",
  attackRange: 250,
  targetRange: 500,
  rightHand: [
    {
      item: "scrap-shooter",
      min: 0,
      max: 1,
      dropChance: 0.25,
    },
  ],
  leftHand: [
    {
      item: "scrap-shooter",
      min: 0,
      max: 1,
      dropChance: 0.25,
    },
  ],
  armType: {
    width: 32,
    height: 11,
    yOffset: 13,
    image: "arm.scrap",
  },
  equipment: [
    {
      item: "scrap-bullet",
      min: 100,
      max: 250,
      dropChance: 0.5,
    },
  ],
  inventory: [
    {
      item: "scrap",
      min: 10,
      max: 25,
      dropChance: 0.6,
    },
  ],
});
Registries.entities.add("scrap-sentinel", {
  name: "Scrap Sentinel",
  type: "equipped-entity",
  health: 400,
  speed: 2,
  components: [
    {
      image: "entity.scrap-sentinel.head",
      width: 40,
      height: 40,
    },
    {
      image: "entity.scrap-sentinel.body",
      width: 40,
      height: 40,
    },
    {
      type: "leg-component",
      image: "entity.scrap-sentinel.legs",
      width: 40,
      height: 40,
    },
  ],
  width: 35,
  height: 35,
  aiType: "guard",
  attackRange: 200,
  targetRange: 400,
  rightHand: [
    {
      item: "scrap-shooter",
      dropChance: 0.25,
    },
  ],
  leftHand: [
    {
      item: "scrap-shooter",
      dropChance: 0.25,
    },
  ],
  armType: {
    width: 35,
    height: 12,
    yOffset: 15,
    image: "arm.scrap",
  },
  equipment: [
    {
      item: "scrap-bullet",
      min: 200,
      max: 500,
      dropChance: 0.5,
    },
  ],
  inventory: [
    {
      item: "scrap",
      min: 20,
      max: 50,
      dropChance: 0.6,
    },
  ],
  armType: {
    width: 32,
    height: 11,
    yOffset: 13,
    image: "arm.scrap",
  },
});
Registries.entities.add("iti-corporate-merchant", {
  type: "npc",
  name: "InfiniTech Industries Corporate Merchant",
  inventorySize: 1,
  components: [
    {
      image: "npc.iti.corporate-merchant.head",
      width: 35,
      height: 35,
    },
    {
      image: "npc.iti.generic.body",
      width: 35,
      height: 35,
    },
    {
      type: "leg-component",
      image: "npc.iti.generic.legs",
      width: 35,
      height: 35,
    },
  ],
  trades: [
    {
      cost: 145000,
      items: [
        {
          item: "iti-laser-caster",
          count: 1,
        },
      ],
    },
  ],
  speed: 3,
  health: 1000,
  width: 35,
  height: 35,
  aiType: "passive",
  attackRange: 400,
  angerRange: 700,
  defensiveRange: 400,
  targetRange: 300,
  armType: {
    width: 35,
    height: 12,
    yOffset: 15,
    image: "arm.iti",
  },
  rightHand: [
    {
      item: "iti-laser-caster",
      dropChance: 0.125,
    },
  ],
  leftHand: [
    {
      item: "iti-laser-caster",
      dropChance: 0.125,
    },
  ],
  equipment: [
    {
      item: "iti-energy-cell",
      dropChance: 0.2,
      min: 5,
      max: 20,
    },
  ],
});

Registries.entities.add("scrapper", {
  name: "The Scrapper",
  type: "equipped-entity",
  health: 2000,
  speed: 2.5,
  isBoss: true,
  components: [
    {
      image: "entity.scrap-sentinel.head",
      width: 50,
      height: 50,
    },
    {
      image: "entity.scrap-sentinel.body",
      width: 50,
      height: 50,
    },
    {
      type: "leg-component",
      image: "entity.scrap-sentinel.legs",
      width: 50,
      height: 50,
    },
  ],
  width: 50,
  height: 50,
  aiType: "hostile",
  attackRange: 250,
  targetRange: 2600,
  rightHand: [
    {
      item: "scrap-cannon",
      dropChance: 0.25,
    },
  ],
  leftHand: [
    {
      item: "scrap-repeater",
      dropChance: 0.25,
    },
  ],
  armType: {
    width: 50,
    height: 17,
    yOffset: 20,
    image: "arm.scrap",
  },
  equipment: [
    {
      item: "scrap",
      min: 60,
      max: 100,
      dropChance: 0.5,
    },
    {
      item: "scrap",
      min: 60,
      max: 100,
      dropChance: 0.5,
    },
    {
      item: "scrap-bullet",
      min: 6000,
      max: 10000,
      dropChance: 0.5,
    },
    {
      item: "scrap-bullet",
      min: 6000,
      max: 10000,
      dropChance: 0.5,
    },
  ],
  inventory: [
    {
      item: "scrap",
      min: 20,
      max: 100,
      dropChance: 0.6,
    },
    {
      item: "scrap",
      min: 20,
      max: 100,
      dropChance: 0.6,
    },
    {
      item: "scrap",
      min: 20,
      max: 100,
      dropChance: 0.6,
    },
  ],
  armType: {
    width: 50,
    height: 16,
    yOffset: 16,
    image: "arm.scrap",
  },
});
