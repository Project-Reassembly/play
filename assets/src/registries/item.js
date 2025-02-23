Registry.items.add("nothing", {})
Registry.items.add("scrap", {
  name: "Scrap Metal",
  description: "A small piece of scrap,\nrecovered from remains\nof destroyed machines.",
  image: "item.scrap"
})
Registry.items.add("wire", {
  name: "Copper Wire",
  description: "Basic wire,\nused for\ncircuitry and\nlow power\ntransmission.",
  image: "item.wire"
})
Registry.items.add("stone", {
  name: "Stone",
  description: "A piece of rock.\nUsed in primitive construction.",
  image: "item.stone"
})
Registry.items.add("sand", {
  name: "Sand",
  description: "A ball of sand.",
  image: "item.sand"
})
Registry.items.add("sandstone", {
  name: "Sandstone",
  description: "A ball of sand,\ncompressed into\na hard ball.",
  image: "item.sandstone"
})
//Walls
Registry.items.add("stone-wall", {
  type: "placeable",
  name: "Stone Wall",
  description: "A block of solid\nstone.\nCould be used\nas defense.",
  block: "stone-wall",
  image: "block.stone-wall"
})
Registry.items.add("sandstone-wall", {
  type: "placeable",
  name: "Sandstone Wall",
  description: "A block of sandstone.\nCould be used as defense.",
  block: "stone-wall",
  image: "block.sandstone-wall"
})
Registry.items.add("scrap-wall", {
  type: "placeable",
  name: "Stone Wall",
  description: "A block of electrical\nscrap. Could be used\nas defense.",
  block: "scrap-wall",
  image: "block.scrap-wall"
})
//crafters
Registry.items.add("scrap-assembler", {
  type: "placeable",
  name: "Scrap Assembler",
  description: "A crude construction,\ncapable of crafting\none item into another.",
  block: "scrap-assembler",
  image: "crafter.scrap-assembler"
})