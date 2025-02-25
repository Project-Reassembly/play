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
  craftWave = {
    lifetime: 30,
    fromRadius: 0,
    toRadius: 100,
    colourFrom: [255, 200, 0, 255],
    colourTo: [255, 150, 0, 0],
    strokeFrom: 10,
    strokeTo: 0,
  };
  recipe = 0;
  outputSlots = [1];
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
  init() {
    super.init();
    this.recipes.forEach((recipe) => {
      recipe.inputs = recipe.inputs.map((inp) => construct(inp, "itemstack"));
      recipe.outputs = recipe.outputs.map((inp) => construct(inp, "itemstack"));
    });
    this.inventory.canPlaceInSlot = (slot) => !this.outputSlots.includes(slot);
  }
  tick() {
    let recipe = this.recipes[this.recipe];
    if (!this.inventory.hasItems(recipe.inputs, this.outputSlots)) return;
    this.tickRecipe(recipe, recipe.time);
  }
  /**
   * @param {Recipe} recipe
   */
  tickRecipe(recipe, time) {
    if (recipe) {
      //If a recipe exists, and will fit
      if (this.inventory.canAddItems(recipe.outputs))
        if (this.#progress > time) {
          if (this.onFinish(recipe)) this.#progress = 0;
        } else {
          this.#progress += this.#speed;
        }
    } else {
      this.#progress = 0;
    }
  }
  /**@param {Recipe} recipe  */
  onFinish(recipe) {
    this.inventory.addItems(recipe.outputs);
    this.inventory.removeItems(recipe.inputs);
    this.createCraftEffect();
    return true;
  }
  createCraftEffect() {
    let particle = new WaveParticle(
      this.x + Block.size / 2,
      this.y + Block.size / 2,
      this.craftWave.lifetime ?? 30,
      this.craftWave.fromRadius ?? 0,
      this.craftWave.toRadius ?? 100,
      this.craftWave.colourFrom ?? [255, 200, 0, 255],
      this.craftWave.colourTo ?? [255, 150, 0, 0],
      this.craftWave.strokeFrom ?? 10,
      this.craftWave.strokeTo ?? 0
    );
    this.chunk.world.particles.push(particle);
  }
  /**
   * Converts a recipe to a string representation.
   * **This is not a JSON stringifier, it it for human readability.**
   * @param {Recipe} recipe Recipe to be converted.
   */
  stringifyRecipe(recipe) {
    return (
      recipe.inputs.map((x) => x.toString(true)).join("\n") +
      "\n -  - -- \\/ -- -  - \n" +
      recipe.outputs.map((x) => x.toString(true)).join("\n")
    );
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    drawMultilineText(
      x,
      y,
      this.stringifyRecipe(this.recipes[this.recipe]),
      "Recipe [" + this.recipe + "]"
    );
  }
}
