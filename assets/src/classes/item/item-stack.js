class ItemStack{
  item = "nothing";
  count = 1;
  static EMPTY = new this("nothing", 0)
  /**
   * Gets the actual item from the stack.
   * @returns {Item} The item instance of the stack.
   */
  getItem(){
    return construct(Registry.items.get(this.item), "item")
  }
  constructor(item, count){
    this.item = item
    this.count = count
  }
}