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
  smoke = {
    lifetime: 60,
    speed: 1,
    decel: 0.015,
    colourFrom: [50, 50, 50, 100],
    colourTo: [100, 100, 100, 0],
    size: 20,
    cone: 10,
    amount: 1,
    chance: 0.1,
  };
  recipe = 0;
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
          this.createTickEffect();
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
  createTickEffect() {
    let particle = () =>
      new ShapeParticle(
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        -HALF_PI +
          radians(rnd(-(this.smoke.cone ?? 10), this.smoke.cone ?? 10)),
        this.smoke.lifetime ?? 60,
        this.smoke.speed ?? 1,
        this.smoke.decel ?? 0.015,
        "circle",
        this.smoke.colourFrom ?? [50, 50, 50, 100],
        this.smoke.colourTo ?? [100, 100, 100, 0],
        this.smoke.size ?? 20,
        (this.smoke.size ?? 20) * 1.5,
        this.smoke.size ?? 20,
        (this.smoke.size ?? 20) * 1.5,
        0
      );
    if (Math.random() < this.smoke.chance ?? 0.5)
      for (let i = 0; i < this.smoke.amount ?? 3; i++)
        this.chunk.world.particles.push(particle());
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
    super.drawTooltip(x, y, outlineColour, backgroundColour);
    drawMultilineText(
      x,
      y,
      this.stringifyRecipe(this.recipes[this.recipe]),
      this.title + "   [" + this.recipe + "]",
      Item.getColourFromRarity(0, "light")
    );
  }
}
