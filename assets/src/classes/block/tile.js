class Tile extends Block {
  speedMultiplier = 1;
  appliedStatus = "none";
  appliedStatusDuration = 0;
  damage = 0;
  damageType = "normal";
  buildable = true;
  tick() {}
  init() {
    PhysicalObject.prototype.init.call(this);
    delete this.x;
    delete this.y;
  }
  draw() {
    drawImg(
      this.image,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
  }
  /**
   * Called whenever an entity walks on this tile.
   * @param {Entity} entity Entity that walked on this block.
   */
  entityWalksOn(entity) {
    entity.applyStatus(
      Registry.statuses.get(this.appliedStatus),
      this.appliedStatusDuration
    );
    entity.damage(this.damageType, this.damage);
  }
}

class Ore extends Tile {
  stages = [""];
  stageChance = 0.01;
  _stage = 0;
  tick() {
    if (this._stage < this.stages.length - 1)
      if (rnd(0, 100) < this.stageChance) {
        this._stage++;
      }
  }
  draw() {
    drawImg(
      this.image + this.stages[this._stage],
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
  }
}
