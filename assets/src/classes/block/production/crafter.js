import { col } from "../../../core/color.js";
import { constructFromType } from "../../../core/constructor.js";
import * as MLF1 from "../../../core/mlf1.js";
import { roundNum, tru } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import { rotatedImg } from "../../../core/ui.js";
import { Direction } from "../../../scaling.js";
import { Inventory } from "../../inventory.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import { ItemStack } from "../../item/item-stack.js";
import { Item } from "../../item/item.js";
import { Container } from "../container.js";
/**
 * @typedef {Object} Recipe A definition for a crafting recipe.
 * @property {ItemStack[]} inputs Array of input itemstacks
 * @property {ItemStack[]} outputs Array of output itemstacks
 * @prop {int} time Number of frames to complete this recipe.
 */
/** */
class Crafter extends Container {
  /** @type {Recipe[]} */
  recipes = [];
  craftEffect = "crafter-craft";
  tickEffectChance = 0.1;
  tickEffect = "crafter-smoke";
  _recipe = 0;
  /**@type {Inventory} */
  results = null;
  resultSize = 1;
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
    */
  #progress = 0;
  #speed = 1;
  changeRecipe(index) {
    if (index != null) this._recipe = index;
    //Reset progress
    this.#progress = 0;
  }
  init() {
    super.init();
    this.results = new Inventory(this.resultSize);
    this.recipes.forEach((recipe) => {
      recipe.inputs = recipe.inputs.map((inp) => constructFromType(inp, ItemStack));
      recipe.outputs = recipe.outputs.map((inp) => constructFromType(inp, ItemStack));
    });
  }
  rightArrow() {
    this.changeRecipe(this._recipe + 1);
    if (this._recipe >= this.recipes.length) this._recipe = 0;
  }
  leftArrow() {
    this.changeRecipe(this._recipe - 1);
    if (this._recipe < 0) this._recipe = this.recipes.length - 1;
  }
  tick() {
    super.tick();
    let recipe = this.recipes[this._recipe];
    if (!recipe) {
      this.#progress = 0;
      this._recipe = 0;
      return;
    }
    this.tickRecipe(recipe, recipe.time);
  }
  break(type) {
    if (super.break(type))
      this.results.iterate((stack) => {
        DroppedItemStack.create(stack, this.world, this.x, this.y);
      }, true);
    return true;
  }
  /**
   * @param {Recipe} recipe
   */
  tickRecipe(recipe, time) {
    //If items for recipe are present, and outputs fit
    if (this.inventory.hasItems(recipe.inputs) && this.results.canAddItems(recipe.outputs))
      if (this.#progress > time) {
        if (this.onFinish(recipe)) this.#progress = 0;
      } else {
        this.#progress += this.#speed;
        this.createTickEffect();
        return true;
      }
    return false;
  }
  /**@param {Recipe} recipe  */
  onFinish(recipe) {
    this.inventory.removeItems(recipe.inputs);
    this.results.addItems(recipe.outputs);
    this.emit(this.craftEffect);
    return true;
  }
  createTickEffect() {
    if (tru(this.tickEffectChance)) this.emit(this.tickEffect);
  }
  /**
   * Converts a recipe to a string representation.
   * **This is not a JSON stringifier, it it for human readability.**
   * @param {Recipe} recipe Recipe to be converted.
   */
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
  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    rotatedImg("icon.arrow", x + this.inventory.size * 38, y - 17, 20, 20, Direction.RIGHT);
    this.results.draw(
      x + 33 + this.inventory.size * 38,
      y - 17,
      null,
      6,
      30,
      outlineColour,
      backgroundColour,
      true,
    );
    MLF1.draw(
      x,
      y,
      this.stringifyRecipe(this.recipes[this._recipe]),
      this.title + "   [" + this._recipe + "]",
      Item.getColourFromRarity(0, "light"),
    );
  }
  serialise() {
    let b = super.serialise();
    b.recipe = this._recipe;
    b.result = this.results.serialise();
    return b;
  }
  /**
   * @param {Crafter} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised._recipe = creator.recipe;
    deserialised.results = Inventory.deserialise(creator.result);
  }

  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      "Recipes:",
      ...this.recipes.map(
        (rec) =>
          "  " +
          rec.inputs.map((stack) => stack.count + "× " + stack.getItem().name).join(", ") +
          " => " +
          rec.outputs.map((stack) => stack.count + "× " + stack.getItem().name).join(", ") +
          " (" +
          roundNum(rec.time / 60, 1) +
          "s)",
      ),
      "🟨 -------------------- ⬜",
    ];
  }
}

class Uncrafter extends Crafter {
  counterpart = "nothing";
  craftWave = {
    lifetime: 30,
    fromRadius: 100,
    toRadius: 0,
    colourFrom: col.from(255, 150, 0, 0),
    colourTo: col.from(255, 200, 0, 255),
    strokeFrom: 10,
    strokeTo: 0,
  };
  init() {
    this.recipes = (Registries.blocks.get(this.counterpart).recipes ?? []).map((recipe) => ({
      outputs: recipe.inputs,
      inputs: recipe.outputs,
      time: recipe.time * 1.5,
    }));
    super.init();
  }
}
export { Crafter, Uncrafter };

