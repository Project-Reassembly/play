class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  place(stack, bx, by) {
    if (stack.count < this.itemsPerBlock) return false;
    if (this.block === "none") return false;
    if (world.isPositionFree(bx, by, this.layer)) {
      let placed = world.placeAt(this.block, bx, by, this.layer);
      if (placed.rotatable) placed.direction = selectedDirection + 0;
      //Look, only the player can use this anyway
      placed.team = game.player.team;
      stack.count -= this.itemsPerBlock;
      if (stack.count === 0) {
        stack.item = "nothing";
      }
      return true;
    }
    return false;
  }
}
