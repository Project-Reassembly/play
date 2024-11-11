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
        let index = row * itemsPerRow + item;
        let invitemstack = inventory[index];
        if (!invitemstack) invitemstack = ItemStack.EMPTY;
        if (!(invitemstack instanceof ItemStack))
          throw new TypeError(
            "Item " + index + "(" + invitemstack + ") is not an ItemStack!"
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
            if (
              this.mouseItemStack.item !== "nothing" &&
              this.mouseItemStack.item === invitemstack.item &&
              mouseIsPressed &&
              !ui.waitingForMouseUp
            ) {
              ui.waitingForMouseUp = true;
              if (invitemstack.count + this.mouseItemStack.count <= invitem.stackSize) {
                invitemstack.count += this.mouseItemStack.count;
                this.mouseItemStack = ItemStack.EMPTY;
              } else {
                let toMove = invitem.stackSize - invitemstack.count;
                invitemstack.count = invitem.stackSize;
                this.mouseItemStack.count -= toMove;
              }
            }
            this.tooltip = {
              item: invitem,
              count: invitemstack.count,
              stackSize: invitem.stackSize
            };
            noFill();
            stroke(0, 255, 255);
            strokeWeight(5);
            rect(displayX, displayY, itemSize, itemSize);
            if (selected && mouseIsPressed && !ui.waitingForMouseUp) {
              if (this.mouseItemStack.item === "nothing") {
                ui.waitingForMouseUp = true;
                if (ui.mouseButton === "left") {
                  this.mouseItemStack = inventory[index];
                  inventory[index] = ItemStack.EMPTY;
                } else if (ui.mouseButton === "right") {
                  this.mouseItemStack = new ItemStack(
                    invitemstack.item,
                    Math.ceil(invitemstack.count / 2)
                  );
                  invitemstack.count = Math.floor(invitemstack.count / 2);
                  if (invitemstack.count === 0) {
                    inventory[index] = ItemStack.EMPTY;
                  }
                }
              } else {
                ui.waitingForMouseUp = true;
                [this.mouseItemStack, inventory[index]] = [
                  inventory[index],
                  this.mouseItemStack,
                ];
              }
            }
          }
          drawImg(invitem.image, displayX, displayY, itemSize, itemSize);
          noStroke();
          fill((invitemstack.count > invitem.stackSize)?"red":255);
          textFont(fonts.ocr);
          textSize(20);
          push();
          textAlign(RIGHT, BASELINE);
          text(
            invitemstack.count,
            displayX + itemSize / 2,
            displayY + itemSize / 2
          );
          pop();
        } else {
          if (
            this.mouseItemStack.item !== "nothing" &&
            selected &&
            mouseIsPressed &&
            !ui.waitingForMouseUp
          ) {
            ui.waitingForMouseUp = true;
            inventory[index] = this.mouseItemStack;
            this.mouseItemStack = ItemStack.EMPTY;
          }
        }
        pop();
      }
    }
    if (this.mouseItemStack.item !== "nothing") {
      drawImg(
        this.mouseItemStack.getItem().image,
        ui.mouse.x,
        ui.mouse.y,
        itemSize,
        itemSize
      );
      noStroke();
      fill(this.mouseItemStack.count > this.mouseItemStack.getItem().stackSize?"red":255);
      textFont(fonts.ocr);
      textSize(20);
      push();
      textAlign(RIGHT, BASELINE);
      text(
        this.mouseItemStack.count,
        ui.mouse.x + itemSize / 2,
        ui.mouse.y + itemSize / 2
      );
      pop();
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
    let header = this.tooltip.item.name + " (" + this.tooltip.count + "/" + this.tooltip.stackSize + ")";
    let body = this.tooltip.item.description.split("\n");
    let descLines = this.tooltip.item.description.split("\n").length + 2;
    let lines = 2 + Math.ceil(descLines);
    let displayX = ui.mouse.x + maxWidth / 2;
    textSize(15);
    let displayY = ui.mouse.y + (lines * 12) / 2;
    if (displayY + lines * 6 > height / 2) {
      displayY = height / 2 - lines * 6;
    }
    rect(displayX, displayY, maxWidth, lines * 12);
    fill(Item.getColourFromRarity(this.tooltip.item.rarity, "dark"));
    noStroke();
    let textX = ui.mouse.x + 10;
    let textY = displayY - lines * 6 + 20;
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
  addItem(item, stack = true) {
    let i = 0;
    while (
      this.inventory[i] &&
      ((this.inventory[i]?.item !== item ||
        this.inventory[i].count >= this.inventory[i].getItem().stackSize) ||
        !stack) &&
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
  addItems(item, number, stack = true){
    for(let i = 0; i < number; i++){
      this.addItem(item, stack)
    }
  }
  autoStack(){
    let buffer = this.inventory.slice(0)
    this.inventory.splice(0)
    for(let item of buffer){
      if(!item) continue;
      if(item.item === "nothing") continue;
      this.addItems(item.item, item.count, true)
    }
  }
  cleanInventory(){
    for(let index = 0; index < this.inventory.length; index++){
      let item = this.inventory[index]
      if(item && item instanceof ItemStack && item.item === "nothing") delete this.inventory[index]
    }
  }
  sortByRegistryName(){
    this.cleanInventory()
    this.inventory.sort(dynamicSort("item"))
  }
  sortByCount(){
    this.cleanInventory()
    this.inventory.sort(dynamicSort("-count"))
  }
}

class EquippedEntity extends InventoryEntity {
  equipment = [];
  equipmentSize = 5;
  head = [];
  headSize = 1;
  rightHand = [];
  rightHandSize = 1;
  leftHand = [];
  leftHandSize = 1;
  body = [];
  bodySize = 1;

  draw() {
    for (let component of this.components) {
      component.draw(this.x, this.y, this.direction);
    }
  }
}
