import { col } from "../../core/color.js";
import * as MLF1 from "../../core/mlf1.js";
import { Registries } from "../../core/registry.js";
import { drawImg, rotatedShape, ui } from "../../core/ui.js";
import { exec, ExecutionContext } from "../../lib/isl.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction } from "../../scaling.js";
import { ImageParticle } from "../effect/image-particle.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { TextParticle } from "../effect/text-particle.js";
import { Inventory } from "../inventory.js";
import { ItemStack } from "../item/item-stack.js";
import { Item } from "../item/item.js";
import { PlaceableItem } from "../item/placeable.js";
import { Block } from "./block.js";
import { Container } from "./container.js";
class StructureReaderBlock extends Block {
  _range = 1;
  _output = [];
  _outTxt = "";
  _becomes = null;
  selectable = true;
  title = "Reader";
  static unreadable = [
    "dev::structurereader",
    "dev::commandblock",
    "dev::commandblock.chain",
    "dev::commandblock.loop",
    "dev::commandblock.selector",
    "dev::itemcatalog",
  ];
  drawTooltip(x, y, outline, background) {
    MLF1.draw(
      x,
      y,
      this._outTxt,
      `${this.title} [${this._range} blocks]`,
      Item.getColourFromRarity(0, "light"),
    );
  }
  leftArrow() {
    if (this._range > 1) this._range--;
  }
  rightArrow() {
    this._range++;
  }
  highlight(emphasised) {
    super.highlight(emphasised);
    push();
    noFill();
    stroke(255, emphasised ? 0 : 255, emphasised ? 0 : 255);
    strokeWeight((emphasised ? 2 : 1) * ui.camera.zoom);
    rect(
      this.uiX,
      this.uiY,
      (this._range * 2 + 1) * blockSize * ui.camera.zoom,
      (this._range * 2 + 1) * blockSize * ui.camera.zoom,
    );
    pop();
  }
  /**@param {ItemStack | undefined} istack  */
  interaction(ent, istack) {
    if (keyIsDown(SHIFT)) {
      this._output = this.outputStructure();
      this._outTxt = this._output
        .map((x) => `${x.block}: ${x.x < 0 ? "" : "+"}${x.x}, ${x.y < 0 ? "" : "+"}${x.y}`)
        .join("\n");
      ui.waitingForMouseUp = true;
      return true;
    }
    if (!istack) return false;
    let item = istack.getItem();
    if (item instanceof PlaceableItem) {
      this._becomes = item.block;
      Log.send(`This block will be read as ${item.name}`);
      ui.waitingForMouseUp = true;
      return true;
    }
    return false;
  }
  postDraw() {
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    rect(this.uiX, this.uiY, (this._range * 2 + 1) * blockSize, (this._range * 2 + 1) * blockSize);
    opacity(0.66);
    if (this._becomes)
      drawImg(Registries.blocks.get(this._becomes).image, this.x, this.y, blockSize, blockSize);
    pop();
  }
  outputStructure() {
    let blocks = [];
    for (let x = -this._range; x <= this._range; x++) {
      for (let y = -this._range; y <= this._range; y++) {
        let bx = this.gridX + x,
          by = this.gridY + y;
        let block = this.world.getBlock(bx, by, "blocks");
        let exists = !!block;
        let unreadable = exists && StructureReaderBlock.unreadable.includes(block.registryName);
        this.world.particles.push(
          new ShapeParticle(
            bx * blockSize,
            by * blockSize,
            0,
            120,
            0,
            0,
            "rect",
            [
              unreadable ? col.yellow
              : exists ? col.green
              : col.red,
              col.hide(col.white),
            ],
            blockSize,
            blockSize,
            blockSize,
            blockSize,
            0,
            60,
          ),
          new TextParticle(
            bx * blockSize,
            by * blockSize,
            0,
            120,
            0,
            0,
            `${x}, ${y}`,
            [
              col.white,
              unreadable ? col.yellow
              : exists ? col.from(100, 255, 100, 0)
              : col.from(255, 100, 100, 0),
            ],
            5,
            5,
            0,
            true,
          ),
        );

        if (exists) {
          if (block === this && this._becomes) {
            blocks.push({ x: x, y: y, block: this._becomes });
          }
          if (!unreadable) {
            if (block.direction !== 0)
              blocks.push({
                x: x,
                y: y,
                block: block.registryName,
                direction: Direction.toEnum(block.direction),
              });
            else blocks.push({ x: x, y: y, block: block.registryName });
          }
        }
      }
    }
    console.log(blocks);
    return blocks;
  }
  read() {
    return `[${this._output.map((x) => this.x.block).join("|")}]`;
  }
}
class ItemCatalogBlock extends Container {
  init() {
    this.inventorySize = Registries.items.size;
    super.init();
  }
  tick() {
    let slot = 0;
    Registries.items.forEach((v, n) => {
      this.inventory.set(slot, new ItemStack(n));
      slot++;
    });
  }
  break(type) {
    return Block.prototype.break.call(this, type);
  }
  //Space efficiency!
  serialise() {
    let c = super.serialise();
    c.inventory = [];
    return c;
  }
  static applyExtraProps(deser, creator) {
    deser.inventory = new Inventory(Registries.items.size);
  }
  read() {
    return "";
  }
}

class CommandExecutorBlock extends Block {
  _activatedThisTick = false;
  _command = "";
  chaining = false;
  loops = false;
  _on = false;
  activated() {
    //Stop infinite command loops
    if (!this._activatedThisTick) {
      this._activatedThisTick = true;
      //Loops
      if (this.loops) this._on = !this._on;
      //Execute the command
      this.run();
    }
  }
  run() {
    this.world.particles.push(
      new ImageParticle(
        this.x,
        this.y,
        0,
        120,
        0,
        0,
        "block.dev.commandblock.heat",
        1,
        0,
        blockSize,
        blockSize,
        blockSize,
        blockSize,
        0,
      ),
    );
    exec(this._command, new ExecutionContext(this.x, this.y, this));
    //Activate next block
    if (this.chaining) {
      let vct = Direction.vectorOf(this.direction);
      let nextblock = this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y);
      if (nextblock instanceof CommandExecutorBlock) {
        nextblock.activated();
      }
    }
  }
  highlight(emphasised) {
    super.highlight(emphasised);
    if (this.chaining) {
      push();
      noStroke();
      let pulse = Math.sin(frameCount / 60);
      fill(80 + pulse * 20, 205 + 50 * pulse, 80 + pulse * 20);
      rotatedShape(
        "moved-triangle",
        this.uiX,
        this.uiY,
        blockSize * ui.camera.zoom,
        (blockSize / 2) * ui.camera.zoom,
        this.direction,
        false,
      );
      pop();
    }
  }
  tick() {
    super.tick();
    if (this.loops && this._on) {
      this.run();
    }
    this._activatedThisTick = false;
  }
  interaction(ent, istack) {
    if (keyIsDown(SHIFT)) {
      this.activated();
      ui.waitingForMouseUp = true;
      return true;
    }
    ui.texteditor.text = this._command;
    ui.texteditor.active = true;
    ui.texteditor.isCommandLine = true;
    ui.texteditor.title = "Set Console Command:";
    ui.texteditor.save = (cmd) => {
      Log.send(`#-iSet command to '${cmd}'`);
      this._command = cmd;
    };
    ui.waitingForMouseUp = true;
  }
  serialise() {
    let b = super.serialise();
    b.command = this._command;
    return b;
  }
  /**
   * @param {CommandExecutorBlock} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    deserialised._command = creator.command;
  }
  read() {
    return this._command;
  }
  write(txt) {
    this._message = txt;
  }
}
export { CommandExecutorBlock, ItemCatalogBlock, StructureReaderBlock };

