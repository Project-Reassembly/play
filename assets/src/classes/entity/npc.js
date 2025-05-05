import { EquippedEntity } from "./inventory-entity.js";
import { tru } from "../../core/number.js";
/** Character that the player can interact with.
 * Technically enemies should be classed as NPCs too, but this class is used for specifically *friendly* NPCs which the player can talk to.
 * Can have trades
 */
class NPC extends EquippedEntity {
  /**```json
   *            The Relation Scale
   *   [||||||||||||||||||||||||||||||||||||]
   *   -100%             0%              100%
   *  literal         Nothing         defend you
   *   murder                         with life
   * ```
   * Normal milestones:
   * - 100%: Will do pretty much anything, prices are zero
   * - -100%: The point of constant hostility
   */
  relation = 0;
  /**Trades are in the form
   * ```json
   * {
   *   "cost": (int),
   *   "items": [
   *     {
   *       "item": (rloc),
   *       "count": (int)
   *     }
   *   ]
   * }
   * ```
   */
  trades = [];
  //Relation modifiers
  violenceRelMod = 0.3; //-0.3% rel per damage
  violenceIncrease = 0.01; //+1% effect per positive rel (kind of) - like you more = more hurt when attacked
  tradeRelMod = 10; //+10% per trade
  tradeFalloff = 0.2; //each 20% less effective
  #trades = 0;
  //Personality
  defaultAI = "passive";
  aggression = 0.003; //Chance per tick to become hostile, scales (x * -relation/100): this value is at max -ve relation
  forgiveness = 0.02; //Chance while hostile to pacify, scales (x * (relation + 100)/1000): this value is at max -ve relation
  defensiveness = 0.005; //Chance per tick to become defensive, scales (x * 5 / (relation/100 + 1)): this value is at max -ve relation
  //behaviour mods
  defaultRange = -1; //Override for target range.
  defensiveRange = 200; //Radius of defended area.
  angerRange = 500; //Target range while hostile.
  //Price modifiers
  priceModPerRelation = 0.001; //Should be tiny. Some magic power stuff uses this for relation/price comparison. Essentially, they like you => low prices
  freeAt100 = true; //Will the price become zero at +100% relation?
  tradeRefusalThreshold = -65; //Relation value below which the NPC will not sell you anything
  //
  team = "npc";
  init() {
    super.init();
    if (this.defaultRange === -1) this.defaultRange = this.targetRange;
  }
  makeTrade(index) {
    this.relation += this.tradeRelMod * (1 - this.tradeFalloff) ** this.#trades;
    this.#trades++;
  }
  takeDamage(type, amount, source) {
    super.takeDamage(type, amount, source);
    if (source === game.player) {
      let relchange =
        (this.maxHealth / 250) *
        amount *
        (this.violenceRelMod * (1 + this.violenceIncrease) ** this.relation);
      this.relation -= relchange || 0.1;
    }
  }
  ai() {
    if (this.relation < -100) this.relation = -100;
    if (this.relation > 100) this.relation = 100;
    if (
      this.ispassive() &&
      tru(
        (this.defensiveness * -this.relation) /
          (Math.abs(this.relation) ** 2 / 100 + 1)
      )
    ) {
      this.defend();
    }
    if (!this.ishostile() && tru((this.aggression * -this.relation) / 100)) {
      this.anger();
    }
    if (
      !this.ispassive() &&
      tru((this.forgiveness * (this.relation + 100)) / 1000)
    ) {
      this.pacify();
    }
    super.ai();
  }
  ispassive = () => this.aiType == "passive";
  pacify = () => {
    this.aiType = "passive";
    this.targetRange = this.defaultRange;
  };
  isdefensive = () => this.aiType == "guard";
  defend = () => {
    this.aiType = "guard";
    this.targetRange = this.defensiveRange;
  };
  ishostile = () => this.aiType == "hostile";
  anger = () => {
    this.aiType = "hostile";
    this.targetRange = this.angerRange;
  };
  postDraw() {
    push();
    strokeWeight(1);
    stroke(0);
    fill(
      ...blendColours([0, 255, 0], [255, 0, 0], (this.relation + 100) / 200)
    );
    textAlign(CENTER);
    textSize(10);
    text(roundNum(this.relation, 1) + "%", this.x, this.y - this.height / 2);
    pop();
    super.postDraw();
  }
}
export { NPC };
