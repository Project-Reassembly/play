//## TILES ##
Registry.blocks.add("grass", {
  type: "tile",
  image: "tile.grass"
})
Registry.blocks.add("stone", {
  type: "tile",
  image: "tile.stone"
})
Registry.blocks.add("water", {
  type: "tile",
  image: "tile.water",
  speedMultiplier: 0.6
})
Registry.blocks.add("sand-water", {
  type: "tile",
  image: "tile.sand-water",
  speedMultiplier: 0.8
})
Registry.blocks.add("sand", {
  type: "tile",
  image: "tile.sand"
})
//## DEFENSE ##
Registry.blocks.add("stone-wall", {
  image: "block.stone-wall",
  dropItem: "stone-wall",
  health: 100
})
Registry.blocks.add("sandstone-wall", {
  image: "block.sandstone-wall",
  dropItem: "sandstone-wall",
  health: 45
})
Registry.blocks.add("scrap-wall", {
  image: "block.scrap-wall",
  dropItem: "scrap-wall",
  health: 100
})
//## CRAFTERS ##
Registry.blocks.add("scrap-assembler", {
  type: "crafter",
  dropItem: "scrap-assembler",
  image: "crafter.scrap-assembler",
  recipes: [
    {
      input: {
        item: "sand",
        count: 4
      },
      output: {
        item: "sandstone",
        count: 2
      }
    },
    {
      input: {
        item: "sandstone",
        count: 4
      },
      output: {
        item: "sandstone-wall",
        count: 1
      }
    },
    {
      input: {
        item: "stone",
        count: 4
      },
      output: {
        item: "stone-wall",
        count: 1
      }
    },
    {
      input: {
        item: "scrap",
        count: 4
      },
      output: {
        item: "scrap-wall",
        count: 1
      }
    }
  ]
})