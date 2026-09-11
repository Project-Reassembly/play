import { index } from "../../../core/2D-array.js";
import { col } from "../../../core/color.js";
import { ImageContainer } from "../../../core/image.js";
import { effectTimer } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { LightningParticle } from "../../effect/lightning-particle.js";
import { ShootableObject } from "../../physical.js";
import { ConnectedRelayNetwork, RelayNetwork } from "../../world/power-network.js";
import { Block } from "../block.js";
import { PowerPylon } from "./pylon.js";

/** Connects multiple pylons together. */
const extension = blockSize * 3;
export class PowerRelay extends Block {
  network = new RelayNetwork(this.world);
  _extension = 0;
  baseImg = "error";
  poleImg = "error";
  poleBaseImg = "error";
  topImg = "error";
  range = 32;
  walkable = true;
  wireColour = col.from(255, 230, 170);
  init() {
    super.init();
    this.wireColour = col.withA(col.convert(this.wireColour), 96);
  }
  tick() {
    if (!this.network.world) this.network.world = this.world;
    if (this._extension < extension) {
      if (this._extension === extension - 1) this.resetConnections();
      this._extension++;
    }
    for (const p of this.network.positions) {
      if (!this.world.getBlock(index.col(p), index.row(p))?.network) {
        this.network.positions.delete(p);
        this.network.update();
      }
    }
    this.network.tick();
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
    for (let i = 1; i < 12; i++)
      ImageContainer.draw(
        this.poleImg,
        this.x,
        this.y - (i * this._extension) / 12,
        blockSize,
        blockSize * 0.25,
      );
    const top = this.y - this._extension * 0.9166666667;
    push();
    noFill();
    col.stroke(this.wireColour);
    strokeWeight(6);
    for (const p of this.network.positions) {
      line(this.x, top, index.col(p) * blockSize, (index.row(p) - 1) * blockSize);
    }
    strokeWeight(3);
    for (const p of this.network.positions) {
      line(this.x, top, index.col(p) * blockSize, (index.row(p) - 1) * blockSize);
    }
    pop();
    ImageContainer.draw(this.topImg, this.x, top, blockSize, blockSize);
  }
  break(t) {
    if (super.break(t)) {
      this.network.clear();
      return true;
    }
    return false;
  }
  resetConnections() {
    this.network.clear();
    const candidates = this.world.blocksInSquare(this.gridX, this.gridY, this.range);
    for (const b of candidates)
      if (b instanceof PowerPylon) {
        b.network.parent = this.network;
        this.network.add(b.gridX, b.gridY);
        const poses = this.pos
          .addXY(0, -this._extension * 0.9166666667)
          .multiLerp(b.pos.addXY(0, -b._extension * 0.875), Math.ceil(this.range * 1.5));
        effectTimer.repeat(
          () =>
            this.world.particles.push(
              new LightningParticle(
                poses,
                15,
                [this.wireColour, col.withA(this.wireColour, 0)],
                0,
                8,
                0,
                10,
                1,
                2,
              ),
            ),
          3,
          4,
        );
      }
    this.network.update();
  }
  interaction() {
    if (keyIsDown(SHIFT)) {
      this.activated();
      return true;
    }
  }
  activated() {
    this.network.clear();
    this._extension = 0;
  }
  createExtendedDetails() {
    return `#=-Pylon Connections:\n  #d-${this.range} tiles#-- connection range`;
  }
}
export class CoreRelay extends PowerRelay {
  network = new ConnectedRelayNetwork(this.world);
}
