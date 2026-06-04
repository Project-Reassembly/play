import { constructFromRegistry } from "../../../core/constructor.js";
import { TypeRegistries } from "../../../core/registry.js";
import Integrate from "../../../lib/integrate.js";
import { World } from "../world.js";
import { WorldEventAction } from "./event-action.js";
import { WorldEventCondition } from "./event-condition.js";

export class WorldEvent extends Integrate.RegisteredItem {
  name = "";
  get disabled() {
    return this.#happened;
  }
  #happened = false;
  /** @type {Integrate.Unconstructed<WorldEventCondition|WorldEventAction>[]} */
  components = [];
  /** @type {WorldEventCondition[]} */
  #conditions = [];
  /**@type {WorldEventAction[]} */
  #actions = [];
  init() {
    const comps = [...this.components].map((x) =>
      constructFromRegistry(x, TypeRegistries.worldevent, "condition.never"),
    );
    this.#conditions = comps.filter((c) => c instanceof WorldEventCondition);
    this.#actions = comps.filter((c) => c instanceof WorldEventAction);
    this.components.splice(0);
    delete this.components;
  }
  /** @param {World} world */
  tick(world) {
    if (!this.#happened && this.#conditions.every((x) => x.isMet(world))) {
      console.log(`Firing event ${this.name}`);
      this.#happened = true;
      this.#actions.forEach((x) => x.execute(world));
    }
  }
  disable() {
    this.#happened = true;
  }
  reset() {
    this.#happened = false;
  }
}
