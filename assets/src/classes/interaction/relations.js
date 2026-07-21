import { col } from "../../core/color.js";
import { clamp } from "../../core/number.js";
import { game } from "../../play/game.js";

/** Manages a player's relations with NPC types.
 * Relations lie on one of three spectra:
 * ```
 *   -2      -1.5           -1     0       +1         +1.5    +2
 *  black - purple    |    red - yellow - green   |   blue - pink
 *   mortal enemy          normal friend/enemy        best friend
 * ```
 * Only the middle one is occupied by more than one NPC at a time, and each of the others may have at most one NPC - the player can have one 'best friend', and one 'mortal enemy'.\
 * When on the extremes, NPCs **cannot** fall back onto the middle scale, unless a different entity takes their place.\
 *
 * Each type has its own relation, but each entity instance with the same registry name shares the relation.
 */
export class RelationManager {
  /** Raw relation numbers for each entity type. Not really useful alone. @type {Map<string,number>}*/
  #raw = new Map();
  /** Single entity which is the player's 'best friend' - blue to pink relations, allows values of +1.5 to +2 @type {string?}*/
  #bf = null;
  /** Single entity which is the player's 'mortal enemy' - purple to black negative relations, allows values of -1.5 to -2 @type {string?}*/
  #me = null;
  /** Makes an entity type your best friend. Use `null` to clear it. @param {string?} npc */
  setBestFriend(npc) {
    // demote previous best friend
    if (this.#bf) this.#raw.set(`${this.#bf}`, 1);
    // add new one
    if (npc) this.#raw.set(`${npc}`, 1.5);
    this.#bf = npc;
    game.player.dialogue.forEach((v) => v.updateNode());
  }
  /** Makes an NPC your friend - a flat +1 relation. Will override BF/ME mechanics. @param {string} npc */
  addFriend(npc) {
    const snpc = `${npc}`;
    this.#raw.set(snpc, 1);
    if (this.#bf === snpc) this.#bf = null;
    if (this.#me === snpc) this.#me = null;
  }
  /** Makes an NPC neutral - a flat 0 relation. Will override BF/ME mechanics. @param {string} npc */
  addNeutral(npc) {
    const snpc = `${npc}`;
    this.#raw.set(snpc, 0);
    if (this.#bf === snpc) this.#bf = null;
    if (this.#me === snpc) this.#me = null;
  }
  /** Makes an NPC your enemy - a flat -1 relation. Will override BF/ME mechanics. @param {string} npc */
  addEnemy(npc) {
    const snpc = `${npc}`;
    this.#raw.set(snpc, -1);
    if (this.#bf === snpc) this.#bf = null;
    if (this.#me === snpc) this.#me = null;
  }
  /** Makes an entity type your mortal enemy. Use `null` to clear it. @param {string?} npc */
  setMortalEnemy(npc) {
    // demote previous mortal enemy
    if (this.#me) this.#raw.set(`${this.#me}`, -1);
    // promote new one
    if (npc) this.#raw.set(`${npc}`, -1.5);
    this.#me = npc;
    game.player.dialogue.forEach((v) => v.updateNode());
  }

  /** Returns the relation value for an NPC. @param {string} npc */
  getRelation(npc) {
    return this.#raw.get(`${npc}`) ?? 0;
  }
  /** Returns the relation value for an NPC. Will constrain properly. @param {string} npc */
  setRelation(npc, number) {
    if (this.#bf === npc) this.#raw.set(npc, clamp(+number, 1.5, 2));
    else if (this.#me === npc) this.#raw.set(npc, clamp(+number, -2, -1.5));
    else this.#raw.set(`${npc}`, clamp(+number, -1, 1));
  }
  /** Changes the relation value for an NPC by adding a number. Use negative numbers to reduce relation instead. Will constrain properly. @param {string} npc */
  addRelation(npc, number) {
    if (this.#bf === npc) this.#raw.set(npc, clamp((this.#raw.get(npc) ?? 0) + number, 1.5, 2));
    else if (this.#me === npc)
      this.#raw.set(npc, clamp((this.#raw.get(npc) ?? 0) + number, -2, -1.5));
    else this.#raw.set(`${npc}`, clamp((this.#raw.get(npc) ?? 0) + number, -1, 1));
  }

  /** The current 'best friend' entity type. @readonly */
  get bestFriend() {
    return this.#bf;
  }
  /** The current 'mortal enemy' entity type. @readonly */
  get mortalEnemy() {
    return this.#me;
  }
  serialise() {
    return { relations: [...this.#raw.entries()] };
  }
  /** @param {typeof RelationManager.prototype.serialise extends () => infer R ? R : never} created  */
  static deserialise(created) {
    const rm = new this();
    const raw = new Map(created.relations);
    for (const [type, relation] of raw) {
      if (relation >= 1.5) rm.setBestFriend(type);
      else if (relation <= -1.5) rm.setMortalEnemy(type);
    }
    rm.#raw = raw;
    return rm;
    console.log(rm);
  }
  /** @type {[import("../../core/color.js").color,import("../../core/color.js").color,import("../../core/color.js").color]} */
  static relationCols = [col.red, col.yellow, col.green];
  /** @type {[import("../../core/color.js").color,import("../../core/color.js").color]} */
  static bfCols = [col.cyan, col.from(255, 160, 170)];
  /** @type {[import("../../core/color.js").color,import("../../core/color.js").color]} */
  static meCols = [col.black, col.from(128, 0, 255)];
  static createRelationGradients() {
    const rg = createGraphics(100, 1);
    const bfg = createGraphics(100, 1);
    const meg = createGraphics(100, 1);
    rg.noStroke();
    bfg.noStroke();
    meg.noStroke();
    for (let x = 0; x < 100; x++) {
      col.fillOn(rg, col.interp(this.relationCols, x / 99));
      col.fillOn(bfg, col.interp(this.bfCols, x / 99));
      col.fillOn(meg, col.interp(this.meCols, x / 99));
      rg.rect(x, 0, x + 1, 1);
      bfg.rect(x, 0, x + 1, 1);
      meg.rect(x, 0, x + 1, 1);
    }
    this.relgradient = rg.get();
    this.bfgradient = bfg.get();
    this.megradient = meg.get();
  }
  static relgradient;
  static bfgradient;
  static megradient;
}
