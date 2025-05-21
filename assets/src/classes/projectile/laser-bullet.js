import { Vector } from "../../core/number.js";
import { PhysicalObject } from "../physical.js";
import { Bullet } from "./bullet.js";
class LaserBullet extends Bullet {
  //Length of the beam. Replaces speed.
  length = 0;
  #lengthFraction = 0; //Fraction of length the beam is currently at.
  #widthFraction = 1;
  extendTime = -1; //Time taken to get to full length
  despawnTime = -1; //Time taken to disappear fully
  init() {
    super.init();
    if (this.extendTime === -1) this.extendTime = this.maxLife * 0.2;
    if (this.despawnTime === -1) this.despawnTime = this.maxLife * 0.4;
  }
  step(dt) {
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      if (this.lifetime >= this.maxLife - this.extendTime) {
        //If spawning
        this.#lengthFraction += dt / this.extendTime; //Slowly turn to one
      }
      if (this.lifetime <= this.despawnTime) {
        //If despawning
        this.#widthFraction -= dt / this.despawnTime; //Slowly turn to zero
      }
      // Don't move
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
    }
  }
  draw() {
    if (this.drawer.hidden) return;
    push();
    //Width is useless, as it is replaced by length, and height is useless as it is replaced by hitsize
    let drawnLength = this.length * this.#lengthFraction;
    let drawnWidth = this.hitSize * 2 * this.#widthFraction;
    //Trigonometry to find offset x and y
    let offset = {
      x: (Math.cos(this.directionRad) * drawnLength) / 2,
      y: (Math.sin(this.directionRad) * drawnLength) / 2,
    };
    if (this.drawer.image) {
      rotatedImg(
        this.drawer.image,
        this.x + offset.x, //Sort of centre the laser
        this.y + offset.y,
        drawnLength,
        drawnWidth,
        this.directionRad
      );
    } else {
      //Get that laser-y look
      stroke(this.drawer.fill);
      fill(255);
      strokeWeight(drawnWidth / 3);
      rotatedShape(
        this.drawer.shape,
        this.x + offset.x,
        this.y + offset.y,
        drawnLength,
        drawnWidth,
        this.directionRad
      );
      pop();
    }
  }
  /**
   * 
   * @param {PhysicalObject} obj 
   * @returns 
   */
  collidesWith(obj) {
    let currentLength = this.length * this.#lengthFraction;
    let currentHitSize = this.hitSize * this.#widthFraction;
    if (currentHitSize <= 0) return false; //Catch problem where hitsize = 0 causes infinite loop
    let offset = Vector.fromAngle(this.direction);
    //Try every hitsize px along current length
    for (let factor = 0; factor < currentLength; factor += currentHitSize) {
      //Return true if hitting the object
      if (
        dist(
          this.x + offset.x * factor, //Resolve and multiply
          this.y + offset.y * factor, //Resolve and multiply part 2
          obj.x,
          obj.y
        ) <=
        currentHitSize + obj.size
      )
        return true;
    }
    //If every check failed, return false
    return false;
  }
}
export { LaserBullet };
