import { Registries } from "../core/registry.js";
Registries.worldgen.add("base-generator", {
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
Registries.worldgen.add("ore-generator", {
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
Registries.worldgen.add("ruins-generator", {
  type: "block-generator",
  name: "Scrap Ruins",
  stageTitle: "Destroying Buildings...",
  separation: 30,
  variants: [
    {
      weight: 1,
      defs: [
        {
          x: -1,
          y: -1,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: -1,
          y: 0,
          block: "scrap-conveyor",
          direction: 2,
        },
        {
          x: -1,
          y: 1,
          block: "scrap-drill",
          direction: 1,
        },
        {
          x: 0,
          y: 0,
          block: "scrap-assembler",
        },
        {
          x: 0,
          y: 1,
          block: "scrap-conveyor",
          direction: 3,
        },
        {
          x: 0,
          y: 2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 1,
          y: -2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 1,
          y: 0,
          block: "scrap-conveyor",
          direction: 2,
        },
        {
          x: 1,
          y: 2,
          block: "scrap-conveyor",
          direction: 0,
        },
        {
          x: 2,
          y: -2,
          block: "scrap-drill",
          direction: 0,
        },
        {
          x: 2,
          y: -1,
          block: "scrap-conveyor",
          direction: 1,
        },
        {
          x: 2,
          y: 1,
          block: "scrap-wall",
          direction: 0,
        },
      ],
    },
    {
      weight: 1,
      name: "Square",
      defs: [
        {
          x: -2,
          y: -2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: -2,
          y: 1,
          block: "scrap-conveyor",
          direction: 0,
        },
        {
          x: -2,
          y: 2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: -1,
          y: -1,
          block: "scrap-drill",
          direction: 0,
        },
        {
          x: 0,
          y: 0,
          block: "scrap-drill",
        },
        {
          x: 0,
          y: 1,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 0,
          y: 2,
          block: "scrap-conveyor",
          direction: 0,
        },
        {
          x: 1,
          y: -2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 1,
          y: 0,
          block: "scrap-conveyor",
          direction: 0,
        },
        {
          x: 2,
          y: -2,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 2,
          y: 0,
          block: "scrap-wall",
          direction: 0,
        },
        {
          x: 2,
          y: 2,
          block: "scrap-wall",
          direction: 0,
        },
      ],
    },
  ],
});
