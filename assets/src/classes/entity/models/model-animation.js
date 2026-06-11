import { constructFromType } from "../../../core/constructor.js";
import { Model } from "./model.js";

export class ModelAnimation {
  /**@type {ModelMovement[]} */
  movements = [];
  init() {
    // console.log(this);
    this.movements.forEach((v, i, a) => (a[i] = constructFromType(v, ModelMovement)));
  }
  /**@param {Model} model */
  on(model) {
    this.movements.forEach((m) => m.on(model));
  }
}
export class ModelMovement {
  part = "";
  dx = 0;
  dy = 0;
  drot = 0;
  dslide = 0;
  duration = 0;
  delay = 0;
  init() {
    this.dx /= this.duration;
    this.dy /= this.duration;
    this.drot /= this.duration;
    this.dslide /= this.duration;
  }
  /** @param {Model} model  */
  on(model) {
    model.timer.repeat(
      () =>
        model.move(
          this.part,
          this.dx,
          this.dy,
          this.drot,
          this.dslide,
        ),
      this.duration,
      1,
      this.delay,
    );
  }
}