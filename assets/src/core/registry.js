class Registry {
  ///Internal Map for holding the registry items.
  #content = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  //Basic registries for holding objects used by the base game.
  static type = new this();
  static images = new this();
  static items = new this();
  static blocks = new this();
  static entities = new this();
  static statuses = new this();
  static worldgen = new this();
  //Slightly odd registries
  static deathmsg = new this();
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {*} item Item to add to registry.
   */
  add(name, item) {
    name = Registry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        "Item " +
          name +
          " already exists in registry! Consider using a different name."
      );
    //Add to internal Map
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name) {
    if (!name) return false;
    name = Registry.#processName(name);
    //Return presence
    return this.#content.has(name);
  }
  /**
   * Gets an item from registry name.
   * @param {string} name Registry name to get. Not case sensitive.
   * @returns The item, if present.
   */
  get(name) {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = Registry.#processName(name);
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Return item, if it exists.
    let item = this.#content.get(name);
    try {
      item.registryName = name;
    } catch (e) {
      console.warn("Non-object entries do not have full feature support.");
    }
    return item;
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Adds another registry item with the same content as the specified one.
   * @param {string} name Registry name to change.
   * @param {string} as What to change the name to.
   */
  alias(name, as) {
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Get current entry
    let current = this.get(name);
    //Add new entry with the same content
    this.add(as, current);
  }
  /**
   * Performs a function on each item in registry.
   * @param {(name: string, item) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    this.#content.forEach((value, key) => void callback(key, value));
    return true;
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {(name: string, item) => void} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    this.#content.forEach(
      async (value, key) => await void callback(key, value)
    );
  }
  /**
   *
   * @param {int} index Zero-based index of the item to get.
   * @returns The registry item at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(
        "Index " + index + " out of bounds for registry length " + this.size
      );
    return [...this.#content.keys()][index];
  }
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    if (hasNonAscii(name))
      throw new TypeError("Registry names may only contain ASCII characters");
    return name.toString().toLowerCase();
  }
  static isValidName(name) {
    try {
      this.#processName(name);
      return true;
    } catch (error) {
      return false;
    }
  }
}

let hasNonAscii = (str) => [...str].some((char) => char.charCodeAt(0) > 127);
