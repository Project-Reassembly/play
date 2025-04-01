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
  reload: 10,
  ammoType: "scrap-bullet",
  shoot: {
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
      trailColour: [80, 62, 55, 100],
      damage: [
        {
          type: "ballistic",
          amount: 7,
          spread: 2,
        },
        {
          type: "no",
          amount: 0,
          radius: 10,
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
    "Fires fast-moving bolts of high-damage plasma.\nBolts deal secondary damage, with homing fragmentation.\nInflicts a burning effect.\nRequires no ammunition.",
  image: "weapon.scrap-shooter.item",
  reload: 80,
  ammoType: "none",
  shoot: {
    bullet: {
      lifetime: 15,
      light: 120,
      speed: 20,
      trail: true,
      hitSize: 3,
      trailShape: "rhombus",
      trailColour: [0, 200, 255, 200],
      trailLight: 80,
      knockback: 10,
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
          amount: 15,
          spread: 5,
        },
        {
          type: "laser",
          amount: 5,
          spread: 1,
          radius: 20,
        },
      ],
      shootEffect: "laser-caster-explosion~10",
      despawnEffect: "laser-caster-fiery-blast~20",
      fragNumber: 6,
      fragSpread: 180,
      fragBullet: {
        type: "missile",
        targetType: "nearest",
        trackingRange: 100,
        light: 120,
        trailLight: 80,
        knockback: 2,
        turnSpeed: 20,
        lifetime: 10,
        speed: 10,
        trail: true,
        hitSize: 1.5,
        trailShape: "rhombus",
        trailColour: [0, 200, 255, 255],
        trailColourTo: [0, 200, 255, 0],
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
            amount: 5,
            spread: 2,
          },
        ],
        shootEffect: "none",
        despawnEffect: "laser-caster-frag",
      },
    },
    pattern: {},
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
//Ammo
Registry.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  description: "A tiny piece of scrap,\nfashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 9999,
});
