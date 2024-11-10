class World {
  particles = [];
  /** @type {Array<Entity>} */
  entities = [];
  /** @type {Array<Bullet>} */
  bullets = [];
  name = "World";
  constructor(name = "World") {
    this.name = name;
  }
  tickAll() {
    this.#actualTick();
    this.#removeDead();
  }
  #actualTick() {
    //Tick *everything*
    for (let bullet of this.bullets) {
      bullet.step(1);
    }
    for (let particle of this.particles) {
      particle.step(1);
    }
    for (let entity of this.entities) {
      entity.tick();
    }
  }
  #removeDead() {
    //THEN remove dead stuff
    let len = this.bullets.length;
    for (let b = 0; b < len; b++) {
      if (this.bullets[b]?.remove) {
        let bullet = this.bullets[b]
        for (let instance of bullet.damage) {
          if (instance.area)
            //If it explodes
            splashDamageInstance(
              bullet.x,
              bullet.y,
              instance.amount,
              instance.type,
              instance.area,
              bullet.entity,
              instance.visual, //        \
              instance.sparkColour, //   |
              instance.sparkColourTo, // |
              instance.smokeColour, //   |- These are optional, but can be set per instance
              instance.smokeColourTo, // |
              instance.waveColour, //     /
              bullet.status,
              bullet.statusDuration
            );
          if(instance.blinds){
            blindingFlash(
              bullet.x,
              bullet.y,
              instance.blindOpacity,
              instance.blindDuration,
              instance.glareSize
            )
          }
        }
        bullet.frag();
        //Delete the bullet
        this.bullets.splice(b, 1);
      }
    }
    len = this.particles.length;
    for (let p = 0; p < len; p++) {
      if (this.particles[p]?.remove) {
        this.particles.splice(p, 1);
      }
    }
    len = this.entities.length;
    for (let e = 0; e < len; e++) {
      if (this.entities[e]?.dead) {
        this.entities.splice(e, 1);
      }
    }
    //No search algorithms => faster
  }
  drawAll() {
    for (let entity of this.entities) {
      if(!World.isInRenderDistance(entity)) continue;
      entity.draw();
    }
    for (let bullet of this.bullets) {
      if(!World.isInRenderDistance(bullet)) continue;
      bullet.draw();
    }
    for (let particle of this.particles) {
      if(!World.isInRenderDistance(particle)) continue;
      particle.draw();
    }
  }
  static isInRenderDistance(thing){
    if(thing.x < ui.camera.x - width/2) return false;
    if(thing.x > ui.camera.x + width/2) return false;
    if(thing.y < ui.camera.y - height/2) return false;
    if(thing.y > ui.camera.y + height/2) return false;
    return true;
  }
}
