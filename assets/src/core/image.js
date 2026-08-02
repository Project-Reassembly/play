import { col } from "./color.js";
import { Registries } from "./registry.js";

export class ImageContainer {
  #image;
  #color;
  #path;
  constructor(path) {
    this.#path = path;
    this.#image = null;
  }
  update(image) {
    this.#image = image;
  }
  async load() {
    try {
      this.#image = await loadImage(this.#path);
      this.#color = this.getColor();
      return true;
    } catch {
      return false;
    }
  }
  getColor() {
    const i = this.#image;
    i.loadPixels();
    const pixelElementCount = i.pixels.length,
      totalpix = pixelElementCount * 0.25;
    let reds = 0,
      greens = 0,
      blues = 0,
      totalAlpha = 0,
      pixels = 0;
    for (let pixi = 0; pixi < pixelElementCount; pixi += 4) {
      const alpha = i.pixels[pixi + 3];
      if (alpha > 0) {
        reds += i.pixels[pixi] * alpha;
        greens += i.pixels[pixi + 1] * alpha;
        blues += i.pixels[pixi + 2] * alpha;
        totalAlpha += alpha;
        pixels++;
      }
    }
    i.pixels = null;
    // console.log(
    //   `${this.#path} has ${totalpix} pixels (${pixels} visible), ${totalAlpha} total alpha out of ${totalpix*255} max - ${totalAlpha/totalpix} average`,
    // );
    const maxcol = pixels * 255;
    return col.from(reds / maxcol, greens / maxcol, blues / maxcol, totalAlpha / totalpix);
  }
  get image() {
    return this.#image;
  }
  /**@type {import("./color.js").color} */
  get color() {
    return this.#color;
  }
  draw(x, y, width, height, angle = 0, flipV = false) {
    if (!this.#image) return; //Cancel if no image loaded yet
    if (angle === 0 && !flipV) image(this.#image, x, y, width, height);
    else {
      push(); //Save current position, rotation, etc
      translate(x, y); //Move middle to 0,0
      rotate(angle);
      if (flipV) scale(1, -1);
      image(this.#image, 0, 0, width, height);
      pop(); //Return to old state
    }
  }
  drawCol(x, y, width, height, angle = 0) {
    if (!this.#color) return; //Cancel if no color loaded yet
    push(); //Save current position, rotation, color, etc
    noStroke();
    col.fill(this.#color);
    if (angle !== 0) rect(x, y, width, height);
    else {
      translate(x, y); //Move middle to 0,0
      rotate(angle);
      rect(0, 0, width, height);
    }
    pop(); //Return to old state
  }
  /**
   * Draws an image container or string.
   * @param {ImageContainer|string} img Image to draw.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} angle Angle to draw the image at, in radians.
   * @param {boolean} flipV Whether or not to flip the image vertically.
   */
  static draw(img, x, y, width, height, angle = 0, flipV = false) {
    const loaded = img instanceof this ? img : Registries.images.tryGet(img);
    noSmooth();
    if (loaded instanceof this) {
      loaded.draw(x, y, width, height, angle, flipV);
    } else if (!loaded) {
      //Replace with a 'missing texture' image
      const i = Registries.images.tryGet("error")?.image;
      if (i) image(i, x, y, width, height);
    } else {
      //Try to draw it directly if not
      try {
        image(loaded, x, y, width, height);
      } catch (error) {
        //Replace with a working image, if possible
        const i = Registries.images.tryGet("error")?.image;
        if (i) image(i, x, y, width, height);
      }
    }
  }
}
