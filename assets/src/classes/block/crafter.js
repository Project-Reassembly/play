class Crafter extends Container {
  craftTime = 60;
  /** @type {Array<{input: ItemStack, output: ItemStack}>} */
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
  /*
  Recipes are like
  {
    input: {
      item: "sand",
      count: 4
    },
    output: {
      item: "sandstone-wall",
      count: 1
    }
  }
    */
  #progress = 0;
  #speed = 1;
  init() {
    super.init();
    this.inventorySize = 2;
    this.recipes.forEach((recipe) => {
      recipe.input = construct(recipe.input, "itemstack");
      recipe.output = construct(recipe.output, "itemstack");
    });
  }
  tick() {
    if (!this.inventory[0]) this.inventory[0] = ItemStack.EMPTY;
    if (!this.inventory[1]) this.inventory[1] = ItemStack.EMPTY;
    let recipe = this.getRecipe(this.inventory[0]);
    this.tickRecipe(recipe);
  }
  tickRecipe(recipe) {
    if (recipe) {
      //If a recipe exists
      if (this.inventory[1].stacksWith(recipe.output))
        if (this.#progress > this.craftTime) {
          this.#progress = 0;
          this.onFinish(recipe);
        } else {
          this.#progress += this.#speed;
        }
    } else {
      this.#progress = 0;
    }
  }
  onFinish(recipe) {
    this.inventory[0].count -= recipe.input.count;
    this.inventory[1].stack(recipe.output.copy());
    this.createCraftEffect();
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
   * Finds the first recipe with the given input.
   * @param {ItemStack} input Itemstack input.
   * @returns An ItemStack of the output.
   */
  getRecipe(input) {
    for (let recipe of this.recipes) {
      if (recipe.input.item === input.item && recipe.input.count <= input.count)
        return recipe;
    }
    return null;
  }
  /**
   * Fired when an entity interacts with this block.
   * @param {Entity} entity Interacting entity.
   * @param {ItemStack} usedItemStack Itemstack held while interacting.
   */
  interaction(entity, usedItemStack) {
    if (
      !this.inventory[1].isEmpty() &&
      this.inventory[1].stacksWith(usedItemStack)
    ) {
      usedItemStack.stack(this.inventory[1]);
    } else if (usedItemStack.stacksWith(this.inventory[0])) {
      this.inventory[0].stack(usedItemStack);
    }
    ui.waitingForMouseUp = true;
  }
  drawTooltip(
    x,
    y,
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {
    push();
    fill(...backgroundColour);
    stroke(...outlineColour);
    strokeWeight(5);
    rect(x, y, 140, 80);
    InventoryEntity.drawInventory(x - 30, y, this.inventory, 2, 1, null, 50);
    push();
    fill(255);
    noStroke();
    textSize(30);
    textFont(fonts.darktech);
    text(">", x, y + 10);
    pop();
    pop();
  }
}
