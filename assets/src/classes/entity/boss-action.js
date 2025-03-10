class BossAction {
  duration = 1;
  /**
   * @param {Entity} entity
   */
  execute(entity) {} //Called once, on the first frame of this action
  /**
   * @param {Entity} entity
   */
  tick(entity) {} //Called every frame of this action
  /**
   * @param {Entity} entity
   */
  end(entity) {} //Called on the last frame of the action
}
class MovementAction extends BossAction {
  x = 0;
  y = 0;
  rot = 0;
  tick(entity) {
    entity.x += this.x / (this.duration + 1);
    entity.y += this.y / (this.duration + 1);
    entity.direction += this.rot / (this.duration + 1);
  }
}
class FireWeaponAction extends BossAction {
  slotIndex = 0;
  execute(entity) {
    if (entity.weaponSlots[this.slotIndex]?.weapon)
      entity.weaponSlots[this.slotIndex].weapon.fire();
  }
}
class ExitAction extends BossAction {
  execute(entity) {
    entity.hidden = true; //Stops bossbar finding it
    entity.oldX = entity.x; //Store old x for returning to
    entity.x = 32862587632756; //Put wayyyy offscreen
  }
}
//Also known as teleportation
class EntryAction extends BossAction {
  x = null;
  y = null;
  execute(entity) {
    entity.hidden = false; //Lets bossbar find it again
    entity.x = entity.oldX ?? 0; //Return to old x
    if (typeof this.x === "number") entity.x = this.x;
    if (typeof this.y === "number") entity.y = this.y;
  }
}
class RegenAction extends BossAction {
  amount = 0;
  tick(entity) {
    entity.heal(this.amount / (this.duration + 1));
  }
}
//boom
class SelfDestructAction extends BossAction {
  damage = 100;
  damageRadius = 200;
  damageType = "explosion";
  sparkColour = [255, 245, 215, 255]; //The colour the sparks start at
  sparkColourTo = [255, 215, 0, 55]; //The colour the sparks go to
  smokeColour = [100, 100, 100, 200]; //The colour the smoke starts at
  smokeColourTo = [100, 100, 100, 0]; //The colour the smoke goes to
  waveColour = [255, 128, 0, 0]; //The colour the wave ends at. It always starts white.
  blinds = false;
  blindOpacity = 0;
  blindDuration = 0;
  glareSize = 0;
  givesRewards = true;
  execute(entity) {
    entity.dead = true;
    splashDamageInstance(
      entity.x,
      entity.y,
      this.damage,
      this.damageType,
      this.damageRadius,
      entity,
      true,
      this.sparkColour,
      this.sparkColourTo,
      this.smokeColour,
      this.smokeColourTo,
      this.waveColour
    );
    if (this.givesRewards) {
      //Give destroy rewards if there's a difference, regular rewards if not
      game.shards += (entity.destroyReward ?? entity.reward)?.shards ?? 0;
      game.bloonstones +=
        (entity.destroyReward ?? entity.reward)?.bloonstones ?? 0;
    }
  }
}
//Creates an entity with an offset.
class SummonMinionAction extends BossAction {
  entity = "none";
  offsetX = 0;
  offsetY = 0;
  rotationOffset = 0;
  //Displacement in the direction of the source + offset rotation
  slide = 0;
  isBoss = false;
  //A single character to represent the type of boss the summon is
  bossClass = "s";
  //Any differences?
  differences = {};
  /**
   * @param {Entity} entity
   */
  execute(entity) {
    //get the entity
    let toSpawn = structuredClone(Registry.entities.get(this.entity));
    Object.assign(toSpawn, this.differences)
    //construct the entity
    /**@type {Entity} */
    let spawned = this.isBoss
      ? //Spawn it as a boss, if isBoss is true
        entity.world.spawnBoss(toSpawn, this.bossClass)
      : //If not, spawn it normally
        construct(toSpawn, Entity).addToWorld(entity.world);
    //Position and rotate the entity with trigonometry
    spawned.x =
      entity.x +
      this.offsetX +
      Math.cos(degrees(this.rotationOffset)) * this.slide;
    spawned.y =
      entity.y +
      this.offsetY +
      Math.sin(degrees(this.rotationOffset)) * this.slide;
    spawned.direction = entity.direction + this.rotationOffset;
    //"I created you, now do my bidding!"
    spawned.team = entity.team;
  }
}
//Like having a weapon, but also not having one at the same time.
//Allows bullet hell attacks, without having to work with difficult weapon stuff.
class SpawnBulletAction extends BossAction {
  xVar = 0;
  yVar = 0;
  x = 0;
  y = 0;
  direction = 0;
  bullet = {};
  amount = 1;
  spread = 0;
  spacing = 0;
  execute(entity) {
    //Spawn the bullets.
    patternedBulletExpulsion(
      this.x + rnd(-this.xVar, this.xVar),
      this.y + rnd(-this.yVar, this.yVar),
      this.bullet,
      this.amount,
      this.direction,
      this.spread,
      this.spacing,
      entity.world,
      entity,
      null
    );
  }
}
//Changes a boss' speed for a time
class ChangeSpeedAction extends BossAction {
  speed = -1;
  turnSpeed = -1;
  changesBack = true;
  #oldSpeed = 0;
  #oldTurnSpeed = 0;
  execute(entity) {
    //if the speed is defined, and makes sense
    if (this.speed >= 0) {
      //save old speed, and change
      this.#oldSpeed = entity.speed;
      entity.speed = this.speed;
    }
    if (this.turnSpeed >= 0) {
      this.#oldTurnSpeed = entity.turnSpeed;
      entity.turnSpeed = this.turnSpeed;
    }
  }
  end(entity) {
    if (this.changesBack) {
      //Change it back
      if (this.speed >= 0) {
        entity.speed = this.#oldSpeed;
      }
      if (this.turnSpeed >= 0) {
        entity.turnSpeed = this.#oldTurnSpeed;
      }
    }
  }
}
