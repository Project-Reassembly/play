class InventoryEntity extends Entity {
  /**@type {Inventory} */
  inventory = null;
  inventorySize = 30;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize, this.inventory);
  }
  onHealthZeroed(type, source) {
    //Drop items
    this.inventory.iterate((stack) => {
      if (tru(this.dropChance))
        DroppedItemStack.create(stack, this.world, this.x, this.y);
    }, true);
    this.inventory.clear();
    super.onHealthZeroed(type, source);
  }
  serialise() {
    let e = super.serialise();
    e.inventory = this.inventory.serialise();
    return e;
  }
}

class EquippedEntity extends InventoryEntity {
  equipment = new Inventory(5);
  /**@type {Inventory} */
  head = null;
  /**@type {Inventory} */
  rightHand = null;
  /**@type {Inventory} */
  leftHand = null;
  /**@type {Inventory} */
  body = null;

  armType = new Component();

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

  get inventories() {
    return [
      this.inventory,
      this.equipment,
      this.head,
      this.rightHand,
      this.leftHand,
      this.body,
    ];
  }

  init() {
    super.init();
    this.rightHand = new Inventory(1, this.rightHand);
    this.leftHand = new Inventory(1, this.leftHand);
    this.body = new Inventory(1, this.body);
    this.head = new Inventory(1, this.head);
    this.armType = construct(this.armType, "component");
  }

  onHealthZeroed(type, source) {
    let invs = this.inventories;
    for (let inv of invs) {
      inv.iterate((stack) => {
        if (tru(stack.dropChance))
          DroppedItemStack.create(stack, this.world, this.x, this.y);
      }, true);
      inv.clear();
    }
    super.onHealthZeroed(type, source);
  }

  draw() {
    if (this.dead) return;
    if (this.legsPart) {
      this.legsPart.draw(this.x, this.y, this.direction);
      this.legsPart.draw(this.x, this.y, this.direction, true);
    }
    //Arms
    if (this.leftHand.get(0)?.getItem()?.component)
      this.leftHand
        .get(0)
        .getItem()
        .component.draw(this.x, this.y, this.direction, true);
    else this.armType.draw(this.x, this.y, this.direction, true);
    if (this.rightHand.get(0)?.getItem()?.component)
      this.rightHand
        .get(0)
        .getItem()
        .component.draw(this.x, this.y, this.direction);
    else this.armType.draw(this.x, this.y, this.direction);

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
    if (PhysicalObject.debug) this._debugAI();
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
  serialise() {
    let e = super.serialise();
    e.equipment = this.equipment.serialise();
    e.leftHand = this.leftHand.serialise();
    e.rightHand = this.rightHand.serialise();
    e.head = this.head.serialise();
    e.body = this.body.serialise();
    return e;
  }
}
