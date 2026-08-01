import { col } from "../../../core/color.js";
import { ImageContainer } from "../../../core/image.js";
import { effectTimer } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { LightningParticle } from "../../effect/lightning-particle.js";
import { Player } from "../../entity/player.js";
import { ShootableObject } from "../../physical.js";
import { Block } from "../block.js";

export class PlayerCharger extends Block {
  powerDraw = 16.6666666667;
  maxPower = 16.6666666667;
  _extension = 0;
  baseImg = "error";
  poleImg = "error";
  poleBaseImg = "error";
  topImg = "error";
  range = 5;
  walkable = true;
  wireColour = col.from(255, 230, 170);
  /** @type {Player?} */
  #playerCharging = null;
  init() {
    super.init();
    this.wireColour = col.withA(col.convert(this.wireColour), 96);
  }
  tick() {
    if (this._extension < blockSize) {
      this._extension++;
    } else {
      const plr = this.#playerCharging;
      if (plr) {
        if (!plr.dead && this.isWithinSquareRange(plr, this.range * blockSize)) {
          const canTransfer = Math.min(this.power, plr.maxPower - plr.power);
          plr.power += canTransfer;
          this.power -= canTransfer;
        } else this.#playerCharging = null;
      } else {
        for (const ent of this.world.entities) {
          if (ent instanceof Player && this.isWithinSquareRange(ent, this.range * blockSize)) {
            this.#playerCharging = ent;

            effectTimer.repeat(
              () =>
                this.world.particles.push(
                  new LightningParticle(
                    this.pos
                      .addXY(0, -this._extension * 0.875)
                      .multiLerp(ent.pos, Math.ceil(this.range * 3)),
                    15,
                    [this.wireColour, col.withA(this.wireColour, 0)],
                    0,
                    4,
                    0,
                    10,
                    1,
                    2,
                  ),
                ),
              3,
              4,
            );

            break;
          }
        }
      }
    }
  }
  draw() {
    ImageContainer.draw(this.baseImg, this.x, this.y, blockSize, blockSize);
    ShootableObject.prototype.draw.call(this);
  }
  postDraw() {
    ImageContainer.draw(this.poleBaseImg, this.x, this.y, blockSize, blockSize * 0.25);
    super.postDraw();
  }
  postDraw2() {
    for (let i = 1; i < 4; i++)
      ImageContainer.draw(
        this.poleImg,
        this.x,
        this.y - i * this._extension * 0.25,
        blockSize,
        blockSize * 0.25,
      );
    const top = this.y - this._extension * 0.875;
    if (this.#playerCharging) {
      push();
      noFill();
      col.stroke(this.wireColour);
      strokeWeight(3);
      line(this.x, top, this.#playerCharging.x, this.#playerCharging.y);
      strokeWeight(1.5);
      line(this.x, top, this.#playerCharging.x, this.#playerCharging.y);
      pop();
    }
    ImageContainer.draw(this.topImg, this.x, top, blockSize, blockSize);
  }
  createExtendedDetails() {
    return `#=-Player Connections:\n  #d-${this.range} tiles#-- connection range`;
  }
}
