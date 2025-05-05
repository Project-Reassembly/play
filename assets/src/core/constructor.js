import { Integrate } from "../lib/integrate.js";
/** Generic type constructor. Uses `Registry.genericType` as the source for any template.
 * @param {{type: string | undefined}} object Source to construct from. This object is left unchanged. Type must be present in `Registry.genericType`, or else `Object` is used instead.
 * @param {string} [defaultType="object"] Default fallback type for when the source has no `type` property.
 */
function construct(object, defaultType = "generic") {
  if (!object) return; //Catch accidental calls using null, undefined or similar
  object.type ??= defaultType;
  return constructFromRegistry(object, Integrate.types);
}

function constructFromRegistry(object, registry) {
  if (!(registry instanceof Integrate.Registry))
    throw new ReferenceError("'" + registry + "' is not a valid registry!"); //Catch bad (nonexistent or non-registry) registry
  if (!object) return; //Catch accidental calls using null, undefined or similar
  return constructFromType(object, registry.get(object.type));
}

function constructFromType(object, type) {
  //Constructs an instance using type from registry, if it exists. If not, the error will throw.
  let instantiated = new type();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : {}; //Initialise if possible.
  return instantiated;
}

/**A version of `Object.assign()` which only copies keys present on both objects, and will not allow functions to be overridden.\
 * Mutates the original object, and returns it.
 */
function assign(target, source) {
  for (let key of Object.getOwnPropertyNames(source)) {
    let value = source[key];
    let replace = target[key];
    if (replace !== undefined) {
      if (typeof replace !== "function") {
        target[key] = value;
      } else console.warn("Cannot replace an object's method: " + key);
    } else {
      console.warn(
        "Cannot create properties using `construct()`-derived functions: " +
          key +
          " is not present on type " +
          target.constructor.name
      );
    }
  }
  return target;
}
export { construct, constructFromRegistry, constructFromType, assign };
