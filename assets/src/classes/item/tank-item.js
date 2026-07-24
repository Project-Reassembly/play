import Integrate from "../../lib/integrate.js";
import { Item } from "./item.js";

export class TankItem extends Item {
  /** @type {Integrate.Unconstructed<TankComponent>} */
  component = {};
}
