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
  statusDuration = 0
) {
  //Most of these powers are just to make it less insane at high radii
  //They are tested repeatedly to make sure they look good
  let radius = damageRadius ** 1.05;
  if (showExplosion) {
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
    if (
      ((centreX - e.x) ** 2 + (centreY - e.y) ** 2) ** 0.5 <=
        damageRadius + e.hitSize &&
      e.team !== sourceEntity.team
    ) {
      e.damage(damageType, amount, sourceEntity);
      if (status !== "none") e.applyStatus(status, statusDuration);
    }
  }
}
function blindingFlash(x = 0, y = 0, opacity = 255, duration = 60, glareSize = 600) {
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
      1920 * 3,
      0,
      1080 * 3,
      0,
      true
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
      1920 * 5,
      0,
      1080 * 5,
      0,
      true
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
      1920 * 8,
      0,
      1080 * 8,
      0,
      true
    ),
    new ShapeParticle(
      960,
      540,
      HALF_PI,
      duration,
      0,
      0,
      "rect",
      [255, 255, 255, opacity],
      [255, 255, 255, 0],
      1920,
      1920,
      1080,
      1080,
      0,
      false
    ),
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
      glareSize/3,
      glareSize*2,
      glareSize/5,
      0,
      0,
      true
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
      glareSize/6,
      glareSize * 1.5,
      glareSize/5 * 0.6,
      0,
      0,
      true
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
      glareSize/9,
      glareSize,
      glareSize/5 * 0.3,
      0,
      0,
      true
    ),
  )
}
