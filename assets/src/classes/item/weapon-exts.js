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
  /** Defines possible bullets. @type {BulletModel[]} */
  types = [];
  /** Matches ammo items to bullets. @type {({[item:string]: number|number[]})} */
  ammos = {};
  /** Bullet models to hide from in-game documentation. */
  unbrowsable = [];
  init() {
    this.types.forEach((v, i, a) => (a[i] = constructFromType(v, BulletModel)));
  }
  get(index) {
    if (index instanceof Array) return index.map((i) => this.get(i));
    else return this.types[index] ?? null;
  }
  /** @template {string|string[]} T @param {T} ammo @returns {T extends string[] ? BulletModel[] : (BulletModel|undefined)} */
  getAmmo(ammo) {
    if (ammo instanceof Array) return ammo.map((i) => this.getAmmo(i));
    else {
      let def = this.ammos[ammo];
      if (def instanceof Array) return def.map((d) => this.types[d]);
      return this.types[def];
    }
  }
}
export { ShootPattern, WeaponBulletConfiguration, WeaponShootConfiguration };

