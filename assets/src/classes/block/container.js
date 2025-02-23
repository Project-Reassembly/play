class Container extends Block {
  /** @type {Array<ItemStack>} */
  inventory = [];
  inventorySize = 30;
  static selectedBlock = null;
  init() {
    super.init();
    this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
  addItem(item, stack = true) {
    let i = 0;
    while (
      this.inventory[i] &&
      (this.inventory[i]?.item !== item ||
        this.inventory[i].count >= this.inventory[i].getItem().stackSize ||
        !stack) &&
      this.inventory[i]?.item !== "nothing" &&
      i < this.inventorySize
    ) {
      i++;
    }
    if (this.inventory[i]?.item === "nothing") {
      this.inventory[i] = new ItemStack(item, 1);
    } else if (this.inventory[i] instanceof ItemStack) {
      this.inventory[i].count++;
    } else {
      this.inventory[i] = new ItemStack(item, 1);
    }
  }
  addItems(item, number, stack = true) {
    for (let i = 0; i < number; i++) {
      this.addItem(item, stack);
    }
  }
  autoStack() {
    let buffer = this.inventory.slice(0);
    this.inventory.splice(0);
    for (let item of buffer) {
      if (!item) continue;
      if (item.item === "nothing") continue;
      this.addItems(item.item, item.count, true);
    }
  }
  cleanInventory() {
    for (let index = 0; index < this.inventory.length; index++) {
      let item = this.inventory[index];
      if (item && item instanceof ItemStack && item.item === "nothing")
        delete this.inventory[index];
    }
  }
  sortByRegistryName() {
    this.cleanInventory();
    this.inventory.sort(dynamicSort("item"));
  }
  sortByCount() {
    this.cleanInventory();
    this.inventory.sort(dynamicSort("-count"));
  }
  /** Picks up an item from an inventory slot, or puts it back. */
  selectInventorySlot(index, pickup = !!keyIsDown(SHIFT)) {
    let mIS = InventoryEntity.mouseItemStack ?? ItemStack.EMPTY;
    let mISItem = mIS.getItem()
    if(!this.inventory[index]) this.inventory[index] = ItemStack.EMPTY;
    if (
      mIS.item !== this.inventory[index].item
    ) {
      InventoryEntity.mouseItemStack = this.inventory[index];
      this.inventory[index] = mIS;
    } else if (mIS.count + this.inventory[index].count < mISItem.stackSize) {
      //Transfer stack to correct place
      if (pickup) {
        mIS.count += this.inventory[index].count;
        this.inventory[index] = ItemStack.EMPTY;
      } else {
        this.inventory[index].count += mIS.count;
        InventoryEntity.mouseItemStack = ItemStack.EMPTY;
      }
    } else {
      let transferAmount = 0
      
      if (pickup) {
        transferAmount = mISItem.stackSize - mIS.count;

        mIS.count += transferAmount;
        this.inventory[index].count -= transferAmount;

        if(this.inventory[index].count === 0) this.inventory[index] = ItemStack.EMPTY
      } else {
        transferAmount = mISItem.stackSize - this.inventory[index].count;

        mIS.count -= transferAmount;
        this.inventory[index].count += transferAmount;

        if(mIS.count === 0) InventoryEntity.mouseItemStack = ItemStack.EMPTY
      }
    }
  }
}