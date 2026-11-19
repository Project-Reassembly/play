import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { Particle } from "./particle.js";

export class CMFTParticle extends Particle {
  #drawer;
  constructor(x, y, direction = 0, lifetime = 30, speed = 4, decel = 0, text = "#4-Particle", size = 20) {
    super({ lifetime, speed, decel }, x, y, direction);
    this.#drawer = CMFT.drawer(text, size).noBG();
    delete this.colours;
    delete this.colour;
  }
  draw() {
    push();
    fill(50, 150);
    rect(this.x, this.y, this.#drawer.width + 5, this.#drawer.height + 5);
    //Draw the particle
    this.#drawer.draw(this.x - this.#drawer.width * 0.5, this.y - this.#drawer.height * 0.5, col.white, col.accent, false);
    pop();
  }
}
