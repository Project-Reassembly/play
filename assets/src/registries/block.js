//## TILES ##
Registry.blocks.add("grass", {
  type: "tile",
  image: "tile.grass",
});
Registry.blocks.add("stone", {
  type: "tile",
  image: "tile.stone",
});
Registry.blocks.add("water", {
  type: "tile",
  image: "tile.water",
  speedMultiplier: 0.6,
  buildable: false
});
Registry.blocks.add("sand-water", {
  type: "tile",
  image: "tile.sand-water",
  speedMultiplier: 0.8,
});
Registry.blocks.add("sand", {
  type: "tile",
  image: "tile.sand",
});
//## DEFENSE ##
createLinkedBlockAndItem(
  "stone-wall",
  "Stone Wall",
  "block.stone-wall",
  {
    health: 100,
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
    health: 45,
  },
  {
    description: "A block of sandstone.\nCould be used as defense.",
  }
);
createLinkedBlockAndItem(
  "scrap-wall",
  "Scrap Wall",
  "block.scrap-wall",
  {
    health: 100,
  },
  {
    description: "A block of electrical\nscrap. Could be used\nas defense.",
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
    ],
  },
  {
    description:
      "A crude construction,\ncapable of crafting\nsimple blocks and items.",
  }
);
//## DRILLS ##
createLinkedBlockAndItem(
  "scrap-drill",
  "Scrap Drill",
  "drill.1x1.ui",
  {
    type: "drill",
    topImg: "drill.1x1.top",
    spinnerImg: "drill.1x1.spinner",
    baseImg: "drill.1x1.base",
    results: {
      sand: "sand",
      "sand-water": "sand",
      stone: "stone",
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
