class ItemStack {
  item = "nothing";
  count = 1;
  #itemCache = null;
  /**
   * @readonly
   */
  static get EMPTY() {
    return new this("nothing", 0);
  }
  /**
   * Gets the actual item from the stack. Will return the same object for the same itemstack.
   * @returns {Item} The item instance of the stack.
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
    return new ItemStack(this.item, this.count);
  }
  constructor(item = "nothing", count = 1) {
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
}
