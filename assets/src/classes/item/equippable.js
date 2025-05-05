import { construct } from "../../core/constructor.js";
import { Item } from "./item.js";
class Equippable extends Item {
  //Shown offsets
  posX = 0;
  posY = 0;
  /** @type {Component} */
  component = null;
  stackSize = 1;
  /** (extra) Rotation in degrees */
  get rotation() {
    if (!this.component) return 0;
    return this.component.rotation;
  }
  get rotationRadians() {
    if (!this.component) return 0;
    return this.component.rotationRadians;
  }
  init() {
    super.init();
    this.component = construct(this.component, "component");
  }
  /** @param {Entity} holder The entity holding this item */
  tick(holder) {
    this.component?.tick(holder);
  }
  /** @param {Entity} holder The entity using this item */
  use(holder, isSecondary = false) {}
}
export { Equippable };
