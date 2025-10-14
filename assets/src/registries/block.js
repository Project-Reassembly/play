import { Registries } from "../core/registry.js";
import { createLinkedBlockAndItem } from "../classes/block/block.js";
import { Item } from "../classes/item/item.js";
//## TILES ##
Registries.blocks.add("grass", {
  type: "tile",
  image: "tile.grass",
  name: "Grass Floor",
});
Registries.blocks.add("stone", {
  type: "tile",
  image: "tile.stone",
  drillSpeed: 0.5,
  name: "Stone Floor",
});
Registries.blocks.add("water", {
  type: "tile",
  image: "tile.water",
  speedMultiplier: 0.6,
  buildable: false,
  name: "Water",
});
Registries.blocks.add("sand-water", {
  type: "tile",
  image: "tile.sand-water",
  speedMultiplier: 0.8,
  drillSpeed: 0.8,
  name: "Sandy Water",
});
Registries.blocks.add("sand-grass", {
  type: "tile",
  image: "tile.sand-grass",
  name: "Sandy Grass",
});
Registries.blocks.add("sand", {
  type: "tile",
  image: "tile.sand",
  name: "Sand Floor",
});
//## FLOORS ##
//Ores
Registries.blocks.add("copper-ore", {
  type: "ore",
  image: "ore.copper",
  stages: ["", ".exposed", ".weathered", ".oxidised"],
  drillSpeed: 0.75,
  name: "Copper Ore",
});
Registries.blocks.add("coal-ore", {
  type: "ore",
  image: "ore.coal",
  drillSpeed: 1,
  name: "Coal Deposit",
});
Registries.blocks.add("iron-ore", {
  type: "ore",
  image: "ore.iron",
  drillSpeed: 0.65,
  name: "Iron Ore",
});
Registries.blocks.add("electrum-ore", {
  type: "ore",
  image: "ore.electrum",
  drillSpeed: 0.45,
  name: "Electrum Deposit",
});
//### BLOCKS ###
//## DEFENSE ##
createLinkedBlockAndItem(
  "stone-wall",
  "Stone Wall",
  "block.stone-wall",
  {
    type: "wall",
    health: 150,
  },
  {
    description: "A block of solid stone.\nCould be used as defense.",
    marketValue: 2.5,
  }
);
createLinkedBlockAndItem(
  "sandstone-wall",
  "Sandstone Wall",
  "block.sandstone-wall",
  {
    type: "wall",
    health: 90,
  },
  {
    description: "A block of sandstone.\n\nCould be used as defense.",
    marketValue: 1,
  }
);
createLinkedBlockAndItem(
  "scrap-wall",
  "Scrap Wall",
  "base.scrap",
  {
    type: "wall",
    health: 300,
  },
  {
    description: "A block of electrical scrap.\n\nCould be used as defense.",
    marketValue: 5,
  }
);
createLinkedBlockAndItem(
  "copper-wall",
  "Copper Wall",
  "base.copper",
  {
    type: "wall",
    health: 400,
  },
  {
    description: "A solid copper cube.\n\nCould be used as defense.",
    marketValue: 15,
  }
);
createLinkedBlockAndItem(
  "iron-wall",
  "Iron Wall",
  "base.iron",
  {
    type: "wall",
    health: 600,
  },
  {
    description:
      "A solid iron cube.\nSomehow doesn't rust.\n\nCould be used as defense.",
    marketValue: 52,
  }
);
createLinkedBlockAndItem(
  "tungsten-wall",
  "Tungsten Wall",
  "base.tungsten",
  {
    type: "wall",
    health: 1500,
    armour: 25,
  },
  {
    description:
      "An extremely dense cube of tungsten.\nGood thing you're a robot.\n\nCould be used as defense.",
    marketValue: 625,
  }
);
createLinkedBlockAndItem(
  "titanium-wall",
  "Titanium Wall",
  "base.titanium",
  {
    type: "wall",
    health: 2000,
    armour: 5,
  },
  {
    description: "A cube of titanium.\n\nCould be used as defense.",
    marketValue: 900,
  }
);
//## OFFENSIVE ##
createLinkedBlockAndItem(
  "bomb",
  "Bomb",
  "bomb.basic",
  {
    type: "bomb",
    health: 50,
    fuseEffect: "burning",
  },
  {
    description:
      "Explodes violently when any enemy gets near.\nCan also be manually triggered.",
    marketValue: 15,
  }
);
createLinkedBlockAndItem(
  "landmine",
  "Landmine",
  "bomb.landmine",
  {
    type: "bomb",
    health: 50,
    hiddenImg: "bomb.landmine.hidden",
    walkable: true,
    autoDetonationRange: 20,
    detonationDelay: 35,
  },
  {
    image: "bomb.landmine.item",
    description:
      "Explodes violently when any enemy gets near.\n(Mostly) hidden from enemy teams, and can be walked over.\nExplodes faster than normal bombs.\nDoes not indicate its fuse.",
    marketValue: 25,
  }
);
createLinkedBlockAndItem(
  "mini-nuke",
  "Mini Nuke",
  "bomb.basic",
  {
    type: "nuclear-bomb",
    health: 50,
    explosion: {
      radius: 180,
      amount: 1500,
    },
    fuseEffect: {
      type: "particle-emission",
      amount: 2,
      particle: {
        shape: "rhombus",
        lifetime: 30,
        speed: 0.7,
        decel: 0.05,
        widthFrom: 5,
        widthTo: 10,
        heightFrom: 5,
        heightTo: 10,
        colours: [
          [255, 255, 255],
          [255, 255, 0],
          [0, 255, 0],
        ],
        rotateSpeed: 0.2,
        light: 50,
      },
    },
    detonationDelay: 120,
    autoDetonationRange: 400,
    triggerEffect: {
      type: "wave-emission",
      particle: {
        lifetime: 120,
        radiusFrom: 35,
        radiusTo: 35,
        colours: [
          [0, 255, 0, 100],
          [255, 255, 0, 100],
          [255, 0, 0, 100],
        ],
        light: 50,
        strokeFrom: 10,
        strokeTo: 10,
      },
    },
    accelerable: false,
  },
  {
    description:
      "A Bomb powered by a runaway chain reaction of decaying Uranium.",
    rarity: Item.rarity.BLUE,
    marketValue: 2500,
  }
);
createLinkedBlockAndItem(
  "nuke",
  "Nuclear Bomb",
  "bomb.basic",
  {
    type: "nuclear-bomb",
    health: 50,
    explosion: {
      radius: 400,
      amount: 20000,
    },
    fuseEffect: "plasma-burn",
    detonationDelay: 180,
    autoDetonationRange: 300,
    triggerEffect: "laser-caster-fire",
    impactFrame: "nuke-impact",
    accelerable: false,
  },
  {
    description:
      "🟥Now I am become Death, destroyer of worlds.⬜",
    rarity: Item.rarity.SPECIAL,
    marketValue: 25000,
  }
);
//## CRAFTERS ##
//Scrap Tier [0]
createLinkedBlockAndItem(
  "scrap-assembler",
  "Scrap Assembler",
  "crafter.scrap-assembler",
  {
    type: "crafter",
    title: "Scrap Assembler",
    inventorySize: 6,
    recipes: [
      {
        inputs: [
          {
            item: "scrap",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "scrap-bullet",
            count: 100,
          },
        ],
        time: 300,
      },
      {
        inputs: [
          {
            item: "makeshift-explosive",
            count: 4,
          },
          {
            item: "scrap",
            count: 1,
          },
          {
            item: "coal",
            count: 5,
          },
        ],
        outputs: [
          {
            item: "scrap-rocket",
            count: 10,
          },
        ],
        time: 300,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 10,
          },
          {
            item: "plate",
            count: 4,
          },
        ],
        outputs: [
          {
            item: "scrap-shooter",
            count: 1,
          },
        ],
        time: 600,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 4,
          },
          {
            item: "plate",
            count: 4,
          },
          {
            item: "scrap-shooter",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "recycle",
            count: 1,
          },
        ],
        time: 1200,
      },
      {
        inputs: [
          {
            item: "recycle",
            count: 1,
          },
          {
            item: "plate",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "recycle-mounted",
            count: 1,
          },
        ],
        time: 120,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 25,
          },
          {
            item: "plate",
            count: 15,
          },
        ],
        outputs: [
          {
            item: "scrap-cannon",
            count: 1,
          },
        ],
        time: 900,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 25,
          },
          {
            item: "plate",
            count: 15,
          },
        ],
        outputs: [
          {
            item: "scrap-launcher",
            count: 1,
          },
        ],
        time: 900,
      },
      {
        inputs: [
          {
            item: "plate",
            count: 3,
          },
        ],
        outputs: [
          {
            item: "scrap-turret-base",
            count: 1,
          },
        ],
        time: 120,
      },
      {
        inputs: [
          {
            item: "scrap-turret-base",
            count: 1,
          },
          {
            item: "scrap",
            count: 20,
          },
          {
            item: "copper-wire",
            count: 30,
          },
        ],
        outputs: [
          {
            item: "scrap-turret-controller",
            count: 1,
          },
        ],
        time: 120,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 100,
          },
          {
            item: "plate",
            count: 35,
          },
        ],
        outputs: [
          {
            item: "scrap-artillery",
            count: 1,
          },
        ],
        time: 1500,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "scrap-conveyor",
            count: 1,
          },
        ],
        time: 60,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "scrap-unloader",
            count: 1,
          },
        ],
        time: 90,
      },
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
        time: 100,
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
        time: 200,
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
        time: 400,
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
        time: 400,
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
        time: 400,
      },
      {
        inputs: [
          {
            item: "scrap-assembler",
            count: 1,
          },
          {
            item: "plate",
            count: 5,
          },
        ],
        outputs: [
          {
            item: "scrap-disassembler",
            count: 1,
          },
        ],
        time: 600,
      },
      {
        inputs: [
          {
            item: "copper-ingot",
            count: 25,
          },
          {
            item: "plate",
            count: 10,
          },
        ],
        outputs: [
          {
            item: "basic-assembler",
            count: 1,
          },
        ],
        time: 1080,
      },
      {
        inputs: [
          {
            item: "makeshift-explosive",
            count: 4,
          },
          {
            item: "scrap",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "bomb",
            count: 1,
          },
        ],
        time: 180,
      },
    ],
  },
  {
    description:
      "A simple construction, capable of crafting basic machinery.\n\nCan reproduce.",
    marketValue: 30,
  }
);
createLinkedBlockAndItem(
  "scrap-disassembler",
  "Scrap Disassembler",
  "crafter.scrap-disassembler",
  {
    type: "uncrafter",
    title: "Scrap Disassembler",
    inventorySize: 6,
    counterpart: "scrap-assembler",
  },
  {
    description:
      "A machine capable of reversing the work of a Scrap Assembler.",
    marketValue: 60,
  }
);
createLinkedBlockAndItem(
  "scrap-smelter",
  "Scrap Smelter",
  "crafter.scrap-smelter",
  {
    type: "smelter",
    title: "Scrap Smelter",
    fuelTypes: {
      coal: 600,
    },
    inventorySize: 4,
    recipes: [
      {
        inputs: [
          {
            item: "scrap",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "plate",
            count: 1,
          },
        ],
        time: 180,
      },
      {
        inputs: [
          {
            item: "raw-copper",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "copper-ingot",
            count: 1,
          },
        ],
        time: 60,
      },
      {
        inputs: [
          {
            item: "raw-iron",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "iron-ingot",
            count: 1,
          },
        ],
        time: 90,
      },
    ],
  },
  {
    description: "Smelts and casts basic ores into ingot form.",
    marketValue: 40,
  }
);
createLinkedBlockAndItem(
  "scrap-compressor",
  "Scrap Compressor",
  "crafter.scrap-compressor",
  {
    type: "crafter",
    title: "Scrap Compressor",
    inventorySize: 4,
    recipes: [
      {
        inputs: [
          {
            item: "sand",
            count: 4,
          },
        ],
        outputs: [
          {
            item: "sandstone",
            count: 2,
          },
        ],
        time: 20,
      },
      {
        inputs: [
          {
            item: "coal",
            count: 5,
          },
          {
            item: "scrap",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "makeshift-explosive",
            count: 2,
          },
        ],
        time: 60,
      },
      {
        inputs: [
          {
            item: "sandstone",
            count: 4,
          },
        ],
        outputs: [
          {
            item: "sandstone-wall",
            count: 1,
          },
        ],
        time: 80,
      },
      {
        inputs: [
          {
            item: "stone",
            count: 4,
          },
        ],
        outputs: [
          {
            item: "stone-wall",
            count: 1,
          },
        ],
        time: 120,
      },
      {
        inputs: [
          {
            item: "scrap",
            count: 4,
          },
        ],
        outputs: [
          {
            item: "scrap-wall",
            count: 1,
          },
        ],
        time: 100,
      },
    ],
  },
  {
    description: "Compresses low-tier resources into cubes.",
    marketValue: 60,
  }
);
//Copper Tier [1]
createLinkedBlockAndItem(
  "basic-assembler",
  "Basic Assembler",
  "crafter.basic-assembler",
  {
    type: "crafter",
    title: "Basic Assembler",
    inventorySize: 6,
    recipes: [
      {
        inputs: [
          {
            item: "copper-ingot",
            count: 1
          }
        ],
        outputs: [
          {
            item: "copper-wire",
            count: 6
          }
        ],
        time: 120
      },
      {
        inputs: [
          {
            item: "copper-ingot",
            count: 1,
          },
          {
            item: "plate",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "basic-conveyor",
            count: 2,
          },
        ],
        time: 60,
      },
      {
        inputs: [
          {
            item: "copper-ingot",
            count: 3,
          },
          {
            item: "plate",
            count: 2,
          },
        ],
        outputs: [
          {
            item: "basic-unloader",
            count: 2,
          },
        ],
        time: 90,
      },
      {
        inputs: [
          {
            item: "copper-ingot",
            count: 10,
          },
          {
            item: "plate",
            count: 5,
          },
        ],
        outputs: [
          {
            item: "basic-drill",
            count: 1,
          },
        ],
        time: 200,
      },
      {
        inputs: [
          {
            item: "bomb",
            count: 1,
          },
          {
            item: "copper-wire",
            count: 3,
          },
          {
            item: "plate",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "landmine",
            count: 1,
          },
        ],
        time: 360,
      },
    ],
  },
  {
    description: "Constructs machines for use in production and defense.",
    marketValue: 140,
  }
);
//## DRILLS ##
//Scrap Tier [0]
createLinkedBlockAndItem(
  "scrap-drill",
  "Scrap Drill",
  "drill.scrap-drill.ui",
  {
    type: "drill",
    topImg: "drill.scrap-drill.top",
    spinnerImg: "drill.scrap-drill.spinner",
    baseImg: "drill.scrap-drill.base",
    results: {
      sand: "sand",
      "sand-water": "sand",
      stone: "stone",
      "coal-ore": "coal",
      "copper-ore": "raw-copper",
    },
    amount: 1,
    spinSpeed: 1,
    duration: 300,
    inventorySize: 1,
    title: "Scrap Drill",
  },
  {
    description: "Slowly collects resources from below it.",
    marketValue: 15,
  }
);
//Copper Tier [1]
createLinkedBlockAndItem(
  "basic-drill",
  "Basic Drill",
  "drill.basic-drill.ui",
  {
    type: "drill",
    topImg: "drill.basic-drill.top",
    spinnerImg: "drill.basic-drill.spinner",
    baseImg: "drill.basic-drill.base",
    results: {
      sand: "sand",
      "sand-water": "sand",
      stone: "stone",
      "coal-ore": "coal",
      "copper-ore": "raw-copper",
      "iron-ore": "raw-iron",
      "electrum-ore": "raw-electrum",
    },
    amount: 1,
    spinSpeed: 2,
    duration: 200,
    inventorySize: 1,
    title: "Basic Drill",
    tickEffect: "basic-drill-smoke",
    tickEffectChance: 0.2,
  },
  {
    description:
      "Slowly collects resources from below it.\nCan drill Iron and Electrum.",
  }
);
//## CONVEYOR ##
//Scrap Tier [0]
createLinkedBlockAndItem(
  "scrap-conveyor",
  "Scrap Conveyor",
  "conveyor.scrap-conveyor.ui",
  {
    type: "conveyor",
    moveTime: 180,
    baseImg: "base.scrap",
    beltImg: "conveyor.scrap-conveyor.belt",
  },
  {
    description:
      "A slow-moving belt.\nTransports items from one place to another.",
    marketValue: 1.5,
  }
);
createLinkedBlockAndItem(
  "scrap-unloader",
  "Scrap Unloader",
  "conveyor.scrap-unloader.ui",
  {
    type: "unloader",
    moveTime: 180,
    baseImg: "base.scrap",
    beltImg: "conveyor.scrap-unloader.belt",
  },
  {
    description:
      "A slow-moving belt.\nTransports items from one place to another.\nPulls selected items from the block behind it.",
    marketValue: 2.5,
  }
);
//Copper Tier [1]
createLinkedBlockAndItem(
  "basic-conveyor",
  "Basic Conveyor",
  "conveyor.basic-conveyor.ui",
  {
    type: "conveyor",
    moveTime: 120,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-conveyor.belt",
  },
  {
    description:
      "A slightly faster-moving belt.\nTransports items from one place to another.",
  }
);
createLinkedBlockAndItem(
  "basic-unloader",
  "Basic Unloader",
  "conveyor.basic-unloader.ui",
  {
    type: "unloader",
    moveTime: 120,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-unloader.belt",
  },
  {
    description:
      "A slightly faster-moving belt.\nTransports items from one place to another.\nPulls selected items from the block behind it.",
  }
);
//## CONTAINERS ##
createLinkedBlockAndItem(
  "scrap-storage",
  "Scrap Storage Unit",
  "base.scrap.smooth",
  {
    title: "Scrap Storage Unit",
    type: "container",
    inventorySize: 12,
  },
  {
    description: "A small box for item storage.",
    marketValue: 30,
  }
);
//## TURRETS ##
createLinkedBlockAndItem(
  "recycle",
  "Recycle",
  "base.scrap.smooth",
  {
    type: "turret",
    inventorySize: 1,
    range: 300,
    bullets: {
      types: [
        {
          lifetime: 15,
          speed: 20,
          light: 30,
          trail: true,
          hitSize: 2.5,
          trailShape: "rhombus",
          drawer: {
            shape: "rhombus",
            fill: "#cd9f8b",
            width: 10,
            height: 2.5,
            image: false,
          },
          trailColours: [[80, 62, 55, 100]],
          damage: [
            {
              type: "ballistic",
              amount: 11,
              spread: 2,
            },
          ],
        },
      ],
      ammos: {
        "scrap-bullet": 0,
      },
    },
    shoot: {
      reload: 13,
      pattern: {
        spread: 2.5,
      },
    },
    component: {
      type: "weapon-component",
      width: 32,
      height: 11,
      xOffset: 5,
      image: "turret.recycle.component",
      recoil: 4,
      recoilSpeed: 0.2,
    },
    shootX: 20,
  },
  {
    description: "A mounted scrap shooter.\nShoots slower but further.",
    marketValue: 100 //65
  }
);
//## TURRET BASES ##
createLinkedBlockAndItem(
  "scrap-turret-base",
  "Scrap Turret Base",
  "base.scrap.smooth",
  {
    type: "turret-base",
    connectorImage: "turret-base.scrap.connector",
    otherPart: "scrap-turret-controller"
  },
  {
    description: "Basic block to increase the  maximum size of turrets on  a Scrap Turret Controller.",
    marketValue: 20 // 3 plates = 15
  }
);
createLinkedBlockAndItem(
  "scrap-turret-controller",
  "Scrap Turret Controller",
  "turret-controller.scrap.base",
  {
    type: "turret-controller",
    connectorImage: "turret-base.scrap.connector",
    otherPart: "scrap-turret-base"
  },
  {
    description: "Mounting point for turrets.\nMaximum size depends on number of bases.\nPlace them in a cross-shaped pattern.",
    marketValue: 100
  }
);
createLinkedBlockAndItem(
  "peti-turret-base",
  "PETI Turret Base",
  "turret-base.peti.base",
  {
    type: "turret-base",
    connectorImage: "turret-base.peti.connector",
    otherPart: "peti-turret-controller"
  },
  {
    description: "Block to increase the  maximum size of turrets on  a PETI Turret Controller.",
    marketValue: 200 // 3 plates = 15
  }
);
createLinkedBlockAndItem(
  "peti-turret-controller",
  "PETI Turret Controller",
  "turret-controller.peti.base",
  {
    type: "turret-controller",
    connectorImage: "turret-base.peti.connector",
    otherPart: "peti-turret-base",
    maxSize: 6,
  },
  {
    description: "Mounting point for PETI turrets.\nMaximum size depends on number of bases.\nPlace them in a cross-shaped pattern.",
    marketValue: 1000
  }
);
//## PLASMA ##
createLinkedBlockAndItem(
  "plasma-generator",
  "Plasma Generator",
  "base.tungsten",
  {
    type: "plasma-generator",
  },
  {
    description:
      "Pressurises and superheats gas in the atmosphere into plasma.",
    rarity: Item.rarity.PETI,
    marketValue: 5200,
  }
);
createLinkedBlockAndItem(
  "plasma-tank",
  "Plasma Tank",
  "tank.plasma-tank.base",
  {
    type: "plasma-tank",
    capacity: 512,
    plasma: "tank.plasma-tank.plasma",
  },
  {
    description: "Stores plasma for later use.",
    rarity: Item.rarity.PETI,
    marketValue: 3250,
  }
);
createLinkedBlockAndItem(
  "plasma-pipeline",
  "Plasma Pipeline",
  "ppipe.plasma-pipeline.ui",
  {
    type: "plasma-pipe",
    baseImage: "ppipe.plasma-pipeline.base",
    basePlasma: "ppipe.plasma-pipeline.base-plasma",
    inputImage: "ppipe.plasma-pipeline.input",
    inputPlasma: "ppipe.plasma-pipeline.input-plasma",
    outputImage: "ppipe.plasma-pipeline.output",
    outputPlasma: "ppipe.plasma-pipeline.output-plasma",
  },
  {
    description:
      "A pressurised pipe for moving high-temperature ionised gas, known as plasma.",
    rarity: Item.rarity.PETI,
    marketValue: 500,
  }
);
createLinkedBlockAndItem(
  "plasma-compressor",
  "Plasma Compressor",
  "ppipe.plasma-compressor.ui",
  {
    type: "plasma-compressor",
    baseImage: "ppipe.plasma-compressor.base",
    basePlasma: "ppipe.plasma-compressor.base-plasma",
    inputImage: "ppipe.plasma-compressor.input",
    inputPlasma: "ppipe.plasma-compressor.input-plasma",
    outputImage: "ppipe.plasma-compressor.output",
    outputPlasma: "ppipe.plasma-compressor.output-plasma",
    spinnerImage: "ppipe.plasma-compressor.spinner",
    capacity: 32,
  },
  {
    description:
      "A specialised pipe for increasing the pressure of plasma, allowing more to fit through the same pipes.\n2 pipes in , 1 pipe out.\n\nCan't compress plasma above 12 bar.",
    rarity: Item.rarity.PETI,
    marketValue: 1500,
  }
);
createLinkedBlockAndItem(
  "plasma-decompressor",
  "Plasma Decompressor",
  "ppipe.plasma-compressor.ui",
  {
    type: "plasma-decompressor",
    image: "tank.plasma-tank.base",
    plasma: "tank.plasma-tank.plasma",
    spinnerImage: "ppipe.plasma-compressor.spinner",
    capacity: 16,
  },
  {
    description:
      "A specialised pipe for decreasing the pressure of plasma, allowing other blocks to use it.\n1 pipe in , 2 pipes out.\n\nCan't decompress plasma below 1 bar.",
    rarity: Item.rarity.PETI,
    marketValue: 1500,
  }
);
//## DECO ##
createLinkedBlockAndItem(
  "message",
  "Message Unit",
  "block.message",
  {
    type: "sign",
  },
  {
    description: "A small digital storage device for holding messages.",
  }
);
//## TONK ##
createLinkedBlockAndItem(
  "tank-assembly-bay",
  "Tank Assembly Bay",
  "block.message",
  {
    type: "tank-assembler",
    range: 1,
  },
  {
    description:
      "Assembles a tank out of blocks.\nContainers add inventory space, Conveyors add speed, and Weapons in containers are mounted on the tank.",
    rarity: Item.rarity.SPECIAL,
  }
);
//## CAPITALISM ##
createLinkedBlockAndItem(
  "launch-pad",
  "Launch Pad",
  "capitalism.iti.launch",
  {
    type: "launch-pad",
    podImage: "capitalism.iti.pod"
  },
  {
    description:
      "Launches batches of items to space, ready to be collected by ITI.",
    rarity: Item.rarity.SPECIAL,
  }
);
createLinkedBlockAndItem(
  "landing-pad",
  "Landing Pad",
  "capitalism.iti.land",
  {
    type: "landing-pad",
    podImage: "capitalism.iti.pod"
  },
  {
    description:
      "Buys items from ITI, and receives them.\nMust be given an item to use for reference.",
    rarity: Item.rarity.SPECIAL,
  }
);
//## DEV ##
createLinkedBlockAndItem(
  "dev::structurereader",
  "Structure Reader",
  "block.dev.structurereader",
  {
    title: "Structure Reader",
    type: "dev::structurereader",
    health: 1000000,
  },
  {
    description:
      "Outputs a structure array into the console.\nDEVELOPMENT ITEM",
  }
);
createLinkedBlockAndItem(
  "dev::itemcatalog",
  "Item Catalog",
  "block.dev.itemcatalog",
  {
    title: "Item Catalog",
    type: "dev::itemcatalog",
    health: 1000000,
  },
  {
    description:
      "Contains an infinite supply of every registered item.\nAlso has a trash slot.\nDEVELOPMENT ITEM",
  }
);
createLinkedBlockAndItem(
  "dev::commandblock",
  "Command Block",
  "block.dev.commandblock",
  {
    type: "dev::commandblock",
    health: 1000000,
  },
  {
    description: "Executes a pre-set command on activation.\nDEVELOPMENT ITEM",
  }
);
createLinkedBlockAndItem(
  "dev::commandblock.chain",
  "Chained Command Block",
  "block.dev.commandblock.chain",
  {
    type: "dev::commandblock",
    health: 1000000,
    chaining: true,
    rotatable: true,
  },
  {
    description:
      "Executes a pre-set command on activation.\nCan be pointed into another command block to chain.\nDEVELOPMENT ITEM",
  }
);
createLinkedBlockAndItem(
  "dev::commandblock.loop",
  "Looping Command Block",
  "block.dev.commandblock.loop",
  {
    type: "dev::commandblock",
    health: 1000000,
    loops: true,
  },
  {
    description:
      "Executes a pre-set command continuously on activation.\nActivation while running will stop execution.\nDEVELOPMENT ITEM",
  }
);
//## TEST ##
Registries.blocks.add("test-provider", {
  name: "Test Provider",
  maxPower: 1000,
  power: 1000,
  isProvider: true,
});
Registries.blocks.add("test-subscriber", {
  name: "Test Subscriber",
  maxPower: 1000,
  powerDraw: 10,
});
