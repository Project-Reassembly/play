import { constructFromType } from "../../core/constructor.js";
import { roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { autoScaledEffect } from "../../play/effects.js";
import { WeaponComponent } from "../entity/entity-part.js";
import { EquippedEntity, InventoryEntity } from "../entity/inventory-entity.js";
import { Timer } from "../timer.js";
import { Equippable } from "./equippable.js";
import { WeaponBulletConfiguration, WeaponShootConfiguration } from "./weapon-exts.js";
class Weapon extends Equippable {
  timer = new Timer();
  ammoUse = 1;
  shootX = 15;
  shootY = 0;
  bullets = new WeaponBulletConfiguration();
  shoot = new WeaponShootConfiguration();
  hasAltFire = false;
  altShoot = null;
  altBullets = null;

  range = 180;

  showArm = false;
  //Internal
  #delay = 0;
  _cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  _lastReload = 0;
  _lastCharge = 0;

  //wooooooooooooo recoil
  recoil = 0;

  init() {
    super.init();
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    this.bullets = constructFromType(this.bullets, WeaponBulletConfiguration);
    if (this.altShoot) this.altShoot = constructFromType(this.altShoot, WeaponShootConfiguration);
    if (this.altBullets)
      this.altBullets = constructFromType(this.altBullets, WeaponBulletConfiguration);
  }

  /**@param {EquippedEntity} holder  */
  tick(holder) {
    super.tick(holder);
    this.timer.tick();
    this.decelerate();
    if (this._cooldown > 0) {
      this._cooldown -= holder.attributes.getValue("fire-rate");
      if (this._cooldown <= 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(this.shoot.readyEffect, holder.world, pos.x, pos.y, pos.direction);
      }
    }
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
  _getShootPos(holder) {
    let pos = this.component.getPosOn(holder);
    pos.x += Math.cos(pos.direction) * this.shootX + Math.sin(pos.direction) * this.shootY;
    pos.y += Math.sin(pos.direction) * this.shootX + Math.cos(pos.direction) * this.shootY;
    return pos;
  }
  /**
   * @param {EquippedEntity} holder
   */
  fire(holder, shoot = this.shoot, bulletConfig = this.bullets) {
    if (this._cooldown <= 0) {
      //choose ammo
      let ammoType = "-";
      for (let ammo in bulletConfig.ammos) {
        if (bulletConfig.getAmmo(ammo) !== null && entityHasAmmo(holder, ammo, this.ammoUse)) {
          ammoType = ammo;
          break;
        }
      }
      // stop if no ammo type found
      if (ammoType === "-") return;
      // fire
      this._lastReload = shoot.reload;
      this._lastCharge = shoot.charge;
      if (shoot.charge > 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(shoot.chargeEffect, holder.world, pos.x, pos.y, pos.direction, () =>
          this._getShootPos(holder),
        );
        this._cooldown = shoot.reload + shoot.charge;
        this.timer.do(() => {
          this._internalFire(holder, shoot, ammoType, bulletConfig);
        }, shoot.charge);
      } else this._internalFire(holder, shoot, ammoType, bulletConfig);
    }
  }
  _useAmmo(holder, ammoType) {
    if (ammoType === "none") return true;
    if (entityHasAmmo(holder, ammoType, this.ammoUse))
      entityAmmoUse(holder, ammoType, this.ammoUse);
    else return false;
    return true;
  }
  /** @param {string} ammoType  */
  _internalFire(holder, shoot = this.shoot, ammoType, bulletConfig = this.bullets) {
    if (!this._useAmmo(holder, ammoType)) return;

    this._cooldown = this.getAcceleratedReloadRate(shoot);
    this.accelerate(shoot); //Apply acceleration effects

    this.timer.repeat(
      () => {
        holder.knockback((this.recoil * 100) / holder.size);
        let pos = this._getShootPos(holder);
        autoScaledEffect(shoot.effect, holder.world, pos.x, pos.y, pos.direction);
        const model = bulletConfig.getAmmo(ammoType);
        if (model)
          model.emit(
            pos.x,
            pos.y,
            shoot.pattern.amount,
            degrees(pos.direction),
            shoot.pattern.spread,
            shoot.pattern.spacing,
            holder.world,
            holder,
          );
        if (this.component instanceof WeaponComponent) {
          this.component.trigger(shoot.recoilScale, shoot.rotRecoilScale);
        }
      },
      shoot.pattern.burst,
      shoot.pattern.interval,
    );
  }
  /**@param {EquippedEntity} holder  */
  use(holder, isSecondary = false) {
    if (isSecondary) {
      if (this.altShoot) this.fire(holder, this.altShoot, this.altBullets ?? this.bullets);
    } else {
      this.fire(holder, this.shoot, this.bullets);
    }
    super.use(holder, isSecondary);
  }
  /**@param {EquippedEntity} holder  */
  getContextualisedInfo(holder) {
    let ammoType = "-";
    for (let ammo in this.bullets.ammos) {
      if (this.bullets.getAmmo(ammo) !== null && entityHasAmmo(holder, ammo, this.ammoUse)) {
        ammoType = ammo;
        break;
      }
    }
    return `${crop(this.name, 15)}\nAmmo: ${
      ammoType !== "none" ?
        ammoType === "-" ?
          ""
        : entityAmmoCount(holder, ammoType)
      : "∞"
    }\n${
      ammoType !== "none" ?
        ammoType === "-" ?
          "None Available"
        : `${crop(Registries.items.get(ammoType).name, 12)} ×${this.ammoUse}`
      : "Free"
    }\n${this.createProgressBar()} `;
  }
  createProgressBar() {
    if (this._cooldown <= this._lastReload)
      return ""
        .padEnd((this._cooldown / this._lastReload) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
    else
      return ""
        .padEnd(15 - ((this._cooldown - this._lastReload) / this._lastCharge) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
  }
  createExtendedDetails() {
    let s = `#=-Main Fire:\n${infoOfShootPattern(this.shoot, this.bullets, this.ammoUse)}`;
    if (this.hasAltFire) {
      s += `\n#=-Alternate Fire:\n${infoOfShootPattern(this.altShoot, this.altBullets, this.ammoUse)}`;
    }
    return s;
  }
}
/**
 *
 * @param {WeaponShootConfiguration} shoot
 * @param {WeaponBulletConfiguration} bullets
 */
export function infoOfShootPattern(shoot, bullets, usage = 1) {
  let s = ` #[00ffac]-${roundNum((60 / (shoot.reload + shoot.charge)) * shoot.pattern.amount * shoot.pattern.burst, 2)}#-- shots/sec\n`;
  if (shoot.pattern.spacing || shoot.pattern.spread)
    s += ` #[00ffac]-${roundNum(shoot.pattern.spacing * shoot.pattern.amount + shoot.pattern.spread, 2)}°#-- inaccuracy\n`;
  if (shoot.charge) s += ` #[00ffac]-${roundNum(shoot.charge / 60, 2)}s#-- charge-up\n`;

  for (const ammo in bullets.ammos) {
    const i = Registries.items.tryGet(ammo);
    s += ` #=-[${i?.image ? `#>>${i.image}` : "⚡"}#=-${i?.name ?? "Energy"} ${usage > 1 ? `x${usage}` : ""}#=-]\n #=-| ${bullets.getAmmo(ammo).createInfo().replaceAll("\n", "\n #=-| ").trim()}\n`;
  }
  return s;
}

function entityHasAmmo(ent, ammoItem, ammoAmount) {
  if (ammoItem === "none") return true;
  return (
    ent instanceof InventoryEntity ?
      ent instanceof EquippedEntity ?
        ent.ammo.hasItem(ammoItem, ammoAmount)
      : ent.inventory.hasItem(ammoItem, ammoAmount)
    : false
  );
}

function entityAmmoCount(ent, ammoItem, ammoAmount) {
  if (ammoItem === "none") return -1;
  return (
    ent instanceof InventoryEntity ?
      ent instanceof EquippedEntity ?
        ent.ammo.count(ammoItem)
      : ent.inventory.count(ammoItem)
    : 0
  );
}

function entityAmmoUse(ent, ammoItem, ammoAmount) {
  return (
    ent instanceof InventoryEntity ?
      ent instanceof EquippedEntity ?
        ent.ammo.removeItem(ammoItem, ammoAmount)
      : ent.inventory.removeItem(ammoItem, ammoAmount)
    : false
  );
}

function ind(lvl = 0) {
  return "  ".repeat(lvl);
}

function crop(text, length) {
  text = text.replaceAll(/#../g, "");
  return text.length <= length ? text : text.substring(0, length - 1) + "…";
}

export { crop, Weapon };

