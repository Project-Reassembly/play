class Bullet extends PhysicalObject {
  direction = 0;
  damage = [];
  speed = 20;
  decel = 0;
  lifetime = 60;
  hitSize = 5;
  collides = true;
  trail = true;
  trailColours = [[255, 255, 255, 200]];
  trailShape = "rhombus";
  trailWidth = 0;
  trailLength = 0;
  trailLife = 0;
  trailLight = 0;
  remove = false;
  pierce = 0;
  light = 0;
  drawer = {
    shape: "circle",
    fill: "red",
    image: "error",
    width: 10,
    height: 10,
  };
  entity = null;
  knockback = 0;
  kineticKnockback = false;
  controlledKnockback = false;
  damaged = [];
  _trailCounter = 20;
  trailInterval = null;
  //Statuseseseseses
  status = "none";
  statusDuration = 0;
  //Frags
  fragBullet = {};
  fragNumber = 0;
  fragDirection = 0;
  fragSpread = 0;
  fragSpacing = 0;
  //Intervals
  intervalBullet = {};
  intervalNumber = 0;
  intervalDirection = 0;
  intervalSpread = 0;
  intervalSpacing = 0;
  intervalTime = 0;
  #intervalCounter = 0;
  //vfx
  spawnEffect = "none";
  despawnEffect = "explosion~5";
  hitEffect = "none";
  trailEffect = "default";
  //incendiary
  fire = {};
  fireChance = 1;
  fires = 0;
  fireSpread = 0;
  /** If true, the number of fires created (`F`) will follow a binomial distribution: `F ~ B(fires,fireChance)`.\
   * Each fire will have `fireChance` probability of being created.\
   * If this is the case, the mean number of fires will be `fireChance * fires`, with variance `fireChance * (1 - fireChance) * fires`.\
   * If false, all fire will be created at once with a probability of `fireChance`.\
   * Generally, this option allows any integer number of fires between 0 and `fires` to spawn, whereas, with this off, the only options are `fires` fires, or no fires.
   */
  isFireBinomial = false;
  init() {
    super.init();
    this.maxLife = this.lifetime;
    this.trailInterval ??= this.hitSize * 4;
    if (this.trailColours.length === 1) {
      this.trailColours[1] = this.trailColours[0].slice(0); //Copy colour
    }
  }
  oncreated() {
    this.emit(this.spawnEffect);
  }
  ondestroyed(){
    this.emit(this.despawnEffect);
  }
  step(dt) {
    this.spawnTrail(dt);
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      //Which way to move
      let moveVector = p5.Vector.fromAngle(this.directionRad);
      //Scale to speed
      moveVector.mult(this.speed * dt);
      //Move
      this.move(moveVector.x, moveVector.y);
      //Speed change
      this.speed = Math.max(this.speed - dt * this.decel, 0);
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
    }
  }
  collidesWith(other) {
    return this.collides && super.collidesWith(other);
  }
  move(x, y) {
    super.move(x, y, true);
  }
  spawnTrail(dt) {
    //This got too long

    for (let e = 0; e < this.speed * dt; e++) {
      this._trailCounter--;
      if (this._trailCounter <= 0) {
        if (this.world?.particles != null && this.trail) {
          if (this.trailEffect === "default") {
            let trailparticle = new ShapeParticle(
              this.x - e * p5.Vector.fromAngle(this.directionRad).x,
              this.y - e * p5.Vector.fromAngle(this.directionRad).y,
              this.directionRad,
              this.trailLife || (this.maxLife * 1.2) ** 0.4,
              0,
              0,
              this.trailShape,
              this.trailColours,
              this.trailWidth || this.hitSize * 1.9,
              0,
              (this.trailLength || this.hitSize) * this.trailInterval * 0.25,
              (this.trailLength || this.hitSize) * this.trailInterval * 0.25,
              0
            );
            trailparticle.light = this.trailLight;
            this.world.particles.push(trailparticle);
          } else this.emit(this.trailEffect);
        }
        this._trailCounter = this.trailInterval;
      }
    }
  }
  draw() {
    if (!this.drawer.hidden)
      if (this.drawer.image) {
        rotatedImg(
          this.drawer.image,
          this.x,
          this.y,
          this.drawer.width,
          this.drawer.height,
          this.directionRad
        );
      } else {
        //If no image, draw shape instead
        noStroke();
        fill(this.drawer.fill);
        rotatedShape(
          this.drawer.shape,
          this.x,
          this.y,
          this.drawer.width,
          this.drawer.height,
          this.directionRad
        );
      }
    super.draw();
  }
  incend() {
    if (this.isFireBinomial)
      repeat(this.fires, () => {
        if (tru(this.fireChance))
          Fire.create(
            Object.assign(this.fire, {
              x: this.x + rnd(this.fireSpread, -this.fireSpread),
              y: this.y + rnd(this.fireSpread, -this.fireSpread),
              world: this.world,
              team: this.entity.team,
            })
          );
      });
    else if (tru(this.fireChance))
      repeat(this.fires, () =>
        Fire.create(
          Object.assign(this.fire, {
            x: this.x + rnd(this.fireSpread, -this.fireSpread),
            y: this.y + rnd(this.fireSpread, -this.fireSpread),
            world: this.world,
            team: this.entity.team,
          })
        )
      );
  }
  frag() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.fragBullet,
      this.fragNumber,
      this.direction + this.fragDirection,
      this.fragSpread,
      this.fragSpacing,
      this.world,
      this.entity
    );
  }
  interval() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.intervalBullet,
      this.intervalNumber,
      this.direction + this.intervalDirection,
      this.intervalSpread,
      this.intervalSpacing,
      this.world,
      this.entity
    );
  }
  intervalTick() {
    if (this.#intervalCounter <= 0) {
      this.interval();
      this.#intervalCounter = this.intervalTime;
    } else {
      this.#intervalCounter--;
    }
  }
}
