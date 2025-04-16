class WaveParticle {
  constructor(
    x,
    y,
    lifetime,
    fromRadius,
    toRadius,
    colours,
    strokeFrom,
    strokeTo,
    light
  ) {
    this.x = x;
    this.y = y;
    this.lifetime = lifetime;
    this.fromRadius = fromRadius;
    this.toRadius = toRadius;
    this.radius = fromRadius;
    this.remove = false;
    this.colours = colours;
    this.colour = this.colours[0];
    this.maxLifetime = lifetime;
    this.strokeFrom = strokeFrom;
    this.stroke = strokeFrom;
    this.strokeTo = strokeTo;
    this.light = light ?? 0;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      let lf = this.calcLifeFract();
      this.radius = this.fromRadius * lf + this.toRadius * (1 - lf);
      this.stroke = this.strokeFrom * lf + this.strokeTo * (1 - lf);
      this.colour = colinterp(this.colours, 1-lf);
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  draw() {
    push();
    noFill();
    stroke(this.colour);
    strokeWeight(this.stroke);
    circle(this.x, this.y, this.radius * 2);
    pop();
  }
  get size() {
    return this.radius * 2;
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
}
