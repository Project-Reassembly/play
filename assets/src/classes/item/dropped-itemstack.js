class DroppedItemStack extends Entity {
  item = ItemStack.EMPTY;
  delay = 30;
  #delayLeft = 30;
  static create(stack, world, x = 0, y = 0, speed = 3, direction = NaN) {
    let item = new this();
    item.item = stack.copy();
    item.init();
    item.addToWorld(world, x, y);
    item.speed = speed;
    if (!isNaN(direction)) item.direction = direction;
    else item.direction = rnd(0, 360);
  }
  init() {
    this.#delayLeft = this.delay;
    this.speed = rnd(2, 4);
    this.components = [];
    this.hitSize = 7.5;
    this.team = "items";
  }
  damage() {}
  tick() {
    if (this.dead) return;
    if (this.item.isEmpty()) {
      this.dead = true;
      return;
    }
    this.item.getItem().groundTick(this.x, this.y, this.world);
    this.speed *= 0.9;
    this.x += Math.cos(this.directionRad) * this.speed;
    this.y += Math.sin(this.directionRad) * this.speed;
    this.#delayLeft--;
    if (this.#delayLeft <= 0)
      for (let ent of this.world.entities) {
        if (ent instanceof InventoryEntity && ent.collidesWith(this)) {
          let it = this.item.item;
          if (ent instanceof EquippedEntity) {
            let leftOver = ent.equipment.addItem(it, this.item.count);
            if (!leftOver) {
              if (ent === game.player) {
                Log.send("Picked up " + this.item.toString(true));
              }
              this.item.count = 0;
            } else {
              let leftOver2 = ent.inventory.addItem(it, leftOver);
              if (!leftOver2) {
                if (ent === game.player) {
                  Log.send("Picked up " + this.item.toString(true));
                }
                this.item.count = 0;
              } else {
                if (ent === game.player) {
                  let newcount = this.item.count - leftOver2;
                  if (newcount > 0)
                    Log.send(
                      "Picked up " + this.item.getItem().name + " x" + newcount
                    );
                }
                this.item.count = leftOver2;
              }
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
  serialise() {
    return {
      "-": true,
      stack: this.item.serialise(),
      x: this.x,
      y: this.y,
    };
  }
}
