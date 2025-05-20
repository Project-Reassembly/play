import { Timer } from "../classes/timer.js";
import { RegisteredItem } from "../core/registered-item.js";
import { construct } from "../core/constructor.js";
import { Registries } from "../core/registry.js";
import { ShapeParticle } from "../classes/effect/shape-particle.js";
import { WaveParticle } from "../classes/effect/wave-particle.js";
import { ImageParticle } from "../classes/effect/image-particle.js";
import { assign } from "../core/constructor.js";
import { Vector, rnd, tru } from "../core/number.js";
import { ExecutorParticle } from "../classes/effect/extra-particles.js";
import { world, effects } from "../play/game.js";
import { TextParticle } from "../classes/effect/text-particle.js";
import { PhysicalObject } from "../classes/physical.js";
const effectTimer = new Timer();
class Explosion {
  x = 0;
  y = 0;
  /**@type {World} */
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
  constructor(opts = {}) {
    assign(this, opts);
  }
  //Basic explosion
  create() {
    //Most of these powers are just to make it less insane at high radii
    //They are tested repeatedly to make sure they look good
    createEffect(this.effect, this.world, this.x, this.y, 0, this.radius);
    this.dealDamage();
    return this;
  }
  dealDamage(kbrm = 1) {
    // Hit blocks
    let damage = construct(
      {
        x: this.x,
        y: this.y,
        damage: [
          {
            amount: this.amount,
            spread: this.spread,
            type: this.type,
          },
        ],
        status: this.status,
        statusDuration: this.statusDuration,
        pierce: Infinity,
        despawnEffect: "none",
        team: this.team,
        hitSize: this.radius * 2,
      },
      "virtual"
    );
    damage.entity = this.source;
    this.world.bullets.push(damage);
    // Hit entities
    for (let e of this.world.entities) {
      //If hit
      if (
        !e.dead &&
        ((this.x - e.x) ** 2 + (this.y - e.y) ** 2) ** 0.5 <=
          this.radius ** 0.95 * kbrm + e.size
      ) {
        // //If enemy, damage, and affect
        // if (e.team !== (this.source?.team ?? this.team)) {
        //   e.damage(
        //     this.type,
        //     this.amount + rnd(-this.spread, this.spread),
        //     this.source
        //   );
        //   if (this.status !== "none")
        //     e.applyStatus(this.status, this.statusDuration);
        // }
        //Knock regardless of team
        e.knock(
          !isNaN(this.knockback) ? this.knockback : this.amount ** 0.5,
          new Vector(e.x - this.x, e.y - this.y).angle,
          true
        );
      }
    }
    return this;
  }
}

class NuclearExplosion extends Explosion {
  effect = "nuke";
  constructor(opts = {}) {
    super(opts);
    for (let key of Object.keys(opts)) {
      if (this[key] !== undefined && typeof this[key] !== "function") {
        this[key] = opts[key];
      }
    }
    this.amount /= (this.radius / 4.5) * 10;
  }
  dealDamage() {
    effectTimer.repeat((i) => {
      super.dealDamage(2);
    }, (this.radius / 4.5) * 10);
    return this;
  }
}

/**No, this isn't a `VisualEffect`.\
 * Creates a bright circle of light. From MOAB Adventure's nuclear blasts.\
 * P:R has better nukes, using `NuclearExplosionEffect`.
 */
function flash(x = 0, y = 0, opacity = 255, duration = 60, glareSize = 600) {
  world.particles.push(
    //Obscure screen
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      30,
      0,
      0,
      "ellipse",
      [
        [255, 255, 255, opacity],
        [255, 255, 255, 0],
      ],
      0,
      glareSize * 1.5,
      0,
      glareSize * 1.5,
      0,
      20
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      90,
      0,
      0,
      "ellipse",
      [
        [255, 255, 255, opacity],
        [255, 255, 255, 0],
      ],
      0,
      glareSize * 2,
      0,
      glareSize * 2,
      0,

      20
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      120,
      0,
      0,
      "ellipse",
      [
        [255, 255, 255, opacity],
        [255, 255, 255, 0],
      ],
      0,
      glareSize * 2.5,
      0,
      glareSize * 2.5,
      0,

      20
    ),
    // Doesn't really work outside of MA
    // new ShapeParticle(
    //   960,
    //   540,
    //   HALF_PI,
    //   duration,
    //   0,
    //   0,
    //   "rect",
    //   [255, 255, 255, opacity],
    //   [255, 255, 255, 0],
    //   1920,
    //   1920,
    //   1080,
    //   1080,
    //   0,
    //   false
    // ),
    //Glare effect
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 0.5,
      0,
      0,
      "rhombus",
      [
        [255, 255, 255, 150],
        [255, 255, 255, 0],
      ],
      glareSize / 3,
      glareSize * 2,
      glareSize / 5,
      0,
      0,
      20
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration,
      0,
      0,
      "rhombus",
      [
        [255, 255, 255, 200],
        [255, 255, 255, 0],
      ],
      glareSize / 6,
      glareSize * 1.5,
      (glareSize / 5) * 0.6,
      0,
      0,
      20
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 1.5,
      0,
      0,
      "rhombus",
      [
        [255, 255, 255, 255],
        [255, 255, 255, 0],
      ],
      glareSize / 9,
      glareSize,
      (glareSize / 5) * 0.3,
      0,
      0,
      20
    )
  );
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
  colour = [0, 0, 0],
  colourTo = [0, 0, 0],
  variation = [0, 0, 0],
  fragments = [],
  world
) {
  let rootMHP = scalar ** 0.48;
  let smallerRootMHP = scalar ** 0.23;
  let blotSize = 20 + 2 * smallerRootMHP;
  for (let i = 0; i < rootMHP; i++) {
    let delta = variation.map((x) => rnd(-x, x));
    world.floorParticles.push(
      new ShapeParticle(
        x,
        y,
        rnd(0, 360),
        rnd(1800, 3600),
        rnd(0.02, 0.2) * (3 + smallerRootMHP * 4 ** 1.1),
        0.5,
        "circle",
        [
          colour.map((v, i) => v + delta[i]).concat([600]),
          colourTo.map((v, i) => v + delta[i]).concat([0]),
        ],
        blotSize,
        blotSize / 2,
        blotSize,
        blotSize / 2
      )
    );
  }
  for (let component of fragments) {
    let componentSize = (component.width + component.height) / 2;
    world.particles.push(
      new ExecutorParticle(
        new ImageParticle(
          x,
          y,
          rnd(0, 360),
          rnd(2400, 5400),
          rnd(0.5, 0.7) * (3 + smallerRootMHP * 3),
          0.5,
          component.image,
          10,
          0,
          component.width,
          component.width,
          component.height,
          component.height
        ),
        (ix, iy, speed) => {
          if (speed > 0.1) {
            let delta = variation.map((x) => rnd(-x, x));
            world.floorParticles.push(
              new ShapeParticle(
                ix,
                iy,
                rnd(0, 360),
                rnd(1800, 3600),
                rnd(0.5, 1),
                0.1,
                "circle",
                [
                  colour.map((v, i) => v + delta[i]).concat([600]),
                  colourTo.map((v, i) => v + delta[i]).concat([0]),
                ],
                componentSize / 2,
                componentSize / 4,
                componentSize / 2,
                componentSize / 4
              )
            );
          }
        },
        1
      )
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
    750
  );
  effectTimer.do(
    () =>
      effectTimer.repeat((i) => {
        effects.shadeColour = [25 + i * 2.5, 0, 0, 250 + i / 5];
        effects.lightColour = [255, 10 + i * 1.5];
        effects.lightScale = 1 - i / 27.5;
      }, 25),
    1500
  );
  effectTimer.repeat((i) => {
    let dir = rnd(0, TAU);
    let dist = rnd(30, 600);
    let p = new ShapeParticle(
      game.player.x + cos(dir) * dist,
      game.player.y + sin(dir) * dist,
      dir,
      60,
      0,
      0,
      "rhombus",
      [[0, 0, 0, 0]],
      10,
      0,
      25,
      25,
      0,
      240
    );
    world.particles.push(p);
  }, 1500);
  effectTimer.do(() => {
    for (let j = 0; j < 100; j++)
      game.player.damage("insanity", rnd(100, 1000));
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
  create(world, x = 0, y = 0, direction = 0, scale = 1) {}
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: 0, y: 0, direction: 0 })
  ) {
    if (this.parentise) {
      let p = pos();
      this.create(world, p.x, p.y, p.direction, scale);
    } else this.create(world, x, y, direction, scale);
  }
}
/**Extended class for repeated creation of a visual effect */
class EmissionEffect extends VisualEffect {
  emissions = 1;
  interval = 0;
  amount = 1;
  delay = 0;
  x = 0;
  y = 0;
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: x, y: y, direction: direction })
  ) {
    let fn = () => this.create(world, x, y, direction, scale);
    if (this.parentise) {
      fn = () => {
        let p = pos();
        this.create(world, p.x, p.y, p.direction, scale);
      };
    }
    if (this.emissions > 1)
      effectTimer.repeat(fn, this.emissions, this.interval, this.delay);
    else effectTimer.do(fn, this.delay);
  }
}
/**A container for many effects at once. */
class MultiEffect extends VisualEffect {
  /**@type {VisualEffect[]} */
  effects = [];
  init() {
    this.effects = this.effects.map((x) => construct(x, "visual-effect"));
  }
  execute(world, x = 0, y = 0, direction = 0, scale = 1) {
    this.effects.forEach((z) => z.execute(world, x, y, direction, scale));
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
  };
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    repeat(this.amount, () =>
      world.particles.push(
        new ShapeParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd(-(this.cone ?? 360) / 2, (this.cone ?? 360) / 2)
            ),
          this.particle.lifetime ?? 60,
          this.particle.speed ?? 1,
          this.particle.decel ?? 0.015,
          this.particle.shape ?? "circle",
          this.particle.colours ?? [
            [50, 50, 50, 100],
            [100, 100, 100, 0],
          ],
          this.particle.widthFrom ?? 20,
          this.particle.widthTo ?? 30,
          this.particle.heightFrom ?? 20,
          this.particle.heightTo ?? 30,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.light ?? 0
        )
      )
    );
  }
}

class ImageParticleEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    repeat(this.amount, () =>
      world.particles.push(
        new ImageParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd(
                  -(this.particle.cone ?? 360) / 2,
                  (this.particle.cone ?? 360) / 2
                )
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
          radians(this.particle.rotateSpeed ?? 0)
        )
      )
    );
  }
}

class TextParticleEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    repeat(this.amount, () =>
      world.particles.push(
        new TextParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd(
                  -(this.particle.cone ?? 360) / 2,
                  (this.particle.cone ?? 360) / 2
                )
            ),
          this.particle.lifetime ?? 60,
          this.particle.speed ?? 1,
          this.particle.decel ?? 0.015,
          this.particle.text,
          this.particle.colours ?? [
            [50, 50, 50, 100],
            [100, 100, 100, 0],
          ],
          this.particle.sizeFrom ?? 20,
          this.particle.sizeTo ?? 30,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.useOCR ?? true
        )
      )
    );
  }
}

class WaveEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    repeat(this.amount, () =>
      world.particles.push(
        new WaveParticle(
          x,
          y,
          this.particle.lifetime ?? 60,
          this.particle.radiusFrom ?? 0,
          this.particle.radiusTo ?? 100,
          this.particle.colours ?? [
            [50, 50, 50, 100],
            [100, 100, 100, 0],
          ],
          this.particle.strokeFrom ?? 10,
          this.particle.strokeTo ?? 0,
          this.particle.light ?? 0
        )
      )
    );
  }
}

class ExplosionEffect extends VisualEffect {
  sparkColours = [
    [255, 245, 215, 255],
    [255, 215, 0, 55],
  ]; //The colour the sparks go to
  smokeColours = [
    [100, 100, 100, 200],
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
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    //Spawn smoke
    if (this.smoke)
      for (let i = 0; i < scale ** 0.6; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            radians(rnd(0, 360)),
            rnd(scale ** 0.65, scale ** 0.8 * 2),
            rnd(scale ** 0.25 * 0.3, scale ** 0.25 * 0.5),
            0.01,
            "circle",
            this.smokeColours,
            scale ** 0.85,
            0,
            scale ** 0.85,
            0,
            0,
            true
          )
        );
      }
    //Yellow sparks
    if (this.sparks)
      for (let i = 0; i < scale ** 0.7; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            radians(rnd(0, 360)),
            rnd(scale ** 0.75, scale ** 0.75 * 1.5),
            rnd(scale ** 0.25 * 0.1, scale ** 0.25 * 2),
            0.075,
            "rect",
            this.sparkColours,
            scale ** 0.5,
            0,
            scale ** 0.75,
            scale ** 0.5,
            0,
            100
          )
        );
      }
    if (this.wave)
      world.particles.push(
        new WaveParticle(
          x,
          y,
          30,
          0,
          scale,
          this.waveColours,
          scale ** 0.75,
          0,
          20
        )
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
    [255, 255, 100, 100],
    [155, 0, 0, 0],
  ];
  _reverseFireColours = [];
  init() {
    this._reverseFireColours = this.fireColours.reverse();
    this.fireColours.reverse();
  }
  flash = true;
  mushroom = true;
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    let flashSize = scale ** 1.6;
    let flashAmount = scale ** 0.6;
    let size = scale / 4.5;
    if (this.flash)
      for (let i = 0; i < flashAmount; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            rnd(0, TAU),
            rnd(6, 18) * size ** 0.65,
            0,
            0,
            "inverted-triangle",
            this.flashColours,
            0,
            flashSize * 2,
            flashSize ** 0.95,
            flashSize ** 0.85,
            0.005 * (tru(0.5) ? 1 : -1),
            20
          ),
          new ShapeParticle(
            x,
            y,
            rnd(0, TAU),
            rnd(6, 18) * size ** 0.5,
            0,
            0,
            "inverted-triangle",
            this.flashColoursLight,
            0,
            flashSize,
            flashSize ** 0.85,
            flashSize ** 0.75,
            0.005 * (tru(0.5) ? 1 : -1),
            20
          )
        );
      }
    //Smoke ring
    if (this.smoke)
      world.particles.push(
        new WaveParticle(
          x,
          y,
          25 * size ** 0.5,
          0,
          size * 24,
          this.smokeColours,
          size ** 0.8,
          size
        )
      );
    if (this.shake) {
      effects.shake(x, y, size ** 0.8, size ** 0.5);
      effects.shake(x, y, size ** 0.8, size ** 0.5 * 25);
      effects.shake(x, y, size ** 0.8, size * 10.5);
    }
    let rad = size * 0.4;
    //Now, the mushroom cloud
    if (this.mushroom)
      effectTimer.repeat((i) => {
        let progress = i / (size * 10);
        let life = rnd(4, 14) * rad ** 0.5;
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
            0
          )
        );
        //for (let j = 0; j < 2; j++) {
        let dir = rnd(0, TAU),
          dist = rnd(rad, rad * 2) * 3;
        world.floorParticles.unshift(
          new ShapeParticle(
            x + Math.cos(dir) * dist,
            y + Math.sin(dir) * dist,
            dir + PI,
            life,
            rad ** 0.6,
            rad ** 0.6 / life ** 0.5 / 4,
            "circle",
            this.fireColours,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            0
          )
        );
        dir = rnd(0, TAU);
        dist = rnd(rad, rad * 2) * 3;
        world.particles.unshift(
          new ShapeParticle(
            x + Math.cos(dir) * dist,
            y + Math.sin(dir) * dist,
            dir + PI,
            life,
            rad ** 0.6,
            rad ** 0.6 / life ** 0.5 / 4,
            "circle",
            this.fireColours,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            rad * 4 ** 0.6,
            rad * 4 ** 0.4,
            0
          )
        );
        //}

        for (let j = 0; j < 3; j++)
          world.particles.push(
            new ShapeParticle(
              x,
              y - rad * 10 * progress,
              rnd(0, TAU),
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
              200
            )
          );
      }, size * 10);
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
 * @param {float} direction Direction *in radians* of the effect. ONly for directed effects, such as `ParticleEmissionEffect`
 * @param {float} scale Extra parameter to determine size of scalable effects
 * @param {() => {x: number, y: number, direction: number}} pos Function to get position for parentised effects.
 * @returns
 */
function createEffect(effect, world, x, y, direction, scale, pos) {
  /**@type {VisualEffect} */
  let fx = construct(
    typeof effect === "object" ? effect : Registries.vfx.get(effect),
    "visual-effect"
  );
  fx.execute(world, x, y, direction, scale, pos);
  return fx;
}

function autoScaledEffect(effect, world, x, y, direction, pos) {
  let effectparts = effect.split("~");
  createEffect(
    effectparts[0],
    world,
    x,
    y,
    direction,
    effectparts[1] ?? 1,
    pos
  );
}

/**
 * Helper function for effects created from a source `PhysicalObject` such as bullet trails, or block smoke effects.\
 * Uses an angle in *degrees*.
 * @param {string} effect Registry name of effect to create. Use `effect~scale` to change scale.
 * @param {PhysicalObject} source Object at which to spawn the effect.
 * @param {number} [offX=0] X offset
 * @param {number} [offY=0] Y offset
 */
function emitEffect(effect, source, offX = 0, offY = 0) {
  if (typeof effect === "string")
    autoScaledEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      () => ({ x: source.x, y: source.y, direction: source.directionRad })
    );
  else
    createEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      effect.scale,
      () => ({ x: source.x, y: source.y, direction: source.directionRad })
    );
}

export {
  Explosion,
  ExplosionEffect,
  NuclearExplosion,
  NuclearExplosionEffect,
  effectTimer,
  emitEffect,
  createDestructionExplosion,
  createEffect,
  liquidDestructionBlast,
  flash,
  VisualEffect,
  EmissionEffect,
  MultiEffect,
  ParticleEmissionEffect,
  ImageParticleEmissionEffect,
  TextParticleEmissionEffect,
  WaveEmissionEffect,
  autoScaledEffect,
  repeat,
};
