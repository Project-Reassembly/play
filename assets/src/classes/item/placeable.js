class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  place(stack, bx, by) {
    if (stack.count < this.itemsPerBlock) return;
    if (this.block === "none") return;
    if (world.isPositionFree(bx, by)) {
      world.placeAt(this.block, bx, by);
      stack.count -= this.itemsPerBlock;
      if (stack.count === 0) {
        stack.item = "nothing";
      }
    }
  }
}
