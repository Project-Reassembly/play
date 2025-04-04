function addLightingCircles(layer, size = 1, col) {
  layer.push();
  layer.translate(width / 2, height / 2);
  //Particles (oh no)
  world.particles.forEach((particle) => {
    if (particle && !particle.dead && particle.light > 0) {
      if (particle instanceof ShapeParticle) {
        rotatedShapeExt(
          layer,
          particle.shape,
          particle.uiX,
          particle.uiY,
          (particle.sizeY / 10) * particle.light * size,
          (particle.sizeX / 10) * particle.light * size,
          particle.direction,
          false
        );
      } else if (particle instanceof WaveParticle) {
        layer.noFill();
        layer.stroke(col);
        layer.strokeWeight(((particle.stroke * particle.light) / 10) * size);
        layer.circle(particle.uiX, particle.uiY, particle.size);
        layer.noStroke();
        layer.fill(col);
      } else
        layer.circle(
          particle.uiX,
          particle.uiY,
          particle.light * size * particle.calcLifeFract() ** 0.5
        );
    }
  });
  //Bullets
  world.bullets.forEach((bullet) => {
    if (bullet && !bullet.dead && bullet.light > 0) {
      layer.circle(bullet.uiX, bullet.uiY, bullet.light * size);
    }
  });
  //Entities
  world.entities.forEach((entity) => {
    if (entity && !entity.dead && entity.light > 0) {
      layer.circle(entity.uiX, entity.uiY, entity.light * size);
    }
  });
  //Blocks
  for (let chunk of world.toRender) {
    iterate2DArray(chunk.blocks, (block) => {
      if (block && block.light > 0) {
        layer.circle(
          block.uiX + Block.size / 2,
          block.uiY + Block.size / 2,
          block.light * size
        );
      }
    });
  }
  layer.pop();
}
function createLightingLayer(
  layer,
  bgColour = [0, 230],
  lightColour = [255, 100],
  lightScale = 1
) {
  layer.fill(bgColour);
  layer.noStroke();
  layer.rect(0, 0, width, height);
  layer.blendMode(REMOVE);
  layer.fill(lightColour);
  addLightingCircles(layer, lightScale * 1.5 * ui.camera.zoom, lightColour);
  addLightingCircles(layer, lightScale * ui.camera.zoom, lightColour);
  addLightingCircles(layer, lightScale * 0.67 * ui.camera.zoom, lightColour);
  layer.rectMode(CORNER);
}
function lighting(
  bgColour = [0, 230],
  lightColour = [255, 100],
  lightScale = 1
) {
  push();
  let layer = createGraphics(width, height);
  createLightingLayer(layer, bgColour, lightColour, lightScale);
  imageMode(CORNER);
  image(layer, -width / 2, -height / 2, width, height);
  pop();
}
