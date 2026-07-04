/** @extends {Map<string, *>} */

export class ComponentData extends Map {
  /**@param {string} key  */
  incr(key) {
    this.set(key, (+this.get(key) || 0) + 1);
  }
  /**@param {string} key  */
  decr(key) {
    this.set(key, (+this.get(key) || 0) - 1);
  }
}
