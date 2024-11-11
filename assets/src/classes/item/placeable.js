class PlaceableItem extends Item {
  layer = "blocks";
  block = "stone-wall";
  itemsPerBlock = 1;
  place(stack) {
    if (stack.count < this.itemsPerBlock) return;
    let bx = game.mouse.x,
      by = game.mouse.y;
    if (world.isPositionFree(bx, by)) {
      world.placeAt(this.block, bx, by);
      stack.count -= this.itemsPerBlock;
      if(stack.count === 0){
        stack.item = "nothing"
      }
    }
  }
}
