import { constructFromType } from "../../core/constructor.js";
import { TypeRegistries } from "../../core/registry.js";
/** @import Integrate from "../../lib/integrate.js" */
/** @template V */
export class HasComponents {
  /** @type {Map<Integrate.TypedConstructor<V>, V[]>} */
  #map = new Map();

  /** Integrate-defined behaviours. Won't exist for long. @type {Integrate.Unconstructed<V>[]} */
  components = [];
  V;
  /** @param {Integrate.TypedConstructor<V>} V  */
  constructor(V) {
    this.V = V;
  }
  init() {
    this.components.forEach((v, i, a) => {
      /** @type {Integrate.TypedConstructor<V>} */
      const type = TypeRegistries.bullet.get(v.type ?? "null");
      this.add(type, v);
    });
    delete this.components;
  }
  /** Returns an iterator of all constructed components. */
  *all() {
    for (const stuff of this.#map.values()) yield* stuff;
  }
  /** Gets the first component of a type, or null if there is none. @template {V} T @param {Integrate.TypedConstructor<T>} T @returns {T|undefined} */
  get(T) {
    const ts = this.#map.get(T);
    return ts ? ts[0] : undefined;
  }
  /** Gets all components of a type. @template {V} T @param {Integrate.TypedConstructor<T>} T @returns {T[]} */
  getAll(T) {
    const ts = this.#map.get(T);
    return ts ?? [];
  }
  /** Removes all components of a type. @template {V} T @param {Integrate.TypedConstructor<T>} T */
  removeAll(T) {
    this.#map.delete(T);
  }
  /** Removes the last added component of a type and returns it. @template {V} T @param {Integrate.TypedConstructor<T>} T @returns {T|undefined} */
  remove(T) {
    const ts = this.#map.get(T);
    if (!ts) return;
    return ts.pop();
  }
  /** @template {V} T @param {Integrate.TypedConstructor<T>} T @returns {boolean} */
  has(T) {
    return this.#map.has(T);
  }
  /** Adds a new component. @template {V} T @param {Integrate.TypedConstructor<T>} T @param {Integrate.Unconstructed<T>} data  @returns {T} */
  add(T, data = {}) {
    this.#checkT(T);
    const item = constructFromType(data, T);
    const ofthistype = this.#map.get(T);
    if (!ofthistype) this.#map.set(T, [item]);
    else ofthistype.push(item);
    return item;
  }
  /** Adds many components of the same type. @template {V} T @param {Integrate.TypedConstructor<T>} T @param {Integrate.Unconstructed<T>[]} data  @returns {T[]} */
  addMany(T, ...data) {
    this.#checkT(T);
    const items = data.map((d) => constructFromType(d, T));
    const present = this.#map.get(T);
    if (!present) this.#map.set(T, items);
    else present.push(...items);
    return items;
  }
  /** @param {...(Integrate.TypedConstructor<V>)} Ts @returns {boolean} */
  hasOneOf(...Ts) {
    for (const T of Ts) if (this.#map.has(T)) return true;
    return false;
  }
  /** @template {keyof {[K in keyof V as V[K] extends Function ? K : never]: V[K]}} K @param {K} name @param {V[K] extends (...args: infer A) => * ? A : never} params @returns {boolean} True if any function returned `false` to cancel the event. */ //@returns {V[K] extends (...args: *) => infer R ? R : never} 
  call(name, ...params) {
    for (const stuff of this.#map.values())
      for (const c of stuff) /* if (name in c) */ 
        if (c[name].apply(c, params) === false) return true;
    return false;
  }
  /** @template T @param {Integrate.TypedConstructor<T>} T  */
  #checkT(T) {
    if (!(T.prototype instanceof this.V))
      throw new TypeError(
        `Component type ${T.name} is not applicable to holder which accepts ${this.V.name}`,
      );
  }
}
