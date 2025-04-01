class Fire extends PhysicalObject {
  damage = 1;
  type = "fire";
  lifetime = 600;
  remove = false;
  effect = "fire";
  effectChance = 0.2;
  status = "burning";
  statusDuration = 120;
  team = "enemy";
  interval = 10;
  //overrides
  width = 30;
  height = 30;
  //
  _int = 0;
  tick() {
    if (tru(this.effectChance)) this.emit(this.effect);
    this._int--;
    if (this._int <= 0) {
      this._int = this.interval;
      let blocks = this.world.getAdjacent(
        Math.floor(this.x / Block.size),
        Math.floor(this.y / Block.size)
      );
      blocks.forEach((blk) => {
        if (blk && blk.team !== this.team && blk.collidesWith(this))
          blk.damage(this.type, this.damage);
      });
      for (let e of this.world.entities) {
        if (e.team !== this.team && e.collidesWith(this)) {
          e.damage(this.type, this.damage);
          e.applyStatus(this.status, this.statusDuration);
        }
      }
    }
    this.lifetime--;
    if (this.lifetime < 0) {
      this.remove = true;
    }
  }
  /**
   * Creates a fire.
   * @param {{world: World, x: number, y: number}} opts Options for the fire.
   * @returns {Fire}
   */
  static create(opts) {
    let fire = new this();
    Object.assign(fire, opts);
    opts.world.physobjs.push(fire);
    console.log(fire);
    return fire;
  }
}
