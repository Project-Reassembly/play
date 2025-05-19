import { autoScaledEffect } from "../../../play/effects.js";
import { Crafter } from "./crafter.js";
import { tru } from "../../../core/number.js";
import { Block } from "../block.js";
/**Extended Crafter which uses fuel items. */
class Smelter extends Crafter {
  activeTickEffect = "smelter-sparks";
  activeTickEffectChance = 0.3;
  fuelTypes = {};
  /**Does this Smelter stop using fuel when the recipe can't be processed? */
  fuelEfficient = false;
  _fuelLeft = 0;
  _fuelMax = 0;
  tickRecipe(recipe, time) {
    if (this._fuelLeft > 0) {
      if (super.tickRecipe(recipe, time) || !this.fuelEfficient) {
        this._fuelLeft--;
        super.createTickEffect();
      }
    } else {
      for (let item of Object.keys(this.fuelTypes)) {
        let time = this.fuelTypes[item];
        if (this.inventory.hasItem(item)) {
          this.setFuel(time);
          this.inventory.removeItem(item);
          break;
        }
      }
    }
  }
  createTickEffect() {
    if (tru(this.activeTickEffectChance))
      autoScaledEffect(
        this.activeTickEffect,
        this.world,
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        this.direction
      );
  }
  serialise() {
    let c = super.serialise();
    c.fuel = this._fuelLeft;
    return c;
  }
  /**
   * @param {Smelter} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised._fuelLeft = creator.fuel;
    deserialised._fuelMax = creator.fuel;
  }
  setFuel(_) {
    this._fuelLeft = _;
    this._fuelMax = _;
  }
  stringifyRecipe(rec) {
    let r = super.stringifyRecipe(rec);
    r +=
      "\nFuel: " +
      ""
        .padEnd((this._fuelLeft / this._fuelMax) * 14, "■")
        .padEnd(14, "□")
        .substring(0, 14) +
      " ";
    return r;
  }
}
export { Smelter };
