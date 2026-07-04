/**
 * @import { BulletInstance } from "./bullet.js";
 * @import { ShootableObject } from "../physical.js";
 */
import { col } from "../../core/color.js";
import { constructFromType } from "../../core/constructor.js";
import { clamp, rnd, tru, Vector } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { rotatedImg, rotatedShape } from "../../core/ui.js";
import { createLinearEffect, Explosion, NuclearExplosion, repeat } from "../../play/effects.js";
import { Fire } from "../effect/fire.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { Entity } from "../entity/entity.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { BulletModel } from "./bullet-model.js";

// maybe use this pattern later idk
// /** @typedef {{id:symbol,listeners:Set<string>}} ComponentType */
// const listeners = {
//   ontick: Symbol(),
//   onhit: Symbol(),
//   onhits: Symbol(),
//   onkill: Symbol(),
//   onspawn: Symbol(),
//   onexpire: Symbol(),
//   onupdate: Symbol(),
//   ondraw: Symbol(),
// };
// /**
//  * @template T
//  * @param {(T|{[K in keyof listeners]: ((b: BulletInstance) => void)})} definition Events to listen to, and everything else.
//  * @returns {ComponentType}
//  */
// export function registerComponent(definition = {}) {
//   Object.defineProperty(definition, "id", {
//     enumerable: true,
//     writable: false,
//     configurable: false,
//     value: Symbol(),
//   });
//   return definition;
// }

export class BulletComponent {
  /**
   * Called every tick, i.e. whenever the world calls for a tick.
   * ***
   * **Examples:**
   * - Trails
   * @param {BulletInstance} bullet
   */
  ontick(bullet) {}
  /**
   * Called whenever the bullet hits something.
   * ***
   * **Examples:**
   * - Damage
   * - Status effects
   * @param {BulletInstance} bullet
   * @param {ShootableObject} thing
   */
  onhit(bullet, thing) {}
  /**
   * Called before the bullet hits something. Return false to cancel the hit.
   * ***
   * **Examples:**
   * - Hit filters
   * - Pierce
   * @param {BulletInstance} bullet
   * @param {ShootableObject} thing
   * @returns {boolean}
   */
  onhits(bullet, thing) {
    return true;
  }
  /**
   * Called whenever the bullet kills something.
   * ***
   * **Examples:**
   * None currently.
   * @param {BulletInstance} bullet
   * @param {ShootableObject} thing
   */
  onkill(bullet, thing) {}
  /**
   * Called once, when the bullet first ticks.
   * ***
   * **Examples:**
   * - Spawn bullet emission
   * @param {BulletInstance} bullet
   */
  onspawn(bullet) {}
  /**
   * Called once, when the bullet expires.
   * ***
   * **Examples:**
   * - Fragmentation
   * - Area Damage
   * @param {BulletInstance} bullet
   */
  onexpire(bullet) {}
  /**
   * Called for each update, which may happen multiple times per tick.
   * ***
   * **Examples:**
   * - Movement
   * - Tracking
   * - Collision Detection
   * @param {BulletInstance} bullet
   */
  onupdate(bullet) {}
  /**
   * Called for each draw, which happens once per frame.
   * ***
   * **Examples:**
   * - well, drawing.
   * @param {BulletInstance} bullet
   */
  ondraw(bullet) {}
}

export class ExtraUpdatesComponent extends BulletComponent {
  amount = 0;
  /**
   * Called every tick, i.e. whenever the world calls for a tick.
   * ***
   * **Examples:**
   * - Trails
   * @param {BulletInstance} bullet
   */
  ontick(bullet) {
    for (let i = 0; i < this.amount; i++) bullet.update();
  }
}

export class MovementComponent extends BulletComponent {
  speed = 20;
  decel = 0;
  maxSpeed = Infinity;
  onspawn(bullet) {
    bullet.data.set("speed", this.speed);
  }
  /**
   * Called for each update, which may happen multiple times per tick.
   * ***
   * **Examples:**
   * - Movement
   * - Tracking
   * - Collision Detection
   * @param {BulletInstance} bullet
   */
  onupdate(bullet) {
    const spd = bullet.data.get("speed");
    const movevct = Vector.fromAngle(bullet.direction);
    //Scale to speed
    movevct.scale(spd, true);
    //Move
    bullet.move(movevct.x, movevct.y, true);
    if (this.decel) bullet.data.set("speed", clamp(spd - this.decel, 0, this.maxSpeed));
  }
}
export class FollowSetPathComponent extends BulletComponent {
  onspawn(bullet) {
    const steps = bullet.data.get("steps");
    if (steps) {
      bullet.pos = Vector.fromP5(steps.pop());
    }
  }
  /**
   * Called for each update, which may happen multiple times per tick.
   * ***
   * **Examples:**
   * - Movement
   * - Tracking
   * - Collision Detection
   * @param {BulletInstance} bullet
   */
  onupdate(bullet) {
    /** @type {Vector[]} */
    const steps = bullet.data.get("steps");
    if (steps && steps.length !== 0) {
      bullet.pos.copyFrom(steps.pop());
      if (steps.length !== 0) bullet.direction = bullet.pos.sub(steps.at(-1)).scale(-1).angle;
    } else bullet.remove = true;
  }
}

export class InstantMovementComponent extends BulletComponent {
  onspawn(bullet) {
    bullet.data.set("instantMoved", false);
  }
  /**
   * Called for each update, which may happen multiple times per tick.
   * ***
   * **Examples:**
   * - Movement
   * - Tracking
   * - Collision Detection
   * @param {BulletInstance} bullet
   */
  onupdate(bullet) {
    if (bullet.entity?.target && bullet.data.get("instantMoved")) {
      //If a target exists
      const range = bullet.entity.pos.sub(
        new Vector(bullet.entity.target.x, bullet.entity.target.y),
      ).magnitude;
      //find end pos
      let epos = bullet.pos.add(Vector.fromAngleRad(bullet.directionRad).scale(range));
      bullet.x = tx;
      bullet.y = ty;
      bullet.data.set("instantMoved", true);
    }
  }
}

class TrackingComponent extends BulletComponent {
  turnSpeed = 1;
  range = 0;
  onspawn(bullet) {
    bullet.data.set("target", null);
  }
  onhit(bullet) {
    // reset target so pierce works with it
    bullet.data.set("target", null);
  }
  /**@param {BulletInstance} bullet */
  onupdate(bullet) {
    const target = bullet.data.get("target");
    // we need to lock the same target until it's gone
    if (target && !target.dead && !target.remove && bullet.distanceTo(target) < this.range) {
      //If target still there, aim at it
      bullet.rotateTowards(target.x, target.y, this.turnSpeed);
    } // if not, then (try to) find a new one
    else bullet.data.set("target", this.selectTarget(bullet));
  }
  /**@param {BulletInstance} bullet */
  selectTarget(bullet) {
    return null;
  }
}

export class TrackNearestComponent extends TrackingComponent {
  /**@param {BulletInstance} bullet */
  selectTarget(bullet) {
    let selected = null;
    //Closest to bullet
    if (bullet.world) {
      //If the bullet exists
      let minDist = Infinity;
      for (let entity of bullet.world.entities) {
        if (
          !(entity instanceof DroppedItemStack) &&
          entity.team !== bullet.entity.team &&
          !entity.dead &&
          entity.visible &&
          !bullet.componentDeniesHit(entity)
        ) {
          let dist = bullet.distanceTo(entity);
          if (dist < this.range && dist < minDist) {
            //If closer
            selected = entity;
            minDist = dist;
          }
        }
      }
    }
    return selected;
  }
}

// The old 'hovered' tracking type.
export class TrackNearSourceTargetComponent extends TrackingComponent {
  /**@param {BulletInstance} bullet */
  selectTarget(bullet) {
    let selected = null;
    // source target to aim at
    const pt = bullet.entity?.target;
    //Closest to mouse pointer
    if (bullet.world && pt) {
      //If the bullet exists
      let minDist = Infinity;
      selected = bullet.distanceToPoint(pt.x, pt.y) < this.range ? pt : null;
      for (let entity of bullet.world.entities) {
        if (
          !(entity instanceof DroppedItemStack) &&
          entity.team !== bullet.entity.team &&
          !entity.dead &&
          !bullet.componentDeniesHit(entity)
        ) {
          //Only select living entities
          let dist = entity.distanceToPoint(pt.x, pt.y);
          if (dist < this.range && dist < minDist) {
            //If closer
            selected = entity;
            minDist = dist;
          }
        }
      }
    }
    return selected;
  }
}

// old 'mouse' tracking type. Now probably actually useful.
export class TrackSourceTargetComponent extends TrackingComponent {
  selectTarget(bullet) {
    const pt = bullet.entity?.target;
    //Closest to mouse pointer
    if (bullet.distanceToPoint(pt.x, pt.y) < this.range) return pt;
    return null;
  }
}

export class VFXTrailComponent extends BulletComponent {
  effect = "default";
  onupdate(bullet) {
    const from = bullet.lastpos,
      to = bullet.pos;
    if (bullet.world?.particles == null) return;
    if (Registries.vfx.get(this.effect).type === "line-emission")
      createLinearEffect(this.effect, bullet.world, [from, to]);
    else bullet.emit(this.effect);
  }
}

export class ParticleTrailComponent extends BulletComponent {
  colours = [col.from(255, 255, 255, 200)];
  shape = "rhombus";
  width = 0;
  length = 0;
  life = 0;
  light = 0;
  spacing = "speed";
  interval = 3;
  init() {
    this.colours.forEach((v, i, a) => (a[i] = col.convert(v)));
  }
  /**@param {BulletInstance} bullet */
  onupdate(bullet) {
    const spacing =
      this.spacing === "speed" ? (bullet.model.get(MovementComponent)?.speed ?? 1)
      : this.spacing === "timed" ? 1
      : 0;
    const from = bullet.lastpos,
      to = bullet.pos;

    if (bullet.world?.particles != null) this.trail(bullet, from, to, spacing);
  }
  /**@param {BulletInstance} bullet @param {Vector} from @param {Vector} to @param {number} spacing  */
  trail(bullet, from, to, spacing) {
    const poses = from.multiLerp(to, Math.ceil(spacing / this.interval));
    poses.forEach((p) => {
      const trailparticle = new ShapeParticle(
        p.x,
        p.y,
        bullet.directionRad,
        this.life || (bullet.model.lifetime * 1.2) ** 0.6,
        0,
        0,
        this.shape, //flames
        this.colours,
        this.width || bullet.model.hitSize * 1.25,
        0,
        this.width || bullet.model.hitSize * 1.25,
        0,
        0,
      );
      trailparticle.light = this.light;
      bullet.world.particles.push(trailparticle);
    });
  }
}

export class OldTrailComponent extends ParticleTrailComponent {
  /**@param {BulletInstance} bullet  */
  trail(bullet, from, to, spacing) {
    for (let e = 0; e <= spacing; e++) {
      bullet.data.decr("trailCounter");
      if (bullet.data.get("trailCounter") <= 1) {
        let trailparticle = new ShapeParticle(
          bullet.x - e * Math.cos(bullet.directionRad),
          bullet.y - e * Math.sin(bullet.directionRad),
          bullet.directionRad,
          this.life || (bullet.model.lifetime * 1.2) ** 0.4,
          0,
          0,
          this.shape,
          this.colours,
          this.width || bullet.model.hitSize * 1.9,
          0,
          (this.length || bullet.model.hitSize) * this.interval * 0.25,
          (this.length || bullet.model.hitSize) * this.interval * 0.25,
          0,
        );
        trailparticle.light = this.light;
        bullet.world.particles.push(trailparticle);
        bullet.data.set("trailCounter", this.interval);
      }
    }
  }
}

export class MOABAdventureTrailComponent extends ParticleTrailComponent {
  trailColour = col.white;
  trailColourTo = col.transparent;
  init() {
    this.trailColour = col.convert(this.trailColour);
    this.trailColourTo = this.trailColourTo ? col.convert(this.trailColourTo) : this.trailColour;
    delete this.colours;
  }
  /**@param {BulletInstance} bullet @param {Vector} from @param {Vector} to @param {number} spacing  */
  trail(bullet, from, to, spacing) {
    for (let e = 0; e < bullet.model.get(MovementComponent).speed; e++) {
      if (bullet.data.get("trailCounter") <= 0) {
        let v = Vector.fromAngle(this.direction).scale(e);
        bullet.world.particles.push(
          new ShapeParticle(
            bullet.x - v.x,
            bullet.y - v.y,
            bullet.directionRad,
            bullet.model.lifetime * 0.75,
            0,
            0,
            this.shape,
            this.trailColour,
            this.trailColourTo,
            this.width * 1.9,
            0,
            bullet.model.hitSize * this.interval * 0.25,
            bullet.model.hitSize * this.interval * 0.25,
            0,
          ),
        );
        bullet.data.set("trailCounter", this.interval);
      } else {
        bullet.data.decr("trailCounter");
      }
    }
  }
}

export class PierceComponent extends BulletComponent {
  amount = 0;
  lifeOnHit = 0;
  onspawn(bullet) {
    bullet.data.set("pierce", this.amount);
    bullet.data.set("pierced", []);
  }
  onhits(bullet, thing) {
    return !bullet.data.get("pierced").includes(thing);
  }
  onhit(bullet, thing) {
    const p = bullet.data.get("pierce");
    if (p > 0 && bullet.remove) {
      if (this.lifeOnHit) bullet.lifetime += this.lifeOnHit;
      bullet.remove = false;
      bullet.data.set("pierce", p - 1);
      bullet.data.get("pierced").push(thing);
    }
  }
}
export class InfinitePierceComponent extends BulletComponent {
  lifeOnHit = 0;
  onspawn(bullet) {
    bullet.data.set("pierced", []);
  }
  onhits(bullet, thing) {
    return !bullet.data.get("pierced").includes(thing);
  }
  onhit(bullet, thing) {
    if (bullet.remove) {
      if (this.lifeOnHit) bullet.lifetime += this.lifeOnHit;
      bullet.remove = false;
      bullet.data.get("pierced").push(thing);
    }
  }
}
export class DamageComponent extends BulletComponent {
  damageType = "normal";
  amount = 0;
  spread = 0;
  /**
   * @param {BulletInstance} bullet
   * @param {ShootableObject} thing
   */
  onhit(bullet, thing) {
    thing.damage(
      this.damageType,
      this.amount + rnd.float(-this.spread, this.spread),
      bullet.entity,
    );
  }
}
// old 'conditionalPierce'
export class DamagePierceComponent extends BulletComponent {
  damageType = "normal";
  amount = 0;
  onspawn(bullet) {
    bullet.data.set("pierce-damage", this.amount);
    bullet.data.set("pierced", []);
  }
  onhits(bullet, thing) {
    return !bullet.data.get("pierced").includes(thing);
  }
  onhit(bullet, thing) {
    let amount = bullet.data.get("pierce-damage");
    const taken = Math.min(amount, thing.health);

    thing.damage(this.damageType, taken, bullet.entity);
    amount -= taken;
    bullet.data.set("pierce-damage", amount);
    if (amount > 0) {
      bullet.remove = false;
      bullet.data.get("pierced").push(thing);
    }
  }
}

export class StatusInflictionComponent extends BulletComponent {
  effect = "none";
  duration = 180;
  /**
   * @param {BulletInstance} bullet
   * @param {ShootableObject} thing
   */
  onhit(bullet, thing) {
    if (thing instanceof Entity) {
      thing.applyStatus(this.effect, this.duration);
    }
  }
}

export class KnockbackComponent extends BulletComponent {
  amount = 2;
  onhit(bullet, thing) {
    if (thing instanceof Entity) {
      thing.knockback(this.amount, bullet.direction);
    }
  }
}
export class InstantKnockbackComponent extends BulletComponent {
  amount = 2;
  onhit(bullet, thing) {
    if (thing instanceof Entity) {
      thing.knock(this.amount * 10, bullet.direction);
    }
  }
}

export class ImageDrawerComponent extends BulletComponent {
  image = "error";
  width = 20;
  height = 20;
  ondraw(bullet) {
    rotatedImg(this.image, bullet.x, bullet.y, this.width, this.height, bullet.directionRad);
  }
}
export class ShapeDrawerComponent extends BulletComponent {
  shape = "rect";
  width = 20;
  height = 20;
  fill = col.red;
  init() {
    this.fill = col.convert(this.fill);
  }
  ondraw(bullet) {
    noStroke();
    col.fill(this.fill);
    rotatedShape(this.shape, bullet.x, bullet.y, this.width, this.height, bullet.directionRad);
  }
}
class TraceComponent extends BulletComponent {
  onspawn(bullet) {
    bullet.data.set("positions", []);
  }
  onupdate(bullet) {
    bullet.data.get("positions").push(bullet.pos.clone());
  }
  onexpire(bullet) {
    bullet.data.get("positions").push(bullet.pos.clone());
  }
}
export class LinearVFXTraceComponent extends TraceComponent {
  effect = "none";
  onexpire(bullet) {
    super.onexpire(bullet);
    createLinearEffect(this.effect, bullet.world, bullet.data.get("positions"));
  }
}
/** Traces the bullet's path with a different bullet. */
export class BulletTraceComponent extends TraceComponent {
  /**@type {BulletModel} */
  bullet = {};
  number = 1;
  direction = 0;
  spread = 0;
  spacing = 0;
  init() {
    this.bullet = constructFromType(this.bullet, BulletModel);
    this.bullet.add(FollowSetPathComponent);
    this.bullet.removeAll(MovementComponent);
    this.bullet.removeAll(InstantMovementComponent);
  }
  onexpire(bullet) {
    super.onexpire(bullet);

    const bullets = this.bullet.emit(
      bullet.x,
      bullet.y,
      this.number,
      bullet.direction + this.direction,
      this.spread,
      this.spacing,
      bullet.world,
      bullet.entity,
    );
    bullets.forEach((b) => {
      b.data.set("steps", bullet.data.get("positions").toReversed());
      b.oncreated();
    });
  }
}

export class SpawnVFXComponent extends BulletComponent {
  effect = "none";
  /** impact frame helper */
  frame = "none";
  onspawn(bullet) {
    bullet.emit(this.frame, 0, 0, true);
    bullet.emit(this.effect);
  }
}
export class HitVFXComponent extends BulletComponent {
  effect = "none";
  /** impact frame helper */
  frame = "none";
  onhit(bullet) {
    bullet.emit(this.frame, 0, 0, true);
    bullet.emit(this.effect);
  }
}
export class ExpiryVFXComponent extends BulletComponent {
  effect = "none";
  /** impact frame helper */
  frame = "none";
  /**@param {BulletInstance} bullet */
  onexpire(bullet) {
    bullet.emit(this.frame, 0, 0, true);
    bullet.emit(this.effect);
  }
}
export class KillVFXComponent extends BulletComponent {
  effect = "none";
  /** impact frame helper */
  frame = "none";
  onkill(bullet) {
    bullet.emit(this.frame, 0, 0, true);
    bullet.emit(this.effect);
  }
}

export class ExplosionComponent extends BulletComponent {
  damage = 0;
  damageType = "explosion";
  knockback = NaN;
  radius = 0;
  spread = 0;
  effect = "explosion";
  /**@param {BulletInstance} bullet  */
  onexpire(bullet) {
    //If it explodes
    const boom = new Explosion({
      amount: this.damage,
      type: this.damageType,
      knockback: this.knockback,
      radius: this.radius,
      spread: this.spread,
      effect: this.effect,
    });
    boom.x = bullet.x;
    boom.y = bullet.y;
    boom.world = bullet.world;
    boom.source = bullet.entity;
    const stat = bullet.model.get(StatusInflictionComponent);
    if (stat) {
      boom.status = stat.effect;
      boom.statusDuration = stat.duration;
    }
    boom.create();
    boom.dealDamage();
  }
}

export class HitExplosionComponent extends BulletComponent {
  damage = 0;
  damageType = "explosion";
  knockback = NaN;
  radius = 0;
  spread = 0;
  effect = "explosion";
  /**@param {BulletInstance} bullet @param {ShootableObject} thing   */
  onhit(bullet, thing) {
    //If it explodes
    const boom = new Explosion({
      amount: this.damage,
      type: this.damageType,
      knockback: this.knockback,
      radius: this.radius,
      spread: this.spread,
      effect: this.effect,
    });
    boom.x = bullet.x;
    boom.y = bullet.y;
    boom.world = bullet.world;
    boom.source = bullet.entity;
    const stat = bullet.model.get(StatusInflictionComponent);
    if (stat) {
      boom.status = stat.effect;
      boom.statusDuration = stat.duration;
    }
    boom.create();
    boom.dealDamage();
  }
}
export class NuclearExplosionComponent extends BulletComponent {
  damage = 0;
  damageType = "explosion";
  knockback = NaN;
  radius = 0;
  spread = 0;
  effect = "explosion";
  /**@param {BulletInstance} bullet  */
  onexpire(bullet) {
    //If it explodes
    let boom = new NuclearExplosion({
      amount: this.damage,
      type: this.damageType,
      knockback: this.knockback,
      radius: this.radius,
      spread: this.spread,
      effect: this.effect,
    });
    boom.x = bullet.x;
    boom.y = bullet.y;
    boom.world = bullet.world;
    boom.source = bullet.entity;
    const stat = bullet.model.get(StatusInflictionComponent);
    if (stat) {
      boom.status = stat.effect;
      boom.statusDuration = stat.duration;
    }
    boom.dealDamage();
  }
}

class BulletEmissionComponent extends BulletComponent {
  /**@type {BulletModel} */
  bullet = {};
  number = 1;
  direction = 0;
  spread = 0;
  spacing = 0;

  speedMin = 0.8;
  speedMax = 1.2;
  init() {
    this.bullet = constructFromType(this.bullet, BulletModel);
  }
  emit(bullet) {
    this.bullet.emit(
      bullet.x,
      bullet.y,
      this.number,
      bullet.direction + this.direction,
      this.spread,
      this.spacing,
      bullet.world,
      bullet.entity,
      this.speedMin,
      this.speedMax,
    );
  }
}

export class FragBulletComponent extends BulletEmissionComponent {
  onexpire(bullet) {
    this.emit(bullet);
  }
}
export class HitBulletComponent extends BulletEmissionComponent {
  onhit(bullet) {
    this.emit(bullet);
  }
}
export class SpawnBulletComponent extends BulletEmissionComponent {
  onspawn(bullet) {
    this.emit(bullet);
  }
}
export class KillBulletComponent extends BulletEmissionComponent {
  onkill(bullet) {
    this.emit(bullet);
  }
}
export class IntervalBulletComponent extends BulletEmissionComponent {
  interval = 0;
  onspawn(bullet) {
    bullet.data.set("intervalCounter", 0);
  }
  onupdate(bullet) {
    let i = bullet.data.get("intervalCounter");
    i--;
    if (i <= 0) {
      this.emit(bullet);
      bullet.data.set("intervalCounter", this.interval);
    } else {
      bullet.data.set("intervalCounter", i);
    }
  }
}
export class IncendiaryComponent extends BulletComponent {
  fire = {};
  chance = 1;
  count = 0;
  spread = 0;
  /** If true, the number of fires created (`F`) will follow a binomial distribution: `F ~ B(fires,fireChance)`.\
   * Each fire will have `fireChance` probability of being created.\
   * If this is the case, the mean number of fires will be `fireChance * fires`, with variance `fireChance * (1 - fireChance) * fires`.\
   * If false, all fire will be created at once with a probability of `fireChance`.\
   * Generally, this option allows any integer number of fires between 0 and `fires` to spawn, whereas, with this off, the only options are `fires` fires, or no fires.
   */
  binomial = false;
  onexpire(bullet) {
    if (this.binomial)
      repeat(this.count, () => {
        if (tru(this.chance))
          Fire.create(
            Object.assign(this.fire, {
              x: bullet.x + rnd.float(this.spread, -this.spread),
              y: bullet.y + rnd.float(this.spread, -this.spread),
              world: bullet.world,
              team: bullet.entity.team,
            }),
          );
      });
    else if (tru(this.chance))
      repeat(this.count, () =>
        Fire.create(
          Object.assign(this.fire, {
            x: bullet.x + rnd.float(this.spread, -this.spread),
            y: bullet.y + rnd.float(this.spread, -this.spread),
            world: bullet.world,
            team: bullet.entity.team,
          }),
        ),
      );
  }
}

export class DisableDefaultVFXComponent extends BulletComponent {}
export class NoEntityCollisionComponent extends BulletComponent {}
export class NoBlockCollisionComponent extends BulletComponent {}
export class CollisionFilterComponent extends BulletComponent {}
