import { construct } from "../../core/constructor.js";
import { tru } from "../../core/number.js";
import { Inventory } from "../inventory.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { Equippable } from "../item/equippable.js";
import { ItemStack } from "../item/item-stack.js";
import { PhysicalObject } from "../physical.js";
import { Component } from "./component.js";
import { Entity } from "./entity.js";
class InventoryEntity extends Entity {
  /**@type {Inventory} */
  inventory = null;
  inventorySize = 30;
  dropChance = 1;
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
  static applyExtraProps(entity, created) {
    entity.inventory = Inventory.deserialise(created.inventory);
  }
}

class EquippedEntity extends InventoryEntity {
  /**@type {Inventory} */
  equipment = null;
  /**@type {Inventory} */
  head = null;
  /**@type {Inventory} */
  rightHand = null;
  /**@type {Inventory} */
  leftHand = null;
  /**@type {Inventory} */
  body = null;
  /**@type {Inventory} */
  ammo = null;

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
      this.ammo,
    ];
  }

  init() {
    super.init();
    this.rightHand = new Inventory(1, this.rightHand);
    this.leftHand = new Inventory(1, this.leftHand);
    this.body = new Inventory(1, this.body);
    this.head = new Inventory(1, this.head);
    this.equipment = new Inventory(5, this.equipment);
    this.ammo = new Inventory(5, this.ammo);
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
        .component.draw(
          this.x,
          this.y,
          this.direction,
          true,
          this.armType.xOffset,
          this.armType.yOffset
        );
    else this.armType.draw(this.x, this.y, this.direction, true);
    if (this.rightHand.get(0)?.getItem()?.component)
      this.rightHand
        .get(0)
        .getItem()
        .component.draw(
          this.x,
          this.y,
          this.direction,
          false,
          this.armType.xOffset,
          this.armType.yOffset
        );
    else this.armType.draw(this.x, this.y, this.direction);
    let d = (item) => {
      if (item instanceof Equippable) {
        item.component.draw(this.x, this.y, this.direction);
      }
    };
    if (this.bodyPart) this.bodyPart.draw(this.x, this.y, this.direction);
    if (this.headPart) this.headPart.draw(this.x, this.y, this.direction);
    d(this.body.get(0)?.getItem());
    d(this.head.get(0)?.getItem());
    PhysicalObject.prototype.draw.call(this);
    if (PhysicalObject.debug) this._debugAI();
  }
  serialise() {
    let e = super.serialise();
    e.equipment = this.equipment.serialise();
    e.leftHand = this.leftHand.serialise();
    e.rightHand = this.rightHand.serialise();
    e.head = this.head.serialise();
    e.body = this.body.serialise();
    e.ammo = this.ammo.serialise();
    return e;
  }
  static applyExtraProps(entity, created) {
    super.applyExtraProps(entity, created);
    entity.equipment = Inventory.deserialise(created.equipment);
    entity.leftHand = Inventory.deserialise(created.leftHand);
    entity.rightHand = Inventory.deserialise(created.rightHand);
    entity.head = Inventory.deserialise(created.head);
    entity.body = Inventory.deserialise(created.body);
    entity.ammo = Inventory.deserialise(created.ammo);
  }
  attack() {
    if (
      this.rightHand.get(0) instanceof ItemStack &&
      this.rightHand.get(0).getItem() instanceof Equippable
    )
      this.rightHand.get(0).getItem().use(this);
    if (
      this.leftHand.get(0) instanceof ItemStack &&
      this.leftHand.get(0).getItem() instanceof Equippable
    )
      this.leftHand.get(0).getItem().use(this);
  }
  calculateAttributeModifiers() {
    super.calculateAttributeModifiers();

    this.equipment.iterate((stack) => {
      let i = stack.getItem();
      if (i instanceof Equippable) {
        for (let key in i.attributeModifiers) {
          this.attributes.multiply(key, i.attributeModifiers[key]);
        }
      }
    });
  }
}
export { EquippedEntity, InventoryEntity };
