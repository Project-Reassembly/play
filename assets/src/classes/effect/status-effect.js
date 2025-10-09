import { RegisteredItem } from "../../core/registered-item.js";
//Struct, but that's not a thing here
class StatusEffect extends RegisteredItem {
  name = "Status Effect";
  damage = 0;
  healing = 0;
  damageType = "normal";
  attributeModifiers = {};
  interval = 10;
  effect = "none";
  effectChance = 1;
}
export { StatusEffect };
