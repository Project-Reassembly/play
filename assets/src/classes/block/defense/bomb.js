import { col } from "../../../core/color.js";
import { rnd, roundNum } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import { drawImg } from "../../../core/ui.js";
import { autoScaledEffect, Explosion, NuclearExplosion } from "../../../play/effects.js";
import { game } from "../../../play/game.js";
import { blockSize } from "../../../scaling.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
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
    if (game.player.team === this.team) super.draw();
    else
      drawImg(this.hiddenImg, this.x, this.y, this.tileSize * blockSize, this.tileSize * blockSize);
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
        (this.detonationDelay +
          (this.accelerable ? rnd.float(-this.delaySpread, this.delaySpread) : 0)) *
        (this.accelerable && this.#wasAccelerated ? 0.6 : 1);
      this._healthbarShowTime = 0;
      this.#detTimer.repeat(() => this.emit(this.fuseEffect), detdelay);
      this.#detTimer.do(() => this._explode(), detdelay);
    }
  }
  _explode() {
    this.break(BreakType.explode);
    autoScaledEffect(this.impactFrame, this.world, this.x, this.y, 0, undefined, true);
    autoScaledEffect(
      this.explosionEffect.includes("~") ?
        this.explosionEffect
      : this.explosionEffect + "~" + (this.explosion.radius ?? 0),
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
      if (
        !(ent instanceof DroppedItemStack) &&
        ent.team !== this.team &&
        this.distanceTo(ent) < this.autoDetonationRange + ent.size
      ) {
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
        `\n  Inflicts #a-${Registries.statuses.get(this.explosion.status).name}#-- for #a-${roundNum((this.explosion.statusDuration ?? 0) / 60, 1)}s`
      : ""
    }\n#=-Detonation:\n  ${
      this.autoDetonationRange > 0 ?
        `#d-${roundNum(this.autoDetonationRange / 30, 1)}#-- tiles enemy detection range`
      : "#d-Manual detonation#-- only"
    }\n  #6-${roundNum(this.detonationDelay / 60, 1)}s#-- fuse`;
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
      this.explosionEffect.includes("~") ?
        this.explosionEffect
      : this.explosionEffect + "~" + (this.explosion.radius ?? 0),
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
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      "🟩Nuclear Explosion:⬜",
      `  ${roundNum((this.explosion.radius ?? 0) / 30, 1)} blocks range`,
      `  ${this.explosion.amount ?? 0} total${this.explosion.type ?? " explosion"} damage`,
      `  ${roundNum(
        this.explosion.knockback ??
          (((this.explosion.amount ?? 0) / ((this.explosion.radius ?? 0) / 4.5)) * 10) ** 0.5,
        1,
      )} knockback per tick`,
      `  ${
        this.explosion.status ?
          "🟨" +
          Registries.statuses.get(this.explosion.status).name +
          " for " +
          roundNum((this.explosion.statusDuration ?? 0) / 60, 1) +
          "s⬜"
        : ""
      }`,
      `  ${roundNum((this.explosion.radius ?? 0) / 4.5 / 6, 1)}s duration`,
      this.autoDetonationRange > 0 ?
        `🟨${roundNum(this.autoDetonationRange / 30, 1)} blocks detection range⬜`
      : "",
      `${roundNum(this.detonationDelay / 60, 1)}s fuse${this.accelerable ? " (±" + roundNum(this.delaySpread / 60, 1) + "s)" : " (exactly)"}`,
      this.volatile ? "🟥volatile⬜" : "",
      "🟨 -------------------- ⬜",
    ];
  }
}

export { Bomb, NuclearBomb };

