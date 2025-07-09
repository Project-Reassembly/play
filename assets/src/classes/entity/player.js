import { rnd, tru } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { Log } from "../../play/messaging.js";
import { Timer } from "../timer.js";
import { EquippedEntity } from "./inventory-entity.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { Inventory } from "../inventory.js";
import { ui, UIComponent } from "../../core/ui.js";
import { autoScaledEffect } from "../../play/effects.js";
import { construct } from "../../core/constructor.js";
import { Direction } from "../../scaling.js";
export const respawnTimer = new Timer();

class Player extends EquippedEntity {
  respawnTime = 180;
  //internal assembler
  assemblyInventory = null;
  assemblySlots = 4;
  assemblyRecipes = [];
  craftEffect = "crafter-craft";
  tickEffectChance = 0.1;
  tickEffect = "crafter-smoke";
  _recipe = 0;
  #progress = 0;
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
    this.assemblyInventory = new Inventory(
      this.assemblySlots,
      this.assemblyInventory
    );
    this.assemblyRecipes.forEach((recipe) => {
      recipe.inputs = recipe.inputs.map((inp) => construct(inp, "itemstack"));
      recipe.outputs = recipe.outputs.map((inp) => construct(inp, "itemstack"));
    });
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
    this.#progress = 0;
  }
  tickRecipe(recipe, time) {
    //If items for recipe are present, and outputs fit
    if (
      this.assemblyInventory.hasItems(recipe.inputs) &&
      this.assemblyInventory.canAddItems(recipe.outputs)
    )
      if (this.#progress > time) {
        if (this.onFinish(recipe)) this.#progress = 0;
      } else {
        this.#progress += 1;
        this.createTickEffect();
        return true;
      }
    return false;
  }
  /**@param {Recipe} recipe  */
  onFinish(recipe) {
    this.assemblyInventory.removeItems(recipe.inputs);
    this.assemblyInventory.addItems(recipe.outputs);
    this.createCraftEffect();
    return true;
  }
  createCraftEffect() {
    autoScaledEffect(
      this.craftEffect,
      this.world,
      this.x,
      this.y,
      Direction.UP
    );
  }
  createTickEffect() {
    if (tru(this.tickEffectChance))
      autoScaledEffect(
        this.tickEffect,
        this.world,
        this.x,
        this.y,
        Direction.UP
      );
  }
  stringifyRecipe(recipe) {
    return (
      recipe.inputs.map((x) => x.toString(true)).join("\n") +
      "\n -  - -- \\⬇/ -- -  - \n" +
      recipe.outputs.map((x) => x.toString(true)).join("\n") +
      "\n" +
      ""
        .padEnd((this.#progress / recipe.time) * 20, "■")
        .padEnd(20, "□")
        .substring(0, 20) +
      " "
    );
  }
  getRecipeInfo() {
    return this.stringifyRecipe(this.assemblyRecipes[this._recipe]);
    //this.title + "   [" + this._recipe + "]"
  }

  tick() {
    super.tick();
    let recipe = this.assemblyRecipes[this._recipe];
    if (!recipe) {
      this.#progress = 0;
      this._recipe = 0;
      return;
    }
    this.tickRecipe(recipe, recipe.time);
  }

  //player shit

  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
    let messagearray = Registries.deathmsg.has(type)
      ? Registries.deathmsg.get(type)[source ? 1 : 0]
      : ["(1) died"];
    Log.send(
      (messagearray[Math.floor(rnd(0, messagearray.length))] ?? "(1) died")
        .replaceAll("(1)", this.name)
        .replaceAll("(2)", source?.name),
      [255, 0, 0]
    );
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      this.world,
      this.x,
      this.y,
      rnd(0, 360),
      3
    );
    Inventory.mouseItemStack.clear();
    respawnTimer.do(() => {
      ui.waitingForMouseUp = true;
      UIComponent.setCondition("dead:yes");
    }, this.respawnTime);
  }
  ai() {
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
