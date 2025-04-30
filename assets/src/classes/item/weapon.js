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
    this.shoot = constructFromType(this.shoot, WeaponShootConfiguration);
    if (this.altShoot)
      this.altShoot = constructFromType(
        this.altShoot,
        WeaponShootConfiguration
      );
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
  _useAmmo(holder) {
    if (this.ammoType !== "none") {
      if (holder.inventory.hasItem(this.ammoType, this.ammoUse))
        holder.inventory.removeItem(this.ammoType, this.ammoUse);
      else return false;
    }
    return true;
  }
  _internalFire(holder, shoot = this.shoot) {
    if (!this._useAmmo(holder)) return;

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
        ? Registry.items.get(this.ammoType).name + " ×" + this.ammoUse
        : " - ") +
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
  createExtendedTooltip() {
    return [
      this.hasAltFire
        ? "🟨 ------- Main ------- ⬜"
        : "🟨 -------------------- ⬜",
      ...Weapon.infoOfShootPattern(this.shoot),
      this.hasAltFire ? "🟨 ------- Alt -------- ⬜" : "",
      ...(this.hasAltFire ? Weapon.infoOfShootPattern(this.altShoot) : []),
      "🟨 -------------------- ⬜",
    ];
  }
  static infoOfShootPattern(shoot) {
    return [
      "Fire Rate: " +
        (shoot.pattern.amount * shoot.pattern.burst > 1
          ? shoot.pattern.amount * shoot.pattern.burst + "× "
          : "") +
        roundNum(60 / (shoot.reload + shoot.charge), 2) +
        "/s",
      shoot.pattern.spread ? shoot.pattern.spread + "° inaccuracy" : "",
      shoot.pattern.spacing ? shoot.pattern.spacing + "° shot spacing" : "",
      "Shot:",
      ...Weapon.getBulletInfo(shoot.bullet, 1),
    ];
  }
  static getBulletInfo(bullet = {}, idl = 0) {
    /**@type {Bullet} */
    let blt = construct(bullet, "bullet");
    let time = Math.min(blt.lifetime, blt.speed / blt.decel);
    return [
      ind(idl) +
        (blt instanceof PointBullet
          ? "🟪instant⬜"
          : blt instanceof LaserBullet
          ? blt.length
          : roundNum(
              //s = ut + ½at²
              (blt.speed * time - 0.5 * (blt.decel * time ** 2)) / 30,
              1
            ) + " blocks range"),

      ...blt.damage.map(
        (x) =>
          ind(idl) +
          (x.amount ?? 0) +
          " " +
          (x.type ?? (x.radius > 0 ? "explosion" : "unknown")) +
          (x.radius > 0 ? " area" : "") +
          " damage" +
          (x.radius > 0 ? " ~ " + roundNum(x.radius / 30, 1) + " blocks" : "")
      ),

      ind(idl) +
        (blt.status !== "none"
          ? "🟨" +
            Registry.statuses.get(blt.status).name +
            " for " +
            roundNum(blt.statusDuration / 60, 1) +
            "s"
          : ""),

      ind(idl) + (blt.pierce > 0 ? "🟨" + blt.pierce + "× pierce⬜" : ""),

      ind(idl) + (blt.fires > 0 ? "🟧incendiary: " : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? blt.isFireBinomial
            ? blt.fireChance * 100 +
              "% chance for a fire " +
              (blt.fires > 1 ? blt.fires + " times" : "")
            : ((blt.fireChance ?? 1) !== 1
                ? blt.fireChance * 100 + "% chance for "
                : "") + (blt.fires > 1 ? blt.fires + " fires " : "1 fire ")
          : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? (blt.fire.damage ?? 1) +
            " " +
            (blt.fire.type ?? "fire") +
            " damage every " +
            roundNum((blt.fire.interval ?? 10) / 60, 1) +
            "s"
          : ""),
      ind(idl + 1) +
        (blt.fires > 0
          ? roundNum((blt.fire.lifetime ?? 600) / 60, 1) + "s lifetime⬜"
          : ""),

      ind(idl) + (blt instanceof Missile ? "🟦homing: " : ""),
      ind(idl + 1) +
        (blt instanceof Missile
          ? roundNum(blt.trackingRange / 30, 1) + " blocks range"
          : ""),
      ind(idl + 1) +
        (blt instanceof Missile
          ? roundNum(blt.turnSpeed, 1) + " strength⬜"
          : ""),

      ind(idl) + (blt.fragNumber > 0 ? blt.fragNumber + " frags:" : ""),
      ...(blt.fragNumber > 0
        ? Weapon.getBulletInfo(blt.fragBullet, idl + 1)
        : []),

      ind(idl) +
        (blt.intervalNumber > 0
          ? roundNum(blt.intervalNumber * 60 / blt.intervalTime, 1) +
            "/s interval shots:"
          : ""),
      ...(blt.intervalNumber > 0
        ? Weapon.getBulletInfo(blt.intervalBullet, idl + 1)
        : []),
    ];
  }
}

function ind(lvl = 0) {
  return "  ".repeat(lvl);
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
