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

//Nuclear

Registries.vfx.add("nuke", {
  type: "nuclear-explosion",
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
    rotateSpeed: 0.2,
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
