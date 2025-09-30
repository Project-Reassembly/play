import { constructFromType } from "../../core/constructor.js";

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
export {ShootPattern, WeaponBulletConfiguration, WeaponShootConfiguration}