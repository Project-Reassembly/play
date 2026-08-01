import { index } from "../../core/number.js";

import { World } from "./world.js";
/**
 * @import {idx} from "../../core/number.js"
 * @import { Block } from "../block/block.js";
 */
/**Represents a set of virtual power connections between blocks. */
class PowerNetwork {
  constructor(world) {
    this.world = world;
  }
  static debug = false;
  /** All block positions which provide power to or require power from this network.
   * @type {Set<idx>}
   */
  positions = new Set();
  /**@type {World} */
  world = null;
  /** Adds a position to the network. */
  add(x, y) {
    this.positions.add(index.of(x, y));
  }
  /** Removes all positions that match the x and y coordinates. */
  remove(x, y) {
    this.positions.delete(index.of(x, y));
  }
  /** Remove all positions. */
  clear() {
    this.positions.clear();
  }
  /** Checks whether this network has a node at a position. */
  has(x, y) {
    return this.positions.has(index.of(x, y));
  }
  tick() {
    //console.log("-- Power Network Tick Debug --");
    //>> Calculate how much power is available, and how much is needed
    //>> Also clean the array
    const providers = [],
      subscribers = [],
      buffers = [];
    for (const p of this.positions) {
      const blk = this.world.getBlock(index.col(p), index.row(p));
      if (blk) {
        if (blk.isProvider) providers.push(blk);
        else if (blk.powerDraw) subscribers.push(blk);
        else buffers.push(blk);
      } else this.positions.delete(p);
    }

    // console.log(">> main transfer");
    const balance = this.transfer(providers, subscribers);

    if (buffers.length > 0) {
      // console.log(">> buffer transfer");
      // excess => store in buffers
      if (balance === 1) this.transfer(providers, buffers, (c) => c.maxPower - c.power || 0);
      // deficit => use power from buffers
      else if (balance === -1) this.transfer(buffers, subscribers);
    }
  }
  /** Transfers as much power from `providers` as is possible to `subscribers` proportionally. \
   * Returns `-1` if there is a relative power deficit (more demand than available), `1` if there is an excess (more available than required) and `0` if power is balanced.
   * @param {Block[]} [providers=[]]
   * @param {Block[]} [subscribers=[]]
   * @param {((c: Block) => number)?} [demandFn=null] Provider for the demand contributed by each block.
   */
  transfer(providers = [], subscribers = [], demandFn = null) {
    const available = providers.reduce((p, c) => p + (c.power || 0), 0);
    const demand =
      demandFn ?
        subscribers.reduce((p, c) => p + (+demandFn(c) || 0), 0)
      : subscribers.reduce((p, c) => p + c.powerDraw, 0);

    //   console.log(`${available} power available, contributing providers:`, providers);
    //   console.log(`${demand} power wanted, contributing subscribers:`, subscribers);

    if (demand === 0) return +(available > 0);

    let sent = 0;
    //>> Distribute power (spread proportionally)
    for (const block of subscribers) {
      const pd = demandFn ? demandFn(block) : block.powerDraw;
      //>> Add power to subscribers
      const toSend = (pd / demand) * available;

      // console.log(
      //   `Sending (up to) ${toSend} power to ${block.gridX}, ${block.gridY} (wants ${pd})`,
      // );
      sent += toSend;
      sent -= block.sendPower(toSend);
      // console.log(sent + " total power sent");
    }
    //>> Now that the amount actually sent is known, take power from providers (not equally)
    for (const block of providers) {
      // console.log(`Taking (up to) ${sent} power from ${block.gridX}, ${block.gridY}`);
      sent = block.drawPower(sent);
      // console.log(sent + " power left to take");
    }
    //>> in case something broke
    //{
    //   if (sent > 0) console.warn("Energy being destroyed!\nAmount: " + sent);

    //   if (sent < 0) console.warn("Energy being created!\nAmount: " + -sent);
    // }
    return (
      available > demand ? 1
      : available === demand ? 0
      : -1
    );
  }
  serialise() {
    return { positions: [...this.positions].map(index.vec) };
  }
  /** @param {typeof PowerNetwork.prototype.serialise extends () => infer R ? R : never} created  */
  static deserialise(created) {
    let net = new this();
    net.positions = new Set((created.positions ?? []).map(index.ofvec));
    return net;
  }
}
export { PowerNetwork };

globalThis.pn = PowerNetwork;
