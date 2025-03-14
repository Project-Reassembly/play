class ImageParticle {
  #rotOffset;
  constructor(
    x,
    y,
    direction,
    lifetime,
    speed,
    decel,
    image,
    sizeXFrom,
    sizeXTo,
    sizeYFrom,
    sizeYTo,
    rotateSpeed
  ) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.lifetime = lifetime;
    this.decel = decel;
    this.image = image;
    this.remove = false;
    this.maxLifetime = lifetime;
    this.sizeXFrom = sizeXFrom;
    this.sizeXTo = sizeXTo;
    this.sizeX = sizeXFrom;
    this.sizeYFrom = sizeYFrom;
    this.sizeYTo = sizeYTo;
    this.sizeY = sizeYFrom;
    this.rotateSpeed = rotateSpeed;
    this.#rotOffset = 0;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      //Interpolate size
      this.sizeX =
        this.sizeXFrom * this.calcLifeFract() +
        this.sizeXTo * (1 - this.calcLifeFract());
      this.sizeY =
        this.sizeYFrom * this.calcLifeFract() +
        this.sizeYTo * (1 - this.calcLifeFract());
      //Move
      this.moveTo(
        this.x + this.speed * Vector.fromAngle(this.direction).x * dt,
        this.y + this.speed * Vector.fromAngle(this.direction).y * dt
      );
      //Decelerate
      if (this.speed >= this.decel) {
        this.speed -= this.decel * dt;
      } else {
        this.speed = 0;
      }
      if (this.rotateSpeed) {
        this.#rotOffset += this.rotateSpeed * dt;
      }
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    //Draw the particle
    rotatedImg(
      this.image,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this.#rotOffset + HALF_PI
    );
  }
}
