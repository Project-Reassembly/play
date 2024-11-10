class Bullet {
  x = 0;
  y = 0;
  direction = 0;
  damage = [];
  speed = 20;
  lifetime = 60;
  hitSize = 5;
  trail = true;
  trailColour = [255, 255, 255, 200];
  remove = false;
  pierce = 0;
  drawer = {
    shape: "circle",
    fill: "red",
    image: images.env.error,
    width: 10,
    height: 10,
  };
  world = null;
  entity = null;
  knockback = 0;
  kineticKnockback = false;
  controlledKnockback = false;
  //Effectively a pierce thing
  damaged = [];
  _trailCounter = 20;
  _trailInterval = 10;
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
  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }
  init() {
    this.maxLife = this.lifetime;
    this._trailInterval = this.hitSize * 4;
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
      this.x += moveVector.x;
      this.y += moveVector.y;
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
    }
  }
  spawnTrail(dt) {
    //This got too long
    for (let e = 0; e < this.speed * dt; e++) {
      if (this._trailCounter <= 0) {
        if (this.world?.particles != null && this.trail) {
          this.world.particles.push(
            new ShapeParticle(
              this.x - e * p5.Vector.fromAngle(this.directionRad).x,
              this.y - e * p5.Vector.fromAngle(this.directionRad).y,
              this.directionRad,
              this.maxLife * 1.2,
              0,
              0,
              "rhombus",
              this.trailColour,
              this.trailColour,
              this.hitSize * 1.9,
              0,
              this.hitSize * this._trailInterval * 0.25,
              this.hitSize * this._trailInterval * 0.25,
              0
            )
          );
        }
        this._trailCounter = this._trailInterval;
      } else {
        this._trailCounter--;
      }
    }
  }
  draw() {
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
  }
  collidesWith(obj) {
    return dist(this.x, this.y, obj.x, obj.y) <= this.hitSize + obj.hitSize;
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
