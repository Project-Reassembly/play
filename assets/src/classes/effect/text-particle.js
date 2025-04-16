class TextParticle extends ShapeParticle {
  constructor(
    x,
    y,
    direction,
    lifetime,
    speed,
    decel,
    text,
    colours,
    sizeFrom,
    sizeTo,
    rotateSpeed,
    useOCR = false
  ) {
    super(
      x,
      y,
      direction,
      lifetime,
      speed,
      decel,
      "rect",
      colours,
      sizeFrom,
      sizeTo,
      sizeFrom,
      sizeTo,
      rotateSpeed
    );
    this.text = text;
    this.useOCR = useOCR;
    this.size = sizeFrom;
    this.sizeFrom = sizeFrom;
    this.sizeTo = sizeTo;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      let lf = this.calcLifeFract();
      //Interpolate size & colour
      this.size = this.sizeFrom * lf + this.sizeTo * (1 - lf);
      this.colour = colinterp(this.colours, 1 - lf);
      //Move
      this.moveToVct(
        new Vector(this.x, this.y).add(
          Vector.fromAngleRad(this.direction).scale(this.speed * dt)
        )
      );
      //Decelerate
      if (this.speed >= this.decel) {
        this.speed -= this.decel * dt;
      } else {
        this.speed = 0;
      }
      if (this.rotateSpeed) {
        this._rotOffset += this.rotateSpeed * dt;
      }
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  draw() {
    push();
    //centre the text
    textAlign(CENTER, CENTER);
    noStroke();
    //Interpolate colour
    fill(this.colour);
    //turn particle
    translate(this.x, this.y);
    rotate(this.direction + this._rotOffset);
    //Set size
    textSize(this.size);
    //Set font
    textFont(this.useOCR ? fonts.ocr : fonts.darktech);
    //Draw the particle's text
    text(this.text, 0, 0);
    pop();
  }
}
