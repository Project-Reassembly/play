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
