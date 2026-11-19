import { LightningParticle } from "../classes/effect/lightning-particle.js";
import { LinearParticle } from "../classes/effect/linear-particle.js";
import { col } from "../core/color.js";
import { construct } from "../core/constructor.js";
import { rnd } from "../core/number.js";
import { RegisteredItem } from "../core/registered-item.js";
import { effectTimer, repeat } from "./effects.js";

// Different enough to not extend
class LinearEffect extends RegisteredItem {
  create(world, positions = [], impact = false) {}
  execute(world, positions = [], pos = () => [], impact = false) {
    if (this.parentise) this.create(world, pos(), impact);
    else this.create(world, positions, impact);
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
  execute(world, positions = [], pos = () => [], impact = false) {
    let fn = () => {
      let xo = rnd.float(this.maxXOffset, -this.maxXOffset);
      let yo = rnd.float(this.maxYOffset, -this.maxYOffset);
      this.create(
        world,
        positions.map(v => v.addXY(xo, yo)),
        impact,
      );
    };

    if (this.parentise) {
      fn = () => {
        let p = pos();
        let xo = rnd.float(this.maxXOffset, -this.maxXOffset);
        let yo = rnd.float(this.maxYOffset, -this.maxYOffset);
        this.create(
          world,
          p.map(v => v.addXY(xo, yo)),
          impact,
        );
      };
    }
    if (this.emissions > 1) effectTimer.repeat(fn, this.emissions, this.interval, this.delay);
    else effectTimer.do(fn, this.delay);
  }
  getParticleArray(world, impact) {
    return (
      impact ? world.impactParticles
      : this.isFloor ? world.floorParticles
      : world.particles
    );
  }
}
/**A container for many effects at once. */
class LinearMultiEffect extends LinearEffect {
  /**@type {LinearEffect[]} */
  effects = [];
  init() {
    this.effects = this.effects.map(x => construct(x, "linear-effect"));
  }
  execute(world, positions = [], pos = () => [], impact = false) {
    this.effects.forEach(z => z.execute(world, positions, pos, impact));
  }
}
class LineEmissionEffect extends LinearEmissionEffect {
  /** @type {import("../classes/effect/linear-particle.js").LinearParticleModel} */
  line = {
    lifetime: 60,
    light: 0,
    colours: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    strokeFrom: 10,
    strokeTo: 0,
  };
  init() {
    this.line.colours = (this.line.colours ?? []).map(col.convert);
  }
  create(world, positions = [], impact = false) {
    repeat(this.amount, () => {
      this.getParticleArray(world, impact).push(
        new LinearParticle(
          this.line,
          positions
        ),
      );
    });
  }
}
class LightningEmissionEffect extends LinearEmissionEffect {
  /** @type {import("../classes/effect/lightning-particle.js").LightningParticleModel} */
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
    lineLength: 3,
    deviation: 20,
  };
  init() {
    this.line.colours = (this.line.colours ?? []).map(col.convert);
  }
  create(world, positions = [], impact = false) {
    repeat(this.amount, () => {
      this.getParticleArray(world, impact).push(
        new LightningParticle(
          this.line,
          positions
        ),
      );
    });
  }
}

export { LightningEmissionEffect, LinearEffect, LinearEmissionEffect, LinearMultiEffect, LineEmissionEffect };

