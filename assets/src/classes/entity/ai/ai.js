import { construct } from "../../../core/constructor.js";
import { Entity } from "../entity.js";
import { AITask } from "./ai-tasks.js";

export class AI {
  /**@type {AITask[]} */
  tasks = [];
  /**Stores (temporary) data for things. */
  data = new Map();
  /** @type {Entity?} */
  target = null;
  #index = 0;
  init() {
    this.tasks = this.tasks.map((x) => construct(x, "ai.nothing"));
  }
  /**
   * Clears all data from the current AI state. Also clears the target AND RESETS THE TASK COUNTER.
   */
  lobotomise() {
    this.data = new Map();
    this.target = null;
    this.#index = 0;
  }
  tick(entity) {
    let task = this.tasks[this.#index];
    if (!task) {
      this.#index = 0;
      return;
    }
    task.tick(this, entity);
  }
  get(name) {
    return this.data.has(name) ? this.data.get(name) : null;
  }
  set(name, value) {
    this.data.set(name, value);
  }
}
