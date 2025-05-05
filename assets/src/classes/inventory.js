import { ItemStack } from "../classes/item/item-stack.js";
import { Registries } from "../core/registry.js";
import { construct } from "../core/constructor.js";
import { drawImg, ui } from "../core/ui.js";
import { fonts } from "../play/game.js";
import { Item } from "./item/item.js";
import { dynamicSort } from "../core/number.js";
/**
 * @typedef SerialisedInventory
 * @prop {SerialisedItemStack[]} storage
 * @prop {int} size
 */
/** */
class Inventory {
  /** @type {Array<ItemStack>} */
  storage = [];
  size = 30;
  constructor(size, stacks = []) {
    stacks ??= [];
    this.size = size;
    this.storage = stacks.map((x) => construct(x, "itemstack"));
    this.storage.length = this.size;
  }
  /**@returns {SerialisedInventory} */
  serialise() {
    return {
      size: this.size,
      storage: this.storage.map((x) => x.serialise()),
    };
  }
  /**@param {SerialisedInventory} created  */
  static deserialise(created) {
    let inv = new this(0);
    inv.storage = created.storage ?? [];
    inv.size = inv.storage.length = created.size ?? inv.size;
    if (created.storage)
      inv.storage = created.storage.map((x) => ItemStack.deserialise(x));
    return inv;
  }

  //Manipulation
  addItem(item, number = 1, stack = true) {
    let toAdd = number;
    /**@type {Item} */
    let ritem = construct(Registries.items.get(item), "item");
    //Check for any stacks that can be filled
    this.iterate((content, slot, stop) => {
      if (content.item === item && stack && this.canPlaceInSlot(slot)) {
        if (content.count < ritem.stackSize) {
          let space = ritem.stackSize - content.count;
          if (space < toAdd) {
            content.count = ritem.stackSize;
            toAdd -= space;
          } else {
            content.count += toAdd;
            toAdd = 0;
            stop();
          }
        }
      }
    }, true);
    //If there are still items to add, add them to empty slots
    if (toAdd <= 0) return 0;
    this.iterate((content, slot, stop) => {
      if (!content) this.storage[slot] = ItemStack.EMPTY;
      if (content.isEmpty() && this.canPlaceInSlot(slot)) {
        content.clear();
        content.item = item;
        content.count = Math.min(toAdd, ritem.stackSize);
        toAdd -= content.count;
      }
      if (toAdd <= 0) stop();
    });
    return toAdd;
  }
  removeItem(item, number = 1) {
    let toRemove = number;
    this.iterate((content, slot, stop) => {
      if (content.item === item && this.canPickupFromSlot(slot)) {
        if (content.count > toRemove) {
          content.count -= toRemove;
          toRemove = 0;
          stop();
        } else {
          toRemove -= content.count;
          content.clear();
        }
      }
    }, true);
    this.cleanInventory();
    return toRemove;
  }

  addItems(stacks, stack = true) {
    let didntadd = 0;
    for (let entry of stacks) {
      didntadd += this.addItem(entry.item, entry.count, stack);
    }
    return didntadd;
  }
  removeItems(stacks) {
    let didntremove;
    for (let entry of stacks) {
      didntremove += this.removeItem(entry.item, entry.count);
    }
    return didntremove;
  }

  clear() {
    this.storage.splice(0);
  }

  //Management
  autoStack() {
    let buffer = this.storage.slice(0);
    this.storage.splice(0);
    for (let item of buffer) {
      if (!item) continue;
      if (item.isEmpty()) continue;
      this.addItem(item.item, item.count, true);
    }
  }
  cleanInventory() {
    for (let index = 0; index < this.storage.length; index++) {
      let item = this.storage[index];
      if (!item || !item instanceof ItemStack || item.isEmpty())
        this.storage[index] = ItemStack.EMPTY;
    }
  }
  sortByRegistryName() {
    this.cleanInventory();
    this.storage.sort(dynamicSort("item", ["nothing"]));
  }
  sortByCount() {
    this.cleanInventory();
    this.storage.sort(dynamicSort("-count", ["nothing"]));
  }
  /**
   * Tries to transfer all the items in this inventory to another one.
   * @param {Inventory} to Inventory to transfer items to.
   * @param {boolean} stack If false, does not attempt to stack the items transferred.
   * @param {(stack: ItemStack, slot: int) => boolean} filter A function to determine whether a slot is transferred or not. Return `true` to make a stack transferred, `false` to prevent transfer.
   */
  transfer(to, stack, filter = () => true) {
    this.iterate((item, slot, sotp) => {
      if (filter(item, slot)) {
        let left = to.addItem(item.item, item.count, stack);
        item.count = left;
        if (item.isEmpty()) {
          this.storage[slot] = ItemStack.EMPTY;
        }
      }
    });
  }

  //Interaction
  /** Picks up an item from an inventory slot, or puts it back. */
  hotkeySlot(index, pickup = !!keyIsDown(SHIFT)) {
    let mIS = Inventory.mouseItemStack ?? ItemStack.EMPTY;
    let mISItem = mIS.getItem();
    if (!this.storage[index]) this.storage[index] = ItemStack.EMPTY;
    if (this.storage[index].isEmpty() && mIS.isEmpty()) return;
    if (mIS.item !== this.storage[index].item) {
      //[ Item swap ]
      if (this.canPlaceInSlot(index) && this.canPickupFromSlot(index)) {
        Inventory.mouseItemStack = this.storage[index];
        this.storage[index] = mIS;
      }
    } else if (mIS.count + this.storage[index].count < mISItem.stackSize) {
      //[ Item stacking ]
      //Transfer stack to correct place
      if (pickup && this.canPickupFromSlot(index)) {
        mIS.count += this.storage[index].count;
        this.storage[index] = ItemStack.EMPTY;
      } else if (this.canPlaceInSlot(index)) {
        this.storage[index].count += mIS.count;
        Inventory.mouseItemStack = ItemStack.EMPTY;
      }
    } else {
      let transferAmount = 0;

      if (pickup && this.canPickupFromSlot(index)) {
        transferAmount = mISItem.stackSize - mIS.count;

        mIS.count += transferAmount;
        this.storage[index].count -= transferAmount;

        if (this.storage[index].count === 0)
          this.storage[index] = ItemStack.EMPTY;
      } else if (this.canPlaceInSlot(index)) {
        transferAmount = mISItem.stackSize - this.storage[index].count;

        mIS.count -= transferAmount;
        this.storage[index].count += transferAmount;

        if (mIS.count === 0) Inventory.mouseItemStack = ItemStack.EMPTY;
      }
    }
  }
  canPickupFromSlot(slot) {
    return true;
  }
  canPlaceInSlot(slot) {
    return true;
  }
  //Data
  get(slot) {
    return this.storage[slot];
  }
  set(slot, item) {
    this.storage[slot] = item || ItemStack.EMPTY;
  }
  /**
   * Checks if a block has a certain number of a type of item in its inventory.
   * @param {string} item The item to look for.
   * @param {int} count The minimum number of items this block must have.
   * @param {int[]} [excludedSlots=[]] The slots to ignore while searching.
   */
  hasItem(item, count = 1, excludedSlots = []) {
    return this.count(item, excludedSlots) >= count;
  }
  /**
   * Counts the number of a type of item in this inventory.
   * @param {string} item The item to look for.
   * @param {int[]} [excludedSlots=[]] The slots to ignore while searching.
   */
  count(item, excludedSlots = []) {
    let found = 0;
    this.iterate((slotContent, slot) => {
      if (excludedSlots.includes(slot)) return;
      if (slotContent.item === item) found += slotContent.count;
    }, true);
    return found;
  }
  /**
   * Checks if an inventory has the equivalent of all of the passed itemstacks. Do not pass multiple stacks of the same item. Instead, increase the passed stack size over the maximum.
   * @param {{item: string, count: int}[]} stacks A list of pseudo-itemstacks to check against.
   * @param {int[]} excludedSlots The slots to ignore.
   */
  hasItems(stacks, excludedSlots = []) {
    for (let entry of stacks) {
      if (!this.hasItem(entry.item, entry.count, excludedSlots)) return false;
    }
    return true;
  }

  /**
   * Simulates adding items to this inventory, and checks whether or not this worked.
   * @param {string} item The item to try to add.
   * @param {int} number The number of items to add.
   * @param {boolean} stack Whether or not to stack items.
   * @returns True if the items could fit in this inventory, false if not.
   */
  canAddItem(item, number = 1, stack = true) {
    let tempstor = this.storage.slice(0).map((x) => x.copy());
    let remaining = this.addItem(item, number, stack);
    this.storage = tempstor;
    return !remaining;
  }
  /**
   * Simulates adding multiple item stacks to this inventory, and checks whether or not this worked.
   * @param {{item: string, count: int}[]} stacks The item to try to add.
   * @param {boolean} stack Whether or not to stack items.
   * @returns True if the items could fit in this inventory, false if not.
   */
  canAddItems(stacks, stack = true) {
    let tempstor = this.storage.slice(0).map((x) => x.copy());
    let remaining = this.addItems(stacks, stack);
    this.storage = tempstor;
    return !remaining;
  }

  //oh god i need this for everything

  /**
   * Does something for each inventory slot. Ignores empty slots.
   * @param {(item: ItemStack, slot: int, stop: () => void) => void} func What to do to each itemstack. Call `stop()` to break out of the loop.
   * @param {int} from Slot to start counting from.
   * @param {boolean} [ignoreEmpty=false] Whether or not to ignore empty slots.
   */
  iterate(func, ignoreEmpty = false, from = 0) {
    let len = this.size;
    let stopped = false;
    for (let slot = from; slot < len; slot++) {
      if (!this.storage[slot]) this.storage[slot] = ItemStack.EMPTY;
      let slotContent = this.storage[slot];
      if (ignoreEmpty && (!slotContent || slotContent.isEmpty())) continue;
      void func(slotContent, slot, () => {
        stopped = true;
      });
      if (stopped) break;
    }
  }

  static tooltip = {};
  static mouseItemStack = ItemStack.EMPTY;
  /**
   * Draws the items of this inventory.
   * @param {number} rows Number of rows to draw it in.
   * @param {number|null} [cols=null] Number of columns to draw it in. Takes precedence over `rows`, if not `null`.
   */
  draw(
    x,
    y,
    rows = null,
    cols = null,
    itemSize = 40,
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160],
    reverseVertical = false
  ) {
    push();
    if (!rows && !cols) return;
    let itemsPerRow = cols ? cols : Math.ceil(this.size / rows);
    let itemRows = cols ? Math.ceil(this.size / cols) : rows;
    let displayX, displayY;
    //Images
    loop: for (let row = 0; row < itemRows; row++) {
      for (let item = 0; item < itemsPerRow; item++) {
        let index = row * itemsPerRow + item;
        if (index >= this.size) break loop;
        let invitemstack = this.storage[index];
        if (!invitemstack) invitemstack = ItemStack.EMPTY;
        if (!(invitemstack instanceof ItemStack))
          throw new TypeError(
            "Item " + index + "(" + invitemstack + ") is not an ItemStack!"
          );
        let invitem = invitemstack.getItem();
        displayX = x + item * (itemSize * 1.2);
        displayY = y + row * (itemSize * 1.2) * (reverseVertical ? -1 : 1);
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
              Inventory.mouseItemStack.item !== "nothing" &&
              Inventory.mouseItemStack.item === invitemstack.item &&
              mouseIsPressed &&
              !ui.waitingForMouseUp
            ) {
              //Mouse to inv
              if (!keyIsDown(SHIFT) && this.canPlaceInSlot(index)) {
                ui.waitingForMouseUp = true;
                if (ui.mouseButton === "left")
                  if (
                    invitemstack.count + Inventory.mouseItemStack.count <=
                    invitem.stackSize
                  ) {
                    //Place items
                    invitemstack.count += Inventory.mouseItemStack.count;
                    Inventory.mouseItemStack = ItemStack.EMPTY;
                  } else {
                    //
                    let toMove = invitem.stackSize - invitemstack.count;
                    invitemstack.count = invitem.stackSize;
                    Inventory.mouseItemStack.count -= toMove;
                  }
                else if (ui.mouseButton === "right")
                  if (invitemstack.count + 1 <= invitem.stackSize) {
                    //Place items
                    invitemstack.count++;
                    Inventory.mouseItemStack.count--;
                  }
              } else if (this.canPickupFromSlot(index)) {
                ui.waitingForMouseUp = true;
                //Move from inv to mouse
                if (
                  invitemstack.count + Inventory.mouseItemStack.count <=
                  invitem.stackSize
                ) {
                  //Place items
                  Inventory.mouseItemStack.count += invitemstack.count;
                  this.storage[index] = ItemStack.EMPTY;
                } else {
                  //
                  let toMove =
                    invitem.stackSize - Inventory.mouseItemStack.count;
                  Inventory.mouseItemStack.count = invitem.stackSize;
                  invitemstack.count -= toMove;
                }
              }
            }
            Inventory.tooltip = {
              item: invitem,
              count: invitemstack.count,
              stackSize: invitem.stackSize,
            };
            noFill();
            stroke(255, 200, 0);
            strokeWeight(5);
            rect(displayX, displayY, itemSize, itemSize);
            if (selected && mouseIsPressed && !ui.waitingForMouseUp) {
              //Pick up whole stack
              if (Inventory.mouseItemStack.isEmpty()) {
                if (this.canPickupFromSlot(index)) {
                  ui.waitingForMouseUp = true;
                  if (ui.mouseButton === "left") {
                    Inventory.mouseItemStack = this.storage[index];
                    this.storage[index] = ItemStack.EMPTY;
                  } else if (ui.mouseButton === "right") {
                    Inventory.mouseItemStack = new ItemStack(
                      invitemstack.item,
                      Math.ceil(invitemstack.count / 2)
                    );
                    invitemstack.count = Math.floor(invitemstack.count / 2);
                    if (invitemstack.count === 0) {
                      this.storage[index] = ItemStack.EMPTY;
                    }
                  }
                }
              } else {
                //(if both itemstacks are different, and mouse is full)
                //swap
                if (
                  this.canPickupFromSlot(index) &&
                  this.canPlaceInSlot(index)
                ) {
                  ui.waitingForMouseUp = true;
                  [Inventory.mouseItemStack, this.storage[index]] = [
                    this.storage[index],
                    Inventory.mouseItemStack,
                  ];
                }
              }
            }
          }
          drawImg(invitem.image, displayX, displayY, itemSize, itemSize);
          noStroke();
          fill(invitemstack.count > invitem.stackSize ? "red" : 255);
          textFont(fonts.ocr);
          textSize(itemSize / 2);
          push();
          textAlign(RIGHT, BASELINE);
          if (invitemstack.count > 1)
            text(
              invitemstack.count > 999
                ? shortenedNumber(invitemstack.count, 0)
                : invitemstack.count,
              displayX + itemSize / 2,
              displayY + itemSize / 2
            );
          pop();
        } else {
          if (
            Inventory.mouseItemStack.item !== "nothing" &&
            selected &&
            mouseIsPressed &&
            !ui.waitingForMouseUp &&
            this.canPlaceInSlot(index)
          ) {
            if (ui.mouseButton === "right") {
              Log.send("place in empty slot");

              ui.waitingForMouseUp = true;
              invitemstack.item = Inventory.mouseItemStack.item;
              invitemstack.count = 1;
              Inventory.mouseItemStack.count--;
            } else if (ui.mouseButton === "left") {
              ui.waitingForMouseUp = true;
              this.storage[index] = Inventory.mouseItemStack;
              Inventory.mouseItemStack = ItemStack.EMPTY;
            }
          }
        }
        pop();
      }
    }
    pop();
  }
  static drawMIS(itemSize) {
    if (!Inventory.mouseItemStack.isEmpty()) {
      drawImg(
        Inventory.mouseItemStack.getItem().image,
        ui.mouse.x,
        ui.mouse.y,
        itemSize,
        itemSize
      );
      push();
      noStroke();
      fill(
        Inventory.mouseItemStack.count >
          Inventory.mouseItemStack.getItem().stackSize
          ? "red"
          : 255
      );
      textFont(fonts.ocr);
      textSize(20);
      textAlign(RIGHT, BASELINE);
      if (Inventory.mouseItemStack.count > 1)
        text(
          Inventory.mouseItemStack.count > 999
            ? shortenedNumber(Inventory.mouseItemStack.count, 0)
            : Inventory.mouseItemStack.count,
          ui.mouse.x + itemSize / 2,
          ui.mouse.y + itemSize / 2
        );
      pop();
    }
  }
  static drawTooltip(
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {
    if (!this?.tooltip?.item) return;

    let itt = this.tooltip.item.getInformativeTooltip();
    if (!Array.isArray(itt))
      throw new TypeError("Tooltip " + itt + " is not an array!");
    let info = itt.filter((x) => x.toString().trim().length > 0).join("\n");

    let tooltip = this.tooltip.item.description;
    let header =
      this.tooltip.item.name +
      (this.tooltip.stackSize !== 1
        ? " (" + this.tooltip.count + "/" + this.tooltip.stackSize + ")"
        : "");

    drawMultilineText(
      ui.mouse.x,
      ui.mouse.y,
      tooltip +
        (info.length > 0
          ? "\n" + (keyIsDown(SHIFT) ? info : "🟨 -< SHIFT for info >- ⬜")
          : ""),
      header,
      Item.getColourFromRarity(0, "light"),
      outlineColour,
      backgroundColour,
      20,
      Item.getColourFromRarity(this.tooltip.item.rarity, "light")
    );

    // if (!this?.tooltip?.item) return;
    // push();
    // textAlign(LEFT);
    // textFont(fonts.ocr);
    // textSize(33);
    // strokeWeight(2);
    // let maxWidth = textWidth(header);
    // fill(...backgroundColour);
    // strokeWeight(5);
    // stroke(outlineColour);
    // let body = tooltip.split("\n");
    // let descLines = tooltip.split("\n").length + 2;
    // let lines = 2 + Math.ceil(descLines);
    // textSize(18);
    // for (let line of body) {
    //   let lw = textWidth(line);
    //   if (lw > maxWidth) maxWidth = lw + 12;
    // }
    // let displayX = ui.mouse.x + maxWidth / 2;
    // textSize(25);
    // let displayY = ui.mouse.y + (lines * 12) / 2;
    // //Stop vertical overflow
    // if (displayY + lines * 6 > height / 2) {
    //   displayY = height / 2 - lines * 6;
    // }
    // //Stop horizontal overflow
    // if (displayX + maxWidth / 2 > width / 2) {
    //   displayX = width / 2 - maxWidth / 2;
    // }
    // rect(displayX, displayY, maxWidth, lines * 12);
    // fill(Item.getColourFromRarity(this.tooltip.item.rarity, "light"));
    // stroke(Item.getColourFromRarity(this.tooltip.item.rarity, "light"));
    // strokeWeight(1);
    // let textX = displayX - maxWidth / 2 + 10;
    // let textY = displayY - lines * 6 + 28;
    // text(header, textX, textY - 5);
    // fill(Item.getColourFromRarity(0, "light"));
    // textSize(18);
    // noStroke();
    // for (let line = 0; line < lines; line++) {
    //   text(body[line], textX, textY + 15 + line * 15);
    // }
    // let startY = displayY + lines * 6;
    // pop();
  }
}

function drawMultilineText(
  x,
  y,
  txt,
  header,
  colour = [0],
  outlineColour = [50, 50, 50],
  backgroundColour = [95, 100, 100, 160],
  txtSize = 20,
  headerColourOverride = null
) {
  push();
  //Setup
  textAlign(LEFT);
  textFont(fonts.ocr);
  textSize(txtSize);
  strokeWeight(txtSize / 10);
  //Max width
  let maxWidth = header ? textWidth(header) + txtSize * 1.2 : 0;
  let boxH = header ? txtSize * 2 : txtSize * 0.6;
  let body = txt.split("\n");
  let descLines = txt.split("\n").length;
  let lines = (header ? 1 : 0) + Math.ceil(descLines);
  textSize(txtSize * 0.9);
  //Max width of body text, plus small buffer, and also height
  for (let line of body) {
    let lw = textWidth(line);
    boxH += txtSize * 0.9;
    if (lw > maxWidth) maxWidth = lw + txtSize * 1.2;
  }
  //X pos
  let displayX = x + maxWidth / 2;
  //Y pos, can't go offscreen
  let displayY = y + boxH / 2;
  if (displayY + boxH / 2 > height / 2) {
    displayY = height / 2 - boxH / 2;
  }
  //Stop horizontal overflow
  if (displayX + maxWidth / 2 > width / 2) {
    displayX = width / 2 - maxWidth / 2;
  }
  textSize(txtSize);
  fill(backgroundColour);
  strokeWeight(5);
  stroke(outlineColour);
  //Box, with padding
  rect(displayX, displayY, maxWidth, boxH);
  fill(headerColourOverride ?? colour);
  stroke(headerColourOverride ?? colour);
  strokeWeight(1);
  let textX = displayX - maxWidth / 2 + 10;
  let textY = displayY - boxH / 2 + (header ? txtSize * 1.5 : 0);
  if (header) text(header, textX, textY - 5);
  textSize(txtSize * 0.9);
  fill(colour);
  noStroke();
  for (let line = 0; line < lines; line++) {
    coltxt(body[line], textX, textY + txtSize + line * txtSize * 0.9, colour);
  }
  pop();
}

const textcolours = {
  "🟥": [255, 60, 60],
  "🟧": [255, 180, 80],
  "🟨": [255, 220, 50],
  "🟩": [50, 255, 50],
  "🟦": [50, 220, 255],
  "🟪": [200, 0, 255],
  "🟫": [165, 105, 83],
  "⬛": [0, 0, 0],
  "⬜": "reset",
};
function findTextColourPrefix(str = "") {
  for (let key of Object.getOwnPropertyNames(textcolours)) {
    if (str.startsWith(key)) return key;
  }
  return "";
}
function findTextColourSuffix(str = "") {
  for (let key of Object.getOwnPropertyNames(textcolours)) {
    if (str.endsWith(key)) return key;
  }
  return "";
}

function coltxt(textToShow = "", x, y, defcolour) {
  if (!textToShow) return;
  let trimmed = textToShow.trim();
  let colcode = findTextColourPrefix(trimmed);
  let endcolcode = findTextColourSuffix(trimmed);
  //Log.send(textToShow + " => " + colcode + ", " + endcolcode);
  let colour = textcolours[colcode];
  let endcolour = textcolours[endcolcode];
  if (colour === "reset") fill(defcolour);
  else if (colour) fill(colour);
  text(
    colour || endcolour
      ? textToShow.replace(colcode, "").replace(endcolcode, "")
      : textToShow,
    x,
    y
  );
  if (endcolour === "reset") fill(defcolour);
  else if (endcolour) fill(endcolour);
}

export { Inventory, drawMultilineText };
