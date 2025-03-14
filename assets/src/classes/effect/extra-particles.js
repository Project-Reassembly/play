class ExecutorParticle {
  /**
   *
   * @param {ImageParticle|ShapeParticle|TextParticle|WaveParticle} main
   * @param {(x:number, y:number)=>void} creator
   * @param {int} creationInterval
   */
  constructor(main, creator, creationInterval) {
    this.main = main;
    this.creator = creator;
    this.creationInterval = creationInterval;
  }
  /**@type {ImageParticle|ShapeParticle|TextParticle|WaveParticle} */
  main = null;
  /**@type {(x:number, y:number)=>void}*/
  creator = null;
  remove = false;
  creationInterval = 0;
  _counter = 0;
  draw() {
    this.main.draw();
  }
  step(dt) {
    this.main.step(dt);
    this._counter--;
    if (this._counter <= 0) {
      this._counter = this.creationInterval;
      this.creator(this.main.x, this.main.y, this.main.speed);
    }
    if (this.main.remove) this.remove = true;
  }
}

class LiquidParticle extends ShapeParticle {
  step(dt) {
    super.step(dt);
    let blockOn = world.getBlock(
      Math.floor(this.x / Block.size),
      Math.floor(this.y / Block.size),
      "tiles"
    );
    if (!blockOn) return;
    if (blockOn.registryName.includes("water")) {
      this.sizeXTo += 0.8;
      this.sizeYTo += 0.8;
      this.colourTo[3] ??= 255
      this.colourFrom[3] ??= 255
      this.colourTo[3] -= 0.6;
      this.colourFrom[3] -= 0.6;
      if (this.colourTo[3] < 0.1) {
        this.remove = true;
      }
    }
  }
}

class Pseudo3DParticle{
  
}