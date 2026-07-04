import { Item } from "../classes/item/item.js";
import { Registries } from "../core/registry.js";
Registries.items.add("nothing", {});
//Materials
Registries.items.add("scrap", {
  name: "Scrap Metal",
  marketValue: 1,
  description: "A small piece of scrap, recovered from remains of destroyed machines.",
  image: "item.scrap",
});
Registries.items.add("plate", {
  name: "Metal Plate",
  marketValue: 5,
  description: "Sturdy metal plate, better than unrefined scrap.",
  image: "item.plate",
});

Registries.items.add("raw-copper", {
  name: "Raw Copper (Malachite)",
  marketValue: 1,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-copper",
});
Registries.items.add("copper-ingot", {
  name: "Copper Ingot",
  marketValue: 3,
  description: "A material widely used in electronics.",
  image: "item.copper-ingot",
});
Registries.items.add("copper-wire", {
  name: "Copper Wire",
  marketValue: 0.5,
  description: "Basic wire, used for circuitry\n and low-power energy transmission.",
  image: "item.copper-wire",
});

Registries.items.add("raw-iron", {
  name: "Raw Iron (Hematite)",
  marketValue: 5,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-iron",
});
Registries.items.add("iron-ingot", {
  name: "Iron Ingot",
  marketValue: 12,
  description: "Strong material, but easily oxidises and corrodes.",
  image: "item.iron-ingot",
});

Registries.items.add("raw-electrum", {
  name: "Natural Electrum",
  marketValue: 25,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-electrum",
});
Registries.items.add("electrum-ingot", {
  name: "Electrum Ingot",
  marketValue: 60,
  description: "An alloy of expensive metals.",
  image: "item.electrum-ingot",
});
Registries.items.add("silver-ingot", {
  name: "Silver Ingot",
  marketValue: 40,
  description: "Reflective metal that tarnishes quickly.",
  image: "item.silver-ingot",
});
Registries.items.add("gold-ingot", {
  name: "Gold Ingot",
  marketValue: 75,
  description: "A great electrical conductor, but very soft.",
  image: "item.gold-ingot",
});

Registries.items.add("raw-titanium", {
  name: "Raw Titanium (Ilmenite)",
  marketValue: 85,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-titanium",
});
Registries.items.add("titanium-ingot", {
  name: "Titanium Ingot",
  marketValue: 200,
  description: "Strong, corrosion resistant metal.",
  image: "item.titanium-ingot",
});

Registries.items.add("raw-aluminium", {
  name: "Raw Aluminium (Bauxite)",
  marketValue: 60,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-aluminium",
});
Registries.items.add("aluminium-ingot", {
  name: "Aluminium Ingot",
  marketValue: 150,
  description: "Strong and light metal.\nYes, 'Aluminium'. I will fight you.",
  image: "item.aluminium-ingot",
});

Registries.items.add("raw-tungsten", {
  name: "Raw Tungsten (Wolframite)",
  marketValue: 50,
  description: "A lump of unrefined ore.\nMust be smelted into ingot form to be useful.",
  image: "item.raw-tungsten",
});
Registries.items.add("tungsten-ingot", {
  name: "Tungsten Ingot",
  marketValue: 125,
  description: "Extremely dense but brittle metal.",
  image: "item.tungsten-ingot",
});

Registries.items.add("stone", {
  name: "Stone",
  marketValue: 0.5,
  description: "A piece of rock.\nUsed in primitive construction.",
  image: "item.stone",
});
Registries.items.add("sand", {
  name: "Sand",
  marketValue: 0.1,
  description: "A pile of sand.",
  image: "item.sand",
});
Registries.items.add("sandstone", {
  name: "Sandstone",
  marketValue: 0.4,
  description: "A pile of sand, compressed into a hard ball.",
  image: "item.sandstone",
});

Registries.items.add("coal", {
  name: "Coal",
  marketValue: 0.75,
  description: "A small chunk of coal.\nUsed as fuel in smelters.\nYay, pollution!",
  image: "item.coal",
});
//Throwables
Registries.items.add("makeshift-explosive", {
  type: "throwable",
  name: "Makeshift Explosive",
  marketValue: 5,
  description:
    "A small bomb made from coal dust and scrap.\n\nThat's got to be against some convention.",
  image: "item.makeshift-explosive",
  bullet: {
    lifetime: 120,
    collides: false,
    components: [
      { type: "movement", speed: 8, decel: 0.2 },
      { type: "image-drawer", image: "item.makeshift-explosive", width: 10, height: 10 },
      { type: "status-infliction", effect: "burning", duration: 360 },
      { type: "vfx-trail", effect: "burning" },
      { type: "explosion", damage: 30, spread: 10, radius: 30 },
      { type: "expiry-vfx", effect: "explosion~50" },
      {
        type: "frag-bullet",
        bullet: {
          lifetime: 10,
          light: 30,
          hitSize: 2.5,
          components: [
            { type: "movement", speed: 15 },
            {
              type: "trail",
              colours: [
                [255, 255, 100, 200],
                [255, 0, 0, 100],
                [75, 75, 75, 20],
              ],
              life: 30,
              shape: "rhombus",
            },
            { type: "damage", amount: 5, damageType: "ballistic", spread: 3 },
            { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 8, height: 3 },
          ],
        },
        number: 9,
        spacing: 40,
        spread: 40,
      },
      {
        type: "incendiary",
        count: 3,
        fire: { damage: 3, lifetime: 720, interval: 20, status: "burning", statusDuration: 120 },
        chance: 0.5,
        spread: 20,
        binomial: true,
      },
    ],
  },
});
//Accessories
Registries.items.add("blast-knuckles", {
  type: "accessory",
  name: "Blast Knuckles",
  image: "accessory.blast-knuckles",
  description:
    "#7iGet it? Like brass knuckles? But boom?#--\nUses #-bMakeshift Explosive#--s to make #=-charged punches#-- explode violently.",
  modifiers: [{ type: "punch", charged: "blast-punch", ammoUsed: "makeshift-explosive" }],
});
//Weapons
Registries.items.add("scrap-shooter", {
  type: "weapon",
  marketValue: 40,
  name: "Scrap Shooter",
  description: "Shoots low-damage scrap bullets quickly.\nSlightly inaccurate.",
  image: "weapon.scrap-shooter.item",
  range: 225,
  bullets: {
    types: [
      {
        lifetime: 15,
        light: 30,
        hitSize: 2.5,
        components: [
          { type: "movement", speed: 15 },
          { type: "trail", colours: [[80, 62, 55, 100]], shape: "rhombus" },
          { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 8, height: 3 },
          { type: "damage", damageType: "ballistic", amount: 7, spread: 2 },
        ],
      },
    ],
    ammos: { "scrap-bullet": 0 },
  },
  shoot: { reload: 10, pattern: { spread: 3.5 } },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "weapon.scrap-shooter.component",
    recoil: 4,
    rotationalRecoil: 4,
    recoilSpeed: 0.2,
  },
});
Registries.items.add("scrap-repeater", {
  type: "weapon",
  marketValue: 200,
  name: "Scrap Repeater",
  description:
    "Shoots bullets far more quickly.\nMore inaccurate.\n\nIf you shoot enough bullets, you can't miss!",
  image: "weapon.scrap-repeater.item",
  range: 250,
  recoil: 0.15,
  bullets: {
    types: [
      {
        lifetime: 25,
        light: 30,
        hitSize: 2.5,
        components: [
          { type: "movement", speed: 10 },
          { type: "extra-updates", amount: 1 },
          { type: "trail", shape: "rhombus", colours: [[80, 62, 55, 100]] },
          { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 10, height: 2.5 },
          { type: "damage", damageType: "ballistic", amount: 5, spread: 2 },
          { type: "knockback", amount: 0.5 },
        ],
      },
    ],
    ammos: { "scrap-bullet": 0 },
  },
  shoot: { reload: 3, pattern: { spread: 5 } },
  component: {
    type: "weapon-component",
    width: 36,
    height: 19,
    yOffset: 0,
    image: "weapon.scrap-repeater.component",
    recoil: 6,
    rotationalRecoil: 2,
    recoilSpeed: 0.5,
  },
});

Registries.items.add("scrap-cannon", {
  type: "weapon",
  name: "Scrap Cannon",
  marketValue: 150,
  description: "Hurls 3 large clumps of scrap, which break apart in the air and on impact.",
  image: "weapon.scrap-shooter.item",
  range: 200,
  bullets: {
    types: [
      {
        lifetime: 18,
        light: 30,
        hitSize: 5,
        components: [
          { type: "movement", speed: 10, decel: 0.5 },
          { type: "trail", shape: "rhombus", colours: [[80, 62, 55, 100]] },
          { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 14, height: 9 },
          { type: "explosion", damageType: "ballistic", damage: 30, spread: 7.5, radius: 20 },
          { type: "knockback", amount: 3 },
          { type: "expiry-vfx", effect: "explosion~20" },
          {
            type: "interval-bullet",
            number: 2,
            interval: 7,
            spacing: 130,
            spread: 15,
            bullet: {
              lifetime: 12,
              hitSize: 2.5,
              components: [
                { type: "movement", speed: 9, decel: 0.6 },
                { type: "damage", amount: 6, damageType: "ballistic", spread: 3 },
                { type: "trail", colours: [[80, 62, 55, 100]] },
                { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 6, height: 4 },
                { type: "knockback", amount: 1 },
              ],
            },
          },
          {
            type: "frag-bullet",
            spacing: 20,
            number: 2,
            spread: 5,
            bullet: {
              lifetime: 12,
              hitSize: 2.5,
              components: [
                { type: "movement", speed: 10, decel: 0.2 },
                { type: "trail", colours: [[80, 62, 55, 100]] },
                { type: "damage", amount: 8, damageType: "ballistic", spread: 4 },
                { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 8, height: 4 },
                { type: "knockback", amount: 1 },
              ],
            },
          },
        ],
      },
    ],
    ammos: { scrap: 0 },
  },
  shoot: { effect: "explosion~10", reload: 90, pattern: { spacing: 10, spread: 5, amount: 3 } },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "weapon.scrap-shooter.component",
    recoil: 6,
    rotationalRecoil: 12,
    recoilSpeed: 0.2,
  },
});
Registries.items.add("scrap-launcher", {
  type: "weapon",
  name: "Scrap Launcher",
  marketValue: 150,
  description: "Launches explosive rockets with very long range.",
  image: "weapon.scrap-launcher.item",
  range: 900,
  shootX: -5,
  bullets: {
    types: [
      {
        lifetime: 600,
        hitSize: 6,
        components: [
          { type: "movement", speed: 0, maxSpeed: 3, decel: -0.01 },
          { type: "extra-updates", amount: 10 },
          { type: "vfx-trail", effect: "burning", interval: 10 },
          { type: "damage", amount: 8, damageType: "ballistic", spread: 4 },
          { type: "explosion", damage: 45, spread: 10, radius: 60 },
          { type: "knockback", amount: 5 },
          { type: "image-drawer", image: "bullet.scrap-rocket", width: 16, height: 9 },
        ],
      },
    ],
    ammos: { "scrap-rocket": 0 },
  },
  shoot: { effect: "launcher-smoke", reload: 45 },
  component: {
    type: "weapon-component",
    width: 36,
    height: 19,
    yOffset: 0,
    image: "weapon.scrap-launcher.component",
    recoil: 3,
    rotationalRecoil: 2,
    recoilSpeed: 0.1,
  },
});
Registries.items.add("construction-gun", {
  type: "block-launcher",
  marketValue: 1500,
  name: "Construction Gun",
  description:
    "Fires blocks to place them and deal damage.\nAlt-fire (hold #=-shift#--) to select ammo type, Main to launch.\nVolatile blocks will #c-explode#-- if unplaceable.",
  image: "weapon.construction-gun.item",
  range: -1,
  shootY: -2.3,
  shootX: 8,
  base: {
    speed: 15,
    light: 30,
    trail: true,
    hitSize: 2.5,
    hitColours: [
      [255, 250, 100],
      [255, 200, 50, 100],
    ],
    damage: [{ type: "impact", amount: 0, radius: 25 }],
    despawnEffect: "construction-hit~25",
  },
  shoot: { reload: 20, pattern: { spread: 0.5 } },
  component: {
    type: "weapon-component",
    width: 32,
    height: 19,
    //yOffset: 17,
    image: "weapon.construction-gun.component",
    recoil: 4,
    rotationalRecoil: 4,
    recoilSpeed: 0.2,
  },
});
//Weapons > Corporate
Registries.items.add("iti-laser-pistol", {
  type: "weapon",
  name: "Laser Pistol",
  marketValue: 0,
  corp: "iti",
  description:
    "Shoots medium-range small laser beams which inflict #i-Plasma Burn#-- on enemies.\n#6iStandard Issue",
  image: "weapon.iti-laser-pistol.item",
  range: 300,
  shootX: 0,
  bullets: {
    types: [
      {
        lifetime: 30,
        light: 70,
        hitSize: 3,
        components: [
          { type: "movement", speed: 10 },
          { type: "extra-updates", amount: 29 },
          {
            type: "trail",
            shape: "rhombus",
            interval: 4,
            colours: [
              [0, 255, 255],
              [0, 0, 255, 0],
            ],
            life: 30,
          },
          { type: "damage-pierce", damageType: "laser", amount: 6 },
          { type: "status-infliction", effect: "plasma-burn", duration: 20 },
          { type: "knockback", amount: 1.5 },
          { type: "hit-vfx", effect: "laser-caster-frag" },
          { type: "disable-default-vfx" },
        ],
      },
    ],
    ammos: { none: 0 },
  },
  shoot: { reload: 13, effect: "laser-caster-frag", pattern: { spread: 3 } },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "weapon.iti-laser-pistol.component",
    recoil: 2,
    rotationalRecoil: 2,
    recoilSpeed: 0.15,
  },
});
Registries.items.add("iti-laser-caster", {
  type: "weapon",
  name: "Laser Caster",
  marketValue: 2500,
  corp: "iti",
  description:
    "Fires fast-moving incendiary bolts of explosive plasma.\nBolts release smaller fragments on hit, which home in on enemies and set them on fire.",
  image: "weapon.iti-laser-caster.item",
  range: 400,
  bullets: {
    types: [
      {
        lifetime: 15,
        light: 70,
        hitSize: 3,
        components: [
          { type: "movement", speed: 20 },
          { type: "trail", colours: [[0, 200, 255, 200]], shape: "rhombus" },
          { type: "shape-drawer", shape: "rhombus", fill: [0, 255, 255], width: 12, height: 4 },
          { type: "status-infliction", effect: "plasma-burn", duration: 360 },
          { type: "knockback", amount: 3 },
          { type: "damage", damageType: "laser", amount: 20, spread: 5 },
          {
            type: "explosion",
            damage: 10,
            spread: 3,
            radius: 20,
            effect: "laser-caster-explosion",
          },
          {
            type: "incendiary",
            fire: {
              damage: 5,
              interval: 10,
              effect: "laser-caster-fire",
              status: "plasma-burn",
              lifetime: 180,
            },
            count: 1,
          },
          {
            type: "frag-bullet",
            number: 6,
            spread: 180,
            bullet: {
              light: 50,
              lifetime: 10,
              hitSize: 1.5,
              components: [
                { type: "movement", speed: 10 },
                { type: "track-nearest", range: 100, turnSpeed: 20 },
                {
                  type: "trail",
                  shape: "rhombus",
                  colours: [
                    [0, 255, 255, 255],
                    [0, 200, 255, 255],
                    [0, 0, 255, 100],
                  ],
                },
                { type: "status-infliction", effect: "plasma-burn", duration: 60 },
                {
                  type: "shape-drawer",
                  shape: "rhombus",
                  fill: "cyan", //[0, 255, 255],
                  width: 6,
                  height: 2,
                },
                { type: "pierce", amount: 1 },
                { type: "damage", damageType: "laser", amount: 8, spread: 2 },
                { type: "knockback", amount: 0.5 },
                { type: "expiry-vfx", effect: "laser-caster-frag" },
              ],
            },
          },
        ],
      },
    ],
    ammos: { none: 0 },
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
    yOffset: 0,
    image: "weapon.iti-laser-caster.component",
    recoil: 4,
    rotationalRecoil: 8,
    recoilSpeed: 0.15,
  },
});
Registries.items.add("iti-energy-repeater", {
  type: "weapon",
  name: "Energy Repeater",
  marketValue: 2000,
  corp: "iti",
  description:
    "Rapid-fire mind-guided laser weapon. Homes in on whatever you want it to.\nShoots quickfire bursts of plasma bolts.\nAlt-fire to charge a larger explosive bolt.",
  image: "weapon.iti-energy-repeater.item",
  range: 300,
  bullets: {
    types: [
      {
        lifetime: 15,
        light: 50,
        hitSize: 3,
        components: [
          { type: "track-near-source-target", range: 100, turnSpeed: 20 },
          { type: "movement", speed: 20 },
          {
            type: "trail",
            shape: "rhombus",
            colours: [
              [0, 255, 255, 255],
              [0, 200, 255, 200],
              [0, 0, 255, 100],
            ],
          },
          { type: "knockback", amount: 1 },
          { type: "status-infliction", effect: "plasma-burn", duration: 120 },
          { type: "shape-drawer", shape: "rhombus", fill: [0, 255, 255], width: 12, height: 2 },
          { type: "damage", damageType: "laser", amount: 10, spread: 4 },
          { type: "expiry-vfx", effect: "laser-caster-frag" },
        ],
      },
    ],
    ammos: { none: 0 },
  },
  shoot: {
    chargeEffect: "energy-repeater-charge",
    effect: "laser-caster-frag",
    reload: 30,
    charge: 20,
    pattern: { burst: 3, interval: 5, spread: 3 },
  },
  hasAltFire: true,
  altBullets: {
    types: [
      {
        lifetime: 30,
        light: 60,
        hitSize: 2.5,
        components: [
          { type: "track-near-source-target", range: 150, turnSpeed: 7 },
          { type: "movement", speed: 10 },
          {
            type: "trail",
            shape: "rhombus",
            colours: [
              [0, 255, 255, 255],
              [0, 200, 255, 200],
              [0, 0, 255, 100],
            ],
          },
          { type: "knockback", amount: 3 },
          { type: "status-infliction", effect: "plasma-burn", duration: 180 },
          { type: "shape-drawer", shape: "rhombus", fill: [0, 255, 255], width: 10, height: 4 },
          {
            type: "explosion",
            damageType: "laser",
            damage: 20,
            spread: 5,
            radius: 30,
            effect: "laser-caster-explosion",
          },
          { type: "expiry-vfx", effect: "laser-caster-frag" },
        ],
      },
    ],
    ammos: { none: 0 },
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
    yOffset: 0,
    image: "weapon.iti-energy-repeater.component",
    recoil: 2,
    rotationalRecoil: 3,
    recoilSpeed: 0.15,
  },
});

Registries.items.add("peti-charged-laser-blaster", {
  type: "weapon",
  name: "Charged Laser Blaster",
  marketValue: 0,
  corp: "peti",
  description:
    "Mid-range laser weapon.\nCharges up and shoots a medium-damage single-target laser, along with a secondary inaccurate burst of low-damage lasers.\n#6iStandard Issue",
  image: "weapon.peti-charged-laser-blaster.item",
  range: 250,
  shootX: 7,
  bullets: {
    types: [
      {
        lifetime: 25,
        hitSize: 3,
        components: [
          { type: "movement", speed: 10 },
          { type: "extra-updates", amount: 24 },
          { type: "knockback", amount: 3 },
          { type: "line-trace", effect: "peti-laser" },
          { type: "damage", amount: 30, spread: 6, damageType: "laser" },
          { type: "hit-vfx", effect: "laser-caster-frag-destabilised" },
          { type: "disable-default-vfx" },
          {
            type: "spawn-bullet",
            number: 5,
            spacing: 5,
            spread: 5,
            speedMin: 0.67,
            speedMax: 1.5,
            bullet: {
              lifetime: 6,
              hitSize: 3,
              components: [
                { type: "movement", speed: 10 },
                { type: "extra-updates", amount: 5 },
                { type: "line-trace", effect: "peti-laser-mini" },
                { type: "hit-vfx", effect: "laser-caster-frag-destabilised" },
                { type: "disable-default-vfx" },
                { type: "knockback", amount: 2 },
                { type: "damage", amount: 6, spread: 2, damageType: "laser" },
              ],
            },
          },
        ],
      },
    ],
    ammos: { none: 0 },
  },
  shoot: {
    charge: 45,
    chargeEffect: "charged-laser-blaster-charge",
    reload: 20,
    effect: "laser-caster-explosion-destabilised~10",
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "weapon.peti-charged-laser-blaster.component",
    recoil: 3,
    rotationalRecoil: 4,
    recoilSpeed: 0.15,
  },
});
Registries.items.add("peti-electrified-plasma-launcher", {
  type: "weapon",
  name: "Electrified Plasma Launcher",
  marketValue: 500,
  corp: "peti",
  description:
    "Shoots a pair of high-energy balls which ionise the air as they travel.\nWhen the balls expire, the weapon releases a massive electrical arc through the air, which arcs between enemies that it hits.",
  image: "weapon.peti-charged-laser-blaster.item",
  range: 300,
  shootX: 7,
  bullets: {
    types: [
      {
        lifetime: 35,
        light: 70,
        hitSize: 6,
        components: [
          { type: "extra-updates", amount: 1 },
          {
            type: "bullet-trace",
            bullet: {
              light: 70,
              hitSize: 25,
              components: [
                { type: "infinite-pierce" },
                { type: "extra-updates", amount: 99 },
                { type: "line-trace", effect: "peti-zap" },
                { type: "knockback", amount: 0.5 },
                { type: "damage", amount: 15, spread: 5, damageType: "electric" },
                { type: "disable-default-vfx" },
                {
                  type: "hit-bullet",
                  spread: 30,
                  bullet: {
                    lifetime: 10,
                    light: 70,
                    hitSize: 3,
                    components: [
                      { type: "extra-updates", amount: 24 },
                      { type: "track-nearest", range: 100, turnSpeed: 360 },
                      { type: "pierce", amount: 2, lifeOnHit: 5 },
                      { type: "line-trace", effect: "peti-zap" },
                      { type: "movement", speed: 10 },
                      { type: "knockback", amount: 0.5 },
                      { type: "damage", amount: 6, spread: 2, damageType: "electric" },
                      { type: "disable-default-vfx" },
                      { type: "no-block-collision" },
                    ],
                  },
                },
              ],
            },
          },
          { type: "movement", speed: 10 },
          {
            type: "trail",
            shape: "rhombus",
            interval: 2,
            width: 2,
            colours: [
              [255, 50, 50],
              [255, 0, 0, 0],
            ],
            life: 30,
          },
          { type: "shape-drawer", shape: "circle", fill: "red", width: 6, height: 6 },
          { type: "expiry-vfx", effect: "laser-caster-explosion-destabilised~15" },
          { type: "knockback", amount: 1 },
        ],
      },
    ],
    ammos: { none: 0 },
  },
  shoot: {
    reload: 60,
    effect: "laser-caster-explosion-destabilised~10",
    pattern: { spread: 5, burst: 2, interval: 5 },
  },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "weapon.peti-charged-laser-blaster.component",
    recoil: 3,
    rotationalRecoil: 4,
    recoilSpeed: 0.15,
  },
});

Registries.items.add("peti-plasma-railgun", {
  type: "weapon",
  name: "Plasma Railgun",
  marketValue: 10000,
  corp: "peti",
  description: "Pierces targets with a massive bolt of red plasma.",
  image: "weapon.peti-plasma-railgun.item",
  range: 1000,
  recoil: 2,
  shootX: 42,
  shootY: -1,
  bullets: {
    types: [
      {
        lifetime: 100,
        light: 70,
        hitSize: 10,
        components: [
          { type: "extra-updates", amount: 99 },
          { type: "damage-pierce", damageType: "laser", amount: 2400 },
          { type: "movement", speed: 10 },
          { type: "vfx-trail", effect: "plasma-railgun-trail" },
          { type: "hit-vfx", effect: "plasma-railgun-hit~70" },
          { type: "expiry-vfx", effect: "plasma-railgun-impact~120" },
          { type: "knockback", amount: 17 },
        ],
      },
    ],
    ammos: { none: 0 },
  },
  shoot: {
    charge: 100,
    reload: 360,
    chargeEffect: "plasma-railgun-charge",
    effect: "plasma-railgun-fire",
  },
  component: {
    type: "weapon-component",
    width: 83,
    height: 20,
    yOffset: 5,
    image: "weapon.peti-plasma-railgun.component",
    recoil: 14,
    rotationalRecoil: 25,
    recoilSpeed: 0.1,
  },
});

//Turret
Registries.items.add("recycle-mounted", {
  type: "turret-item",
  name: "Recycle (Mounted)",
  description:
    "A version of the Recycle turret designed for use with the larger Scrap Turret Controller.",
  image: "weapon.scrap-shooter.item",
  range: 450,
  baseSize: 1,
  marketValue: 120,
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
  shoot: { reload: 10, pattern: { spread: 3.5 } },
  component: {
    type: "weapon-component",
    width: 32,
    height: 11,
    yOffset: 0,
    image: "turret.recycle.component",
    recoil: 4,
    rotationalRecoil: 4,
    recoilSpeed: 0.2,
  },
});

Registries.items.add("scrap-artillery", {
  type: "turret-item",
  name: "240mm Artillery Emplacement Gun",
  marketValue: 450,
  description:
    "Large scrap gun, to be mounted on a Turret Controller. Shoots large bullets made of 4 material ingots.",
  baseSize: 2,
  image: "weapon.tank-gun.item",
  ammoUse: 4,
  shootX: 30,
  range: 720,
  bullets: {
    types: [
      {
        lifetime: 0,
        components: [
          {
            type: "frag-bullet",
            fragNumber: 3,
            spread: 5,
            spacing: 5,
            bullet: {
              light: 30,
              hitSize: 10,
              lifetime: 52,
              components: [
                { type: "movement", speed: 10, decel: 0.1 },
                { type: "extra-updates", amount: 2 },
                {
                  type: "trail",
                  life: 45,
                  shape: "rhombus",
                  width: 10,
                  colours: [
                    [200, 200, 200, 50],
                    [50, 50, 50, 0],
                  ],
                },
                { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 28, height: 12 },
                { type: "explosion", damageType: "ballistic", damage: 75, radius: 20 },
                {
                  type: "frag-bullet",
                  spacing: 4,
                  number: 4,
                  spread: 1,
                  bullet: {
                    lifetime: 24,
                    hitSize: 2.5,
                    components: [
                      { type: "movement", speed: 8, decel: 0.1 },
                      { type: "trail", colours: [[70, 70, 70, 100]] },
                      { type: "damage", amount: 10, damageType: "ballistic", spread: 3 },
                      {
                        type: "shape-drawer",
                        shape: "rhombus",
                        fill: "#cd9f8b",
                        width: 8,
                        height: 4,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      {
        lifetime: 72,
        hitSize: 10,
        light: 30,
        components: [
          { type: "extra-updates", amount: 2 },
          { type: "movement", decel: 0.1, speed: 10 },
          {
            type: "trail",
            life: 45,
            shape: "rhombus",
            width: 10,
            colours: [
              [255, 200, 75, 100],
              [200, 200, 200, 50],
              [80, 62, 55, 50],
            ],
          },
          { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 28, height: 12 },
          { type: "explosion", damageType: "ballistic", damage: 200, spread: 35, radius: 30 },
          {
            type: "frag-bullet",
            spacing: 4,
            number: 9,
            spread: 1,
            bullet: {
              lifetime: 12,
              hitSize: 2.5,
              components: [
                { type: "movement", speed: 15, decel: 0.2 },
                { type: "trail", colours: [[80, 62, 55, 100]] },
                { type: "damage", amount: 16, damageType: "ballistic", spread: 5 },
                { type: "pierce", amount: 1 },
                { type: "shape-drawer", shape: "rhombus", fill: "#cd9f8b", width: 8, height: 4 },
              ],
            },
          },
        ],
      },
      {
        lifetime: 72,
        light: 30,
        hitSize: 10,
        components: [
          { type: "extra-updates", amount: 2 },
          { type: "movement", decel: 0.1, speed: 12 },
          {
            type: "trail",
            life: 45,
            shape: "rhombus",
            width: 10,
            colours: [
              [255, 186, 144, 100],
              [255, 163, 125, 50],
              [214, 135, 99, 0],
            ],
          },
          { type: "shape-drawer", shape: "rhombus", fill: [255, 188, 153], width: 28, height: 12 },
          { type: "damage-pierce", damageType: "ballistic", damage: 320, radius: 30 },
          { type: "expiry-vfx", effect: "explosion~60" },
        ],
      },
      {
        lifetime: 72,
        light: 30,
        hitSize: 10,
        components: [
          { type: "extra-updates", amount: 2 },
          { type: "movement", decel: 0.1, speed: 12 },
          {
            type: "trail",
            life: 45,
            shape: "rhombus",
            width: 10,
            colours: [
              [255, 255, 255, 100],
              [200, 200, 200, 50],
              [150, 50, 50, 0],
            ],
          },
          { type: "shape-drawer", shape: "rhombus", fill: [255, 188, 153], width: 28, height: 12 },
          { type: "damage-pierce", damageType: "ballistic", damage: 360, radius: 30 },
          { type: "expiry-vfx", effect: "explosion~60" },
        ],
      },
    ],
    ammos: { "iron-ingot": 3, "copper-ingot": 2, "scrap": 1, "stone": 0 },
  },
  shoot: { effect: "tonk-shoot", reload: 180, pattern: { spread: 2 } },
  component: {
    type: "weapon-component",
    width: 102,
    height: 32,
    image: "weapon.tank-gun.component",
    recoil: 18,
    recoilSpeed: 0.2,
  },
});

Registries.items.add("deathbringer-turret", {
  type: "turret-item",
  name: "Deathbringer Turret",
  description: "#4-The end is near.\n#5iPreview Content",
  image: "turret.deathbringer.item",
  rarity: Item.rarity.PETI,
  range: 2000,
  baseSize: 4,
  marketValue: 120000,
  shootX: -20,
  turnSpeed: 0.1,
  shootCone: 0.1,
  bullets: {
    types: [
      {
        lifetime: 200,
        hitSize: 10,
        components: [
          { type: "movement", speed: 10 },
          { type: "extra-updates", amount: 99 },
          { type: "vfx-trail", effect: "deathbringer-trail" },
          { type: "damage", damageType: "laser", amount: 10000, spread: 2000 },
          {
            type: "explosion",
            damageType: "laser",
            damage: 2000,
            spread: 300,
            radius: 300,
            effect: "none",
          },
          {
            type: "nuclear-explosion",
            damage: 24000,
            spread: 3000,
            radius: 300,
            effect: "deathbringer-nuke~300",
          },
        ],
      },
    ],
    ammos: { "iti-destabilised-cell": 0 },
  },
  shoot: { reload: 480, charge: 120, chargeEffect: "deathbringer-charge" },
  component: {
    type: "weapon-component",
    width: 270,
    height: 180,
    yOffset: 0,
    image: "turret.deathbringer.component",
    recoil: 40,
    rotationalRecoil: 0,
    recoilSpeed: 0.2,
  },
});
//Ammo
Registries.items.add("scrap-bullet", {
  name: "Scrap Bullet",
  marketValue: 0.01,
  description: "A tiny piece of scrap, fashioned into a sharp bullet.",
  image: "item.scrap-bullet",
  stackSize: 10000,
});
Registries.items.add("scrap-rocket", {
  name: "Scrap Rocket",
  marketValue: 2,
  description: "A makeshift explosive rocket.",
  image: "item.scrap-rocket",
  stackSize: 1000,
});
//Accessories
Registries.items.add("iti-energy-cell", {
  type: "equippable",
  name: "Energy Cell",
  marketValue: 1000,
  description:
    "A kind of battery manufactured by InfiniTech Industries.\nCan boost most energy-using things, including you and weapons.",
  image: "item.iti-energy-cell",
  corp: "iti",
  stackSize: 200,
  attributeModifiers: { "speed": 1.1, "fire-rate": 1.2, "health": 0.7 },
});
Registries.items.add("iti-plasma-cell", {
  name: "Plasma Cell",
  marketValue: 2500,
  description:
    "More powerful version of the Energy Cell, designed for better weapon boosting.\nWon't boost players.",
  image: "item.iti-plasma-cell",
  corp: "iti",
  stackSize: 200,
});
Registries.items.add("iti-destabilised-cell", {
  name: "#c*Destabilised#@b Energy Cell",
  marketValue: 7500,
  description: "Is this even ITI?",
  image: "item.iti-destabilised-cell",
  corp: "iti",
  stackSize: 200,
});
