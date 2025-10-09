import { Registries } from "../core/registry.js";
Registries.vfx.add("none", {});

//Block effects

Registries.vfx.add("crafter-smoke", {
  type: "particle-emission",
  cone: 10,
  particle: {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    shape: "circle",
    colourFrom: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    widthFrom: 20,
    widthTo: 30,
    heightFrom: 20,
    heightTo: 30,
    rotateSpeed: 0,
    light: 0,
  },
});
Registries.vfx.add("basic-drill-smoke", {
  type: "particle-emission",
  cone: 30,
  amount: 3,
  particle: {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    shape: "circle",
    colourFrom: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    widthFrom: 5,
    widthTo: 7,
    heightFrom: 5,
    heightTo: 7,
    rotateSpeed: 0,
    light: 0,
  },
});
Registries.vfx.add("smelter-sparks", {
  type: "particle-emission",
  amount: 4,
  cone: 360,
  particle: {
    lifetime: 30,
    speed: 3,
    decel: 0.075,
    colours: [
      [255, 255, 100],
      [255, 0, 0, 0],
    ],
    widthFrom: 2,
    widthTo: 0,
    heightFrom: 8,
    heightTo: 8,
    shape: "rect",
    light: 20,
  },
});
Registries.vfx.add("crafter-craft", {
  type: "wave-emission",
  particle: {
    lifetime: 20,
    radiusFrom: 0,
    radiusTo: 60,
    colours: [
      [255, 200, 0, 255],
      [255, 150, 0, 0],
    ],
    strokeFrom: 10,
    strokeTo: 0,
  },
});

//Explosions

Registries.vfx.add("explosion", {
  type: "explosion",
});
Registries.vfx.add("construction-hit", {
  type: "explosion",
  waveColours: [
    [255, 255, 100],
    [255, 200, 50, 100],
  ],
  smokeColours: [
    [100, 100, 100],
    [50, 50, 50, 0],
  ],
  sparks: false,
});
Registries.vfx.add("laser-caster-explosion", {
  type: "explosion",
  waveColours: [
    [255, 255, 255],
    [100, 255, 255, 100],
  ],
  sparkColours: [
    [200, 255, 255],
    [0, 200, 255],
  ],
  smoke: false,
});
Registries.vfx.add("laser-caster-explosion-plasma", {
  type: "explosion",
  waveColours: [
    [255, 255, 255],
    [198, 51, 255, 100],
  ],
  sparkColours: [
    [248, 101, 255],
    [184, 0, 255],
  ],
  smoke: false,
});
Registries.vfx.add("laser-caster-explosion-destabilised", {
  type: "explosion",
  waveColours: [
    [255, 100, 100],
    [255, 0, 0, 0],
  ],
  sparkColours: [
    [255, 255, 255],
    [255, 0, 0, 100],
  ],
  smoke: false,
});

//Firing effects

Registries.vfx.add("shoot", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 30,
      emissions: 3,
      interval: 5,
      particle: {
        lifetime: 60,
        speed: 1,
        decel: 0.02,
        shape: "circle",
        colours: [
          [50, 50, 50, 100],
          [100, 100, 100, 0],
        ],
        widthFrom: 5,
        widthTo: 10,
        heightFrom: 5,
        heightTo: 10,
        rotateSpeed: 0,
        light: 0,
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 10,
        speed: 0,
        shape: "moved-triangle",
        direction: -90,
        colours: [
          [255, 255, 255, 100],
          [255, 240, 210],
          [255, 230, 175, 0],
        ],
        widthFrom: 25,
        widthTo: 20,
        heightFrom: 8,
        heightTo: 0,
        rotateSpeed: 0,
        light: 30,
      },
    },
  ],
});

Registries.vfx.add("tonk-shoot", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 30,
      emissions: 5,
      interval: 5,
      amount: 2,
      particle: {
        lifetime: 90,
        speed: 2,
        decel: 0.02,
        shape: "circle",
        colours: [
          [50, 50, 50, 100],
          [100, 100, 100, 0],
        ],
        widthFrom: 10,
        widthTo: 20,
        heightFrom: 10,
        heightTo: 20,
        rotateSpeed: 0,
        light: 0,
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 10,
        speed: 0,
        shape: "moved-triangle",
        direction: -90,
        colours: [
          [255, 255, 255, 100],
          [255, 240, 210],
          [255, 230, 175, 0],
        ],
        widthFrom: 50,
        widthTo: 40,
        heightFrom: 16,
        heightTo: 0,
        rotateSpeed: 0,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      amount: 6,
      cone: 30,
      particle: {
        shape: "rhombus",
        lifetime: 30,
        speed: 6,
        widthFrom: 4,
        widthTo: 0,
        heightFrom: 25,
        heightTo: 50,
        colours: [
          [255, 255, 255, 100],
          [255, 240, 210],
          [255, 230, 175, 0],
        ],
        light: 40,
      },
    },
  ],
});
Registries.vfx.add("launcher-smoke", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 30,
      emissions: 5,
      interval: 5,
      amount: 2,
      particle: {
        lifetime: 90,
        direction: 180,
        speed: 2,
        decel: 0.02,
        shape: "circle",
        colours: [
          [50, 50, 50, 100],
          [100, 100, 100, 0],
        ],
        widthFrom: 10,
        widthTo: 20,
        heightFrom: 10,
        heightTo: 20,
        rotateSpeed: 0,
        light: 0,
      },
    },
  ],
});

Registries.vfx.add("laser-caster-frag", {
  type: "particle-emission",
  amount: 4,
  cone: 20,
  particle: {
    shape: "rhombus",
    lifetime: 20,
    speed: 3,
    widthFrom: 2,
    widthTo: 0,
    heightFrom: 10,
    heightTo: 20,
    colours: [
      [255, 255, 255],
      [0, 255, 255, 0],
    ],
    light: 40,
  },
});
Registries.vfx.add("laser-caster-frag-plasma", {
  type: "particle-emission",
  amount: 4,
  cone: 20,
  particle: {
    shape: "rhombus",
    lifetime: 20,
    speed: 3,
    widthFrom: 2,
    widthTo: 0,
    heightFrom: 10,
    heightTo: 20,
    colours: [
      [255, 255, 255],
      [198, 51, 255, 128],
      [184, 0, 255],
    ],
    light: 40,
  },
});
Registries.vfx.add("laser-caster-frag-destabilised", {
  type: "particle-emission",
  amount: 4,
  cone: 20,
  particle: {
    shape: "rhombus",
    lifetime: 20,
    speed: 3,
    widthFrom: 2,
    widthTo: 0,
    heightFrom: 10,
    heightTo: 20,
    colours: [
      [255, 100, 100],
      [255, 0, 0],
    ],
    light: 40,
  },
});

Registries.vfx.add("plasma-railgun-fire", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 8,
      cone: 150,
      particle: {
        shape: "moved-triangle",
        lifetime: 40,
        direction: -90,
        speed: 0,
        widthFrom: 60,
        widthTo: 120,
        heightFrom: 20,
        heightTo: 0,
        colours: [
          [255, 100, 100],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 5,
      cone: 50,
      particle: {
        shape: "moved-triangle",
        lifetime: 40,
        direction: -90,
        speed: 0,
        widthFrom: 120,
        widthTo: 240,
        heightFrom: 15,
        heightTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 3,
      cone: 30,
      particle: {
        shape: "moved-triangle",
        lifetime: 40,
        direction: 90,
        speed: 0,
        widthFrom: 90,
        widthTo: 180,
        heightFrom: 10,
        heightTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 3,
      cone: 50,
      particle: {
        shape: "moved-triangle",
        lifetime: 40,
        direction: 90,
        speed: 0,
        widthFrom: 45,
        widthTo: 90,
        heightFrom: 20,
        heightTo: 0,
        colours: [
          [255, 100, 100],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
  ],
});
Registries.vfx.add("plasma-railgun-impact", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 8,
      cone: 45,
      particle: {
        shape: "moved-triangle",
        lifetime: 30,
        direction: -90,
        speed: 0,
        widthFrom: 60,
        widthTo: 240,
        heightFrom: 20,
        heightTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 5,
      cone: 30,
      particle: {
        shape: "moved-triangle",
        lifetime: 25,
        direction: 90,
        speed: 0,
        widthFrom: 30,
        widthTo: 140,
        heightFrom: 20,
        heightTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 24,
      cone: 360,
      particle: {
        shape: "moved-triangle",
        lifetime: 20,
        direction: 90,
        speed: 0,
        widthFrom: 20,
        widthTo: 80,
        heightFrom: 20,
        heightTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 30,
        radiusFrom: 0,
        radiusTo: 450,
        strokeFrom: 12,
        strokeTo: 0,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 30,
      },
    },
  ],
});
Registries.vfx.add("plasma-railgun-trail", {
  type: "particle-emission",
  amount: 3,
  cone: 0,
  maxXOffset: 5,
  maxYOffset: 5,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 3,
    widthFrom: 10,
    widthTo: 0,
    heightFrom: 60,
    heightTo: 120,
    colours: [
      [255, 200, 200],
      [255, 0, 0, 128],
      [255, 0, 0, 0],
    ],
    light: 60,
  },
});
Registries.vfx.add("plasma-railgun-hit", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 4,
      cone: 45,
      particle: {
        shape: "rhombus",
        lifetime: 40,
        speed: 7,
        widthFrom: 10,
        widthTo: 0,
        heightFrom: 30,
        heightTo: 60,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 4,
      cone: 60,
      particle: {
        shape: "rhombus",
        lifetime: 40,
        speed: 3,
        widthFrom: 10,
        widthTo: 0,
        heightFrom: 30,
        heightTo: 60,
        colours: [
          [255, 200, 200],
          [255, 0, 0, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "explosion",
      sparkColours: [
        [255, 200, 200],
        [255, 0, 0, 128],
        [255, 0, 0, 0],
      ],
      wave: false,
      smoke: false,
    },
  ],
});

Registries.vfx.add("death-laser-fire", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 360,
      particle: {
        shape: "rhombus",
        lifetime: 40,
        direction: 90,
        speed: 0,
        widthFrom: 100,
        widthTo: 500,
        heightFrom: 40,
        heightTo: 0,
        colours: [
          [255, 255, 100],
          [200, 200, 80],
          [255, 255, 100, 128],
          [200, 200, 80, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      particle: {
        shape: "circle",
        lifetime: 40,
        direction: 90,
        speed: 0,
        widthFrom: 145,
        widthTo: 190,
        heightFrom: 145,
        heightTo: 190,
        colours: [
          [20, 20, 0],
          [0, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 40,
        radiusFrom: 180,
        radiusTo: 70,
        strokeFrom: 20,
        strokeTo: 0,
        colours: [
          [255, 255, 100, 0],
          [222, 222, 100, 255],
          [200, 200, 80],
        ],
        light: 30,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 40,
        radiusFrom: 0,
        radiusTo: 300,
        strokeFrom: 40,
        strokeTo: 0,
        colours: [
          [20, 20, 0],
          [0, 0, 0],
        ],
        light: 30,
      },
    },
  ],
});
Registries.vfx.add("death-laser-trail", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 1,
      cone: 0,
      maxXOffset: 50,
      maxYOffset: 50,
      particle: {
        shape: "rhombus",
        lifetime: 50,
        speed: 10,
        widthFrom: 30,
        widthTo: 0,
        heightFrom: 600,
        heightTo: 300,
        colours: [
          [20, 20, 0],
          [0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 2,
      cone: 0,
      maxXOffset: 50,
      maxYOffset: 50,
      particle: {
        shape: "rhombus",
        lifetime: 50,
        speed: 10,
        widthFrom: 10,
        widthTo: 0,
        heightFrom: 200,
        heightTo: 100,
        colours: [
          [255, 255, 100],
          [200, 200, 80],
        ],
        light: 60,
      },
    },
  ],
});
Registries.vfx.add("death-laser-hit", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 4,
      cone: 45,
      particle: {
        shape: "rhombus",
        lifetime: 45,
        speed: 9,
        widthFrom: 20,
        widthTo: 0,
        heightFrom: 60,
        heightTo: 120,
        colours: [
          [0, 0, 0],
          [20, 20, 0],
          [0, 0, 0],
          [20, 20, 0],
          [255, 255, 100, 128],
          [200, 200, 80, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 4,
      cone: 60,
      particle: {
        shape: "rhombus",
        lifetime: 40,
        speed: 3,
        widthFrom: 20,
        widthTo: 0,
        heightFrom: 60,
        heightTo: 120,
        colours: [
          [0, 0, 0],
          [20, 20, 0],
          [0, 0, 0],
          [20, 20, 0],
          [255, 255, 100, 128],
          [200, 200, 80, 0],
        ],
        light: 60,
      },
    },
    {
      type: "explosion",
      sparkColours: [
        [0, 0, 0],
        [20, 20, 0],
        [0, 0, 0],
        [20, 20, 0],
        [255, 255, 100, 128],
        [200, 200, 80, 0],
      ],
      wave: false,
      smoke: false,
    },
  ],
});

Registries.vfx.add("deathbringer-trail", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 2,
      cone: 0,
      maxXOffset: 7,
      maxYOffset: 7,
      particle: {
        shape: "rhombus",
        lifetime: 10,
        speed: 3,
        widthFrom: 15,
        widthTo: 0,
        heightFrom: 60,
        heightTo: 180,
        colours: [
          [255, 0, 0],
          [255, 50, 50, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
    {
      type: "particle-emission",
      amount: 2,
      cone: 0,
      maxXOffset: 7,
      maxYOffset: 7,
      particle: {
        shape: "rhombus",
        lifetime: 10,
        speed: 3,
        widthFrom: 7,
        widthTo: 0,
        heightFrom: 60,
        heightTo: 180,
        colours: [
          [255, 100, 100],
          [255, 50, 50, 128],
          [255, 0, 0, 0],
        ],
        light: 60,
      },
    },
  ],
});

//impact frames
Registries.vfx.add("nuke-impact", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.01,
        shape: "inverted-triangle",
        direction: -90,
        colours: [
          [255, 255, 255, 150],
          [255, 240, 210, 150],
          [255, 230, 175, 150],
        ],
        widthFrom: 5000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: 20,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.01,
        shape: "inverted-triangle",
        direction: 180,
        colours: [
          [255, 255, 255, 150],
          [255, 240, 210, 150],
          [255, 230, 175, 150],
        ],
        widthFrom: 5000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: 20,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.01,
        shape: "inverted-triangle",
        direction: 0,
        colours: [
          [255, 255, 255, 150],
          [255, 240, 210, 150],
          [255, 230, 175, 150],
        ],
        widthFrom: 5000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: 20,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      amount: 1,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.01,
        shape: "inverted-triangle",
        direction: 90,
        colours: [
          [255, 255, 255, 150],
          [255, 240, 210, 150],
          [255, 230, 175, 150],
        ],
        widthFrom: 5000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: 20,
        light: 30,
      },
    },
  ],
});
Registries.vfx.add("deathbringer-charge", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 360,
      amount: 5,
      particle: {
        lifetime: 120,
        speed: 0,
        decel: 0.005,
        shape: "inverted-triangle",
        colours: [
          [255, 0, 0, 150],
          [255, 50, 50, 50],
        ],
        widthFrom: 10000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: -10,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      cone: 360,
      amount: 5,
      particle: {
        lifetime: 120,
        speed: 0,
        decel: 0.005,
        shape: "inverted-triangle",
        colours: [
          [255, 50, 50, 150],
          [255, 0, 0, 50],
        ],
        widthFrom: 10000,
        widthTo: 0,
        heightFrom: 640,
        heightTo: 0,
        rotateSpeed: 10,
        light: 30,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 120,
        radiusFrom: 600,
        radiusTo: 0,
        strokeFrom: 10,
        strokeTo: 30,
        colours: [
          [255, 0, 0, 50],
          [255, 150, 150, 255],
        ],
        light: 30,
      },
    },
  ],
});
Registries.vfx.add("deathbringer-shot-impact", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 360,
      amount: 5,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.015,
        shape: "inverted-triangle",
        colours: [
          [255, 0, 0, 150],
          [255, 50, 50, 50],
        ],
        widthFrom: 10000,
        widthTo: 0,
        heightFrom: 1280,
        heightTo: 0,
        rotateSpeed: -10,
        light: 30,
      },
    },
    {
      type: "particle-emission",
      cone: 360,
      amount: 5,
      particle: {
        lifetime: 45,
        speed: 0,
        decel: 0.015,
        shape: "inverted-triangle",
        colours: [
          [255, 50, 50, 150],
          [255, 0, 0, 50],
        ],
        widthFrom: 10000,
        widthTo: 0,
        heightFrom: 1280,
        heightTo: 0,
        rotateSpeed: 10,
        light: 30,
      },
    },
  ],
});

//Nuclear

Registries.vfx.add("nuke", {
  type: "nuclear-explosion",
});
Registries.vfx.add("deathbringer-nuke", {
  type: "nuclear-explosion",
  flashColours: [
    [255, 175, 150],
    [255, 0, 0, 0],
  ],
  flashColoursLight: [
    [255, 230, 200],
    [255, 100, 100, 0],
  ],
  fireColours: [
    [255, 255, 255, 100],
    [255, 64, 0, 75],
    [255, 0, 0, 50],
    [255, 0, 0, 25],
    [155, 0, 0, 0],
  ],
});

//Fire

Registries.vfx.add("fire", {
  type: "particle-emission",
  amount: 4,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 1,
    decel: 0.03,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [255, 255, 100],
      [255, 0, 0, 50],
      [50, 50, 50, 0],
    ],
    rotateSpeed: 2,
    light: 80,
  },
});
Registries.vfx.add("laser-caster-fire", {
  type: "particle-emission",
  amount: 4,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 1,
    decel: 0.03,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [100, 255, 255],
      [0, 50, 255, 0],
    ],
    rotateSpeed: 2,
    light: 100,
  },
});
Registries.vfx.add("laser-caster-fire-plasma", {
  type: "particle-emission",
  amount: 4,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 1,
    decel: 0.03,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [255, 255, 255],
      [198, 51, 255, 128],
      [184, 0, 255, 0],
    ],
    rotateSpeed: 2,
    light: 100,
  },
});
Registries.vfx.add("laser-caster-fire-destabilised", {
  type: "particle-emission",
  amount: 4,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 1,
    decel: 0.03,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [255, 100, 100],
      [255, 0, 0, 0],
    ],
    rotateSpeed: 2,
    light: 100,
  },
});
Registries.vfx.add("death-laser-flames", {
  type: "particle-emission",
  amount: 4,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 1,
    decel: 0.03,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [0, 0, 0],
      [20, 20, 0],
      [255, 255, 150, 128],
      [200, 200, 100, 0],
    ],
    rotateSpeed: 2,
    light: 100,
  },
});

//Status

Registries.vfx.add("burning", {
  type: "particle-emission",
  amount: 2,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 0.5,
    decel: 0.05,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [255, 255, 100],
      [255, 0, 0, 0],
      [50, 50, 50, 0],
    ],
    rotateSpeed: 2,
    light: 40,
  },
});
Registries.vfx.add("plasma-burn", {
  type: "particle-emission",
  amount: 2,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 0.5,
    decel: 0.05,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [100, 255, 255],
      [0, 50, 255, 0],
    ],
    rotateSpeed: 2,
    light: 50,
  },
});
Registries.vfx.add("plasma-burn-boosted", {
  type: "particle-emission",
  amount: 2,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 0.5,
    decel: 0.05,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [255, 255, 255],
      [198, 51, 255, 128],
      [184, 0, 255, 0],
    ],
    rotateSpeed: 2,
    light: 50,
  },
});
Registries.vfx.add("destabilised", {
  type: "particle-emission",
  particle: {
    shape: "rect",
    lifetime: 30,
    widthFrom: 5,
    widthTo: 0,
    heightFrom: 20,
    heightTo: 20,
    colours: [
      [255, 128, 128],
      [255, 0, 0, 100],
    ],
    light: 50,
  },
});
Registries.vfx.add("death-burn", {
  type: "particle-emission",
  amount: 2,
  particle: {
    shape: "rhombus",
    lifetime: 30,
    speed: 0.5,
    decel: 0.05,
    widthFrom: 5,
    widthTo: 10,
    heightFrom: 5,
    heightTo: 10,
    colours: [
      [0, 0, 0],
      [20, 20, 0],
      [255, 255, 150, 128],
      [200, 200, 100, 0],
    ],
    rotateSpeed: 2,
    light: 50,
  },
});

//Charge

Registries.vfx.add("laser-caster-charge", {
  type: "wave-emission",
  emissions: 4,
  interval: 10,
  parentise: true,
  particle: {
    lifetime: 30,
    radiusFrom: 20,
    radiusTo: 0,
    strokeFrom: 2,
    strokeTo: 5,
    colours: [
      [0, 255, 255, 0],
      [255, 255, 255],
    ],
    light: 30,
  },
});
Registries.vfx.add("charged-laser-blaster-charge", {
  type: "wave-emission",
  parentise: true,
  particle: {
    lifetime: 25,
    radiusFrom: 20,
    radiusTo: 0,
    strokeFrom: 2,
    strokeTo: 5,
    colours: [
      [255, 0, 0, 0],
      [255, 100, 100],
    ],
    light: 30,
  },
});
Registries.vfx.add("plasma-railgun-charge", {
  type: "wave-emission",
  emissions: 4,
  interval: 20,
  parentise: true,
  particle: {
    lifetime: 30,
    radiusFrom: 40,
    radiusTo: 0,
    strokeFrom: 0,
    strokeTo: 5,
    colours: [
      [255, 0, 0, 0],
      [255, 0, 0, 128],
      [255, 255, 255],
    ],
    light: 30,
  },
});
Registries.vfx.add("energy-repeater-charge", {
  type: "wave-emission",
  particle: {
    lifetime: 20,
    radiusFrom: 15,
    radiusTo: 0,
    strokeFrom: 2,
    strokeTo: 5,
    colours: [
      [0, 255, 255, 0],
      [255, 255, 255],
    ],
    light: 30,
  },
});
//Tonk
Registries.vfx.add("tonk-weld", {
  type: "particle-emission",
  amount: 3,
  emissions: 6,
  interval: 3,
  cone: 360,
  particle: {
    lifetime: 30,
    speed: 3,
    decel: 0.075,
    colours: [
      [255, 255, 100],
      [255, 0, 0, 0],
    ],
    widthFrom: 3,
    widthTo: 0,
    heightFrom: 12,
    heightTo: 12,
    shape: "rect",
    light: 20,
  },
});
Registries.vfx.add("tonk-build", {
  type: "particle-emission",
  amount: 4,
  emissions: 3,
  interval: 4,
  cone: 360,
  particle: {
    lifetime: 45,
    speed: 8,
    decel: 0.075,
    colours: [
      [255, 255, 100],
      [255, 0, 0, 0],
    ],
    widthFrom: 12,
    widthTo: 0,
    heightFrom: 32,
    heightTo: 32,
    shape: "rect",
    light: 20,
  },
});
Registries.vfx.add("tonk-build-wave", {
  type: "particle-emission",
  amount: 1,
  cone: 0,
  particle: {
    lifetime: 60,
    //direction: 90,
    speed: 1.5,
    decel: 0,
    colours: [
      [255, 255, 255, 64],
      [255, 255, 128, 0],
      [255, 255, 0, 64],
    ],
    widthFrom: 30,
    widthTo: 90,
    heightFrom: 30,
    heightTo: 90,
    shape: "rect",
    light: 20,
    rotateSpeed: 3,
  },
});
Registries.vfx.add("tonk-build-square", {
  type: "particle-emission",
  amount: 1,
  cone: 0,
  particle: {
    lifetime: 10,
    //direction: 90,
    speed: 0,
    decel: 0,
    colours: [
      [255, 255, 0, 64],
      [220, 200, 0, 0],
    ],
    widthFrom: 90,
    widthTo: 110,
    heightFrom: 90,
    heightTo: 110,
    shape: "rect",
    light: 20,
    rotateSpeed: 0,
  },
});

//Misc
Registries.vfx.add("land-target", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      cone: 0,
      particle: {
        direction: 90,
        speed: 0,
        lifetime: 180,
        widthFrom: 80,
        widthTo: 80,
        heightFrom: 12,
        heightTo: 0,
        rotateSpeed: 2,
        light: 30,
        shape: "rect",
        decel: 0,
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
      },
    },
    {
      type: "particle-emission",
      cone: 0,
      particle: {
        direction: 0,
        speed: 0,
        lifetime: 180,
        widthFrom: 80,
        widthTo: 80,
        heightFrom: 12,
        heightTo: 0,
        rotateSpeed: 2,
        light: 30,
        shape: "rect",
        decel: 0,
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 180,
        radiusFrom: 15,
        radiusTo: 15,
        strokeFrom: 8,
        strokeTo: 0,
        light: 30,
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 180,
        radiusFrom: 25,
        radiusTo: 25,
        strokeFrom: 8,
        strokeTo: 0,
        light: 30,
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
      },
    },
    {
      type: "text-particle-emission",
      cone: 0,
      y: -65,
      particle: {
        direction: 0,
        speed: 0,
        lifetime: 180,
        sizeFrom: 15,
        sizeTo: 15,
        light: 30,
        text: "Warning:\nImpact Imminent",
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
        useOCR: false,
      },
    },
    ,
    {
      type: "text-particle-emission",
      cone: 0,
      y: 65,
      particle: {
        direction: 0,
        speed: 0,
        lifetime: 180,
        sizeFrom: 15,
        sizeTo: 15,
        light: 30,
        text: "Vacate Area\nImmediately",
        colours: [
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255],
          [255, 0, 0],
          [255, 255, 255, 128],
          [255, 0, 0, 0],
        ],
        useOCR: false,
      },
    },
  ],
});
Registries.vfx.add("land-trail", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 4,
      particle: {
        shape: "rhombus",
        lifetime: 45,
        speed: 1,
        decel: 0.03,
        widthFrom: 10,
        widthTo: 20,
        heightFrom: 10,
        heightTo: 20,
        colours: [
          [255, 255, 100],
          [255, 0, 0, 50],
          [50, 50, 50, 0],
        ],
        rotateSpeed: 2,
        light: 80,
      },
    },
    {
      type: "particle-emission",
      cone: 360,
      particle: {
        lifetime: 120,
        speed: 0.1,
        decel: 0.0015,
        shape: "circle",
        colours: [
          [50, 50, 50, 100],
          [100, 100, 100, 0],
        ],
        widthFrom: 20,
        widthTo: 60,
        heightFrom: 20,
        heightTo: 60,
        rotateSpeed: 0,
        light: 0,
      },
    },
    {
      type: "particle-emission",
      cone: 360,
      amount: 2,
      particle: {
        lifetime: 5,
        speed: 0,
        decel: 0,
        shape: "rhombus",
        colours: [
          [255, 255, 200, 200],
          [255, 245, 150, 0],
        ],
        widthFrom: 120,
        widthTo: 120,
        heightFrom: 10,
        heightTo: 10,
        rotateSpeed: 5,
        light: 100,
      },
    },
  ],
});
Registries.vfx.add("land-effect", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 1,
      cone: 0,
      particle: {
        lifetime: 30,
        direction: 90,
        speed: 0,
        decel: 0,
        shape: "rhombus",
        colours: [
          [255, 255, 200, 255],
          [255, 245, 150, 0],
        ],
        widthFrom: 180,
        widthTo: 120,
        heightFrom: 10,
        heightTo: 0,
        light: 100,
      },
    },
    {
      type: "particle-emission",
      amount: 1,
      cone: 0,
      particle: {
        lifetime: 30,
        speed: 0,
        decel: 0,
        shape: "rhombus",
        colours: [
          [255, 255, 200, 255],
          [255, 245, 150, 0],
        ],
        widthFrom: 180,
        widthTo: 120,
        heightFrom: 10,
        heightTo: 0,
        light: 100,
      },
    },
    {
      type: "particle-emission",
      amount: 1,
      cone: 0,
      particle: {
        lifetime: 30,
        direction: 135,
        speed: 0,
        decel: 0,
        shape: "rhombus",
        colours: [
          [255, 255, 200, 255],
          [255, 245, 150, 0],
        ],
        widthFrom: 120,
        widthTo: 60,
        heightFrom: 8,
        heightTo: 0,
        light: 100,
      },
    },
    {
      type: "particle-emission",
      amount: 1,
      cone: 0,
      particle: {
        lifetime: 30,
        direction: 45,
        speed: 0,
        decel: 0,
        shape: "rhombus",
        colours: [
          [255, 255, 200, 255],
          [255, 245, 150, 0],
        ],
        widthFrom: 120,
        widthTo: 60,
        heightFrom: 8,
        heightTo: 0,
        light: 100,
      },
    },
  ],
});
Registries.vfx.add("land-wave", {
  type: "wave-emission",
  isFloor: true,
  particle: {
    lifetime: 300,
    radiusFrom: 0,
    radiusTo: 3000,
    strokeFrom: 2,
    strokeTo: 50,
    colours: [
      [255, 255, 255],
      [255, 255, 0],
      [255, 0, 0, 128],
      [50, 50, 50, 0],
    ],
    light: 30,
  },
});
Registries.vfx.add("land-scorch", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      isFloor: true,
      amount: 8,
      particle: {
        shape: "rhombus",
        lifetime: 2880,
        speed: 0,
        decel: 0,
        widthFrom: 300,
        widthTo: 300,
        heightFrom: 100,
        heightTo: 100,
        colours: [
          [255, 255, 100, 100],
          [128, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 100],
          [0, 0, 0, 0],
        ],
      },
    },
    {
      type: "particle-emission",
      cone: 30,
      emissions: 720,
      interval: 4,
      maxXOffset: 150,
      maxYOffset: 150,
      particle: {
        lifetime: 120,
        speed: 1,
        decel: 0.015,
        shape: "circle",
        colours: [
          [50, 50, 50, 100],
          [100, 100, 100, 0],
        ],
        widthFrom: 20,
        widthTo: 60,
        heightFrom: 20,
        heightTo: 60,
        rotateSpeed: 0,
        light: 0,
      },
    },
  ],
});

// combat
Registries.vfx.add("shield-break", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 8,
      cone: 360,
      particle: {
        lifetime: 30,
        speed: 5,
        decel: 0.075,
        colours: [
          [100, 255, 255, 200],
          [0, 200, 255, 0],
        ],
        widthFrom: 4,
        widthTo: 0,
        heightFrom: 16,
        heightTo: 16,
        shape: "rect",
        light: 20,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 30,
        radiusFrom: 0,
        radiusTo: 60,
        strokeFrom: 2,
        strokeTo: 10,
        colours: [
          [0, 255, 255, 200],
          [0, 200, 255, 0],
        ],
        light: 30,
      },
    },
  ],
});
Registries.vfx.add("shield-break-yellow", {
  type: "multi-effect",
  effects: [
    {
      type: "particle-emission",
      amount: 8,
      cone: 360,
      particle: {
        lifetime: 30,
        speed: 5,
        decel: 0.075,
        colours: [
          [255, 255, 200, 200],
          [255, 200, 0, 0],
        ],
        widthFrom: 4,
        widthTo: 0,
        heightFrom: 16,
        heightTo: 16,
        shape: "rect",
        light: 20,
      },
    },
    {
      type: "wave-emission",
      particle: {
        lifetime: 30,
        radiusFrom: 0,
        radiusTo: 60,
        strokeFrom: 2,
        strokeTo: 10,
        colours: [
          [255, 255, 200, 200],
          [255, 200, 0, 0],
        ],
        light: 30,
      },
    },
  ],
});

// lines
Registries.vfx.add("snipe-trail", {
  type: "line-emission",
  amount: 1,
  line: {
    lifetime: 10,
    light: 20,
    colours: [
      [255, 255, 100],
      [255, 200, 50, 100],
    ],
    strokeFrom: 5,
    strokeTo: 0,
  },
});
Registries.vfx.add("peti-zap", {
  type: "lightning-emission",
  amount: 1,
  line: {
    lifetime: 10,
    light: 20,
    colours: [
      [255, 30, 30],
      [255, 0, 0, 50],
    ],
    strokeFrom: 2,
    strokeTo: 0,
  },
});

// hmmmmmm

// Registries.vfx.add("ui", {
//   type: "multi-effect",
//   effects: [
//     {
//       type: "particle-emission",
//       isFloor: true,
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [0, 255, 255, 20],
//           [0, 255, 255, 0],
//         ],
//       },
//     },
//     {
//       type: "particle-emission",
//       isFloor: true,
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [128, 128, 255, 20],
//           [128, 128, 255, 0]
//         ],
//       },
//     },
//     {
//       type: "particle-emission",
//       isFloor: true,
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [255, 0, 255, 20],
//           [255, 0, 255, 0]
//         ],
//       },
//     },
//     {
//       type: "particle-emission",
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [0, 255, 255, 20],
//           [0, 255, 255, 0],
//         ],
//       },
//     },
//     {
//       type: "particle-emission",
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [128, 128, 255, 20],
//           [128, 128, 255, 0]
//         ],
//       },
//     },
//     {
//       type: "particle-emission",
//       particle: {
//         shape: "rhombus",
//         lifetime: 45,
//         speed: 1,
//         decel: 0.05,
//         widthFrom: 5,
//         widthTo: 10,
//         heightFrom: 10,
//         heightTo: 20,
//         colours: [
//           [255, 0, 255, 20],
//           [255, 0, 255, 0]
//         ],
//       },
//     },
//   ],
// });
