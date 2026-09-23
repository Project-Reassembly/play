import * as MLF1 from "../../../core/mlf1.js";
import { time, tru } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import { Item } from "../../item/item.js";
import { PowerGenerator } from "./generator.js";

/** Smelter which generates power instead of processing items. */
class Burner extends PowerGenerator {
  tickEffectChance = 0.5;
  tickEffect = "crafter-smoke";

  fuelTypes = {};
  /**Does this burner stop using fuel when it's power's full? */
  fuelEfficient = false;
  _fuelLeft = 0;
  _fuelMax = 0;

  tick() {
    super.tick();

    if (this._fuelLeft > 0) {
      if (this.generate() || !this.fuelEfficient) {
        this._fuelLeft--;
        this.createTickEffect();
      }
    } else {
      for (let item in this.fuelTypes) {
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
    if (tru(this.tickEffectChance)) this.emit(this.tickEffect);
  }

  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    MLF1.draw(
      x,
      y,
      `\nFuel: ${""
        .padEnd((this._fuelLeft / this._fuelMax) * 14, "■")
        .padEnd(14, "□")
        .substring(0, 14)} `,
      this.title,
      Item.getColourFromRarity(0, "light"),
    );
  }

  serialise() {
    let c = super.serialise();
    c.fuel = this._fuelLeft;
    return c;
  }
  /**
   * @param {Burner} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised._fuelLeft = creator.fuel;
    deserialised._fuelMax = creator.fuel;
  }
  addFuel(_) {
    this._fuelLeft += _;
    this._fuelMax += _;
  }
  setFuel(_) {
    this._fuelLeft = _;
    this._fuelMax = _;
  }
  createExtendedDetails() {
    return `${super.createExtendedDetails()}\n#=-Fuel Types:\n  ${Object.entries(
      this.fuelTypes,
    )
      .map(
        ([type, tme]) =>
          `#>>${Registries.items.tryGet(type)?.image}#6- ${time(tme)}#-- #=-(#e-${shortenedNumber(this.powerGeneration * time)}#-- total power#=-)`,
      )
      .join("\n  ")}`;
  }
  /**
   * Tries to add an item to this block, as a conveyor would.
   * @param {string} item
   * @returns True if the item was successfully added.
   */
  push(item) {
    if (item in this.fuelTypes) {
      if (this._fuelLeft === 0) {
        this.setFuel(this.fuelTypes[item]);
        return true;
      }
      return false;
    }
    return this.inventory.addItem(item, 1) === 0;
  }
}
export { Burner };

