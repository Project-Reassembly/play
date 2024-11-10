class Entity {
  x = 0;
  y = 0;
  direction = 0;
  health = 100;
  maxHealth = 100;
  name = "Entity";
  world = null;
  resistances = [];
  //How the entity will be drawn
  components = [

  ]

  hitSize = 100;
  speed = 10;
  team = "enemy";
  target = { x: 0, y: 0 };

  //Status effects
  effectiveDamageMult = 1;
  effectiveHealthMult = 1;
  effectiveResistanceMult = 1;
  effectiveSpeedMult = 1;
  statuses = [];

  constructor() {} //Because universal
  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }
  init() {
    this.maxHealth = this.health; //Stop part-damaged entities spawning
    this.components = this.components.map(x => construct(x))
  }
  addToWorld(world) {
    world.entities.push(this);
    this.world = world;
  }
  damage(type = "normal", amount = 0, source = null) {
    let calcAmount =
      (amount / this.effectiveHealthMult) * (source?.effectiveDamageMult ?? 1); //Get damage multiplier of source, if there is one
    for (let resistance of this.resistances) {
      if (resistance.type === type) {
        calcAmount -= amount * resistance.amount; //Negative resistance would actually make it do more damage
      }
    }
    this.takeDamage(Math.max(calcAmount, 0), source); //Take the damage, but never take negative damage
  }
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
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
      this.x += amount * xmove; //Knock in the direction of impact
      this.y += amount * ymove;
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
            this.x -= resolution * xmove; //Knock in the direction of impact
            this.y -= resolution * ymove;

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
        if (hit) break; //If hit, stop moving
        else {
          //If not hit, move
          this.x += resolution * xmove; //Knock in the direction of impact
          this.y += resolution * ymove;
        }
      }
    }
  }
  takeDamage(amount = 0, source = null) {
    this.damageTaken +=
      Math.min(amount, this.health) * this.effectiveHealthMult;
    if (source)
      source.damageDealt +=
        Math.min(amount, this.health) * this.effectiveHealthMult; //Stats pretend health was higher
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
    }
  }
  tick() {
    if(this.target){
      this.rotateTowards(this.target.x, this.target.y, this.speed)
    }
    this.checkBullets();
    this.tickStatuses();
  }
  draw() {
    for(let component of this.components){
      component.draw(this.x, this.y, this.direction)
    }
  }
  collidesWith(obj) {
    //No collisions if dead
    return (
      !this.dead &&
      dist(this.x, this.y, obj.x, obj.y) <= this.hitSize + obj.hitSize
    );
  }
  checkBullets() {
    for (let bullet of this.world.bullets) {
      //If colliding with a bullet on different team, that it hasn't already been hit by and that still exists
      if (
        !bullet.remove &&
        this.team !== bullet.entity.team &&
        !bullet.damaged.includes(this) &&
        bullet.collidesWith(this) //check collisions last for performance reasons
      ) {
        //Take all damage instances
        for (let instance of bullet.damage) {
          if (instance.area)
            //If it explodes
            splashDamageInstance(
              bullet.x,
              bullet.y,
              instance.amount,
              instance.type,
              instance.area,
              bullet.entity,
              instance.visual, //        \
              instance.sparkColour, //   |
              instance.sparkColourTo, // |
              instance.smokeColour, //   |- These are optional, but can be set per instance
              instance.smokeColourTo, // |
              instance.waveColour, //     /
              bullet.status,
              bullet.statusDuration
            );
          else this.damage(instance.type, instance.amount, bullet.entity);
        }
        if(bullet.controlledKnockback){
          //Get direction to the target
          let direction = degrees(
            p5.Vector.sub(
              createVector(bullet.entity.target.x, bullet.entity.target.y), //Target pos 'B'
              createVector(bullet.x, bullet.y) //Bullet pos 'A'
            ).heading() //'A->B' = 'B' - 'A'
          );
          this.knock(bullet.knockback, direction, bullet.kineticKnockback); //Knock with default resolution
        }
        else{
          this.knock(bullet.knockback, bullet.direction, bullet.kineticKnockback); //Knock with default resolution
        }
        if (bullet.status !== "none") {
          this.applyStatus(bullet.status, bullet.statusDuration);
        }
        //Make the bullet know
        bullet.damaged.push(this);
        //Reduce pierce
        bullet.pierce--;
        //If exhausted
        if (bullet.pierce < 0) {
          //Delete
          bullet.remove = true;
        }
      }
    }
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
    this.statuses.push({ effect: effect, time: time, timeLeft: time });
  }
  rotateTowards(x, y, amount) {
    let maxRotateAmount = radians(amount); //use p5 to get radians
    let delta = { x: x - this.x, y: y - this.y };
    //Define variables
    let currentDirection = p5.Vector.fromAngle(this.directionRad).heading(); //Find current angle, standardised
    let targetDirection = Math.atan2(delta.y, delta.x); //Find target angle, standardised
    if (targetDirection === currentDirection) return; //Do nothing if facing the right way
    let deltaRot = targetDirection - currentDirection;
    //Rotation correction
    if (deltaRot < -PI) {
      deltaRot += TWO_PI;
    } else if (deltaRot > PI) {
      deltaRot -= TWO_PI;
    }
    let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
    let deltaD = 0;
    //Choose smaller turn
    if (Math.abs(deltaRot) > maxRotateAmount) {
      deltaD = maxRotateAmount * sign;
    } else {
      deltaD = deltaRot;
    }
    //Turn
    this.direction += degrees(deltaD);
  }
}
