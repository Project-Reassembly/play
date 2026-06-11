import { Vector } from "../../../core/number.js";

export class Orientation {
  static ZERO = new Orientation(0, 0, 0, 0);
  x;
  y;
  rotation;
  slide;
  get pos() {
    return new Vector(this.x, this.y);
  }
  set pos(_) {
    this.x = _.x;
    this.y = _.y;
  }
  constructor(x = 0, y = 0, rot = 0, slide = 0) {
    this.x = x;
    this.y = y;
    this.rotation = rot;
    this.slide = slide;
  }
  addParts(x = 0, y = 0, rot = 0, slide = 0) {
    return new Orientation(this.x + x, this.y + y, this.rotation + rot, this.slide + slide);
  }
  clone() {
    return new Orientation(this.x, this.y, this.rotation, this.slide);
  }
  /**@param {Orientation} orientation  */
  add(orientation) {
    return this.addParts(orientation.x, orientation.y, orientation.rotation, orientation.slide);
  }
  rotate(angle) {
    let p = this.pos.rotate(angle);
    return new Orientation(p.x, p.y, this.rotation + angle, this.slide);
  }
}