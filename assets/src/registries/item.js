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
Registry.items.add("wire", {
  name: "Copper Wire",
  description: "Basic wire,\nused for\ncircuitry and\nlow power\ntransmission.",
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
  description: "A pile of sand,\ncompressed into\na hard ball.",
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
        fill: Item.getColourFromRarity(Item.rarity.SPECIAL, "dark"),
        width: 4,
        height: 1.5,
        image: false,
      },
      trailColour: Item.getColourFromRarity(
        Item.rarity.SPECIAL,
        "light"
      ).concat([100]),
      damage: [
        {
          type: "ballistic",
          amount: 7,
          spread: 2
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
    width: 32,
    height: 11,
    yOffset: 13,
    image: "weapon.scrap-shooter.component",
  },
});
//Ammo
Registry.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  description:
    "A tiny piece of scrap,\nfashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 9999
});