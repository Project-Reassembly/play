console.log("[World Gen] [Setup] Worker created");

importScripts("../lib/q5-noise-function.js");

console.log("[World Gen] [Setup] Imported q5's noise function");
importScripts(
  "../core/number.js",
  "../core/constructor.js",
  "../core/registry.js",
  "../core/registered-item.js"
);
console.log("[World Gen] [Setup] Imported P:R Core");
importScripts(
  "../classes/physical.js",
  "../classes/timer.js",
  "../classes/entity/entity.js",
  "../classes/entity/component.js",
  "../classes/entity/inventory-entity.js",
  "../classes/entity/player.js",

  "../classes/projectile/bullet.js",
  "../classes/projectile/laser-bullet.js",
  "../classes/projectile/continuous-laser-bullet.js",
  "../classes/projectile/missile.js",
  "../classes/projectile/point-bullet.js",
  "../classes/projectile/critical.js",

  "../classes/item/item.js",
  "../classes/item/item-stack.js",
  "../classes/item/placeable.js",
  "../classes/item/equippable.js",
  "../classes/item/weapon.js",

  "../classes/item/dropped-itemstack.js",

  "../classes/world/world.js",
  "../classes/world/chunk.js",
  "../classes/world/generator.js",

  "../classes/block/block.js",
  "../classes/block/tile.js",
  "../classes/block/container.js",
  "../classes/block/production/crafter.js",
  "../classes/block/production/tile-producer.js",
  "../classes/block/production/drill.js",
  "../classes/block/conveyor.js"
);
console.log("[World Gen] [Setup] Imported P:R Classes");
importScripts(
  "../registries/type.js",
  "../registries/block.js",
  "../registries/worldgen.js"
);
console.log("[World Gen] [Setup] Imported P:R Registry");
console.log(
  "[World Gen] [Setup] Imported " + Registry.worldgen.size + " generators"
);

const generators = new Registry();
Registry.worldgen.forEach((name, gen) =>
  generators.add(name, construct(gen, "generator"))
);

console.log(
  "[World Gen] [Setup] Constructed " + generators.size + " generators"
);

onmessage = (ev) => {
  console.log(
    "[World Gen] Recieved '" + (ev.data.type ?? ev.data) + "' message"
  );
  if (ev.data.type === "generate") {
    const data = ev.data;
    //generateTiles(data.noiseScale, data.noiseLevel);
    let stage = 1;
    generators.forEach((name, gen) => {
      postMessage({
        type: "progress-stage",
        progress: stage / generators.size,
      });
      postMessage({ type: "progress", progress: 0 });
      console.log("[World Gen] Stage '" + name + "'");
      postMessage({ type: "genstage", stage: gen.stageTitle });
      gen.generate(data.seed);
      stage++;
    });

    postMessage("finish");
  }
};
