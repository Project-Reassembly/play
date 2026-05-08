import { Decoration } from "../core/cmft.js";
import { col } from "../core/color.js";
import { Registries } from "../core/registry.js";

Registries.corps.add("scrap", {
  name: "United Recyclers of Our World",
  color: col.white,
  icon: "icon.scrap",
  description:
    "Stranded on this planet long ago, their original technology was lost to time.\nNow they defend it with makeshift weapons and tools, along with whatever remains of what existed long ago.",
  player: "scrap-player",
  preview: true,
});

Registries.corps.add("iti", {
  name: "InfiniTech Industries",
  color: Decoration.colours.i,
  icon: "icon.iti",
  description:
    "Large tech company, based on Earth.\n\nDelivers quality products at a fairly affordable price, although some consider them a luxury company.\n\nRun by humans, staffed by constructs.",
  player: "iti-player",
});

Registries.corps.add("ccc", {
  name: "Chronological Creations Corporation",
  color: Decoration.colours.h,
  icon: "icon.ccc",
  description:
    "A now-independent branch of InfiniTech Industries, focused on space-time manipulation.\nThe self-employed time police.",
  preview: true,
});

Registries.corps.add("peti", {
  name: "Prototypical and Experimental Technologies Institution",
  color: Decoration.colours.p,
  icon: "icon.peti",
  description:
    "Small yet growing organisation manufacturing new types of technology.\nThey don't bother testing properly, so their tech may be unstable.\n\nThey have mostly military contracts, although criminal organisations have taken an interest in their tech too.",
  namescale: 0.75,
  player: "peti-player",
  preview: true,
});
