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
    description: "A solid iron cube.\nSomehow doesn't rust.\n\nCould be used as defense.",
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
    description: "An extremely dense cube of tungsten.\nGood thing you're a robot.\n\nCould be used as defense.",
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
            item: "copper-ingot",
            count: 1,
          },
        ],
        outputs: [
          {
            item: "wire",
            count: 6,
          },
        ],
        time: 240,
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
            item: "scrap-assembler",
            count: 1,
          },
          {
            item: "scrap",
            count: 5,
          },
        ],
        outputs: [
          {
            item: "scrap-disassembler",
            count: 1,
          },
        ],
        time: 400,
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
    description:
      "Compresses low-tier resources into cubes.",
  }
);
//## DRILLS ##
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
      "copper-ore": "raw-copper"
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
//## CONVEYOR ##
createLinkedBlockAndItem(
  "scrap-conveyor",
  "Scrap Conveyor",
  "conveyor.scrap-conveyor.ui",
  {
    title: "Scrap Conveyor",
    type: "conveyor",
    moveTime: 100,
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
    title: "Scrap Unloader",
    type: "unloader",
    moveTime: 100,
    baseImg: "base.scrap",
    beltImg: "conveyor.scrap-unloader.belt",
  },
  {
    description:
      "A slow-moving belt.\nTransports items from one place to another.\nPulls selected items from the block behind it.",
  }
);
//## CONTAINERS ##
createLinkedBlockAndItem(
  "scrap-storage",
  "Scrap Storage",
  "block.scrap-wall",
  {
    title: "Scrap Storage",
    type: "container",
    inventorySize: 12,
  },
  {
    description: "A small box for item storage.",
  }
);
