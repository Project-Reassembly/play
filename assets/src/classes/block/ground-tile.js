import { RegisteredItem } from "../../core/registered-item.js";
import { Registries } from "../../core/registry.js";
import Integrate from "../../lib/integrate.js";
import { blockSize } from "../../scaling.js";

export class GroundTile extends RegisteredItem {
  speedMultiplier = 1;
  appliedStatus = "none";
  appliedStatusDuration = 0;
  buildable = true;
  drillSpeed = 1;

  image = "error";
  static draw(type, x, y) {
    const i = this.#tiles[type]?.image ?? "error";
    const img = Registries.images.get(i);
    // if (ui.camera.zoom < 0.2) img.drawCol(x, y, blockSize, blockSize);
    /*else*/img.draw(x, y, blockSize, blockSize);
    // console.log("drawing " + i + " at " + x * blockSize + ", " + y * blockSize);
    //drawImg(i, x, y, blockSize, blockSize);
  }
  static entityWalksOn(entity, type) {
    let tile = this.#tiles[type];
    if (tile?.appliedStatus != null)
      entity.applyStatus(
        Registries.statuses.get(tile.appliedStatus ?? "none"),
        tile.appliedStatusDuration ?? 240,
      );
  }
  static randomTick(tile, x, y) {}
  /** @type {Integrate.Unconstructed<GroundTile>[]} */
  static #tiles = [];
  /** @type {string[]} */
  static #names = [];
  static reloadIDs() {
    this.#tiles.splice(0);
    this.#tiles.push(null);
    this.#names.splice(0);
    this.#names.push(null);
    Registries.tiles.forEach((i, n) => {
      this.#names.push(n);
      this.#tiles.push(i);
    });
    // console.log("Available tile types: ",this.#names)
    // console.log("With definitions: ",this.#tiles)
  }
  static exists(id) {
    return id > 0 && this.#names.length < id;
  }
  static getNumericalID(rname) {
    const i = this.#names.indexOf(rname);
    return i === -1 ? 0 : i;
  }
  static getTileFromID(idx = 0) {
    return this.#tiles[+idx || 0];
  }
  static getNameFromID(idx = 0) {
    return this.#names[+idx || 0];
  }
}

globalThis.GT = GroundTile;
