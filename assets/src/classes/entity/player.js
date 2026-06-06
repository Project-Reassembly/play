import { construct, constructFromType } from "../../core/constructor.js";
import { rnd, tru } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { ui, UIComponent } from "../../core/ui.js";
import Integrate from "../../lib/integrate.js";
import { autoScaledEffect } from "../../play/effects.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction, totalSize } from "../../scaling.js";
import { Inventory } from "../inventory.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { Bullet } from "../projectile/bullet.js";
import { patternedBulletExpulsion } from "../projectile/yeeter.js";
import { Timer } from "../timer.js";
import { WeaponComponent } from "./component.js";
import { EquippedEntity } from "./inventory-entity.js";
export const respawnTimer = new Timer();

/** Equipped entity with an assembler, and f i s t s. */
class Player extends EquippedEntity {
  respawnTime = 180;
  //internal assembler
  assemblyInventory = null;
  assemblyResult = null;
  assemblySlots = 4;
  /**@type {import("../block/production/crafter.js").Recipe[]} */
  assemblyRecipes = [];
  craftEffect = "crafter-craft";
  tickEffectChance = 0.1;
  tickEffect = "crafter-smoke";
  _recipe = 0;
  _progress = 0;
  _maxprog = 0;

  /** @type {WeaponComponent} */
  leftArmComponent;
  /** @type {WeaponComponent} */
  rightArmComponent;
  /*
  Recipes are like
  {
    inputs: [
      {
        item: "sand",
        count: 4
      }
    ],
    outputs: [
      {
        item: "sandstone-wall",
        count: 1
      }
    ],
    time: 60
  }
    just like normal crafters
    */
  init() {
    super.init();
    if (this.assemblySlots !== 0) {
      this.assemblyInventory = new Inventory(this.assemblySlots, this.assemblyInventory);
      this.assemblyResult = new Inventory(1, this.assemblyResult);
      this.assemblyRecipes.forEach((recipe) => {
        recipe.inputs = recipe.inputs.map((inp) => constructFromType(inp, ItemStack));
        recipe.outputs = recipe.outputs.map((inp) => constructFromType(inp, ItemStack));
      });
      this._maxprog = this.assemblyRecipes[this._recipe]?.time ?? 0;
    }
    this.leftArmComponent = construct(
      Object.assign(this.armType, {
        type: "weapon-component",
        recoil: 0.2,
        rotationalRecoil: -60,
        recoilSpeed: 4,
      }),
      "weapon-component",
    );
    this.rightArmComponent = construct(
      Object.assign(this.armType, {
        type: "weapon-component",
        recoil: 0.2,
        rotationalRecoil: -60,
        recoilSpeed: 4,
      }),
      "weapon-component",
    );
  }
  punchHand = "left";
  punchCharge = 0;
  punchCharging = false;
  chargePunchRight() {
    if (this.rightArmComponent._rotRecoiled === 0) {
      if (this.punchHand !== "right") this.punchCharge = 0;
      this.punchHand = "right";
      this.punchCharge++;
      this.punchCharging = true;
    }
  }
  chargePunchLeft() {
    if (this.leftArmComponent._rotRecoiled === 0) {
      if (this.punchHand !== "left") this.punchCharge = 0;
      this.punchHand = "left";
      this.punchCharge++;
      this.punchCharging = true;
    }
  }
  releasePunch() {
    this._punchWith(this.punchHand === "left" ? this.leftArmComponent : this.rightArmComponent);
    this.punchCharging = false;
  }
  _posOf(component) {
    let pos = component.getPosOn(this);
    pos.x += Math.cos(pos.direction) * -5;
    pos.x -= Math.cos(this.directionRad) * 10;
    pos.y += Math.sin(pos.direction) * -5;
    pos.y -= Math.sin(this.directionRad) * 10;
    return pos;
  }
  _chargePosOf(component) {
    let pos = component.getPosOn(this);
    const m = component === this.leftArmComponent;
    // pos.x += Math.cos(pos.direction) * -5;
    // pos.x += Math.sin(pos.direction) * (m ? 10 : -10);
    pos.x -= Math.cos(this.directionRad) * 10;
    // pos.y += Math.sin(pos.direction) * -5;
    // pos.y += Math.cos(pos.direction) * (m ? 10 : -10);
    pos.y -= Math.sin(this.directionRad) * 10;
    return pos;
  }
  _punchWith(component) {
    component.trigger();
    component.tick(this);
    const { x, y, direction } = this._posOf(component);
    this.punch(x, y, direction, this.punchCharge);
    this.punchCharge = 0;
  }
  _chargeEffectAt(component) {
    const { x, y, direction } = this._chargePosOf(component);
    autoScaledEffect(
      this.punchCharge > 90 ? "punch-charged"
      : this.punchCharge === 90 ? "punch-charge-complete"
      : "punch-charge",
      this.world,
      x,
      y,
      direction,
    );
  }
  punch(x, y, direction, charge) {
    if (charge > 90) {
      autoScaledEffect("charged-swing", this.world, x, y, direction);
      /** @type {Integrate.Unconstructed<Bullet>} */
      const bul = {
        hitEffect: "big-punch",
        speed: 5,
        lifetime: 2,
        hitSize: 10,
        knockback: 50,
        damage: [{ amount: 5, type: "impact" }],
        despawnEffect: "none",
        drawer: { hidden: true },
        hitNumber: 1,
        hitBullet: {
          spawnNumber: 1,
          spawnBullet: {
            speed: 0,
            lifetime: 0,
            drawer: { hidden: true },
            damage: [{ amount: 2, type: "impact", radius: 25, knockback: 1500 }],
          },
          turnSpeed: 360,
          targetType: "hovered",
          trackingRange: 60,
          hitEffect: "punch",
          speed: 5,
          lifetime: 9,
          extraUpdates: 1,
          hitSize: 10,
          knockback: 30,
          damage: [{ amount: 2, type: "impact" }],
          despawnEffect: "none",
          drawer: { hidden: true },
          hitNumber: 1,
          trail: true,
          trailEffect: "charged-punch-trail",
          hitBullet: {
            turnSpeed: 360,
            targetType: "hovered",
            trackingRange: 30,
            hitEffect: "punch",
            speed: 5,
            lifetime: 7,
            extraUpdates: 1,
            hitSize: 10,
            knockback: 20,
            damage: [{ amount: 2, type: "impact" }],
            despawnEffect: "none",
            drawer: { hidden: true },
            hitNumber: 1,
            trail: true,
            trailEffect: "charged-punch-trail",
            hitBullet: {
              turnSpeed: 360,
              targetType: "hovered",
              trackingRange: 30,
              hitEffect: "punch",
              speed: 5,
              lifetime: 5,
              hitSize: 10,
              knockback: 10,
              damage: [{ amount: 1, type: "impact" }],
              despawnEffect: "none",
              trail: true,
              trailEffect: "charged-punch-trail",
              drawer: { hidden: true },
            },
          },
        },
      };
      patternedBulletExpulsion(x, y, bul, 1, degrees(direction), 0, 0, this.world, this);
    } else {
      autoScaledEffect("swing", this.world, x, y, direction);
      /** @type {Integrate.Unconstructed<Bullet>} */
      const bul = {
        hitEffect: "punch",
        speed: 1,
        lifetime: 5,
        hitSize: 10,
        knockback: 20,
        damage: [{ amount: 1, type: "impact" }],
        despawnEffect: "none",
        drawer: { hidden: true },
      };
      patternedBulletExpulsion(x, y, bul, 1, degrees(direction), 0, 0, this.world, this);
    }
  }
  drawArms() {
    let left = this.leftHand.get(0)?.getItem();
    if (!left || left?.showArm) this.leftArmComponent.draw(this.x, this.y, this.direction, true);
    if (left?.component)
      left.component.draw(
        this.x,
        this.y,
        this.direction,
        true,
        this.armType.xOffset,
        this.armType.yOffset,
      );

    let right = this.rightHand.get(0)?.getItem();
    if (!right || right?.showArm) this.rightArmComponent.draw(this.x, this.y, this.direction);
    if (right?.component)
      right.component.draw(
        this.x,
        this.y,
        this.direction,
        false,
        this.armType.xOffset,
        this.armType.yOffset,
      );
  }

  nextRecipe() {
    this.changeRecipe(this._recipe + 1);
    if (this._recipe >= this.assemblyRecipes.length) this._recipe = 0;
  }
  prevRecipe() {
    this.changeRecipe(this._recipe - 1);
    if (this._recipe < 0) this._recipe = this.assemblyRecipes.length - 1;
  }
  changeRecipe(index) {
    if (index != null) this._recipe = index;
    //Reset progress
    this._progress = 0;
    this._maxprog = this.assemblyRecipes[this._recipe]?.time ?? 0;
  }
  tickRecipe(recipe, time) {
    //If items for recipe are present, and outputs fit
    if (
      this.assemblyInventory.hasItems(recipe.inputs) &&
      this.assemblyResult.canAddItems(recipe.outputs)
    )
      if (this._progress > time) {
        if (this.onFinish(recipe)) this._progress = 0;
      } else {
        this._progress += 1;
        this.createTickEffect();
        return true;
      }
    return false;
  }
  /**@param {Recipe} recipe  */
  onFinish(recipe) {
    this.assemblyInventory.removeItems(recipe.inputs);
    this.assemblyResult.addItems(recipe.outputs);
    this.createCraftEffect();
    return true;
  }
  createCraftEffect() {
    autoScaledEffect(this.craftEffect, this.world, this.x, this.y, Direction.UP);
  }
  createTickEffect() {
    if (tru(this.tickEffectChance))
      autoScaledEffect(this.tickEffect, this.world, this.x, this.y, Direction.UP);
  }
  stringifyRecipe(recipe) {
    return `${recipe.inputs.map((x) => x.toString(true)).join("\n")}\n -  - -- \\⬇/ -- -  - \n${recipe.outputs.map((x) => x.toString(true)).join("\n")}\n`;
  }
  getRecipeInfo() {
    return this.assemblyRecipes.length > 0 ?
        this.stringifyRecipe(this.assemblyRecipes[this._recipe])
      : "Assembler\nNot available";
    //this.title + "   [" + this._recipe + "]"
  }

  tick() {
    super.tick();
    this.leftArmComponent.tick(this);
    this.rightArmComponent.tick(this);
    if (this.punchCharging && this.punchCharge > 20)
      this._chargeEffectAt(
        this.punchHand === "left" ? this.leftArmComponent : this.rightArmComponent,
      );
    if (this.assemblyRecipes.length > 0) {
      let recipe = this.assemblyRecipes[this._recipe];
      if (!recipe) {
        this._progress = 0;
        this._recipe = 0;
        return;
      }
      this.tickRecipe(recipe, recipe.time);
    }
  }

  //player shit

  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
    let messagearray =
      Registries.deathmsg.has(type) ? Registries.deathmsg.get(type)[source ? 1 : 0] : ["(1) died"];
    Log.send(
      `#4-${(messagearray[Math.floor(rnd.float(0, messagearray.length))] ?? "(1) died")
        .replaceAll("(1)", this.name)
        .replaceAll("(2)", source?.name)}`,
    );
    console.log(source);
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      this.world,
      this.x,
      this.y,
      rnd.float(0, 360),
      3,
    );
    Inventory.mouseItemStack.clear();
    respawnTimer.do(() => {
      ui.waitingForMouseUp = true;
      UIComponent.setCondition("dead:yes");
    }, this.respawnTime);
  }
  doAI() {
    if (this.target) {
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
    const borders = [
      -blockSize * 0.5,
      -blockSize * 0.5,
      totalSize - blockSize * 0.5,
      totalSize - blockSize * 0.5,
    ];

    if (this.controllable) {
      if (keyIsDown(87) && this.y > borders[1] /* Top */ + this.hitSize) {
        //If 'W' pressed
        this.move(0, -this.speed);
      }
      if (keyIsDown(83) && this.y < borders[3] /* Bottom */ - this.hitSize) {
        //If 'S' pressed
        this.move(0, this.speed);
      }
      if (keyIsDown(65) && this.x > borders[0] /* Left */ + this.hitSize) {
        //If 'A' pressed
        this.move(-this.speed, 0);
      }
      if (keyIsDown(68) && this.x < borders[2] /* Right */ - this.hitSize) {
        //If 'D' pressed
        this.move(this.speed, 0);
      }
    }
  }
  serialise() {
    let e = super.serialise();
    e.assinv = this.assemblyInventory.serialise();
    return e;
  }
  static applyExtraProps(entity, created) {
    super.applyExtraProps(entity, created);
    entity.assemblyInventory = Inventory.deserialise(created.assinv);
  }
}
export { Player };

