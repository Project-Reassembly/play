class Item {
  image = "error";
  name = "<unnamed item>";
  description = "<no description>";
  rarity = 0;
  stackSize = 99;
  /**
   * @param {EquippedEntity} holder Entity holding this item.
   */
  tick(holder) {}
  /**
   * Called when ticking on the ground.
   * @param {number} x
   * @param {number} y
   * @param {World} world
   */
  groundTick(x, y, world) {
    if (rnd(0, 1) < 0.1)
      if (this.rarity === Item.rarity.SPECIAL) {
        let dir = rnd(0, Math.PI * 2);
        let size = rnd(3, 8);
        world.particles.push(
          new ShapeParticle(
            x + Math.cos(dir) * rnd(0, 8),
            y + Math.sin(dir) * rnd(0, 8),
            0,
            40,
            0,
            0,
            "rhombus",
            Item.getColourFromRarity(Item.rarity.SPECIAL, "light"),
            Item.getColourFromRarity(Item.rarity.SPECIAL, "dark"),
            size,
            0,
            size,
            0,
            0
          )
        );
      }
  }
  /**
   *
   * @param {number} rarity Item rarity. Must be between 0 and 5 inclusive. Use of `Item.rarity` is recommended.
   * @param {"light"|"dark"} [scheme="light"] Colour scheme **of the text**, not of the background.
   */
  static getColourFromRarity(rarity, scheme = "light") {
    switch (scheme) {
      case "light": {
        switch (rarity) {
          case 0:
            return [255, 255, 255];
          case 1:
            return [150, 255, 150];
          case 2:
            return [150, 150, 255];
          case 3:
            return [200, 150, 255];
          case 4:
            return [255, 240, 150];
          case 5:
            return [255, 150, 150];
        }
      }
      case "dark": {
        switch (rarity) {
          case 0:
            return [0, 0, 0];
          case 1:
            return [0, 150, 0];
          case 2:
            return [0, 0, 150];
          case 3:
            return [100, 0, 150];
          case 4:
            return [150, 145, 0];
          case 5:
            return [150, 0, 0];
        }
      }
    }
    return [0, 0, 0, 0];
  }
  /**@readonly */
  static rarity = {
    /**@readonly */
    COMMON: 0,
    /**@readonly */
    ITI: 2,
    /**@readonly */
    CCC: 1,
    /**@readonly */
    PETI: 5,
    /**@readonly */
    SPECIAL: 4,
    /**@readonly */
    RARE: 3,
  };
}
