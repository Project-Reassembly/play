import { ui } from "../../core/ui.js";
/** @typedef {{lifetime: number, speed: number, rotateSpeed: number, decel: number, space: boolean}} BaseParticleModel */

/** @template {BaseParticleModel} T */
class Particle {
  rotoff = 0;
  /**
   * @param {T} vfx
   * @param {*} x
   * @param {*} y
   * @param {*} direction
   */
  constructor(vfx, x, y, direction = 0) {
    this.vfx = vfx;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = vfx.speed ?? 0;
    this.rotateSpeed = vfx.rotateSpeed ?? 0;
    this.lifetime = vfx.lifetime ?? 30;
  }
  istep(dt) {
    return;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      //Interpolate size
      this.istep(dt);

      if (this.speed) {
        //Decelerate
        if (this.speed >= this.vfx.decel) {
          this.speed -= this.vfx.decel * dt;
        } else {
          this.speed = 0;
        }

        //rotations
        if (this.rotateSpeed > 0) {
          if (this.rotateSpeed >= this.vfx.decel) {
            this.rotateSpeed -= this.vfx.decel * dt;
          } else {
            this.rotateSpeed = 0;
          }
        } else if (this.rotateSpeed < 0) {
          if (this.rotateSpeed <= -this.vfx.decel) {
            this.rotateSpeed += this.vfx.decel * dt;
          } else {
            this.rotateSpeed = 0;
          }
        }

        // Movement
        this.x += Math.cos(this.direction) * this.speed * dt;
        this.y += Math.sin(this.direction) * this.speed * dt;
        if (this.rotateSpeed) {
          this.rotoff += this.rotateSpeed * dt;
        }
      }

      //Lifetime
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  draw() {}
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
}
export { Particle };

