import { constructFromType } from "../../core/constructor.js";
import { BulletModel } from "../projectile/bullet-model.js";

class ShootPattern {
  spread = 0;
  spacing = 0;
  amount = 1;
  interval = 0;
  burst = 1;
}
class WeaponShootConfiguration {
  power = 0;
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
  /** Defines possible bullets. @type {{[item: string]: BulletModel}} */
  types = {};
  /** Bullet models to hide from in-game documentation. */
  unbrowsable = [];
  init() {
    for (const name in this.types) {
      this.types[name] = constructFromType(this.types[name], BulletModel);
    }
  }
  /** @template {string|string[]} T @param {T} ammo @returns {T extends string[] ? BulletModel[] : (BulletModel|undefined)} */
  getAmmo(ammo) {
    if (ammo instanceof Array) return ammo.map(i => this.types[i]);
    else {
      return this.types[ammo];
    }
  }
}
export { ShootPattern, WeaponBulletConfiguration, WeaponShootConfiguration };

