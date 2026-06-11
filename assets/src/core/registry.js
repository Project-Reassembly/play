import Integrate from "../lib/integrate.js";
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
 * @import { Bullet } from "../classes/projectile/bullet.js"
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
    /**@readonly Smaller registries for less important stuff, especially those without an actual class associated with them. */
    small = Object.freeze(
      new (class SmallRegistries {
        /**@readonly @type {Integrate.Registry<{name:string, description:string, bullet:Integrate.Unconstructed<Bullet>}>} */
        punch_types = new Integrate.Registry();
      })(),
    );
  })(),
);

const TypeRegistries = Object.freeze(
  new (class TypeRegistries {
    /**@readonly */
    default = Integrate.types;
    /**@readonly */
    worldevent = new Integrate.TypeRegistry();
    /**@readonly */
    accessory = new Integrate.TypeRegistry();
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
  })(),
);

/** @template T @typedef {T extends Integrate.Registry<infer X> ? Integrate.Unconstructed<X> = never} TypeOfRegistry */

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

export { lookup, PreloadRegistries, Registries, TypeRegistries };
