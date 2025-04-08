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
    this.recipes.forEach((recipe) => {
      recipe.inputs = recipe.inputs.map((inp) => construct(inp, "itemstack"));
      recipe.outputs = recipe.outputs.map((inp) => construct(inp, "itemstack"));
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
  /**
   * @param {Recipe} recipe
   */
  tickRecipe(recipe, time) {
    //If items for recipe are present, and outputs fit
    if (
      this.inventory.hasItems(recipe.inputs) &&
      this.inventory.canAddItems(recipe.outputs)
    )
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
    this.inventory.addItems(recipe.outputs);
    this.createCraftEffect();
    return true;
  }
  createCraftEffect() {
    autoScaledEffect(
      this.craftEffect,
      this.world,
      this.x + Block.size / 2,
      this.y + Block.size / 2,
      this.direction,
    );
  }
  createTickEffect() {
    if (tru(this.tickEffectChance))
      autoScaledEffect(
        this.tickEffect,
        this.world,
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        this.direction,
      );
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
    drawMultilineText(
      x,
      y,
      this.stringifyRecipe(this.recipes[this._recipe]),
      this.title + "   [" + this._recipe + "]",
      Item.getColourFromRarity(0, "light")
    );
  }
  serialise() {
    let b = super.serialise();
    b.recipe = this._recipe;
    return b;
  }
  /**
   * @param {Crafter} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised._recipe = creator.recipe;
  }
}

class Uncrafter extends Crafter {
  counterpart = "nothing";
  craftWave = {
    lifetime: 30,
    fromRadius: 100,
    toRadius: 0,
    colourFrom: [255, 150, 0, 0],
    colourTo: [255, 200, 0, 255],
    strokeFrom: 10,
    strokeTo: 0,
  };
  init() {
    this.recipes = (Registry.blocks.get(this.counterpart).recipes ?? []).map(
      (recipe) => ({
        outputs: recipe.inputs,
        inputs: recipe.outputs,
        time: recipe.time * 1.5,
      })
    );
    super.init();
  }
}
