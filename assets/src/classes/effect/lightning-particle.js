import { rnd, tru, Vector } from "../../core/number.js";
import { LinearParticle } from "./linear-particle.js";

class LightningParticle extends LinearParticle {
  /**@type {Vector[]} */
  points = [];
  constructor(
    x1,
    y1,
    x2,
    y2,
    lifetime,
    colours,
    light,
    strokeFrom,
    strokeTo,
    deviation,
    lineLength,
    glowEffect = 1
  ) {
    super(x1, y1, x2, y2, lifetime, colours, light, strokeFrom, strokeTo);

    //Generate points
    let direction = this.pos2.sub(this.pos1);
    let iterations = Math.floor((this.size * 2) / lineLength);
    let change = direction.scale(1 / iterations);
    let pvec = Vector.fromAngle(direction.angle + 90);

    this.points.push(this.pos1);
    for (let devCount = 1; devCount < iterations; devCount++) {
      let here = this.pos1.add(change.scale(devCount));
      this.points.push(here.add(pvec.scale(deviation * rnd(1, -1))));
    }

    this.points.push(this.pos2);
    console.log(this.points);

    this.glowEffect = glowEffect;
  }
  actualDraw() {
    let ir = this.stroke;
    for (let rf = 1; rf > 0; rf -= 1 / this.glowEffect) {
      strokeWeight(ir * rf);
      
      beginShape();
      this.points.forEach((p) => {
        vertex(p.x, p.y);
      });
      endShape();
    }
  }
}

export { LightningParticle };
