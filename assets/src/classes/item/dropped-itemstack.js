class DroppedItemStack extends Entity {
  item = ItemStack.EMPTY;
  /**
   *
   * @param {ItemStack} stack
   */
  constructor(stack) {
    super();
    this.item = stack.copy();
    this.init();
  }
  init() {
    this.direction = rnd(0, 360);
    this.speed = 3;
    this.components = [];
    super.init();
    this.hitSize = 7.5;
  }
  damage() {}
  tick() {
    if (this.dead) return;
    if (this.item.isEmpty()) {
      this.dead = true;
      return;
    }
    this.speed *= 0.9;
    this.x += Math.cos(this.directionRad) * this.speed;
    this.y += Math.sin(this.directionRad) * this.speed;
    for (let ent of this.world.entities) {
      if (ent instanceof InventoryEntity && ent.collidesWith(this)) {
        let it = this.item.item;
        if (ent === game.player) {
          Log.send("Picked up " + this.item.toString(true));
        }
        if (ent instanceof EquippedEntity) {
          let leftOver = ent.equipment.addItem(it, this.item.count);
          if (!leftOver) {
            this.item.count = 0;
          } else {
            let leftOver2 = ent.inventory.addItem(it, leftOver);
            if (!leftOver2) {
              this.item.count = 0;
            } else this.item.count = leftOver2;
          }
        } else {
          this.item.count = ent.inventory.addItem(it, this.item.count);
        }
        if (this.item.isEmpty()) {
          this.dead = true;
          return;
        }
      }
    }
  }
  draw() {
    drawImg(this.item?.getItem()?.image ?? "error", this.x, this.y, 15, 15);
  }
}
