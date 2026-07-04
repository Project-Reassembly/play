import { constructFromType } from "../../core/constructor.js";
import { ui } from "../../core/ui.js";
import { BulletModel } from "../projectile/bullet-model.js";
import { Item } from "./item.js";
class Throwable extends Item {
  bullet = {};
  spread = 10;
  throwEffect = "none";
  init() {
    super.init();
    this.bullet = constructFromType(this.bullet, BulletModel);
  }
  useInAir(holder, stack) {
    this.throw(holder, stack);
    ui.waitingForMouseUp = true;
    return true;
  }
  /**@param {Entity} from @param {ItemStack} stack */
  throw(from, stack) {
    stack.count--;
    let offX = Math.cos(from.directionRad) * from.size,
      offY = Math.sin(from.directionRad) * from.size;
    from.emit(this.throwEffect, offX, offY);
    this.bullet.instantiate(
      from.x + offX,
      from.y + offY,
      1,
      from.direction,
      this.spread,
      0,
      from.world,
      from,
    );
  }
}
export { Throwable };

