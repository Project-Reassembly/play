//Part of an entity.
class Component {
  shape = "circle";
  fill = "red";
  image = "error";
  width = 100;
  height = 100;
  rotation = 0;
  xOffset = 0;
  yOffset = 0;
  /** A list of tickables that listen to this component's tick() event. */
  tickListeners = [];
  /**
   * Returns the position of this component, as if it were on an entity.
   * @param {Entity} entity
   */
  getPosOn(entity) {
    let mirrored = false;
    if (entity instanceof EquippedEntity) {
      if (entity.leftHand.get(0)?.getItem()?.component === this)
        mirrored = true;
    }
    return this.getPosFrom(entity.x, entity.y, entity.direction, mirrored);
  }
  getPosFrom(x, y, direction, mirrored = false) {
    let facing = radians(direction + this.rotation * (mirrored ? -1 : 1));
    return {
      x:
        x +
        this.xOffset * Math.cos(facing) -
        this.yOffset * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        this.xOffset * Math.sin(facing) +
        this.yOffset * Math.cos(facing) * (mirrored ? -1 : 1),
      direction: facing,
    };
  }
  draw(x, y, direction, mirrored = false) {
    let pos = this.getPosFrom(x, y, direction, mirrored);
    if (this.image) {
      rotatedImg(
        this.image,
        pos.x,
        pos.y,
        this.width,
        this.height,
        pos.direction,
        mirrored
      );
    } else {
      //If no image, draw shape instead
      rotatedShape(
        this.shape,
        pos.x,
        pos.y,
        this.width,
        this.height,
        pos.direction,
        mirrored
      );
    }
  }
  tick() {
    this.tickListeners.forEach((element) => {
      element.tick();
    });
  }
}
