import { LightningParticle } from "../classes/effect/lightning-particle.js";
import { LinearParticle } from "../classes/effect/linear-particle.js";
import { construct } from "../core/constructor.js";
import { rnd } from "../core/number.js";
import { RegisteredItem } from "../core/registered-item.js";
import { effectTimer, repeat, VisualEffect } from "./effects.js";

// Different enough to not extend
class LinearEffect extends RegisteredItem {
  create(world, x1 = 0, y1 = 0, x2 = 0, y2 = 1, impact = false) {}
  execute(
    world,
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0,
    pos = () => ({ x1: 0, y1: 0, x2: 0, y2: 0 }),
    impact = false
  ) {
    if (this.parentise) {
      let p = pos();
      this.create(world, p.x1, p.y1, p.x2, p.y2, impact);
    } else this.create(world, x1, y1, x2, y2, impact);
  }
}

/**Extended class for repeated creation of a linear effect */
class LinearEmissionEffect extends LinearEffect {
  emissions = 1;
  interval = 0;
  amount = 1;
  delay = 0;
  maxXOffset = 0;
  maxYOffset = 0;
  isFloor = false;
  execute(
    world,
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0,
    pos = () => ({ x1: x1, y1: y1, x2: x2, y2: y2 }),
    impact = false
  ) {
    let fn = () => {
      let xo = rnd(this.maxXOffset, -this.maxXOffset);
      let yo = rnd(this.maxYOffset, -this.maxYOffset);
      this.create(world, x1 + xo, y1 + yo, x2 + xo, y2 + yo, impact);
    };

    if (this.parentise) {
      fn = () => {
        let p = pos();
        let xo = rnd(this.maxXOffset, -this.maxXOffset);
        let yo = rnd(this.maxYOffset, -this.maxYOffset);
        this.create(world, p.x1 + xo, p.y1 + yo, p.x2 + xo, p.y2 + yo, impact);
      };
    }
    if (this.emissions > 1)
      effectTimer.repeat(fn, this.emissions, this.interval, this.delay);
    else effectTimer.do(fn, this.delay);
  }
  getParticleArray(world, impact) {
    return impact
      ? world.impactParticles
      : this.isFloor
      ? world.floorParticles
      : world.particles;
  }
}
/**A container for many effects at once. */
class LinearMultiEffect extends LinearEffect {
  /**@type {LinearEffect[]} */
  effects = [];
  init() {
    this.effects = this.effects.map((x) => construct(x, "linear-effect"));
  }
  execute(
    world,
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0,
    pos = () => ({ x1: x1, y1: y1, x2: x2, y2: y2 }),
    impact = false
  ) {
    this.effects.forEach((z) => z.execute(world, x1, y1, x2, y2, pos, impact));
  }
}
class LineEmissionEffect extends LinearEmissionEffect {
  //Contains properties for image and text particles too
  line = {
    //All
    lifetime: 60,
    light: 0,
    colours: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    strokeFrom: 10,
    strokeTo: 0,
  };
  create(world, x1 = 0, y1 = 0, x2 = 0, y2 = 0, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new LinearParticle(
          x1,
          y1,
          x2,
          y2,
          this.line.lifetime ?? 20,
          this.line.colours,
          this.line.light ?? 0,
          this.line.strokeFrom ?? 10,
          this.line.strokeTo ?? 0
        )
      )
    );
  }
}
class LightningEmissionEffect extends LinearEmissionEffect {
  //Contains properties for image and text particles too
  line = {
    //All
    lifetime: 60,
    light: 0,
    colours: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    strokeFrom: 10,
    strokeTo: 0,
    lineLength: 60,
    deviation: 20,
    glowEffect: 0
  };
  create(world, x1 = 0, y1 = 0, x2 = 0, y2 = 0, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new LightningParticle(
          x1,
          y1,
          x2,
          y2,
          this.line.lifetime ?? 20,
          this.line.colours,
          this.line.light ?? 0,
          this.line.strokeFrom ?? 10,
          this.line.strokeTo ?? 0,
          this.line.deviation ?? 20,
          this.line.lineLength ?? 60,
          this.line.glowEffect ?? 1
        )
      )
    );
  }
}

export {
  LinearEmissionEffect,
  LinearEffect,
  LinearMultiEffect,
  LineEmissionEffect,
  LightningEmissionEffect,
};
