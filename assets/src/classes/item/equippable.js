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
    this.component = construct(this.component, "component");
    this.component.tickListeners.push(this);
  }
  /** @param {Entity} holder The entity holding this item */
  tick(holder) {}
  /** @param {Entity} holder The entity using this item */
  use(holder, isSecondary = false) {}
}
