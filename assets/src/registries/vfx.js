Registry.vfx.add("none", {});

//Block effects

Registry.vfx.add("crafter-smoke", {
  type: "particle-emission",
  cone: 10,
  particle: {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    shape: "circle",
    colourFrom: [50, 50, 50, 100],
    colourTo: [100, 100, 100, 0],
    widthFrom: 20,
    widthTo: 30,
    heightFrom: 20,
    heightTo: 30,
    rotateSpeed: 0,
    light: 0,
  },
});
Registry.vfx.add("basic-drill-smoke", {
  type: "particle-emission",
  cone: 30,
  amount: 3,
  particle: {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    shape: "circle",
    colourFrom: [50, 50, 50, 100],
    colourTo: [100, 100, 100, 0],
    widthFrom: 5,
    widthTo: 7,
    heightFrom: 5,
    heightTo: 7,
    rotateSpeed: 0,
    light: 0,
  },
});
Registry.vfx.add("smelter-sparks", {
  type: "particle-emission",
  amount: 4,
  cone: 360,
  particle: {
    lifetime: 30,
    speed: 3,
    decel: 0.075,
    colourFrom: [255, 255, 100],
    colourTo: [255, 0, 0, 0],
    widthFrom: 2,
    widthTo: 0,
    heightFrom: 8,
    heightTo: 8,
    shape: "rect",
  },
});
Registry.vfx.add("crafter-craft", {
  type: "wave-emission",
  particle: {
    lifetime: 20,
    fromRadius: 0,
    toRadius: 60,
    colourFrom: [255, 200, 0, 255],
    colourTo: [255, 150, 0, 0],
    strokeFrom: 10,
    strokeTo: 0,
  },
});

//Explosions

Registry.vfx.add("explosion", {
  type: "explosion",
});
Registry.vfx.add("laser-caster-explosion", {
  type: "explosion",
  radius: 20,
  waveColour: [100, 255, 255, 100],
  sparkColour: [200, 255, 255],
  sparkColourTo: [0, 200, 255],
  smoke: false,
});

//Firing effects

Registry.vfx.add("shoot", {
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
        colourFrom: [50, 50, 50, 100],
        colourTo: [100, 100, 100, 0],
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
        direction: -Math.PI / 2,
        shape: "moved-triangle",
        colourFrom: [255, 255, 255],
        colourTo: [255, 230, 175, 0],
        widthFrom: 25,
        widthTo: 20,
        heightFrom: 8,
        heightTo: 0,
        rotateSpeed: 0,
        light: 15,
      },
    },
  ],
});

Registry.vfx.add("laser-caster-frag", {
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
    colourFrom: [255, 255, 255],
    colourTo: [0, 255, 255, 0],
  },
});

//Nuclear

Registry.vfx.add("nuke", {
  type: "nuclear-explosion",
});

//Fire

Registry.vfx.add("fire", {
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
    colourFrom: [255, 255, 100],
    colourTo: [255, 0, 0, 0],
    rotateSpeed: 0.2,
  },
});
Registry.vfx.add("laser-caster-fire", {
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
    colourFrom: [100, 255, 255],
    colourTo: [0, 0, 255, 0],
    rotateSpeed: 0.2,
  },
});

//Status

Registry.vfx.add("burning", {
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
    colourFrom: [255, 255, 100],
    colourTo: [255, 0, 0, 0],
    rotateSpeed: 0.2,
  },
});
Registry.vfx.add("plasma-burn", {
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
    colourFrom: [100, 255, 255],
    colourTo: [0, 0, 255, 0],
    rotateSpeed: 0.2,
  },
});

//Charge

Registry.vfx.add("laser-caster-charge", {
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
    colourFrom: [0, 255, 255, 0],
    colourTo: [255, 255, 255],
  },
});
Registry.vfx.add("energy-repeater-charge", {
  type: "wave-emission",
  particle: {
    lifetime: 20,
    radiusFrom: 15,
    radiusTo: 0,
    strokeFrom: 2,
    strokeTo: 5,
    colourFrom: [0, 255, 255, 0],
    colourTo: [255, 255, 255],
  },
});
