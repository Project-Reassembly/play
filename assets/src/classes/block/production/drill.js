class Drill extends TileProducer {
  topImg = "error";
  baseImg = "error";
  spinnerImg = "error";
  spinSpeed = 2;
  draw() {
    drawImg(
      this.baseImg,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
    rotatedImg(
      this.spinnerImg,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size,
      (this._progress / this.duration) * this.spinSpeed * TWO_PI
    );
    drawImg(
      this.topImg,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
  }
}
