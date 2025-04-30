class PointBullet extends Bullet {
  lifetime = 1;
  #moved = false; //If the bullet has teleported to the target entity or not.
  hitColours = [[255, 255, 0]];
  init() {
    this.speed = 0; //Remove speed
    if (this.hitColours.length === 1) {
      this.hitColours[1] = this.hitColours[0].slice(0); //Copy colour
      this.hitColours[1][3] = 0; //Add alpha
    }
  }
  step(dt) {
    //Move if not already done so
    if (!this.#moved) {
      this.#moved = true;
      if (this.entity) {
        //If a target exists
        if (this.entity.target) {
          let tx = this.entity.target.x,
            ty = this.entity.target.y;
          //Point towards it, like a weapon
          this.direction = degrees(
            p5.Vector.sub(
              createVector(tx, ty), //Target pos 'B'
              createVector(this.x, this.y) //This pos 'A'
            ).heading() //'A->B' = 'B' - 'A'
          );
          //Create line to it
          this.createTrailTo(tx, ty);
          //Teleport to it
          this.x = tx;
          this.y = ty;
          this.createHitEffect();
        } else {
          //Delete self
          this.remove = true;
          return;
        }
      }
    }
    super.step(dt);
  }
  draw() {} //Totally invisible
  createTrailTo(x, y) {
    let distance = dist(this.x, this.y, x, y);
    this.world.particles.push(
      new ShapeParticle(
        //Find halfway point
        (this.x + x) / 2,
        (this.y + y) / 2,
        this.directionRad,
        30,
        0,
        0,
        "rect",
        this.hitColours,
        this.hitSize,
        this.hitSize,
        distance,
        distance,
        0,
        true
      )
    );
  }
  createHitEffect() {
    if (this.hitEffect) this.emit(this.hitEffect);
    else {
      let direction = rnd(0, 360); //Random direction
      this.world.particles.push(
        //Create hit effect
        new ShapeParticle(
          this.x,
          this.y,
          radians(direction),
          30,
          0,
          0,
          "rhombus",
          this.hitColours,
          this.hitSize * 5,
          0,
          0,
          this.hitSize * 40,
          0,
          true
        ),
        new ShapeParticle(
          this.x,
          this.y,
          radians(direction + 90),
          30,
          0,
          0,
          "rhombus",
          this.hitColours,
          this.hitSize * 5,
          0,
          0,
          this.hitSize * 25,
          0,
          true
        ),
        new WaveParticle(
          this.x,
          this.y,
          30,
          0,
          this.hitSize * 20,
          this.hitColours,
          0,
          this.hitSize * 3,
          true
        )
      );
    }
  }
}
