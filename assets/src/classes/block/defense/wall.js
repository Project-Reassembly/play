import { Block } from "../block.js";
//Does nothing special, just blocks shit
class Wall extends Block {
  explosiveness = 0;
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.health + " health",
      this.armour > 0 ? this.armour + " armour" : "",
      this.explosiveness > 0
        ? "🟥" + this.explosiveness * 100 + "% explosiveness⬜"
        : "",
      "🟨 -------------------- ⬜",
    ];
  }
}

export { Wall };
