console.log("[World Gen] [Setup] Worker created");
import { construct } from "../core/constructor.js";
console.log("[World Gen] [Setup] Imported constructor");
import { Registries } from "../core/registry.js";
import { Integrate } from "../lib/integrate.js";

onmessage = (ev) => {
  console.log(
    "[World Gen] Recieved '" + (ev.data.type ?? ev.data) + "' message"
  );
  if (ev.data.type === "generate") {
    const data = ev.data;

    const generators = new Integrate.Registry();
    Registries.worldgen.forEach((item, name) =>
      generators.add(name, construct(item, "generator"))
    );
    
    console.log(
      "[World Gen] Constructed " + generators.size + " generators"
    );


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
