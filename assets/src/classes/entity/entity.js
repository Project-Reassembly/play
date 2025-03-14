class Entity extends ShootableObject {
  name = "Entity";
  resistances = [];
  //How the entity will be drawn
  /**@type {Component[]} */
  components = [];

  moving = false;
  hitSize = 20;
  speed = 10;
  turnSpeed = 10;
  target = { x: 0, y: 0 };

  //Status effects
  effectiveDamageMult = 1;
  effectiveHealthMult = 1;
  effectiveResistanceMult = 1;
  effectiveSpeedMult = 1;
  statuses = [];

  //Physics
  flying = false;
  explosiveness = 0.1;
  _lastPos = { x: 0, y: 0 };
  get computedSpeed() {
    return (
      ((this.x - this._lastPos.x) ** 2 + (this.y - this._lastPos.y) ** 2) ** 0.5
    );
  }

  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }
  init() {
    super.init();
    this.components = this.components.map((x) => construct(x, "component"));
    this.baseSpeed = this.speed;
  }

  moveTowards(x, y, rotate = true) {
    super.moveTowards(x, y, this.speed, this.turnSpeed, rotate);
  }

  addToWorld(world, x, y) {
    world.entities.push(this);
    this.world = world;
    if (x != null) this.x = x;
    if (y != null) this.y = y;
  }

  knock(
    amount = 0,
    direction = -this.direction,
    kineticKnockback = false,
    resolution = 1,
    collided = []
  ) {
    if (resolution < 0) resolution *= -1; //Fix possilility of infinite loop
    if (resolution == 0) resolution = 1;
    //so sin and cos only happen once
    let ymove = Math.sin(radians(direction));
    let xmove = Math.cos(radians(direction));
    if (!kineticKnockback) {
      this.move(amount * xmove, amount * ymove, this.flying);
    } else {
      let hit = false; //Has the entity hit anything?
      for (let iteration = 0; iteration < amount; iteration += resolution) {
        //For every entity this one could possibly collide with
        for (let entity of this.world.entities) {
          if (
            //If a valid collision
            entity !== this &&
            !entity.dead &&
            this.team === entity.team &&
            !collided.includes(entity) && //Not if already hit
            this.collidesWith(entity)
          ) {
            //It's hit something!
            hit = true;
            collided.push(entity);

            //Move back to stop infinite loop
            this.move(-resolution * xmove, -resolution * ymove, this.flying);

            //Propagate knockback
            entity.knock(
              amount * 0.75 /* exponential decay */,
              direction,
              true,
              resolution,
              collided
            ); //Pass on collided entities to prevent infinite loop
          }
        }
        if (hit) break;
        else {
          this.move(resolution * xmove, resolution * ymove, this.flying);
        }
      }
    }
  }

  hitByBullet(bullet) {
    if (bullet.controlledKnockback) {
      //Get direction to the target
      let direction = degrees(
        p5.Vector.sub(
          createVector(bullet.entity.target.x, bullet.entity.target.y), //Target pos 'B'
          createVector(bullet.x, bullet.y) //Bullet pos 'A'
        ).heading() //'A->B' = 'B' - 'A'
      );
      this.knock(bullet.knockback, direction, bullet.kineticKnockback); //Knock with default resolution
    } else {
      this.knock(bullet.knockback, bullet.direction, bullet.kineticKnockback); //Knock with default resolution
    }
    if (bullet.status !== "none") {
      this.applyStatus(bullet.status, bullet.statusDuration);
    }
  }

  tick() {
    this.components.forEach((c) => c.tick(this));
    this.tickGroundEffects();
    this.ai();
    super.tick();
    this.tickStatuses();
    this._lastPos = { x: this.x, y: this.y };
  }

  ai() {
    if (this.target) {
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
  }

  tickGroundEffects() {
    let blockOn =
      this.world.getBlock(
        Math.floor(this.x / Block.size),
        Math.floor(this.y / Block.size),
        "floor"
      ) ??
      this.world.getBlock(
        Math.floor(this.x / Block.size),
        Math.floor(this.y / Block.size),
        "tiles"
      );
    if (blockOn instanceof Tile)
      this.speed = this.baseSpeed * blockOn.speedMultiplier;
  }
  draw() {
    for (let component of this.components) {
      component.draw(this.x, this.y, this.direction);
    }
    super.draw();
  }

  tickStatuses() {
    this.effectiveSpeedMult =
      this.effectiveDamageMult =
      this.effectiveHealthMult =
      this.effectiveResistanceMult =
        1;
    for (let status of this.statuses) {
      let effect = Registry.statuses.get(status.effect);
      this.damage(effect.damageType, effect.damage);
      this.heal(effect.healing);
      this.effectiveSpeedMult *= effect.speedMult ?? 1;
      this.effectiveDamageMult *= effect.damageMult ?? 1;
      this.effectiveHealthMult *= effect.healthMult ?? 1;
      this.effectiveResistanceMult *= effect.resistanceMult ?? 1;
      if (status.timeLeft > 0) status.timeLeft--; //Tick timer
      else this.statuses.splice(this.statuses.indexOf(status), 1); //Delete status
    }
  }
  applyStatus(effect, time) {
    if (time > 0)
      this.statuses.push({ effect: effect, time: time, timeLeft: time });
  }

  damage(type = "normal", amount = 0, source = null) {
    let calcAmount =
      (amount / this.effectiveHealthMult) * (source?.effectiveDamageMult ?? 1); //Get damage multiplier of source, if there is one
    for (let resistance of this.resistances) {
      if (resistance.type === type) {
        calcAmount -= amount * resistance.amount; //Negative resistance would actually make it do more damage
      }
    }
    super.damage(type, calcAmount, source);
  }

  move(x, y) {
    super.move(x, y, this.flying);
  }
  onHealthZeroed() {
    super.onHealthZeroed();
    liquidDestructionBlast(
      this.x,
      this.y,
      this.width * this.height, //this.maxHealth,
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      this.components,
      this.world
    );
    createDestructionExplosion(this.x, this.y, this);
  }
}
