import { Bullet } from "./bullet.js";
import { game } from "../../play/game.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ShapeParticle } from "../effect/shape-particle.js";
class Missile extends Bullet {
  target = null;
  trailColour = [255, 255, 100];
  trailColourTo = [255, 0, 0];
  flameLength = 200;
  trail = true;
  trailInterval = -1;
  turnSpeed = 1;
  targetType = "mouse"; //"nearest", "mouse", "hovered"
  trackingRange = 200;
  init() {
    super.init();
    if (this.targetType !== "nearest") this.controlled = true;
  }
  spawnTrail(dt) {
    //Visual fire effect
    for (let e = 0; e < this.speed * dt; e++) {
      if (this._trailCounter <= 0) {
        if (this.world?.particles != null && this.trail) {
          if (this.trailEffect === "default") {
            let trailparticle = new ShapeParticle(
              this.x - e * p5.Vector.fromAngle(this.directionRad).x,
              this.y - e * p5.Vector.fromAngle(this.directionRad).y,
              this.directionRad,
              this.flameLength / this.speed, //Fixed life
              0,
              0,
              this.trailShape, //flames
              this.trailColours,
              this.trailWidth || this.hitSize * 1.9,
              0,
              this.trailWidth || this.hitSize * 1.9,
              0,
              0
            );

            trailparticle.light = this.trailLight;
            this.world.particles.push(trailparticle);
          } else this.emit(this.trailEffect);
        }
        this._trailCounter =
          this.trailInterval === -1
            ? this.speed / this.hitSize
            : this.trailInterval;
      } else {
        this._trailCounter--;
      }
    }
  }
  step(dt) {
    super.step(dt);
    if (
      this.target &&
      !this.target.dead &&
      !this.target.remove &&
      this.distanceTo(this.target) < this.trackingRange
    ) {
      //If target still there
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
    let selected = null;
    if (this.targetType === "nearest") {
      //Closest to bullet
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (
            !(entity instanceof DroppedItemStack) &&
            entity.team !== this.entity.team &&
            !entity.dead &&
            entity.visible &&
            !this.damaged.includes(entity)
          ) {
            let dist = this.distanceTo(entity);
            if (dist < this.trackingRange && dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "hovered") {
      //Closest to mouse pointer
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        selected =
          this.distanceToPoint(game.mouse.x, game.mouse.y) < this.trackingRange
            ? game.mouse
            : null;
        for (let entity of this.world.entities) {
          if (
            !(entity instanceof DroppedItemStack) &&
            entity.team !== this.entity.team &&
            !entity.dead
          ) {
            //Only select living entities
            let dist = entity.distanceToPoint(game.mouse.x, game.mouse.y);
            if (dist < this.trackingRange && dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "mouse") {
      //Closest to mouse pointer
      if (this.distanceToPoint(game.mouse.x, game.mouse.y) < this.trackingRange)
        selected = game.mouse;
    }
    this.target = selected;
  }
}
export { Missile };
