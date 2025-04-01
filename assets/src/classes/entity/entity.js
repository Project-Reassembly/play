/**
 * @typedef SerialisedEntity
 * @prop {number} health
 * @prop {string} entity Registry name.
 * @prop {{effect: string, duration: int}[]} statuses
 * @prop {number} x
 * @prop {number} y
 * @prop {number} spawnX
 * @prop {number} spawnY
 * @prop {boolean} isMainPlayer
 */
/** */
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
  target = null;

  //AI
  aiType = "passive";
  followRange = 100;
  targetRange = 1000;
  waitTime = 90;
  waitVariance = 60;
  _waiting = 0;
  spawnX = 0;
  spawnY = 0;

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

  init() {
    super.init();
    this.components = this.components.map((x) => construct(x, "component"));
    this.baseSpeed = this.speed;
  }

  moveTowards(x, y, rotate = true) {
    super.moveTowards(x, y, this.speed, this.turnSpeed, rotate);
  }

  addToWorld(world, x, y) {
    if (!(world instanceof World))
      throw new TypeError(
        "Cannot add entity to non-world object of type '" +
          world.constructor.name +
          "'"
      );
    world.entities.push(this);
    this.world = world;
    if (x != null) this.x = x;
    this.spawnX = this.x;
    if (y != null) this.y = y;
    this.spawnY = this.y;
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
    if (this.aiType === "passive") {
      this._passiveAI();
    } else if (this.aiType === "hostile") {
      this._hostileAI();
    } else if (this.aiType === "guard") {
      this._guardAI();
    } else if (this.aiType === "scavenger") {
      this._scavengerAI();
    }
    //Base AI
    if (this.target) {
      this._waiting--;
      if (this._waiting <= 0) {
        if (this.distanceToPoint(this.target.x, this.target.y) > this.size / 2)
          this.moveTowards(this.target.x, this.target.y, true);
      }
    }
  }

  /**Passive AI
   * - Wanders aimlessly towards random points outside the follow range, but within target range.
   * - Used by Hostile to patrol and find entities to attack.
   */
  _passiveAI() {
    if (!this.target || this.target instanceof PhysicalObject)
      this.target = { x: this.x, y: this.y };
    if (this.distanceTo(this.target) < this.size) {
      let xOffset =
        rnd(this.followRange, this.targetRange) * (tru(0.5) ? -1 : 1);
      let yOffset =
        rnd(this.followRange, this.targetRange) * (tru(0.5) ? -1 : 1);
      this.target.x += xOffset;
      this.target.y += yOffset;
      this._waiting =
        this.waitTime + rnd(this.waitVariance, -this.waitVariance);
    }
  }

  /**Hostile AI
   * - Follows entities within its taregt range.
   * - Acts as Passive when no entity can be found.
   */
  _hostileAI() {
    if (!this._generic_AttackerAI((ent) => !(ent instanceof DroppedItemStack)))
      this._passiveAI();
  }

  /**Scavenger AI
   * - Follows entities within its target range.
   * - Prioritises dropped items.
   * - Acts as Passive when no entity can be found.
   */
  _scavengerAI() {
    if (
      !this._generic_AttackerAI((ent) => ent instanceof DroppedItemStack, false)
    )
      if (!this._generic_AttackerAI()) this._passiveAI();
  }

  /**Guard AI
   * - Follows entities within its `targetRange` of its spawnpoint
   * - Returns to the spawnpoint if the entity left the range, or died
   * - Just waits at the spawnpoint, no passive movement.
   */
  _guardAI() {
    if (
      !this._generic_AttackerAI(
        (ent) =>
          !(ent instanceof DroppedItemStack) &&
          ent.distanceToPoint(this.spawnX, this.spawnY) < this.targetRange
      )
    )
      this.target = { x: this.spawnX, y: this.spawnY };
  }

  /** Generic AI for attacking entities.
   * @param {(entity: Entity) => boolean} conditions Condition for selecting entities, to make this AI less generic.
   * @param {boolean} [shoots=true] Whether or not the entity should shoot at the new target.
   * @returns {boolean} `true` if an entity is being targeted, `false` if not.
   */
  _generic_AttackerAI(conditions = () => true, shoots = true) {
    let tempTarget = this.target;
    this.target = this.closestFrom(
      this.world.entities,
      this.targetRange,
      (ent) => !ent.dead && ent.team !== this.team && conditions(ent)
    );
    if (this.target) {
      if (shoots && this.distanceTo(this.target) < this.followRange)
        if (this instanceof EquippedEntity) {
          if (
            this.rightHand.get(0) instanceof ItemStack &&
            this.rightHand.get(0).getItem() instanceof Equippable
          )
            this.rightHand.get(0).getItem().use(this);
          if (
            this.leftHand.get(0) instanceof ItemStack &&
            this.leftHand.get(0).getItem() instanceof Equippable
          )
            this.leftHand.get(0).getItem().use(this);
        }
      return true;
    } else {
      this.target = tempTarget;
      return false;
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
    if (PhysicalObject.debug) this._debugAI();
    super.draw();
  }
  /**Draws extra lines and stuff for AI debugging. */
  _debugAI() {
    push();
    noFill();
    stroke(this.target instanceof ShootableObject ? [255, 0, 0] : [0, 255, 0]);
    strokeWeight(4);
    square(this.target.x, this.target.y, this.size);
    line(this.x, this.y, this.target.x, this.target.y);
    if (this.aiType === "hostile" || this.aiType === "guard") {
      stroke(
        this.target instanceof ShootableObject
          ? [200, 0, 255, 100]
          : [255, 255, 0, 100]
      );
      circle(this.x, this.y, this.followRange * 2);
    }
    if (this.aiType === "hostile" || this.aiType === "scavenger") {
      stroke(
        this.target instanceof ShootableObject
          ? [255, 0, 0, 100]
          : [0, 255, 0, 100]
      );
      circle(this.x, this.y, this.targetRange * 2);
    }
    if (this.aiType === "guard") {
      stroke(
        this.target instanceof ShootableObject
          ? [255, 128, 0, 100]
          : [0, 255, 255, 100]
      );
      circle(this.spawnX, this.spawnY, this.targetRange * 2);
    }
    pop();
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
  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
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
  /**@returns {SerialisedEntity} */
  serialise() {
    return {
      entity: this.registryName,
      x: roundNum(this.x),
      y: roundNum(this.y),
      spawnX: roundNum(this.spawnX),
      spawnY: roundNum(this.spawnY),
      health: roundNum(this.health),
      statuses: this.statuses.map((x) => ({
        effect: x.effect,
        duration: timeLeft,
      })),
      isMainPlayer: this === game.player,
    };
  }
  /**@param {SerialisedEntity} created  */
  static deserialise(created, inFull = true) {
    /**@type {Entity} */
    let entity = construct(Registry.entities.get(created.entity), "entity");
    created.statuses.forEach((s) => entity.applyStatus(s.effect, s.duration));
    entity.health = created.health;
    if (entity instanceof InventoryEntity) {
      entity.inventory = Inventory.deserialise(created.inventory);
    }
    if (entity instanceof EquippedEntity) {
      entity.equipment = Inventory.deserialise(created.equipment);
      entity.leftHand = Inventory.deserialise(created.leftHand);
      entity.rightHand = Inventory.deserialise(created.rightHand);
      entity.head = Inventory.deserialise(created.head);
      entity.body = Inventory.deserialise(created.body);
    }
    //Rest handled in-chunk, but here it is:
    if (!inFull) return entity;
    entity.spawnX = created.spawnX;
    entity.spawnY = created.spawnY;
    entity.x = created.x;
    entity.y = created.y;
    return entity;
  }
}
