/**Extended Crafter which uses fuel items. */
class Smelter extends Crafter {
  sparks = {
    lifetime: 60,
    speed: 5,
    decel: 0.3,
    colourFrom: [255, 255, 100],
    colourTo: [255, 0, 0, 0],
    width: 10,
    height: 2.5,
    cone: 180,
    amount: 4,
    chance: 0.3,
  };
  fuelTypes = {};
  /**Does this Smelter stop using fuel when the recipe can't be processed? */
  fuelEfficient = false;
  _fuelLeft = 0;
  _fuelMax = 0;
  tickRecipe(recipe, time) {
    if (this._fuelLeft > 0) {
      if (super.tickRecipe(recipe, time) || !this.fuelEfficient) {
        this._fuelLeft--;
        this.createSmokeEffect();
      }
    } else {
      for (let item of Object.keys(this.fuelTypes)) {
        let time = this.fuelTypes[item];
        if (this.inventory.hasItem(item)) {
          this.setFuel(time);
          this.inventory.removeItem(item);
          break;
        }
      }
    }
  }
  createSmokeEffect() {
    super.createTickEffect();
  }
  createTickEffect() {
    let particle = () =>
      new ShapeParticle(
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        -HALF_PI +
          radians(rnd(-(this.sparks.cone ?? 180), this.sparks.cone ?? 180)),
        this.sparks.lifetime ?? 60,
        (this.sparks.speed ?? 5) * rnd(0.75, 1.3),
        this.sparks.decel ?? 0.3,
        "rect",
        this.sparks.colourFrom ?? [255, 255, 100],
        this.sparks.colourTo ?? [255, 0, 0, 0],
        this.sparks.height ?? 2.5,
        0,
        this.sparks.width ?? 10,
        this.sparks.width ?? 10,
        0
      );
    if (Math.random() < this.sparks.chance ?? 0.3)
      for (let i = 0; i < this.sparks.amount ?? 4; i++)
        this.chunk.world.particles.push(particle());
  }
  serialise() {
    let c = super.serialise();
    c.fuel = this._fuelLeft;
    return c;
  }
  setFuel(_) {
    this._fuelLeft = _;
    this._fuelMax = _;
  }
  stringifyRecipe(rec) {
    let r = super.stringifyRecipe(rec);
    r +=
      "\nFuel: " +
      ""
        .padEnd((this._fuelLeft / this._fuelMax) * 14, "■")
        .padEnd(14, "□")
        .substring(0, 14) +
      " ";
    return r;
  }
}
