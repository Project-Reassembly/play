import { constructFromType } from "../../core/constructor.js";
import { rnd, tru } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { ui, UIComponent } from "../../core/ui.js";
import { autoScaledEffect } from "../../play/effects.js";
import { Log } from "../../play/messaging.js";
import { Direction } from "../../scaling.js";
import { Inventory } from "../inventory.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { Timer } from "../timer.js";
import { EquippedEntity } from "./inventory-entity.js";
export const respawnTimer = new Timer();

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
    return (
      recipe.inputs.map((x) => x.toString(true)).join("\n") +
      "\n -  - -- \\⬇/ -- -  - \n" +
      recipe.outputs.map((x) => x.toString(true)).join("\n") +
      "\n"
    );
  }
  getRecipeInfo() {
    return this.assemblyRecipes.length > 0 ?
        this.stringifyRecipe(this.assemblyRecipes[this._recipe])
      : "Assembler\nNot available";
    //this.title + "   [" + this._recipe + "]"
  }

  tick() {
    super.tick();
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
      "#4-" +
        (messagearray[Math.floor(rnd.float(0, messagearray.length))] ?? "(1) died")
          .replaceAll("(1)", this.name)
          .replaceAll("(2)", source?.name),
    );
    console.log(source)
    DroppedItemStack.create(Inventory.mouseItemStack, this.world, this.x, this.y, rnd.float(0, 360), 3);
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

