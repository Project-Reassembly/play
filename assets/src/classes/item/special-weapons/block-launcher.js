import { Weapon, WeaponBulletConfiguration } from "../weapon.js";
import { PointBullet } from "../../projectile/point-bullet.js";
import { constructFromType, construct } from "../../../core/constructor.js";
import { game } from "../../../play/game.js";
import { Log } from "../../../play/messaging.js";
import { WeaponShootConfiguration } from "../weapon.js";
import { Registries } from "../../../core/registry.js";
import { Wall } from "../../block/defense/wall.js";
import { ui } from "../../../core/ui.js";
import { Bomb, NuclearBomb } from "../../block/defense/bomb.js";
import {
  autoScaledEffect,
  Explosion,
  NuclearExplosion,
} from "../../../play/effects.js";
import { DroppedItemStack } from "../dropped-itemstack.js";
import { Block } from "../../block/block.js";
import { ItemStack } from "../item-stack.js";
class BlockLauncher extends Weapon {
  ammoType = "none";
  places = true;
  /**@type {BlockLauncherScaling} */
  scaling = {};
  current = {};
  base = {};
  baseShoot = {};
  init() {
    this.baseShoot = structuredClone(this.shoot);
    this.current = structuredClone(this.base);
    super.init();
    this.scaling = constructFromType(this.scaling, BlockLauncherScaling);
  }
  /**
   * @param {EquippedEntity} holder
   * @param {boolean} issecondary
   */
  use(holder, issecondary) {
    if (issecondary) {
      let block = holder.world.getBlock(game.mouse.blockX, game.mouse.blockY);
      if (!block) return;
      //Set ammo filter to clicked block
      Log.send("Set ammo type to " + block.name + " (" + block.dropItem + ")");
      this.ammoType = block.dropItem;
      this.shoot = constructFromType(this.baseShoot, WeaponShootConfiguration);
      this.current = structuredClone(this.base);
      let reverseEngineering = new WeaponBulletConfiguration();
      reverseEngineering.ammos[this.ammoType] = 0;
      reverseEngineering.types = [this.current];
      this.bullets = reverseEngineering;
      this.modifyBullet();
      ui.waitingForMouseUp = true;
    } else {
      if (this.ammoType !== "none") this.fire(holder, this.shoot);
    }
  }
  modifyBullet() {
    let item = Registries.items.get(this.ammoType);
    if (!item || !item.block) return;
    /**@type {Block} */
    let block = construct(Registries.blocks.get(item.block), "block");
    if (this.places) {
      this.current.type = "block-bullet";
      this.current.block = item.block;
    }
    this.shoot.reload /=
      (1 - this.scaling.slowdownFromMHP) **
      (block.maxHealth * this.scaling.slowdownFromMHP);
    this.current.damage ??= [];
    this.current.damage.forEach((x) => {
      if (x.amount !== undefined)
        x.amount +=
          this.scaling.damageFromMHP *
          block.maxHealth *
          (1 +
            (block instanceof Wall
              ? this.scaling.damageFromArmour * block.armour
              : 0));
      if (x.radius !== undefined)
        x.radius +=
          this.scaling.areaFromExplosivenessAndMHP *
          block.maxHealth *
          block.explosiveness;
    });
    if (this.current.pierce !== undefined)
      this.current.pierce +=
        this.scaling.pierceFromMHP * block.maxHealth +
        (1 +
          (block instanceof Wall
            ? this.scaling.pierceFromArmour * block.armour
            : 0));
    this._cachedTooltip = null;
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      (this.ammoType === "none"
        ? "🟥Not loaded"
        : "🟨Shooting " + Registries.blocks.get(this.ammoType).name) + "⬜",
      ...Weapon.infoOfShootPattern(this.shoot, this.bullets),
      "🟨 -------------------- ⬜",
    ];
  }
}

class BlockLaunchedBullet extends PointBullet {
  block = "scrap-wall";
  ondestroyed() {
    super.ondestroyed();
    /**@type {Block} */
    let rblk = construct(Registries.blocks.get(this.block), "block");
    let blkitem = rblk.dropItem;
    if (!blkitem) return;
    if (
      this.world.isPositionFree(
        Math.floor(this.x / Block.size),
        Math.floor(this.y / Block.size),
        "blocks"
      )
    ) {
      this.world.placeAt(
        this.block,
        Math.floor(this.x / Block.size),
        Math.floor(this.y / Block.size),
        "blocks"
      ).team = this.entity.team;
    } else {
      if (rblk instanceof Bomb) {
        autoScaledEffect(
          rblk.explosionEffect.includes("~")
            ? rblk.explosionEffect
            : rblk.explosionEffect + "~" + (rblk.explosion.radius ?? 0),
          this.world,
          this.x,
          this.y,
          0
        );
        let ex = new (
          rblk instanceof NuclearBomb ? NuclearExplosion : Explosion
        )(rblk.explosion);
        ex.x = this.x;
        ex.y = this.y;
        ex.world = this.world;
        ex.source = this.entity;
        ex.dealDamage();
        return;
      }
      DroppedItemStack.create(
        new ItemStack(blkitem),
        this.world,
        this.x,
        this.y,
        0,
        0
      );
    }
  }
}

class BlockLauncherScaling {
  damageFromMHP = 0.1;
  damageFromArmour = 0.5;
  pierceFromMHP = 0.05;
  pierceFromArmour = 0.2;
  areaFromExplosivenessAndMHP = 2;
  slowdownFromMHP = 0.05;
}
export { BlockLauncher, BlockLaunchedBullet };
