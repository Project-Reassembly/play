import { col } from "../../core/color.js";
import { Registries } from "../../core/registry.js";

export class Corporation {
  name = "Example Co.";
  color = col.white;
  icon = "none";
  description = "A corporation.";
  playable = true;
  preview = false;
  namescale = 1;
  player = "player";
  init() {
    this.color = col.convert(this.color);
  }
  static get(name) {
    return Registries.corps.tryGet(name);
  }
  static iconof(name) {
    return this.get(name)?.icon ?? "";
  }
  static colorof(name) {
    return (this.get(name)?.color ?? 0) | 0;
  }
  static nameof(name) {
    return this.get(name)?.name ?? "";
  }
  static descriptionof(name) {
    return this.get(name)?.description ?? "";
  }
}
