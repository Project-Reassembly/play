class Weapon extends Equippable {
  reload = 30;
  ammoType = "none";
  ammoUse = 1;
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
  /**@param {EquippedEntity} holder  */
  tick(holder) {
    super.tick(holder);
    this.decelerate();
    if (this.#cooldown > 0) {
      this.#cooldown--;
    }
  }
  getAcceleratedReloadRate() {
    if (this.#acceleration <= -1 || this.#acceleration > this.maxAccel)
      return this.reload; //If bad acceleration then ignore it
    return this.reload / (1 + this.#acceleration); //2 acceleration = 200% fire rate increase = 3x fire rate
  }
  accelerate() {
    this.#accelerated = this.getAcceleratedReloadRate() * 1.1; //Always wait for at least the reload time before deceling
    if (this.#acceleration < this.maxAccel) {
      this.#acceleration += this.accel;
    }
    if (this.#acceleration > this.maxAccel) {
      this.#acceleration = this.maxAccel;
    }
  }
  decelerate() {
    //If accelerated this frame, don't slow down
    if (this.#accelerated > 0) {
      this.#accelerated--;
      return;
    }
    //Else do
    if (this.#acceleration > 0) {
      this.#acceleration -= this.accelDecay;
    }
    if (this.#acceleration < 0) {
      this.#acceleration = 0;
    }
  }
  /**
   * @param {EquippedEntity} holder
   */
  fire(holder) {
    if (this.#cooldown <= 0) {
      if (this.ammoType !== "none") {
        if (holder.inventory.hasItem(this.ammoType, this.ammoUse))
          holder.inventory.removeItem(this.ammoType, this.ammoUse);
        else return;
      }
      let pos = this.component.getPosOn(holder);
      this.#cooldown = this.getAcceleratedReloadRate();
      this.accelerate(); //Apply acceleration effects
      //Resolve nonexistent properties
      this.shoot.pattern.spread ??= 0;
      this.shoot.pattern.amount ??= 1;
      this.shoot.pattern.spacing ??= 0;

      patternedBulletExpulsion(
        pos.x,
        pos.y,
        this.shoot.bullet,
        this.shoot.pattern.amount,
        degrees(pos.direction),
        this.shoot.pattern.spread,
        this.shoot.pattern.spacing,
        holder.world,
        holder
      );
      if (this.component instanceof WeaponComponent) {
        this.component.trigger();
      }
    }
  }
  /**@param {EquippedEntity} holder  */
  use(holder, isSecondary = false) {
    if (isSecondary) {
    } else {
      this.fire(holder);
    }
    super.use(holder, isSecondary);
  }
  /**@param {EquippedEntity} holder  */
  getContextualisedInfo(holder) {
    return (
      this.name +
      "\nAmmo: " +
      (this.ammoType !== "none" ? holder.inventory.count(this.ammoType) : "∞") +
      "\n" +
      this.ammoType +
      "\n" +
      ""
        .padEnd((this.#cooldown / this.reload) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15) +
      " "
    );
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
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  for (let index = 0; index < amount; index++) {
    /** @type {Bullet} */
    let bulletToFire = construct(bulletToSpawn, "bullet");
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
