import { constructFromRegistry } from "../../core/constructor.js";
import { roundNum } from "../../core/number.js";
import { Registries, TypeRegistries } from "../../core/registry.js";
import Integrate from "../../lib/integrate.js";
import { BulletModel } from "../projectile/bullet-model.js";
/** @import { EquippedEntity } from "../entity/inventory-entity.js" */
import { Item } from "./item.js";

/** Item which goes in 'equipment' slots, and changes the player's stuff. */
export class Accessory extends Item {
  /** @type {AccessoryModifier[]} */
  modifiers = [];
  init() {
    super.init();
    this.modifiers.forEach(
      (v, i, a) => (a[i] = constructFromRegistry(v, TypeRegistries.accessory)),
    );
  }
  /** What to do when an entity wants to Calculate Attribute Modifiers @param {EquippedEntity} entity */
  calcAttrMods(entity) {
    this.modifiers.forEach((v) => v.active(entity) && v.ev_calcAttrMods(entity));
  }
  /** What to do for the Select Melee Attack Type event @param {EquippedEntity} entity @returns {string?}*/
  selectAtkType(entity, charged) {
    for (const mod of this.modifiers) {
      if (!mod.active(entity)) continue;
      const typ = mod.ev_selectAtkType(entity, charged);
      if (typ) return typ;
    }
    return null;
  }
  /** What to do for the Melee Attack Performed event @param {EquippedEntity} entity @returns {string?} */
  atkPerformed(entity, charged) {
    this.modifiers.forEach((v) => v.active(entity) && v.ev_atkPerformed(entity, charged));
  }
  createExtendedDetails() {
    return `#=-When Equipped:\n${this.modifiers.length !== 0 ? " - " + this.modifiers.map((m) => m.createExtendedTooltip().split("\n").join("\n   ")) : " #c-No effect."}`;
  }
}

export class AccessoryModifier extends Integrate.RegisteredItem {
  /** If this modifier is active this time @param {EquippedEntity} entity */
  active(entity) {
    return true;
  }
  /** What to do when an entity wants to Calculate Attribute Modifiers @param {EquippedEntity} entity */
  ev_calcAttrMods(entity) {}
  /** What to do for the Select Melee Attack Type event @param {EquippedEntity} entity @returns {string?} */
  ev_selectAtkType(entity, charged) {
    return null;
  }
  /** What to do for the Melee Attack Performed event @param {EquippedEntity} entity @returns {string?} */
  ev_atkPerformed(entity, charged) {}
  /** What to do every tick @param {EquippedEntity} entity */
  tick(entity) {}

  createExtendedTooltip() {
    return "";
  }
}

export class PunchModifierComponent extends AccessoryModifier {
  normal = "";
  charged = "";

  ammoUsed = "";
  ammoCount = 1;
  /** What to do for the Select Melee Attack Type event @param {EquippedEntity} entity  */
  active(entity) {
    if (!this.ammoUsed || !this.ammoCount) return super.active(entity);
    return entity.ammo.hasItem(this.ammoUsed, this.ammoCount);
  }
  /** What to do for the Select Melee Attack Type event @param {EquippedEntity} entity @returns {string?} */
  ev_selectAtkType(entity, charged) {
    return charged ? this.charged : this.normal;
  }
  /** What to do for the Melee Attack Performed event @param {EquippedEntity} entity @returns {string?} */
  ev_atkPerformed(entity, charged) {
    if (this.ammoUsed && ((this.charged && charged) || (!this.charged && !charged)))
      entity.ammo.removeItem(this.ammoUsed, this.ammoCount);
  }
  createExtendedTooltip() {
    let s = "";
    const ammotext =
      this.ammoUsed ?
        `[#>>${Registries.items.tryGet(this.ammoUsed)?.image ?? "error"}#e-${Registries.items.tryGet(this.ammoUsed)?.name ?? this.ammoUsed} x${this.ammoCount}#=-]`
      : "[ Punch ]";
    if (this.normal) {
      const punch = Registries.small.punch_types.get(this.normal),
        /** @type {BulletModel} */ bullet = Registries.bullets.tryGet(punch.bullet);
      s += `#d-Replaces punches#-- with #d-${punch.name}#--:\n#=-${ammotext}:\n #=-| ${bullet.createInfo().replaceAll("\n", "\n #=-| ")}`;
    }
    if (this.charged) {
      const punch = Registries.small.punch_types.get(this.charged),
        /** @type {BulletModel} */ bullet = Registries.bullets.tryGet(punch.bullet);
      s += `#d-Replaces#db charged#d- punches#-- with #d-${punch.name}#--:\n#=-${ammotext}:\n #=-| ${bullet.createInfo().replaceAll("\n", "\n #=-| ")}`;
    }
    return s;
  }
}

export class AttributeModifierComponent extends AccessoryModifier {
  attributes = {};
  /** What to do when an entity wants to Calculate Attribute Modifiers @param {EquippedEntity} entity */
  ev_calcAttrMods(entity) {
    for (const key in this.attributes) {
      entity.attributes.multiply(key, this.attributes[key]);
    }
  }
  createExtendedTooltip() {
    let s = "#=-Affects Entity Attributes:\n";
    for (const key in this.attributes) {
      const mod = this.attributes[key];
      const change = `${(mod < 1 ? "#c--" : "#a-+") + roundNum((mod < 1 ? 1 - mod : mod - 1) * 100, 2)}%`;
      s += ` ${change}#-- ${key.replaceAll("-", " ")}\n`;
    }
    return s.slice(0, -1);
  }
}

export class TradeCostModifierComponent extends AccessoryModifier {
  multiplier = 1;
  createExtendedTooltip() {
    return `${(this.multiplier < 1 ? "#a-" : "#c-+") + roundNum((this.multiplier < 1 ? 1 - this.multiplier : this.multiplier - 1) * 100, 2)}%#-- NPC trade cost`;
  }
}
