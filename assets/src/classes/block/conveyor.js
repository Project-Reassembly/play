class Conveyor extends Container {
  moveTime = 10;
  _progress = 0;
  rotatable = true;
  inventorySize = 1;
  selectable = false;
  shape = "straight";
  baseImg = "error";
  beltImg = "error";
  tick() {
    super.tick();
    if (!this.inventory.get(0) || this.inventory.get(0).isEmpty()) return;
    let vct = Block.direction.vectorOf(this.direction);
    let target = this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y);
    this.convey(target, this.gridX + vct.x, this.gridY + vct.y);
  }
  convey(target, posX, posY) {
    if (this._progress < this.moveTime) this._progress++;
    if (this._progress >= this.moveTime) {
      if (!target) {
        new DroppedItemStack(this.inventory.get(0)).addToWorld(
          this.world,
          (posX + 0.5) * Block.size,
          (posY + 0.5) * Block.size
        );
        this.inventory.clear();
        this._progress = 0;
      }
      if (
        target instanceof Container &&
        target.inventory.canAddItems([this.inventory.get(0)])
      ) {
        this._progress = 0;
        target.inventory.addItems([this.inventory.get(0)]);
        if (target instanceof Conveyor && this.direction !== target.direction) {
          target._progress = target.moveTime / 2;
        }
        this.inventory.clear();
      }
    }
  }
  draw() {
    drawImg(
      this.baseImg,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
    rotatedImg(
      this.beltImg,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size,
      this.direction
    );
  }
  postDraw() {
    let vct = Block.direction.vectorOf(this.direction);
    let amt = this._progress / this.moveTime;
    if (this.inventory.get(0) && !this.inventory.get(0).isEmpty()) {
      if (this.shape === "straight")
        drawImg(
          this.inventory.get(0).getItem().image,
          this.x + vct.x * (amt - 0.5) * Block.size,
          this.y + vct.y * (amt - 0.5) * Block.size,
          20,
          20
        );
    }
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour);
    drawMultilineText(
      x,
      y,
      ""
        .padEnd((this._progress / this.moveTime) * 10, "■")
        .padEnd(10, "□")
        .substring(0, 10) + " ",
      this.title,
      Item.getColourFromRarity(0, "light")
    );
  }
}

class Unloader extends Conveyor {
  filter = "nothing";
  tick() {
    let vct = Block.direction.vectorOf(this.direction);
    let extractFrom = this.world.getBlock(
      this.gridX - vct.x,
      this.gridY - vct.y
    );
    if (extractFrom instanceof Container) {
      if (
        extractFrom.inventory.hasItem(this.filter) &&
        this.inventory.canAddItem(this.filter)
      ) {
        extractFrom.inventory.removeItem(this.filter);
        this.inventory.addItem(this.filter);
      }
    }
    super.tick();
  }
  /**
   *
   * @param {Entity} ent
   * @param {ItemStack} stack
   * @returns
   */
  interaction(ent, stack = ItemStack.EMPTY) {
    this.filter = stack.item;
    if (stack.getItem()) Log.send("Set filter to " + stack.getItem()?.name);
    else Log.send("Cleared filter.");
    ui.waitingForMouseUp = true;
    return true;
  }
}
