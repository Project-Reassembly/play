Registry.items.add("nothing", {});
//Materials
Registry.items.add("scrap", {
  name: "Scrap Metal",
  description:
    "A small piece of scrap,\nrecovered from remains\nof destroyed machines.",
  image: "item.scrap",
});
Registry.items.add("plate", {
  name: "Metal Plate",
  description: "Sturdy metal plate, better than unrefined scrap.",
  image: "item.plate",
});

Registry.items.add("raw-copper", {
  name: "Raw Copper (Malachite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-copper",
});
Registry.items.add("copper-ingot", {
  name: "Copper Ingot",
  description: "A material widely used in electronics.",
  image: "item.copper-ingot",
});
Registry.items.add("wire", {
  name: "Copper Wire",
  description:
    "Basic wire, used for circuitry\n and low-power energy transmission.",
  image: "item.wire",
});

Registry.items.add("raw-iron", {
  name: "Raw Iron (Hematite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-iron",
});
Registry.items.add("iron-ingot", {
  name: "Iron Ingot",
  description: "Strong material, but easily oxidises and corrodes.",
  image: "item.iron-ingot",
});

Registry.items.add("raw-electrum", {
  name: "Natural Electrum",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-electrum",
});
Registry.items.add("electrum-ingot", {
  name: "Electrum Ingot",
  description: "An alloy of expensive metals.",
  image: "item.electrum-ingot",
});
Registry.items.add("silver-ingot", {
  name: "Silver Ingot",
  description: "Reflective metal that tarnishes quickly.",
  image: "item.silver-ingot",
});
Registry.items.add("gold-ingot", {
  name: "Gold Ingot",
  description: "A great electrical conductor, but very soft.",
  image: "item.gold-ingot",
});

Registry.items.add("raw-titanium", {
  name: "Raw Titanium (Ilmenite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-titanium",
});
Registry.items.add("titanium-ingot", {
  name: "Titanium Ingot",
  description: "Strong, corrosion resistant metal.",
  image: "item.titanium-ingot",
});

Registry.items.add("raw-aluminium", {
  name: "Raw Aluminium (Bauxite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-aluminium",
});
Registry.items.add("aluminium-ingot", {
  name: "Aluminium Ingot",
  description:
    "Strong and light metal.\nYes, 'Aluminium'. Not my fault you can't spell.",
  image: "item.aluminium-ingot",
});

Registry.items.add("raw-tungsten", {
  name: "Raw Tungsten (Wolframite)",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-tungsten",
});
Registry.items.add("tungsten-ingot", {
  name: "Tungsten Ingot",
  description: "Extremely dense but brittle metal.",
  image: "item.tungsten-ingot",
});

Registry.items.add("stone", {
  name: "Stone",
  description: "A piece of rock.\nUsed in primitive construction.",
  image: "item.stone",
});
Registry.items.add("sand", {
  name: "Sand",
  description: "A pile of sand.",
  image: "item.sand",
});
Registry.items.add("sandstone", {
  name: "Sandstone",
  description: "A pile of sand, compressed into a hard ball.",
  image: "item.sandstone",
});

Registry.items.add("coal", {
  name: "Coal",
  description:
    "A small chunk of coal.\nUsed as fuel in smelters.\nYay, pollution!",
  image: "item.coal",
});
//Weapons
Registry.items.add("scrap-shooter", {
  type: "weapon",
  name: "Scrap Shooter",
  description: "Shoots low-damage bullets quickly.\nSlightly inaccurate.",
  image: "weapon.scrap-shooter.item",
  ammoType: "scrap-bullet",
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
Registry.items.add("iti-laser-caster", {
  type: "weapon",
  name: "Laser Caster",
  rarity: Item.rarity.ITI,
  description:
    "Fires fast-moving incendiary bolts of explosive plasma.\nBolts deal secondary damage, with homing fragmentation.",
  image: "weapon.iti-laser-caster.item",
  ammoType: "none",
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
Registry.items.add("iti-energy-repeater", {
  type: "weapon",
  name: "Energy Repeater",
  rarity: Item.rarity.ITI,
  description:
    "Shoots quickfire bursts of laser bolts.\nAlt-fire to charge a larger explosive bolt.",
  image: "weapon.iti-energy-repeater.item",
  ammoType: "none",
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

Registry.items.add("construction-gun", {
  type: "block-launcher",
  name: "Construction Gun",
  description:
    "Fires blocks to place them and deal damage.\nAlt-fire to select ammo type, Main to launch.\nVolatile blocks will explode if unplaceable.\n\nTip: Use shift to avoid deconstructing blocks.",
  image: "weapon.scrap-shooter.item",
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

Registry.items.add("scrap-cannon", {
  type: "weapon",
  name: "Scrap Cannon",
  description: "Hurls 3 large clumps of scrap, which break apart\nin the air and on impact.",
  image: "weapon.scrap-shooter.item",
  ammoType: "scrap",
  ammoUse: 3,
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
          radius: 20
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
            amount: 12,
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
            amount: 15,
            type: "ballistic",
            spread: 4
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
      amount: 3
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

//Ammo
Registry.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  description: "A tiny piece of scrap,\nfashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 9999,
});
//Throwables
Registry.items.add("makeshift-explosive", {
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
