import { Registries } from "../core/registry.js";
import { Item } from "../classes/item/item.js";
Registries.items.add("nothing", {});
//Materials
Registries.items.add("scrap", {
  name: "Scrap Metal",
  description:
    "A small piece of scrap,\nrecovered from remains\nof destroyed machines.",
  image: "item.scrap",
});
Registries.items.add("plate", {
  name: "Metal Plate",
  description: "Sturdy metal plate, better than unrefined scrap.",
  image: "item.plate",
});

Registries.items.add("raw-copper", {
  name: "Raw Copper (Malachite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-copper",
});
Registries.items.add("copper-ingot", {
  name: "Copper Ingot",
  description: "A material widely used in electronics.",
  image: "item.copper-ingot",
});
Registries.items.add("wire", {
  name: "Copper Wire",
  description:
    "Basic wire, used for circuitry\n and low-power energy transmission.",
  image: "item.wire",
});

Registries.items.add("raw-iron", {
  name: "Raw Iron (Hematite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-iron",
});
Registries.items.add("iron-ingot", {
  name: "Iron Ingot",
  description: "Strong material, but easily oxidises and corrodes.",
  image: "item.iron-ingot",
});

Registries.items.add("raw-electrum", {
  name: "Natural Electrum",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-electrum",
});
Registries.items.add("electrum-ingot", {
  name: "Electrum Ingot",
  description: "An alloy of expensive metals.",
  image: "item.electrum-ingot",
});
Registries.items.add("silver-ingot", {
  name: "Silver Ingot",
  description: "Reflective metal that tarnishes quickly.",
  image: "item.silver-ingot",
});
Registries.items.add("gold-ingot", {
  name: "Gold Ingot",
  description: "A great electrical conductor, but very soft.",
  image: "item.gold-ingot",
});

Registries.items.add("raw-titanium", {
  name: "Raw Titanium (Ilmenite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-titanium",
});
Registries.items.add("titanium-ingot", {
  name: "Titanium Ingot",
  description: "Strong, corrosion resistant metal.",
  image: "item.titanium-ingot",
});

Registries.items.add("raw-aluminium", {
  name: "Raw Aluminium (Bauxite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-aluminium",
});
Registries.items.add("aluminium-ingot", {
  name: "Aluminium Ingot",
  description:
    "Strong and light metal.\nYes, 'Aluminium'. Not my fault you can't spell.",
  image: "item.aluminium-ingot",
});

Registries.items.add("raw-tungsten", {
  name: "Raw Tungsten (Wolframite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-tungsten",
});
Registries.items.add("tungsten-ingot", {
  name: "Tungsten Ingot",
  description: "Extremely dense but brittle metal.",
  image: "item.tungsten-ingot",
});

Registries.items.add("stone", {
  name: "Stone",
  description: "A piece of rock.\nUsed in primitive construction.",
  image: "item.stone",
});
Registries.items.add("sand", {
  name: "Sand",
  description: "A pile of sand.",
  image: "item.sand",
});
Registries.items.add("sandstone", {
  name: "Sandstone",
  description: "A pile of sand, compressed into a hard ball.",
  image: "item.sandstone",
});

Registries.items.add("coal", {
  name: "Coal",
  description:
    "A small chunk of coal.\nUsed as fuel in smelters.\nYay, pollution!",
  image: "item.coal",
});
//Weapons
Registries.items.add("scrap-shooter", {
  type: "weapon",
  name: "Scrap Shooter",
  description: "Shoots low-damage bullets quickly.\nSlightly inaccurate.",
  image: "weapon.scrap-shooter.item",
  ammoType: "scrap-bullet",
  range: 225,
  shoot: {
    reload: 10,
    bullet: {
      lifetime: 15,
      speed: 15,
      light: 30,
      trail: true,
      hitSize: 2.5,
      trailShape: "rhombus",
      drawer: {
        shape: "rhombus",
        fill: "#cd9f8b",
        width: 8,
        height: 3,
        image: false,
      },
      trailColours: [[80, 62, 55, 100]],
      damage: [
        {
          type: "ballistic",
          amount: 7,
          spread: 2,
        },
      ],
    },
    pattern: {
      spread: 3.5,
    },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.scrap-shooter.component",
    recoil: 4,
    rotationalRecoil: 4,
    recoilSpeed: 0.2,
  },
});
Registries.items.add("iti-laser-caster", {
  type: "weapon",
  name: "Laser Caster",
  rarity: Item.rarity.ITI,
  description:
    "Fires fast-moving incendiary bolts of explosive plasma.\nBolts deal secondary damage, with homing fragmentation.",
  image: "weapon.iti-laser-caster.item",
  ammoType: "none",
  range: 400,
  shoot: {
    charge: 60,
    reload: 180,
    chargeEffect: "laser-caster-charge",
    effect: "laser-caster-frag",
    bullet: {
      lifetime: 15,
      light: 70,
      speed: 20,
      trail: true,
      hitSize: 3,
      trailShape: "rhombus",
      trailColours: [[0, 200, 255, 200]],
      trailLight: 70,
      knockback: 10,
      status: "plasma-burn",
      statusDuration: 360,
      drawer: {
        shape: "rhombus",
        fill: [0, 255, 255],
        width: 12,
        height: 4,
        image: false,
      },
      damage: [
        {
          type: "laser",
          amount: 20,
          spread: 5,
        },
        {
          amount: 10,
          spread: 3,
          radius: 20,
        },
      ],
      despawnEffect: "laser-caster-explosion~20",
      fire: {
        damage: 5,
        interval: 10,
        effect: "laser-caster-fire",
        status: "plasma-burn",
        lifetime: 180,
      },
      fires: 1,
      fragNumber: 6,
      fragSpread: 180,
      fragBullet: {
        type: "missile",
        targetType: "nearest",
        trackingRange: 100,
        light: 50,
        trailLight: 50,
        knockback: 2,
        turnSpeed: 20,
        lifetime: 10,
        speed: 10,
        trail: true,
        pierce: 1,
        hitSize: 1.5,
        trailShape: "rhombus",
        status: "plasma-burn",
        statusDuration: 60,
        trailColours: [
          [0, 255, 255, 255],
          [0, 200, 255, 255],
          [0, 0, 255, 100],
        ],
        drawer: {
          shape: "rhombus",
          fill: "cyan", //[0, 255, 255],
          width: 6,
          height: 2,
          image: false,
        },
        damage: [
          {
            type: "laser",
            amount: 8,
            spread: 2,
          },
        ],
        despawnEffect: "laser-caster-frag",
      },
    },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.iti-laser-caster.component",
    recoil: 4,
    rotationalRecoil: 8,
    recoilSpeed: 0.15,
  },
});
Registries.items.add("iti-energy-repeater", {
  type: "weapon",
  name: "Energy Repeater",
  rarity: Item.rarity.ITI,
  description:
    "Shoots quickfire bursts of laser bolts.\nAlt-fire to charge a larger explosive bolt.",
  image: "weapon.iti-energy-repeater.item",
  ammoType: "none",
  range: 300,
  shoot: {
    chargeEffect: "energy-repeater-charge",
    effect: "laser-caster-frag",
    reload: 30,
    charge: 20,
    bullet: {
      type: "missile",
      targetType: "hovered",
      trackingRange: 100,
      turnSpeed: 20,
      lifetime: 15,
      light: 50,
      speed: 20,
      trail: true,
      hitSize: 3,
      trailShape: "rhombus",
      trailColours: [
        [0, 255, 255, 255],
        [0, 200, 255, 200],
        [0, 0, 255, 100],
      ],
      trailLight: 50,
      trailWidth: 1,
      knockback: 10,
      status: "plasma-burn",
      statusDuration: 120,
      drawer: {
        shape: "rhombus",
        fill: [0, 255, 255],
        width: 12,
        height: 2,
        image: false,
      },
      damage: [
        {
          type: "laser",
          amount: 10,
          spread: 4,
        },
      ],
      despawnEffect: "laser-caster-frag",
    },
    pattern: {
      burst: 3,
      interval: 5,
      spread: 3,
    },
  },
  hasAltFire: true,
  altShoot: {
    charge: 60,
    reload: 30,
    chargeEffect: "laser-caster-charge",
    effect: "laser-caster-explosion~15",
    recoilScale: 3,
    rotRecoilScale: 4,
    bullet: {
      type: "missile",
      targetType: "hovered",
      trackingRange: 150,
      turnSpeed: 7,
      lifetime: 30,
      light: 60,
      speed: 10,
      trail: true,
      hitSize: 2.5,
      trailShape: "rhombus",
      trailColours: [
        [0, 255, 255, 255],
        [0, 200, 255, 200],
        [0, 0, 255, 100],
      ],
      trailLight: 60,
      knockback: 7,
      status: "plasma-burn",
      statusDuration: 180,
      drawer: {
        shape: "rhombus",
        fill: [0, 255, 255],
        width: 10,
        height: 3,
        image: false,
      },
      damage: [
        {
          amount: 20,
          spread: 5,
          radius: 30,
        },
      ],
      despawnEffect: "laser-caster-explosion~30",
    },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.iti-energy-repeater.component",
    recoil: 2,
    rotationalRecoil: 3,
    recoilSpeed: 0.15,
  },
});

Registries.items.add("construction-gun", {
  type: "block-launcher",
  name: "Construction Gun",
  description:
    "Fires blocks to place them and deal damage.\nAlt-fire to select ammo type, Main to launch.\nVolatile blocks will explode if unplaceable.\n\nTip: Use shift to avoid deconstructing blocks.",
  image: "weapon.scrap-shooter.item",
  range: -1,
  shoot: {
    reload: 20,
    bullet: {
      speed: 15,
      light: 30,
      trail: true,
      hitSize: 2.5,
      hitColours: [
        [255, 250, 100],
        [255, 200, 50, 100],
      ],
      damage: [
        {
          type: "impact",
          amount: 1,
          radius: 25,
        },
      ],
      despawnEffect: "construction-hit~25",
    },
    pattern: {
      spread: 0.5,
    },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.scrap-shooter.component",
    recoil: 4,
    rotationalRecoil: 4,
    recoilSpeed: 0.2,
  },
});

Registries.items.add("scrap-cannon", {
  type: "weapon",
  name: "Scrap Cannon",
  description:
    "Hurls 3 large clumps of scrap, which break apart\nin the air and on impact.",
  image: "weapon.scrap-shooter.item",
  ammoType: "scrap",
  range: 200,
  shoot: {
    effect: "explosion~10",
    reload: 90,
    bullet: {
      lifetime: 18,
      speed: 10,
      decel: 0.5,
      light: 30,
      trail: true,
      hitSize: 5,
      trailShape: "rhombus",
      drawer: {
        shape: "rhombus",
        fill: "#cd9f8b",
        width: 14,
        height: 9,
        image: false,
      },
      trailColours: [[80, 62, 55, 100]],
      damage: [
        {
          type: "ballistic",
          amount: 30,
          spread: 7.5,
          radius: 20,
        },
      ],
      despawnEffect: "explosion~20",
      intervalNumber: 2,
      intervalTime: 7,
      intervalSpacing: 130,
      intervalSpread: 15,
      intervalBullet: {
        speed: 9,
        decel: 0.6,
        lifetime: 12,
        hitSize: 2.5,
        trailColours: [[80, 62, 55, 100]],
        damage: [
          {
            amount: 6,
            type: "ballistic",
            spread: 3,
          },
        ],
        drawer: {
          shape: "rhombus",
          fill: "#cd9f8b",
          width: 6,
          height: 4,
          image: false,
        },
      },
      fragSpacing: 20,
      fragNumber: 2,
      fragSpread: 5,
      fragBullet: {
        speed: 10,
        decel: 0.2,
        lifetime: 12,
        hitSize: 2.5,
        trailColours: [[80, 62, 55, 100]],
        damage: [
          {
            amount: 8,
            type: "ballistic",
            spread: 4,
          },
        ],
        drawer: {
          shape: "rhombus",
          fill: "#cd9f8b",
          width: 8,
          height: 4,
          image: false,
        },
      },
    },
    pattern: {
      spacing: 10,
      spread: 5,
      amount: 3,
    },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.scrap-shooter.component",
    recoil: 6,
    rotationalRecoil: 12,
    recoilSpeed: 0.2,
  },
});

Registries.items.add("tank-gun", {
  type: "weapon",
  name: "240mm Artillery Emplacement Gun",
  description: "Pretty sure this goes on a tank.",
  image: "weapon.tank-gun.item",
  ammoType: "scrap",
  ammoUse: 4,
  shootX: 30,
  range: 720,
  shoot: {
    effect: "tonk-shoot",
    reload: 180,
    bullet: {
      lifetime: 72,
      speed: 10,
      extraUpdates: 2,
      decel: 0.1,
      light: 30,
      trail: true,
      hitSize: 10,
      trailLife: 45,
      trailShape: "rhombus",
      trailWidth: 10,
      drawer: {
        shape: "rhombus",
        fill: "#cd9f8b",
        width: 28,
        height: 12,
        image: false,
      },
      trailColours: [
        [255, 200, 75, 100],
        [200, 200, 200, 50],
        [80, 62, 55, 50],
      ],
      damage: [
        {
          type: "ballistic",
          amount: 240,
          spread: 90,
          radius: 30,
        },
      ],
      despawnEffect: "explosion~30",
      fragSpacing: 4,
      fragNumber: 9,
      fragSpread: 1,
      fragBullet: {
        speed: 15,
        decel: 0.2,
        lifetime: 12,
        hitSize: 2.5,
        pierce: 1,
        trailColours: [[80, 62, 55, 100]],
        damage: [
          {
            amount: 20,
            type: "ballistic",
            spread: 7,
          },
        ],
        drawer: {
          shape: "rhombus",
          fill: "#cd9f8b",
          width: 8,
          height: 4,
          image: false,
        },
      },
    },
    pattern: {
      spread: 2,
    },
  },
  component: {
    type: "weapon-component",
    width: 102,
    height: 32,
    yOffset: 0,
    image: "weapon.tank-gun.component",
    recoil: 18,
    recoilSpeed: 0.2,
  },
});

//Ammo
Registries.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  description: "A tiny piece of scrap,\nfashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 9999,
});
//Throwables
Registries.items.add("makeshift-explosive", {
  type: "throwable",
  name: "Makeshift Explosive",
  description:
    "A small bomb made from coal dust and scrap.\n\nThat's got to be against some convention.",
  image: "item.coal",
  bullet: {
    lifetime: 120,
    speed: 8,
    decel: 0.2,
    collides: false,
    drawer: {
      image: "item.coal",
      width: 10,
      height: 10,
    },
    status: "burning",
    statusDuration: 360,
    trailEffect: "burning",
    damage: [
      {
        type: "explosion",
        amount: 30,
        spread: 10,
        radius: 30,
      },
    ],
    fragBullet: {
      lifetime: 10,
      speed: 15,
      light: 30,
      trail: true,
      hitSize: 2.5,
      trailShape: "rhombus",
      drawer: {
        shape: "rhombus",
        fill: "#cd9f8b",
        width: 8,
        height: 3,
        image: false,
      },
      trailColours: [
        [255, 255, 100, 200],
        [255, 0, 0, 100],
        [75, 75, 75, 20],
      ],
      trailLife: 30,
      damage: [
        {
          type: "ballistic",
          amount: 5,
          spread: 3,
        },
      ],
    },
    fragNumber: 9,
    fragSpread: 360,
    despawnEffect: "explosion~50",
    fires: 3,
    isFireBinomial: true,
    fire: {
      damage: 3,
      lifetime: 720,
      interval: 20,
      status: "burning",
      statusDuration: 120,
    },
    fireChance: 0.5,
    fireSpread: 20,
  },
});
