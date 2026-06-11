import { construct, constructFromType } from "../../core/constructor.js";
import { rnd, tru, Vector } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { ui, UIComponent } from "../../core/ui.js";
import Integrate from "../../lib/integrate.js";
import { autoScaledEffect } from "../../play/effects.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction, totalSize } from "../../scaling.js";
import { Inventory } from "../inventory.js";
import { Accessory } from "../item/accessory.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { Bullet } from "../projectile/bullet.js";
import { getPatternedBulletExpulsion } from "../projectile/yeeter.js";
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
  punchChargeL = 0;
  punchChargingL = false;
  punchChargeR = 0;
  punchChargingR = false;
  chargePunchRight() {
    if (this.rightArmComponent._rotRecoiled === 0) {
      this.punchChargeR++;
      this.punchChargingR = true;
    }
  }
  chargePunchLeft() {
    if (this.leftArmComponent._rotRecoiled === 0) {
      this.punchChargeL++;
      this.punchChargingL = true;
    }
  }
  releasePunchLeft() {
    this._punchWith(this.leftArmComponent, this.punchChargeL);
    this.punchChargeL = 0;
    this.punchChargingL = false;
  }
  releasePunchRight() {
    this._punchWith(this.rightArmComponent, this.punchChargeR);
    this.punchChargeR = 0;
    this.punchChargingR = false;
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
  _punchWith(component, charge) {
    component.trigger();
    component.tick(this);
    const { x, y, direction } = this._posOf(component);
    this.punch(x, y, direction, charge);
  }
  _chargeEffectAt(component, charge) {
    const { x, y, direction } = this._chargePosOf(component);
    autoScaledEffect(
      charge > 90 ? "punch-charged"
      : charge === 90 ? "punch-charge-complete"
      : "punch-charge",
      this.world,
      x,
      y,
      direction,
    );
  }
  punch(x, y, direction, charge) {
    const charged = charge > 90;
    if (charged) {
      autoScaledEffect("charged-swing", this.world, x, y, direction);
    } else {
      autoScaledEffect("swing", this.world, x, y, direction);
    }

    /** @type {string?} */
    let type = charged ? "big-punch" : "punch";
    this.doToAccessories((i) => {
      const t = i.selectAtkType(this, charged);
      if (t) type = t;
    });

    /** @type {Integrate.Unconstructed<Bullet>} */
    const bul = typeof type === "object" ? type : Registries.small.punch_types.get(type).bullet;
    if (bul) {
      getPatternedBulletExpulsion(x, y, bul, 1, degrees(direction), 0, 0, this.world, this).forEach(
        (b) => {
          const oh = b.hitb;
          b.hitb = () => {
            this.doToAccessories((i) => i.atkPerformed(this, charged));
            oh.call(b);
          };
        },
      );
    }
  }
  /** @param {(v:Accessory, i:number, stop: () => void) => void} fn  */
  doToAccessories(fn) {
    this.equipment.iterate((stack, _, stop) => {
      const i = stack.getItem();
      if (i instanceof Accessory) fn(i, _, stop);
    });
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
    if (this.punchChargingR && this.punchChargeR > 20)
      this._chargeEffectAt(this.rightArmComponent, this.punchChargeR);
    if (this.punchChargingL && this.punchChargeL > 20)
      this._chargeEffectAt(this.leftArmComponent, this.punchChargeL);
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
      const v = Vector.ZERO;
      const accel = this.flying ? Math.cbrt(this.speed) / 5 : this.speed / 10;
      if (keyIsDown(87) && this.y > borders[1] /* Top */ + this.hitSize) {
        //If 'W' pressed
        v.addXY(0, -1, true);
        //this.move(0, -this.speed);
      }
      if (keyIsDown(83) && this.y < borders[3] /* Bottom */ - this.hitSize) {
        //If 'S' pressed
        v.addXY(0, 1, true);
      }
      if (keyIsDown(65) && this.x > borders[0] /* Left */ + this.hitSize) {
        //If 'A' pressed
        v.addXY(-1, 0, true);
      }
      if (keyIsDown(68) && this.x < borders[2] /* Right */ - this.hitSize) {
        //If 'D' pressed
        v.addXY(1, 0, true);
      }
      if (v.nonzero) this.velocity.add(v.normalise().scale(accel), true);
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

