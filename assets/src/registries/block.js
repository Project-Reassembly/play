//## TILES ##
Registry.blocks.add("grass", {
  type: "tile",
  image: "tile.grass",
});
Registry.blocks.add("stone", {
  type: "tile",
  image: "tile.stone",
  drillSpeed: 0.5,
});
Registry.blocks.add("water", {
  type: "tile",
  image: "tile.water",
  speedMultiplier: 0.6,
  buildable: false,
});
Registry.blocks.add("sand-water", {
  type: "tile",
  image: "tile.sand-water",
  speedMultiplier: 0.8,
  drillSpeed: 0.8,
});
Registry.blocks.add("sand-grass", {
  type: "tile",
  image: "tile.sand-grass",
});
Registry.blocks.add("sand", {
  type: "tile",
  image: "tile.sand",
});
//## FLOORS ##
//Ores
Registry.blocks.add("copper-ore", {
  type: "ore",
  image: "ore.copper",
  stages: ["", ".exposed", ".weathered", ".oxidised"],
  drillSpeed: 0.75,
});
Registry.blocks.add("iron-ore", {
  type: "ore",
  image: "ore.iron",
  drillSpeed: 0.65,
});
Registry.blocks.add("electrum-ore", {
  type: "ore",
  image: "ore.electrum",
  drillSpeed: 0.45,
});
//### BLOCKS ###
//## DEFENSE ##
createLinkedBlockAndItem(
  "stone-wall",
  "Stone Wall",
  "block.stone-wall",
  {
    health: 150,
  },
  {
    description: "A block of solid stone.\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "sandstone-wall",
  "Sandstone Wall",
  "block.sandstone-wall",
  {
    health: 90,
  },
  {
    description: "A block of sandstone.\n\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "scrap-wall",
  "Scrap Wall",
  "base.scrap",
  {
    health: 300,
  },
  {
    description: "A block of electrical scrap.\n\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "copper-wall",
  "Copper Wall",
  "base.copper",
  {
    health: 400,
  },
  {
    description: "A solid copper cube.\n\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "iron-wall",
  "Iron Wall",
  "base.iron",
  {
    health: 600,
  },
  {
    description:
      "A solid iron cube.\nSomehow doesn't rust.\n\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "tungsten-wall",
  "Tungsten Wall",
  "base.tungsten",
  {
    health: 1500,
  },
  {
    description:
      "An extremely dense cube of tungsten.\nGood thing you're a robot.\n\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "titanium-wall",
  "Titanium Wall",
  "base.titanium",
  {
    health: 2000,
  },
  {
    description: "A cube of titanium.\n\nCould be used as defense.",
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
    ],
  },
  {
    description:
      "A simple construction,\ncapable of crafting\nbasic machinery.\n\nCan reproduce.",
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
      "A machine capable of reversing\nthe work of a Scrap Assembler.",
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
    ],
  },
  {
    description: "Constructs machines for use in production and defense.",
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
