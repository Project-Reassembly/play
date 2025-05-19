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
  range: 225,
  bullets: {
    types: [
      {
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
    ],
    ammos: {
      "scrap-bullet": 0,
    },
  },
  shoot: {
    reload: 10,
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
    "Fires fast-moving incendiary bolts of explosive plasma.\nBolts deal secondary damage, with homing fragmentation.\n\nAccepts Destabilised Cells.",
  image: "weapon.iti-laser-caster.item",
  range: 400,
  bullets: {
    types: [
      {
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
      {
        lifetime: 20,
        light: 70,
        speed: 20,
        trail: true,
        hitSize: 3,
        trailShape: "rhombus",
        trailColours: [[0, 200, 255, 200]],
        trailLight: 70,
        knockback: 20,
        status: "plasma-burn",
        statusDuration: 420,
        drawer: {
          shape: "rhombus",
          fill: [0, 255, 255],
          width: 14,
          height: 5,
          image: false,
        },
        damage: [
          {
            type: "laser",
            amount: 24,
            spread: 5,
          },
          {
            amount: 12.5,
            spread: 4,
            radius: 25,
          },
        ],
        despawnEffect: "laser-caster-explosion~25",
        fire: {
          damage: 6,
          interval: 10,
          effect: "laser-caster-fire",
          status: "plasma-burn",
          lifetime: 180,
        },
        fires: 1,
        fragNumber: 9,
        fragSpread: 180,
        fragBullet: {
          type: "missile",
          targetType: "nearest",
          trackingRange: 150,
          light: 50,
          trailLight: 50,
          knockback: 2,
          turnSpeed: 25,
          lifetime: 15,
          speed: 15,
          trail: true,
          pierce: 1,
          hitSize: 1.5,
          trailShape: "rhombus",
          status: "plasma-burn",
          statusDuration: 70,
          trailColours: [
            [0, 255, 255, 255],
            [0, 200, 255, 255],
            [0, 0, 255, 100],
          ],
          drawer: {
            shape: "rhombus",
            fill: "cyan", //[0, 255, 255],
            width: 7,
            height: 3,
            image: false,
          },
          damage: [
            {
              type: "laser",
              amount: 10,
              spread: 2,
            },
          ],
          despawnEffect: "laser-caster-frag",
        },
      },
      {
        lifetime: 16,
        light: 70,
        speed: 25,
        trail: true,
        hitSize: 3,
        trailShape: "rhombus",
        trailColours: [[184, 0, 255, 200]],
        trailLight: 70,
        knockback: 20,
        status: "plasma-burn-boosted",
        statusDuration: 480,
        drawer: {
          shape: "rhombus",
          fill: [198, 51, 255],
          width: 12,
          height: 7,
          image: false,
        },
        damage: [
          {
            type: "laser",
            amount: 45,
            spread: 6,
          },
          {
            amount: 20,
            spread: 5,
            radius: 30,
          },
        ],
        despawnEffect: "laser-caster-explosion-plasma~30",
        fire: {
          damage: 9,
          interval: 6,
          effect: "laser-caster-fire-plasma",
          status: "plasma-burn-boosted",
          lifetime: 180,
        },
        fires: 1,
        fragNumber: 11,
        fragSpread: 180,
        fragBullet: {
          type: "missile",
          targetType: "nearest",
          trackingRange: 150,
          light: 50,
          trailLight: 50,
          knockback: 2,
          turnSpeed: 25,
          lifetime: 12,
          speed: 12,
          trail: true,
          pierce: 2,
          hitSize: 1.5,
          trailShape: "rhombus",
          status: "plasma-burn-boosted",
          statusDuration: 90,
          trailColours: [
            [255, 255, 255],
            [198, 51, 255, 128],
            [184, 0, 255],
          ],
          drawer: {
            shape: "rhombus",
            fill: "white",
            width: 7,
            height: 3,
            image: false,
          },
          damage: [
            {
              type: "laser",
              amount: 15,
              spread: 3,
            },
          ],
          despawnEffect: "laser-caster-frag-plasma",
        },
      },
      {
        lifetime: 18,
        light: 70,
        speed: 25,
        trail: true,
        hitSize: 3,
        trailEffect: "laser-caster-fire-destabilised",
        trailLight: 70,
        knockback: 20,
        status: "destabilised",
        statusDuration: 480,
        drawer: {
          shape: "rhombus",
          fill: [255, 100, 100],
          width: 12,
          height: 7,
          image: false,
        },
        damage: [
          {
            type: "laser",
            amount: 75,
            spread: 15,
          },
          {
            amount: 30,
            spread: 8,
            radius: 60,
          },
        ],
        despawnEffect: "laser-caster-explosion-destabilised~60",
        fire: {
          damage: 10,
          interval: 10,
          effect: "laser-caster-fire-destabilised",
          status: "destabilised",
          lifetime: 180,
        },
        fires: 3,
        fireSpread: 100,
        fireChance: 1,
        fragNumber: 6,
        fragSpread: 180,
        fragBullet: {
          type: "missile",
          targetType: "nearest",
          trackingRange: 150,
          light: 50,
          trailLight: 50,
          knockback: 2,
          turnSpeed: 25,
          lifetime: 12,
          speed: 12,
          trail: true,
          pierce: 5,
          hitSize: 1.5,
          trailShape: "rhombus",
          status: "destabilised",
          statusDuration: 90,
          trailColours: [
            [255, 100, 100],
            [255, 0, 0, 0],
          ],
          drawer: {
            shape: "rhombus",
            fill: "red",
            width: 7,
            height: 3,
            image: false,
          },
          fire: {
            damage: 10,
            interval: 10,
            effect: "laser-caster-fire-destabilised",
            status: "destabilised",
            lifetime: 180,
          },
          fires: 1,
          intervalBullet: {
            lifetime: 0,
            speed: 0,
            hitSize: 0,
            collides: false,
            drawer: {
              hidden: true,
            },
            fire: {
              damage: 10,
              interval: 10,
              effect: "laser-caster-fire-destabilised",
              status: "destabilised",
              lifetime: 180,
            },
            fires: 1,
            fireSpread: 10,
            fireChance: 1,
          },
          intervalTime: 3,
          intervalNumber: 1,
          damage: [
            {
              type: "laser",
              amount: 35,
              spread: 10,
            },
          ],
          despawnEffect: "laser-caster-frag-destabilised",
        },
      },
    ],
    ammos: {
      "iti-destabilised-cell": 3,
      "iti-plasma-cell": 2,
      "iti-energy-cell": 1,
      none: 0,
    },
    unbrowsable: [1, 2, 3],
  },
  shoot: {
    charge: 60,
    reload: 180,
    chargeEffect: "laser-caster-charge",
    effect: "laser-caster-frag",
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
  range: 300,
  bullets: {
    types: [
      {
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
      {
        type: "missile",
        targetType: "hovered",
        trackingRange: 150,
        turnSpeed: 25,
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
        knockback: 15,
        status: "plasma-burn",
        statusDuration: 150,
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
            amount: 13,
            spread: 4,
          },
        ],
        despawnEffect: "laser-caster-frag",
      },
      {
        type: "missile",
        targetType: "hovered",
        trackingRange: 200,
        turnSpeed: 20,
        lifetime: 20,
        light: 50,
        speed: 20,
        trail: true,
        hitSize: 3,
        trailShape: "rhombus",
        trailColours: [
          [255, 255, 255],
          [198, 51, 255, 128],
          [184, 0, 255],
        ],
        trailLight: 50,
        trailWidth: 1,
        knockback: 10,
        status: "plasma-burn-boosted",
        statusDuration: 140,
        drawer: {
          shape: "rhombus",
          fill: "white",
          width: 12,
          height: 4,
          image: false,
        },
        damage: [
          {
            type: "laser",
            amount: 25,
            spread: 5,
          },
        ],
        despawnEffect: "laser-caster-frag-plasma",
      },
    ],
    ammos: {
      "iti-plasma-cell": 2,
      "iti-energy-cell": 1,
      none: 0,
    },
    unbrowsable: [1, 2],
  },
  shoot: {
    chargeEffect: "energy-repeater-charge",
    effect: "laser-caster-frag",
    reload: 30,
    charge: 20,
    pattern: {
      burst: 3,
      interval: 5,
      spread: 3,
    },
  },
  hasAltFire: true,
  altBullets: {
    types: [
      {
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
      {
        type: "missile",
        targetType: "hovered",
        trackingRange: 150,
        turnSpeed: 9,
        lifetime: 25,
        light: 60,
        speed: 13,
        trail: true,
        hitSize: 2.5,
        trailShape: "rhombus",
        trailColours: [
          [0, 255, 255, 255],
          [0, 200, 255, 200],
          [0, 0, 255, 100],
        ],
        trailLight: 60,
        knockback: 10,
        status: "plasma-burn",
        statusDuration: 240,
        drawer: {
          shape: "rhombus",
          fill: [0, 255, 255],
          width: 10,
          height: 3,
          image: false,
        },
        damage: [
          {
            amount: 25,
            spread: 7,
            radius: 35,
          },
        ],
        despawnEffect: "laser-caster-explosion~35",
      },
      {
        type: "missile",
        targetType: "hovered",
        trackingRange: 300,
        turnSpeed: 14,
        lifetime: 20,
        light: 100,
        speed: 15,
        trail: true,
        hitSize: 2.5,
        trailShape: "rhombus",
        trailColours: [
          [255, 255, 255],
          [198, 51, 255, 128],
          [184, 0, 255],
        ],
        trailLight: 60,
        knockback: 12,
        status: "plasma-burn-boosted",
        statusDuration: 200,
        drawer: {
          shape: "rhombus",
          fill: "white",
          width: 10,
          height: 5,
          image: false,
        },
        damage: [
          {
            amount: 50,
            spread: 10,
            radius: 45,
          },
        ],
        despawnEffect: "laser-caster-explosion-plasma~45",
      },
    ],
    ammos: {
      "iti-plasma-cell": 2,
      "iti-energy-cell": 1,
      none: 0,
    },
    unbrowsable: [1, 2],
  },
  altShoot: {
    charge: 60,
    reload: 30,
    chargeEffect: "laser-caster-charge",
    effect: "laser-caster-explosion~15",
    recoilScale: 3,
    rotRecoilScale: 4,
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
  base: {
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
        amount: 0,
        radius: 25,
      },
    ],
    despawnEffect: "construction-hit~25",
  },
  shoot: {
    reload: 20,
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
  range: 200,
  bullets: {
    types: [
      {
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
    ],
    ammos: {
      scrap: 0,
    },
  },
  shoot: {
    effect: "explosion~10",
    reload: 90,
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
  ammoUse: 4,
  shootX: 30,
  range: 720,
  bullets: {
    types: [
      {
        lifetime: 0,
        speed: 0,
        fragNumber: 3,
        fragSpread: 5,
        fragSpacing: 5,
        fragBullet: {
          lifetime: 52,
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
            [200, 200, 200, 50],
            [50, 50, 50, 0],
          ],
          damage: [
            {
              type: "ballistic",
              amount: 75,
              spread: 30,
              radius: 20,
            },
          ],
          despawnEffect: "explosion~20",
          fragSpacing: 4,
          fragNumber: 4,
          fragSpread: 1,
          fragBullet: {
            speed: 8,
            decel: 0.1,
            lifetime: 24,
            hitSize: 2.5,
            trailColours: [[70, 70, 70, 100]],
            damage: [
              {
                amount: 10,
                type: "ballistic",
                spread: 3,
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
      },
      {
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
            amount: 200,
            spread: 50,
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
              amount: 16,
              type: "ballistic",
              spread: 5,
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
      {
        lifetime: 72,
        speed: 12,
        extraUpdates: 2,
        decel: 0.1,
        light: 30,
        trail: true,
        hitSize: 10,
        trailLife: 45,
        trailShape: "rhombus",
        trailWidth: 10,
        pierce: 1,
        drawer: {
          shape: "rhombus",
          fill: [255, 188, 153],
          width: 28,
          height: 12,
          image: false,
        },
        trailColours: [
          [255, 186, 144, 100],
          [255, 163, 125, 50],
          [214, 135, 99, 0],
        ],
        damage: [
          {
            type: "ballistic",
            amount: 320,
            spread: 70,
          },
        ],
        despawnEffect: "explosion~60",
      },
      {
        lifetime: 72,
        speed: 12,
        extraUpdates: 2,
        decel: 0.1,
        light: 30,
        trail: true,
        hitSize: 10,
        trailLife: 45,
        trailShape: "rhombus",
        trailWidth: 10,
        pierce: 2,
        drawer: {
          shape: "rhombus",
          fill: [255, 188, 153],
          width: 28,
          height: 12,
          image: false,
        },
        trailColours: [
          [255, 255, 255, 100],
          [200, 200, 200, 50],
          [150, 50, 50, 0],
        ],
        damage: [
          {
            type: "ballistic",
            amount: 350,
            spread: 80,
          },
        ],
        despawnEffect: "explosion~60",
      },
    ],
    ammos: {
      "iron-ingot": 3,
      "copper-ingot": 2,
      scrap: 1,
      stone: 0,
    },
  },
  shoot: {
    effect: "tonk-shoot",
    reload: 180,
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
  stackSize: 10000,
});
Registries.items.add("iti-energy-cell", {
  name: "Energy Cell",
  description:
    "A kind of battery manufactured by\nInfiniTech Industries.\nCan boost most energy weapons.",
  image: "item.iti-energy-cell",
  rarity: Item.rarity.ITI,
  stackSize: 200,
});
Registries.items.add("iti-plasma-cell", {
  name: "Plasma Cell",
  description:
    "More powerful version of the Energy Cell,\ndesigned for better weapon boosting.",
  image: "item.iti-plasma-cell",
  rarity: Item.rarity.ITI,
  stackSize: 200,
});
Registries.items.add("iti-destabilised-cell", {
  name: "Destabilised Energy Cell",
  description: "Is this even ITI?",
  image: "item.iti-destabilised-cell",
  rarity: Item.rarity.ITI,
  stackSize: 200,
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
