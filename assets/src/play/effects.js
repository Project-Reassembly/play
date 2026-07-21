import { ExecutorParticle } from "../classes/effect/extra-particles.js";
import { ImageParticle } from "../classes/effect/image-particle.js";
import { ShapeParticle } from "../classes/effect/shape-particle.js";
import { TextParticle } from "../classes/effect/text-particle.js";
import { WaveParticle } from "../classes/effect/wave-particle.js";
/* @import { Entity } from "../classes/entity/entity.js"; */
import { PhysicalObject, ShootableObject } from "../classes/physical.js";
import { Timer } from "../classes/timer.js";
import { col } from "../core/color.js";
import { assign, construct } from "../core/constructor.js";
import { Vector, clamp, rnd, tru } from "../core/number.js";
import { RegisteredItem } from "../core/registered-item.js";
import { Registries } from "../core/registry.js";
import { effects, world } from "../play/game.js";
import { blockSize } from "../scaling.js";
import { LinearEffect } from "./line-effects.js";
const effectTimer = new Timer();
class Explosion {
  x = 0;
  y = 0;
  /** @type {import("../classes/world/world.js").World} */
  world = null;
  knockback = NaN;
  radius = 0;
  amount = 0;
  spread = 0;
  type = "explosion";
  status = "none";
  statusDuration = 0;
  team = "neutral";
  source = null;
  effect = "explosion";
  /**@param {import("../lib/integrate.js").Unconstructed<Explosion>} [opts={}]  */
  constructor(opts = {}) {
    assign(this, opts);
  }
  //Basic explosion
  create() {
    //Most of these powers are just to make it less insane at high radii
    //They are tested repeatedly to make sure they look good
    createEffect(this.effect, this.world, this.x, this.y, 0, this.radius);
    //this.dealDamage();
    return this;
  }
  dealDamage(knockmul = 1, sizemul = 1, damagemul = 1) {
    this.team = this.source?.team ?? this.team;
    // Hit blocks
    // const damage = new VirtualBullet();
    // damage.x = this.x;
    // damage.y = this.y;
    // damage.components.push({
    //   type: "damage",
    //   amount: this.amount * damagemul,
    //   spread: this.spread,
    //   damageType: this.type,
    // });
    // if (this.status !== "none")
    //   damage.components.push({
    //     type: "status-infliction",
    //     effect: this.status,
    //     duration: this.statusDuration,
    //   });
    // damage.components.push({ type: "infinite-pierce" });
    // damage.team = this.source?.team ?? this.team;
    // damage.hitSize = this.radius * sizemul;
    // damage.entity = this.source;
    // damage.world = this.world;
    // damage.init();
    // damage.oncreated();
    // this.world.bullets.push(damage);
    // damage.step(1);
    // Hit entities
    // for (let e of this.world.entities) {
    //   //If hit
    //   if (!e.dead) {
    //     let dist = Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2) || 1;
    //     let scalar = knockmul * 25;
    //     e.knockback(
    //       clamp(
    //         ((!isNaN(this.knockback) ? this.knockback : this.amount) * scalar) / dist ** 2,
    //         0,
    //         128,
    //       ),
    //       new Vector(e.x - this.x, e.y - this.y).angle,
    //     );
    //   }
    // }
    const rad = this.radius * sizemul;
    this.world
      .blocksInSquare(
        Math.round(this.x / blockSize),
        Math.round(this.y / blockSize),
        Math.ceil(this.radius / blockSize),
      )
      .forEach((block) => {
        if (block) {
          const dist = block.epos.subXY(this.x, this.y).magnitude;
          if (dist <= rad + blockSize * 0.5) this.hitB(block, dist, damagemul);
        }
      });
    this.world.entities.forEach((entity) => {
      const dist = entity.pos.subXY(this.x, this.y).magnitude;
      if (
        entity.tangible &&
        dist <= rad + entity.hitSize * 0.5
      )
        this.hitE(entity, dist, knockmul, damagemul);
    });
    return this;
  }
  /** @param {ShootableObject} thing @param {number} fromdist */
  hit(thing, fromdist, damagemul = 1) {
    if (thing.team !== this.team) thing.damage(this.type, (this.amount + rnd.float(-this.spread, this.spread)) * damagemul, this.source);
  }
  /** @param {import("../classes/entity/entity.js").Entity} thing @param {number} fromdist */
  hitE(thing, fromdist, knockmul = 1, damagemul = 1) {
    this.hit(thing, fromdist, damagemul);
    if (this.status !== "none" && thing.team !== this.team)
      thing.applyStatus(this.status, this.statusDuration);
    const scale = knockmul * 25;
    thing.knockback(
      clamp(
        ((!isNaN(this.knockback) ? this.knockback : this.amount) * scale) / fromdist ** 2,
        0,
        128,
      ),
      thing.pos.subXY(this.x, this.y).angle,
    );
  }
  /** @param {import("../classes/block/block.js").Block} thing @param {number} fromdist */
  hitB(thing, fromdist, damagemul = 1) {
    this.hit(thing, fromdist, damagemul);
    if(thing._explode) thing.activated();
  }
}

class NuclearExplosion extends Explosion {
  effect = "nuke";
  status = "nuclear-fire";
  statusDuration = 1080;
  constructor(opts = {}) {
    super(opts);
    assign(this, opts);
    this.amount /= this.radius * 3;
  }
  dealDamage() {
    for (const e of this.world.entities)
      if (!e.dead)
        e.applyStatus(
          this.status,
          clamp(
            this.radius * 16 * Math.SQRT2 - e.distanceToPoint(this.x, this.y),
            0,
            this.statusDuration,
          ),
        );
    effectTimer.repeat((i) => {
      super.dealDamage(12, 4);
    }, this.radius * 3);
    effectTimer.do(
      () => {
        super.dealDamage(22, 30, this.radius);
        effects.shake(this.x, this.y, Math.sqrt(this.radius), 240);
      },
      Math.min(120, this.radius * 3 ** 0.4),
    );
    return this;
  }
}

function createDestructionExplosion(x, y, source) {
  if (source.explosiveness === 0) {
    new Explosion({
      x: x,
      y: y,
      amount: source.maxHealth * 0.1,
      radius: (source.width + source.height) * 0.5,
      source: source,
      world: source.world,
    }).create();
    return;
  }
  new Explosion({
    x: x,
    y: y,
    amount: source.maxHealth * source.explosiveness,
    radius: (source.width + source.height) * source.explosiveness * 5,
    source: source,
    world: source.world,
  })
    .create()
    .dealDamage();
}
function liquidDestructionBlast(
  x,
  y,
  scalar,
  colour = col.black,
  colourTo = col.black,
  variation = col.black,
  fragments = [],
  world,
) {
  let rootMHP = scalar ** 0.45;
  let smallerRootMHP = scalar ** 0.23;
  let blotSize = 20 + 3 * smallerRootMHP;
  for (let i = 0; i < rootMHP; i++) {
    world.floorParticles.push(
      new ShapeParticle(
        x,
        y,
        rnd.float(0, 360),
        rnd.float(1800, 3600),
        rnd.float(0.02, 0.2) * (3 + smallerRootMHP * 4 ** 1.1),
        0.5,
        "circle",
        [col.mult(colour, rnd.float(0.8, 1.2)), col.hide(col.mult(colourTo, rnd.float(0.8, 1.2)))],
        blotSize,
        blotSize / 2,
        blotSize,
        blotSize / 2,
      ),
    );
  }
  for (let component of fragments) {
    let componentSize = (component.width + component.height) / 2;
    world.particles.push(
      new ExecutorParticle(
        new ImageParticle(
          x,
          y,
          rnd.float(0, 360),
          rnd.float(2400, 5400),
          rnd.float(0.5, 0.7) * (3 + smallerRootMHP * 3),
          0.5,
          component.image,
          10,
          0,
          component.width,
          component.width,
          component.height,
          component.height,
        ),
        (ix, iy, speed) => {
          if (speed > 0.1) {
            world.floorParticles.push(
              new ShapeParticle(
                ix,
                iy,
                rnd.float(0, 360),
                rnd.float(1800, 3600),
                rnd.float(0.5, 1),
                0.1,
                "circle",
                [
                  col.mult(colour, rnd.float(0.8, 1.2)),
                  col.hide(col.mult(colourTo, rnd.float(0.8, 1.2))),
                ],
                componentSize / 2,
                componentSize / 4,
                componentSize / 2,
                componentSize / 4,
              ),
            );
          }
        },
        1,
      ),
    );
  }
}
//Never used, just testing
function insanity() {
  //insanity death
  effects.shadeColour = [0, 0];
  effects.lightColour = [255, 100];
  effects.lightScale = 1;
  effects.lighting = true;
  effectTimer.repeat((i) => {
    effects.shadeColour = [0, i];
    effects.lightColour = [255, 100 - i / 2.5];
  }, 250);
  effectTimer.do(
    () =>
      effectTimer.repeat((i) => {
        effects.shadeColour = [i / 10, 0, 0, 250];
        effects.lightColour = [255, i / 25];
      }, 250),
    750,
  );
  effectTimer.do(
    () =>
      effectTimer.repeat((i) => {
        effects.shadeColour = [25 + i * 2.5, 0, 0, 250 + i / 5];
        effects.lightColour = [255, 10 + i * 1.5];
        effects.lightScale = 1 - i / 27.5;
      }, 25),
    1500,
  );
  effectTimer.repeat((i) => {
    let dir = rnd.float(0, TAU);
    let dist = rnd.float(30, 600);
    let p = new ShapeParticle(
      game.player.x + cos(dir) * dist,
      game.player.y + sin(dir) * dist,
      dir,
      60,
      0,
      0,
      "rhombus",
      [0],
      10,
      0,
      25,
      25,
      0,
      240,
    );
    world.particles.push(p);
  }, 1500);
  effectTimer.do(() => {
    for (let j = 0; j < 100; j++) game.player.damage("insanity", rnd.float(100, 1000));
    effects.lightScale = 0;
    effectTimer.repeat((i) => {
      effects.lightScale = i / 60;
      effects.lightColour = [255, 47.5 + i * 2];
      effects.shadeColour = [85, 0, 0, 254.8 - (254.8 * i) / 60];
    }, 60);
  }, 1560);
  effectTimer.do(() => {
    effects.shadeColour = [0, 0];
    effects.lightColour = [255, 100];
    effects.lighting = false;
  }, 1740);
}

//#### Actual Effect Classes ####
/**Sort of abstract class for visual effects. */
class VisualEffect extends RegisteredItem {
  parentise = false;
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {}
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: 0, y: 0, direction: 0 }),
    impact = false,
  ) {
    if (this.parentise) {
      let p = pos();
      this.create(world, p.x, p.y, p.direction, scale, impact);
    } else this.create(world, x, y, direction, scale, impact);
  }
}
/**Extended class for repeated creation of a visual effect */
class EmissionEffect extends VisualEffect {
  emissions = 1;
  interval = 0;
  amount = 1;
  delay = 0;
  x = 0;
  maxXOffset = 0;
  y = 0;
  maxYOffset = 0;
  isFloor = false;
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: x, y: y, direction: direction }),
    impact = false,
  ) {
    let fn = () =>
      this.create(
        world,
        x + rnd.float(this.maxXOffset, -this.maxXOffset),
        y + rnd.float(this.maxYOffset, -this.maxYOffset),
        direction,
        scale,
        impact,
      );
    if (this.parentise) {
      fn = () => {
        let p = pos();
        this.create(
          world,
          p.x + rnd.float(this.maxXOffset, -this.maxXOffset),
          p.y + rnd.float(this.maxYOffset, -this.maxYOffset),
          p.direction,
          scale,
          impact,
        );
      };
    }
    if (this.emissions > 1) effectTimer.repeat(fn, this.emissions, this.interval, this.delay);
    else effectTimer.do(fn, this.delay);
  }
  getParticleArray(world, impact) {
    return (
      impact ? world.impactParticles
      : this.isFloor ? world.floorParticles
      : world.particles
    );
  }
}
/**A container for many effects at once. */
class MultiEffect extends VisualEffect {
  /**@type {VisualEffect[]} */
  effects = [];
  init() {
    this.effects = this.effects.map((x) => construct(x, "visual-effect"));
  }
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: x, y: y, direction: direction }),
    impact = false,
  ) {
    this.effects.forEach((z) => z.execute(world, x, y, direction, scale, pos, impact));
  }
}

class ParticleEmissionEffect extends EmissionEffect {
  cone = 360;
  //Contains properties for image and text particles too
  particle = {
    //All
    lifetime: 60,
    direction: 0,
    speed: 1,
    decel: 0.015,
    rotateSpeed: 0,
    light: 0,
    //Shape
    shape: "circle",
    //Shape/Image
    widthFrom: 20,
    widthTo: 30,
    heightFrom: 20,
    heightTo: 30,
    //Shape/Text/Wave
    colours: [
      [50, 50, 50, 100],
      [100, 100, 100, 0],
    ],
    //Text
    text: "text",
    useOCR: true,
    sizeFrom: 20,
    sizeTo: 10,
    //Image
    image: "error",
    opacityFrom: 1,
    opacityTo: 1,
    //Wave
    radiusFrom: 0,
    radiusTo: 100,
    strokeFrom: 10,
    strokeTo: 0,
    //all
    space: false,
  };
  init() {
    this.particle.colours = (this.particle.colours ?? []).map(col.convert);
  }
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new ShapeParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd.float(-(this.cone ?? 360) / 2, (this.cone ?? 360) / 2),
            ),
          this.particle.lifetime ?? 60,
          this.particle.speed ?? 1,
          this.particle.decel ?? 0.015,
          this.particle.shape ?? "circle",
          this.particle.colours ?? [col.from(50, 50, 50, 100), col.from(100, 100, 100, 0)],
          this.particle.widthFrom ?? 20,
          this.particle.widthTo ?? 30,
          this.particle.heightFrom ?? 20,
          this.particle.heightTo ?? 30,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.light ?? 0,
          this.particle.space,
        ),
      ),
    );
  }
}

class ImageParticleEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new ImageParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd.float(-(this.cone ?? 360) / 2, (this.cone ?? 360) / 2),
            ),
          this.particle.lifetime ?? 60,
          this.particle.speed ?? 1,
          this.particle.decel ?? 0.015,
          this.particle.image,
          this.particle.opacityFrom ?? 1,
          this.particle.opacityTo ?? 1,
          this.particle.widthFrom ?? 20,
          this.particle.widthTo ?? 30,
          this.particle.heightFrom ?? 20,
          this.particle.heightTo ?? 30,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.space,
        ),
      ),
    );
  }
}

class TextParticleEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new TextParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd.float(-(this.particle.cone ?? 360) / 2, (this.particle.cone ?? 360) / 2),
            ),
          this.particle.lifetime ?? 60,
          this.particle.speed ?? 1,
          this.particle.decel ?? 0.015,
          this.particle.text,
          this.particle.colours ?? [col.from(50, 50, 50, 100), col.from(100, 100, 100, 0)],
          this.particle.sizeFrom ?? 20,
          this.particle.sizeTo ?? 30,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.useOCR ?? true,
          this.particle.space,
        ),
      ),
    );
  }
}

class WaveEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    repeat(this.amount, () =>
      this.getParticleArray(world, impact).push(
        new WaveParticle(
          x,
          y,
          this.particle.lifetime ?? 60,
          this.particle.radiusFrom ?? 0,
          this.particle.radiusTo ?? 100,
          this.particle.colours ?? [col.from(50, 50, 50, 100), col.from(100, 100, 100, 0)],
          this.particle.strokeFrom ?? 10,
          this.particle.strokeTo ?? 0,
          this.particle.light ?? 0,
          this.particle.space,
        ),
      ),
    );
  }
}

class ExplosionEffect extends VisualEffect {
  sparkColours = [
    [255, 245, 215, 255],
    [255, 215, 0, 55],
  ]; //The colour the sparks go to
  smokeColours = [
    [255, 255, 255, 150],
    [255, 255, 100, 150],
    [255, 100, 50, 100],
    [100, 100, 100, 100],
    [100, 100, 100, 80],
    [100, 100, 100, 70],
    [100, 100, 100, 60],
    [100, 100, 100, 50],
    [100, 100, 100, 40],
    [100, 100, 100, 30],
    [100, 100, 100, 20],
    [100, 100, 100, 10],
    [100, 100, 100, 0],
  ]; //The colour the smoke starts at
  waveColours = [
    [255, 255, 255, 255],
    [255, 128, 0, 0],
  ]; //The colour the wave ends at. It always starts white.
  smoke = true;
  sparks = true;
  wave = true;
  shake = true;
  isSpace = false;
  init() {
    this.sparkColours = this.sparkColours.map(col.convert);
    this.smokeColours = this.smokeColours.map(col.convert);
    this.waveColours = this.waveColours.map(col.convert);
  }
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    //Spawn smoke
    if (this.smoke)
      for (let i = 0; i < scale ** 0.6; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            radians(rnd.float(0, 360)),
            rnd.float(scale ** 0.6, scale ** 0.7 * 2) * 6,
            rnd.float(scale ** 0.25 * 0.3, scale ** 0.25 * 0.5),
            0.01,
            "circle",
            this.smokeColours,
            scale ** 0.8 * 1.5,
            0,
            scale ** 0.8 * 1.5,
            0,
            0,
            true,
            this.isSpace,
          ),
        );
      }
    //Yellow sparks
    if (this.sparks)
      for (let i = 0; i < scale ** 0.7; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            radians(rnd.float(0, 360)),
            rnd.float(scale ** 0.75, scale ** 0.75 * 1.5),
            rnd.float(scale ** 0.25 * 0.1, scale ** 0.25 * 2),
            0.075,
            "rect",
            this.sparkColours,
            scale ** 0.5,
            0,
            scale ** 0.75,
            scale ** 0.5,
            0,
            100,
            this.isSpace,
          ),
        );
      }
    if (this.wave)
      world.particles.push(
        new WaveParticle(x, y, 30, 0, scale, this.waveColours, scale ** 0.75, 0, 20, this.isSpace),
      );
    //Screen shake
    if (this.shake && this.radius > 30) {
      effects.shake(this.x, this.y, this.radius ** 0.75, this.radius ** 0.75);
    }
  }
}

class NuclearExplosionEffect extends ExplosionEffect {
  flashColours = [
    [255, 255, 255],
    [255, 255, 200, 0],
  ];
  flashColoursLight = [
    [255, 255, 255],
    [255, 255, 200, 0],
  ];
  fireColours = [
    [255, 255, 255, 100],
    [255, 255, 0, 66.7],
    [255, 128, 0, 33.3],
    [155, 0, 0, 0],
  ];
  _reverseFireColours = [];
  _fadeInFireColours = [];
  init() {
    this.fireColours = this.fireColours.map(col.convert);
    this.flashColours = this.flashColours.map(col.convert);
    this.flashColoursLight = this.flashColoursLight.map(col.convert);

    this._reverseFireColours = this.fireColours.reverse().slice(1);
    this.fireColours.reverse();
    this._fadeInFireColours = [col.hide(col.white)].concat(this.fireColours.slice(1));
  }
  flash = true;
  mushroom = true;
  create(world, x = 0, y = 0, direction = 0, scale = 1, impact = false) {
    let flashSize = scale ** 1.6;
    let flashAmount = scale ** 0.6;
    let size = scale;
    if (this.flash)
      for (let i = 0; i < flashAmount; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            rnd.float(0, TAU),
            rnd.float(3, 9) * size ** 0.65,
            0,
            0,
            "inverted-triangle",
            this.flashColours,
            0,
            flashSize * 2,
            flashSize ** 0.95,
            flashSize ** 0.85,
            0.005 * (tru(0.5) ? 1 : -1),
            20,
          ),
          new ShapeParticle(
            x,
            y,
            rnd.float(0, TAU),
            rnd.float(3, 9) * size ** 0.62,
            0,
            0,
            "inverted-triangle",
            this.flashColoursLight,
            0,
            flashSize,
            flashSize ** 0.85,
            flashSize ** 0.75,
            0.005 * (tru(0.5) ? 1 : -1),
            20,
          ),
        );
      }
    let rad = size * 0.4;
    //Smoke ring
    if (this.smoke) {
      let wait = Math.min(120, rad);
      world.particles.push(
        new WaveParticle(
          x,
          y - rad * 3,
          15 * size ** 0.8,
          0,
          size * 24,
          this.smokeColours,
          size ** 0.8,
          size,
        ),
      );
      effectTimer.do(() => {
        world.particles.push(
          new WaveParticle(
            x,
            y,
            wait * 0.25,
            0,
            size * 24,
            [col.from(255, 220, 150), col.from(255, 220, 150, 0)],
            size ** 0.8,
            size,
          ),
        );
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            0,
            wait * 1.5,
            0,
            0,
            "circle",
            [col.white, col.from(255, 220, 150, 0)],
            0,
            size * 96,
            0,
            size * 96,
          ),
        );
      }, wait);
    }
    if (this.shake) {
      effects.shake(x, y, size ** 0.8, size ** 0.5);
      effects.shake(x, y, size ** 0.8, size ** 0.5 * 25);
      effects.shake(x, y, size ** 0.8, size * 3.5);
    }
    //Now, the mushroom cloud
    if (this.mushroom)
      effectTimer.repeat((i) => {
        let progress = i / (size * 3);
        let life = rnd.float(4, 14) * rad ** 0.5;
        if (i < size * 10 - life)
          world.particles.unshift(
            new ShapeParticle(
              x,
              y,
              -HALF_PI,
              life,
              (rad * 10 * progress) / life,
              0,
              "circle",
              this._reverseFireColours,
              rad * 4 ** 0.8,
              rad * 4 ** 0.6,
              rad * 4 ** 0.8,
              rad * 4 ** 0.6,
              0,
            ),
          );
        //for (let j = 0; j < 2; j++) {
        let dir = rnd.float(0, TAU),
          dist = rnd.float(rad, rad * 2) * 3;
        world.floorParticles.unshift(
          new ShapeParticle(
            x + Math.cos(dir) * dist,
            y + Math.sin(dir) * dist,
            dir + PI,
            life,
            rad ** 0.6,
            rad ** 0.6 / life ** 0.5 / 4,
            "circle",
            this._fadeInFireColours,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            0,
          ),
        );
        dir = rnd.float(0, TAU);
        dist = rnd.float(rad, rad * 2) * 3;
        world.particles.unshift(
          new ShapeParticle(
            x + Math.cos(dir) * dist,
            y + Math.sin(dir) * dist,
            dir + PI,
            life,
            rad ** 0.6,
            rad ** 0.6 / life ** 0.5 / 4,
            "circle",
            this._fadeInFireColours,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            0,
          ),
        );
        //}

        for (let j = 0; j < 3; j++)
          world.particles.push(
            new ShapeParticle(
              x,
              y - rad * 10 * progress,
              rnd.float(0, TAU),
              life,
              rad ** 0.75,
              rad ** 0.75 / life ** 0.6,
              "circle",
              this.fireColours,
              rad * 4 ** 0.9,
              rad * 4 ** 0.7,
              rad * 4 ** 0.9,
              rad * 4 ** 0.7,
              0,
              200,
            ),
          );
      }, size * 3);
  }
}

function repeat(n, func, ...params) {
  for (let i = 0; i < n; i++) func(...params);
}

/**
 * Creates an effect, independently of any objects.
 * @param {string | Object} effect Registry name of the visual effect, or a constructible visual effect.
 * @param {float} x X position of the effect's origin
 * @param {float} y Y position of the effect's origin
 * @param {float} direction Direction *in radians* of the effect. Only for directed effects, such as `ParticleEmissionEffect`
 * @param {float} scale Extra parameter to determine size of scalable effects
 * @param {() => {x: number, y: number, direction: number}} pos Function to get position for parentised effects.
 * @returns
 */
function createEffect(effect, world, x, y, direction, scale, pos, impact = false) {
  if (effect === "none") return new VisualEffect();
  /**@type {VisualEffect} */
  let fx = construct(
    typeof effect === "object" ? effect : Registries.vfx.get(effect),
    "visual-effect",
  );
  fx.execute(world, x, y, direction, scale, pos, impact);
  return fx;
}

/**
 * Creates a linear effect, independently of any objects.
 * @param {string | Object} effect Registry name of the visual effect, or a constructible visual effect.
 * @param {Vector[]} positions Positions to spawn the effect along
 * @param {() => Vector[]} pos Function to get position for parentised effects.
 * @returns
 */
function createLinearEffect(effect, world, positions, pos, impact = false) {
  if (effect === "none") return new LinearEffect();
  /**@type {LinearEffect} */
  let fx = construct(
    typeof effect === "object" ? effect : Registries.vfx.get(effect),
    "linear-effect",
  );
  fx.execute(world, positions, pos, impact);
  return fx;
}

function autoScaledEffect(effect, world, x, y, direction, pos, impact = false) {
  let effectparts = effect.split("~");
  createEffect(effectparts[0], world, x, y, direction, effectparts[1] ?? 1, pos, impact);
}

/**
 * Helper function for effects created from a source `PhysicalObject` such as bullet trails, or block smoke effects.\
 * Uses an angle in *degrees*.
 * @param {string} effect Registry name of effect to create. Use `effect~scale` to change scale.
 * @param {PhysicalObject} source Object at which to spawn the effect.
 * @param {number} [offX=0] X offset
 * @param {number} [offY=0] Y offset
 */
function emitEffect(effect, source, offX = 0, offY = 0, impact = false) {
  if (typeof effect === "string")
    autoScaledEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      () => ({ x: source.x, y: source.y, direction: source.directionRad }),
      impact,
    );
  else
    createEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      effect.scale,
      () => ({ x: source.x, y: source.y, direction: source.directionRad }),
      impact,
    );
}

export {
  EmissionEffect,
  Explosion,
  ExplosionEffect,
  ImageParticleEmissionEffect,
  MultiEffect,
  NuclearExplosion,
  NuclearExplosionEffect,
  ParticleEmissionEffect,
  TextParticleEmissionEffect,
  VisualEffect,
  WaveEmissionEffect,
  autoScaledEffect,
  createDestructionExplosion,
  createEffect,
  createLinearEffect,
  effectTimer,
  emitEffect,
  liquidDestructionBlast,
  repeat
};

