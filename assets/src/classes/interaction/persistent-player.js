import { Player } from "../entity/player.js";
import { DialogueManager } from "./dialogue.js";
import { RelationManager } from "./relations.js";
import { TradingManager } from "./trading.js";

export class PersistentPlayer {
  /** @type {Player} */
  entity = null;
  money = 10000;
  /** Current relations with every NPC. */
  relations = new RelationManager();
  /** Current available NPC conversations. @type {Map<string, DialogueManager>} */
  dialogue = new Map();
  /** Current available NPC trades. @type {Map<string, TradingManager>} */
  trades = new Map();
  /** Saved global dialogue flags to be shared between managers. @type {Set<string>} */
  flags = new Set();
  /** Saved local dialogue flags to be added to each manager. @type {Map<string, Set<string>>} */
  savedLocalFlags = new Map();

  /** Current active NPC conversation. @type {DialogueManager?} */
  conversation = null;
  /** Current active NPC trades. @type {TradingManager?} */
  trade = null;
  drawNPCShit(diX, diY) {
    push();
    translate(diX, diY);
    if (this.conversation) {
      this.conversation.draw(diX, diY);
    }
    pop();
    if (this.trade) {
      this.trade.draw(-380,0);
    }
  }
  reset() {
    this.entity = null;
    this.money = 10000;
  }
  serialise() {
    return {
      money: this.money,
      relations: this.relations.serialise(),
      flags: [...this.flags].map((f) => f.substring(1)),
      savedLocalFlags: [...this.dialogue.entries()].map(([s, m]) => [s, [...m.flags]]),
    };
  }
  /** @param {typeof PersistentPlayer.prototype.serialise extends () => infer R ? R : never} created  */
  static deserialise(created) {
    const plr = new this();
    plr.money = created.money ?? 10000;
    plr.relations = RelationManager.deserialise(created.relations ?? {});
    plr.flags = new Set((created.flags ?? []).map((f) => `*${f}`));
    plr.savedLocalFlags = new Map((created.savedLocalFlags ?? []).map(([e, f]) => [e, new Set(f)]));
    console.log(plr);
    return plr;
  }
}
