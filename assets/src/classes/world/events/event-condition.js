import Integrate from "../../../lib/integrate.js";
import { World } from "../world.js";

export class WorldEventCondition extends Integrate.RegisteredItem {
  /** @param {World} world */
  isMet(world) {
    return false;
  }
}

export class TimedCondition extends WorldEventCondition {
  time = 18000;
  /** @param {World} world */
  isMet(world) {
    return world.age >= this.time;
  }
}

export class OtherEventHappenedCondition extends WorldEventCondition {
  event = "";
  /** @param {World} world */
  isMet(world) {
    return this.event in world.events && world.events[this.event]?.disabled;
  }
}
