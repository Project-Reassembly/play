Registry.items.add("nothing", {});
//Materials
Registry.items.add("scrap", {
  name: "Scrap Metal",
  description:
    "A small piece of scrap,\nrecovered from remains\nof destroyed machines.",
  image: "item.scrap",
});
Registry.items.add("raw-copper", {
  name: "Raw Copper",
  description:
    "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-copper",
});
Registry.items.add("copper-ingot", {
  name: "Copper Ingot",
  description:
    "A bar of copper.\nA material widely used in electronics.",
  image: "item.copper-ingot",
});
Registry.items.add("plate", {
  name: "Metal Plate",
  description: "Sturdy metal plate, better than unrefined scrap.",
  image: "item.plate",
});
Registry.items.add("wire", {
  name: "Copper Wire",
  description: "Basic wire, used for circuitry\n and low-power energy transmission.",
  image: "item.wire",
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
  description: "A pile of sand, compressed\ninto a hard ball.",
  image: "item.sandstone",
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
          area: 10,
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
    "Fires fast bolts of high-damage plasma.\nBolts deal secondary damage, with homing fragmentation.\nRequires no ammunition.",
  image: "weapon.scrap-shooter.item",
  reload: 60,
  ammoType: "none",
  shoot: {
    bullet: {
      lifetime: 15,
      speed: 20,
      pierce: 1,
      trail: true,
      hitSize: 3,
      trailShape: "rhombus",
      trailColour: [0, 200, 255, 200],
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
          area: 20,
          waveColour: [0, 255, 255],
          sparkColour: [200, 255, 255],
          sparkColourTo: [0, 200, 255],
          smokeColour: [0, 0, 0, 0],
          smokeColourTo: [0, 0, 0, 0],
        },
      ],
      intervalNumber: 1,
      intervalTime: 999,
      intervalBullet: {
        lifetime: 0,
        damage: [
          {
            amount: 0,
            type: "no",
            area: 10,
            waveColour: [0, 255, 255],
            sparkColour: [200, 255, 255],
            sparkColourTo: [0, 200, 255],
            smokeColour: [0, 0, 0, 0],
            smokeColourTo: [0, 0, 0, 0],
          },
        ],
      },
      fragNumber: 3,
      fragSpread: 180,
      fragBullet: {
        type: "missile",
        targetType: "nearest",
        knockback: 2,
        turnSpeed: 20,
        lifetime: 20,
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
            spread: 1,
          },
          {
            type: "no",
            amount: 0,
            area: 5,
            waveColour: [0, 255, 255],
            sparkColour: [200, 255, 255],
            sparkColourTo: [0, 200, 255],
            smokeColour: [0, 0, 0, 0],
            smokeColourTo: [0, 0, 0, 0],
          },
        ],
      },
    },
    pattern: {
      spread: 1.5,
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
//Ammo
Registry.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  description: "A tiny piece of scrap,\nfashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 9999,
});
