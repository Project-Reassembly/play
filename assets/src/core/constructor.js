/** Generic type constructor. Uses `Registry.genericType` as the source for any template.
 * @param {{type: string | undefined}} object Source to construct from. This object is left unchanged. Type must be present in `Registry.genericType`, or else `Object` is used instead.
 * @param {string} [defaultType="object"] Default fallback type for when the source has no `type` property.
 */
function construct(object, defaultType = "object") {
  object.type ??= defaultType
  return constructFromRegistry(object, Registry.type);
}

function constructFromRegistry(object, registry) {
  if (!registry instanceof Registry)
    throw new ReferenceError("'" + registry + "' is not a valid registry!"); //Catch bad (nonexistent or non-registry) registry
  if (!object) return; //Catch accidental calls using null, undefined or similar

  //Constructs an instance using type from registry, if it exists. If not, the error will throw.
  let instantiated = new (registry.get(object.type))();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  instantiated = Object.assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : {}; //Initialise if possible.
  return instantiated;
}
