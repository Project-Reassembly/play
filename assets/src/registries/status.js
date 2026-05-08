import { PreloadRegistries } from "../core/registry.js";
PreloadRegistries.stati.add("burning", {
  name: "Burning",
  damage: 5,
  interval: 30,
  damageType: "fire",
  effect: "burning",
  effectChance: 0.5,
});
PreloadRegistries.stati.add("plasma-burn", {
  name: "Plasma Burn",
  damage: 6,
  interval: 25,
  damageType: "fire",
  effect: "plasma-burn",
  effectChance: 0.5,
  attributeModifiers: { resistances: 0.8 },
});
PreloadRegistries.stati.add("plasma-burn-boosted", {
  name: "Plasma Burn II",
  damage: 9,
  interval: 25,
  damageType: "fire",
  effect: "plasma-burn-boosted",
  effectChance: 0.5,
  attributeModifiers: { resistances: 0.6 },
});
PreloadRegistries.stati.add("destabilised", {
  name: "Destabilised",
  damage: 100,
  interval: 60,
  damageType: "destabilisation",
  effect: "destabilised",
  effectChance: 0.5,
});

PreloadRegistries.stati.add("death-burn", {
  name: "Death Burn",
  damage: 9,
  interval: 25,
  damageType: "fire",
  effect: "death-burn",
  effectChance: 0.5,
  attributeModifiers: { resistances: 0, speed: 0.5 },
});
PreloadRegistries.stati.add("nuclear-fire", {
  name: "Nuclear Fire",
  damage: 45,
  interval: 5,
  damageType: "fire",
  effect: "burning",
});
