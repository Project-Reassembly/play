import Integrate from "../../lib/integrate.js";
import { HasComponents } from "./components.js";

/** @template V Component base type. @template {{model: Model<V,I>}} I Instance type. @extends {HasComponents<V>} */
export class Model extends HasComponents {
  /** @type {Integrate.TypedConstructor<I>} */
  I;
  /**
   * @param {Integrate.TypedConstructor<V>} V
   * @param {Integrate.TypedConstructor<I>} I
   */
  constructor(V, I) {
    super(V);
    this.I = I;
  }
  /** @returns {I} */
  instantiate() {
    const thing = new this.I();
    thing.model = this;
    if (thing.init) thing.init();
    return thing;
  }
}
