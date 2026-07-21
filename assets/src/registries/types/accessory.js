import { AccessoryModifier, AttributeModifierComponent, PunchModifierComponent, TradeCostModifierComponent } from "../../classes/item/accessory.js";
import { TypeRegistries } from "../../core/registry.js";

TypeRegistries.accessory.add("dummy", AccessoryModifier);
TypeRegistries.accessory.add("punch", PunchModifierComponent);
TypeRegistries.accessory.add("attribute", AttributeModifierComponent);
TypeRegistries.accessory.add("trade", TradeCostModifierComponent);
