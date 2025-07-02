import { construct, constructFromType } from "../../../core/constructor.js";
import { turn, Vector } from "../../../core/number.js";
import { drawImg, rotatedImg } from "../../../core/ui.js";
import { autoScaledEffect } from "../../../play/effects.js";
import { Log } from "../../../play/messaging.js";
import { blockSize } from "../../../scaling.js";
import { ShapeParticle } from "../../effect/shape-particle.js";
import { TextParticle } from "../../effect/text-particle.js";
import { WaveParticle } from "../../effect/wave-particle.js";
import { WeaponComponent } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { drawMultilineText, Inventory } from "../../inventory.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import { ItemStack } from "../../item/item-stack.js";
import { Item } from "../../item/item.js";
import {
  Weapon,
  WeaponBulletConfiguration,
  WeaponShootConfiguration,
} from "../../item/weapon.js";
import { patternedBulletExpulsion } from "../../projectile/bullet.js";
import { Timer } from "../../timer.js";
import { Block } from "../block.js";
import { Container } from "../container.js";
/**Turret base structural component. Connects visually to diagonally adjacent blocks. */
export class TurretBase extends Container {
  inventorySize = 0;
  selectable = false;
  connectorImage = "error";
  otherPart = "none";
  #ur = false; // ◥, -45
  #ul = false; // ◤, -135
  #dr = false; // ◢, 45
  #dl = false; // ◣, 135
  #center = false; // ◆, any 2 connections on the same face
  #cover = false; // ▢, any 2 diagonal connections and not centered
  tick() {
    super.tick();
    this.#dr = this.checkConnectionTo(1, 1);
    this.#dl = this.checkConnectionTo(-1, 1);
    this.#ur = this.checkConnectionTo(1, -1);
    this.#ul = this.checkConnectionTo(-1, -1);
    this.#center =
      (this.#ul && this.#dl) ||
      (this.#dr && this.#ur) ||
      (this.#ul && this.#ur) ||
      (this.#dl && this.#dr);
    this.#cover = (this.#ul && this.#dr) || (this.#dl && this.#ur);
  }
  draw() {
    if (!this.#cover) super.draw();
  }
  postDraw() {
    if (this.#center)
      rotatedImg(
        this.image,
        this.x,
        this.y,
        blockSize * Math.SQRT2,
        blockSize * Math.SQRT2,
        Math.PI / 4
      );
    else {
      if (this.#dr) this.drawConnection(1, 1);
      if (this.#dl) this.drawConnection(-1, 1);
      if (this.#ur) this.drawConnection(1, -1);
      if (this.#ul) this.drawConnection(-1, -1);
    }
    super.postDraw();
  }
  drawConnection(x, y) {
    let vct = new Vector(x, y).scale(11 * Math.SQRT1_2).addXY(this.x, this.y);
    if (x === y)
      rotatedImg(
        this.connectorImage,
        vct.x,
        vct.y,
        Math.ceil(blockSize * Math.SQRT2),
        Math.ceil(blockSize * Math.SQRT2),
        Math.PI,
        true
      );
    else
      drawImg(
        this.connectorImage,
        vct.x,
        vct.y,
        Math.ceil(blockSize * Math.SQRT2),
        Math.ceil(blockSize * Math.SQRT2)
      );
  }
  checkConnectionTo(x, y) {
    let blk = this.world.getBlock(this.gridX + x, this.gridY + y, "blocks");
    return (
      blk?.registryName === this.registryName ||
      blk?.registryName === this.otherPart
    );
  }
  createExtendedTooltip() {
    return [];
  }
}

export class TurretController extends TurretBase {
  maxSize = 2;
  gunCanFire = false;
  gunDirection = 0;
  get gunDirectionRad() {
    return (this.gunDirection / 180) * Math.PI;
  }
  turnSpeed = 5;

  target = null;

  inventorySize = 1;
  selectable = true;
  /**@type {Inventory} */
  turretinv = null;
  get lastAmmo() {
    return this.turret?.lastAmmo;
  }
  /** @type {TurretItem} */
  get turret() {
    let i = this.turretinv.get(0)?.getItem();
    return i instanceof TurretItem ? i : null;
  }
  get range() {
    return this.turret?.range;
  }
  init() {
    super.init();
    this.turretinv = new Inventory(1, this.turretinv);
  }
  postDraw2() {
    this.turret?.component?.draw(this.x, this.y, this.gunDirection, 0, 0);
  }
  fire() {
    this.turret?.fire(this);
  }
  tick() {
    super.tick();
    let w = this.turret;
    if (w) {
      if (this.getSize() < w.baseSize) {
        this.warnSize(w.baseSize);
        return;
      }
      w.tick(this);
      if (this.target) {
        let od = this.gunDirection;
        let d =
          this.target instanceof Block
            ? Vector.fromScalar(blockSize / 2)
            : this.target instanceof Entity
            ? this.target.predictMotionDS(
                this.distanceTo(this.target),
                this.turret?.bullets?.getAmmo(this.lastAmmo)?.speed ?? 10
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
      this._generic_AttackerAI((phys) => !(phys instanceof DroppedItemStack));
    }
  }
  serialise() {
    let b = super.serialise();
    b.turretinv = this.turretinv.serialise();
    return b;
  }
  /**
   * @param {Container} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.turretinv = Inventory.deserialise(creator.turretinv);
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.inventorySize + " ammo slots",
      this.maxSize + " maximum cross radius",
      "🟨 -------------------- ⬜",
    ];
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse = false) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse);
    drawMultilineText(
      x - 70,
      y - 30,
      "Turret",
      null,
      Item.getColourFromRarity(0, "dark"),
      outlineColour,
      backgroundColour,
      15
    );
    this.turretinv.draw(
      x + 17,
      y - 20,
      null,
      6,
      30,
      outlineColour,
      backgroundColour,
      forceVReverse
    );
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
      ) {
        this.fire();
      }
      return true;
    } else {
      this.target = tempTarget;
      return false;
    }
  }
  getSize() {
    for (let size = 1; size < this.maxSize; size++) {
      if (!this.checkConnectionTo(size, size)) return size;
      if (!this.checkConnectionTo(size, -size)) return size;
      if (!this.checkConnectionTo(-size, size)) return size;
      if (!this.checkConnectionTo(-size, -size)) return size;
    }
    return this.maxSize;
  }
  warnSize(targetSize) {
    if (targetSize > this.maxSize) {
      this.#warnSquare(0, 0);
      this.world.particles.push(
        new TextParticle(
          (this.gridX + 0.5) * blockSize,
          (this.gridY + 0.5 - targetSize) * blockSize - 10 * targetSize,
          0,
          1,
          0,
          0,
          "Controller\nincompatible",
          [[255, 0, 0]],
          10 * targetSize,
          10 * targetSize,
          0,
          true
        )
      );
    } else {
      for (let size = 1; size < targetSize; size++) {
        if (!this.checkConnectionTo(size, size)) this.#warnSquare(size, size);
        if (!this.checkConnectionTo(size, -size)) this.#warnSquare(size, -size);
        if (!this.checkConnectionTo(-size, size)) this.#warnSquare(-size, size);
        if (!this.checkConnectionTo(-size, -size))
          this.#warnSquare(-size, -size);
      }
      this.world.particles.push(
        new TextParticle(
          (this.gridX + 0.5) * blockSize,
          (this.gridY + 0.5 - targetSize) * blockSize - 10 * targetSize,
          0,
          1,
          0,
          0,
          "Base too small\n" + this.getSize() + "/" + targetSize,
          [[255, 0, 0]],
          10 * targetSize,
          10 * targetSize,
          0,
          true
        )
      );
    }
  }
  #warnSquare(x, y) {
    this.world.particles.push(
      new WaveParticle(
        (this.gridX + x + 0.5) * blockSize,
        (this.gridY + y + 0.5) * blockSize,
        0,
        blockSize / 2,
        blockSize / 2,
        [[255, 0, 0]],
        5,
        5
      ),
      new TextParticle(
        (this.gridX + x + 0.5) * blockSize,
        (this.gridY + y + 0.5) * blockSize,
        0,
        0,
        0,
        0,
        "!",
        [[255, 0, 0]],
        blockSize / 1.2,
        blockSize / 1.2,
        0,
        true
      )
    );
  }
  break(type) {
    if (super.break(type))
      this.turretinv.iterate((stack) => {
        DroppedItemStack.create(
          stack,
          this.world,
          this.x + blockSize / 2,
          this.y + blockSize / 2
        );
      }, true);
    return true;
  }
}

export class TurretItem extends Item {
  timer = new Timer();
  ammoUse = 1;

  shootX = 15;
  shootY = 0;
  bullets = new WeaponBulletConfiguration();
  shoot = new WeaponShootConfiguration();

  //Mounting
  range = 180;
  baseSize = 0;

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
  lastAmmo = "none";

  component = {};

  init() {
    super.init();
    this.component = construct(this.component, "component");
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    this.bullets = constructFromType(this.bullets, WeaponBulletConfiguration);
  }

  /**@param {TurretController} turret  */
  tick(turret) {
    super.tick();
    this.timer.tick();
    this.decelerate();
    this.component?.tick(turret);
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos(turret);
        autoScaledEffect(
          this.shoot.readyEffect,
          this.world,
          pos.x,
          pos.y,
          pos.direction
        );
      }
    }
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
  _getShootPos(turret) {
    let pos = this.component.getPosOn(turret);
    pos.direction = turret.gunDirectionRad;
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
  /**
   * @param {EquippedEntity} turret
   */
  fire(turret, shoot = this.shoot, bulletConfig = this.bullets) {
    if (this.#cooldown <= 0) {
      //choose ammo
      let ammoType = "-";
      for (let ammo in bulletConfig.ammos) {
        if (
          bulletConfig.getAmmo(ammo) !== null &&
          turret.inventory.hasItem(ammo, this.ammoUse)
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
      this.lastAmmo = ammoType;
      if (shoot.charge > 0) {
        let pos = this._getShootPos(turret);
        autoScaledEffect(
          shoot.chargeEffect,
          turret.world,
          pos.x,
          pos.y,
          pos.direction,
          () => this._getShootPos(turret)
        );
        this.#cooldown = shoot.reload + shoot.charge;
        this.timer.do(() => {
          this._internalFire(turret, shoot, ammoType, bulletConfig);
        }, shoot.charge);
      } else this._internalFire(turret, shoot, ammoType, bulletConfig);
    }
  }
  _useAmmo(turret, ammoType) {
    if (ammoType === "none") return true;
    if (turret.inventory.hasItem(ammoType, this.ammoUse))
      turret.inventory.removeItem(ammoType, this.ammoUse);
    else return false;
    return true;
  }
  _internalFire(
    turret,
    shoot = this.shoot,
    ammoType,
    bulletConfig = this.bullets
  ) {
    if (!this._useAmmo(turret, ammoType)) return;

    this.#cooldown = this.getAcceleratedReloadRate(shoot);
    this.accelerate(shoot); //Apply acceleration effects

    this.timer.repeat(
      () => {
        let pos = this._getShootPos(turret);
        autoScaledEffect(
          shoot.effect,
          turret.world,
          pos.x,
          pos.y,
          pos.direction
        );
        patternedBulletExpulsion(
          pos.x,
          pos.y,
          bulletConfig.getAmmo(ammoType) ?? {},
          shoot.pattern.amount,
          degrees(pos.direction),
          shoot.pattern.spread,
          shoot.pattern.spacing,
          turret.world,
          turret
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
      ...Weapon.infoOfShootPattern(this.shoot, this.bullets),
      "🟨 -------------------- ⬜",
    ];
  }
}
