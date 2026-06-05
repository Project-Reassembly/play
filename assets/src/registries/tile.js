import { Registries } from "../core/registry.js";

Registries.tiles.add("grass", { image: "tile.grass", name: "Grass Floor" });
Registries.tiles.add("stone", { image: "tile.stone", drillSpeed: 0.5, name: "Stone Floor" });
Registries.tiles.add("water", {
  image: "tile.water",
  speedMultiplier: 0.6,
  buildable: false,
  name: "Water",
});
Registries.tiles.add("deep-water", {
  image: "tile.deep-water",
  speedMultiplier: 0.4,
  buildable: false,
  name: "Deep Water",
});
Registries.tiles.add("sand-water", {
  image: "tile.sand-water",
  speedMultiplier: 0.8,
  drillSpeed: 0.8,
  name: "Sandy Water",
});
Registries.tiles.add("sand-grass", { image: "tile.sand-grass", name: "Sandy Grass" });
Registries.tiles.add("sand", { image: "tile.sand", name: "Sand Floor" });
//## FLOORS ##
//Ores
Registries.tiles.add("copper-ore", {
  image: "ore.copper",
  stages: ["", ".exposed", ".weathered", ".oxidised"],
  drillSpeed: 0.75,
  name: "Copper Ore",
});
Registries.tiles.add("coal-ore", { image: "ore.coal", drillSpeed: 1, name: "Coal Deposit" });
Registries.tiles.add("iron-ore", { image: "ore.iron", drillSpeed: 0.65, name: "Iron Ore" });
Registries.tiles.add("electrum-ore", {
  image: "ore.electrum",
  drillSpeed: 0.45,
  name: "Electrum Deposit",
});
