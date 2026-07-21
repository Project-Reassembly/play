import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { constructFromRegistry, constructFromType } from "../../core/constructor.js";
import { roundNum } from "../../core/number.js";
import { TypeRegistries } from "../../core/registry.js";
import { ui } from "../../core/ui.js";
import Integrate from "../../lib/integrate.js";
import { debug } from "../../play/debug.js";
import { game } from "../../play/game.js";
import { pointInRectC } from "../physical.js";
import {
  actionFromString,
  AddFlagAction,
  AddGlobalFlagAction,
  ChangeRelationAction,
  DialogueAction,
  PlaceholderTextDialogueAction,
  PromoteToBestFriendAction,
  PromoteToMortalEnemyAction,
  RemoveFlagAction,
  RemoveGlobalFlagAction,
} from "./actions.js";
import { InteractableEntity } from "./interactable-entity.js";
import { RelationManager } from "./relations.js";

/** Something you can say to an NPC. */
class DialogueOption {
  /** @type {(string | Integrate.Unconstructed<DialogueAction>)[]} */
  actions = [];
  text = "";
  id;
  colour = col.accent;
  /** @type {Set<string>} */
  excludeFlags = new Set();
  /** @type {DialogueAction[]} */
  #actions = [];
  static #autoID = 0;
  #id;
  /** @type {CMFT.Drawer} */
  #drawer;
  /** @type {CMFT.Drawer} */
  #tooltip;
  /** Relative x position. */
  x = 0;
  /** Overall change in relation. */
  relchange = 0;

  init() {
    this.colour = col.convert(this.colour);
    this.excludeFlags = new Set(this.excludeFlags);

    // expand shorthand
    this.#actions = this.actions
      .map((x) => {
        if (typeof x !== "string")
          return constructFromRegistry(x, TypeRegistries.dialogue, "no-op");
        return actionFromString(x);
      })
      .filter((x) => x instanceof DialogueAction);
    delete this.actions;
    this.#drawer = CMFT.drawer(this.text, 25, 20);
    delete this.text;
  }
  recreateTooltip(manager) {
    // relation change indicator
    let relc = 0,
      tt = "",
      onlyflags = true;
    this.#actions.forEach((a) => {
      const t = a.text(manager);
      if (t && t.length > 0) tt += t + "\n";
      if (a instanceof ChangeRelationAction) relc += a.change;
      if (
        !(
          a instanceof AddFlagAction ||
          a instanceof AddGlobalFlagAction ||
          a instanceof RemoveFlagAction ||
          a instanceof RemoveGlobalFlagAction ||
          a instanceof PlaceholderTextDialogueAction
        )
      )
        onlyflags = false;
    });
    this.relchange = relc;

    if (onlyflags) this.colour = CMFT.Decoration.colours[7];

    const cc = CMFT.Collection.createWrapped(tt.trim(), 40);
    this.#tooltip = cc.length > 0 ? cc.drawer(20) : null;
  }
  /** @param {DialogueManager} manager  */
  choose(manager) {
    for (const a of this.#actions) {
      a.do(manager);
    }
  }
  /** @readonly */
  get cmft() {
    return this.#drawer;
  }
  /** @readonly */
  get tooltip() {
    return this.#tooltip;
  }
  /** @readonly */
  get makesBF() {
    return this.#actions.some((x) => x instanceof PromoteToBestFriendAction);
  }
  /** @readonly */
  get makesME() {
    return this.#actions.some((x) => x instanceof PromoteToMortalEnemyAction);
  }
}

class DialogueFragment {
  /** @type {DialogueOption[]} */
  options = [];
  /** @type {Set<string>} */
  positive = new Set();
  /** @type {Set<string>} */
  negative = new Set();
  constructor(opts = [], pos = [], neg = []) {
    this.options = new Set(opts);
    this.positive = new Set(pos);
    this.negative = new Set(neg);
  }
  /** @param {Set<string>} flags  */
  canShow(flags) {
    return this.positive.isSubsetOf(flags) && this.negative.isDisjointFrom(flags);
  }
}

const dialogueWidth = 1000;
const dialogueHeight = 125;

export class DialogueManager {
  /** @type {CMFT.Drawer} */
  static noTxt = null;
  /** The entity that this belongs to. @type {InteractableEntity} */
  entity = null;
  /** Choices made during the conversation. @type {Set<string>} */
  flags = new Set();

  /** Integrate-defined conversation map based on flags. Won't exist for long. @type {({[flags: string]: {line:string,options:(Integrate.Unconstructed<DialogueOption>[] | {[text:string]:(Integrate.Unconstructed<DialogueAction>[])|Integrate.Unconstructed<DialogueOption>})}})} */
  conversations = {};
  /** Integrate-defined extra options which appear based on certain conditions. Won't exist for long. @type {({[flags: string]: (Integrate.Unconstructed<DialogueOption>[] | {[text:string]:Integrate.Unconstructed<DialogueAction>[]})})} */
  fragments = {};

  /** Map for flags -> conversations. @type {[flags: Set<string>,line:string,options:DialogueOption[]][]} */
  #conversations = [];
  /** Extra options which appear based on certain conditions. @type {DialogueFragment[]}  */
  #fragments = [];
  /** Currently shown available options. @type {DialogueOption[]} */
  #options = null;
  /** Text that the manager is currently showing. @type {CMFT.Drawer} */
  #txt = null;
  /** Title text that the manager is currently showing. @type {CMFT.Drawer} */
  #title = null;
  constructor() {
    DialogueManager.noTxt = CMFT.drawer("[They have nothing to say.]", 20).noBG();
  }
  static normaliseOptions(options) {
    return (
      options ?
        Array.isArray(options) ?
          options.map((x) => constructFromType(x, DialogueOption))
        : Object.entries(options).map(([text, actions]) => {
            if (Array.isArray(actions)) return constructFromType({ text, actions }, DialogueOption);
            else {
              actions.text = text;
              return constructFromType(actions, DialogueOption);
            }
          })
      : []
    );
  }
  init() {
    this.#conversations = Object.entries(this.conversations).map(([str, val], i, a) => {
      const v = DialogueManager.normaliseOptions(val.options);

      const l = val.line ?? `${val}`;
      return str === "*" ? [new Set(), l, v] : [new Set(str.split(",").filter((x) => x)), l, v];
    });
    this.#fragments = Object.entries(this.fragments).map(([str, val], i, a) => {
      const v = DialogueManager.normaliseOptions(val);

      const flags = str.split(",");
      return str === "*" ?
          new DialogueFragment(v)
        : new DialogueFragment(
            v,
            flags.filter((x) => x && !x.startsWith("!")),
            flags.filter((x) => x && x.startsWith("!")).map((f) => f.substring(1)),
          );
    });
    delete this.fragments;
    delete this.conversations;
  }
  /** @param {DialogueOption[]} opts  */
  initOptionArray(opts, conv) {
    const l = opts.length;
    for (let oi = 0; oi < l; oi++) {
      const v = opts[oi];

      v.id ??= `${this.entity.registryName}-${conv}-${oi}`;
      v.recreateTooltip(this);

      if (v.makesBF) v.colour = RelationManager.bfCols[0];
      else if (v.makesME) v.colour = RelationManager.meCols[1];
    }
  }
  postEntInit() {
    // entity-based stuff
    this.#conversations.forEach(([fs, , opts]) => this.initOptionArray(opts, `{${[...fs]}}`));
    this.#fragments.forEach((f) =>
      this.initOptionArray(f.options, `frag{${[...f.positive]}\\${[...f.negative]}}`),
    );

    this.#title = CMFT.drawer(this.entity.name, 20, dialogueWidth / 12).noBG();
  }
  /** Update the manager's text lines from the current flags. */
  updateNode() {
    // preload bf/me stuff
    const prel = game.player.relations.getRelation(this.entity.registryName);

    const colorArray =
      prel >= 1.5 ? RelationManager.bfCols
      : prel <= -1.5 ? RelationManager.meCols
      : RelationManager.relationCols;

    // auto flags <...>
    if (prel >= 1.5) this.flags.add("<bf>");
    else this.flags.delete("<bf>");
    if (prel <= -1.5) this.flags.add("<me>");
    else this.flags.delete("<me>");
    if (prel === 1 || prel === 2 || prel === -1.5) this.flags.add("<max+>");
    else this.flags.delete("<max+>");
    if (prel === -1 || prel === -2 || prel === 1.5) this.flags.add("<max->");
    else this.flags.delete("<max->");

    /** @type {[number, string, DialogueOption[]][]} */
    const possibilities = [];
    const allflags = game.player.flags.size > 0 ? this.flags.union(game.player.flags) : this.flags;
    for (const [flags, text, opts] of this.#conversations) {
      if (flags.isSubsetOf(allflags)) possibilities.push([flags.size, text, opts]);
    }
    let minrel = -1,
      ln = null,
      opts = null;
    for (const [rel, line, options] of possibilities) {
      if (rel > minrel) {
        ln = line;
        opts = options;
        minrel = rel;
      }
    }
    if (ln)
      this.#txt = CMFT.drawer(
        debug.flags ?
          `${ln}\n#8ilocal {#=i${[...this.flags].join("#8i,#=i")}#8i}\nglobal {#=i${[...game.player.flags].map((x) => `#ni*#=i${x.substring(1)}#8i`).join(",")}#8i}`
        : ln,
        20,
        Math.floor(dialogueWidth / 12),
      ).noBG();
    else this.#txt = DialogueManager.noTxt;
    this.#options = opts.filter((v) => v.excludeFlags.isDisjointFrom(allflags));
    for (const f of this.#fragments) {
      if (f.canShow(allflags)) this.#options.push(...f.options);
    }

    // precalc relative positions
    let tw = 0,
      mh = 40;
    for (const opt of this.#options) {
      tw += opt.cmft.width + 40;
      if (opt.cmft.height > mh) mh = opt.cmft.height;
    }
    tw -= 40;

    let cx = -tw * 0.5;
    for (const opt of this.#options) {
      opt.x = cx;
      cx += 40 + opt.cmft.width;

      opt.recreateTooltip(this);
      if (opt.relchange > 0) {
        opt.colour = colorArray.at(-1);
      } else if (opt.relchange < 0) {
        opt.colour = colorArray[0];
      }
    }
  }
  draw(translateX, translateY) {
    push();
    strokeWeight(5);
    col.stroke(col.accent);
    col.fill(col.black);
    const drawer = this.#txt ?? DialogueManager.noTxt;
    let my = 5;
    const dh = Math.max(dialogueHeight, drawer.height);
    {
      // Main text
      const w = Math.max(dialogueWidth, drawer.width);
      rect(0, 0, w, dh);
      noStroke();
      drawer.draw(5 - w * 0.5, my - dh * 0.5, col.white, col.accent);
      my += dh * 0.5;
    }
    if (this.#options) {
      // Options
      for (const opt of this.#options) {
        opt.cmft.draw(opt.x, my + 20, col.white, opt.colour);
      }
      const h = this.getHoveredComponent(translateX, translateY);
      if (h?.tooltip) {
        let y = ui.mouse.y + 20;
        if (y + h.tooltip.height + 10 > 540) y = 540 - (h.tooltip.height + 10);
        h.tooltip.draw(ui.mouse.x - translateX + 20, y - translateY, col.white, h.colour);
      }
    }
    const start = dialogueWidth / 3,
      rely = -dh * 0.5 - 20,
      rel = game.player.relations.getRelation(this.entity.registryName);
    let relpos = rel,
      relscale = 0.5,
      cols = RelationManager.relgradient;
    if (rel >= 1.5) {
      relpos -= 1.75;
      relscale = 2;
      cols = RelationManager.bfgradient;
    } else if (rel <= -1.5) {
      relpos += 1.75;
      relscale = 2;
      cols = RelationManager.megradient;
    }
    const mx = start * (1 + relpos * relscale);
    noFill();
    strokeWeight(2);
    stroke(0);
    image(cols, start, rely, dialogueWidth / 3, 20);
    rect(start, rely, dialogueWidth / 3 + 2, 22);
    line(mx, rely - 15, mx, rely + 15);
    textSize(20);
    textAlign(RIGHT);
    col.stroke(col.accent);
    col.fill(col.accent);
    text(`${roundNum(rel * 100)}%`, start * 0.5 - 20, rely);
    pop();
  }
  getHoveredComponent(basex, basey) {
    const my = Math.max(dialogueHeight, (this.#txt ?? DialogueManager.noTxt).height) * 0.5 + 25;
    // console.log(`test click at ${ui.mouse.x},${ui.mouse.y}`);
    for (const opt of this.#options) {
      // console.log(
      //   `component at ${x + opt.x},${y + my} to ${x + opt.x + opt.cmft.width},${y + my + opt.cmft.height}`,
      // );
      if (
        pointInRectC(
          ui.mouse.x,
          ui.mouse.y,
          basex + opt.x - 10,
          basey + my - 10,
          opt.cmft.width + 20,
          opt.cmft.height + 20,
        )
      ) {
        return opt;
      }
    }
    return null;
  }
  tryClick(x, y) {
    const c = this.getHoveredComponent(x, y);
    if (c) {
      c.choose(this);
      this.updateNode();
      if (debug.flags) game.player.dialogue.forEach((c) => c.updateNode());
      return true;
    }
    return false;
  }
  /** Currently shown text body. @readonly */
  get text() {
    return this.#txt;
  }
  /** Currently shown choices. @readonly */
  get choices() {
    return this.#options;
  }
  serialise() {
    return { flags: [...this.flags] };
  }
  static deserialise(base, created) {
    base.flags = new Set(created.flags);
    return base;
  }
}
