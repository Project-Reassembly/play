class InventoryEntity extends Entity {
  inventory = new Inventory(30);
  inventorySize = 30;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize);
    this.inventory.storage = this.inventory.storage.map((x) =>
      construct(x, "itemstack")
    );
  }
}

class EquippedEntity extends InventoryEntity {
  equipment = new Inventory(5);
  head = new Inventory(1);
  rightHand = new Inventory(1);
  leftHand = new Inventory(1);
  body = new Inventory(1);

  draw() {
    for (let component of this.components) {
      component.draw(this.x, this.y, this.direction);
    }
  }

}
