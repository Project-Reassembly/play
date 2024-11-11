/** 32x32 Block group for ticking and rendering.*/
class Chunk {
  static size = 16;
  tiles = [];
  blocks = [];
  //Not representative of the actual position of the blocks, though
  x = 0;
  y = 0;
  /**
   * Adds a block to the chunk.
   * @param {string} block Registry name of the block
   * @param {number} xOffset X position offset from the chunk
   * @param {number} yOffset Y position offset from the chunk
   * @param {"blocks"|"tiles"} [layer="blocks"] Layer that blocks should be placed on.
   * @returns {Block} Block added.
   */
  addBlock(block, xOffset = 0, yOffset = 0, layer = "blocks") {
    if (
      Math.abs(xOffset) > Chunk.size / 2 ||
      Math.abs(yOffset) > Chunk.size / 2
    )
      return;
    let blockToAdd = construct(Registry.blocks.get(block), "block");
    blockToAdd.blockX = this.x * Chunk.size + xOffset;
    blockToAdd.blockY = this.y * Chunk.size + yOffset;
    blockToAdd.chunk = this;
    this[layer].push(blockToAdd);
    return blockToAdd;
  }
  /**
   * Removes a block from the chunk.
   * @param {number} xOffset X position offset from the chunk
   * @param {number} yOffset Y position offset from the chunk
   * @param {"blocks"|"tiles"} [layer="blocks"] Layer that blocks should be removed from.
   * @returns {Boolean} True if the block was removed, false if not.
   */
  removeBlock(xOffset, yOffset, layer = "blocks"){
    for(let index = 0; index < this[layer].length; index++){
      let block = this[layer][index]
      if(block.blockX === xOffset + this.x*Chunk.size && block.blockY === yOffset + this.y*Chunk.size){
        this[layer].splice(index, 1)
        return true;
      }
    }
    return false;
  }
  /**
   * Gets a block from the chunk.
   * @param {number} xOffset X position offset from the chunk
   * @param {number} yOffset Y position offset from the chunk
   * @param {"blocks"|"tiles"} [layer="blocks"] Layer that blocks should be looked for in.
   * @returns {Block} The block.
   */
  getBlock(xOffset, yOffset, layer = "blocks"){
    for(let index = 0; index < this[layer].length; index++){
      let block = this[layer][index]
      if(block.blockX === xOffset + this.x*Chunk.size && block.blockY === yOffset + this.y*Chunk.size){
        return block;
      }
    }
    return null;
  }
  tick(){
    for(let tile of this.tiles){
      tile.tick()
    }
    for(let block of this.blocks){
      block.tick()
    }
  }
  draw(){
    for(let tile of this.tiles){
      tile.draw()
    }
    for(let block of this.blocks){
      block.draw()
    }
  }
}
