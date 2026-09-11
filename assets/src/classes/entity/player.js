import { col } from "../../core/color.js";
import { construct, constructFromType } from "../../core/constructor.js";
import { rnd, roundNum, tru, Vector } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { ui, UIComponent } from "../../core/ui.js";
import { discoverable, discovered } from "../../definitions/screens/database.js";
import { autoScaledEffect } from "../../play/effects.js";
import { game } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction, totalSize } from "../../scaling.js";
import { Inventory } from "../inventory.js";
import { Accessory } from "../item/accessory.js";
import { Corporation } from "../item/corporation.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { BulletModel } from "../projectile/bullet-model.js";
import { Timer } from "../timer.js";
import { undeliverEntity } from "../world/events/event-action.js";
import { WeaponComponent } from "./entity-part.js";
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
  assemblerPowerUse = 1.6666666667;
  craftEffect = "crafter-craft";
  tickEffectChance = 0.1;
  tickEffect = "crafter-smoke";
  _recipe = 0;
  _progress = 0;
  _maxprog = 0;

  //nrg
  power = 50000;
  maxPower = 50000;

  emergencyPower = 1000;
  maxEmergencyPower = 1000;

  /** @type {WeaponComponent} */
  leftArmComponent;
  /** @type {WeaponComponent} */
  rightArmComponent;

  passivePowerUse = 0.2314814815; // one hour default play time until problems
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
    this.maxPower = this.power;
    this.maxEmergencyPower = this.emergencyPower;
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
    this.punchChargingL = false;
    let c = this.punchChargeL;
    this.punchChargeL = 0;
    this._punchWith(this.leftArmComponent, c);
  }
  releasePunchRight() {
    this.punchChargingR = false;
    let c = this.punchChargeR;
    this.punchChargeR = 0;
    this._punchWith(this.rightArmComponent, c);
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

    /** @type {{name:string, description:string, bullet:string}} */
    const bul = typeof type === "object" ? type : Registries.small.punch_types.get(type);
    if (bul) {
      /** @type {BulletModel} */
      const model = Registries.bullets.get(bul.bullet);
      model.emit(x, y, 1, degrees(direction), 0, 0, this.world, this).forEach((b) => {
        const oh = b.hitex;
        b.hitex = (obj) => {
          this.doToAccessories((i) => i.atkPerformed(this, charged));
          oh.call(b, obj);
        };
      });
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
        if (this.power > this.assemblerPowerUse) {
          this.power -= this.assemblerPowerUse;

          this._progress += 1;
          this.createTickEffect();
          return true;
        } else this.power = 0;
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
  deactivated = false;
  tick() {
    if (this.deactivated) {
      if (this.power && this.emergencyPower < this.maxEmergencyPower) {
        const reserve = Math.min(this.power, this.maxEmergencyPower - this.emergencyPower);

        this.emergencyPower += reserve;
        this.power -= reserve;
      } else if (this.emergencyPower >= this.maxEmergencyPower) {
        undeliverEntity(this);
      }
      return;
    }

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

    if (this.power >= this.passivePowerUse) {
      this.power -= this.passivePowerUse;
    } else if (this.emergencyPower >= this.passivePowerUse) {
      this.power = 0;
      this.emergencyPower -= this.passivePowerUse;
    } else {
      this.deactivated = true;
      this.controllable = false;
      respawnTimer.do(() => {
        ui.waitingForMouseUp = true;
        UIComponent.setCondition("dead", "yes");
      }, this.respawnTime);

      Log.send(
        `#4-${(rnd.in(Registries.deathmsg.tryGet("power-off")[0]) ?? "(1) died").replaceAll(
          "(1)",
          this.name,
        )}`,
      );
    }

    if (this.power && this.emergencyPower < this.maxEmergencyPower) {
      const reserve = Math.min(this.power * 0.1, this.maxEmergencyPower - this.emergencyPower);

      this.emergencyPower += reserve;
      this.power -= reserve;
    }
    if (this.age % 60 === 0) this.tickDiscovery();
  }

  postDraw() {
    super.postDraw();

    if (this.deactivated) {
      push();
      fill(255, 0, 0);
      stroke(255, 0, 0);
      strokeWeight(1);
      textAlign(CENTER, CENTER);
      textSize(20);
      text("Out of Power", this.x, this.y - 25);
      strokeWeight(4);
      line(this.x - 12, this.y - 12, this.x + 12, this.y + 12);
      line(this.x - 12, this.y + 12, this.x + 12, this.y - 12);

      textSize(10);
      strokeWeight(0.5);
      text("Recharge to remove", this.x, this.y + 20);
      rectMode(CORNER);
      stroke(0);
      strokeWeight(1);
      fill(0);
      rect(this.x - this.width, this.y + this.height * 0.5 + 15, this.width * 2, 5);
      col.fill(
        col.interp([col.red, col.yellow, col.green], this.emergencyPower / this.maxEmergencyPower),
      );
      noStroke();
      rect(
        this.x - this.width,
        this.y + this.height * 0.5 + 15,
        (this.width * 2 * this.emergencyPower) / this.maxEmergencyPower,
        5,
      );
      pop();
    }
  }

  //player shit

  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);

    if (!this.deactivated) {
      let dm = Registries.deathmsg.tryGet(type);
      let messagearray = dm ? dm[source ? 1 : 0] : ["(1) died"];
      Log.send(
        `#4-${(rnd.in(messagearray) ?? "(1) died")
          .replaceAll("(1)", this.name)
          .replaceAll("(2)", source?.name)}`,
      );
      if (game.player.entity === this)
        respawnTimer.do(() => {
          ui.waitingForMouseUp = true;
          UIComponent.setCondition("dead", "yes");
        }, this.respawnTime);
    }
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      this.world,
      this.x,
      this.y,
      rnd.float(0, 360),
      3,
    );
    Inventory.mouseItemStack.clear();
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
    if (this.controllable && ui.conditions.fc == "false") {
      const v = Vector.ZERO;
      const accel = this.flying ? Math.cbrt(this.speed) / 5 : this.speed / 10;
      if (keyIsDown(87) && this.y > borders[1] /* Top */ + this.hitSize) {
        //If 'W' pressed
        v.y -= 1;
        //this.move(0, -this.speed);
      }
      if (keyIsDown(83) && this.y < borders[3] /* Bottom */ - this.hitSize) {
        //If 'S' pressed
        v.y += 1;
      }
      if (keyIsDown(65) && this.x > borders[0] /* Left */ + this.hitSize) {
        //If 'A' pressed
        v.x -= 1;
      }
      if (keyIsDown(68) && this.x < borders[2] /* Right */ - this.hitSize) {
        //If 'D' pressed
        v.x += 1;
      }
      if (v.nonzero) this.velocity.add(v.normalise().scale(accel), true);
    }
  }
  serialise() {
    let e = super.serialise();
    e.assinv = this.assemblyInventory.serialise();
    e.power = roundNum(this.power);
    e.energy = roundNum(this.emergencyPower);
    return e;
  }
  /** @param {typeof Player.prototype.serialise extends () => infer R ? R : never} created  */
  static applyExtraProps(entity, created) {
    super.applyExtraProps(entity, created);
    entity.power = created.power ?? entity.maxPower;
    entity.emergencyPower = created.energy ?? entity.emergencyPower;
    entity.assemblyInventory = Inventory.deserialise(created.assinv);
  }

  tickDiscovery() {
    this.inventories.forEach((inv) =>
      inv.iterate((stack) => {
        if (discoverable.all.has(stack.item) && !discovered.all.has(stack.item)) {
          discovered.discover(stack.item);
          const corp = stack.getItem().corp;
          const found = discovered.collections.get(corp)?.length ?? 0;
          const total = discoverable.collections.get(corp)?.length ?? 0;
          const complete = found === total;
          const c =
            complete ? col.cyan : col.interp([col.red, col.yellow, col.green], found / (total + 1));
          Log.send(
            `#>>icon.database#=-Discovered #[${corp}]b${stack.getItem().name}#=- (${Corporation.aliasof(corp) || "generic"}#=- collection, ${complete ? "#[0x30ffff]*complete" : `#[0x${col.hex(c)}]b${found}/${total}`}#=-)`,
          );
        }
      }, true),
    );
  }
}
export { Player };

