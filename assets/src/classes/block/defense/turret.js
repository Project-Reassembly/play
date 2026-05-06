import { col } from "../../../core/color.js";
import { construct, constructFromType } from "../../../core/constructor.js";
import { turn, Vector } from "../../../core/number.js";
import { autoScaledEffect } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { WeaponComponent } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import { WeaponBulletConfiguration, WeaponShootConfiguration } from "../../item/weapon-exts.js";
import { Weapon } from "../../item/weapon.js";
import { PhysicalObject, ShootableObject } from "../../physical.js";
import { patternedBulletExpulsion } from "../../projectile/yeeter.js";
import { Timer } from "../../timer.js";
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
  shootCone = -1;

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

  /**@import {ShootableObject} from "../../physical.js" @type {ShootableObject} */
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
    if (this.shootCone === -1) this.shootCone = this.turnSpeed * 2;
  }

  tick() {
    super.tick();
    this.timer.tick();
    this.decelerate();
    this.component?.tick(this);
    if (this.target) {
      let t = this.target;
      let d =
        t instanceof Entity ?
          t.predictMotionDS(this.bullets.getAmmo(this.#lastAmmo)?.speed ?? 10, this.distanceTo(t))
        : Vector.ZERO;
      let res = turn(
        this.gunDirection,
        this.x,
        this.y,
        this.target.x + d.x,
        this.target.y + d.y,
        this.turnSpeed,
      );
      this.gunDirection = res.direction;
      this.gunCanFire =
        Math.abs(
          this.gunDirection -
            new Vector(this.target.x, this.target.y).sub(new Vector(this.x, this.y)).angle,
        ) < this.shootCone;
    }
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos();
        autoScaledEffect(this.shoot.readyEffect, this.world, pos.x, pos.y, pos.direction);
      }
    }
    this.ai((phys) => !(phys instanceof DroppedItemStack));
  }
  getAcceleratedReloadRate(shoot) {
    if (this.#acceleration <= -1 || this.#acceleration > this.maxAccel) return shoot.reload; //If bad acceleration then ignore it
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
    pos.x += Math.cos(pos.direction) * this.shootX + Math.sin(pos.direction) * this.shootY;
    pos.y += Math.sin(pos.direction) * this.shootX + Math.cos(pos.direction) * this.shootY;
    return pos;
  }
  fire(shoot = this.shoot, bulletConfig = this.bullets) {
    if (this.#cooldown <= 0) {
      //choose ammo
      let ammoType = "-";
      for (let ammo in bulletConfig.ammos) {
        if (bulletConfig.getAmmo(ammo) !== null && this.inventory.hasItem(ammo, this.ammoUse)) {
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
        autoScaledEffect(shoot.chargeEffect, this.world, pos.x, pos.y, pos.direction, () =>
          this._getShootPos(),
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
          this,
        );
        if (this.component instanceof WeaponComponent) {
          this.component.trigger(shoot.recoilScale, 0);
        }
      },
      shoot.pattern.burst,
      shoot.pattern.interval,
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
        .padEnd(15 - ((this.#cooldown - this.#lastReload) / this.#lastCharge) * 15, "■")
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
  ai(conditions = () => true, shoots = true, attackBlocks = true, attackEntities = true) {
    let tempTarget = this.target;
    let entity =
      attackEntities ?
        this.closestFrom(
          this.world.entities,
          this.range,
          (ent) => !ent.dead && ent.team !== this.team && ent.visible && conditions(ent),
        )
      : null;
    let block =
      attackBlocks ?
        this.closestFrom(
          this.world.blocksInSquare(
            this.gridX,
            this.gridY,
            Math.round(this.range / blockSize),
            "blocks",
          ),
          this.range,
          (blk) => blk.team !== this.team && conditions(blk),
        )
      : null;
    this.target = this.closestFrom([entity, block], this.range);
    if (this.target) {
      if (this.gunCanFire && shoots && this.distanceTo(this.target) < this.range) this.fire();
      return true;
    } else {
      this.target = tempTarget;
      return false;
    }
  }
  postDraw2() {
    if (PhysicalObject.debug) this._debugAI();
  }
  _debugAI() {
    push();
    noFill();
    stroke(this.target instanceof ShootableObject ? col.red : col.green);
    strokeWeight(4);
    if (this.target) {
      square(this.target.x, this.target.y, this.size);
      line(this.x, this.y, this.target.x, this.target.y);
    }
    let directionLine = this.pos.add(Vector.fromAngleRad(this.gunDirectionRad).scale(this.range));
    if (this.gunCanFire) stroke(0, 255, 255);
    else stroke(100, 0, 255);
    line(this.x, this.y, directionLine.x, directionLine.y);
    stroke(
      this.target instanceof ShootableObject ?
        col.from(200, 0, 255, 100)
      : col.from(255, 255, 0, 100),
    );
    circle(this.x, this.y, this.attackRange * 2);
    pop();
  }
}

export { Turret };

