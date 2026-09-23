import { col } from "../../../core/color.js";
import { rnd, roundNum, time } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import { drawImg } from "../../../core/ui.js";
import { autoScaledEffect, Explosion, NuclearExplosion } from "../../../play/effects.js";
import { game } from "../../../play/game.js";
import { blockSize } from "../../../scaling.js";
import { Timer } from "../../timer.js";
import { Block, BreakType } from "../block.js";
class Bomb extends Block {
  explosion = { radius: 100, amount: 100 };
  explosionEffect = "explosion";
  autoDetonationRange = 50;
  triggerEffect = "none";
  impactFrame = "none";
  fuseEffect = "none";
  detonationDelay = 60;
  delaySpread = 20;

  hiddenImg = "inherit";

  volatile = true;
  accelerable = true;
  #detTimer = new Timer();
  #wasAccelerated = false;

  wasActivated = false;
  init() {
    super.init();
    col.autonorm(this.explosion);
    if (this.hiddenImg === "inherit") this.hiddenImg = this.image;
  }
  draw() {
    if (game.player.entity.team === this.team) super.draw();
    else drawImg(this.hiddenImg, this.x, this.y, this.tileSize * blockSize, this.tileSize * blockSize);
  }
  interaction(ent, item) {
    if (keyIsDown(SHIFT)) {
      this.#wasAccelerated = false;
      this.activated();
      return true;
    }
    return super.interaction(ent, item);
  }
  activated() {
    if (!this.wasActivated) {
      this.emit(this.triggerEffect);
      this.wasActivated = true; // stop recursive death
      this.health = 0;
      let detdelay =
        (this.detonationDelay + (this.accelerable ? rnd.float(-this.delaySpread, this.delaySpread) : 0))
        * (this.accelerable && this.#wasAccelerated ? 0.6 : 1);
      this._healthbarShowTime = 0;
      this.#detTimer.repeat(() => this.emit(this.fuseEffect), detdelay);
      this.#detTimer.do(() => this._explode(), detdelay);
    }
  }
  _explode() {
    this.break(BreakType.explode);
    autoScaledEffect(this.impactFrame, this.world, this.x, this.y, 0, undefined, true);
    autoScaledEffect(
      this.explosionEffect.includes("~") ? this.explosionEffect : this.explosionEffect + "~" + (this.explosion.radius ?? 0),
      this.world,
      this.x,
      this.y,
      0,
    );
    let ex = new Explosion(this.explosion);
    ex.x = this.x;
    ex.y = this.y;
    ex.world = this.world;
    ex.source = this;
    ex.dealDamage();
  }
  tick() {
    super.tick();
    this.#detTimer.tick();
    for (let ent of this.world.entities) {
      if (ent.team !== this.team && this.distanceTo(ent) < this.autoDetonationRange + ent.size) {
        this.activated();
        return;
      }
    }
    return;
  }
  break(type) {
    if (type !== BreakType.deconstruct && type !== BreakType.explode) {
      this.#wasAccelerated = false;
      this.activated();
      return true;
    }
    return super.break(type);
  }
  createExtendedDetails() {
    return `#=-Explosion:\n  #e-${roundNum((this.explosion.radius ?? 0) / 30, 1)}#-- tiles range\n  #c-${this.explosion.amount ?? 0}${this.explosion.type ?? " explosion"}#-- damage${
      this.explosion.status ?
        `\n  Inflicts #a-${Registries.statuses.get(this.explosion.status).name}#-- for #a-${time(this.explosion.statusDuration ?? 0)}`
      : ""
    }\n#=-Detonation:\n  ${
      this.autoDetonationRange > 0 ?
        `#d-${roundNum(this.autoDetonationRange / 30, 1)}#-- tiles enemy detection range`
      : "#d-Manual detonation#-- only"
    }\n  #6-${time(this.detonationDelay)}#-- fuse`;
  }
}
class NuclearBomb extends Bomb {
  explosion = { radius: 250, amount: 1000 };
  autoDetonationRange = 100;
  explosionEffect = "nuke";
  _explode() {
    this.break(BreakType.explode);
    autoScaledEffect(this.impactFrame, this.world, this.x, this.y, 0, undefined, true);
    autoScaledEffect(
      this.explosionEffect.includes("~") ? this.explosionEffect : this.explosionEffect + "~" + (this.explosion.radius ?? 0),
      this.world,
      this.x,
      this.y,
      0,
    );
    let ex = new NuclearExplosion(this.explosion);
    ex.x = this.x;
    ex.y = this.y;
    ex.world = this.world;
    ex.source = this;
    ex.dealDamage();
  }
  createExtendedDetails() {
    return super.createExtendedDetails().replace("Explosion:\n", "Explosion:\n  #a*Nuclear!");
  }
}

export { Bomb, NuclearBomb };

