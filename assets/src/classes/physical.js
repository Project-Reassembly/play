class PhysicalObject extends RegisteredItem {
  static debug = false;
  x = 0;
  y = 0;
  /**@type {number} */
  width = null;
  /**@type {number} */
  height = null;
  /**Direction in degrees */
  direction = 0;
  _previousRot = 0;
  hitSize = 30;
  /** @type {World} */
  world = null;
  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }
  init() {
    this.width ??= this.hitSize;
    this.height ??= this.hitSize;
  }

  oncreated() {}

  /**
   * @param {PhysicalObject} other
   */
  collidesWith(other) {
    if (!other) return false;
    return hitboxesIntersect(
      this,
      other,
      this instanceof Block,
      other instanceof Block
    );
  }

  move(dx, dy, ignoresBlocks = false) {
    // this.x += dx;
    // this.y += dy;
    // if (ignoresBlocks) return;
    // //COLLISION DETECTION AAAA
    // let hx = Math.floor(this.x / Block.size);
    // let hy = Math.floor(this.y / Block.size);
    // //Blocks
    // let up = this.world.getBlock(hx, hy - 1, "blocks");
    // let upright = this.world.getBlock(hx + 1, hy - 1, "blocks");
    // let down = this.world.getBlock(hx, hy + 1, "blocks");
    // let downright = this.world.getBlock(hx + 1, hy + 1, "blocks");
    // let left = this.world.getBlock(hx - 1, hy, "blocks");
    // let upleft = this.world.getBlock(hx - 1, hy - 1, "blocks");
    // let right = this.world.getBlock(hx + 1, hy, "blocks");
    // let downleft = this.world.getBlock(hx - 1, hy + 1, "blocks");
    // //Entity colliders
    // let topcollision = this.y + this.height / 2;
    // let bottomcollision = this.y - this.height / 2;
    // let leftcollision = this.x - this.width / 2;
    // let rightcollision = this.x + this.width / 2;
    // //Intermediary
    // let hitsupleft =
    //   upleft &&
    //   !upleft.walkable &&
    //   bottomcollision < upleft.y + Block.size &&
    //   leftcollision < upleft.x + Block.size;
    // let hitsupright =
    //   upright &&
    //   !upright.walkable &&
    //   bottomcollision < upright.y + Block.size &&
    //   rightcollision > upright.x;
    // let hitsdownleft =
    //   downleft &&
    //   !downleft.walkable &&
    //   topcollision > downleft.y &&
    //   leftcollision < downleft.x + Block.size;
    // let hitsdownright =
    //   downright &&
    //   !downright.walkable &&
    //   topcollision > downright.y &&
    //   rightcollision > downright.x;
    // //Movement
    // let noup =
    //   (up && !up.walkable && bottomcollision < up.y + Block.size) ||
    //   hitsupleft ||
    //   hitsupright;
    // let nodown =
    //   (down && !down.walkable && topcollision > down.y) ||
    //   hitsdownright ||
    //   hitsdownleft;
    // let noleft =
    //   (left && !left.walkable && leftcollision < left.x + Block.size) ||
    //   hitsupleft ||
    //   hitsdownleft;
    // let noright =
    //   (right && !right.walkable && rightcollision > right.x) ||
    //   hitsdownright ||
    //   hitsupright;
    // //Final judgement
    // if (noright) {
    //   this.x = (right ?? upright ?? downright).x - this.width / 2;
    // }
    // if (noleft) {
    //   this.x = (left ?? upleft ?? downleft).x + this.width / 2 + Block.size;
    // }
    // if (noup) {
    //   this.y = (up ?? upleft ?? upright).y + this.height / 2 + Block.size;
    // }
    // if (nodown) {
    //   this.y = (down ?? downleft ?? downright).y - this.height / 2;
    // }
    let hx = Math.floor(this.x / Block.size);
    let hy = Math.floor(this.y / Block.size);
    this._moveX(dx, ignoresBlocks);
    this._moveY(dy, ignoresBlocks);
    //time to die
    if (ignoresBlocks) return;
    let here = this.world.getBlock(hx, hy, "blocks");
    let inBlock = here && !here.walkable && this.collidesWith(here);
    if (inBlock && this instanceof ShootableObject) {
      this.damage("suffocate", 5);
    }
  }

  _moveX(dx, ignoresBlocks = false) {
    this.x += dx;
    if (ignoresBlocks) return;
    //COLLISION DETECTION AAAA
    let hx = Math.floor(this.x / Block.size);
    let hy = Math.floor(this.y / Block.size);
    //Blocks
    let upright = this.world.getBlock(hx + 1, hy - 1, "blocks");
    let downright = this.world.getBlock(hx + 1, hy + 1, "blocks");
    let left = this.world.getBlock(hx - 1, hy, "blocks");
    let upleft = this.world.getBlock(hx - 1, hy - 1, "blocks");
    let right = this.world.getBlock(hx + 1, hy, "blocks");
    let downleft = this.world.getBlock(hx - 1, hy + 1, "blocks");
    //Entity colliders
    let topcollision = this.y + this.height / 2;
    let bottomcollision = this.y - this.height / 2;
    let leftcollision = this.x - this.width / 2;
    let rightcollision = this.x + this.width / 2;
    //Intermediary
    let hitsupleft =
      upleft &&
      !upleft.walkable &&
      bottomcollision < upleft.y + Block.size &&
      leftcollision < upleft.x + Block.size;
    let hitsupright =
      upright &&
      !upright.walkable &&
      bottomcollision < upright.y + Block.size &&
      rightcollision > upright.x;
    let hitsdownleft =
      downleft &&
      !downleft.walkable &&
      topcollision > downleft.y &&
      leftcollision < downleft.x + Block.size;
    let hitsdownright =
      downright &&
      !downright.walkable &&
      topcollision > downright.y &&
      rightcollision > downright.x;
    //Movement
    let noleft =
      (left && !left.walkable && leftcollision < left.x + Block.size) ||
      hitsupleft ||
      hitsdownleft;
    let noright =
      (right && !right.walkable && rightcollision > right.x) ||
      hitsdownright ||
      hitsupright;
    //Final judgement
    if (noright) {
      this.x = (right ?? upright ?? downright).x - this.width / 2;
    }
    if (noleft) {
      this.x = (left ?? upleft ?? downleft).x + this.width / 2 + Block.size;
    }
  }

  _moveY(dy, ignoresBlocks = false) {
    this.y += dy;
    if (ignoresBlocks) return;
    //COLLISION DETECTION AAAA
    let hx = Math.floor(this.x / Block.size);
    let hy = Math.floor(this.y / Block.size);
    //Blocks
    let up = this.world.getBlock(hx, hy - 1, "blocks");
    let upright = this.world.getBlock(hx + 1, hy - 1, "blocks");
    let down = this.world.getBlock(hx, hy + 1, "blocks");
    let downright = this.world.getBlock(hx + 1, hy + 1, "blocks");
    let upleft = this.world.getBlock(hx - 1, hy - 1, "blocks");
    let downleft = this.world.getBlock(hx - 1, hy + 1, "blocks");
    //Entity colliders
    let topcollision = this.y + this.height / 2;
    let bottomcollision = this.y - this.height / 2;
    let leftcollision = this.x - this.width / 2;
    let rightcollision = this.x + this.width / 2;
    //Intermediary
    let hitsupleft =
      upleft &&
      !upleft.walkable &&
      bottomcollision < upleft.y + Block.size &&
      leftcollision < upleft.x + Block.size;
    let hitsupright =
      upright &&
      !upright.walkable &&
      bottomcollision < upright.y + Block.size &&
      rightcollision > upright.x;
    let hitsdownleft =
      downleft &&
      !downleft.walkable &&
      topcollision > downleft.y &&
      leftcollision < downleft.x + Block.size;
    let hitsdownright =
      downright &&
      !downright.walkable &&
      topcollision > downright.y &&
      rightcollision > downright.x;
    //Movement
    let noup =
      (up && !up.walkable && bottomcollision < up.y + Block.size) ||
      hitsupleft ||
      hitsupright;
    let nodown =
      (down && !down.walkable && topcollision > down.y) ||
      hitsdownright ||
      hitsdownleft;
    //Final judgement
    if (noup) {
      this.y = (up ?? upleft ?? upright).y + this.height / 2 + Block.size;
    }
    if (nodown) {
      this.y = (down ?? downleft ?? downright).y - this.height / 2;
    }
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
    let done = false;
    //Choose smaller turn
    if (Math.abs(deltaRot) > maxRotateAmount) {
      deltaD = maxRotateAmount * sign;
      done = true;
    } else {
      deltaD = deltaRot;
      done = false;
    }
    //Turn
    this.direction += degrees(deltaD);
    return done;
  }

  moveTowards(x, y, speed, turnSpeed, rotate = false, ignoreBlocks = false) {
    if (!rotate) {
      let oldRot = this.direction;
      this.direction = this._previousRot;
      this.rotateTowards(x, y, turnSpeed);
      this.move(
        speed * Math.cos(radians(this.direction)), //Move in x-direction
        speed * Math.sin(radians(this.direction)), // Move in y-direction
        ignoreBlocks
      );
      this._previousRot = this.direction;
      this.direction = oldRot;
      return true;
    } else {
      let done = this.rotateTowards(x, y, turnSpeed);
      this.move(
        speed * Math.cos(radians(this.direction)), //Move in x-direction
        speed * Math.sin(radians(this.direction)), // Move in y-direction
        ignoreBlocks
      );
      return done;
    }
  }

  draw() {
    if (PhysicalObject.debug) {
      push();
      noFill();
      stroke(0, 255, 0);
      strokeWeight(2);
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }
  tick() {}
  /**
   * @param {PhysicalObject} otherObj
   */
  distanceTo(otherObj) {
    return ((this.y - otherObj.y) ** 2 + (this.x - otherObj.x) ** 2) ** 0.5;
  }
  distanceToPoint(x, y) {
    return ((this.y - y) ** 2 + (this.x - x) ** 2) ** 0.5;
  }
  get size() {
    return (this.width + this.height) / 2;
  }
  /**
   * @param {PhysicalObject[]} array Array to find objects in.
   * @param {number} maxDist Maximum distance, above which no entity will be targeted.
   * @param {(obj: PhysicalObject) => boolean} where Predicate for targeted objects.
   * @returns {PhysicalObject | null} The closest `PhysicalObject`, or `null` if the array had no `PhysicalObject`s
   */
  closestFrom(array, maxDist, where) {
    let mindist = Infinity;
    let chosen = null;
    for (let obj of array) {
      if (!where(obj)) continue;
      let dist = this.distanceTo(obj);
      if (dist > maxDist) continue;
      if (dist < mindist) {
        mindist = dist;
        chosen = obj;
      }
    }
    return chosen;
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }

  /**Shortcut for `emitEffect(effect, this, offX, offY)`. */
  emit(effect, offX, offY) {
    emitEffect(effect, this, offX, offY);
  }
}

class ShootableObject extends PhysicalObject {
  health = 0;
  maxHealth = 0;
  team = "enemy";
  dead = false;
  hasHealthbar = true;
  _healthbarShowTime = 0;
  init() {
    super.init();
    this.maxHealth = this.health;
  }
  tick() {
    this.checkBullets();
  }
  takeDamage(type, amount = 0, source = null) {
    if (amount === 0) return;
    this.damageTaken +=
      Math.min(amount, this.health) * this.effectiveHealthMult;
    if (source)
      source.damageDealt +=
        Math.min(amount, this.health) * this.effectiveHealthMult; //Stats pretend health was higher
    this.health -= amount;
    this.createDamageNumber(amount);
    if (this.health <= 0) {
      this.health = 0;
      if (!this.dead) {
        this.dead = true;
        this.onHealthZeroed(type, source);
      }
    }
  }
  createDamageNumber(amount) {
    this.world.particles.push(
      new TextParticle(
        this.x,
        this.y,
        rnd(0, Math.PI * 2),
        60,
        this.size / 30,
        0.1,
        roundNum(amount, 1),
        [255, (10 * this.maxHealth) / amount, 0],
        [255, (10 * this.maxHealth) / amount, 0],
        20,
        10,
        0,
        true
      )
    );
  }
  onHealthZeroed(type, source) {}
  checkBullets() {
    if (!this.world) return;
    for (let bullet of this.world.bullets) {
      //If colliding with a bullet on different team, that it hasn't already been hit by and that still exists
      if (
        !bullet.remove &&
        this.team !== bullet.entity.team &&
        !bullet.damaged.includes(this) &&
        (this.collidesWith(bullet) || bullet.collidesWith(this)) //check collisions last for performance reasons
      ) {
        //Take all damage instances
        for (let instance of bullet.damage) {
          if (!instance.spread) instance.spread = 0;
          // if (instance.area)
          //   //If it explodes
          //   splashDamageInstance(
          //     bullet.x,
          //     bullet.y,
          //     instance.amount + rnd(instance.spread, -instance.spread),
          //     instance.type,
          //     instance.area,
          //     bullet.entity,
          //     instance.visual, //        \
          //     instance.sparkColour, //   |
          //     instance.sparkColourTo, // |
          //     instance.smokeColour, //   |- These are optional, but can be set per instance
          //     instance.smokeColourTo, // |
          //     instance.waveColour, //     /
          //     bullet.status,
          //     bullet.statusDuration
          //   );
          // else
          if (!instance.area)
            this.damage(
              instance.type,
              instance.amount + rnd(instance.spread, -instance.spread),
              bullet.entity
            );
        }
        this.hitByBullet(bullet);
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
  hitByBullet(bullet) {}
  /**Deals damage to this object. If health goes below zero, the object is removed.*/
  damage(type = "normal", amount = 0, source = null) {
    this._healthbarShowTime = 180;
    this.takeDamage(type, Math.max(amount, 0), source);
  }
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  collidesWith(obj) {
    //No collisions if dead
    return !this.dead && super.collidesWith(obj);
  }
  postDraw() {
    if (this._healthbarShowTime > 0) {
      push();
      rectMode(CORNER);
      stroke(0);
      strokeWeight(1);
      fill(0);
      rect(
        this.x - this.width / 2,
        this.y + this.height / 2 - 5,
        this.width,
        5
      );
      fill(
        ...blendColours([0, 255, 0], [255, 0, 0], this.health / this.maxHealth)
      );
      noStroke();
      rect(
        this.x - this.width / 2,
        this.y + this.height / 2 - 5,
        (this.width * this.health) / this.maxHealth,
        5
      );
      pop();
      if (!game.paused) this._healthbarShowTime--;
    }
  }
}

/**
 * Checks collisions between 2 actual objects.
 * @param {PhysicalObject} hb1 First object to check
 * @param {PhysicalObject} hb2 Second object to check.
 * @returns True if the objects collide.
 */
function hitboxesIntersect(hb1, hb2, isHB1Block, isHB2Block) {
  return rectanglesIntersect(
    hb1.x + (isHB1Block ? Block.size / 2 : 0),
    hb1.y + (isHB1Block ? Block.size / 2 : 0),
    hb1.width / 2,
    hb1.height / 2,
    hb2.x + (isHB2Block ? Block.size / 2 : 0),
    hb2.y + (isHB2Block ? Block.size / 2 : 0),
    hb2.width / 2,
    hb2.height / 2
  );
}
/**
 * Checks for collision between 2 rectangular objects/hitboxes.
 * @param {number} ox Object X position
 * @param {number} oy Object Y position
 * @param {number} odx Object width
 * @param {number} ody Object height
 * @param {number} cx Collider X
 * @param {number} cy Collider Y
 * @param {number} dx Collider width
 * @param {number} dy Collider height
 * @returns True if the rectangles are colliding or not.
 */
function rectanglesIntersect(ox, oy, odx, ody, cx, cy, dx, dy) {
  return (
    ox + odx >= cx - dx &&
    ox - odx <= cx + dx &&
    oy + ody >= cy - dy &&
    oy - ody <= cy + dy
  );
}
