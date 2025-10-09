import { constructFromType } from "../../core/constructor.js";

export class Attribute {
  #value = 1;
  #baseValue = 1;
  constructor(value = 1) {
    this.#baseValue = value;
    this.setMult(1);
  }
  setMult(multiplier) {
    this.#value = this.#baseValue * multiplier;
  }
  multiply(multiplier) {
    this.#value *= multiplier;
  }
  reset() {
    this.#value = this.#baseValue;
  }
  get(){
    return this.#value;
  }
  base(){
    return this.#baseValue;
  }
  set(_){
    this.#baseValue = _;
  }
}
//deals with Integrate's universal constructor, maps and intellisense all at once
export class AttributeMap {
  #map = new Map();
  #default = new Attribute();
  constructor(attributes = {}, defaults = {}) {
    for (let name in defaults) {
      this.#map.set(name, new Attribute(+defaults[name]));
    }
    //override if the user wants to
    for (let name in attributes) {
      this.#map.set(name, new Attribute(+attributes[name]));
    }
  }
  /**
   * Gets an attribute, or the 'default' attribute if nonexistent.
   * @param {string} name Name of the attribute to get.
   * @returns {Attribute} The attribute
   */
  get(name) {
    return this.#map.get(name) ?? this.#default;
  }
  /**
   * Gets the value of an attribute, or the 'default' attribute if nonexistent.
   * @param {string} name Name of the attribute to get.
   * @returns {number} The attribute's value
   */
  getValue(name) {
    return this.get(name).get();
  }
  /**
   * Resets the values of all attributes to their unmodified values.
   */
  resetAll() {
    this.#map.forEach((v) => v.reset());
  }
  /**
   * Applies a multiplicative modifier to an attribute.
   * @param {string} attr The name of the attribute to modify
   * @param {number} multiplier Multiplicative modifier to apply
   */
  multiply(attr, multiplier) {
    this.get(attr).multiply(multiplier);
  }
}
