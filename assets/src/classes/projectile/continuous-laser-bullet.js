import { LaserBullet } from "./laser-bullet.js";
class ContinuousLaserBullet extends LaserBullet {
  //Uses mostly the same functionality, really.
  step(dt) {
    super.step(dt);
    this.damaged = [];
    this.pierce = this.maxPierce;
    this.canHurt = true;
  }
}
export { ContinuousLaserBullet };
