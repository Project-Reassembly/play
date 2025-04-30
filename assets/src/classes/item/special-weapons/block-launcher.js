class BlockLauncher extends Weapon {
  ammoType = "none";
  places = true;
  /**@type {BlockLauncherScaling} */
  scaling = {};
  modShoot = {};
  init() {
    this.modShoot = structuredClone(this.shoot);
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
      this.shoot = constructFromType(this.modShoot, WeaponShootConfiguration);
      this.modifyBullet();
      ui.waitingForMouseUp = true;
    } else {
      if (this.ammoType !== "none") this.fire(holder, this.shoot);
    }
  }
  modifyBullet() {
    let item = Registry.items.get(this.ammoType);
    if (!item || !item.block) return;
    /**@type {Block} */
    let block = construct(Registry.blocks.get(item.block), "block");
    if (this.places) {
      this.shoot.bullet.type = "block-bullet";
      this.shoot.bullet.block = item.block;
    }
    this.shoot.reload /=
      (1 - this.scaling.slowdownFromMHP) **
      (block.maxHealth * this.scaling.slowdownFromMHP);
    this.shoot.bullet.damage ??= [];
    this.shoot.bullet.damage.forEach((x) => {
      if (x.amount)
        x.amount +=
          this.scaling.damageFromMHP *
          block.maxHealth *
          (1 +
            (block instanceof Wall
              ? this.scaling.damageFromArmour * block.armour
              : 0));
      if (x.radius)
        x.radius +=
          this.scaling.areaFromExplosivenessAndMHP *
          block.maxHealth *
          block.explosiveness;
    });
    if (this.shoot.bullet.pierce !== undefined)
      this.shoot.bullet.pierce +=
        this.scaling.pierceFromMHP * block.maxHealth +
        (1 +
          (block instanceof Wall
            ? this.scaling.pierceFromArmour * block.armour
            : 0));
    this._cachedTooltip = null;
  }
  createExtendedTooltip() {
    let wtt = super.createExtendedTooltip();
    return wtt
      .slice(0, 1)
      .concat([
        (this.ammoType === "none"
          ? "🟥Not loaded"
          : "🟪Shooting " + Registry.blocks.get(this.ammoType).name) + "⬜",
      ])
      .concat(wtt.slice(1));
  }
}

class BlockLaunchedBullet extends PointBullet {
  block = "scrap-wall";
  ondestroyed() {
    super.ondestroyed();
    /**@type {Block} */
    let rblk = construct(Registry.blocks.get(this.block), "block");
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
        let ex = new (rblk instanceof NuclearBomb?NuclearExplosion:Explosion)(rblk.explosion);
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
