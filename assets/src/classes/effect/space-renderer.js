import { colinterp, rnd } from "../../core/number.js";
import { ui } from "../../core/ui.js";
import { totalSize } from "../../scaling.js";
import { Particle } from "./particle.js";

let minRad = rnd(0.1, 1.3);
let maxRad = rnd(1, 9);
let density = rnd(0.2, 1) * 1.2;
// faster particle class for dots in space
class PerformantSpaceParticle {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  constructor() {
    this.x = rnd(0, totalSize);
    this.y = rnd(0, totalSize);
    this.r = rnd(minRad, maxRad);
    this.d = rnd(0, Math.PI);
    this.xSpeed = rnd(-0.2, 0.2);
    this.ySpeed = rnd(-0.2, 0.2);
  }
  draw(g) {
    if (!Space.config.drawStars) return;
    g.push();
    g.noStroke();
    g.fill(255);
    g.translate(this.x, this.y);
    g.rotate(this.d);
    g.square(0, 0, this.r * 1.2);
    g.pop();
  }
  move() {
    if (this.x < 0 || this.x > totalSize) this.xSpeed *= -1;
    if (this.y < 0 || this.y > totalSize) this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }
}
class SpaceBGParticle extends PerformantSpaceParticle {
  constructor() {
    super();
    this.r *= 50;
  }
  draw(g) {
    if (!Space.config.drawClouds) return;
    g.noStroke();
    g.fill(50, 0, 127, 30);
    g.circle(this.x, this.y, this.r);
  }
}

// existing particles
/**@type {PerformantSpaceParticle[]} */
let particles = [];

function setup() {
  for (let i = 0; i < totalSize / density / 3; i++) {
    particles.push(new SpaceBGParticle());
  }
  for (let i = 0; i < totalSize / density; i++) {
    particles.push(new PerformantSpaceParticle());
  }
}

function draw(g) {
  g.fill(
    colinterp(
      [
        [25, 0, 64],
        [0, 0, 0],
      ],
      0.5 + Math.sin(frameCount / 60) / 2
    )
  );
  g.rect(0, 0, totalSize, totalSize);
  for (let i = 0; i < particles.length; i++) {
    if (isInRenderDistance(particles[i], 1, 0, 0, 0, ui.camera.zoom))
      particles[i].draw(g);
    particles[i].move();
  }
}
function isInRenderDistance(thing, zoom = 1) {
  if (thing.x < ui.camera.x - width / zoom / 2) return false;
  if (thing.x > ui.camera.x + width / zoom / 2) return false;
  if (thing.y < ui.camera.y - height / zoom / 2) return false;
  if (thing.y > ui.camera.y + height / zoom / 2) return false;
  return true;
}
export const Space = {
  config: {
    drawStars: true,
    drawClouds: true,
    allowColouredParticles: false,
  },
  setup: setup,
  graphics: null,
  g2: null,
  ctx: null,
  /**
   *
   * @param {Particle[]} particles
   */
  draw(particles) {
    let spaceps = particles.filter((x) => x.isSpace);
    if (spaceps.length === 0) return;
    spaceps = spaceps.filter((x) =>
      isInRenderDistance(x, 1, 0, 0, 0, ui.camera.zoom)
    );
    this.resetCR();
    this.graphics.fill(0);
    /** @type {OffscreenCanvasRenderingContext2D} */
    //draw base layer
    this.ctx.globalCompositeOperation = "source-over";
    for (let particle of spaceps) {
      particle.draw(this.graphics);
    }
    //put layer on it
    this.ctx.globalCompositeOperation = "source-atop";
    draw(this.graphics);
    //draw colour layer
    if (this.config.allowColouredParticles)
      for (let particle of spaceps) {
        if (particle.colour.every((x) => x === 255)) particle.draw(this.g2);
      }
    //draw space
    image(this.graphics, totalSize / 2, totalSize / 2, totalSize, totalSize);
    //colour the space
    if (this.config.allowColouredParticles) {
      ctx.globalCompositeOperation = "multiply";
      image(this.g2, totalSize / 2, totalSize / 2, totalSize, totalSize);
      ctx.globalCompositeOperation = "source-over";
    }
  },
  resetCR() {
    if (!this.graphics || !this.g2) {
      this.graphics = createGraphics(totalSize, totalSize);
      this.g2 = createGraphics(totalSize, totalSize);
      this.ctx = this.graphics.canvas.getContext("2d");
    }
    this.graphics.clear();
    if (this.config.allowColouredParticles) this.g2.clear();
    //Space.clipRegion.rect(0, 0, 1, 1);
  },
};
