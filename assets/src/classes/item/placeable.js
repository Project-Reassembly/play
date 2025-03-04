class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  place(stack, bx, by) {
    if (stack.count < this.itemsPerBlock) return;
    if (this.block === "none") return;
    if (world.isPositionFree(bx, by, this.layer)) {
      let placed = world.placeAt(this.block, bx, by, this.layer);
      placed.direction = selectedDirection;
      stack.count -= this.itemsPerBlock;
      if (stack.count === 0) {
        stack.item = "nothing";
      }
    }
  }
}
