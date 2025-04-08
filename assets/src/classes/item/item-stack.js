/**
 * @typedef SerialisedItemStack
 * @prop {string} item
 * @prop {int} count
 * @prop {[string, int][]} tags
 */
/** */
class ItemStack extends RegisteredItem {
  item = "nothing";
  count = 1;
  //Non-copiable attributes
  min = null;
  max = null;
  dropChance = 1;
  //
  tags = new Map();
  //Internal
  #itemCache = null;
  init() {
    if (this.min != null && this.max != null) {
      this.count = roundNum(rnd(this.min, this.max));
    }
  }
  /**
   * @readonly
   * Contains an empty itemstack.\
   * Each instance is different, i.e. `ItemStack.EMPTY !== ItemStack.EMPTY`.
   */
  static get EMPTY() {
    return new this("nothing", 0);
  }
  /**
   * Gets the actual item from the stack. Will return the same object for the same itemstack.
   * @returns {Item | null} The item instance of the stack.
   */
  getItem() {
    if (this.isEmpty()) return null;
    this.#itemCache ??= construct(Registry.items.get(this.item), "item");
    if (this.item !== this.#itemCache.registryName) {
      this.#itemCache = null;
      return this.getItem();
    }
    return this.#itemCache;
  }
  /**
   * Checks equality with another ItemStack.
   * @param {ItemStack} otherStack The other stack to compare with.
   */
  equals(otherStack) {
    return this.count === otherStack.count && this.item === otherStack.item;
  }
  /**
   * Checks whether or not the ItemStack is empty, i.e. should be ignored.
   * @returns True if the ItemStack is empty.
   */
  isEmpty() {
    return this.item === "nothing" || this.count === 0;
  }
  /**
   * Checks if this ItemStack can be combined into another. Will return true if either stack is empty. Is not symmetrical, i.e. `a.stacksWith(b)` is not necessarily the same as `b.stacksWith(a)`.
   * @param {ItemStack} otherStack The other stack to check against.
   * @returns True if these could stack, false if not.
   */
  stacksWith(otherStack) {
    return (
      this.isEmpty() ||
      otherStack.isEmpty() ||
      otherStack.specialStackCondition(this) ||
      (this.item === otherStack.item &&
        this.count + otherStack.count <= this.getItem().stackSize)
    );
  }
  /**
   * A check for additional conditions that would allow this to stack with something else, i.e. remove this ItemStack and add to the `count` of the other.
   * @param {ItemStack} otherStack The other stack to check against.
   * @returns True if the special condition is met, and the items can stack, and false if the items cannot stack.
   */
  specialStackCondition(otherStack) {
    return false;
  }
  /**
   * Combines this stack with another one.
   * @param {ItemStack} otherStack The other stack to add to this one.
   */
  stack(otherStack) {
    if (this.isEmpty()) this.item = otherStack.item;
    this.count += otherStack.count;
    otherStack.count = 0;
    otherStack.item = "nothing";
  }
  /** Duplicates this ItemStack. */
  copy() {
    let ist = new ItemStack(this.item, this.count);
    ist.init();
    this.tags.forEach((v, k) => ist.addTag(k, structuredClone(v)));
    return ist;
  }
  constructor(item = "nothing", count = 1) {
    super();
    this.item = item;
    this.count = count;
  }
  toString(useDisplay = false) {
    return (useDisplay ? this.getItem().name : this.item) + " x" + this.count;
  }
  clear() {
    this.item = "nothing";
    this.count = 0;
    this.#itemCache = null;
  }
  /**@param {SerialisedItemStack} created  */
  static deserialise(created) {
    let istack = new this();
    istack.item = created?.item ?? "nothing";
    istack.count = created?.count ?? 1;
    istack.init();
    istack.tags = new Map(created?.tags);
    return istack;
  }
  /**@returns {SerialisedItemStack} */
  serialise() {
    return { item: this.item, count: this.count, tags: this._getTagArray() };
  }
  _getTagArray() {
    let arr = [];
    this.tags.forEach((v, k) => arr.push([k, v]));
    return arr;
  }
  addTag(name, value) {
    this.tags.set(name, value);
  }
}
