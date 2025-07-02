import { construct, constructFromType } from "../../../core/constructor.js";
import { turn, Vector } from "../../../core/number.js";
import { autoScaledEffect } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { WeaponComponent } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import {
  Weapon,
  WeaponBulletConfiguration,
  WeaponShootConfiguration,
} from "../../item/weapon.js";
import { PhysicalObject } from "../../physical.js";
import { patternedBulletExpulsion } from "../../projectile/bullet.js";
import { Timer } from "../../timer.js";
import { Block } from "../block.js";
import { Container } from "../container.js";

/**Standalone turret block, fires a single weapon which can't be replaced. */
class Turret extends Container {
  timer = new Timer();
  ammoUse = 1;
  shootX = 15;
  shootY = 0;
  bullets = new WeaponBulletConfiguration();
  shoot = new WeaponShootConfiguration();

  gunCanFire = false;
  gunDirection = 0;
  get gunDirectionRad() {
    return (this.gunDirection / 180) * Math.PI;
  }
  range = 180;
  turnSpeed = 5;

  //Internal
  #cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  #lastReload = 0;
  #lastCharge = 0;
  #lastAmmo = "none";

  target = null;

  /** @type {Component} */
  component = null;

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
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    this.bullets = constructFromType(this.bullets, WeaponBulletConfiguration);
  }

  tick() {
    super.tick();
    this.timer.tick();
    this.decelerate();
    this.component?.tick(this);
    if (this.target) {
      let od = this.gunDirection;
      let d =
        this.target instanceof Block
          ? Vector.fromScalar(blockSize / 2)
          : this.target instanceof Entity
          ? this.target.predictMotionDS(
              this.distanceTo(this.target),
              this.bullets.getAmmo(this.#lastAmmo)?.speed ?? 10
            )
          : Vector.ZERO;
      let res = turn(
        this.gunDirection,
        this.x + blockSize / 2,
        this.y + blockSize / 2,
        this.target.x + d.x,
        this.target.y + d.y,
        this.turnSpeed
      );
      this.gunDirection = res.direction;
      this.gunCanFire = Math.abs(res.direction - od) < this.turnSpeed;
    }
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos();
        autoScaledEffect(
          this.shoot.readyEffect,
          this.world,
          pos.x,
          pos.y,
          pos.direction
        );
      }
    }
    this._generic_AttackerAI((phys) => !(phys instanceof DroppedItemStack));
  }
  getAcceleratedReloadRate(shoot) {
    if (this.#acceleration <= -1 || this.#acceleration > this.maxAccel)
      return shoot.reload; //If bad acceleration then ignore it
    return shoot.reload / (1 + this.#acceleration); //2 acceleration = 200% fire rate increase = 3x fire rate
  }
  accelerate(shoot) {
    this.#accelerated = this.getAcceleratedReloadRate(shoot) * 1.1; //Always wait for at least the reload time before deceling
    if (this.#acceleration < this.maxAccel) {
      this.#acceleration += this.accel;
    }
    if (this.#acceleration > this.maxAccel) {
      this.#acceleration = this.maxAccel;
    }
  }
  decelerate() {
    //If accelerated this frame, don't slow down
    if (this.#accelerated > 0) {
      this.#accelerated--;
      return;
    }
    //Else do
    if (this.#acceleration > 0) {
      this.#acceleration -= this.accelDecay;
    }
    if (this.#acceleration < 0) {
      this.#acceleration = 0;
    }
  }
  _getShootPos() {
    let pos = this.component.getPosOn(this);
    pos.direction = this.gunDirectionRad;
    pos.x +=
      Math.cos(pos.direction) * this.shootX +
      Math.sin(pos.direction) * this.shootY +
      blockSize / 2;
    pos.y +=
      Math.sin(pos.direction) * this.shootX +
      Math.cos(pos.direction) * this.shootY +
      blockSize / 2;
    return pos;
  }
  fire(shoot = this.shoot, bulletConfig = this.bullets) {
    if (this.#cooldown <= 0) {
      //choose ammo
      let ammoType = "-";
      for (let ammo in bulletConfig.ammos) {
        if (
          bulletConfig.getAmmo(ammo) !== null &&
          this.inventory.hasItem(ammo, this.ammoUse)
        ) {
          ammoType = ammo;
          break;
        }
      }
      // stop if no ammo type found
      if (ammoType === "-") return;
      // fire
      this.#lastReload = shoot.reload;
      this.#lastCharge = shoot.charge;
      this.#lastAmmo = ammoType;
      if (shoot.charge > 0) {
        let pos = this._getShootPos();
        autoScaledEffect(
          shoot.chargeEffect,
          this.world,
          pos.x,
          pos.y,
          pos.direction,
          () => this._getShootPos()
        );
        this.#cooldown = shoot.reload + shoot.charge;
        this.timer.do(() => {
          this._internalFire(shoot, ammoType, bulletConfig);
        }, shoot.charge);
      } else this._internalFire(shoot, ammoType, bulletConfig);
    }
  }
  _useAmmo(ammoType) {
    if (ammoType === "none") return true;
    if (this.inventory.hasItem(ammoType, this.ammoUse))
      this.inventory.removeItem(ammoType, this.ammoUse);
    else return false;
    return true;
  }
  _internalFire(shoot = this.shoot, ammoType, bulletConfig = this.bullets) {
    if (!this._useAmmo(ammoType)) return;

    this.#cooldown = this.getAcceleratedReloadRate(shoot);
    this.accelerate(shoot); //Apply acceleration effects

    this.timer.repeat(
      () => {
        let pos = this._getShootPos();
        autoScaledEffect(shoot.effect, this.world, pos.x, pos.y, pos.direction);
        patternedBulletExpulsion(
          pos.x,
          pos.y,
          bulletConfig.getAmmo(ammoType) ?? {},
          shoot.pattern.amount,
          degrees(pos.direction),
          shoot.pattern.spread,
          shoot.pattern.spacing,
          this.world,
          this
        );
        if (this.component instanceof WeaponComponent) {
          this.component.trigger(shoot.recoilScale, 0);
        }
      },
      shoot.pattern.burst,
      shoot.pattern.interval
    );
  }
  createProgressBar() {
    if (this.#cooldown <= this.#lastReload)
      return ""
        .padEnd((this.#cooldown / this.#lastReload) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
    else
      return ""
        .padEnd(
          15 - ((this.#cooldown - this.#lastReload) / this.#lastCharge) * 15,
          "■"
        )
        .padEnd(15, "□")
        .substring(0, 15);
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.inventorySize + " ammo slots",
      ...Weapon.infoOfShootPattern(this.shoot, this.bullets),
      "🟨 -------------------- ⬜",
    ];
  }
  postDraw() {
    super.postDraw();
    this.component.draw(this.x, this.y, this.gunDirection, 0, 0);
  }
  /** Generic AI for attacking entities.
   * @param {(phys: PhysicalObject) => boolean} conditions Condition for selecting entities, to make this AI less generic.
   * @param {boolean} [shoots=true] Whether or not the entity should shoot at the new target.
   * @returns {boolean} `true` if an entity is being targeted, `false` if not.
   */
  _generic_AttackerAI(
    conditions = () => true,
    shoots = true,
    attackBlocks = true,
    attackEntities = true
  ) {
    let tempTarget = this.target;
    let entity = attackEntities
      ? this.closestFrom(
          this.world.entities,
          this.range,
          (ent) =>
            !ent.dead &&
            ent.team !== this.team &&
            ent.visible &&
            conditions(ent)
        )
      : null;
    let block = attackBlocks
      ? this.closestFrom(
          this.world.blocksInSquare(
            Math.floor(this.gridX),
            Math.floor(this.gridY),
            Math.floor(this.range / blockSize),
            "blocks"
          ),
          this.range,
          (blk) => blk.team !== this.team && conditions(blk)
        )
      : null;
    this.target = this.closestFrom([entity, block], this.range);
    if (this.target) {
      if (
        this.gunCanFire &&
        shoots &&
        this.distanceTo(this.target) < this.range
      )
        this.fire();
      return true;
    } else {
      this.target = tempTarget;
      return false;
    }
  }
}

export { Turret };
