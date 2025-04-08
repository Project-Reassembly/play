class VirtualBullet extends Bullet {
  team = "neutral";
  _ent = null;
  lifetime = 1;
  constructor() {
    super();
    delete this.entity;
  }
  draw() {
    PhysicalObject.prototype.draw.call(this);
  }
  step(dt) {
    if (!this.remove) this.intervalTick();
    if (this.lifetime <= 0) {
      this.remove = true;
    } else {
      this.lifetime -= dt;
    }
  }
  get entity() {
    return this._ent ?? { team: this.team };
  }
  set entity(_) {
    this._ent = _;
  }
  collidesWith(e) {
    return (
      this.collides &&
      !e.dead &&
      ((this.x - (e instanceof Block ? e.x + Block.size / 2 : e.x)) ** 2 +
        (this.y - (e instanceof Block ? e.y + Block.size / 2 : e.y)) ** 2) **
        0.5 <=
        this.hitSize / 2 + e.size
    );
  }
}
