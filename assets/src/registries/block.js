import { createLinkedBlockAndItem } from "../classes/block/block.js";
import { Item } from "../classes/item/item.js";
//## DEFENSE ##
createLinkedBlockAndItem(
  "sandstone-wall",
  "Sandstone Wall",
  "block.sandstone-wall",
  { type: "wall", health: 90 },
  { description: "A block of sandstone.\n\nCould be used as defense.", marketValue: 1 },
);
createLinkedBlockAndItem(
  "stone-wall",
  "Stone Wall",
  "block.stone-wall",
  { type: "wall", health: 150 },
  { description: "A block of solid stone.\nCould be used as defense.", marketValue: 2.5 },
);
createLinkedBlockAndItem(
  "coal-wall",
  "Coal Wall",
  "block.coal-wall",
  { type: "wall", health: 120, explosiveness: 0.6 },
  {
    description:
      "A block of coal.\nCould be used as defense, though this may not be the best idea.",
    marketValue: 3.3,
  },
);
createLinkedBlockAndItem(
  "scrap-wall",
  "Scrap Wall",
  "base.scrap",
  { type: "wall", health: 300 },
  { description: "A block of electrical scrap.\n\nCould be used as defense.", marketValue: 5 },
);
createLinkedBlockAndItem(
  "copper-wall",
  "Copper Wall",
  "base.copper",
  { type: "wall", health: 400 },
  {
    description: "A solid copper cube.\n\nCould be used as defense.",
    marketValue: 15,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "iron-wall",
  "Iron Wall",
  "base.iron",
  { type: "wall", health: 600 },
  {
    description: "A solid iron cube.\nSomehow doesn't rust.\n\nCould be used as defense.",
    marketValue: 52,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "tungsten-wall",
  "Tungsten Wall",
  "base.tungsten",
  { type: "wall", health: 1500, armour: 25 },
  {
    description:
      "An extremely dense cube of tungsten.\nGood thing you're a robot.\n\nCould be used as defense.",
    marketValue: 625,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "titanium-wall",
  "Titanium Wall",
  "base.titanium",
  { type: "wall", health: 2000, armour: 5 },
  {
    description: "A cube of titanium.\n\nCould be used as defense.",
    marketValue: 900,
    hidden: true,
  },
);
//## OFFENSIVE ##
createLinkedBlockAndItem(
  "bomb",
  "Bomb",
  "bomb.basic",
  { type: "bomb", health: 50, fuseEffect: "burning" },
  {
    description: "Explodes violently when any enemy gets near.\nCan also be manually triggered.",
    marketValue: 15,
  },
);
createLinkedBlockAndItem(
  "landmine",
  "Landmine",
  "bomb.landmine",
  {
    type: "bomb",
    health: 50,
    hiddenImg: "bomb.landmine.hidden",
    walkable: true,
    autoDetonationRange: 20,
    detonationDelay: 35,
  },
  {
    image: "bomb.landmine.item",
    description:
      "Explodes violently when any enemy gets near.\n(Mostly) hidden from enemy teams, and can be walked over.\nExplodes faster than normal bombs.\nDoes not indicate its fuse.",
    marketValue: 25,
  },
);
createLinkedBlockAndItem(
  "mini-nuke",
  "Mini Nuke",
  "bomb.basic",
  {
    type: "nuclear-bomb",
    health: 50,
    explosion: { radius: 180, amount: 15000 },
    fuseEffect: {
      type: "particle-emission",
      amount: 2,
      particle: {
        shape: "rhombus",
        lifetime: 30,
        speed: 0.7,
        decel: 0.05,
        widthFrom: 5,
        widthTo: 10,
        heightFrom: 5,
        heightTo: 10,
        colours: [
          [255, 255, 255],
          [255, 255, 0],
          [0, 255, 0],
        ],
        rotateSpeed: 0.2,
        light: 50,
      },
    },
    detonationDelay: 120,
    autoDetonationRange: 400,
    triggerEffect: {
      type: "wave-emission",
      particle: {
        lifetime: 120,
        radiusFrom: 35,
        radiusTo: 35,
        colours: [
          [0, 255, 0, 100],
          [255, 255, 0, 100],
          [255, 0, 0, 100],
        ],
        light: 50,
        strokeFrom: 10,
        strokeTo: 10,
      },
    },
    accelerable: false,
  },
  {
    description:
      "A Bomb powered by a runaway chain reaction of decaying Uranium.\n#5iPreview Content",
    hidden: true,
    rarity: Item.rarity.BLUE,
    marketValue: 2500,
  },
);
createLinkedBlockAndItem(
  "nuke",
  "Nuclear Bomb",
  "bomb.basic",
  {
    type: "nuclear-bomb",
    health: 50,
    explosion: { radius: 400, amount: 100000 },
    fuseEffect: "plasma-burn",
    detonationDelay: 180,
    autoDetonationRange: 300,
    triggerEffect: "laser-caster-fire",
    impactFrame: "nuke-impact",
    accelerable: false,
  },
  {
    description: "#4-Now I am become Death, destroyer of worlds.\n#5iPreview Content",
    hidden: true,
    rarity: Item.rarity.RARE,
    marketValue: 25000,
  },
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
    inventorySize: 4,
    resultSize: 3,
    recipes: [
      {
        inputs: [{ item: "scrap", count: 1 }],
        outputs: [{ item: "scrap-bullet", count: 100 }],
        time: 300,
      },
      {
        inputs: [
          { item: "makeshift-explosive", count: 4 },
          { item: "scrap", count: 1 },
          { item: "coal", count: 5 },
        ],
        outputs: [{ item: "scrap-rocket", count: 10 }],
        time: 300,
      },
      {
        inputs: [
          { item: "scrap", count: 10 },
          { item: "plate", count: 4 },
        ],
        outputs: [{ item: "scrap-shooter", count: 1 }],
        time: 600,
      },
      {
        inputs: [
          { item: "scrap-shooter", count: 1 },
          { item: "plate", count: 2 },
          { item: "scrap", count: 2 },
        ],
        outputs: [{ item: "recycle-mounted", count: 1 }],
        time: 120,
      },
      {
        inputs: [
          { item: "recycle-mounted", count: 1 },
          { item: "scrap-turret-base", count: 1 },
        ],
        outputs: [{ item: "recycle", count: 1 }],
        time: 1200,
      },
      {
        inputs: [
          { item: "scrap", count: 25 },
          { item: "plate", count: 15 },
        ],
        outputs: [{ item: "scrap-cannon", count: 1 }],
        time: 900,
      },
      {
        inputs: [
          { item: "scrap", count: 25 },
          { item: "plate", count: 15 },
        ],
        outputs: [{ item: "scrap-launcher", count: 1 }],
        time: 900,
      },
      {
        inputs: [{ item: "plate", count: 3 }],
        outputs: [{ item: "scrap-turret-base", count: 1 }],
        time: 120,
      },
      {
        inputs: [
          { item: "scrap-turret-base", count: 1 },
          { item: "scrap", count: 20 },
          { item: "copper-wire", count: 30 },
        ],
        outputs: [{ item: "scrap-turret-controller", count: 1 }],
        time: 120,
      },
      {
        inputs: [
          { item: "scrap", count: 200 },
          { item: "plate", count: 100 },
        ],
        outputs: [{ item: "scrap-artillery", count: 1 }],
        time: 3000,
      },
      {
        inputs: [{ item: "scrap", count: 4 }],
        outputs: [{ item: "scrap-pylon", count: 1 }],
        time: 60,
      },
      {
        inputs: [
          { item: "scrap", count: 2 },
          { item: "plate", count: 2 },
        ],
        outputs: [{ item: "scrap-player-charger", count: 1 }],
        time: 60,
      },
      {
        inputs: [{ item: "scrap", count: 30 }],
        outputs: [{ item: "scrap-burner", count: 1 }],
        time: 360,
      },
      {
        inputs: [{ item: "scrap", count: 1 }],
        outputs: [{ item: "scrap-conveyor", count: 1 }],
        time: 60,
      },
      {
        inputs: [{ item: "scrap", count: 2 }],
        outputs: [{ item: "scrap-unloader", count: 1 }],
        time: 90,
      },
      {
        inputs: [{ item: "scrap", count: 20 }],
        outputs: [{ item: "scrap-storage", count: 1 }],
        time: 100,
      },
      {
        inputs: [{ item: "scrap", count: 10 }],
        outputs: [{ item: "scrap-drill", count: 1 }],
        time: 200,
      },
      {
        inputs: [{ item: "scrap", count: 25 }],
        outputs: [{ item: "scrap-assembler", count: 1 }],
        time: 400,
      },
      {
        inputs: [{ item: "scrap", count: 40 }],
        outputs: [{ item: "scrap-compressor", count: 1 }],
        time: 400,
      },
      {
        inputs: [{ item: "scrap", count: 30 }],
        outputs: [{ item: "scrap-smelter", count: 1 }],
        time: 400,
      },
      {
        inputs: [
          { item: "scrap-assembler", count: 1 },
          { item: "plate", count: 5 },
        ],
        outputs: [{ item: "scrap-disassembler", count: 1 }],
        time: 600,
      },
      {
        inputs: [
          { item: "makeshift-explosive", count: 4 },
          { item: "scrap", count: 1 },
        ],
        outputs: [{ item: "bomb", count: 1 }],
        time: 180,
      },
      {
        inputs: [
          { item: "copper-ingot", count: 25 },
          { item: "plate", count: 10 },
        ],
        outputs: [{ item: "basic-assembler", count: 1 }],
        time: 1080,
      },
    ],
    powerDraw: 3.3333333334,
    maxPower: 10000,
  },
  {
    description:
      "A simple construction, capable of crafting basic machinery, weapons and ammunition.\n\nCan reproduce.",
    marketValue: 30,
  },
);
createLinkedBlockAndItem(
  "scrap-disassembler",
  "Scrap Disassembler",
  "crafter.scrap-disassembler",
  {
    type: "uncrafter",
    title: "Scrap Disassembler",
    inventorySize: 3,
    resultSize: 4,
    counterpart: "scrap-assembler",
  },
  { description: "A machine capable of reversing the work of a Scrap Assembler.", marketValue: 60 },
);
createLinkedBlockAndItem(
  "scrap-smelter",
  "Scrap Smelter",
  "crafter.scrap-smelter",
  {
    type: "smelter",
    title: "Scrap Smelter",
    fuelTypes: { coal: 600 },
    inventorySize: 4,
    recipes: [
      { inputs: [{ item: "scrap", count: 2 }], outputs: [{ item: "plate", count: 1 }], time: 180 },
      {
        inputs: [{ item: "raw-copper", count: 2 }],
        outputs: [{ item: "copper-ingot", count: 1 }],
        time: 60,
      },
    ],
  },
  { description: "Smelts and casts basic ores into ingot form.", marketValue: 40 },
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
        inputs: [{ item: "sand", count: 4 }],
        outputs: [{ item: "sandstone", count: 2 }],
        time: 20,
      },
      {
        inputs: [{ item: "sandstone", count: 4 }],
        outputs: [{ item: "sandstone-wall", count: 1 }],
        time: 80,
      },
      {
        inputs: [{ item: "coal", count: 4 }],
        outputs: [{ item: "coal-wall", count: 1 }],
        time: 100,
      },
      {
        inputs: [{ item: "stone", count: 4 }],
        outputs: [{ item: "stone-wall", count: 1 }],
        time: 120,
      },
      {
        inputs: [{ item: "scrap", count: 4 }],
        outputs: [{ item: "scrap-wall", count: 1 }],
        time: 100,
      },
      {
        inputs: [
          { item: "coal", count: 5 },
          { item: "scrap", count: 2 },
        ],
        outputs: [{ item: "makeshift-explosive", count: 2 }],
        time: 60,
      },
    ],
    powerDraw: 8.3333333334,
    maxPower: 10000,
  },
  { description: "Compresses low-tier resources into cubes.", marketValue: 60 },
);
//Copper Tier [1]
createLinkedBlockAndItem(
  "basic-assembler",
  "Basic Assembler",
  "crafter.basic-assembler",
  {
    type: "crafter",
    powerDraw: 4.1666666667,
    maxPower: 10000,
    title: "Basic Assembler",
    inventorySize: 6,
    health: 150,
    tickEffect: "basic-crafter-smoke",
    recipes: [
      {
        inputs: [{ item: "copper-ingot", count: 1 }],
        outputs: [{ item: "copper-wire", count: 6 }],
        time: 120,
      },
      {
        inputs: [
          { item: "copper-wire", count: 12 },
          { item: "plate", count: 1 },
        ],
        outputs: [{ item: "basic-pylon", count: 1 }],
        time: 60,
      },
      {
        inputs: [
          { item: "plate", count: 5 },
          { item: "copper-ingot", count: 10 },
          { item: "copper-wire", count: 36 },
        ],
        outputs: [{ item: "basic-battery", count: 1 }],
        time: 180,
      },
      {
        inputs: [
          { item: "copper-ingot", count: 1 },
          { item: "plate", count: 1 },
        ],
        outputs: [{ item: "basic-conveyor", count: 2 }],
        time: 60,
      },
      {
        inputs: [
          { item: "copper-ingot", count: 3 },
          { item: "plate", count: 2 },
        ],
        outputs: [{ item: "basic-unloader", count: 2 }],
        time: 90,
      },
      {
        inputs: [
          { item: "copper-wire", count: 3 },
          { item: "copper-ingot", count: 1 },
          { item: "plate", count: 1 },
        ],
        outputs: [{ item: "basic-level-loader", count: 1 }],
        time: 90,
      },
      {
        inputs: [
          { item: "copper-wire", count: 3 },
          { item: "copper-ingot", count: 3 },
          { item: "plate", count: 2 },
        ],
        outputs: [{ item: "basic-level-unloader", count: 1 }],
        time: 90,
      },
      {
        inputs: [
          { item: "copper-ingot", count: 10 },
          { item: "plate", count: 5 },
        ],
        outputs: [{ item: "basic-drill", count: 1 }],
        time: 200,
      },
      {
        inputs: [
          { item: "copper-ingot", count: 40 },
          { item: "plate", count: 15 },
        ],
        outputs: [{ item: "basic-smelter", count: 1 }],
        time: 900,
      },
      {
        inputs: [
          { item: "bomb", count: 1 },
          { item: "copper-wire", count: 3 },
          { item: "plate", count: 1 },
        ],
        outputs: [{ item: "landmine", count: 1 }],
        time: 360,
      },
      {
        inputs: [
          { item: "plate", count: 4 },
          { item: "copper-ingot", count: 2 },
          { item: "copper-wire", count: 12 },
        ],
        outputs: [{ item: "blast-knuckles", count: 1 }],
        time: 600,
      },
    ],
  },
  {
    description:
      "Constructs stable machines for use in production and defense.\nMade in the #>>crafter.scrap-assembler#=-Scrap Assembler#--.",
    marketValue: 140,
  },
);
createLinkedBlockAndItem(
  "Basic-smelter",
  "Basic Smelter",
  "crafter.basic-smelter",
  {
    type: "smelter",
    title: "Basic Smelter",
    fuelTypes: { coal: 480 },
    inventorySize: 4,
    tickEffect: "basic-crafter-smoke",
    recipes: [
      { inputs: [{ item: "scrap", count: 2 }], outputs: [{ item: "plate", count: 1 }], time: 150 },
      {
        inputs: [{ item: "raw-copper", count: 2 }],
        outputs: [{ item: "copper-ingot", count: 1 }],
        time: 45,
      },
      {
        inputs: [{ item: "raw-iron", count: 2 }],
        outputs: [{ item: "iron-ingot", count: 1 }],
        time: 75,
      },
      {
        inputs: [{ item: "raw-electrum", count: 2 }],
        outputs: [{ item: "electrum-ingot", count: 1 }],
        time: 105,
      },
    ],
  },
  {
    description:
      "Smelts and casts ores into ingot form.\nSlightly faster, and can smelt Iron and Electrum.",
    marketValue: 215,
  },
);
//## DRILLS ##
//Scrap Tier [0]
createLinkedBlockAndItem(
  "coal-drill",
  "Coal Drill",
  "drill.coal-drill.ui",
  {
    type: "drill",
    topImg: "drill.coal-drill.top",
    spinnerImg: "drill.coal-drill.spinner",
    baseImg: "drill.coal-drill.base",
    results: { "coal-ore": "coal" },
    amount: 1,
    spinSpeed: 1,
    duration: 600,
    inventorySize: 1,
    title: "Coal Drill",
    tickEffect: "burning",
  },
  {
    description:
      "Crappy hand-made drill which slowly collects coal from below it.\nUses half of it to fuel itself.\nReplace with a powered #>>drill.scrap-drill.ui#=-Scrap Drill#-- if possible, since it's much more efficient.",
    marketValue: 15,
  },
);
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
      "sand": "sand",
      "sand-water": "sand",
      "stone": "stone",
      "coal-ore": "coal",
      "copper-ore": "raw-copper",
    },
    amount: 1,
    spinSpeed: 1,
    duration: 300,
    inventorySize: 1,
    title: "Scrap Drill",
    powerDraw: 0.5,
    maxPower: 1000,
  },
  { description: "Slowly collects resources from below it.", marketValue: 15 },
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
    health: 150,
    results: {
      "sand": "sand",
      "sand-water": "sand",
      "stone": "stone",
      "coal-ore": "coal",
      "copper-ore": "raw-copper",
      "iron-ore": "raw-iron",
      "electrum-ore": "raw-electrum",
    },
    amount: 1,
    spinSpeed: 2,
    duration: 200,
    inventorySize: 1,
    title: "Basic Drill",
    tickEffect: "basic-crafter-smoke",
    tickEffectChance: 0.2,
    powerDraw: 0.8333333334,
    maxPower: 1000,
  },
  {
    description: "Slowly collects resources from below it.\nCan drill Iron and Electrum.",
    marketValue: 60,
  },
);
//## CONVEYOR ##
//Scrap Tier [0]
createLinkedBlockAndItem(
  "scrap-conveyor",
  "Scrap Conveyor",
  "conveyor.scrap-conveyor.ui",
  {
    type: "conveyor",
    moveTime: 18,
    baseImg: "base.scrap",
    beltImg: "conveyor.scrap-conveyor.belt",
  },
  {
    description: "A slow-moving belt.\nTransports items from one place to another.",
    marketValue: 1.5,
  },
);
createLinkedBlockAndItem(
  "scrap-unloader",
  "Scrap Unloader",
  "conveyor.scrap-unloader.ui",
  {
    type: "unloader",
    moveTime: 18,
    baseImg: "base.scrap",
    beltImg: "conveyor.scrap-unloader.belt",
  },
  {
    description:
      "A slow-moving belt.\nTransports items from one place to another.\nPulls selected items from the block behind it.",
    marketValue: 2.5,
  },
);
//Copper Tier [1]
createLinkedBlockAndItem(
  "basic-conveyor",
  "Basic Conveyor",
  "conveyor.basic-conveyor.ui",
  {
    type: "conveyor",
    moveTime: 15,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-conveyor.belt",
    health: 150,
  },
  {
    description: "A slightly faster-moving belt.\nTransports items from one place to another.",
    marketValue: 5,
  },
);
createLinkedBlockAndItem(
  "basic-unloader",
  "Basic Unloader",
  "conveyor.basic-unloader.ui",
  {
    type: "unloader",
    moveTime: 15,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-unloader.belt",
    health: 150,
  },
  {
    description:
      "A slightly faster-moving belt.\nTransports items from one place to another.\nPulls selected items from the block behind it.",
    marketValue: 10,
  },
);
createLinkedBlockAndItem(
  "basic-level-unloader",
  "Basic Level Unloader",
  "conveyor.basic-level-unloader.ui",
  {
    type: "level-unloader",
    moveTime: 15,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-level-unloader.belt",
    indicatorImg: "conveyor.basic-level-loader.indicator",
    health: 150,
  },
  {
    description: "A specialised unloader which will leave up to a certain number of items behind.",
    marketValue: 25,
  },
);
createLinkedBlockAndItem(
  "basic-level-loader",
  "Basic Level Loader",
  "conveyor.basic-level-loader.ui",
  {
    type: "level-loader",
    moveTime: 15,
    baseImg: "base.basic",
    beltImg: "conveyor.basic-level-loader.belt",
    indicatorImg: "conveyor.basic-level-loader.indicator",
    health: 150,
  },
  {
    description:
      "A specialised conveyor which only pushes to blocks, not other conveyors.\nWill stop moving items into the block if there are enough already present, to maintain a constant fill level.",
    marketValue: 10,
  },
);
//## POWER ##
// Scrap Tier [0]
createLinkedBlockAndItem(
  "scrap-pylon",
  "Scrap Power Pylon",
  "pylon.scrap-pylon.ui",
  {
    type: "pylon",
    baseImg: "pylon.scrap-pylon.base",
    poleImg: "pylon.scrap-pylon.pole",
    poleBaseImg: "pylon.scrap-pylon.pole-base",
    topImg: "pylon.scrap-pylon.top",
    range: 2,
    wireColour: [205, 159, 139],
  },
  {
    description: "Connects to nearby blocks, distributing power from generators to factories.",
    marketValue: 10,
  },
);
createLinkedBlockAndItem(
  "scrap-burner",
  "Scrap Coal Burner",
  "generator.scrap-burner",
  {
    type: "burner",
    fuelTypes: { coal: 600 },
    maxPower: 25000,
    inventorySize: 1,
    tickEffect: "burning",
  },
  { description: "Burns coal to produce power." },
);
createLinkedBlockAndItem(
  "scrap-player-charger",
  "Scrap Charger",
  "pylon.scrap-player-charger.ui",
  {
    type: "player-charger",
    baseImg: "pylon.scrap-pylon.base",
    poleImg: "pylon.scrap-pylon.pole",
    poleBaseImg: "pylon.scrap-pylon.pole-base",
    topImg: "pylon.scrap-player-charger.top",
    range: 2,
    wireColour: [205, 159, 139],
  },
  {
    description:
      "Connects to nearby players, distributing power to them from nearby generators (or batteries).",
    marketValue: 10,
  },
);
// Copper Tier [1]
createLinkedBlockAndItem(
  "basic-pylon",
  "Basic Power Pylon",
  "pylon.basic-pylon.ui",
  {
    type: "pylon",
    baseImg: "pylon.basic-pylon.base",
    poleImg: "pylon.basic-pylon.pole",
    poleBaseImg: "pylon.basic-pylon.pole-base",
    topImg: "pylon.basic-pylon.top",

    health: 150,
    range: 4,
    wireColour: [255, 163, 125],
  },
  {
    description: "Connects to nearby blocks, distributing power from generators to factories.",
    marketValue: 12,
  },
);
createLinkedBlockAndItem(
  "basic-relay",
  "Basic Power Relay",
  "pylon.basic-pylon.ui",
  {
    type: "relay",
    baseImg: "pylon.basic-pylon.base",
    poleImg: "pylon.basic-pylon.pole",
    poleBaseImg: "pylon.basic-pylon.pole-base",
    topImg: "pylon.basic-pylon.top",

    health: 150,
    range: 32,
    wireColour: [255, 163, 125],
  },
  {
    description: "Connects multiple Power Pylons together, allowing power transfer between them.\nMuch longer range, but doesn't connect to blocks directly.",
  },
);
createLinkedBlockAndItem(
  "basic-battery",
  "Basic Battery",
  "block.basic-battery",
  { maxPower: 50000, selectable: true },
  { description: "Stores a fairly large amount of power for later use." },
);
// Preview
createLinkedBlockAndItem(
  "discharge-pylon",
  "Discharge Pylon",
  "pylon.basic-pylon.ui",
  {
    type: "discharge-pylon",
    baseImg: "pylon.basic-pylon.base",
    poleImg: "pylon.basic-pylon.pole",
    poleBaseImg: "pylon.basic-pylon.pole-base",
    topImg: "pylon.basic-pylon.top",

    zapEffect: "peti-zap",
    blastEffect: "laser-caster-explosion-destabilised~60",
    zapDamage: 6,

    health: 150,
    range: 4,
    wireColour: [255, 0, 0],
  },
  {
    description:
      "Connects to nearby blocks, distributing power from generators to factories.\nStores and distributes this power to up to 10 enemies unfortunate enough to be in its vicinity.",
    hidden: true,
  },
);
//## CONTAINERS ##
createLinkedBlockAndItem(
  "scrap-storage",
  "Scrap Storage Unit",
  "storage.scrap",
  { title: "Scrap Storage Unit", type: "container", inventorySize: 12 },
  { description: "A small box for item storage.", marketValue: 30 },
);
//## TURRETS ##
createLinkedBlockAndItem(
  "recycle",
  "Recycle",
  "turret.recycle.ui",
  {
    type: "turret",
    inventorySize: 1,
    range: 450,
    bullets: {
      types: [
        {
          lifetime: 30,
          light: 30,
          hitSize: 2.5,
          components: [
            { type: "extra-updates", amount: 1 },
            { type: "movement", speed: 15 },
            { type: "trail", shape: "rhombus", colours: [[80, 62, 55, 100]] },
            { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 12, height: 2 },
            { type: "damage", damageType: "ballistic", amount: 15, spread: 4 },
          ],
        },
      ],
      ammos: { "scrap-bullet": 0 },
    },
    shoot: { reload: 13, pattern: { spread: 2.5 } },
    component: {
      type: "weapon-component",
      width: 32,
      height: 11,
      xOffset: 5,
      image: "turret.recycle.component",
      recoil: 4,
      recoilSpeed: 0.2,
    },
    shootX: 20,
    baseImg: "turret.recycle.base",
    maxPower: 10000,
    powerDraw: 4.1666666667,
  },
  {
    description: "The Recycle turret mounted on its own small base.\nRequires power.",
    marketValue: 100, //65
  },
);
//## TURRET BASES ##
createLinkedBlockAndItem(
  "scrap-turret-base",
  "Scrap Turret Base",
  "base.scrap.smooth",
  {
    type: "turret-base",
    connectorImage: "turret-base.scrap.connector",
    otherPart: "scrap-turret-controller",
  },
  {
    description:
      "Basic block to increase the  maximum size of turrets on  a Scrap Turret Controller.",
    marketValue: 20, // 3 plates = 15
  },
);
createLinkedBlockAndItem(
  "scrap-turret-controller",
  "Scrap Turret Controller",
  "turret-controller.scrap.base",
  {
    type: "turret-controller",
    connectorImage: "turret-base.scrap.connector",
    otherPart: "scrap-turret-base",
    maxSize: 2,
  },
  {
    description:
      "Mounting point for turrets.\nMaximum turret size depends on number of bases.\nCheck the#>>icon.database#=-database#-- for placement examples.",
    marketValue: 100,
  },
);
createLinkedBlockAndItem(
  "peti-turret-base",
  "PETI Turret Base",
  "turret-base.peti.base",
  {
    type: "turret-base",
    connectorImage: "turret-base.peti.connector",
    otherPart: "peti-turret-controller",
  },
  {
    corp: "peti",
    description:
      "Block to increase the maximum size of turrets on a PETI Turret Controller.\n#5iPreview Content",
    hidden: true,
    marketValue: 200, // 3 plates = 15
  },
);
createLinkedBlockAndItem(
  "peti-turret-controller",
  "PETI Turret Controller",
  "turret-controller.peti.base",
  {
    type: "turret-controller",
    connectorImage: "turret-base.peti.connector",
    otherPart: "peti-turret-base",
    maxSize: 6,
  },
  {
    corp: "peti",
    description:
      "Mounting point for PETI turrets.\nMaximum size depends on number of bases.\nPlace them in a cross-shaped pattern.\n#5iPreview Content",
    hidden: true,
    marketValue: 1000,
  },
);
//## ADDITIONAL AUTOMATION ##
createLinkedBlockAndItem(
  "scavenger-gun",
  "Scavenger Gun",
  "turret.recycle.ui",
  {
    type: "item-attractor",
    range: 480,
    pointer: {
      type: "weapon-component",
      width: 32,
      height: 11,
      xOffset: 5,
      image: "turret.recycle.component",
      recoil: 4,
      recoilSpeed: 0.2,
    },
    beamX: 20,
    baseImg: "turret.recycle.base",
  },
  {
    description: "A specialised turret that pulls items towards it, and puts them into its inventory.\nRequires power.",
    marketValue: 100, //65
  },
);
//## PLASMA ##
createLinkedBlockAndItem(
  "plasma-generator",
  "Plasma Generator",
  "base.tungsten",
  { type: "plasma-generator" },
  {
    description:
      "Pressurises and superheats gas in the atmosphere into plasma.\n#5iPreview Content",
    hidden: true,
    corp: "peti",
    marketValue: 5200,
  },
);
createLinkedBlockAndItem(
  "plasma-tank",
  "Plasma Tank",
  "tank.plasma-tank.base",
  { type: "plasma-tank", capacity: 512, plasma: "tank.plasma-tank.plasma" },
  {
    description: "Stores plasma for later use.\n#5iPreview Content",
    hidden: true,
    corp: "peti",
    marketValue: 3250,
  },
);
createLinkedBlockAndItem(
  "plasma-pipeline",
  "Plasma Pipeline",
  "ppipe.plasma-pipeline.ui",
  {
    type: "plasma-pipe",
    baseImage: "ppipe.plasma-pipeline.base",
    basePlasma: "ppipe.plasma-pipeline.base-plasma",
    inputImage: "ppipe.plasma-pipeline.input",
    inputPlasma: "ppipe.plasma-pipeline.input-plasma",
    outputImage: "ppipe.plasma-pipeline.output",
    outputPlasma: "ppipe.plasma-pipeline.output-plasma",
  },
  {
    description:
      "A pressurised pipe for moving high-temperature ionised gas, known as plasma.\n#5iPreview Content",
    hidden: true,
    corp: "peti",
    marketValue: 500,
  },
);
createLinkedBlockAndItem(
  "plasma-compressor",
  "Plasma Compressor",
  "ppipe.plasma-compressor.ui",
  {
    type: "plasma-compressor",
    baseImage: "ppipe.plasma-compressor.base",
    basePlasma: "ppipe.plasma-compressor.base-plasma",
    inputImage: "ppipe.plasma-compressor.input",
    inputPlasma: "ppipe.plasma-compressor.input-plasma",
    outputImage: "ppipe.plasma-compressor.output",
    outputPlasma: "ppipe.plasma-compressor.output-plasma",
    spinnerImage: "ppipe.plasma-compressor.spinner",
    capacity: 32,
  },
  {
    description:
      "A specialised pipe for increasing the pressure of plasma, allowing more to fit through the same pipes.\n2 pipes in , 1 pipe out.\n\nCan't compress plasma above 12 bar.\n#5iPreview Content",
    hidden: true,
    corp: "peti",
    marketValue: 1500,
  },
);
createLinkedBlockAndItem(
  "plasma-decompressor",
  "Plasma Decompressor",
  "ppipe.plasma-compressor.ui",
  {
    type: "plasma-decompressor",
    image: "tank.plasma-tank.base",
    plasma: "tank.plasma-tank.plasma",
    spinnerImage: "ppipe.plasma-compressor.spinner",
    capacity: 16,
  },
  {
    description:
      "A specialised pipe for decreasing the pressure of plasma, allowing other blocks to use it.\n1 pipe in , 2 pipes out.\n\nCan't decompress plasma below 1 bar.\n#5iPreview Content",
    hidden: true,
    corp: "peti",
    marketValue: 1500,
  },
);
//## DECO ##
createLinkedBlockAndItem(
  "message",
  "Message Unit",
  "block.message",
  { type: "sign" },
  { description: "A small digital storage device for holding messages.", hidden: true },
);
//## TONK ##
createLinkedBlockAndItem(
  "tank-assembly-bay",
  "Tank Assembly Bay",
  "block.message",
  { type: "tank-assembler", range: 1 },
  {
    description:
      "Assembles a tank out of blocks.\nContainers add inventory space, Conveyors add speed, and Weapons in containers are mounted on the tank.\n#5iPreview Content",
    hidden: true,
    rarity: Item.rarity.RARE,
  },
);
//## CAPITALISM ##
createLinkedBlockAndItem(
  "launch-pad",
  "Launch Pad",
  "capitalism.iti.launch",
  { type: "launch-pad", podImage: "capitalism.iti.pod" },
  {
    description: "Launches batches of items to space, ready to be collected by #>>icon.iti#i-InfiniTech Industries#--.",
    corp: "iti",
    marketValue: 1250,
  },
);
createLinkedBlockAndItem(
  "landing-pad",
  "Landing Pad",
  "capitalism.iti.land",
  { type: "landing-pad", podImage: "capitalism.iti.pod" },
  {
    description:
      "Buys items from #>>icon.iti#i-InfiniTech Industries#--, and receives them.\nMust be given an item to use for reference.",
    corp: "iti",
    marketValue: 1250,
  },
);
//## DEV ##
createLinkedBlockAndItem(
  "dev::structurereader",
  "Structure Reader",
  "block.dev.structurereader",
  { title: "Structure Reader", type: "dev::structurereader", health: 1000000 },
  {
    description: "Outputs a structure array into the console.\n#yiDevelopment Item",
    rarity: Item.rarity.DEV,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "dev::itemcatalog",
  "Item Catalog",
  "block.dev.itemcatalog",
  { title: "Item Catalog", type: "dev::itemcatalog", health: 1000000 },
  {
    description:
      "Contains an infinite supply of every currently registered item.\nAlso has a trash slot.\n#yiDevelopment Item",
    rarity: Item.rarity.DEV,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "dev::commandblock",
  "Command Block",
  "block.dev.commandblock",
  { type: "dev::commandblock", health: 1000000 },
  {
    description: "Executes a pre-set command on activation.\n#yiDevelopment Item",
    rarity: Item.rarity.DEV,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "dev::commandblock.chain",
  "Chained Command Block",
  "block.dev.commandblock.chain",
  { type: "dev::commandblock", health: 1000000, chaining: true, rotatable: true },
  {
    description:
      "Executes a pre-set command on activation.\nCan be pointed into another command block to chain.\n#yiDevelopment Item",
    rarity: Item.rarity.DEV,
    hidden: true,
  },
);
createLinkedBlockAndItem(
  "dev::commandblock.loop",
  "Looping Command Block",
  "block.dev.commandblock.loop",
  { type: "dev::commandblock", health: 1000000, loops: true },
  {
    description:
      "Executes a pre-set command continuously on activation.\nActivation while running will stop execution.\n#yiDevelopment Item",
    rarity: Item.rarity.DEV,
    hidden: true,
  },
);
