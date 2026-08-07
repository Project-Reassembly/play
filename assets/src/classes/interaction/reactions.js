import { constructFromRegistry } from "../../core/constructor.js";
import { TypeRegistries } from "../../core/registry.js";
import Integrate from "../../lib/integrate.js";
import { action, DialogueAction } from "./actions.js";
import { DialogueManager } from "./dialogue.js";
import { InteractableEntity } from "./interactable-entity.js";
import { ReactionTrigger } from "./triggers.js";

export class Reaction {
  /** @type {ReactionTrigger[]} */
  triggers = [];
  /** @type {DialogueAction[]} */
  actions = [];
  /** @template {ReactionTrigger} T @param {DialogueManager} dialogue @param {new () => T} T @param {T["isTriggered"] extends (...args: infer A) => * ? A : never} data  */
  fire(dialogue, T, ...data) {
    for (const trigger of this.triggers) {
      // console.log(`[Stage 1] firing ${T.name}, time left: ${trigger.timeToNextFire}/${trigger.cooldown} - ${trigger.canFire ? "can fire" : "can't fire"}`);
      if (trigger instanceof T) {
        if (trigger.canFire && trigger.isTriggered(...data)) {
          trigger.trigger();
          for (const a of this.actions) a.do(dialogue);
          break;
        }
      }
    }
  }
  /** @param {[Integrate.Unconstructed<ReactionTrigger>[], Integrate.Unconstructed<DialogueAction>[]]} source  */
  static from(source) {
    const r = new this();

    const triggers = source[0];
    for (const x of triggers) {
      r.triggers.push(
        typeof x === "string" ?
          triggerFromString(x)
        : constructFromRegistry(x, TypeRegistries.reactions, "impossible"),
      );
    }

    const actions = source[1];
    for (const x of actions) {
      r.actions.push(action(x));
    }

    return r;
  }
  /** @param {[Integrate.Unconstructed<ReactionTrigger>[], Integrate.Unconstructed<DialogueAction>[]][]} source  */
  static arrayFrom(source) {
    const reactions = [];

    for (const ra of source) {
      if (ra) reactions.push(Reaction.from(ra));
    }

    return reactions;
  }
}

export class ReactionManager {
  constructor(reactions) {
    this.#reactions = Reaction.arrayFrom(reactions);
  }
  /** @type {Reaction[]} */
  #reactions = [];
  /** @template T @param {InteractableEntity} entity @param {new () => T} T @param {T["isTriggered"] extends (...args: infer A) => * ? A : never} data  */
  fire(entity, T, ...data) {
    for (const reaction of this.#reactions) reaction.fire(entity, T, ...data);
  }
  reset() {
    for (const r of this.#reactions) for (const t of r.triggers) t.reset();
  }
}

/** Converts many shorthands into full instances. **Won't call Integrate's `init()`!** @param {string} str */
export function triggerFromString(str) {
  const parts = str.split(":");
  const args = new Array(parts.length - 1);

  for (let i = 1; i < parts.length; i++) args[i - 1] = parts[i];

  return new (TypeRegistries.reactions.get(parts[0]))(...args);
}
