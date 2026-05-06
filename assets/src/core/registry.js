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
 */
/// <reference path="../lib/integrate"/>


const Registries = Object.freeze({
  /**@readonly @type {Integrate.Registry<ImageContainer>} */
  images: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<Item>} */
  items: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<Block>} */
  blocks: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<Entity>} */
  entities: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<StatusEffect>} */
  statuses: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<VisualEffect>} */
  vfx: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<Generator>} */
  worldgen: new Integrate.Registry(),
  //Slightly odd registries
  /**@readonly @type {Integrate.Registry<[string[], string[]]>} */
  deathmsg: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<Cutscene>} */
  cutscenes: new Integrate.Registry(),
  /**@readonly */
  type: Integrate.types
});

/**
 * @typedef PreloadResource
 * @property {string} path
 */

const PreloadRegistries = Object.freeze({
  /**@readonly @type {Integrate.Registry<PreloadResource>} */
  images: new Integrate.Registry(),
  /**@readonly @type {Integrate.Registry<PreloadResource>} */
  cutscenes: new Integrate.Registry(),
});

/**
 * Finds a property on a registry entry.
 * @param {keyof Registries} reg The registry to search.
 * @param {string} name Registry name to find.
 * @param {string} prop Property to find on the value.
 */
function lookup(reg, name, prop){
  return (Registries[reg].get(name))[prop];
}

export { lookup, PreloadRegistries, Registries };

