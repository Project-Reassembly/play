console.log("[World Gen] [Setup] Worker created");

importScripts("../lib/q5-noise-function.js");

console.log("[World Gen] [Setup] Imported q5's noise function");
importScripts(
  "../core/number.js",
  "../core/constructor.js",
  "../core/registry.js"
);
console.log("[World Gen] [Setup] Imported P:R Core");
importScripts(
  "../classes/entity/entity.js",
  "../classes/entity/component.js",
  "../classes/entity/inventory-entity.js",

  "../classes/projectile/bullet.js",
  "../classes/projectile/laser-bullet.js",
  "../classes/projectile/missile.js",
  "../classes/projectile/point-bullet.js",
  "../classes/projectile/critical.js",

  "../classes/item/item.js",
  "../classes/item/item-stack.js",
  "../classes/item/placeable.js",
  "../classes/item/equippable.js",
  "../classes/item/weapon.js",

  "../classes/world/world.js",
  "../classes/world/chunk.js",

  "../classes/block/block.js",
  "../classes/block/tile.js",
  "../classes/block/container.js",
  "../classes/block/crafter/crafter.js"
);
console.log("[World Gen] [Setup] Imported P:R Classes");
importScripts("../registries/type.js", "../registries/block.js");
console.log("[World Gen] [Setup] Imported P:R Registry");

onmessage = (ev) => {
  console.log(
    "[World Gen] Recieved '" + (ev.data.type ?? ev.data) + "' message"
  );
  if (ev.data.type === "generate") {
    const data = ev.data;
    generateTiles(data.noiseScale, data.noiseLevel);
  }
};

/**
 * Creates the tiles for a world.
 * @param {number} size Size of the world in chunks.
 * @param {number} noiseScale Size of the noise function. Bigger makes more noisy.
 * @param {number} noiseLevel Vertical scale of the noise. Too low, and everything's water.
 */
function generateTiles(noiseScale = 2, noiseLevel = 255) {
  //Create grid
  let maxProgress = World.size ** 2;
  let progress = 0;
  let chunks = create2DArray(World.size);
  //Procedural ground gen
  noiseScale *= 0.001;
  for (let i = 0; i < World.size; i++) {
    //Each row
    let row = [];
    //Chunk coords
    for (let j = 0; j < World.size; j++) {
      let newChunk = [];
      for (let x = 0; x < Chunk.size; x++) {
        //Block coords
        for (let y = 0; y < Chunk.size; y++) {
          let nx = roundNum(
            noiseScale *
              ((World.size / 2 + i) * Chunk.size * Block.size +
                (x * Block.size + Block.size / 2)),
            2
          );
          let ny = roundNum(
            noiseScale *
              ((World.size / 2 + j) * Chunk.size * Block.size +
                (y * Block.size + Block.size / 2)),
            2
          );
          let c = noiseLevel * noise(nx, ny);
          if (c > 175) {
            newChunk.push({ block: "stone", x: x, y: y });
          } else if (c > 100) {
            newChunk.push({ block: "grass", x: x, y: y });
          } else if (c > 75) {
            newChunk.push({ block: "sand", x: x, y: y });
          } else if (c > 65) {
            newChunk.push({ block: "sand-water", x: x, y: y });
          } else if (c > 50) {
            newChunk.push({ block: "water", x: x, y: y });
          } else {
            newChunk.push({ block: "water", x: x, y: y });
          }
        }
      }
      //chunks[j][i] = newChunk;
      row.push({ chunk: newChunk, i: i, j: j });
      progress++;
      postMessage({ type: "progress", progress: progress / maxProgress });
    }
    postMessage({ type: "row", defs: row });
  }
  postMessage("finish");
  //postMessage({ type: "return", chunks: chunks });
  return chunks;
}
