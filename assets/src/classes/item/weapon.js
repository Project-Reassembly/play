import { Equippable } from "./equippable.js";
import { Timer } from "../timer.js";
import { constructFromType } from "../../core/constructor.js";
import { EquippedEntity, InventoryEntity } from "../entity/inventory-entity.js";
import { autoScaledEffect } from "../../play/effects.js";
import { construct } from "../../core/constructor.js";
import { WeaponComponent } from "../entity/component.js";
import { roundNum } from "../../core/number.js";
import { PointBullet } from "../projectile/point-bullet.js";
import { LaserBullet } from "../projectile/laser-bullet.js";
import { Bullet, patternedBulletExpulsion } from "../projectile/bullet.js";
import { Missile } from "../projectile/missile.js";
import { Registries } from "../../core/registry.js";
class Weapon extends Equippable {
  timer = new Timer();
  ammoUse = 1;
  shootX = 15;
  bullets = new WeaponBulletConfiguration();
  shoot = new WeaponShootConfiguration();
  hasAltFire = false;
  altShoot = null;
  altBullets = null;

  range = 180;

  //Internal
  #delay = 0;
  #cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  #lastReload = 0;
  #lastCharge = 0;

  //wooooooooooooo recoil
  recoil = 0;

  init() {
    super.init();
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    this.bullets = constructFromType(this.bullets, WeaponBulletConfiguration);
    if (this.altShoot)
      this.altShoot = constructFromType(
        this.altShoot,
        WeaponShootConfiguration
      );
    if (this.altBullets)
      this.altBullets = constructFromType(
        this.altBullets,
        WeaponBulletConfiguration
      );
  }

  /**@param {EquippedEntity} holder  */
  tick(holder) {
    super.tick(holder);
    this.timer.tick();
    this.decelerate();
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          this.shoot.readyEffect,
          holder.world,
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
  _getShootPos(holder) {
    let pos = this.component.getPosOn(holder);
    pos.x += Math.cos(pos.direction) * this.shootX;
    pos.y += Math.sin(pos.direction) * this.shootX;
    return pos;
  }
  /**
   * @param {EquippedEntity} holder
   */
  fire(holder, shoot = this.shoot, bulletConfig = this.bullets) {
    if (this.#cooldown <= 0) {
      //choose ammo
      let ammoType = "-";
      for (let ammo in bulletConfig.ammos) {
        if (
          bulletConfig.getAmmo(ammo) !== null &&
          entityHasAmmo(holder, ammo, this.ammoUse)
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
      if (shoot.charge > 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          shoot.chargeEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction,
          () => this._getShootPos(holder)
        );
        this.#cooldown = shoot.reload + shoot.charge;
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
  _internalFire(
    holder,
    shoot = this.shoot,
    ammoType,
    bulletConfig = this.bullets
  ) {
    if (!this._useAmmo(holder, ammoType)) return;

    this.#cooldown = this.getAcceleratedReloadRate(shoot);
    this.accelerate(shoot); //Apply acceleration effects

    this.timer.repeat(
      () => {
        holder.knock(
          this.recoil * 100 / holder.size,
          holder.direction + 180,
          false,
          10
        );
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          shoot.effect,
          holder.world,
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
          holder.world,
          holder
        );
        if (this.component instanceof WeaponComponent) {
          this.component.trigger(shoot.recoilScale, shoot.rotRecoilScale);
        }
      },
      shoot.pattern.burst,
      shoot.pattern.interval
    );
  }
  /**@param {EquippedEntity} holder  */
  use(holder, isSecondary = false) {
    if (isSecondary) {
      if (this.altShoot)
        this.fire(holder, this.altShoot, this.altBullets ?? this.bullets);
    } else {
      this.fire(holder, this.shoot, this.bullets);
    }
    super.use(holder, isSecondary);
  }
  /**@param {EquippedEntity} holder  */
  getContextualisedInfo(holder) {
    let ammoType = "-";
    for (let ammo in this.bullets.ammos) {
      if (
        this.bullets.getAmmo(ammo) !== null &&
        entityHasAmmo(holder, ammo, this.ammoUse)
      ) {
        ammoType = ammo;
        break;
      }
    }
    return (
      (this.name.length <= 15 ? this.name : this.name.substring(0, 14) + "…") +
      "\nAmmo: " +
      (ammoType !== "none"
        ? ammoType === "-"
          ? ""
          : entityAmmoCount(holder, ammoType)
        : "∞") +
      "\n" +
      (ammoType !== "none"
        ? ammoType === "-"
          ? "None Available"
          : Registries.items.get(ammoType).name + " ×" + this.ammoUse
        : "Free") +
      "\n" +
      this.createProgressBar() +
      " "
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
      this.hasAltFire
        ? "🟨 ------- Main ------- ⬜"
        : "🟨 -------------------- ⬜",
      ...Weapon.infoOfShootPattern(this.shoot, this.bullets),
      this.hasAltFire ? "🟨 ------- Alt -------- ⬜" : "",
      ...(this.hasAltFire
        ? Weapon.infoOfShootPattern(
            this.altShoot,
            this.altBullets ?? this.bullets
          )
        : []),
      "🟨 -------------------- ⬜",
    ];
  }
  /**
   *
   * @param {WeaponShootConfiguration} shoot
   * @param {WeaponBulletConfiguration} bulletConfig
   * @returns
   */
  static infoOfShootPattern(shoot, bulletConfig) {
    return [
      "Fire Rate: " +
        (shoot.pattern.amount * shoot.pattern.burst > 1
          ? shoot.pattern.amount * shoot.pattern.burst + "× "
          : "") +
        roundNum(60 / (shoot.reload + shoot.charge), 2) +
        "/s",
      shoot.pattern.spread ? shoot.pattern.spread + "° inaccuracy" : "",
      shoot.pattern.spacing ? shoot.pattern.spacing + "° shot spacing" : "",
      "🟨Shots:⬜",
      ...Object.keys(bulletConfig.ammos).flatMap((x) =>
        bulletConfig.unbrowsable.includes(bulletConfig.ammos[x])
          ? [
              x == "none"
                ? " "
                : ind(1) + "🟨" + Registries.items.get(x).name + ": variant⬜",
            ]
          : [
              x == "none"
                ? " "
                : ind(1) + "🟨" + Registries.items.get(x).name + ":⬜",
              ...Weapon.getBulletInfo(
                bulletConfig.getAmmo(x),
                x == "none" ? 1 : 2
              ),
            ]
      ),
    ];
  }
  static getBulletInfo(bullet = {}, idl = 0) {
    if (Array.isArray(bullet))
      return bullet.flatMap((b) => Weapon.getBulletInfo(b, idl));
    /**@type {Bullet} */
    let blt = construct(bullet, "bullet");
    if (!blt) return [ind(idl) + "🟥invalid: " + bullet + "⬜"];
    let time = Math.min(blt.lifetime, blt.speed / blt.decel);
    return [
      ind(idl) +
        (blt instanceof PointBullet
          ? "🟪instant⬜"
          : blt instanceof LaserBullet
          ? blt.length
          : roundNum(
              //s = ut + ½at²
              (blt.speed * time - 0.5 * (blt.decel * time ** 2)) / 30,
              1
            ) + " blocks range"),

      ...blt.damage.map(
        (x) =>
          ind(idl) +
          (x.amount ?? 0) +
          (x.spread && x.spread > 0 ? " (±" + x.spread + ")" : "") +
          " " +
          (x.type ?? (x.radius > 0 ? "explosion" : "unknown")) +
          (x.radius > 0 ? " area" : "") +
          " damage" +
          (x.radius > 0 ? " ~ " + roundNum(x.radius / 30, 1) + " blocks" : "")
      ),

      ind(idl) +
        (blt.status !== "none"
          ? "🟨" +
            Registries.statuses.get(blt.status).name +
            " for " +
            roundNum(blt.statusDuration / 60, 1) +
            "s"
          : ""),

      ind(idl) +
        (blt.pierce > 0
          ? blt.conditionalPierce
            ? "🟨continues if target destroyed⬜"
            : "🟨" + blt.pierce + "× pierce⬜"
          : ""),

      ind(idl) + (blt.fires > 0 ? "🟧incendiary: " : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? blt.isFireBinomial
            ? blt.fireChance * 100 +
              "% chance for a fire " +
              (blt.fires > 1 ? blt.fires + " times" : "")
            : ((blt.fireChance ?? 1) !== 1
                ? blt.fireChance * 100 + "% chance for "
                : "") + (blt.fires > 1 ? blt.fires + " fires " : "1 fire ")
          : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? (blt.fire.damage ?? 1) +
            " " +
            (blt.fire.type ?? "fire") +
            " damage every " +
            roundNum((blt.fire.interval ?? 10) / 60, 1) +
            "s"
          : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? roundNum((blt.fire.lifetime ?? 600) / 60, 1) + "s lifetime⬜"
          : ""),

      ind(idl) + (blt instanceof Missile ? "🟦homing: " : ""),
      ind(idl + 1) +
        (blt instanceof Missile
          ? roundNum(blt.trackingRange / 30, 1) + " blocks range"
          : ""),
      ind(idl + 1) +
        (blt instanceof Missile
          ? roundNum(blt.turnSpeed, 1) + " strength⬜"
          : ""),

      ind(idl) + (blt.fragNumber > 0 ? blt.fragNumber + " frags:" : ""),
      ...(blt.fragNumber > 0
        ? Weapon.getBulletInfo(blt.fragBullet, idl + 1)
        : []),

      ind(idl) +
        (blt.intervalNumber > 0
          ? roundNum((blt.intervalNumber * 60) / blt.intervalTime, 1) +
            "/s interval shots:"
          : ""),
      ...(blt.intervalNumber > 0
        ? Weapon.getBulletInfo(blt.intervalBullet, idl + 1)
        : []),
    ];
  }
}

function entityHasAmmo(ent, ammoItem, ammoAmount) {
  if (ammoItem === "none") return true;
  return ent instanceof InventoryEntity
    ? ent instanceof EquippedEntity
      ? ent.equipment.hasItem(ammoItem, ammoAmount)
      : ent.inventory.hasItem(ammoItem, ammoAmount)
    : false;
}

function entityAmmoCount(ent, ammoItem, ammoAmount) {
  if (ammoItem === "none") return -1;
  return ent instanceof InventoryEntity
    ? ent instanceof EquippedEntity
      ? ent.equipment.count(ammoItem)
      : ent.inventory.count(ammoItem)
    : false;
}

function entityAmmoUse(ent, ammoItem, ammoAmount) {
  return ent instanceof InventoryEntity
    ? ent instanceof EquippedEntity
      ? ent.equipment.removeItem(ammoItem, ammoAmount)
      : ent.inventory.removeItem(ammoItem, ammoAmount)
    : false;
}

function ind(lvl = 0) {
  return "  ".repeat(lvl);
}

class ShootPattern {
  spread = 0;
  spacing = 0;
  amount = 1;
  interval = 0;
  burst = 1;
}
class WeaponShootConfiguration {
  pattern = new ShootPattern();
  charge = 0;
  chargeEffect = "none";
  reload = 30;
  readyEffect = "none";
  effect = "shoot";
  recoilScale = 1;
  rotRecoilScale = 1;
  init() {
    this.pattern = constructFromType(this.pattern, ShootPattern);
  }
}
class WeaponBulletConfiguration {
  // Defines possible bullets.
  types = [];
  // Matches ammo items to bullets.
  ammos = {};
  // Hide variations
  unbrowsable = [];
  get(index) {
    if (index instanceof Array) return index.map((i) => this.get(i));
    else return this.types[index] ?? null;
  }
  getAmmo(ammo) {
    if (ammo instanceof Array) return ammo.map((i) => this.getAmmo(i));
    else {
      let def = this.ammos[ammo];
      if (def instanceof Array) return def.map((d) => this.types[d] ?? null);
      return this.types[def] ?? null;
    }
  }
}
export { Weapon, WeaponShootConfiguration, WeaponBulletConfiguration };
