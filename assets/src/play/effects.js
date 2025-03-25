const effectTimer = new Timer();
/**@param {string} [team="enemy"] Not required, unless `sourceEntity` is null. */
function splashDamageInstance(
  centreX = 0,
  centreY = 0,
  amount = 0,
  damageType = "explosion",
  damageRadius = 0,
  sourceEntity = null,
  showExplosion = true,
  sparkColour = [255, 245, 215, 255], //The colour the sparks start at
  sparkColourTo = [255, 215, 0, 55], //The colour the sparks go to
  smokeColour = [100, 100, 100, 200], //The colour the smoke starts at
  smokeColourTo = [100, 100, 100, 0], //The colour the smoke goes to
  waveColour = [255, 128, 0, 0], //The colour the wave ends at. It always starts white.
  status = "none",
  statusDuration = 0,
  team = "enemy",
  knockback = NaN
) {
  //Most of these powers are just to make it less insane at high radii
  //They are tested repeatedly to make sure they look good
  let radius = damageRadius ** 1.05;
  if (showExplosion) {
    // world.particles.push(
    //   new TextParticle(
    //     centreX,
    //     centreY,
    //     radians(rnd(0, 360)),
    //     rnd(radius ** 0.65, radius ** 0.8 * 2),
    //     rnd(radius ** 0.25 * 0.3, radius ** 0.25 * 0.5),
    //     0.01,
    //     "BOOM",
    //     [255, 0, 0],
    //     [255, 0, 0, 0],
    //     radius ** 0.85,
    //     0,
    //     true
    //   )
    // );
    //Spawn smoke
    for (let i = 0; i < radius ** 0.6; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.65, radius ** 0.8 * 2),
          rnd(radius ** 0.25 * 0.3, radius ** 0.25 * 0.5),
          0.01,
          "circle",
          smokeColour,
          smokeColourTo,
          radius ** 0.85,
          0,
          radius ** 0.85,
          0,
          0,
          true
        )
      );
    }
    //Yellow sparks
    for (let i = 0; i < radius ** 0.7; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.75, radius ** 0.75 * 1.5),
          rnd(radius ** 0.25 * 0.1, radius ** 0.25 * 2),
          0.075,
          "rect",
          sparkColour,
          sparkColourTo,
          radius ** 0.5,
          0,
          radius ** 0.75,
          radius ** 0.5,
          0,
          true
        )
      );
    }
    world.particles.push(
      new WaveParticle(
        centreX,
        centreY,
        30,
        0,
        damageRadius,
        [255, 255, 255, 255],
        waveColour,
        radius ** 0.75,
        0,
        true
      )
    );
  }
  for (let e of world.entities) {
    //If hit
    if (
      !e.dead &&
      ((centreX - e.x) ** 2 + (centreY - e.y) ** 2) ** 0.5 <=
        damageRadius + e.size
    ) {
      //If enemy, damage, and affect
      if (e.team !== (sourceEntity?.team ?? team)) {
        e.damage(damageType, amount, sourceEntity);
        if (status !== "none") e.applyStatus(status, statusDuration);
      }
      //Knock regardless of team
      e.knock(
        !isNaN(knockback) ? knockback : amount,
        degrees(createVector(e.x - centreX, e.y - centreY).heading()),
        true
      );
    }
  }
  //Screen shake
  if (radius > 30) {
    effects.shake(centreX, centreY, radius ** 0.75, radius ** 0.75);
  }
}
function blindingFlash(
  x = 0,
  y = 0,
  opacity = 255,
  duration = 60,
  glareSize = 600
) {
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
      [255, 255, 255, opacity],
      [255, 255, 255, 0],
      0,
      glareSize * 1.5,
      0,
      glareSize * 1.5,
      0,
      glareSize * 2
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      90,
      0,
      0,
      "ellipse",
      [255, 255, 255, opacity],
      [255, 255, 255, 0],
      0,
      glareSize * 2,
      0,
      glareSize * 2,
      0,

      glareSize * 2
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      120,
      0,
      0,
      "ellipse",
      [255, 255, 255, opacity],
      [255, 255, 255, 0],
      0,
      glareSize * 2.5,
      0,
      glareSize * 2.5,
      0,

      glareSize * 2
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
      [255, 255, 255, 150],
      [255, 255, 255, 0],
      glareSize / 3,
      glareSize * 2,
      glareSize / 5,
      0,
      0,
      glareSize * 2
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration,
      0,
      0,
      "rhombus",
      [255, 255, 255, 200],
      [255, 255, 255, 0],
      glareSize / 6,
      glareSize * 1.5,
      (glareSize / 5) * 0.6,
      0,
      0,

      glareSize * 2
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 1.5,
      0,
      0,
      "rhombus",
      [255, 255, 255, 255],
      [255, 255, 255, 0],
      glareSize / 9,
      glareSize,
      (glareSize / 5) * 0.3,
      0,
      0,

      glareSize * 2
    )
  );
}

function createDestructionExplosion(x, y, source) {
  splashDamageInstance(
    x,
    y,
    source.maxHealth * source.explosiveness,
    "explosion",
    (source.width + source.height) * source.explosiveness * 5,
    source
  );
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
        colour.map((v, i) => v + delta[i]).concat([600]),
        colourTo.map((v, i) => v + delta[i]).concat([0]),
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
                colour.map((v, i) => v + delta[i]).concat([600]),
                colourTo.map((v, i) => v + delta[i]).concat([0]),
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
      [0, 0, 0, 0],
      [0, 0, 0, 0],
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
