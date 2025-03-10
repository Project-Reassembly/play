class Missile extends Bullet {
  target = null;
  trailColour = [255, 255, 100];
  trailColourTo = [255, 0, 0];
  flameLength = 200;
  trail = true;
  _trailInterval = -1;
  turnSpeed = 1;
  targetType = "mouse"; //"nearest", "mouse", "hovered"
  init() {
    if (this._trailInterval === -1) {
      this._trailInterval = this.speed / this.hitSize;
    }
  }
  spawnTrail(dt) {
    //Visual fire effect
    for (let e = 0; e < this.speed * dt; e++) {
      if (this._trailCounter <= 0) {
        if (this.world?.particles != null && this.trail) {
          this.world.particles.push(
            new ShapeParticle(
              this.x - e * p5.Vector.fromAngle(this.directionRad).x,
              this.y - e * p5.Vector.fromAngle(this.directionRad).y,
              this.directionRad,
              this.flameLength / this.speed, //Fixed life
              0,
              0,
              this.trailShape, //flames
              this.trailColour,
              this.trailColourTo, //Lerp colour thing
              this.hitSize * 1.9,
              0,
              this.hitSize * 1.9,
              0,
              0
            )
          );
        }
        this._trailCounter = this._trailInterval;
      } else {
        this._trailCounter--;
      }
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
    //Choose smaller turn
    if (Math.abs(deltaRot) > maxRotateAmount) {
      deltaD = maxRotateAmount * sign;
    } else {
      deltaD = deltaRot;
    }
    //Turn
    this.direction += degrees(deltaD);
  }
  step(dt) {
    super.step(dt);
    if (this.target && !this.target.dead && !this.target.remove) {
      //If target still there
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
    let selected = null;
    if (this.targetType === "nearest") {
      //Closest to bullet
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (entity.team !== this.entity.team && !entity.dead) {
            //Only select living entities
            let dist = Math.sqrt(
              (this.x - entity.x) ** 2 + (this.y - entity.y) ** 2
            ); //Pythagorean Theorem to find distance
            if (dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "hovered") {
      //Closest to mouse pointer
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (entity.team !== this.entity.team && !entity.dead) {
            //Only select living entities
            let dist = Math.sqrt(
              (game.mouse.x - entity.x) ** 2 + (game.mouse.y - entity.y) ** 2
            ); //Pythagorean Theorem to find distance
            if (dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "mouse") {
      //Closest to mouse pointer
      selected = game.mouse;
    }
    this.target = selected;
  }
}
