import { construct } from "../../core/constructor.js";
import { Vector } from "../../core/number.js";
import { createLinearEffect } from "../../play/effects.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { WaveParticle } from "../effect/wave-particle.js";
import { Bullet } from "./bullet.js";
class PointBullet extends Bullet {
  lifetime = 1;
  #moved = false; //If the bullet has teleported to the target entity or not.
  hitColours = [[255, 255, 0]];
  lineEffect = "snipe-trail";
  init() {
    this.speed = 0; //Remove speed
    if (this.hitColours.length === 1) {
      this.hitColours[1] = this.hitColours[0].slice(0); //Copy colour
      this.hitColours[1][3] = 0; //Add alpha
    }
  }
  step(dt) {
    //Move if not already done so
    if (!this.#moved) {
      this.#moved = true;
      if (this.entity) {
        //If a target exists
        if (this.entity.target) {
          let range = this.entity.pos.sub(
            new Vector(this.entity.target.x, this.entity.target.y)
          ).magnitude;
          //find end pos
          let epos = new Vector(this.x, this.y).add(Vector.fromAngle(this.direction).scale(range))
          let tx = epos.x;
          let ty = epos.y;
          //Create line to it
          this.createTrailTo(tx, ty);
          //Teleport to it
          this.x = tx;
          this.y = ty;
          this.createHitEffect();
        } else {
          //Delete self
          this.remove = true;
          return;
        }
      }
    }
    super.step(dt);
  }
  draw() {} //Totally invisible
  createTrailTo(x, y) {
    createLinearEffect(this.lineEffect, this.world, this.x, this.y, x, y);
    // let distance = dist(this.x, this.y, x, y);
    // this.world.particles.push(
    //   new ShapeParticle(
    //     //Find halfway point
    //     (this.x + x) / 2,
    //     (this.y + y) / 2,
    //     this.directionRad,
    //     30,
    //     0,
    //     0,
    //     "rect",
    //     this.hitColours,
    //     this.hitSize,
    //     this.hitSize,
    //     distance,
    //     distance,
    //     0,
    //     true
    //   )
    // );
  }
  createHitEffect() {
    if (this.hitEffect) this.emit(this.hitEffect);
    else {
      let direction = rnd(0, 360); //Random direction
      this.world.particles.push(
        //Create hit effect
        new ShapeParticle(
          this.x,
          this.y,
          radians(direction),
          30,
          0,
          0,
          "rhombus",
          this.hitColours,
          this.hitSize * 5,
          0,
          0,
          this.hitSize * 40,
          0,
          true
        ),
        new ShapeParticle(
          this.x,
          this.y,
          radians(direction + 90),
          30,
          0,
          0,
          "rhombus",
          this.hitColours,
          this.hitSize * 5,
          0,
          0,
          this.hitSize * 25,
          0,
          true
        ),
        new WaveParticle(
          this.x,
          this.y,
          30,
          0,
          this.hitSize * 20,
          this.hitColours,
          0,
          this.hitSize * 3,
          true
        )
      );
    }
  }
}
export { PointBullet };
