class Drill extends TileProducer {
  topImg = "error";
  baseImg = "error";
  spinnerImg = "error";
  spinSpeed = 2;
  tick() {
    if (this._blockOn !== "null")
      this._speed = Registry.blocks.get(this._blockOn).drillSpeed ?? 1;
    else this._speed = 1;
    super.tick();
  }
  draw() {
    drawImg(
      this.baseImg,
      this.x,
      this.y,
      this.tileSize * Block.size,
      this.tileSize * Block.size
    );
    rotatedImg(
      this.spinnerImg,
      this.x,
      this.y,
      this.tileSize * Block.size,
      this.tileSize * Block.size,
      (this._progress / this.duration) * this.spinSpeed * TWO_PI
    );
    drawImg(
      this.topImg,
      this.x,
      this.y,
      this.tileSize * Block.size,
      this.tileSize * Block.size
    );
  }
}
