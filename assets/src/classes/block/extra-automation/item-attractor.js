import { col } from "../../../core/color.js";
import { construct } from "../../../core/constructor.js";
import { ImageContainer } from "../../../core/image.js";
import { roundNum, Vector } from "../../../core/number.js";
import { effectTimer } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { WaveParticle } from "../../effect/wave-particle.js";
import { Component } from "../../entity/entity-part.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import { ShootableObject } from "../../physical.js";
import { Container } from "../container.js";

export class ItemAttractor extends Container {
  powerDraw = 1.66666666667;
  maxPower = 100;
  pointerDirection = 0;
  pointerImg = "error";
  baseImg = "error";
  range = 450;
  beamX = 8;
  pullSpeed = 2;
  beamColour = col.from(255, 230, 170);
  /** @type {DroppedItemStack?} */
  #itemPulling = null;
  /** @type {Component} */
  pointer = null;
  #active = false;
  init() {
    super.init();
    this.pointer = construct(this.pointer, "component");
    this.beamColour = col.withA(col.convert(this.beamColour), 96);
  }
  tick() {
    const item = this.#itemPulling;
    if (item) {
      this.#active = this.usePower()
      if (this.#active) {
        if (
          !item.remove &&
          item._puller === this &&
          !item.item.isEmpty() &&
          this.isWithinRange(item, this.range) &&
          this.inventory.canAddItem(item.item.item, item.item.count)
        ) {
          if (this.isWithinRange(item, this.pullSpeed)) {
            this.inventory.addItem(item.item.item, item.item.count);
            item.remove = true;
            this.#itemPulling = null;
          } else {
            this.pointerDirection = item.pos.sub(this.pos).angleRad;
            item.moveTowards(this.x, this.y, this.pullSpeed, 360, false, true);
          }
        } else this.#itemPulling = null;
      }
    } else {
      for (const searchItem of this.world.items) {
        if (
          !searchItem._puller && 
          !searchItem.item.isEmpty() &&
          this.isWithinRange(searchItem, this.range) &&
          this.inventory.canAddItem(searchItem.item.item, searchItem.item.count)
        ) {
          this.#itemPulling = searchItem;
          searchItem._puller = this;

          effectTimer.repeat(
            () => {
              const start = this.pos.add(
                  new Vector(this.beamX, 0).rotateRad(this.pointerDirection),
                ),
                end = searchItem.pos;
              this.world.particles.push(
                new WaveParticle(
                  start.x,
                  start.y,
                  15,
                  0,
                  blockSize,
                  [this.beamColour, col.withA(this.beamColour, 0)],
                  5,
                  0,
                ),
                new WaveParticle(
                  end.x,
                  end.y,
                  15,
                  0,
                  blockSize,
                  [this.beamColour, col.withA(this.beamColour, 0)],
                  5,
                  0,
                ),
              );
            },
            3,
            4,
          );

          break;
        }
      }
    }
  }
  draw() {
    ImageContainer.draw(this.baseImg, this.x, this.y, blockSize, blockSize);
    ShootableObject.prototype.draw.call(this);
  }
  postDraw() {
    this.pointer.draw(this.x, this.y, (this.pointerDirection / Math.PI) * 180, 0, 0);
    super.postDraw();
    if (this.#itemPulling && this.#active) {
      const start = this.pos.add(new Vector(this.beamX, 0).rotateRad(this.pointerDirection));
      push();
      noFill();
      col.stroke(this.beamColour);
      strokeWeight(3);
      line(start.x, start.y, this.#itemPulling.x, this.#itemPulling.y);
      strokeWeight(1.5);
      line(start.x, start.y, this.#itemPulling.x, this.#itemPulling.y);
      pop();
    }
  }
  createExtendedDetails() {
    return `${super.createExtendedDetails()}\n#=-Item Attraction:\n  #d-${roundNum(this.range / blockSize, 2)} tiles#-- grab range\n  #i-${roundNum((this.pullSpeed * 60) / blockSize, 2)} tiles/s#-- pull speed`;
  }
}
