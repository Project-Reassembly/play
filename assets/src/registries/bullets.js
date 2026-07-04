import { PreloadRegistries } from "../core/registry.js";

PreloadRegistries.bullets.add("punch", {
  lifetime: 5,
  hitSize: 10,
  components: [
    { type: "hit-vfx", effect: "punch" },
    { type: "movement", speed: 1 },
    { type: "knockback", amount: 5 },
    { type: "damage", damageType: "impact", amount: 1 },
    { type: "disable-default-vfx" },
  ],
});

PreloadRegistries.bullets.add("big-punch", {
  lifetime: 2,
  hitSize: 10,
  components: [
    { type: "hit-vfx", effect: "big-punch" },
    { type: "movement", speed: 5 },
    { type: "knockback", amount: 5 },
    { type: "damage", damageType: "impact", amount: 5 },
    { type: "disable-default-vfx" },
    { type: "hit-explosion", damage: 3, damageType: "impact", radius: 25, knockback: 3 },
  ],
});

PreloadRegistries.bullets.add("blast-punch", {
  lifetime: 2,
  hitSize: 10,
  components: [
    { type: "hit-vfx", effect: "big-punch" },
    { type: "movement", speed: 5 },
    { type: "knockback", amount: 5 },
    { type: "disable-default-vfx" },
    {
      type: "hit-bullet",
      bullet: {
        components: [
          { type: "explosion", damage: 40, spread: 10, radius: 45 },
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
            fire: {
              damage: 4,
              lifetime: 720,
              interval: 20,
              status: "burning",
              statusDuration: 120,
            },
            chance: 0.5,
            spread: 20,
            binomial: true,
          },
        ],
      },
    },
  ],
});
