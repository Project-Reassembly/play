class Weapon {
  reload = 30;
  shoot = {
    bullet: null,
    pattern: {
      spread: 0,
      amount: 1,
      spacing: 0,
    },
  };

  //Internal
  #delay = 0;
  #cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  constructor() {}
  tick() {
    if (!this.slot) return;
    if (this.slot.entity) {
      this.x = this.entity.x + this.posX;
      this.y = this.entity.y + this.posY;
      this.rotation = degrees(
        p5.Vector.sub(
          createVector(this.entity.target.x, this.entity.target.y), //Mouse pos 'B'
          createVector(this.x, this.y) //Weapon pos 'A'
        ).heading() //'A->B' = 'B' - 'A'
      );
    }
    this.decelerate()
    if (this.#cooldown > 0) {
      this.#cooldown--;
    }
    this.parts.forEach((x) => x.tick()); //Tick all parts
  }
  getAcceleratedReloadRate(){
    if(this.#acceleration <= -1 || this.#acceleration > this.maxAccel) return this.reload; //If bad acceleration then ignore it
    return this.reload / (1 + this.#acceleration); //2 acceleration = 200% fire rate increase = 3x fire rate
  }
  accelerate() {
    this.#accelerated = this.getAcceleratedReloadRate() * 1.1; //Always wait for at least the reload time before deceling
    if(this.#acceleration < this.maxAccel){
      this.#acceleration += this.accel;
    }
    if(this.#acceleration > this.maxAccel){
      this.#acceleration = this.maxAccel;
    }
  }
  decelerate(){
    //If accelerated this frame, don't slow down
    if(this.#accelerated > 0){
      this.#accelerated--;
      return;
    }
    //Else do
    if(this.#acceleration > 0){
      this.#acceleration -= this.accelDecay;
    }
    if(this.#acceleration < 0){
      this.#acceleration = 0;
    }
  }
  fire() {
    if (this.#cooldown <= 0) {
      this.#cooldown = this.getAcceleratedReloadRate();
      this.accelerate() //Apply acceleration effects
      //Resolve nonexistent properties
      this.shoot.pattern.spread ??= 0;
      this.shoot.pattern.amount ??= 1;
      this.shoot.pattern.spacing ??= 0;

      patternedBulletExpulsion(
        this.x,
        this.y,
        this.shoot.bullet,
        this.shoot.pattern.amount,
        this.rotation,
        this.shoot.pattern.spread,
        this.shoot.pattern.spacing,
        this.slot.entity.world,
        this.slot.entity
      );
      this.parts.forEach((x) => x.fire()); //Tick all parts
    }
  }
}

function patternedBulletExpulsion(
  x,
  y,
  bulletToSpawn,
  amount,
  direction,
  spread,
  spacing,
  world,
  entity
) {
  //Derives most of its code from `Weapon.fire()`
  //universal mode: a c t i v a t e
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  for (let index = 0; index < amount; index++) {
    /** @type {Bullet} */
    let bulletToFire = bullet(bulletToSpawn);
    //Put the bullet in position
    bulletToFire.x = x;
    bulletToFire.y = y;
    bulletToFire.direction = direction; //do the offset
    //Apply uniform spread
    bulletToFire.direction += currentAngle;
    currentAngle += spacing;
    //Apply random spread
    bulletToFire.direction += random(spread, -spread);
    //Add entity and world
    bulletToFire.entity = entity;
    bulletToFire.world = world;
    //Spawn it in
    world.bullets.push(bulletToFire);
  }
}
