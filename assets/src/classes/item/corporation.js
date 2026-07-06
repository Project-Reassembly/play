import { col } from "../../core/color.js";
import { Registries } from "../../core/registry.js";

export class Corporation {
  name = "Example Co.";
  alias = "ECo";
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
    return Registries.corps.tryGet(name)?.icon ?? "";
  }
  static colorof(name) {
    return (Registries.corps.tryGet(name)?.color ?? 0) | 0;
  }
  static nameof(name) {
    return Registries.corps.tryGet(name)?.name ?? "";
  }
  static aliasof(name) {
    return Registries.corps.tryGet(name)?.alias ?? "";
  }
  static descof(name) {
    return Registries.corps.tryGet(name)?.description ?? "";
  }
}
