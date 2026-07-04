import { Registries } from "../core/registry.js";

// TODO: register these bullets

Registries.small.punch_types.add("punch", {
  name: "Regular Punch",
  description:
    "Hands-on demonstration of Newton's Laws of Motion.\nNot the most effective tool for destruction, though.",
  bullet: "punch",
});

Registries.small.punch_types.add("big-punch", {
  name: "Super Punch",
  description:
    "A bigger punch which deals extra damage in a large area around the point of impact.",
  bullet: "big-punch",
});

Registries.small.punch_types.add("blast-punch", {
  name: "Blast Punch",
  description: "A big explosive punch with fire and frags.",
  bullet: "blast-punch",
});
