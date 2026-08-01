import { index } from "../../../core/2D-array.js";
import { col } from "../../../core/color.js";
import { constructFromType } from "../../../core/constructor.js";
import { ImageContainer } from "../../../core/image.js";
import { effectTimer } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { LightningParticle } from "../../effect/lightning-particle.js";
import { ShootableObject } from "../../physical.js";
import {
  DamageComponent,
  ExtraUpdatesComponent,
  LinearVFXTraceComponent,
} from "../../projectile/bullet-components.js";
import { BulletModel } from "../../projectile/bullet-model.js";
import { PowerNetwork } from "../../world/power-network.js";
import { Block } from "../block.js";

/** Connects blocks to its power grid. Not the most advanced, though. */
export class PowerPylon extends Block {
  network = new PowerNetwork(this.world);
  _extension = 0;
  baseImg = "error";
  poleImg = "error";
  poleBaseImg = "error";
  topImg = "error";
  range = 5;
  walkable = true;
  wireColour = col.from(255, 230, 170);
  init() {
    super.init();
    this.wireColour = col.withA(col.convert(this.wireColour), 96);
  }
  tick() {
    if (!this.network.world) this.network.world = this.world;
    if (this._extension < blockSize) {
      if (this._extension === blockSize - 1) this.resetConnections();
      this._extension++;
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
    for (let i = 1; i < 4; i++)
      ImageContainer.draw(
        this.poleImg,
        this.x,
        this.y - i * this._extension * 0.25,
        blockSize,
        blockSize * 0.25,
      );
    const top = this.y - this._extension * 0.875;
    push();
    noFill();
    col.stroke(this.wireColour);
    strokeWeight(3);
    for (const p of this.network.positions) {
      line(this.x, top, index.col(p) * blockSize, index.row(p) * blockSize);
    }
    strokeWeight(1.5);
    for (const p of this.network.positions) {
      line(this.x, top, index.col(p) * blockSize, index.row(p) * blockSize);
    }
    pop();
    ImageContainer.draw(this.topImg, this.x, top, blockSize, blockSize);
  }
  resetConnections() {
    this.network.clear();
    const candidates = this.world.blocksInSquare(this.gridX, this.gridY, this.range);
    for (const b of candidates)
      if (b && b.maxPower && !(b instanceof PowerPylon)) {
        this.network.add(b.gridX, b.gridY);
        const poses = this.pos
          .addXY(0, -this._extension * 0.875)
          .multiLerp(b.pos, Math.ceil(this.range * 1.5));
        effectTimer.repeat(
          () =>
            this.world.particles.push(
              new LightningParticle(
                poses,
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
      }
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
    return `#=-Power Connections:\n  #d-${this.range} tiles#-- connection range`;
  }
}

/** Special type of pylon which is actually a turret too. Will still distribute power, but also connects to itself to charge. */
export class DischargePylon extends PowerPylon {
  #discharging = false;
  powerDraw = 1000;
  maxPower = 10000;
  blastEffect = "none";
  zapEffect = "none";
  zapDamage = 5;
  zaps = 10;
  /** @type {BulletModel} */
  #shot = constructFromType(
    {
      components: [
        { type: "line-trace" },
        { type: "movement", speed: blockSize * 0.25 },
        { type: "extra-updates", amount: 999 },
        { type: "damage", damageType: "electric" },
      ],
    },
    BulletModel,
  );
  init() {
    super.init();
    const us = Math.ceil(this.range * 4);
    this.#shot.lifetime = us;
    this.#shot.get(ExtraUpdatesComponent).amount = us;
    this.#shot.get(LinearVFXTraceComponent).effect = this.zapEffect;
    this.#shot.get(DamageComponent).amount = this.zapDamage;
  }
  tick() {
    if (!this.network.world) this.network.world = this.world;
    if (this.power >= this.powerDraw) {
      if (this.#discharging) {
        if (this._extension > 4) {
          this._extension -= 4;
        } else {
          this.shoot();
          this._extension = 0;
          this.#discharging = false;
        }
      } else if (this._extension < blockSize) {
        if (this._extension === blockSize - 1) this.resetConnections();
        this._extension++;
      } else if (this._extension === blockSize)
        for (const e of this.world.entities)
          if (this.distanceTo(e) < this.range * blockSize && e.team !== this.team)
            this.#discharging = true;
    }
    this.network.tick();
  }
  shoot() {
    this.power -= this.powerDraw;
    this.emit(this.blastEffect);
    const targets = [];
    for (const e of this.world.entities) {
      if (this.distanceTo(e) < this.range * blockSize && e.team !== this.team) targets.push(e);
    }

    if (targets.length > 0) {
      let zaps = this.zaps;

      o: while (zaps > 0) {
        for (const t of targets) {
          this.#shot.emit(
            this.x,
            this.y - this._extension,
            1,
            t.pos.subXY(this.x, this.y - this._extension).angle,
            0,
            0,
            this.world,
            this,
            1,
            1,
          );
          zaps--;
          if (zaps <= 0) break o;
        }
      }
    }
  }
  resetConnections() {
    super.resetConnections();
    this.network.add(this.gridX, this.gridY);
  }
  createExtendedDetails() {
    return `${super.createExtendedDetails()}\n#=-Discharge:\n  #c-${this.zapDamage}#-- electric damage\n  #3-${this.zaps}#-- max targets`;
  }
}