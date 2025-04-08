class Weapon extends Equippable {
  timer = new Timer();
  reload = 30;
  readyEffect = "none";
  charge = 0;
  chargeEffect = "none";
  ammoType = "none";
  ammoUse = 1;
  shootX = 15;
  shoot = {
    bullet: null,
    pattern: {
      spread: 0,
      amount: 1,
      spacing: 0,
      burst: 1,
      interval: 0,
    },
  };
  fireEffect = "shoot";

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
    this.timer.tick();
    this.decelerate();
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos(holder);
        createEffect(
          this.readyEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction,
          1
        );
      }
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
  _getShootPos(holder) {
    let pos = this.component.getPosOn(holder);
    pos.x += Math.cos(pos.direction) * this.shootX;
    pos.y += Math.sin(pos.direction) * this.shootX;
    return pos;
  }
  /**
   * @param {EquippedEntity} holder
   */
  fire(holder) {
    if (this.#cooldown <= 0) {
      if (this.charge > 0) {
        let pos = this._getShootPos(holder);
        createEffect(
          this.chargeEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction,
          1,
          () => this._getShootPos(holder)
        );
        this.#cooldown = this.reload + this.charge;
        this.timer.do(() => {
          this._internalFire(holder, this.shoot);
        }, this.charge);
      } else this._internalFire(holder, this.shoot);
    }
  }
  _internalFire(holder, shoot = this.shoot) {
    if (this.ammoType !== "none") {
      if (holder.inventory.hasItem(this.ammoType, this.ammoUse))
        holder.inventory.removeItem(this.ammoType, this.ammoUse);
      else return;
    }

    this.#cooldown = this.getAcceleratedReloadRate();
    this.accelerate(); //Apply acceleration effects
    //Resolve nonexistent properties
    shoot.pattern.spread ??= 0;
    shoot.pattern.amount ??= 1;
    shoot.pattern.spacing ??= 0;
    shoot.pattern.burst ??= 1;
    shoot.pattern.interval ??= 0;

    this.timer.repeat(
      () => {
        let pos = this._getShootPos(holder);
        createEffect(
          this.fireEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction,
          1
        );
        patternedBulletExpulsion(
          pos.x,
          pos.y,
          shoot.bullet,
          shoot.pattern.amount,
          degrees(pos.direction),
          shoot.pattern.spread,
          shoot.pattern.spacing,
          holder.world,
          holder
        );
        if (this.component instanceof WeaponComponent) {
          this.component.trigger();
        }
      },
      this.shoot.pattern.burst,
      this.shoot.pattern.interval
    );
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
      (this.ammoType !== "none"
        ? Registry.items.get(this.ammoType).name
        : "none") +
      " x" +
      this.ammoUse +
      "\n" +
      this.createProgressBar() +
      " "
    );
  }
  createProgressBar() {
    if (this.#cooldown <= this.reload)
      return ""
        .padEnd((this.#cooldown / this.reload) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
    else
      return ""
        .padEnd(15 - ((this.#cooldown - this.reload) / this.charge) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
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
    bulletToFire.oncreated();
  }
}

class ShootPattern{
  spread = 0;
  spacing = 0;
  amount = 1;
  interval = 0;
  burst = 1;
}
class WeaponShootConfiguration{
  bullet = {};
  pattern = new ShootPattern();
}