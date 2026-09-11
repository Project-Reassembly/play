import { col } from "../../core/color.js";
import { rnd, Vector } from "../../core/number.js";
import { ui } from "../../core/ui.js";
import { effectTimer } from "../../play/effects.js";
import { blockSize } from "../../scaling.js";
import { LightningParticle } from "../effect/lightning-particle.js";
import { Entity } from "../entity/entity.js";
import { Item } from "./item.js";

export class PortableBattery extends Item {
  recovery = 10000;
  minRec = 1000;
  /**@param {Entity} holder @param {ItemStack} stack */
  useInAir(holder, stack) {
    if (holder.power <= holder.maxPower - this.minRec) {
      holder.power = Math.min(holder.power + this.recovery, holder.maxPower);
      stack.count--;

      effectTimer.repeat(
        () => {
          const dist = rnd.int(2, 4);
          const poses = holder.pos.multiLerp(
            holder.pos.add(Vector.fromAngle(rnd.float(0, 360)).scale(blockSize * dist)),
            dist + 1,
          );
          holder.world.particles.push(
            new LightningParticle(poses, 15, [col.cyan, col.withA(col.cyan, 0)], 0, 4, 0, 10, 1, 2),
          );
        },
        9,
        2,
      );

      ui.waitingForMouseUp = true;
    }
  }
  createExtendedDetails() {
    return `#=-Power Recovery:\n  #--(Up to) #e-${shortenedNumber(this.recovery)}#-- power recovery${this.minRec ? `\n  #--Requires at least #e-${shortenedNumber(this.minRec)}#-- remaining capacity` : "\n  #e-Always usable"}`;
  }
}
