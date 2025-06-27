import { ShootableObject } from "../physical.js";
import { Registries } from "../../core/registry.js";
import { Chunk } from "../world/chunk.js";
import { Direction } from "../../scaling.js";
import { drawImg, ui } from "../../core/ui.js";
import { createDestructionExplosion } from "../../play/effects.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
/**
 * @typedef SerialisedBlock
 * @prop {int} x
 * @prop {int} y
 * @prop {string} block Registry name
 * @prop {number} direction
 * @prop {number} power
 */
/** */
class Block extends ShootableObject {
  static size = 30;
  selectable = false;
  /**@readonly @enum*/
  static direction = Direction;
  /**@readonly */
  static dir = this.direction;
  disabled = false;
  walkable = false;
  image = "error";
  blockX = 0;
  blockY = 0;
  rotatable = false;
  /** Not the same as ShootableObject.direction, it's a direction in *radians* */
  direction = Direction.UP;
  explosiveness = 0.1;
  dropItem = null;
  name = "Block";
  //power
  power = 0;
  powerDraw = 0;
  maxPower = 0;
  isProvider = false;
  /**@type {Chunk} */
  _chunk = null;
  set chunk(_) {
    this._chunk = _;
    this.world = _.world;
  }
  get chunk() {
    return this._chunk;
  }
  get directionRad() {
    return this.direction;
  }
  tileSize = 1;
  init() {
    super.init();
    delete this.x;
    delete this.y;
  }
  draw() {
    drawImg(
      this.image,
      this.x,
      this.y,
      this.tileSize * Block.size,
      this.tileSize * Block.size
    );
    super.draw();
  }

  createDamageNumber(amount) {
    this._baseDamageNumber(
      amount,
      this.x + Block.size / 2,
      this.y + Block.size / 2
    );
  }
  steppedOnBy(entity) {}
  /**
   * Fired when an entity interacts with this block.
   * @param {Entity} entity Interacting entity.
   * @param {ItemStack} usedItemStack Itemstack held while interacting.
   * @returns {Boolean} True, if the block has been interacted with and should not be selected. False otherwise.
   */
  interaction(entity, usedItemStack = ItemStack.EMPTY) {
    return false;
  }
  /**Fired when a block is activated through an interaction, commands or ISL. */
  activated() {}
  canBreak(type = BreakType.delete) {
    return true;
  }
  onHealthZeroed(type, source) {
    this.break(BreakType.attack);
    //Block go boom
    createDestructionExplosion(
      this.x + Block.size / 2,
      this.y + Block.size / 2,
      this
    );
  }
  /** Fired when a block should be broken. Should handle block breaking itself.
   * @param {symbol} [type=BreakType.entity] What broke this block. Should be a property of `BreakType`.
   * @returns {Boolean} True if this block broke, false if not.
   */
  break(type = BreakType.delete) {
    this.world.break(this.gridX, this.gridY, "blocks");
    if (type !== BreakType.deconstruct && type !== BreakType.replace)
      return true;
    if (!this.dropItem) return true;
    DroppedItemStack.create(
      new ItemStack(this.dropItem, 1),
      this.world,
      this.x + Block.size / 2,
      this.y + Block.size / 2
    );
    return true;
  }
  /** Fired when this block is attempted to be placed. Can specify the result of the place attempt. Still respects default placement rules.
   * @param {symbol} [type=BreakType.entity] What placed this block. Should be a property of `PlaceType`.
   * @returns {Boolean} True if this block can be placed, false if not.
   */
  place(type = PlaceType.create) {
    return true;
  }
  drawTooltip(
    x,
    y,
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {
    return true;
  }
  highlight(emphasised = false) {
    drawHighlight(emphasised, () => {
      rectMode(CORNER);
      rect(
        this.uiX,
        this.uiY,
        Block.size * ui.camera.zoom,
        Block.size * ui.camera.zoom
      );
    });
  }

  /**Tries to send power to this block. Returns the amount of power not sent due to overflow. */
  sendPower(amount = 0) {
    let tryTransfer = this.power + amount;
    this.power = Math.min(tryTransfer, this.maxPower);
    return Math.max(0, tryTransfer - this.power);
  }
  /**Tries to take power from the block. Returns the amount of power not taken. */
  drawPower(amount = 0) {
    let tryTransfer = this.power - amount;
    this.power = Math.max(tryTransfer, 0);
    return Math.max(0, -tryTransfer);
  }

  get x() {
    return (this.blockX + this.chunk.i * Chunk.size) * Block.size;
  }
  get y() {
    return (this.blockY + this.chunk.j * Chunk.size) * Block.size;
  }
  get gridX() {
    return this.blockX + this.chunk.i * Chunk.size;
  }
  get gridY() {
    return this.blockY + this.chunk.j * Chunk.size;
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
  /**@returns {SerialisedBlock} */
  serialise() {
    return {
      block: this.registryName,
      direction: Block.dir.toEnum(this.direction),
      health: this.health,
      team: this.team,
      power: this.power,
    };
  }
  /**
   * @param {Block} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {}
  rightArrow() {}
  leftArrow() {}
  read() {
    return this.registryName;
  }
}
/** Stores values to describe how blocks are broken.
 * @enum
 */
const BreakType = {
  /** The block is deconstructed by the player. */
  deconstruct: Symbol(),
  /** The block is broken by an explosion. */
  explode: Symbol(),
  /** The block is changing to another one. */
  replace: Symbol(),
  /** Generic breaking, has no semantics. */
  delete: Symbol(),
  /** The block is being broken by an enemy. */
  attack: Symbol(),
};
/** Describes how a block is placed. */
const PlaceType = {
  /** Type used for blocks built by the player. */
  build: Symbol(),
  /** Type used for blocks placed on world generation. */
  generate: Symbol(),
  /** Generic placement, has no semantics. */
  create: Symbol(),
  /** The block is being changed from another one. */
  replace: Symbol(),
};

function createLinkedBlockAndItem(
  regname,
  displayname,
  image,
  blockprops,
  itemprops
) {
  Registries.blocks.add(
    regname,
    Object.assign(
      {
        name: displayname,
        image: image,
        dropItem: regname,
      },
      blockprops
    )
  );
  Registries.items.add(
    regname,
    Object.assign(
      {
        type: "placeable",
        name: displayname,
        block: regname,
        image: image,
      },
      itemprops
    )
  );
}
function drawHighlight(emphasised, drawfn) {
  push();
  noFill();
  let othercol = (emphasised ? 50 : 200) + 55 * Math.sin(frameCount / 30);
  stroke(emphasised ? 255 : othercol, othercol, othercol);
  strokeWeight((emphasised ? 2 : 1) * ui.camera.zoom);
  drawfn();
  pop();
}

export { Block, BreakType, PlaceType, createLinkedBlockAndItem, drawHighlight };
