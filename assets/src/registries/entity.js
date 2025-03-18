Registry.entities.add("player", {
  type: "player",
  x: (World.size * Chunk.size * Block.size) / 2,
  y: (World.size * Chunk.size * Block.size) / 2,
  name: "Player",
  health: 100,
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
  team: "player",
  width: 25,
  height: 25,
  speed: 3,
});
Registry.entities.add("scavenger", {
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
  width: 32,
  height: 32,
  aiType: "scavenger",
  followRange: 250,
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
  inventory: [
    {
      item: "scrap-bullet",
      min: 100,
      max: 250,
      dropChance: 0.5,
    },
    {
      item: "scrap",
      min: 10,
      max: 25,
      dropChance: 0.6,
    },
  ],
});
Registry.entities.add("scrap-sentinel", {
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
  width: 40,
  height: 40,
  aiType: "guard",
  followRange: 200,
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
  inventory: [
    {
      item: "scrap-bullet",
      min: 200,
      max: 500,
      dropChance: 0.5,
    },
    {
      item: "scrap",
      min: 20,
      max: 50,
      dropChance: 0.6,
    },
  ],
});
