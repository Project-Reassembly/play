console.log("[World Gen] [Setup] Worker created");
import {
  BlockGenerator,
  GenerationOptions,
  Generator,
  OreGenerationOptions,
  OreGenerator,
  TileGenerationOptions,
  TileGenerator,
} from "../classes/world/generator.js";
import {
  construct,
  constructFromRegistry,
  constructFromType,
} from "../core/constructor.js";
console.log("[World Gen] [Setup] Imported constructor");
import { Registries } from "../core/registry.js";
import { Integrate } from "../lib/integrate.js";
import {} from "../registries/worldgen.js";

let wtype = new Integrate.Registry();

wtype.add("generator", Generator);
wtype.add("tile-generator", TileGenerator);
wtype.add("ore-generator", OreGenerator);
wtype.add("block-generator", BlockGenerator);


onmessage = (ev) => {
  console.log(
    "[World Gen] Recieved '" + (ev.data.type ?? ev.data) + "' message"
  );
  if (ev.data.type === "generate") {
    const data = ev.data;

    const generators = new Integrate.Registry();
    Registries.worldgen.forEach((name, item) => {
      item.type ??= "generator";
      generators.add(name, constructFromRegistry(item, wtype));
    });

    console.log("[World Gen] Constructed " + generators.size + " generators");

    //generateTiles(data.noiseScale, data.noiseLevel);
    let stage = 1;
    generators.forEach((name, gen) => {
      postMessage({
        type: "progress-stage",
        progress: stage / generators.size,
      });
      postMessage({ type: "progress", progress: 0 });
      console.log(
        "[World Gen] Stage '" + name + "' (" + gen.constructor.name + ")"
      );
      postMessage({ type: "genstage", stage: gen.stageTitle });
      console.log("[World Gen] Generating with seed "+data.seed)
      gen.generate(data.seed);
      stage++;
    });

    postMessage("finish");
  }
};
