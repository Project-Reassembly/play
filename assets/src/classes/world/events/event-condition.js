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
  seconds = 0;
  minutes = 0;
  hours = 0;
  init() {
    if (this.seconds) this.time += (+this.seconds || 0) * 60;
    if (this.minutes) this.time += (+this.minutes || 0) * 3600;
    if (this.hours) this.time += (+this.hours || 0) * 216000;
    delete this.seconds;
    delete this.minutes;
    delete this.hours;
  }
  /** @param {World} world */
  isMet(world) {
    return world.age >= this.time;
  }
}

export class OtherEventHappenedCondition extends WorldEventCondition {
  event = "";
  /** @param {World} world */
  isMet(world) {
    return Object.hasOwn(world.events, this.event) && world.events[this.event]?.disabled;
  }
}
