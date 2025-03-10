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
  onHealthZeroed() {
    //Drop items
    this.inventory.iterate((stack) => {
      DroppedItemStack.create(stack, this.world, this.x, this.y);
    }, true);
    this.inventory.clear();
    super.onHealthZeroed();
  }
}

class EquippedEntity extends InventoryEntity {
  equipment = new Inventory(5);
  head = new Inventory(1);
  rightHand = new Inventory(1);
  leftHand = new Inventory(1);
  body = new Inventory(1);

  inventories = [
    this.inventory,
    this.equipment,
    this.head,
    this.rightHand,
    this.leftHand,
    this.body,
  ];

  onHealthZeroed() {
    for (let inv of this.inventories) {
      inv.iterate((stack) => {
        DroppedItemStack.create(stack, this.world, this.x, this.y);
      }, true);
      inv.clear();
    }
    super.onHealthZeroed();
  }

  draw() {
    super.draw();
    for (let inv of this.inventories) {
      inv.iterate((x) => {
        let item = x.getItem();
        if (item instanceof Equippable) {
          item.component.draw(
            this.x,
            this.y,
            this.direction,
            inv == this.leftHand
          );
        }
      });
    }

    // for (let key of ["head", "rightHand", "leftHand", "body"]) {
    //   if (this[key] instanceof Inventory) {
    //     this[key].iterate((x) => {
    //       let item = x.getItem();
    //       if (item instanceof Equippable) {
    //         item.component.draw(
    //           this.x,
    //           this.y,
    //           this.direction,
    //           key === "leftHand"
    //         );
    //       }
    //     });
    //   }
    // }
  }
}
