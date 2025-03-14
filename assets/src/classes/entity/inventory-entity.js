class InventoryEntity extends Entity {
  inventory = new Inventory(30);
  inventorySize = 30;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize, this.inventory);
    this.inventory.init();
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

  //Commonly used indices
  /**@type {Component} */
  get headPart() {
    return this.components[0];
  }
  set headPart(_) {
    this.components[0] = _;
  }
  /**@type {Component} */
  get bodyPart() {
    return this.components[1];
  }
  set bodyPart(_) {
    this.components[1] = _;
  }
  /**@type {Component} */
  get legsPart() {
    return this.components[2];
  }
  set legsPart(_) {
    this.components[2] = _;
  }

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
    if (this.dead) return;
    if (this.legsPart) {
      this.legsPart.draw(this.x, this.y, this.direction);
      this.legsPart.draw(this.x, this.y, this.direction, true);
    }
    this.leftHand
      .get(0)
      ?.getItem()
      ?.component?.draw(this.x, this.y, this.direction, true);
    this.rightHand
      .get(0)
      ?.getItem()
      ?.component?.draw(this.x, this.y, this.direction);
    if (this.bodyPart) this.bodyPart.draw(this.x, this.y, this.direction);
    this.body.iterate((x) => {
      let item = x.getItem();
      if (item instanceof Equippable) {
        item.component.draw(
          this.x,
          this.y,
          this.direction,
          inv == this.leftHand
        );
      }
    }, true);
    if (this.headPart) this.headPart.draw(this.x, this.y, this.direction);
    this.head.iterate((x) => {
      let item = x.getItem();
      if (item instanceof Equippable) {
        item.component.draw(
          this.x,
          this.y,
          this.direction,
          inv == this.leftHand
        );
      }
    }, true);
    PhysicalObject.prototype.draw.call(this);
    // for (let inv of this.inventories) {
    //   inv.iterate((x) => {
    //     let item = x.getItem();
    //     if (item instanceof Equippable) {
    //       item.component.draw(
    //         this.x,
    //         this.y,
    //         this.direction,
    //         inv == this.leftHand
    //       );
    //     }
    //   });
    // }
  }
}
