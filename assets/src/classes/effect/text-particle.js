import { col } from "../../core/color.js";
import { fonts } from "../../play/game.js";
import { Particle } from "./particle.js";

/**
 * @typedef {{
 *   lifetime: number,
 *   direction: number,
 *   speed: number,
 *   decel: number,
 *   rotateSpeed: number,
 *   light: number,
 *   colours: import("../../core/color.js").color[],
 *   text: string,
 *   useOCR: boolean,
 *   sizeFrom: number,
 *   sizeTo: number,
 *   space: boolean,
 * }} TextParticleModel
 */

/** A particle which can display static text. @extends {Particle<TextParticleModel>}*/
export class TextParticle extends Particle {
  /**
   *
   * @param {TextParticleModel} vfx
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   */
  constructor(vfx, x, y, direction) {
    super(vfx, x, y, direction);
    this.color = vfx.colours[0];
    this.size = vfx.sizeFrom;
  }
  istep(dt) {
    const lf = this.lifetime / this.vfx.lifetime;
    this.size = this.vfx.sizeFrom * lf + this.vfx.sizeTo * (1 - lf);

    this.color = col.interp(this.vfx.colours, 1 - lf);
  }
  draw() {
    push();
    col.fill(this.color);
    noStroke();

    textAlign(CENTER, CENTER);
    translate(this.x, this.y);
    textSize(this.size);
    textFont(this.vfx.useOCR ? fonts.ocr : fonts.darktech);
    text(this.vfx.text, 0, 0);
    pop();
  }
}
/** A particle which can display any dynamic text. @extends {Particle<TextParticleModel>}*/
export class InstancedTextParticle extends TextParticle {
  /**
   *
   * @param {TextParticleModel} vfx
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   * @param {string} text
   */
  constructor(vfx, x, y, direction, text) {
    super(vfx, x, y, direction);
    this.text = String(text);
  }
  draw() {
    push();
    col.fill(this.color);
    noStroke();

    textAlign(CENTER, CENTER);
    translate(this.x, this.y);
    textSize(this.size);
    textFont(this.vfx.useOCR ? fonts.ocr : fonts.darktech);
    text(this.text, 0, 0);
    pop();
  }
}

export function legacyTextParticle(x, y, direction, lifetime, speed, decel, text, colours, sizeFrom, sizeTo, rotateSpeed, useOCR = false, space = false) {
  return new InstancedTextParticle({ lifetime, speed, decel, colours, sizeFrom, sizeTo, rotateSpeed, useOCR, space }, x, y, direction, text);
}
