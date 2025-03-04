class TileProducer extends Container {
  results = {};
  amount = 0;
  duration = 0;

  smoke = {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    colourFrom: [50, 50, 50, 100],
    colourTo: [100, 100, 100, 0],
    size: 20,
    cone: 10,
    amount: 1,
    chance: 0.1,
  };

  _speed = 1;
  _progress = 0;
  _blockOn = "null";

  tick() {
    let floor = this.chunk.getBlock(
      this.blockX,
      this.blockY,
      "floor"
    )?.registryName;
    let tile = this.chunk.getBlock(
      this.blockX,
      this.blockY,
      "tiles"
    )?.registryName;
    this._blockOn = !floor || floor === "null" ? tile : floor;
    if (!this._blockOn) {
      Log.send("Drill is on air!");
      this.chunk.removeBlock(this.blockX, this.blockY, "blocks");
    }
    if (this._blockOn in this.results) {
      this.tickProduction(this.results[this._blockOn]);
    }
  }
  tickProduction(result) {
    //If a recipe exists, and will fit
    if (this.inventory.canAddItem(result, this.amount))
      if (this._progress > this.duration) {
        if (this.onFinish(result)) this._progress = 0;
      } else {
        this._progress += this._speed;
        this.createTickEffect();
      }
  }
  onFinish(result) {
    this.inventory.addItem(result, this.amount);
    return true;
  }
  createTickEffect() {
    let particle = () =>
      new ShapeParticle(
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        -HALF_PI +
          radians(rnd(-(this.smoke.cone ?? 10), this.smoke.cone ?? 10)),
        this.smoke.lifetime ?? 60,
        this.smoke.speed ?? 1,
        this.smoke.decel ?? 0.015,
        "circle",
        this.smoke.colourFrom ?? [50, 50, 50, 100],
        this.smoke.colourTo ?? [100, 100, 100, 0],
        this.smoke.size ?? 20,
        (this.smoke.size ?? 20) * 1.5,
        this.smoke.size ?? 20,
        (this.smoke.size ?? 20) * 1.5,
        0
      );
    if (Math.random() < this.smoke.chance ?? 0.5)
      for (let i = 0; i < this.smoke.amount ?? 3; i++)
        this.chunk.world.particles.push(particle());
  }
  stringifyRecipe() {
    return (
      (this.results[this._blockOn]
        ? "--> " +
          (Registry.items.has(this.results[this._blockOn])
            ? Registry.items.get(this.results[this._blockOn])
            : { name: "Unknown" }
          )?.name +
          " x" +
          this.amount
        : "No recipe") +
      "\n" +
      ""
        .padEnd((this._progress / this.duration) * 20, "■")
        .padEnd(20, "□")
        .substring(0, 20) +
      " \nSpeed: " +
      roundNum((60 / this.duration) * this._speed, 2) +
      "/s"
    );
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour);
    drawMultilineText(
      x,
      y,
      this.stringifyRecipe(),
      this.title,
      Item.getColourFromRarity(0, "light"),
      outlineColour,
      backgroundColour
    );
  }
}
