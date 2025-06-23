import { construct } from "../../core/constructor.js";
import { Registries } from "../../core/registry.js";
import { blockSize } from "../../scaling.js";
import { Block } from "../block/block.js";
import { Container } from "../block/container.js";
import { Conveyor } from "../block/conveyor.js";
import { SignBlock } from "../block/decoration.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { Weapon } from "../item/weapon.js";
import { World } from "../world/world.js";
import { Component, WeaponisedComponent } from "./component.js";
import { InventoryEntity } from "./inventory-entity.js";

class ModularTankEntity extends InventoryEntity {
  inventorySize = 1;
  registryName = "tonk";
  aiType = "hostile";
  /**
   * @param {World} world
   * @param {*} centreX
   * @param {*} centreY
   * @param {*} range
   */
  static create(world, centreX, centreY, range) {
    /**@type {Block[]} */
    let blocks = world.blocksInSquare(centreX, centreY, range);
    blocks.forEach((element) => {
      if (element)
        world.particles.push(
          new ShapeParticle(
            element.x + blockSize / 2,
            element.y + blockSize / 2,
            0,
            60,
            0,
            0,
            "square",
            [
              [255, 0, 0],
              [255, 0, 0, 0],
            ],
            blockSize,
            blockSize,
            blockSize,
            blockSize,
            0,
            0
          )
        );
    });
    let ent = new ModularTankEntity();
    //Visuals
    blocks.forEach((block) => {
      if (block) {
        world.break(block.gridX, block.gridY);
        //Add to entity
        let part = {
          height: blockSize,
          width: blockSize,
          image: block.image,
          xOffset: (block.gridX - centreX) * blockSize,
          yOffset: (block.gridY - centreY) * blockSize,
        };
        ent.health += block.health;
        if (part.xOffset) ent.width += blockSize / 2;
        if (part.yOffset) ent.height += blockSize / 2;
        ent.components.push(part);
      }
    });
    ent.inventory = [];
    ent.name = "Tank";
    //Capabilities
    blocks.forEach((block) => {
      if (block instanceof Container) {
        ent.inventorySize += block.inventorySize;
        block.inventory.iterate((stack) => {
          if (stack.getItem() instanceof Weapon) {
            let itemwep = Registries.items.get(stack.item);
            let weapon = structuredClone(itemwep.component);
            weapon.xOffset = (block.gridX - centreX) * blockSize;
            weapon.yOffset = (block.gridY - centreY) * blockSize;
            weapon.type = "weaponised-component";
            weapon.weapon = itemwep;
            ent.attackRange = Math.max(ent.attackRange, itemwep.range ?? 0);
            ent.targetRange = Math.max(ent.targetRange, itemwep.range ?? 0);
            ent.components.push(weapon);
          } else {
            ent.inventory.push({
              item: stack.item,
              count: stack.count,
            });
            ent.inventorySize++;
          }
        }, true);
      }
      if (block instanceof Conveyor) ent.speed += 20 / block.moveTime;
      if (block instanceof SignBlock) ent.name = block.getMsg();
    });
    ent.addToWorld(
      world,
      centreX * blockSize + blockSize / 2,
      centreY * blockSize + blockSize / 2
    );
    ent.speed /= ent.components.length;
    ent.turnSpeed /= ent.components.length;
    ent.init();
    return ent;
  }
  tick() {
    super.tick();
    if (this.components.length === 0) this.dead = true;
  }
  attack() {
    this.components.forEach((x) => {
      if (x instanceof WeaponisedComponent) x.fire(this);
    });
  }
  serialise() {
    let e = super.serialise();
    e.components = this.components.map((x) => x.serialise());
    e.name = this.name;
    e.speed = this.baseSpeed;
    e.team = this.team;
    e.attackRange = this.attackRange;
    e.targetRange = this.targetRange;
    e.height = this.height;
    e.width = this.width;
    e.inventorySize = this.inventorySize;
    e.turnSpeed = this.turnSpeed;
    return e;
  }
  static applyExtraProps(ent, created) {
    super.applyExtraProps(ent, created);
    ent.speed = created.speed ?? 10;
    ent.name = created.name ?? "Entity";
    ent.team = created.team ?? "enemy";
    ent.attackRange = created.attackRange;
    ent.targetRange = created.targetRange;
    ent.height = created.height;
    ent.width = created.width;
    ent.inventorySize = created.inventorySize ?? 0;
    ent.turnSpeed = created.turnSpeed ?? 1;
    if (created.components) ent.components = created.components;
    ent.init();
    console.log(ent);
  }
}

export { ModularTankEntity };
