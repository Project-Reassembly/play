class InventoryEntity extends Entity {
  inventory = [];
  inventorySize = 30;
  init() {
    super.init();
    this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
  static tooltip = {};
  static mouseItemStack = ItemStack.EMPTY;
  /**
   * Draws the items of an inventory.
   * @param {Array<ItemStack>} inventory Inventory to draw.
   * @param {*} rows Number of rows to draw it in.
   */
  static drawInventory(
    x,
    y,
    inventory,
    items = 30,
    rows = 5,
    cols = null,
    itemSize = 40,
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {
    this.tooltip = null;
    let itemsPerRow = cols ? cols : Math.ceil(items / rows);
    let itemRows = cols ? Math.ceil(items / cols) : rows;
    let displayX, displayY;
    //Images
    for (let row = 0; row < itemRows; row++) {
      for (let item = 0; item < itemsPerRow; item++) {
        let index = row * itemsPerRow + item
        let invitemstack = inventory[index];
        if (!invitemstack) invitemstack = ItemStack.EMPTY;
        if (!(invitemstack instanceof ItemStack))
          throw new TypeError(
            "Item " +
              (index) +
              "(" +
              invitemstack +
              ") is not an ItemStack!"
          );
        let invitem = invitemstack.getItem();
        displayX = x + item * (itemSize * 1.2);
        displayY = y + row * (itemSize * 1.2);
        push();
        stroke(...outlineColour);
        strokeWeight(5);
        fill(...backgroundColour);
        rect(displayX, displayY, itemSize, itemSize);
        let selected =
          ui.mouse.x < displayX + itemSize / 2 &&
          ui.mouse.x > displayX - itemSize / 2 &&
          ui.mouse.y < displayY + itemSize / 2 &&
          ui.mouse.y > displayY - itemSize / 2;
        if (invitemstack.item !== "nothing") {
          if (selected) {
            this.tooltip = {
              item: invitem,
              count: invitemstack.count,
            };
            noFill();
            stroke(0, 255, 255);
            strokeWeight(5)
            rect(displayX, displayY, itemSize, itemSize);
            if(selected && mouseIsPressed && !ui.waitingForMouseUp){
              ui.waitingForMouseUp = true
              this.mouseItemStack = inventory[index]
              inventory[index] = ItemStack.EMPTY
            }
          }
          drawImg(invitem.image, displayX, displayY, itemSize, itemSize);
          noStroke();
          fill(255);
          textFont(fonts.ocr);
          textSize(20);
          text(
            invitemstack.count,
            displayX + itemSize / 2 - textWidth(invitemstack.count),
            displayY + itemSize / 2
          );
        }
        else{
          if(this.mouseItemStack.item !== "nothing" && selected && mouseIsPressed && !ui.waitingForMouseUp){
            ui.waitingForMouseUp = true
            inventory[index] = this.mouseItemStack
            this.mouseItemStack = ItemStack.EMPTY
          }
        }
        pop();
      }
    }
    if(this.mouseItemStack.item !== "nothing"){
      drawImg(this.mouseItemStack.getItem().image, ui.mouse.x, ui.mouse.y, itemSize, itemSize);
    }
    this.drawTooltip(outlineColour, backgroundColour);
  }
  static drawTooltip(
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {
    if (!this?.tooltip?.item) return;
    push();
    textAlign(LEFT);
    textSize(20);
    let maxWidth = textWidth(
      this.tooltip.item.name + " (" + this.tooltip.count + ")"
    );
    let nameWidth = textWidth(this.tooltip.item.name);
    fill(...backgroundColour);
    strokeWeight(5);
    stroke(...outlineColour);
    let header = this.tooltip.item.name + " (" + this.tooltip.count + ")";
    let body = this.tooltip.item.description.split("\n");
    let descLines = this.tooltip.item.description.split("\n").length + 2;
    let lines = 2 + Math.ceil(descLines);
    let displayX = ui.mouse.x + maxWidth / 2;
    textSize(15);
    let displayY = ui.mouse.y + (lines * 12) / 2;
    rect(displayX, displayY, maxWidth, lines * 12);
    fill(Item.getColourFromRarity(this.tooltip.item.rarity, "dark"));
    noStroke();
    let textX = ui.mouse.x + 10;
    let textY = ui.mouse.y + 20;
    text(header, textX, textY);
    textSize(18);
    let start = 0;
    for (let line = 0; line < lines; line++) {
      textFont(fonts.ocr);
      text(body[line], textX, textY + 15 + line * 15);
      start = line * (nameWidth / textWidth("a"));
    }
    pop();
  }
  addItem(item) {
    let i = 0;
    while (
      this.inventory[i] &&
      this.inventory[i]?.item !== item &&
      this.inventory[i]?.item !== "nothing" &&
      i < this.inventorySize
    ) {
      i++;
    }
    if (this.inventory[i]?.item === "nothing") {
      this.inventory[i] = new ItemStack(item, 1);
    } else if (this.inventory[i] instanceof ItemStack) {
      this.inventory[i].count++;
    } else {
      this.inventory[i] = new ItemStack(item, 1);
    }
  }
}

class EquippedEntity extends InventoryEntity{
  equipment = []
  equipmentSize = 5
}