class Weapon extends Equippable {
  timer = new Timer();
  ammoType = "none";
  ammoUse = 1;
  shootX = 15;
  shoot = new WeaponShootConfiguration();
  hasAltFire = false;
  altShoot = null;

  //Internal
  #delay = 0;
  #cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  #lastReload = 0;
  #lastCharge = 0;

  init() {
    super.init();
    this.altShoot ??= structuredClone(this.shoot);
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    this.altShoot = constructFromType(this.altShoot, WeaponShootConfiguration);
  }

  /**@param {EquippedEntity} holder  */
  tick(holder) {
    super.tick(holder);
    this.timer.tick();
    this.decelerate();
    if (this.#cooldown > 0) {
      this.#cooldown--;
      if (this.#cooldown <= 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          this.shoot.readyEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction
        );
      }
    }
  }
  getAcceleratedReloadRate(shoot) {
    if (this.#acceleration <= -1 || this.#acceleration > this.maxAccel)
      return shoot.reload; //If bad acceleration then ignore it
    return shoot.reload / (1 + this.#acceleration); //2 acceleration = 200% fire rate increase = 3x fire rate
  }
  accelerate(shoot) {
    this.#accelerated = this.getAcceleratedReloadRate(shoot) * 1.1; //Always wait for at least the reload time before deceling
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
  fire(holder, shoot = this.shoot) {
    if (this.#cooldown <= 0) {
      this.#lastReload = shoot.reload;
      this.#lastCharge = shoot.charge;
      if (shoot.charge > 0) {
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          shoot.chargeEffect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction,
          () => this._getShootPos(holder)
        );
        this.#cooldown = shoot.reload + shoot.charge;
        this.timer.do(() => {
          this._internalFire(holder, shoot);
        }, shoot.charge);
      } else this._internalFire(holder, shoot);
    }
  }
  _internalFire(holder, shoot = this.shoot) {
    if (this.ammoType !== "none") {
      if (holder.inventory.hasItem(this.ammoType, this.ammoUse))
        holder.inventory.removeItem(this.ammoType, this.ammoUse);
      else return;
    }

    this.#cooldown = this.getAcceleratedReloadRate(shoot);
    this.accelerate(shoot); //Apply acceleration effects

    this.timer.repeat(
      () => {
        let pos = this._getShootPos(holder);
        autoScaledEffect(
          shoot.effect,
          holder.world,
          pos.x,
          pos.y,
          pos.direction
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
          this.component.trigger(shoot.recoilScale, shoot.rotRecoilScale);
        }
      },
      shoot.pattern.burst,
      shoot.pattern.interval
    );
  }
  /**@param {EquippedEntity} holder  */
  use(holder, isSecondary = false) {
    if (isSecondary) {
      if (this.altShoot) this.fire(holder, this.altShoot);
    } else {
      this.fire(holder, this.shoot);
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
    if (this.#cooldown <= this.#lastReload)
      return ""
        .padEnd((this.#cooldown / this.#lastReload) * 15, "■")
        .padEnd(15, "□")
        .substring(0, 15);
    else
      return ""
        .padEnd(
          15 - ((this.#cooldown - this.#lastReload) / this.#lastCharge) * 15,
          "■"
        )
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

class ShootPattern {
  spread = 0;
  spacing = 0;
  amount = 1;
  interval = 0;
  burst = 1;
}
class WeaponShootConfiguration {
  bullet = {};
  pattern = new ShootPattern();
  charge = 0;
  chargeEffect = "none";
  reload = 30;
  readyEffect = "none";
  effect = "shoot";
  recoilScale = 1;
  rotRecoilScale = 1;
  init() {
    this.pattern = constructFromType(this.pattern, ShootPattern);
  }
}
