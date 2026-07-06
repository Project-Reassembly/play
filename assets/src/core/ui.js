/**
 * @import { Block } from "../classes/block/block.js"
 * @import { Inventory } from "../classes/inventory.js";
 * @import { ShootableObject } from "../classes/physical.js";
 * @import { BulletInstance } from "../classes/projectile/bullet.js";
 * @import Integrate from "../lib/integrate.js";
 */
import { Timer } from "../classes/timer.js";
import { fonts } from "../play/font.js";
import { contentScale } from "../play/game.js";
import { blockSize, Direction } from "../scaling.js";
import * as CMFT from "./cmft.js";
import { col } from "./color.js";
import { CutsceneHandler } from "./cutscene.js";
import * as MLF1 from "./mlf1.js";
import { roundNum, Vector } from "./number.js";
import { Registries } from "./registry.js";
const ui = new (class UI {
  menuState = "title";
  waitingForMouseUp = false;
  mouse = new (class Mouse {
    #lmb = false;
    #rmb = false;
    #mmb = false;
    #fmb = false;
    #bmb = false;

    #lms = false;
    #rms = false;
    #mms = false;
    #fms = false;
    #bms = false;
    constructor() {
      addEventListener("mousedown", (e) => {
        switch (e.button) {
          case 0:
            this.#lmb = true;
            this.#lms = e.timeStamp;
            this.onleft();
            break;
          case 1:
            this.#mmb = true;
            this.#mms = e.timeStamp;
            this.onmiddle();
            break;
          case 2:
            this.#rmb = true;
            this.#rms = e.timeStamp;
            this.onright();
            break;
          case 3:
            this.#bmb = true;
            this.#bms = e.timeStamp;
            this.onback();
            break;
          case 4:
            this.#fmb = true;
            this.#fms = e.timeStamp;
            this.onforward();
            break;
          default:
            console.warn(`Unknown button code: ${e.button}`);
        }
      });
      addEventListener("mouseup", (e) => {
        switch (e.button) {
          case 0:
            this.#lmb = false;
            this.onleftrel(e.timeStamp - this.#lms);
            break;
          case 1:
            this.#mmb = false;
            this.onmiddlerel(e.timeStamp - this.#mms);
            break;
          case 2:
            this.#rmb = false;
            this.onrightrel(e.timeStamp - this.#rms);
            break;
          case 3:
            this.#bmb = false;
            this.onbackrel(e.timeStamp - this.#bms);
            break;
          case 4:
            this.#fmb = false;
            this.onforwardrel(e.timeStamp - this.#fms);
            break;
          default:
            console.warn(`Unknown button code: ${e.button}`);
        }
      });
    }
    /**@readonly */
    get x() {
      return mouseX / contentScale - 960;
    }
    /**@readonly */
    get y() {
      return mouseY / contentScale - 540;
    }
    /**@readonly */
    get down() {
      return this.#lmb || this.#rmb || this.#mmb || this.#fmb || this.#bmb;
    }
    /**@readonly @deprecated */
    get button() {
      if (!mouseButton) return "awaiting click";
      return (
        mouseButton === RIGHT ? "right"
        : mouseButton === LEFT ? "left"
        : mouseButton === MIDDLE ? "middle"
        : "unknown"
      );
    }
    /**@readonly */
    get left() {
      return this.#lmb;
    }
    /**@readonly */
    get right() {
      return this.#rmb;
    }
    /**@readonly */
    get middle() {
      return this.#mmb;
    }
    /**@readonly */
    get forward() {
      return this.#fmb;
    }
    /**@readonly */
    get back() {
      return this.#bmb;
    }
    onright() {}
    onleft() {}
    onmiddle() {}
    onforward() {}
    onback() {}

    onrightrel(t) {}
    onleftrel(t) {}
    onmiddlerel(t) {}
    onforwardrel(t) {}
    onbackrel(t) {}
  })();
  lastMousePos = { x: 0, blockX: 0, y: 0, blockY: 0 };
  camera = {
    x: 0,
    y: 0,
    rotation: 0,
    zoom: 1,
    get pos() {
      return new Vector(this.x, this.y);
    },
  };
  offset = 0;
  conditions = {};
  components = [];
  currentFPS = 0;
  previousFPS = [];
  /**@type {Block} */
  hoveredBlock = null;
  texteditor = {
    text: "",
    title: "Enter Text:",
    save: (txt) => {},
    active: false,
    isCommandLine: false,
  };
  endEdit() {
    this.texteditor.save(this.texteditor.text);
    this.texteditor.text = "";
    this.texteditor.active = false;
    this.texteditor.isCommandLine = false;
  }
  reset() {
    this.menuState = "title";
    this.waitingForMouseUp = false;
    this.texteditor.text = "";
    this.texteditor.active = false;
    this.previousFPS = [];
    this.hoveredBlock = null;
    this.resets.forEach((c) => UIComponent.setCondition(...c));
    this.wasReset = true;
  }
  wasReset = false;
  timer = new Timer();
  cutscene = new CutsceneHandler((v) => (ui.menuState = v));
  /** @type {[string,string][]} */
  resets = [];
  /** Adds a condition to be set whenever the UI resets. */
  addReset(condition, value) {
    UIComponent.setCondition(condition, value);
    this.resets.push([condition, value]);
  }
})();

class UIComponent {
  invert() {
    this.inverted = !this.inverted;
    //this.y *= -1;
    return this;
  }
  invertX() {
    this.invertedX = !this.invertedX;
    //this.y *= -1;
    return this;
  }
  removeBackground() {
    this.background = false;
    return this;
  }
  /**@param {import("./color.js").color} [colour=0]  */
  setBackgroundColour(colour = 0) {
    this.background = true;
    this.backgroundColour = colour;
    return this;
  }
  removeBackground() {
    this.background = false;
    return this;
  }
  removeOutline() {
    this.outline = false;
    return this;
  }
  /**@param {import("./color.js").color} [colour=0]  */
  setOutlineColour(colour = 0) {
    this.outline = true;
    this.outlineColour = colour;
    this.defaultOutlCol = colour;
    return this;
  }
  /**@param {import("./color.js").color} [colour=0]  */
  setTextColour(colour = 0) {
    this.textColour = colour ?? col.black;
    return this;
  }
  calculateTextWidth() {
    return globalThis.textWidth ?
        Math.max(...this.text.split("\n").map((x) => textWidth(x)))
      : this.width;
  }

  disconnect() {
    ui.components.splice(ui.components.indexOf(this), 1);
  }

  alignLeft() {
    this.ox = this.x; //Save old x
    this.define("x", () => this.ox + Math.max(this.width, this.calculateTextWidth()) * 0.5);
    return this;
  }
  alignRight() {
    this.ox = this.x; //Save old x
    this.define("x", () => this.ox - Math.max(this.width, this.calculateTextWidth()) * 0.5);
    return this;
  }

  anchorLeft(offset = 0) {
    return this.define("x", () => -960 + this.width * 0.5 + offset);
  }
  anchorRight(offset = 0) {
    return this.define("x", () => 960 - this.width * 0.5 - offset);
  }
  anchorBottom(offset = 0) {
    return this.define("y", () => 540 - this.height * 0.5 - offset);
  }
  anchorTop(offset = 0) {
    return this.define("y", () => -540 + this.height * 0.5 + offset);
  }

  rotate(rotation) {
    this.rotation += rotation;
    return this;
  }

  /**  @template {keyof ({[T in keyof this as this[T] extends Function ? never : T]: this[T] })} K god this type is horrible @param {K} prop  @param {() => this[K]} getter */
  define(prop, getter) {
    if (typeof this[prop] === "function") return this;
    if (typeof this[prop] === "undefined") return this;
    return Object.defineProperty(this, prop, { get: getter });
  }

  /**Evaluates property:value on game ui: input `"slot:1"` => if `"slot"` is `"1"` (but not if it is equivalent, e.g. `1`) return `true`, else `false`. \
   * The property `texteditor` cannot be set, as it is a special property of the ui. \
   * Multiple possible properties can be tested for: `slot:1|2|3|4` returns `true` if `"slot"` is _any_ of `"1"`,`"2"`,`"3"` or `"4"`. \
   * If more parameters are provided, then no string splitting is done.
   */
  static evaluateCondition(condition, ...values) {
    if (typeof condition !== "string") condition = `${condition}`;
    if (values.length !== 0) {
      const c = ui.conditions[condition];
      return c !== undefined && values.includes(c);
    }
    const i = condition.indexOf(":");
    if (i === -1) {
      //If no colon, simply return its presence
      return ui.conditions[condition] !== undefined;
    }
    const con = condition.substring(0, i);
    const vals = condition.substring(i + 1);

    const c = ui.conditions[con];
    if (c !== undefined) {
      //Separate property values
      let values = vals.split("|");
      //If property exists
      return values.includes(c); //Check it and return
    }
    if (con === "texteditor") {
      return vals === "true" ? ui.texteditor.active : !ui.texteditor.active;
    }
    return true; //If unsure, ignore
  }
  //Sets property:value on game ui: input "slot:1" => sets "slot" to "1"
  static setCondition(condition, value) {
    if (typeof condition !== "string") condition = `${condition}`;
    if (value !== undefined) {
      ui.conditions[condition] = `${value}`;
    }
    const i = condition.indexOf(":");
    if (i === -1) {
      return;
    }
    const con = condition.substring(0, i);
    const val = condition.substring(i + 1);
    ui.conditions[con] = `${val}`; //Set the property
  }
  acceptedScreens = [];
  conditions = [];
  interactive = false;
  active = false;
  inverted = false;
  invertedX = false;
  outline = true;
  background = true;
  backgroundColour = null;
  rotation = Direction.RIGHT;
  font = "darktech";
  defaultOutlCol = col.mono(60);
  hastext = true;

  updateActivity() {
    //It's active if it should show *and* all the conditions are met
    this.active = this.acceptedScreens.includes(ui.menuState) && this.getActivity();
  }
  getActivity() {
    if (this.conditions[0] === "any") {
      return this.getActivityAnyCondition();
    }
    for (let condition of this.conditions) {
      //Short-circuiting: if one returns false, don't even bother checking the others, it's not active.
      if (!UIComponent.evaluateCondition(condition)) return false;
    }
    return true;
  }
  getActivityAnyCondition() {
    for (let condition of this.conditions) {
      if (condition === "any") continue;
      //Short-circuiting: if one returns true, don't even bother checking the others, it's active.
      if (UIComponent.evaluateCondition(condition)) return true;
    }
    return false;
  }
  constructor(
    x = 0,
    y = 0,
    width = 1,
    height = 1,
    bevel = "none",
    onpress = () => {},
    shownText = "",
    useOCR = false,
    shownTextSize = 20,
  ) {
    //Initialise component
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.outlineColour = col.mono(50);
    this.emphasisColour = col.from(255, 255, 0);
    this.emphasised = false;
    this.ocr = useOCR;
    this.text = shownText;
    this.textSize = shownTextSize;
    this.bevel = bevel;
    this.press = onpress;
    this.interactive = !!onpress;
    this.textColour = col.black;
  }
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    translate(-this.x, -this.y);
    translate(0, ui.offset);
    noStroke();
    if (this.inverted) scale(1, -1);
    if (this.invertedX) scale(-1, 1);
    if (this.width > 0 && this.height > 0) {
      if (this.outline && this.outlineColour) {
        col.stroke(this.outlineColour);
        strokeWeight(7.5);
        if (this.emphasised) col.stroke(this.emphasisColour);
      }
      if (this.background) col.fill(this.backgroundColour ?? col.from(95, 100, 100, 160));
      else noFill();
      beginShape();
      if (this.bevel === "none") {
        vertex(this.x - this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "both") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "trapezium") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "right") {
        vertex(this.x - this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "left") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "reverse") {
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
      }
      endShape(CLOSE);
    }
    //Draw optional text
    if (this.hastext) {
      noStroke();
      textFont(this.ocr ? fonts.ocr : fonts[this.font]);
      if (this.ocr) {
        col.stroke(this.textColour);
        strokeWeight(this.textSize / 15);
      }
      col.fill(this.textColour);
      textAlign(CENTER, CENTER);
      textSize(this.textSize);
      text(this.text, this.x, this.y);
    }
    pop();
  }
  checkMouse() {
    // If the mouse is colliding with the button
    if (
      ui.mouse.x < this.x + this.width * 0.5 &&
      ui.mouse.x > this.x - this.width * 0.5 &&
      ui.mouse.y < this.y + this.height * 0.5 &&
      ui.mouse.y > this.y - this.height / 2
    ) {
      //And mouse is down
      if (mouseIsPressed) {
        this.outlineColour = col.from(255, 200, 0);
        //And the UI isn't waiting
        if (!ui.waitingForMouseUp) {
          //Click
          this.press();
          //And make the UI wait
          ui.waitingForMouseUp = true;
        }
      } else {
        this.outlineColour = col.from(180, 130, 0);
      }
    } else {
      this.outlineColour = this.defaultOutlCol;
    }
  }
}

export class CustomComponent extends UIComponent {
  constructor(x = 0, y = 0, width = 1, height = 1, onpress = () => {}, drawer = () => {}) {
    //Initialise component
    super(x, y, width, height, "none", onpress);
    this.cdrawer = drawer;
  }
  cdrawer = () => {};
  draw() {
    push();
    noFill();
    noStroke();
    this.cdrawer();

    pop();
  }
}

class HealthbarComponent extends UIComponent {
  /**@type {ShootableObject?} */
  source = null;
  healthbarColours = [col.white];
  sourceIsFunction = false;
  textColour = this.outlineColour;
  #current = "health";
  #max = "maxHealth";
  setGetters(current = "health", max = "maxHealth") {
    this.#current = current;
    this.#max = max;
    return this;
  }
  constructor(
    x = 0,
    y = 0,
    width = 1,
    height = 1,
    bevel = "none",
    onpress = () => {},
    shownText = "",
    useOCR = false,
    shownTextSize = 20,
    source = null,
    healthcols = [col.red | col.green],
  ) {
    //Initialise component
    super(x, y, width, height, bevel, onpress, shownText, useOCR, shownTextSize);
    this.source = source;
    this.sourceIsFunction = typeof this.source === "function";
    this.healthbarColours = healthcols;
  }
  getSource() {
    return this.sourceIsFunction ? this.source() : this.source;
  }
  draw() {
    let src = this.getSource();
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    translate(-this.x, -this.y);
    noStroke();
    if (this.inverted) scale(1, -1);
    if (this.invertedX) scale(-1, 1);
    if (this.width > 0 && this.height > 0) {
      //outline
      if (this.outline && this.outlineColour) {
        col.stroke(this.outlineColour);
        strokeWeight(10);
        if (this.emphasised) col.stroke(this.emphasisColour);
      }
      noFill();
      this.#shape(this.x - this.width * 0.5, this.y, this.width, this.height, true);
      //bar
      noStroke();
      if (this.background) {
        col.fill(this.backgroundColour ?? col.from(95, 100, 100, 160));
        this.#shape(this.x - this.width * 0.5, this.y, this.width, this.height, true);
      }
      col.fill(
        src ? col.interp(this.healthbarColours, src[this.#current] / src[this.#max]) : col.red,
      );
      this.#shape(
        this.x - this.width * 0.5,
        this.y,
        src ? (this.width * src[this.#current]) / src[this.#max] : this.width,
        this.height,
        true,
      );
    }
    //Draw optional text
    noStroke();
    textFont(this.ocr ? fonts.ocr : fonts.darktech);
    if (this.ocr) {
      col.stroke(this.textColour);
      strokeWeight(this.textSize / 15);
    }
    col.fill(this.textColour);
    textAlign(LEFT, CENTER);
    textSize(this.textSize);
    text(` ${src ? this.text : "No source"}`, this.x - this.width * 0.5, this.y);
    pop();
  }
  #shape(x, y, width, height, realign = false, realignV = false) {
    if (realign) x += width * 0.5;
    if (realignV) y += height * 0.5;

    beginShape();
    if (this.bevel === "none") {
      vertex(x - width * 0.5, y + height * 0.5);
      vertex(x + width * 0.5, y + height * 0.5);
      vertex(x + width * 0.5, y - height * 0.5);
      vertex(x - width * 0.5, y - height * 0.5);
    } else if (this.bevel === "both") {
      vertex(x - width * 0.5 - height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 - height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 + height * 0.5, y - height * 0.5);
      vertex(x - width * 0.5 + height * 0.5, y - height * 0.5);
    } else if (this.bevel === "trapezium") {
      vertex(x - width * 0.5 - height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 + height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 - height * 0.5, y - height * 0.5);
      vertex(x - width * 0.5 + height * 0.5, y - height * 0.5);
    } else if (this.bevel === "right") {
      vertex(x - width * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 - height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 + height * 0.5, y - height * 0.5);
      vertex(x - width * 0.5, y - height * 0.5);
    } else if (this.bevel === "left") {
      vertex(x - width * 0.5 - height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5, y + height * 0.5);
      vertex(x + width * 0.5, y - height * 0.5);
      vertex(x - width * 0.5 + height * 0.5, y - height * 0.5);
    } else if (this.bevel === "reverse") {
      vertex(x - width * 0.5 + height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 + height * 0.5, y + height * 0.5);
      vertex(x + width * 0.5 - height * 0.5, y - height * 0.5);
      vertex(x - width * 0.5 - height * 0.5, y - height * 0.5);
    }
    endShape(CLOSE);
  }
}

class MultilineUIComponent extends UIComponent {
  header = "";
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    translate(-this.x, -this.y);
    noStroke();
    if (this.inverted) scale(1, -1);
    if (this.invertedX) scale(-1, 1);
    if (this.width > 0 && this.height > 0) {
      if (this.outline && this.outlineColour) {
        col.stroke(this.outlineColour);
        strokeWeight(5);
        if (this.emphasised) col.stroke(this.emphasisColour);
      }
      if (this.background) col.fill(this.backgroundColour ?? col.from(95, 100, 100, 160));
      else noFill();
      beginShape();
      if (this.bevel === "none") {
        vertex(this.x - this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "both") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "trapezium") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "right") {
        vertex(this.x - this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "left") {
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y - this.height * 0.5);
      } else if (this.bevel === "reverse") {
        vertex(this.x - this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 + this.height * 0.5, this.y + this.height * 0.5);
        vertex(this.x + this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
        vertex(this.x - this.width * 0.5 - this.height * 0.5, this.y - this.height * 0.5);
      }
      endShape(CLOSE);
    }
    MLF1.draw(
      this.x - this.width * 0.5,
      this.y - this.height * 0.5 + 10,
      this.text,
      this.header,
      this.textColour,
      col.transparent,
      col.transparent,
      this.textSize,
    );
    pop();
  }
}

class ImageUIComponent extends UIComponent {
  constructor(
    x = 0,
    y = 0,
    width = 1,
    height = 1,
    shownImage = "error",
    onpress = () => {},
    outline = true,
    scale = 1,
    pixelate = true,
  ) {
    //Initialise component
    super(x, y, width, height, "none", onpress, "", false, 0);
    this.image = shownImage;
    this.outline = outline;
    this.scale = scale;
    this.pixelate = pixelate;
  }
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    if (this.inverted) scale(1, -1);
    if (this.invertedX) scale(-1, 1);
    col.fill(this.outlineColour);
    if (this.emphasised) col.fill(this.emphasisColour);
    //Draw outline behind background
    if (this.outline) rect(0, 0, this.width + 4, this.height + 4);
    //Draw image
    if (this.pixelate) noSmooth();
    drawImg(this.image, 0, 0, this.width * this.scale, this.height * this.scale);
    pop();
  }
}

class InventoryUIComponent extends UIComponent {
  /** @type {Inventory} */
  inventory = null;
  rows = 5;
  cols = null;
  itemSize = 40;
  constructor(x, y, inv, rows, cols, itemSize) {
    super(x, y, 0, 0, "none", null, "", false, 0);
    this.x = x;
    this.y = y;
    this.inventory = inv;
    this.rows = rows;
    this.cols = cols;
    this.itemSize = itemSize;
  }
  draw() {
    if (!this.inventory) return;
    this.inventory.draw(
      this.x,
      this.y,
      this.rows,
      this.cols,
      this.itemSize,
      this.outlineColour ?? col.mono(50),
      this.backgroundColour ?? col.from(95, 100, 100, 160),
    );
  }
}

class CMFTUIComponent extends UIComponent {
  /**@param {(text:string) => string} fn*/
  formatter = (t) => t;
  lasttxt = "";
  textdrawer = CMFT.blank();
  hastext = false;
  rarityColour = col.accent;

  /**@param {import("./color.js").color} col*/
  setRarityColour(col) {
    this.rarityColour = fn;
    return this;
  }
  /**@param {(text:string) => string} fn*/
  setFormatter(fn) {
    this.formatter = fn;
    return this;
  }
  refresh() {
    this.#settxt(this.text);
    return this;
  }
  #settxt(t) {
    let s = this.textSize * 0.4;
    if (textSize) {
      textFont(fonts.ocr);
      textSize(this.textSize);
      s = textWidth("a");
    }
    // console.log("using text width = " + s + ", height = " + this.textSize);
    this.textdrawer = CMFT.drawer(
      this.formatter(t ?? "null"),
      this.textSize,
      Math.floor((this.width - 21) / s),
    ).noBG();
    this.lasttxt = t;
  }
  draw() {
    super.draw();
    const t = this.text;
    if (t !== this.lasttxt) this.#settxt(t);

    this.textdrawer.draw(
      this.x - (this.width - 20) * 0.5,
      this.y - (this.height - 20) * 0.5,
      this.textColour,
      this.rarityColour,
    );
  }
}

export class BulletVisualiser extends UIComponent {
  /** @type {Integrate.Unconstructed<BulletInstance>} */
  bullet = {};
  #off = 0;
  depth = Infinity;
  draw() {
    super.draw();
    this.#off = this.#drawBulletPath(
      this.x - this.width * 0.5 + 20,
      this.y + this.height * 0.5 - this.#off,
      degrees(this.rotation),
      this.bullet,
      this.depth,
    );
  }
  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} d
   * @param {Integrate.Unconstructed<BulletInstance>} bullet
   * @returns The height of the visual.
   */
  #drawBulletPath(x, y, d, bullet, maxd = Infinity, depth = 0) {
    const start = new Vector(x, y);
    let direction = new Vector(1, 0).rotate(d + (bullet.direction ?? 0));
    bullet.decel ??= 0;

    const updates = (bullet.extraUpdates ?? 0) + 1;

    const speed = bullet.speed ?? 20;
    const time = Math.ceil((bullet.lifetime ?? 0) / updates, 1);
    const ptime =
      bullet.decel > 0 ? Math.min(bullet.lifetime, bullet.speed / bullet.decel) : bullet.lifetime;
    const range = speed * ptime + 0.5 * (-bullet.decel * ptime * ptime);
    const color =
      depth > maxd ? col.from(50, 50, 50, 100)
      : bullet.trail ? (col.convert(bullet.trailColours[0]) ?? col.white)
      : col.white;

    const end = start.add(direction.scale(range));

    push();
    noFill();
    strokeWeight(bullet.hitSize ?? 2);
    textSize(15);
    textFont(fonts.ocr);
    col.stroke(color);
    // spawning position
    circle(x, y, 10);
    // basic range
    line(x, y, end.x, end.y);
    // area damage
    strokeWeight(2);
    col.fill(col.withA(color, 100));
    let toff = 0;
    if (Array.isArray(bullet.damage))
      for (let d of bullet.damage) {
        if (d.radius && d.amount) {
          if (d.radius > toff) toff = d.radius;
          circle(end.x, end.y, d.radius * 2);
        }
      }
    toff *= Math.SQRT1_2;
    toff += 10;
    noFill();
    if (bullet.speed > 0) {
      // speed indicators
      let s = speed * updates;
      push();
      translate(start.x, start.y);
      rotate(direction.angleRad);
      for (let dist = s; dist < range; dist += s) {
        s -= bullet.decel * updates;
        line(dist, 0, dist - 5, -5);
        line(dist, 0, dist - 5, 5);
      }
      line(range + 5, 5, range - 5, -5);
      line(range + 5, -5, range - 5, 5);
      pop();
    }
    // splits!
    if (bullet.fragNumber > 0) {
      this.#showEmission(
        direction,
        end,
        toff,
        bullet.fragDirection,
        bullet.fragSpacing,
        bullet.fragSpread,
        bullet.fragNumber,
        1,
        bullet.fragBullet,
        maxd,
        depth + 1,
      );
    }
    if (bullet.intervalNumber > 0) {
      const mid = start.add(end).scale(0.5);
      const off = bullet.fragNumber > 0 ? toff + 60 : toff;
      const c = Math.max(Math.floor(ptime / ((bullet.intervalTime ?? 0) + 1)), 1);
      this.#showEmission(
        direction,
        mid,
        off,
        bullet.intervalDirection,
        bullet.intervalSpacing,
        bullet.intervalSpread,
        bullet.intervalNumber,
        c,
        bullet.intervalBullet,
        maxd,
        depth + 1,
      );

      // this.#drawBulletPath(intervalp.x, intervalp.y, direction.angle, bullet.intervalBullet);
    }
    // texts
    noStroke();
    col.fill(color);
    textAlign(LEFT);
    if (bullet.lifetime > 0) {
      text(`${roundNum(time / 60, 2)}s`, x, y + 15);
      text(`${roundNum(range / blockSize, 2)} tiles`, x, y + 30);
    }
    let ty = end.y + toff;
    if (Array.isArray(bullet.damage))
      for (let d of bullet.damage) {
        if (d.amount) {
          text(`${d.amount} ${d.radius ? "area " : ""}${d.type}`, end.x + toff, ty);
          ty += 15;
        }
      }
    pop();
    return Math.max(ty - y, toff, 40);
  }
  /**
   *
   * @param {Vector} baseDir
   * @param {Vector} position
   * @param {number} offset Distance from 'position'.
   * @param {number} direction
   * @param {number} spacing
   * @param {number} spread
   * @param {number} count
   * @param {Integrate.Unconstructed<BulletInstance>} bullet
   */
  #showEmission(
    baseDir,
    position,
    offset = 0,
    direction = 0,
    spacing = 0,
    spread = 0,
    count = 1,
    bursts = 1,
    bullet = {},
    maxdepth,
    depth,
  ) {
    const c = depth > maxdepth ? col.from(50, 50, 50, 100) : col.accent;
    col.stroke(c);
    col.fill(col.withA(c, 100));
    const middle = direction + baseDir.angle;
    const indicatorSize = 25;

    if (spacing) {
      const diff = Math.min((Math.abs(spacing) * (count - 1)) / 2, 179);
      for (let d = middle - diff; d <= middle + diff; d += spacing) {
        // line(position.x, position.y, ...position.add(baseDir.rotate(d).scale(25)));
        arc(
          position.x,
          position.y,
          indicatorSize * 2,
          indicatorSize * 2,
          radians(d - spread),
          radians(d + spread),
          PIE,
        );
      }
    } else if (spread)
      arc(
        position.x,
        position.y,
        indicatorSize * 2,
        indicatorSize * 2,
        radians(middle - spread),
        radians(middle + spread),
        PIE,
      );
    const s = Math.max(offset, bursts > 1 ? indicatorSize + 15 : indicatorSize);

    line(position.x, position.y, ...position.add(baseDir.rotate(direction).scale(indicatorSize)));
    const fragp = bullet.lifetime === 0 ? position : position.addXY(s + 30, -(s + 30));
    line(position.x, position.y, fragp.x, fragp.y);

    noStroke();
    textAlign(RIGHT);
    col.fill(c);
    if (count > 1) text(`${count}x`, position.x + s + 7, position.y - s - 10);
    if (bursts > 1) text(`${bursts} bursts`, position.x + s - 8, position.y - s + 5);

    this.#drawBulletPath(fragp.x, fragp.y, baseDir.angle + direction, bullet, maxdepth, depth);
  }
}

class ImageContainer {
  #image;
  #color;
  #path;
  constructor(path) {
    this.#path = path;
    this.#image = null;
  }
  update(image) {
    this.#image = image;
  }
  async load() {
    this.#image = await loadImage(this.#path);
    this.#color = this.getColor();
    return true;
  }
  getColor() {
    const i = this.#image;
    i.loadPixels();
    const pixelElementCount = i.pixels.length,
      totalpix = pixelElementCount * 0.25;
    let reds = 0,
      greens = 0,
      blues = 0,
      totalAlpha = 0,
      pixels = 0;
    for (let pixi = 0; pixi < pixelElementCount; pixi += 4) {
      const alpha = i.pixels[pixi + 3];
      if (alpha > 0) {
        reds += i.pixels[pixi] * alpha;
        greens += i.pixels[pixi + 1] * alpha;
        blues += i.pixels[pixi + 2] * alpha;
        totalAlpha += alpha;
        pixels++;
      }
    }
    i.pixels = null;
    // console.log(
    //   `${this.#path} has ${totalpix} pixels (${pixels} visible), ${totalAlpha} total alpha out of ${totalpix*255} max - ${totalAlpha/totalpix} average`,
    // );
    const maxcol = pixels * 255;
    return col.from(reds / maxcol, greens / maxcol, blues / maxcol, totalAlpha / totalpix);
  }
  get image() {
    return this.#image;
  }
  /**@type {import("./color.js").color} */
  get color() {
    return this.#color;
  }
  draw(x, y, width, height, angle = 0, flipV = false) {
    if (!this.#image) return; //Cancel if no image loaded yet
    if (angle === 0 && !flipV) image(this.#image, x, y, width, height);
    else {
      push(); //Save current position, rotation, etc
      translate(x, y); //Move middle to 0,0
      rotate(angle);
      if (flipV) scale(1, -1);
      image(this.#image, 0, 0, width, height);
      pop(); //Return to old state
    }
  }
  drawCol(x, y, width, height, angle = 0) {
    if (!this.#color) return; //Cancel if no color loaded yet
    push(); //Save current position, rotation, color, etc
    noStroke();
    col.fill(this.#color);
    if (angle !== 0) rect(x, y, width, height);
    else {
      translate(x, y); //Move middle to 0,0
      rotate(angle);
      rect(0, 0, width, height);
    }
    pop(); //Return to old state
  }
  /**
   * Draws an image container or string.
   * @param {ImageContainer|string} img Image to draw.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} angle Angle to draw the image at, in radians.
   * @param {boolean} flipV Whether or not to flip the image vertically.
   */
  static draw(img, x, y, width, height, angle = 0, flipV = false) {
    const loaded = img instanceof this ? img : Registries.images.tryGet(img);
    noSmooth();
    if (loaded instanceof this) {
      loaded.draw(x, y, width, height, angle, flipV);
    } else {
      //Try to draw it directly if not
      try {
        image(loaded, x, y, width, height);
      } catch (error) {
        //Replace with a working image, if possible
        const i = Registries.images.tryGet("error")?.image;
        if (i) image(i, x, y, width, height);
      }
    }
  }
}

function drawImg(
  img = "error",
  x,
  y,
  width,
  height,
  ...otherParameters //IDK what else p5 image takes
) {
  ImageContainer.draw(img, x, y, width, height);
  // //Get from registry if it exists
  // img = Registries.images.has(img) ? Registries.images.get(img) : "error";
  // noSmooth();
  // if (img instanceof ImageContainer) {
  //   if (!img.image) return; //Cancel if no image loaded yet
  //   image(img.image, x, y, width, height, ...otherParameters);
  // } else {
  //   //Try to draw it directly if not
  //   try {
  //     image(img, x, y, width, height, ...otherParameters);
  //   } catch (error) {
  //     //Replace with a working image
  //     if (Registries.images.has("error"))
  //       image(Registries.images.get("error").image, x, y, width, height, ...otherParameters);
  //   }
  // }
}

function rotatedImg(img = "error", x, y, width, height, angle, flipV = false) {
  ImageContainer.draw(img, x, y, width, height, angle, flipV);
  // push(); //Save current position, rotation, etc
  // translate(x, y); //Move middle to 0,0
  // rotate(angle);
  // if (flipV) scale(1, -1);
  // drawImg(img, 0, 0, width, height);
  // pop(); //Return to old state
}

function rotatedShape(shape = "circle", x, y, width, height, angle, flipV = false) {
  push(); //Save current position, rotation, etc
  translate(x, y); //Move middle to 0,0
  rotate(angle);
  if (flipV) scale(1, -1);
  switch (shape) {
    case "circle":
      circle(0, 0, (width + height) * 0.5);
      break;
    case "square":
      square(0, 0, (width + height) * 0.5);
      break;
    case "ellipse":
      ellipse(0, 0, width, height);
      break;
    case "rect":
      rect(0, 0, width, height);
      break;
    case "rhombus":
      scale(width, height); //Change the size
      rotate(QUARTER_PI); //turn it
      square(0, 0, 1); //make a square
      scale(1, 1); //scale back
      rotate(-QUARTER_PI); //turn back
      break;
    case "triangle":
      triangle(width * 0.5, 0, -width * 0.5, -height * 0.5, -width * 0.5, height * 0.5);
      break;
    case "moved-triangle":
      triangle(width, 0, 0, -height * 0.5, 0, height * 0.5);
      break;
    case "inverted-triangle":
      triangle(0, 0, width, -height * 0.5, width, height * 0.5);
      break;
    default:
      break;
  }
  pop(); //Return to old state
}

function rotatedShapeExt(layer, shape = "circle", x, y, width, height, angle, flipV = false) {
  layer.push(); //Save current position, rotation, etc
  layer.rectMode(CENTER);
  layer.translate(x, y); //Move middle to 0,0
  layer.rotate(angle);
  if (flipV) layer.scale(1, -1);
  switch (shape) {
    case "circle":
      layer.circle(0, 0, (width + height) * 0.5);
      break;
    case "square":
      layer.square(0, 0, (width + height) * 0.5);
      break;
    case "ellipse":
      layer.ellipse(0, 0, width, height);
      break;
    case "rect":
      layer.rect(0, 0, width, height);
      break;
    case "rhombus":
      layer.scale(width, height); //Change the size
      layer.rotate(QUARTER_PI); //turn it
      layer.square(0, 0, 1); //make a square
      layer.scale(1, 1); //scale back
      layer.rotate(-QUARTER_PI); //turn back
      break;
    case "triangle":
      layer.triangle(width * 0.5, 0, -width * 0.5, -height * 0.5, -width * 0.5, height * 0.5);
      break;
    case "moved-triangle":
      layer.rotate(HALF_PI); //turn it
      layer.triangle(height, 0, 0, -width * 0.5, 0, width * 0.5);
      layer.rotate(-HALF_PI); //turn it
      break;
    case "inverted-triangle":
      layer.rotate(HALF_PI); //turn it
      layer.triangle(0, 0, height, -width * 0.5, height, width * 0.5);
      layer.rotate(-HALF_PI); //turn it
      break;
    default:
      break;
  }
  layer.pop(); //Return to old state
}

class SliderUIComponent extends UIComponent {
  _current = 0;
  constructor(
    x = 0,
    y = 0,
    width = 1,
    sliderLength = 1,
    height = 1,
    bevel = "none",
    shownText = "",
    useOCR = false,
    shownTextSize = 20,
    onchange = (value) => {},
    min = 0,
    max = 100,
  ) {
    super(x, y, width, height, bevel, undefined, shownText, useOCR, shownTextSize);
    //Change callback
    this.change = onchange;
    this.length = sliderLength;
    this.min = min;
    this._current = (min + max) * 0.5;
    this.max = max;
  }
  draw() {
    push();
    //Outline
    col.fill(this.outlineColour);
    rect(
      this.x + (this.width + this.length) * 0.5 - this.height * 0.5,
      this.y,
      this.length + this.height + 18,
      this.height * 0.5 + 18,
    );
    //Empty bit
    fill(0);
    rect(
      this.x + (this.width + this.length) * 0.5 - this.height * 0.5,
      this.y,
      this.length + this.height - 2,
      this.height * 0.5 - 2,
    );
    //Full bit
    fill(255, 255, 0);
    //Get minimum X
    let minX = this.x + this.width * 0.5;
    //Calculate width of bar
    let w = (this._current / this.max) * this.length + this.height * 0.5;
    //Draw full bit
    rect(minX + w * 0.5 - this.height * 0.5, this.y, w, this.height * 0.5);
    //Draw the title bit
    super.draw();
    pop();
  }
  checkMouse() {
    //Set min/max x positions
    let minX = this.x + this.width * 0.5,
      maxX = this.x + this.width * 0.5 + this.length;
    // If the mouse is colliding with the button
    if (
      ui.mouse.x < maxX &&
      ui.mouse.x > minX &&
      ui.mouse.y < this.y + this.height * 0.5 &&
      ui.mouse.y > this.y - this.height / 2
    ) {
      //And mouse is down
      if (mouseIsPressed) {
        // - But don't wait, so smooth movement

        this.outlineColour = col.cyan;
        //Click and change values
        this._current = ((ui.mouse.x - minX) / this.length) * this.max;
        this.change(this._current);
        //And make the UI wait
        ui.waitingForMouseUp = true;
      } else {
        this.outlineColour = col.from(0, 128, 128);
      }
    } else {
      this.outlineColour = col.mono(50);
    }
  }
}

function createUIComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
) {
  //Make component
  const component = new UIComponent(
    x,
    y,
    width,
    height,
    bevel,
    onpress ?? (() => {}),
    shownText,
    useOCR,
    shownTextSize,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}
export function createBulletVisualiserComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  bullet = {},
) {
  //Make component
  const component = new BulletVisualiser(x, y, width, height, bevel, onpress ?? (() => {}));
  component.bullet = bullet;
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

export function createCustomComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  onpress = null,
  drawer = null,
) {
  //Make component
  const component = new CustomComponent(
    x,
    y,
    width,
    height,
    onpress ?? (() => {}),
    drawer ?? (() => {}),
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

function createMultilineUIComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
) {
  //Make component
  const component = new MultilineUIComponent(
    x,
    y,
    width,
    height,
    bevel,
    onpress ?? (() => {}),
    shownText,
    useOCR,
    shownTextSize,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

function createUIImageComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  onpress = null,
  shownImage = null,
  outline = true,
  scale = 1,
  pixelate = true,
) {
  //Make component
  const component = new ImageUIComponent(
    x,
    y,
    width,
    height,
    shownImage,
    onpress ?? (() => {}),
    outline,
    scale,
    pixelate,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

function createUIInventoryComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  inv = null,
  rows = null,
  cols = null,
  itemSize = 40,
) {
  //Make component
  const component = new InventoryUIComponent(x, y, inv, rows, cols, itemSize);
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  //Add to game
  ui.components.push(component);
  return component;
}

function createGamePropertySelector(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  bufferWidth = 1,
  optionWidth = 1,
  height = 1,
  property = "",
  options = [""],
  defaultOption = null,
  shownTexts = [""],
  shownTextSize = 50,
  onchange = (value) => {},
) {
  //Create display name
  createUIComponent(
    screens,
    conditions,
    x + property.length * shownTextSize * 0.375 + 50,
    y - 65,
    0,
    0,
    "none",
    undefined,
    property,
    false,
    shownTextSize * 0.8,
  );
  //Create indicator
  let diffindicator = createUIComponent(
    screens,
    conditions,
    x + bufferWidth * 0.5,
    y,
    bufferWidth,
    height,
    "right",
    undefined,
    "> ",
    false,
    shownTextSize,
  );
  diffindicator.chosen = defaultOption in options ? options[defaultOption] : null;
  let len = Math.min(options.length, shownTexts.length); //Get smallest array, don't use blanks
  for (let i = 0; i < len; i++) {
    //For each option or text
    //Make a selector option
    let component = createUIComponent(
      screens,
      conditions,
      x + bufferWidth + optionWidth * (i + 0.5),
      y,
      optionWidth,
      height,
      "both",
      () => {
        game[property] = options[i]; //Set the property
        diffindicator.chosen = options[i];
        onchange(options[i]);
      },
      shownTexts[i],
      true,
      shownTextSize,
    );
    //Highlight if the diffindicator has chosen this button's option
    Object.defineProperty(component, "emphasised", {
      get: () => diffindicator.chosen === options[i],
    });
  }
}

function createSliderComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  sliderLength = 100,
  height = 1,
  bevel = "none",
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
  onchange = null,
  min = 0,
  max = 100,
) {
  //Make component
  const component = new SliderUIComponent(
    x,
    y,
    width,
    sliderLength,
    height,
    bevel,
    shownText,
    useOCR,
    shownTextSize,
    onchange ?? (() => {}),
    min,
    max,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onchange;
  //Add to game
  ui.components.push(component);
  return component;
}

function createHealthbarComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
  source = null,
  cols = [col.from(255, 255, 0)],
) {
  //Make component
  const component = new HealthbarComponent(
    x,
    y,
    width,
    height,
    bevel,
    onpress ?? (() => {}),
    shownText,
    useOCR,
    shownTextSize,
    source,
    cols,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

function createCMFTComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  shownText = "",
  shownTextSize = 20,
) {
  //Make component
  const component = new CMFTUIComponent(
    x,
    y,
    width,
    height,
    bevel,
    onpress ?? (() => {}),
    shownText,
    true,
    shownTextSize,
  );
  component.conditions = conditions;
  //Set conditional things
  component.acceptedScreens = screens;
  component.isInteractive = !!onpress;
  //Add to game
  ui.components.push(component);
  return component;
}

export {
  createCMFTComponent,
  createGamePropertySelector,
  createHealthbarComponent,
  createMultilineUIComponent,
  createSliderComponent,
  createUIComponent,
  createUIImageComponent,
  createUIInventoryComponent,
  drawImg,
  ImageContainer,
  rotatedImg,
  rotatedShape,
  rotatedShapeExt,
  ui,
  UIComponent
};

