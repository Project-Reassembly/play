import { fonts } from "../play/font.js";
import * as CMFT from "./cmft.js";
import { col } from "./color.js";
import { Registries } from "./registry.js";

class CutsceneLine {
  static empty(time) {
    return new this(time);
  }
  constructor(time) {
    this.time = time;
  }
}
class CutsceneDisplayedText extends CutsceneLine {
  /** @type {CMFT.Drawer} */
  cmft;
  fade;
  /**@param {CMFT.Collection} text  */
  constructor(text, time, fade = true) {
    super(time);
    this.cmft = text.drawer(30).noBG();
    this.fade = fade;
  }
}
class CutsceneExecutor extends CutsceneLine {
  constructor(args) {
    super(0);
    this.args = args;
  }
}

/** Timed formatted text display class. Supports CMFT, plus directives in the `cutscenes` namespace. */
export class CutsceneHandler {
  constructor(command = (txt) => {}, onend = () => {}) {
    this.command = command;
    this.onend = onend;
  }
  /**@type {Cutscene?} */
  cutscene = null;
  ticks = 0;
  lineDuration = 1;
  fade = true;
  index = 0;
  active = false;
  /** @type {CMFTTextDrawer} */
  drawer = null;
  empty = new CMFT.Drawer().noBG();
  /**@param {string} csn Registry name of the cutscene to show.*/
  show(csn) {
    this.showDirect(Registries.cutscenes.get(csn));
  }
  /**@param {Cutscene?} cs */
  showDirect(cs) {
    this.cutscene = cs;
    this.active = true;
    this.index = -1;
  }
  interrupt() {
    let lines = this.cutscene.displays;
    this.drawer = null;
    this.active = false;
    let txt = lines[lines.length - 1];
    if (txt instanceof CutsceneExecutor) this.command(txt.args);
    this.onend();
  }
  draw() {
    if (!this.active) return;
    let lines = this.cutscene.displays;
    push();
    textFont(fonts.ocr);
    if (this.drawer) {
      this.drawer.draw(
        -this.drawer.width * 0.5,
        -this.drawer.height * 0.5,
        col.white,
        col.from(230, 170, 0),
      );
      if (this.fade) {
        let ld = this.lineDuration - this.ticks;
        if (this.ticks <= 30) {
          fill(0, 255 - 8.5 * this.ticks);
          rect(0, 0, 1920, 1080);
        } else if (ld <= 30) {
          fill(0, 255 - 8.5 * ld);
          rect(0, 0, 1920, 1080);
        }
      }
      if (--this.ticks <= 0) this.drawer = null;
    } else if (++this.index < lines.length) {
      let txt = lines[this.index];
      if (txt instanceof CutsceneExecutor) this.command(txt.args);
      else {
        if (txt instanceof CutsceneDisplayedText) {
          this.drawer = txt.cmft;
          this.fade = txt.fade;
        } else {
          this.drawer = this.empty;
          this.fade = true;
        }
        this.ticks = this.lineDuration = txt.time ?? 60;
      }
      this.draw();
    } else {
      this.drawer = null;
      this.active = false;
      this.onend();
    }
    pop();
  }
}
/** Timed text storage structure. Supports CMFT formatting, along with some usage of directives - any in the `cutscenes` namespace. */
export class Cutscene {
  /**@type {CutsceneLine[]} */
  displays = [];
  static async from(path) {
    const cs = new this();
    let res = await CMFT.Loader.loadDirectives(path);

    cs.displays = res.txt.map((v) => {
      const d = v.directives;
      let t = d.get("time") || d.get("rtime");
      let nofade = d.has("rtime") || d.has("cut");
      return (
        d.has("command") ? new CutsceneExecutor(v.text())
        : d.has("wait") ? new CutsceneLine((nofade ? 0 : 60) + Math.max(parseInt(d.get("wait")), 0))
        : new CutsceneDisplayedText(
            v,
            t ? (nofade ? 0 : 60) + Math.max(parseInt(t), 0) : (nofade ? 0 : 60) + v.length * 6,
            !nofade,
          )
      );
    });

    return cs;
  }
}

export function loadCutscenes() {}
