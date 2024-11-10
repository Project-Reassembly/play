//Part of an entity.
class Component {
  shape = "circle";
  fill = "red";
  image = "error";
  width = 100;
  height = 100;
  rotation = 0;
  xOffset = 0;
  yOffset = 0;
  /** A list of tickables that listen to this component's tick() event. */
  tickListeners = []
  draw(x, y, direction) {
    if (this.image) {
      rotatedImg(
        this.image,
        x + this.xOffset,
        y + this.yOffset,
        this.width,
        this.height,
        radians(direction + this.rotation)
      );
    } else {
      //If no image, draw shape instead
      rotatedShape(
        this.shape,
        x + this.xOffset,
        y + this.yOffset,
        this.width,
        this.height,
        radians(direction + this.rotation)
      );
    }
  }
  tick(){
    this.tickListeners.forEach(element => {
      element.tick()
    });
  }
}
