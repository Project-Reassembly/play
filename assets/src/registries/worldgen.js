Registry.worldgen.add("base-generator", {
  type: "tile-generator",
  noiseScale: 1,
  noiseLevel: 255,
  stageTitle: "Generating Tiles...",
  tiles: [
    {
      min: 175,
      tile: "stone",
    },
    {
      min: 100,
      tile: "grass",
    },
    {
      min: 98,
      tile: "sand-grass",
    },
    {
      min: 75,
      tile: "sand",
    },
    {
      min: 65,
      tile: "sand-water",
    },
    {
      min: 50,
      tile: "water",
    },
    {
      tile: "deep-water",
    },
  ],
});
Registry.worldgen.add("ore-generator", {
  type: "ore-generator",
  stageTitle: "Exposing Resources...",
  ores: [
    {
      threshold: 70,
      scale: 4,
      tile: "copper-ore",
    },
    {
      threshold: 60,
      scale: 5,
      tile: "iron-ore",
      target: "stone",
    },
    {
      threshold: 65,
      scale: 3,
      tile: "electrum-ore",
      target: "stone",
    },
  ],
});
Registry.worldgen.add("ruins-generator", {
  type: "block-generator",
  name: "Scrap Ruins",
  stageTitle: "Destroying Buildings...",
  separation: 20,
  defs: [
    {
      x: 0,
      y: 0,
      block: "scrap-wall",
    },
  ],
});
