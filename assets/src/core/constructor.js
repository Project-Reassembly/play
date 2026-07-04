import Integrate from "../lib/integrate.js";
/// <reference path="../lib/integrate"/>


/** Generic type constructor. Uses `Integrate.types` as the source for any template.
 * @template T
 * @param {Integrate.Unconstructed<T>} object Source to construct from. This object is left unchanged. Type must be present in `Integrate.types`, or else `Object` is used instead.
 * @param {string} [defaultType="object"] Default fallback type name for when the source has no `type` property.
 * @returns {T}
 */
function construct(object, defaultType = "generic") {
  if (!object) return; //Catch accidental calls using null, undefined or similar
  return constructFromRegistry(object, Integrate.types, defaultType);
}
/** Generic type constructor. Uses the specified registry as the source for any template.
 * @template T
 * @param {Integrate.Unconstructed<T>} object Source to construct from. This object is left unchanged. Type must be present in the given registry, or else `Object` is used instead.
 * @param {Integrate.TypeRegistry} registry Registry to get types from.
 * @param {string} defaultType Default fallback type name for when the source has no `type` property.
 * @returns {T}
 */
function constructFromRegistry(object, registry, defaultType) {
  if (!(registry instanceof Integrate.TypeRegistry))
    throw new TypeError("Invalid type registry!"); //Catch bad (nonexistent or non-registry) registry
  if (!object) return; //Catch accidental calls using null, undefined or similar
  object.type ??= defaultType;
  return constructFromType(object, registry.get(object.type));
}
/** Specific type constructor. Uses a given type directly, and ignores the `type` property.
 * @template T
 * @param {Integrate.Unconstructed<T>} object Source to construct from. This object is left unchanged. Type must be present in the given registry, or else `Object` is used instead.
 * @param {Integrate.TypedConstructor<T>} ctor Constructor to use.
 * @returns {T}
 */
function constructFromType(object, ctor) {
  if (!object) return;
  //Constructs an instance using type from registry, if it exists. If not, the error will throw.
  let instantiated = new ctor();
  let cloned = {};
  //Clone the object if possible, to copy nested objects like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  if(!(instantiated instanceof Integrate.RegisteredItem)) delete cloned.type
  assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : null; //Initialise if possible.
  return instantiated;
}

/**A version of `Object.assign()` which only copies keys present on both objects, and will not allow functions to be overridden.\
 * Mutates the original object, and returns it.
 * @template T
 * @param {Integrate.Unconstructed<T>} source Object to get overrides from.
 * @param {T} target Object to override.
 */
function assign(target, source) {
  if (!target || !source) return;
  for (let key of Object.getOwnPropertyNames(source)) {
    let value = source[key];
    let replace = target[key];
    if (replace !== undefined) {
      if (typeof replace !== "function") {
        target[key] = value;
      } else console.warn("Cannot replace an object's method: " + key);
    } else {
      console.warn(
        `Cannot create properties using 'construct()'-derived functions: ${key} is not present on type ${target.constructor.name}`
      );
    }
  }
  return target;
}
export { assign, construct, constructFromRegistry, constructFromType };

