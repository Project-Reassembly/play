import { construct } from "../../core/constructor.js";
import { Vector } from "../../core/number.js";
import { RegisteredItem } from "../../core/registered-item.js";
import { Registries } from "../../core/registry.js";
import { rotatedImg } from "../../core/ui.js";
import { EquippedEntity } from "../entity/inventory-entity.js";
import { Weapon } from "../item/weapon.js";
import { ShootableObject } from "../physical.js";
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
  postRot = 0;
  init() {}
  /**
   * Returns the position of this component, as if it were on an entity.
   * @param {Entity} entity
   */
  getPosOn(entity) {
    let mirrored = false;
    let xoff = 0,
      yoff = 0;
    if (entity instanceof EquippedEntity) {
      if (entity.leftHand.get(0)?.getItem()?.component === this)
        mirrored = true;
      xoff = entity.armType.xOffset;
      yoff = entity.armType.yOffset;
    }
    return this.getPosFrom(
      entity.x,
      entity.y,
      entity.direction,
      mirrored,
      xoff,
      yoff
    );
  }
  getPosFrom(x, y, direction, mirrored = false, xoff = 0, yoff = 0) {
    let facing = radians(direction + this.rotation * (mirrored ? -1 : 1));
    return {
      x:
        x +
        (this.xOffset + xoff) * Math.cos(facing) -
        (this.yOffset + yoff) * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        (this.xOffset + xoff) * Math.sin(facing) +
        (this.yOffset + yoff) * Math.cos(facing) * (mirrored ? -1 : 1),
      direction: facing + this.postRot,
    };
  }
  draw(x, y, direction, mirrored = false, xoff = 0, yoff = 0) {
    let pos = this.getPosFrom(x, y, direction, mirrored, xoff, yoff);
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
  tick(entity) {}
  serialise() {
    return {
      type: "component",
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      image: this.image,
      fill: this.fill,
    };
  }
  static deserialise(created) {
    let comp = new this();
    comp.xOffset = created.xOffset ?? 0;
    comp.yOffset = created.yOffset ?? 0;
    comp.width = created.width ?? 10;
    comp.height = created.height ?? 10;
    comp.rotation = created.rotation ?? 0;
    comp.fill = created.fill ?? "red";
    comp.image = created.image ?? "error";
    comp.init();
    return comp;
  }
}

class LegComponent extends Component {
  cycleLength = 6;
  stepMagnitude = 2;
  _cycleAmount = 0;
  getPosFrom(x, y, direction, mirrored = false, xoff = 0, yoff = 0) {
    let facing = radians(direction + this.rotation * (mirrored ? -1 : 1));
    let offset =
      Math.sin(this._cycleAmount / (this.cycleLength * PI)) *
      (mirrored ? -1 : 1);
    return {
      x:
        x +
        (this.xOffset + this.stepMagnitude * offset + xoff) * Math.cos(facing) -
        (this.yOffset + yoff) * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        (this.xOffset + this.stepMagnitude * offset + xoff) * Math.sin(facing) +
        (this.yOffset + yoff) * Math.cos(facing) * (mirrored ? -1 : 1),
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
  getPosFrom(x, y, direction, mirrored = false, xoff = 0, yoff = 0) {
    let facing = radians(
      direction + (this.rotation + this._rotRecoiled) * (mirrored ? -1 : 1)
    );
    return {
      x:
        x +
        (this.xOffset - this._recoiled + xoff) * Math.cos(facing) -
        (this.yOffset + yoff) * Math.sin(facing) * (mirrored ? -1 : 1),
      y:
        y +
        (this.xOffset - this._recoiled + xoff) * Math.sin(facing) +
        (this.yOffset + yoff) * Math.cos(facing) * (mirrored ? -1 : 1),
      direction: facing + this.postRot,
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
  serialise() {
    let comp = super.serialise();
    comp.type = "weapon-component";
    comp.recoil = this.recoil;
    comp.rotationalRecoil = this.rotationalRecoil;
    comp.recoilSpeed = this.recoilSpeed;
    return comp;
  }
  static deserialise(created) {
    let comp = new this();
    comp.xOffset = created.xOffset ?? 0;
    comp.yOffset = created.yOffset ?? 0;
    comp.width = created.width ?? 10;
    comp.height = created.height ?? 10;
    comp.rotation = created.rotation ?? 0;
    comp.recoil = created.recoil ?? 0;
    comp.rotationalRecoil = created.rotationalRecoil ?? 0;
    comp.recoilSpeed = created.recoilSpeed ?? 0;
    comp.init();
    return comp;
  }
}

class DestructibleComponent extends ShootableObject {
  shape = "circle";
  fill = "red";
  image = "error";
  width = 100;
  height = 100;
  rotation = 0;
  xOffset = 0;
  yOffset = 0;
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
}

class WeaponisedComponent extends Component {
  /**@type {Weapon} */
  weapon = {};
  _ticked = false;
  init() {
    this.weapon =
      typeof this.weapon === "string"
        ? construct(Registries.items.get(this.weapon), "weapon")
        : construct(this.weapon, "weapon");
    this.weapon.component = this;
  }
  tick(entity) {
    super.tick(entity);

    if (entity.target) {
      this.postRot =
        new Vector(entity.target.x, entity.target.y).sub(this.getPosOn(entity))
          .angleRad - entity.directionRad || this.postRot;
    }

    if (!this._ticked) {
      this._ticked = true;
      this.weapon.tick(entity);
    }
    this._ticked = false;
  }
  fire(entity) {
    this.weapon.fire(entity, this.weapon.shoot);
  }
  serialise() {
    let comp = super.serialise();
    comp.type = "weaponised-component";
    comp.weapon = this.weapon.registryName;
    return comp;
  }
  static deserialise(created) {
    let comp = new this();
    comp.xOffset = created.x ?? 0;
    comp.yOffset = created.y ?? 0;
    comp.width = created.width ?? 10;
    comp.height = created.height ?? 10;
    comp.rotation = created.rotation ?? 0;
    comp.recoil = created.recoil ?? 0;
    comp.rotationalRecoil = created.rotationalRecoil ?? 0;
    comp.recoilSpeed = created.recoilSpeed ?? 0;
    comp.weapon = created.weapon;
    comp.init();
    return comp;
  }
}

export {
  Component,
  LegComponent,
  WeaponComponent,
  WeaponisedComponent,
  DestructibleComponent,
};
