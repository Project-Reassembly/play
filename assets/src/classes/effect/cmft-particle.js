import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { Particle } from "./particle.js";

export class CMFTParticle extends Particle {
  #drawer;
  constructor(
    x,
    y,
    direction = 0,
    lifetime = 30,
    speed = 4,
    decel = 0,
    text = "#4-Particle",
    size = 20,
  ) {
    super(x, y, direction, lifetime, speed, decel, [], 0, 0, false);
    this.#drawer = CMFT.drawer(text, size).noBG();
    delete this.colours;
    delete this.colour;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      this.calcDecels(dt);

      this.movement(dt);
      //Lifetime
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcDecels(dt) {
    //Decelerate
    if (this.speed >= this.decel) this.speed -= this.decel * dt;
    else this.speed = 0;
  }
  draw(g) {
    if (g) {
      console.warn("CMFT particles do not support sub-canvas drawing");
      return;
    }
    fill(50, 150);
    rect(this.x, this.y, this.#drawer.width+5, this.#drawer.height+5);
    //Draw the particle
    this.#drawer.draw(
      this.x - this.#drawer.width * 0.5,
      this.y - this.#drawer.height * 0.5,
      col.white,
      col.accent,false
    );
  }
}

