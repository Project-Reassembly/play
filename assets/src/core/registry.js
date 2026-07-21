import Integrate from "../lib/integrate.js";
import { constructFromType } from "./constructor.js";
/**
 * @import { Block } from "../classes/block/block.js"
 * @import { StatusEffect } from "../classes/effect/status-effect.js"
 * @import { Entity } from "../classes/entity/entity.js"
 * @import { Item } from "../classes/item/item.js"
 * @import { ImageContainer } from "./ui.js"
 * @import { VisualEffect } from "../play/effects.js"
 * @import { Generator } from "../classes/world/generator.js"
 * @import { Cutscene } from "./cutscene.js"
 * @import { Corporation } from "../classes/item/corporation.js";
 * @import { WorldEvent } from "../classes/world/events/world-event.js";
 * @import { GroundTile } from "../classes/block/ground-tile.js";
 * @import { BulletInstance, BulletModel } from "../classes/projectile/bullet.js"
 */
/// <reference path="../lib/integrate"/>

/** Registries for the game. */
const Registries = Object.freeze(
  new (class Registries {
    /**@readonly @type {Integrate.Registry<ImageContainer>} */
    images = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Item>} */
    items = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Block>} */
    blocks = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<GroundTile>} */
    tiles = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Entity>} */
    entities = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<StatusEffect>} */
    statuses = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<VisualEffect>} */
    vfx = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Generator>} */
    worldgen = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Corporation>} */
    corps = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<WorldEvent>} */
    events = new Integrate.Registry();
    //Slightly odd registries
    /**@readonly @type {Integrate.Registry<[string[], string[]]>} */
    deathmsg = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<Cutscene>} */
    cutscenes = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<BulletModel>} */
    bullets = new Integrate.Registry();
    /**@readonly Smaller registries for less important stuff, especially those without an actual class associated with them. */
    small = Object.freeze(
      new (class SmallRegistries {
        /**@readonly @type {Integrate.Registry<{name:string, description:string, bullet:string}>} */
        punch_types = new Integrate.Registry();
      })(),
    );
  })(),
);

const TypeRegistries = Object.freeze(
  new (class TypeRegistries {
    /**@readonly */
    default = Integrate.types;
    /** World event types @readonly */
    worldevent = new Integrate.TypeRegistry();
    /** Accessory modifiers @readonly */
    accessory = new Integrate.TypeRegistry();
    /** Bullet behaviour components @readonly */
    bullet = new Integrate.TypeRegistry();
    /** Dialogue option actions. @readonly */
    dialogue = new Integrate.TypeRegistry();
  })(),
);

/**
 * @typedef PreloadResource
 * @property {string} path Target item, default stored thing.
 * @prop {[string, string][]} [items] Repository items, only used when `type === "repo"`. Each entry is of the form `[name, path]`.
 */

const PreloadRegistries = Object.freeze(
  new (class PreloadRegistries {
    /**@readonly @type {Integrate.Registry<PreloadResource>} */
    images = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<PreloadResource>} */
    cutscenes = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<StatusEffect>} */
    stati = new Integrate.Registry();
    /**@readonly @type {Integrate.Registry<BulletModel>} */
    bullets = new Integrate.Registry();
  })(),
);

/** @template T @typedef {T extends Integrate.Registry<infer X> ? Integrate.Unconstructed<X> : never} TypeOfRegistry */

/**
 * Finds a property on a registry entry.
 * @template {keyof Registries} T
 * @param {T} reg The registry to search.
 * @param {string} name Registry name to find.
 * @param {keyof TypeOfRegistry<Registries[T]>} prop Property to find on the value.
 */
function lookup(reg, name, prop) {
  return Registries[reg].get(name)[prop];
}

/** @typedef {"hardcoded"|"preloaded"|"modded"} Stage */
/**
 *  @typedef {{readonly value: T, readonly original: Integrate.Unconstructed<T>}} DelayedConstruction
 * @template T
 */

/** @type {Map<Stage, (() => void)[]>} */
const __delays = new Map();
__delays.set("hardcoded", []);
__delays.set("preloaded", []);
__delays.set("modded", []);

/** @param {Stage} stage  */
export function constructDelayed(stage) {
  __delays.get(stage).forEach((v) => v());
}
/**
 * Delays the construction of an object to a certain time in the loading lifecycle. The value is accessed with the `value` property of the returned object.
 * @template T
 * @param {Integrate.Unconstructed<T>} thing Thing to construct.
 * @param {Integrate.TypedConstructor<T>} type Type to construct with.
 * @param {Stage} stage Stage to delay loading until.
 * @returns {DelayedConstruction<T>}
 */
export function delay(thing, type, stage) {
  let v = thing;
  __delays.get(stage).push(() => (v = constructFromType(thing, type)));
  return {
    get original() {
      return thing;
    },
    get value() {
      return v;
    },
  };
}

export { lookup, PreloadRegistries, Registries, TypeRegistries };
