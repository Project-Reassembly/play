import { col } from "../core/color.js";
import { Vector, clamp, rnd, roundNum, turn } from "../core/number.js";
import Integrate from "../lib/integrate.js";
import { debug } from "../play/debug.js";
import { emitEffect } from "../play/effects.js";
import { blockSize } from "../scaling.js";
import { TextParticle } from "./effect/text-particle.js";
export class PhysicalObject extends Integrate.RegisteredItem {
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

  visible = true;
  tangible = true;
  get pos() {
    return new Vector(this.x, this.y);
  }
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
    return !other ? false : hitboxesIntersect(this, other);
  }

  moveVct(vct, ignoresBlocks = false) {
    this.move(vct.x, vct.y, ignoresBlocks);
  }

  move(dx, dy, ignoresBlocks = false) {
    let hx = Math.round(this.x / blockSize);
    let hy = Math.round(this.y / blockSize);
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
    let hx = Math.round(this.x / blockSize);
    let hy = Math.round(this.y / blockSize);
    //Blocks
    let upright = this.world.getBlock(hx + 1, hy - 1, "blocks");
    let downright = this.world.getBlock(hx + 1, hy + 1, "blocks");
    let left = this.world.getBlock(hx - 1, hy, "blocks");
    let upleft = this.world.getBlock(hx - 1, hy - 1, "blocks");
    let right = this.world.getBlock(hx + 1, hy, "blocks");
    let downleft = this.world.getBlock(hx - 1, hy + 1, "blocks");
    //Entity colliders
    let topcollision = this.y + this.height * 0.5;
    let bottomcollision = this.y - this.height * 0.5;
    let leftcollision = this.x - this.width * 0.5;
    let rightcollision = this.x + this.width * 0.5;
    //Intermediary
    let hitsupleft =
      upleft &&
      !upleft.walkable &&
      bottomcollision < upleft.y + blockSize * 0.5 &&
      leftcollision < upleft.x + blockSize * 0.5;
    let hitsupright =
      upright &&
      !upright.walkable &&
      bottomcollision < upright.y + blockSize * 0.5 &&
      rightcollision > upright.x - blockSize * 0.5;
    let hitsdownleft =
      downleft &&
      !downleft.walkable &&
      topcollision > downleft.y - blockSize * 0.5 &&
      leftcollision < downleft.x + blockSize * 0.5;
    let hitsdownright =
      downright &&
      !downright.walkable &&
      topcollision > downright.y - blockSize * 0.5 &&
      rightcollision > downright.x - blockSize * 0.5;
    //Movement
    let noleft =
      (left && !left.walkable && leftcollision < left.x + blockSize * 0.5) ||
      hitsupleft ||
      hitsdownleft;
    let noright =
      (right && !right.walkable && rightcollision > right.x - blockSize * 0.5) ||
      hitsdownright ||
      hitsupright;
    //Final judgement
    if (noright) {
      this.x = (right ?? upright ?? downright).x - this.width * 0.5 - blockSize * 0.5;
    }
    if (noleft) {
      this.x = (left ?? upleft ?? downleft).x + this.width * 0.5 + blockSize * 0.5;
    }
  }

  _moveY(dy, ignoresBlocks = false) {
    this.y += dy;
    if (ignoresBlocks) return;
    //COLLISION DETECTION AAAA
    let hx = Math.round(this.x / blockSize);
    let hy = Math.round(this.y / blockSize);
    //Blocks
    let up = this.world.getBlock(hx, hy - 1, "blocks");
    let upright = this.world.getBlock(hx + 1, hy - 1, "blocks");
    let down = this.world.getBlock(hx, hy + 1, "blocks");
    let downright = this.world.getBlock(hx + 1, hy + 1, "blocks");
    let upleft = this.world.getBlock(hx - 1, hy - 1, "blocks");
    let downleft = this.world.getBlock(hx - 1, hy + 1, "blocks");
    //Entity colliders
    let topcollision = this.y + this.height * 0.5;
    let bottomcollision = this.y - this.height * 0.5;
    let leftcollision = this.x - this.width * 0.5;
    let rightcollision = this.x + this.width * 0.5;
    //Intermediary
    let hitsupleft =
      upleft &&
      !upleft.walkable &&
      bottomcollision < upleft.y + blockSize * 0.5 &&
      leftcollision < upleft.x + blockSize * 0.5;
    let hitsupright =
      upright &&
      !upright.walkable &&
      bottomcollision < upright.y + blockSize * 0.5 &&
      rightcollision > upright.x - blockSize * 0.5;
    let hitsdownleft =
      downleft &&
      !downleft.walkable &&
      topcollision > downleft.y - blockSize * 0.5 &&
      leftcollision < downleft.x + blockSize * 0.5;
    let hitsdownright =
      downright &&
      !downright.walkable &&
      topcollision > downright.y - blockSize * 0.5 &&
      rightcollision > downright.x - blockSize * 0.5;
    //Movement
    let noup =
      (up && !up.walkable && bottomcollision < up.y + blockSize * 0.5) || hitsupleft || hitsupright;
    let nodown =
      (down && !down.walkable && topcollision > down.y - blockSize * 0.5) ||
      hitsdownright ||
      hitsdownleft;
    //Final judgement
    if (noup) {
      this.y = (up ?? upleft ?? upright).y + this.height * 0.5 + blockSize * 0.5;
    }
    if (nodown) {
      this.y = (down ?? downleft ?? downright).y - this.height * 0.5 - blockSize * 0.5;
    }
  }

  rotateTowards(x, y, amount) {
    let res = turn(this.direction, this.x, this.y, x, y, amount);
    this.direction = res.direction;
    // let delta = new Vector(x - this.x, y - this.y);
    // //Define variables
    // let currentDirection = Vector.fromAngle(this.direction).angle; //Find current angle, standardised
    // let targetDirection = delta.angle; //Find target angle, standardised
    // if (targetDirection === currentDirection) return; //Do nothing if facing the right way
    // let deltaRot = targetDirection - currentDirection;
    // //Rotation correction
    // if (deltaRot < -180) {
    //   deltaRot += 360;
    // } else if (deltaRot > 180) {
    //   deltaRot -= 360;
    // }
    // let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
    // let deltaD = 0;
    // let done = false;
    // //Choose smaller turn
    // if (Math.abs(deltaRot) > amount) {
    //   deltaD = amount * sign;
    //   done = true;
    // } else {
    //   deltaD = deltaRot;
    //   done = false;
    // }
    // //Turn
    // this.direction += deltaD;
    return res.done;
  }

  moveTowards(x, y, speed, turnSpeed, rotate = false, ignoreBlocks = false) {
    if (!rotate) {
      let oldRot = this.direction;
      this.direction = this._previousRot;
      this.rotateTowards(x, y, turnSpeed);
      this.moveVct(Vector.fromAngle(this.direction).scale(speed), ignoreBlocks);
      this._previousRot = this.direction;
      this.direction = oldRot;
      return true;
    } else {
      let done = this.rotateTowards(x, y, turnSpeed);
      this.moveVct(Vector.fromAngle(this.direction).scale(speed), ignoreBlocks);
      return done;
    }
  }

  draw() {
    if (debug.hitboxes) {
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
    return (this.width + this.height) * 0.5;
  }
  /**
   * @param {PhysicalObject[]} array Array to find objects in.
   * @param {number} maxDist Maximum distance, above which no entity will be targeted.
   * @param {(obj: PhysicalObject) => boolean} where Predicate for targeted objects.
   * @returns {PhysicalObject | null} The closest `PhysicalObject`, or `null` if the array had no `PhysicalObject`s
   */
  closestFrom(array, maxDist = Infinity, where = null) {
    let mindist = Infinity;
    let chosen = null;
    for (let obj of array) {
      if (!obj) continue;
      if (where && !where(obj)) continue;
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
  emit(effect, offX, offY, impact = false) {
    emitEffect(effect, this, offX, offY, impact);
  }
}

export class ShootableObject extends PhysicalObject {
  health = 100;
  maxHealth = 0;
  team = "scrap";
  dead = false;
  hasHealthbar = true;
  _healthbarShowTime = 0;
  //defense
  /** Extra healthbar, basically. */
  shield = 0;
  _lastMaxShield = 0;
  _shieldShowTime = 0;
  /** uh oh */
  useYellowShield = false;
  /** Damage reduction for shield health. More effective vs. higher damage values. Should use a similar scale to armour value.*/
  shieldRating = 0;

  /** Damage reduction. Less effective vs. higher damage values. */
  armour = 0;
  /** Increase this to decrease the amount by which higher values reduce damage. By a **lot**. _This is sensitive_, use carefully.*/
  armourToughness = 0;
  //
  init() {
    super.init();
    this.maxHealth = this.health;
  }
  takeDamage(type, amount = 0, source = null) {
    let oldHP = this.health;
    if (amount === 0) return 0;
    this.createDamageNumber(Math.min(amount, this.health));
    this.health -= amount;
    if (!(this.health > 0)) {
      this.health = 0;
      if (!this.dead) {
        this.dead = true;
        this.onHealthZeroed(type, source);
      }
    }
    return oldHP - this.health;
  }
  createDamageNumber(amount) {
    this._baseDamageNumber(amount, this.x, this.y);
  }
  createShieldDamageNumber(amount) {
    this._shieldDamageNumber(amount, this.x, this.y);
  }
  _baseDamageNumber(amount, x, y) {
    const frac = amount / this.maxHealth;
    this.world.particles.push(
      new TextParticle(
        x,
        y,
        rnd.float(0, Math.PI * 2),
        60,
        this.size / 30 + Math.sqrt(frac),
        0.025,
        roundNum(Math.abs(amount), 1),

        createFlashingColourArray(
          amount > 0 ?
            col.interp([col.yellow, col.red, col.black], clamp(frac, 0, 1))
          : col.interp([col.from(200, 255, 0), col.green, col.white], clamp(-frac, 0, 1)),
          65,
        ),

        (1 + (amount / this.maxHealth) * 0.5) * 20,
        (1 + amount / this.maxHealth / 6) * 10,
        0,
        true,
      ),
    );
  }
  _shieldDamageNumber(amount, x, y) {
    const frac = amount / this._lastMaxShield;
    this.world.particles.push(
      new TextParticle(
        x,
        y,
        rnd.float(0, Math.PI * 2),
        60,
        this.size / 30 + Math.sqrt(frac),
        0.025,
        roundNum(Math.abs(amount), 1),

        createFlashingColourArray(
          amount > 0 ?
            col.interp(
              this.useYellowShield ? [col.yellow, col.white] : [col.blue, col.cyan, col.white],
              clamp(frac, 0, 1),
            )
          : col.magenta,
          65,
        ),

        (1 + frac * 0.5) * 20,
        (1 + frac / 6) * 10,
        0,
        true,
      ),
    );
  }
  onHealthZeroed(type, source) {}
  /**
   * Fired when a bullet hits this object, whatever team it's on.
   * @param {Bullet} bullet
   */
  hitByBullet(bullet) {}
  /**Deals damage to this object. If health goes below zero, the object is removed.*/
  damage(type = "normal", amount = 0, source = null) {
    this._healthbarShowTime = 180;
    this._shieldShowTime = 30;
    if (this.shield > 0) {
      const oldshield = this.shield;
      const sdam = Math.max(this.calcShield(amount), 0);
      this.createShieldDamageNumber(sdam);
      this.shield -= sdam;
      if (this.shield <= 0) {
        this.breakShield();
        amount -= oldshield;
      } else return oldshield - this.shield;
    }
    return this.takeDamage(type, Math.max(this.calcArmour(amount), 0), source);
  }
  /**@readonly Natural logarithm of 1.4 */
  static LN1p4 = Math.log(1.4);
  /** Calculate the damage to deal to this entity after applying armour. */
  calcArmour(amount) {
    let at = Math.log1p(this.armourToughness) / ShootableObject.LN1p4;
    return (
      amount *
      (1 - ((1 - (at + 1) / (this.armour + at + 1)) ** 0.3) ** (amount ** (1 - (at + 1) / 10)))
    );
  }
  /** Calculate the damage to do to the entity's shield. */
  calcShield(amount) {
    return this.shield > 0 ? (amount + 1) ** (1 / (this.shieldRating / 400 + 1)) - 1 : 0;
  }
  addShield(amount) {
    if (this.shield == 0) this._lastMaxShield = amount;
    else this._lastMaxShield += amount;
    this.shield += amount;
  }
  breakShield() {
    this.shield = 0;
    this.emit(this.useYellowShield ? "shield-break-yellow" : "shield-break");
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
      rect(this.x - this.width * 0.5, this.y + this.height * 0.5 - 5, this.width, 5);
      col.fill(col.interp([col.red, col.yellow, col.green], this.health / this.maxHealth));
      noStroke();
      rect(
        this.x - this.width * 0.5,
        this.y + this.height * 0.5 - 5,
        (this.width * this.health) / this.maxHealth,
        5,
      );
      pop();
      this._healthbarShowTime--;
    }
    if (this._shieldShowTime > 0 && this.shield > 0) {
      push();
      const frac = this.shield / this._lastMaxShield;
      if (this.useYellowShield) {
        fill(255, 255, 100, frac * 150);
        stroke(255, 255, 100, frac * 255);
      } else {
        stroke(0, 255, 255, frac * 255);
        fill(0, 255, 255, frac * 150);
      }
      ellipse(this.x, this.y, this.width * 1.5, this.height * 1.5);
      pop();
      this._shieldShowTime--;
    }
  }
}

/**
 * Checks collisions between 2 actual objects.
 * @param {PhysicalObject} o1 First object to check
 * @param {PhysicalObject} o2 Second object to check.
 * @returns True if the objects collide.
 */
function hitboxesIntersect(o1, o2) {
  return rectanglesIntersect(
    o1.x,
    o1.y,
    o1.width / 2,
    o1.height / 2,
    o2.x,
    o2.y,
    o2.width / 2,
    o2.height / 2,
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
  return ox + odx >= cx - dx && ox - odx <= cx + dx && oy + ody >= cy - dy && oy - ody <= cy + dy;
}

function createFlashingColourArray(basecol, lightness = 255) {
  let lcol = col.lighten(basecol, lightness);
  return [basecol, lcol, basecol, lcol, basecol, lcol, basecol, lcol, basecol];
}
