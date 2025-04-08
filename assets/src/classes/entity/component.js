//Part of an entity.
class Component extends RegisteredItem {
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
  tick(entity) {
    this.tickListeners.forEach((element) => {
      element.tick();
    });
  }
}

class LegComponent extends Component {
  cycleLength = 6;
  stepMagnitude = 2;
  _cycleAmount = 0;
  getPosFrom(x, y, direction, mirrored = false) {
    let facing = radians(direction + this.rotation * (mirrored ? -1 : 1));
    let offset =
      Math.sin(this._cycleAmount / (this.cycleLength * PI)) *
      (mirrored ? -1 : 1);
    return {
      x:
        x +
        (this.xOffset + this.stepMagnitude * offset) * Math.cos(facing) -
        this.yOffset * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        (this.xOffset + this.stepMagnitude * offset) * Math.sin(facing) +
        this.yOffset * Math.cos(facing) * (mirrored ? -1 : 1),
      direction: facing,
    };
  }
  /**@param {Entity} entity*/
  tick(entity) {
    super.tick(entity);
    this._cycleAmount += entity.computedSpeed;
  }
}
class WeaponComponent extends Component {
  recoil = 0;
  rotationalRecoil = 0;
  recoilSpeed = 1;
  _recoiled = 0;
  _rotRecoiled = 0;
  getPosFrom(x, y, direction, mirrored = false) {
    let facing = radians(
      direction + (this.rotation + this._rotRecoiled) * (mirrored ? -1 : 1)
    );
    return {
      x:
        x +
        (this.xOffset - this._recoiled) * Math.cos(facing) -
        this.yOffset * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        (this.xOffset - this._recoiled) * Math.sin(facing) +
        this.yOffset * Math.cos(facing) * (mirrored ? -1 : 1),
      direction: facing,
    };
  }
  trigger(recoilFactor = 1, rotationalRecoilFactor = 1) {
    this._recoiled = this.recoil * recoilFactor;
    this._rotRecoiled = this.rotationalRecoil * rotationalRecoilFactor;
  }
  tick(entity) {
    super.tick(entity);
    if (this._recoiled >= this.recoilSpeed) {
      this._recoiled -= this.recoilSpeed;
    }
    if (this._rotRecoiled >= this.recoilSpeed) {
      this._rotRecoiled -= this.recoilSpeed;
    }
  }
}
