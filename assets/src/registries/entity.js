import { Registries } from "../core/registry.js";
Registries.entities.add("tonk", { type: "modular-tank" });
Registries.entities.add("recycled", {
  type: "player",
  name: "The Recycled",
  health: 150,
  light: 100,
  components: [
    { image: "entity.scrap-sentinel.head", width: 32, height: 32 },
    { image: "entity.scrap-sentinel.body", width: 32, height: 32 },
    { type: "leg-component", image: "entity.scrap-sentinel.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.scrap" },
  team: "scrap",
  width: 25,
  height: 25,
  speed: 3,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [{ item: "scrap", count: 20 }],
      outputs: [{ item: "scrap-storage", count: 1 }],
      time: 150,
    },
    {
      inputs: [{ item: "scrap", count: 10 }],
      outputs: [{ item: "scrap-drill", count: 1 }],
      time: 300,
    },
    {
      inputs: [{ item: "scrap", count: 25 }],
      outputs: [{ item: "scrap-assembler", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 40 }],
      outputs: [{ item: "scrap-compressor", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 30 }],
      outputs: [{ item: "scrap-smelter", count: 1 }],
      time: 600,
    },
  ],
  rightHand: [{ item: "scrap-shooter" }],
  ammo: [{ item: "scrap-bullet", count: 1000 }],
});
Registries.entities.alias("recycled", "scrap-player");
Registries.entities.add("integrity", {
  type: "player",
  name: "Integrity",
  health: 350,
  light: 100,
  components: [
    { image: "npc.iti.player.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.iti.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.iti.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.iti" },
  team: "iti",
  width: 25,
  height: 25,
  speed: 4,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [{ item: "scrap", count: 20 }],
      outputs: [{ item: "scrap-storage", count: 1 }],
      time: 150,
    },
    {
      inputs: [{ item: "scrap", count: 10 }],
      outputs: [{ item: "scrap-drill", count: 1 }],
      time: 300,
    },
    {
      inputs: [{ item: "scrap", count: 25 }],
      outputs: [{ item: "scrap-assembler", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 40 }],
      outputs: [{ item: "scrap-compressor", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 30 }],
      outputs: [{ item: "scrap-smelter", count: 1 }],
      time: 600,
    },
  ],
  rightHand: [{ item: "iti-laser-pistol" }],
});
Registries.entities.alias("integrity", "iti-player");
Registries.entities.add("endeavour", {
  type: "player",
  name: "Endeavour",
  health: 200,
  light: 100,
  components: [
    { image: "npc.ccc.player.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.ccc.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.ccc.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, image: "arm.ccc" },
  team: "ccc",
  width: 25,
  height: 25,
  speed: 4,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [{ item: "scrap", count: 20 }],
      outputs: [{ item: "scrap-storage", count: 1 }],
      time: 150,
    },
    {
      inputs: [{ item: "scrap", count: 10 }],
      outputs: [{ item: "scrap-drill", count: 1 }],
      time: 300,
    },
    {
      inputs: [{ item: "scrap", count: 25 }],
      outputs: [{ item: "scrap-assembler", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 40 }],
      outputs: [{ item: "scrap-compressor", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 30 }],
      outputs: [{ item: "scrap-smelter", count: 1 }],
      time: 600,
    },
  ],
});
Registries.entities.alias("endeavour", "ccc-player");
Registries.entities.add("proton", {
  type: "player",
  name: "Proton",
  health: 100,
  light: 100,
  components: [
    { image: "npc.peti.player.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.peti.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.peti.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, image: "arm.peti" },
  team: "peti",
  width: 25,
  height: 25,
  speed: 5,
  assemblySlots: 4,
  assemblyRecipes: [
    {
      inputs: [{ item: "scrap", count: 20 }],
      outputs: [{ item: "scrap-storage", count: 1 }],
      time: 150,
    },
    {
      inputs: [{ item: "scrap", count: 10 }],
      outputs: [{ item: "scrap-drill", count: 1 }],
      time: 300,
    },
    {
      inputs: [{ item: "scrap", count: 25 }],
      outputs: [{ item: "scrap-assembler", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 40 }],
      outputs: [{ item: "scrap-compressor", count: 1 }],
      time: 600,
    },
    {
      inputs: [{ item: "scrap", count: 30 }],
      outputs: [{ item: "scrap-smelter", count: 1 }],
      time: 600,
    },
  ],
  rightHand: [{ item: "peti-charged-laser-blaster" }],
});
Registries.entities.alias("proton", "peti-player");

Registries.entities.add("scavenger", {
  name: "Scavenger",
  type: "equipped-entity",
  health: 150,
  speed: 2.5,
  components: [
    { image: "entity.scrap-sentinel.head", width: 32, height: 32, xOffset: -3 },
    { image: "entity.scrap-sentinel.body", width: 32, height: 32 },
    { type: "leg-component", image: "entity.scrap-sentinel.legs", width: 32, height: 32 },
  ],
  width: 25,
  height: 25,
  aiType: "scavenger",
  attackRange: 250,
  targetRange: 500,
  approachDist: 30,
  rightHand: [{ item: "scrap-shooter", min: 0, max: 1, dropChance: 0.25 }],
  leftHand: [{ item: "scrap-shooter", min: 0, max: 1, dropChance: 0.25 }],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.scrap" },
  ammo: [{ item: "scrap-bullet", min: 100, max: 250, dropChance: 0.5 }],
  inventory: [{ item: "scrap", min: 10, max: 25, dropChance: 0.6 }],
});
Registries.entities.add("scrap-sentinel", {
  name: "Scrap Sentinel",
  type: "equipped-entity",
  health: 400,
  speed: 2,
  components: [
    { image: "entity.scrap-sentinel.head", width: 40, height: 40 },
    { image: "entity.scrap-sentinel.body", width: 40, height: 40 },
    { type: "leg-component", image: "entity.scrap-sentinel.legs", width: 40, height: 40 },
  ],
  width: 35,
  height: 35,
  aiType: "guard",
  attackRange: 200,
  targetRange: 400,
  rightHand: [{ item: "scrap-shooter", dropChance: 0.25 }],
  leftHand: [{ item: "scrap-shooter", dropChance: 0.25 }],
  armType: { width: 35, height: 12, yOffset: 15, xOffset: 7, image: "arm.scrap" },
  ammo: [{ item: "scrap-bullet", min: 200, max: 500, dropChance: 0.5 }],
  inventory: [{ item: "scrap", min: 20, max: 50, dropChance: 0.6 }],
  armType: { width: 32, height: 11, yOffset: 13, image: "arm.scrap" },
});
Registries.entities.add("iti-corporate-merchant", {
  type: "interactable-entity",
  team: "iti",
  name: "ITI Corporate Merchant",
  inventorySize: 1,
  components: [
    { image: "npc.iti.corporate-merchant.head", width: 35, height: 35 },
    { image: "npc.iti.generic.body", width: 35, height: 35 },
    { type: "leg-component", image: "npc.iti.generic.legs", width: 35, height: 35 },
  ],
  tradeCostX: 1.25,
  trades: ["iti-laser-caster", "iti-energy-repeater", "launch-pad", "landing-pad"],
  dialogue: {
    conversations: {
      "*": {
        line: "#i-InfiniTech Industries#--, corporate merchant model.\nState your intentions.",
        options: {
          "I'd like to buy something.": ["<trade>"],
          "I want a fight!": { actions: ["~-.2", "fight", "agg"], excludeFlags: ["agg"] },
        },
      },
      "fight": {
        line: "#7-[[Hostility detected. Recommended course of action: disengage.]]",
        options: {
          "Uhh... Disengage?": ["??"],
          "I said, I want a fight!": ["'This may not end well.'", "fconf"],
        },
      },
      "fight,??": {
        line: `#7-[[Confusion detected, defining #7idisengage#7-]]
#-bdisengage#-- #7-/dĭs″ĕn-gāj′/
#-iintransitive verb#--
- To release from something that holds fast, connects, or entangles.
- To release (oneself) from an engagement, pledge, or obligation.
- To free or detach oneself; withdraw.
`,
        options: {
          "So, no fight?": ["-??", "???"],
          "Whatever, fight me!": ["'This may not end well.'", "fconf", "-??"],
        },
      },
      "fight,???": {
        line: `Correct. Conflict (especially physical) within #>>icon.iti#i-ITI#-- is to be avoided by #=-all personnel#--, especially those on the #-iExoplanet Resource Extraction Initiative#--.`,
        options: {
          "Oh, ok then.": ["~.05", "-???", "-fight", "fd"], // fight denied
          "I don't care, fight me!": ["'Really?'", "'This may not end well.'", "fconf", "-???"],
        },
      },
      "fight,fconf": {
        line: "#7-[[Disengaging immediately. Defensive forces in transit.]]\n #c-/// Prepare yourself ///",
        options: {
          "Bring it on!": [
            "<leave>",
            "left",
            "*iti-defenses-called",
            {
              type: "repeat",
              action: { type: "deliver", xOff: 300, yOff: 300, entity: "iti-defense" },
              count: 3,
            },
          ],
        },
      },
    },
  },
  speed: 3,
  health: 1000,
  width: 35,
  height: 35,
  aiType: "passive",
  targetRange: 200,
  armType: { width: 35, height: 12, yOffset: 15, xOffset: 7, image: "arm.iti" },
  // rightHand: [{ item: "iti-laser-caster", dropChance: 0.125 }],
  // leftHand: [{ item: "iti-laser-caster", dropChance: 0.125 }],
});
// a special entity which attacks only the player.
Registries.entities.add("iti-defense", {
  type: "equipped-entity",
  name: "ITI Personnel Defender",
  health: 500,
  light: 100,
  components: [
    { image: "npc.iti.defense.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.iti.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.iti.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.iti" },
  team: "iti*",
  width: 25,
  height: 25,
  aiType: "player-hostile",
  attackRange: 300,
  targetRange: 1000,
  speed: 4,
  inventory: [{ item: "iti-energy-cell", dropChance: 0.25, min: 5, max: 25 }],
  rightHand: [{ item: "iti-laser-pistol", dropChance: 0.25 }],
  leftHand: [{ item: "iti-laser-pistol", dropChance: 0.25 }],
});

Registries.entities.add("scrapper", {
  name: "The Scrapper",
  type: "equipped-entity",
  health: 2000,
  speed: 2.5,
  isBoss: true,
  components: [
    { image: "entity.scrap-sentinel.head", width: 50, height: 50 },
    { image: "entity.scrap-sentinel.body", width: 50, height: 50 },
    { type: "leg-component", image: "entity.scrap-sentinel.legs", width: 50, height: 50 },
  ],
  width: 50,
  height: 50,
  aiType: "hostile",
  attackRange: 250,
  targetRange: 2600,
  rightHand: [{ item: "scrap-cannon", dropChance: 0.25 }],
  leftHand: [{ item: "scrap-repeater" }],
  armType: { width: 50, height: 17, yOffset: 20, image: "arm.scrap" },
  ammo: [
    { item: "scrap", min: 60, max: 100, dropChance: 0.5 },
    { item: "scrap", min: 60, max: 100, dropChance: 0.5 },
    { item: "scrap-bullet", min: 6000, max: 10000, dropChance: 0.5 },
    { item: "scrap-bullet", min: 6000, max: 10000, dropChance: 0.5 },
  ],
  inventory: [
    { item: "scrap", min: 20, max: 100, dropChance: 0.6 },
    { item: "scrap", min: 20, max: 100, dropChance: 0.6 },
    { item: "scrap", min: 20, max: 100, dropChance: 0.6 },
  ],
  armType: { width: 50, height: 16, yOffset: 16, image: "arm.scrap" },
});

// Tests
Registries.entities.add("*", {
  name: "*",
  type: "equipped-entity",
  health: 1500,
  speed: 2.5,
  components: [
    { image: "entity.scrap-sentinel.head", width: 32, height: 32 },
    { image: "entity.scrap-sentinel.body", width: 32, height: 32 },
    { type: "leg-component", image: "entity.scrap-sentinel.legs", width: 32, height: 32 },
  ],
  width: 25,
  height: 25,
  ai: {
    tasks: [
      {
        type: "ai.create-bullet",
        duration: 120,
        x: 400,
        y: -400,
        direction: 135,
        relativeToCamera: true,
        bullet: {
          speed: 0,
          despawnEffect: "none",
          lifetime: 300,
          collides: false,
          intervalNumber: 1,
          intervalTime: 1,
          intervalBullet: {
            lifetime: 200,
            extraUpdates: 199,
            light: 70,
            speed: 10,
            trail: true,
            hitSize: 60,
            trailShape: "rhombus",
            trailEffect: "death-laser-trail",
            hitEffect: "death-laser-hit~200",
            spawnEffect: "death-laser-fire",
            knockback: 10,
            drawer: { hidden: true },
            damage: [{ type: "laser", amount: 80, spread: 20 }],
          },
          fragNumber: 1,
          fragBullet: {
            lifetime: 200,
            extraUpdates: 199,
            light: 70,
            speed: 10,
            trail: true,
            pierce: 99999,
            hitSize: 60,
            trailShape: "rhombus",
            trailEffect: "death-laser-trail",
            hitEffect: "death-laser-hit~200",
            spawnEffect: "death-laser-fire",
            knockback: 10,
            drawer: { hidden: true },
            damage: [{ type: "laser", amount: 80, spread: 20 }],
          },
        },
        // pattern: { amount: 2, spacing: 40 },
        condition: { type: "aicon.mouse" },
      },
    ],
  },
  attackRange: 250,
  targetRange: 500,
  rightHand: [{ item: "scrap-shooter", min: 0, max: 1, dropChance: 0.25 }],
  leftHand: [{ item: "scrap-shooter", min: 0, max: 1, dropChance: 0.25 }],
  armType: { width: 32, height: 11, yOffset: 13, image: "arm.scrap" },
  ammo: [{ item: "scrap-bullet", min: 100, max: 250, dropChance: 0.5 }],
  inventory: [{ item: "scrap", min: 10, max: 25, dropChance: 0.6 }],
});

Registries.entities.add("test-npc", {
  type: "interactable-entity",
  name: "Test NPC",
  health: 350,
  light: 100,
  relations: { reactions: [] },
  trades: [
    "peti-electrified-plasma-launcher",
    "iti-destabilised-cell",
    { item: "iti-laser-caster", costX: 1.25 },
    { item: "iti-energy-repeater", costX: 1.25 },
    { item: "iti-laser-pistol", costX: 1.25 },
    "launch-pad",
    "landing-pad",
    "scrap",
    "copper-ingot",
    "iron-ingot",
    "electrum-ingot",
    "silver-ingot",
    "gold-ingot",
  ],
  dialogue: {
    conversations: {
      "*": {
        line: "This is a menu to test dialogue options, including integration with relationship mechanics.",
        options: {
          "[Enemy Options]": ["'Options to #c-reduce relations#--.'", "enemy"],
          "[Friend Options]": ["'Options to #a-increase relations#--.'", "friend"],
          "[External Effect Options]": ["'Options to #=-affect other entities#--.'", "extern"],
          "[Trade Options]": ["'Options to #=-modify trades#--.'", "trades"],
        },
      },
      "friend": {
        line: "Increase relations with this entity",
        options: {
          "[Increase Relations]": ["~0.1"],
          "[Debug best friend]": ["<best-friend>", "-friend"],
          "[Return]": ["-friend"],
        },
      },
      "enemy": {
        line: "Decrease relations with this entity",
        options: {
          "[Decrease Relations]": ["~-0.1"],
          "[Debug mortal enemy]": ["<mortal-enemy>", "-enemy"],
          "[Return]": ["-enemy"],
        },
      },
      "extern": {
        line: "Test how other entities will react to changes with this entity",
        options: {
          "[Decrease Relations]": ["~-0.1", "~test-npc-2:0.2"],
          "[Increase Relations]": ["~0.1", "~test-npc-2:-0.2"],
          "[Test Reaction]": [
            "'#=-Adds#-- a global flag which changes the dialogue text of #=-$test-npc-2#--.'",
            "*test",
          ],
          "[Return]": ["-extern"],
        },
      },
      "<bf>": {
        line: "Test Best Friend (#i-<bf>#--) relations here",
        options: {
          "[Decrease Relations]": ["~-0.1"],
          "[Increase Relations]": ["~0.1"],
          "[Remove Best Friend]": ["<remove-best-friend>"],
          "[Trade]": ["<trade>"],
        },
      },
      "<me>": {
        line: "Test Mortal Enemy (#i-<me>#--) relations here",
        options: {
          "[Decrease Relations]": ["~-0.1"],
          "[Increase Relations]": ["~0.1"],
          "[Remove Mortal Enemy]": ["<remove-mortal-enemy>"],
          "[Trade]": ["<trade>"],
        },
      },
      // // Equivalent to the above entry
      // "<me>": {
      //   line: "Test Mortal Enemy relations here",
      //   options: [
      //     { line: "[Decrease Relations]", actions: [{ type: "change-relation", change: -0.1 }] },
      //     { line: "[Increase Relations]", actions: [{ type: "change-relation", change: 0.1 }] },
      //     { line: "[Remove Mortal Enemy]", actions: [{ type: "remove-mortal-enemy" }] },
      //   ],
      // },
      "trades": {
        line: "Modify and start trades with this entity.",
        options: {
          "[New Trade]": ["&peti-charged-laser-blaster"],
          "[Open Trading Menu]": ["<trade>"],
          "[Return]": ["-trades"],
        },
      },
    },
  },
  components: [
    { image: "npc.iti.player.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.iti.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.iti.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.iti" },
  team: "iti",
  width: 25,
  height: 25,
  speed: 4,
});
Registries.entities.add("test-npc-2", {
  type: "interactable-entity",
  name: "Test NPC 2",
  health: 350,
  light: 100,
  relations: { reactions: [] },
  dialogue: {
    conversations: {
      "*": {
        line: "This is a menu to test dialogue options, including integration with relationship mechanics.",
        options: {
          "[Set Best Friend]": ["<best-friend>"],
          "[Set Mortal Enemy]": ["<mortal-enemy>"],
        },
      },
      "*test": {
        line: "Successfully reacted to global flag.",
        options: { "[Return]": ["'#c-Remove#-- the global flag.'", "-*test"] },
      },
      // // Equivalent to the above entry
      // "<me>": {
      //   line: "Test Mortal Enemy relations here",
      //   options: [
      //     { line: "[Decrease Relations]", actions: [{ type: "change-relation", change: -0.1 }] },
      //     { line: "[Increase Relations]", actions: [{ type: "change-relation", change: 0.1 }] },
      //     { line: "[Remove Mortal Enemy]", actions: [{ type: "remove-mortal-enemy" }] },
      //   ],
      // },
    },
  },
  components: [
    { image: "npc.iti.player.head", width: 32, height: 32, xOffset: -3 },
    { image: "npc.iti.generic.body", width: 32, height: 32 },
    { type: "leg-component", image: "npc.iti.generic.legs", width: 32, height: 32 },
  ],
  armType: { width: 32, height: 11, yOffset: 13, xOffset: 6, image: "arm.iti" },
  team: "iti",
  width: 25,
  height: 25,
  speed: 4,
});
