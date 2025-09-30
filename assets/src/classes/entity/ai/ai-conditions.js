import { construct } from "../../../core/constructor.js";
import { ui } from "../../../core/ui.js";
import { Entity } from "../entity.js";
import { AI } from "./ai.js";

/**Always returns true or false. Don't use directly, instead use `"always"` or `"never"`.*/
export class AICondition {
  /** @readonly */
  static ALWAYS = new this(true);
  /**@readonly */
  static NEVER = new this(false);
  #override = false;
  invert = false;
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  canDoIt(ai, entity) {
    return this.eval(ai, entity) !== this.invert;
  }
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return this.#override;
  }
  constructor(override) {
    if (override !== undefined) this.#override = !!override;
  }
}
/**True if the curent entity has a set target. */
export class HasTargetCondition extends AICondition {
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return entity.target !== null;
  }
}
/**True if the curent *AI* has a set target. Ignores the entity's target. This should be preferred over HasTargetCondition, as any AI tasks will store their results within themselves.*/
export class StoredTargetCondition extends AICondition {
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return ai.target !== null;
  }
}
/**True if the entity is within a distance of the AI's target. */
export class NearTargetCondition extends AICondition {
  distance = 30;
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return ai.target && entity.distanceTo(ai.target) <= this.distance;
  }
}
/**True if a button on the mouse is pressed. */
export class MouseDownCondition extends AICondition {
  /**@type {"left" | "right" | "middle" | "unknown"} */
  button = "left";
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return mouseIsPressed && ui.mouseButton === button;
  }
}
/**True if a button on the keyboard is pressed. The button is a number - a keyCode. Use this: https://www.toptal.com/developers/keycode. */
export class KeyDownCondition extends AICondition {
  button = 32;
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return keyIsDown(button);
  }
}

/**
 * Part of the flexible system for AI data storage.
 * Returns true if a comparison between a numeric data value and static input does.
 */
export class DataComparisonCondition extends AICondition {
  name = "data";
  /** @type {"equal" | "less" | "greater"} */
  comparator = "equal";
  value = 0;
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    if (this.comparator === "equal") return ai.get(this.name) === this.value;
    if (this.comparator === "less") return ai.get(this.name) < this.value;
    if (this.comparator === "greater") return ai.get(this.name) > this.value;
    return false;
  }
}

/**
 * Returns true if all of its subconditions are met.
 */
export class CombinedCondition extends AICondition {
  /**@type {AICondition[]} */
  conditions = [];
  init() {
    this.conditions = this.conditions.map((c) =>
      construct(c, "aicon.constant")
    );
  }
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return this.conditions.every((cond) => cond.canDoIt(ai, entity));
  }
}
/**
 * Returns true if any of its subconditions are met.
 */
export class AlternativeCondition extends AICondition {
  /**@type {AICondition[]} */
  conditions = [];
  init() {
    this.conditions = this.conditions.map((c) =>
      construct(c, "aicon.constant")
    );
  }
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  eval(ai, entity) {
    return this.conditions.some((cond) => cond.canDoIt(ai, entity));
  }
}
