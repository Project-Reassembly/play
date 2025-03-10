class TextParticle extends ShapeParticle {
  constructor(
    x,
    y,
    direction,
    lifetime,
    speed,
    decel,
    text,
    colourFrom,
    colourTo,
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
      colourFrom,
      colourTo,
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
      //Interpolate size
      this.size =
        this.sizeFrom * this.calcLifeFract() +
        this.sizeTo * (1 - this.calcLifeFract());
      //Move
      this.moveTo(
        this.x + this.speed * p5.Vector.fromAngle(this.direction).x * dt,
        this.y + this.speed * p5.Vector.fromAngle(this.direction).y * dt
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
    fill(255);
    //Interpolate colour
    fill(...blendColours(this.colourFrom, this.colourTo, this.calcLifeFract()));
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
