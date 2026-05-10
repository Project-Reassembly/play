console.log("[World Gen] [Setup] Worker created");
const { BlockGenerator, Generator, OreGenerator, TileGenerator } =
  await import("../classes/world/generator.js");
const { constructFromRegistry } = await import("../core/constructor.js");
const { Registries } = await import("../core/registry.js");
const Integrate = (await import("../lib/integrate.js")).default;
const {} = await import("../registries/worldgen.js");
console.log("[World Gen] [Setup] Imported constructor");

onmessage = (ev) => {
  console.log(`[World Gen] Recieved '${ev.data.type ?? ev.data}' message`);
  if (ev.data.type === "generate") {
    const data = ev.data;

    const generators = new Integrate.Registry();
    Registries.worldgen.forEach((item, name) => {
      item.type ??= "generator";
      generators.add(name, constructFromRegistry(item, wtype));
    });

    console.log(`[World Gen] Constructed ${generators.size} generators`);

    //generateTiles(data.noiseScale, data.noiseLevel);
    let stage = 1;
    generators.forEach((gen, name) => {
      postMessage({ type: "progress-stage", progress: stage / generators.size });
      postMessage({ type: "progress", progress: 0 });
      console.log(`[World Gen] Stage '${name}' (${gen.constructor.name})`);
      postMessage({ type: "genstage", stage: gen.stageTitle });
      console.log("[World Gen] Generating with seed " + data.seed);
      gen.generate(data.seed);
      stage++;
    });

    postMessage("finish");
  }
};

addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  throw event.reason;
});

let wtype = new Integrate.TypeRegistry();

wtype.add("generator", Generator);
wtype.add("tile-generator", TileGenerator);
wtype.add("ore-generator", OreGenerator);
wtype.add("block-generator", BlockGenerator);
