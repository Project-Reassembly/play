import { Corporation } from "../classes/item/corporation.js";
import { Timer } from "../classes/timer.js";
import { Shr3 } from "../lib/q5-noise-function.js";
import { debug } from "../play/debug.js";
import { effectTimer } from "../play/effects.js";
import { fonts } from "../play/font.js";
import { col } from "./color.js";
import { Registries } from "./registry.js";
import { drawImg } from "./ui.js";
//#region CMFT
export const Decoration = new (class DecorationConsts {
  colours = Object.freeze({
    // These are like Minecraft colours
    "1": col.from(0, 50, 200), // blue
    "2": col.from(0, 200, 0), // green
    "3": col.from(0, 150, 150), // cyan
    "4": col.from(230, 0, 0), // red
    "5": col.from(170, 60, 220), // purple
    "6": col.from(250, 140, 0), // orange
    "7": col.from(170, 170, 170), // light grey
    "8": col.from(70, 70, 70), // dark grey
    "9": col.from(0, 100, 150), // faded blue
    "0": col.from(10, 10, 10), // black
    "a": col.from(100, 255, 100), // light green
    "b": col.from(100, 255, 255), // light blue
    "c": col.from(255, 100, 100), // light red
    "d": col.from(220, 120, 255), // light purple
    "e": col.from(255, 255, 100), // yellow
    "f": col.from(255, 255, 255), // white

    // These kind of are
    "g": col.from(250, 200, 150), // light orange

    // These aren't.
    "i": col.from(0, 190, 230), //ITI blue
    "n": col.from(34, 119, 255), //I*n*tegrate blue
    "p": col.from(255, 100, 100), //PETI red
    "h": col.from(150, 255, 150), //CCC C*H*rono green
    "r": col.from(200, 150, 255), //Rare purple
    "l": col.from(150, 150, 255), //B*l*ue blue
    "y": col.from(255, 255, 0), //Dev *y*ellow
    get "s"() {
      //Special, cycles yellow to gold and back
      return col.from(
        255,
        230 + Math.sin(effectTimer.ticks / 30) * 25,
        130 + Math.sin(effectTimer.ticks / 30) * 20,
      );
    },
    get "v"() {
      //...Don't ask.
      return col.in2rp(
        col.from(255, 255, 151),
        col.from(235, 235, 80),
        0.5 + Math.sin(effectTimer.ticks / 30) * 0.5,
      );
    },

    // Rarity indicator
    "@": 0,
    // Spectrum, cycles through rainbow colours
    get "~"() {
      return col.interp(Decoration.spectrum, (Decoration.timer.ticks % 240) / 240);
    },
    //Reassembly accent color
    "=": col.accent,
    // default
    "-": null,
  });
  spectrum = [
    col.red,
    col.yellow,
    col.green,
    col.cyan,
    col.lighten(col.blue, 50),
    col.magenta,
    col.red,
  ];
  timer = new Timer();
  styles = Object.freeze({
    // what do you *think* these do?
    "b": "bold",
    "i": "italic",
    "n": "normal",
    "k": "bold italic",
    "X": "scribble",

    "*": "glowing",

    "-": "normal",
  });
})();

const styleVals = new Set(Object.values(Decoration.styles));

const cols = [..."0123456789abcdefinphrylsv@~"],
  styles = [..."bink*X"];
/** A collection of text components, with methods for manipulating them collectively.*/
class Collection {
  /** All-in-one text formatter.
   * Supports 27 colour codes, 5 styles and all images in the game.
   * Codes of the form `#cs` may be used anywhere in the text, including inline, where `c` is a single-letter colour code, and `s` is a style code.
   * Any combination of those may be used.
   * Using `#>>image` will display the image stored at `image` in registry - For example, `#>>icon.iti` displays the InfiniTech Industries icon.
   * @param {string} string
   */
  static createFrom(string) {
    return (
      // new Collection(
      //   ...`${string}`
      //     .split(/(?<!\\)(?=#)/)
      //     .map((x) => x.replaceAll("\\#", "#"))
      //     .filter((x) => x.length > 0)
      //     .map((x) => {
      //       if (x.startsWith("#")) {
      //         if (x.startsWith("#>>")) return new Icon(x.substring(3));
      //         let c = new Text(x.substring(3));
      //         /** @type {import("./color.js").color} */
      //         const code = Decoration.colours[x[1]];
      //         if (code !== undefined) c.setColour(code);
      //         /** @type {string} */
      //         const scode = Decoration.styles[x[2]];
      //         if (scode !== undefined) c.setStyle(scode);
      //         return c;
      //       }
      //       return new Text(x);
      //     }),
      // )
      this.#parse(string).splitLines().merge()
    );
  }
  static #parse(input) {
    const source = `${input}`;
    /** @type {Text[]} */
    const parts = [];
    let start = 0;
    /** @type {import("./color.js").color?} */
    let colour = null,
      style = "normal",
      isimage = false;
    for (let i = 0; i < source.length; i++) {
      const c = source[i];
      // console.log(`char ${c} at ${i}/${source.length} (start ${start})`);
      if (c === "#") {
        parts.push(
          isimage ?
            new Icon(this.#unmess(source.substring(start, i)))
          : new Text(this.#unmess(source.substring(start, i))).setColour(colour).setStyle(style),
        );
        // eat the hash
        i++;
        // now get the codes

        if (source.substring(i, i + 2) === ">>") {
          isimage = true;
          i += 2;
        } else {
          isimage = false;
          // colour code
          if (source[i] === "[") {
            // eat the bracket
            let j = ++i;
            // find closing
            while (source[i] && source[i] !== "]") i++;
            // throw error if not there
            if (!source[i]) return this.#error(`Missing ']' for bracket opened at ${j - 1}`);
            // use it
            const colstr = source.substring(j, i);
            if (colstr.length === 0) colour = null;
            else if (/^0x[0-9a-fA-F]{1,8}$/.test(colstr)) colour = col.fromHex(colstr.substring(2));
            else if (/^#[0-9a-fA-F]{1,8}$/.test(colstr)) colour = col.fromHex(colstr.substring(1));
            else if (/^-?\d+$/.test(colstr)) colour = parseInt(colstr) | 0;
            else if (Registries.corps.has(colstr)) colour = Corporation.colorof(colstr);
            else if (Registries.images.has(colstr))
              colour = Registries.images.get(colstr).color ?? 0;
            else return this.#error(`Invalid long colour specification '${colstr}'`);
            // eat closing ]
            i++;
          } else if (source[i] in Decoration.colours) {
            // console.log(`colour code at ${i}/${source.length} (start ${start})`)
            if (Object.getOwnPropertyDescriptor(Decoration.colours, source[i]).get)
              colour = source[i];
            else colour = Decoration.colours[source[i]];
            i++;
          } else return this.#error(`Invalid colour code '${source[i]}'`);

          // style code
          if (source[i] === "[") {
            // eat the bracket
            let j = ++i;
            // find closing
            while (source[i] && source[i] !== "]") i++;
            // throw error if not there
            if (!source[i]) return this.#error(`Missing ']' for bracket opened at ${j - 1}`);
            // use it
            const stylestr = source.substring(j, i);
            if (stylestr.length === 0) style = "normal";
            else if (styleVals.has(stylestr)) style = parseInt(stylestr);
            else return this.#error(`Invalid long style specification '${stylestr}'`);
            // eat closing ]
            i++;
          } else if (source[i] in Decoration.styles) {
            // console.log(`style code at ${i}/${source.length} (start ${start})`)
            style = Decoration.styles[source[i]];
            i++;
          } else return this.#error(`Invalid style code '${source[i]}'`);
        }
        // console.log(`text component started at ${i}/${source.length} (start ${start})`)
        start = i--;
      } else if (source.substring(i, i + 2) === "\\#") {
        // console.log(`escaped hash`)
        i++;
      }
    }
    parts.push(
      isimage ?
        new Icon(this.#unmess(source.substring(start)))
      : new Text(this.#unmess(source.substring(start))).setColour(colour).setStyle(style),
    );
    return new this(...parts.filter((x) => x.length > 0));
  }
  /** @param {string} message  */
  static #error(message) {
    return new this(
      new Icon("error.cmft"),
      new Text(`CMFT Parse Error: ${message}`).setColour(col.red),
    );
  }
  /** @param {string} string  */
  static #unmess(string) {
    return string.replaceAll("\\#", "#");
  }
  /**
   * Similar to `Collection.createFrom()`, but also wraps text if needed. May ignore some newlines.
   */
  static createWrapped(string, maxChars) {
    return this.createFrom(string).wrapWords(maxChars);
  }
  /**
   * Similar to `Collection.createFrom()`, but also truncates text if needed. May ignore some newlines.
   */
  static createTruncated(string, maxChars) {
    return this.createFrom(string).truncateWords(maxChars);
  }
  /**@type {Text[]} */
  components = [];
  /**@param {...Text} parts */
  constructor(...parts) {
    this.components = parts;
  }
  /**@readonly Total length of all text. */
  get length() {
    return this.components.reduce((p, c) => p + c.length, 0);
  }
  at(index) {
    return this.components.at(index);
  }
  /**
   *
   * @param {Collection | Text} comp
   */
  add(comp) {
    if (comp instanceof Collection) comp.components.forEach((x) => this.add(x));
    else this.components.push(comp);
    return this;
  }
  newline() {
    let c = this.components.at(-1);
    if (c) c.append("\n");
    else this.components.push(new Text("\n"));
  }
  hasNewline() {
    let c = this.components.at(-1);
    return c ? c.text.endsWith("\n") : false;
  }
  /**
   *
   * @param {(Collection | Text)[]} comps
   */
  addRange(...comps) {
    comps.forEach((c) => this.add(c));
    return this;
  }
  text() {
    let b = this.components
      .map((x) => x.text.replaceAll("\n", "") + (x.text.endsWith("\n") ? "\n" : ""))
      .join("");
    // console.log(this.components.map((x) => x.text.replaceAll("\n", "\\n")));
    // console.log(b);
    return b;
  }
  toString() {
    return this.components.map((x) => `${x}`).join();
  }
  splitWords() {
    return new Collection(...this.components.map((x) => x.split(/(?= )/)).flat());
  }
  splitLines() {
    return new Collection(...this.components.map((x) => x.split(/(?<=\n)/)).flat());
  }
  merge() {
    let merged = [];
    /**@type {Text?} */
    let prev;
    this.components.forEach((c) => {
      if (!prev) prev = c;
      else if (prev.hasSameStyle(c) && !(prev.text.endsWith("\n") || c.text.startsWith("\n")))
        prev.append(c.text);
      else {
        merged.push(prev);
        prev = c;
      }
    });
    if (prev) merged.push(prev);
    return new Collection(...merged);
  }
  /**@param {(s:string) => string} mutator  */
  map(mutator) {
    return new Collection(...this.components.map((x) => new Text(mutator(x.text)).copyVisuals(x)));
  }
  wrapWords(maxChars = 100) {
    return this.splitLines().splitWords().wrapComponents(maxChars).merge();
  }
  truncateWords(maxChars = 100) {
    return this.splitLines().splitWords().truncateComponents(maxChars).merge();
  }
  wrapComponents(maxChars = 100) {
    let output = new Collection();
    let lines = [];
    let currentLine = new Collection();
    //for each word index
    for (let index = 0; index < this.components.length; index++) {
      let word = this.components[index];
      // console.log(
      //   "["+currentLine.text().replaceAll("\n","\\n")+"] length " +
      //     currentLine.length +
      //     "/" +
      //     maxChars +
      //     ", adding " +
      //     word.length +
      //     ": " +
      //     word.text.replaceAll("\n","\\n"),
      // );
      if (currentLine.length + word.length > maxChars + 1) {
        // console.log("breaking: length exceeds " + maxChars);
        if (!currentLine.hasNewline()) currentLine.newline(); //word.text += "\n";
        lines.push(currentLine);
        currentLine = new Collection();
      }
      currentLine.add(word);
      if (word.text.includes("\n")) {
        // console.log("breaking: word has newline");
        lines.push(currentLine);
        currentLine = new Collection();
      }
    }
    lines.push(currentLine);
    return output.addRange(...lines);
  }
  /** Like `wrapComponents`, but ignores any lines that aren't the first. */
  truncateComponents(maxChars = 100) {
    let lines = [];
    let currentLine = new Collection();
    //for each word index
    for (let index = 0; index < this.components.length; index++) {
      let word = this.components[index];
      // console.log(
      //   "["+currentLine.text().replaceAll("\n","\\n")+"] length " +
      //     currentLine.length +
      //     "/" +
      //     maxChars +
      //     ", adding " +
      //     word.length +
      //     ": " +
      //     word.text.replaceAll("\n","\\n"),
      // );
      if (currentLine.length + word.length > maxChars - 1 /** allow space for ellipsis */) {
        // console.log("breaking: length exceeds " + maxChars);
        currentLine.add(new Text("…"));
        return currentLine;
      }
      currentLine.add(word);
      if (word.text.includes("\n")) {
        currentLine.add(new Text("…"));
        // console.log("breaking: word has newline");
        return currentLine;
      }
    }
    return currentLine;
  }
  getWidth(charsize) {
    let lines = [];
    let totalwidth = 0;
    this.components.forEach((x) => {
      totalwidth += x.getWidth(charsize);
      if (x.text.includes("\n")) {
        lines.push(totalwidth);
        totalwidth = 0;
      }
    });
    lines.push(totalwidth);
    return Math.max(...lines);
  }
  drawer(charSize) {
    let texts = [];
    let widths = [];
    let x = 0,
      y = 0,
      w = 0;
    this.components.forEach((c) => {
      texts.push(new Element(x, y, c, charSize)); //c.draw(x, y, charsize);
      w = c.getWidth(charSize);
      x += w;
      if (c.text.endsWith("\n")) {
        y += charSize;
        widths.push(x);
        x = 0;
      }
    });
    widths.push(x);
    let d = new Drawer(...texts);
    d.width = Math.max(...widths);
    d.height = y + charSize;
    return d;
  }
}
globalThis.cc = Collection;
/** Basic text component - a single block of styled text, formatted inline*/
class Text {
  text = "";
  /**@type {import("./color.js").color} */
  colour = col.white;
  /**@type {string} */
  style = "normal";
  /**@type {string} */
  effects = "";
  constructor(text) {
    this.text = text;
  }
  setColour(col) {
    this.colour = col;
    return this;
  }
  setEffects(fx) {
    this.effects = fx;
    return this;
  }
  setStyle(style) {
    if (style === "glowing") {
      this.style = "bold";
      this.effects = "glowing";
    } else if (style === "scribble") {
      this.style = "italic";
      this.effects = "scribble";
    } else this.style = style;
    return this;
  }
  toString() {
    return `[${this.colour ?? "default"}, ${this.style}${
      this.effects ? `<${this.effects}>` : ""
    }] "${this.text}"`;
  }
  append(str) {
    this.text += str;
    return this;
  }
  split(splitter) {
    return this.text.split(splitter).map((x) => new Text(x).copyVisuals(this));
  }
  clone() {
    return new Text(this.text).copyVisuals(this);
  }
  /**@param {Text} other  */
  copyVisuals(other) {
    return this.setColour(other.colour).setStyle(other.style).setEffects(other.effects);
  }
  /**@param {Text} other  */
  hasSameStyle(other) {
    return (
      !(other instanceof Icon) &&
      this.style === other.style &&
      this.colour === other.colour &&
      this.effects === other.effects
    );
  }
  /**@readonly */
  get length() {
    return this.text.length;
  }
  getWidth(charsize) {
    if (!("push" in globalThis)) return charsize * 0.6 * this.text.length;
    push();
    textFont(fonts.ocr);
    textSize(charsize);
    textStyle(this.style);
    let i = this.fastWidth(charsize);
    pop();
    return i;
  }
  fastWidth() {
    return textWidth(this.text);
  }
  draw(baseX, baseY) {
    text(this.text, baseX, baseY);
  }
}
/** A "text" component that turns a code (like `#>>icon.iti`) into an image. (like ![](../../textures/icon/iti.png))*/
class Icon extends Text {
  constructor(image) {
    super(image);
  }
  /**@readonly */
  get length() {
    return 2;
  }
  split(splitter) {
    return [this];
  }
  hasSameStyle(other) {
    return false;
  }
  toString() {
    return `[image] <${this.text}>`;
  }
  getWidth(charSize) {
    return charSize;
  }
  clone() {
    return new Icon(this.text);
  }
  draw(baseX, baseY, charSize) {
    drawImg(this.text, baseX + charSize * 0.5, baseY + charSize * 0.5, charSize, charSize);
  }
}
/** A class for drawing processed text to the screen.*/
class Drawer {
  /**@type {Element[]} */
  #texts = [];
  width = 0;
  height = 0;
  bg = true;
  constructor(...text) {
    this.#texts = text;
  }
  draw(baseX, baseY, basecol = col.white, rarityColour = col.accent) {
    if (baseX + this.width > 960) baseX = 960 - this.width;
    if (baseY + this.height > 540) baseY = 540 - this.height;
    push();
    rectMode(CORNER);
    if (this.bg) {
      strokeWeight(13);
      stroke(50);
      fill(10, 220);
      rect(baseX - 8, baseY - 8, this.width + 16, this.height + 16);
      strokeWeight(2);
      col.stroke(rarityColour);
      noFill();
      rect(baseX - 7, baseY - 7, this.width + 14, this.height + 14);
      noStroke();
    }
    textAlign(LEFT, TOP);
    textFont(fonts.ocr);
    this.#texts.forEach((x) => x.draw(baseX, baseY, basecol, rarityColour));
    pop();
  }
  /**@param {Drawer} other  */
  conjoin(other, offX = 0, offY = 0) {
    this.#texts.push(...other.#texts.map((t) => t.move(offX, this.height + offY)));
    if (this.width < other.width) this.width = other.width;
    this.height += other.height;
    return this;
  }
  noBG() {
    this.bg = false;
    return this;
  }
}

class Element {
  static ids = 0;
  static randomiser = new Shr3();
  #xOffset = 0;
  #yOffset = 0;
  charSize = 0;
  id = 0;
  /**@type {Text} */
  component = null;
  constructor(x, y, component, charSize) {
    this.#xOffset = x;
    this.#yOffset = y;
    this.component = component;
    this.charSize = charSize;
    this.id = Element.ids;
    Element.ids++;
  }
  move(x, y) {
    this.#xOffset += x;
    this.#yOffset += y;
    return this;
  }
  draw(baseX, baseY, basecol = col.white, rarityColour = basecol) {
    push();
    textSize(this.charSize);
    textStyle(this.component.style);
    /**@type {import("./color.js").color} */
    let c = this.component.colour === 0 ? rarityColour : (this.component.colour ?? basecol);
    if (typeof c === "string") c = Decoration.colours[c] ?? basecol;

    if (this.component.effects === "glowing") {
      this.glow(baseX, baseY, c);
    } else if (this.component.effects === "scribble") {
      this.scribble(baseX, baseY, c);
    }
    col.fill(c);
    this.component.draw(baseX + this.#xOffset, baseY + this.#yOffset, this.charSize);
    if (debug.text) {
      col.stroke(c);
      this.debugOutl(baseX, baseY);
    }
    textStyle("normal");
    pop();
  }
  glow(baseX, baseY, colour = 0) {
    const norm = col.withA(colour, 8),
      dark1 = col.withA(col.mult(colour, 0.8), 8),
      dark2 = col.withA(col.mult(colour, 0.655), 8);
    for (let o = 0; o < this.component.fastWidth(); o += 5) {
      Element.randomiser.setSeed(this.id + o);
      for (let j = 0; j < 5; j++) {
        let pos = [
          baseX +
            o +
            this.#xOffset +
            this.charSize *
              (Element.randomiser.rand() * 0.25 +
                Math.sin(frameCount / (11 + Element.randomiser.rand() * 10) / 3) * 0.25),
          baseY +
            this.#yOffset +
            this.charSize *
              (0.35 +
                Element.randomiser.rand() / 6 +
                Math.cos(frameCount / (11 + Element.randomiser.rand() * 10) / 3) / 6),
        ];
        col.fill(dark2);
        circle(...pos, this.charSize);
        col.fill(dark1);
        circle(...pos, this.charSize * 0.5);
        col.fill(norm);
        circle(...pos, this.charSize * 0.25);
      }
    }
  }
  scribble(baseX, baseY, colour) {
    noFill();
    col.stroke(colour);
    strokeWeight(this.charSize * 0.1);
    for (let o = -this.charSize * 0.5; o < this.component.fastWidth(); o += 5) {
      Element.randomiser.setSeed(this.id + o);
      for (let j = 0; j < 2; j++) {
        line(
          baseX + o + this.#xOffset + this.charSize * Element.randomiser.rand(),
          baseY + this.#yOffset + this.charSize * (0.1 + Element.randomiser.rand()),
          baseX + o + this.#xOffset + this.charSize * Element.randomiser.rand(),
          baseY + this.#yOffset + this.charSize * (0.1 + Element.randomiser.rand()),
        );
      }
    }
  }
  debugOutl(baseX, baseY) {
    fill(0, 150);
    strokeWeight(2);
    rect(baseX + this.#xOffset, baseY + this.#yOffset, this.component.fastWidth(), this.charSize);
  }
}

class DirectedCollection extends Collection {
  /**@type {Map<string,string>} */
  directives = new Map();
  /** @param {Collection} collection @param {...Directive} directives */
  constructor(collection, ...directives) {
    super(...collection.components);
    directives.forEach((d) => this.directives.set(d.name, d.value));
  }
  /**@param {DirectedString} directedString */
  static createFrom(directedString) {
    return new this(Collection.createFrom(directedString.string), ...directedString.directives);
  }
}

class DirectedString {
  /**@type {Directives} */
  directives = [];
  string = "";
  constructor(str, ...directives) {
    this.string = str;
    this.directives = new Directives(...directives);
  }
  replaceAll(from, to) {
    return new DirectedString(this.string.replaceAll(from, to), ...this.directives);
  }
}

class Directive {
  name = "";
  value = "";
  constructor(n, v) {
    this.name = n;
    this.value = v;
  }
}
/**@extends {Array<Directive>} @memberof! CMFT*/
class Directives extends Array {
  has(name) {
    return this.some((v) => v.name === name);
  }
  get(name) {
    return this.find((v) => v.name === name)?.value;
  }
}
/** Static loader class for CMFT that parses from files. Also includes parser directives.\
 * Directives must be placed at the start of a line, with only whitespace preceding them. They should be of the form `<directive>` or `<directive:argument>` - invalid formatting will result in the directive being shown as normal text.\
 * Directives are affected by comment specifiers (`//`), as the line must start with whitespace.
 * ***
 * **Supported Directives:**
 * - `<eof>` Ends the file there, immediately. Doesn't show the line that starts with it.
 * - `<format:x>` Sets the format type of the file. Currently, only `single` and `multi` are supported.*/
class Loader {
  constructor() {
    throw new Error("Illegal constructor - CMFT.Loader is not constructible.");
  }
  static #patherror(path) {
    return this.#error(`Could not load CMFT from ${path}.`);
  }
  static #error(message) {
    return new DirectedCollection(
      new Collection(
        new Icon("error"),
        new Text(" CMFT Format Error: ").setColour("4").setStyle("b"),
        new Text(message).setColour("c"),
      ),
    );
  }
  /**Loads and parses one or more CMFT collections from a file. \
   * Automatically chooses single or split based on parser directives.\
   * By default, uses the directive `<split-type:X>` directly as the type. If this directive is not found, then the file extension is used - `.cmft` is single, `.scmft` is split. \
   * Use of `<split-resolver>` can change this - only `auto` (the default behaviour), `manual` (you must specify `<split-type>`) and `extension` (you must use correct file extension) are supported. \
   * @param {string} path File path to load from.
   * @returns An array containing all the parsed collections. If the type was single, then this will only have one element.
   */
  static async load(path) {
    return (await this.loadDirectives(path)).txt;
  }
  /**Loads and parses one or more CMFT collections from a file. \
   * Automatically chooses single or split based on parser directives.\
   * By default, uses the directive `<split-type:X>` directly as the type. If this directive is not found, then the file extension is used - `.cmft` is single, `.scmft` is split. \
   * Use of `<split-resolver>` can change this - only `auto` (the default behaviour), `manual` (you must specify `<split-type>`) and `extension` (you must use correct file extension) are supported. \
   * @param {string} path File path to load from.
   * @returns An array containing all the parsed collections, along with the directives that go with it. If the type was single, then the array will only have one element.
   */
  static async loadDirectives(path) {
    /**@type {({lines: DirectedString[], directives: Directives})} */
    let v;
    try {
      v = await this.#grabLines(path);
    } catch (e) {
      return { txt: [this.#patherror(path)], dirs: new Directives() };
    }
    /**@type {"unknown"|"single"|"split"} */
    let type = "unknown";

    let res = v.directives.get("split-resolver") || "auto";
    let ft = v.directives.get("split-type") || "unknown";

    if (res === "extension" || (res === "auto" && ft === "unknown")) {
      if (path.endsWith(".scmft")) type = "split";
      else if (path.endsWith(".cmft")) type = "single";
    } else if (res === "manual" || (res === "auto" && ft !== "unknown")) {
      type = ft;
    } else return { txt: [this.#error(`Invalid split resolver: ${res}`)], dirs: v.directives };

    switch (type) {
      case "single":
        return {
          txt: [
            DirectedCollection.createFrom(
              new DirectedString(
                v.lines
                  .map((x) => x.string)
                  .join("")
                  .replaceAll("\\n", "\n"),
                v.lines.flatMap((x) => x.directives),
              ),
            ),
          ],
          dirs: v.directives,
        };
      case "split":
        return {
          txt: v.lines.map((v) => DirectedCollection.createFrom(v.replaceAll("\\n", "\n"))),
          dirs: v.directives,
        };
      case "unknown":
        return { txt: [this.#error(`Ambiguous formatting type`)], dirs: v.directives };
      default:
        return { txt: [this.#error(`Invalid split type: ${type}`)], dirs: v.directives };
    }
  }
  static async drawer(path, charSize = 25, maxChars = 0) {
    return maxChars ?
        (await this.load(path)).map((c) => c.wrapWords(maxChars).drawer(charSize))
      : (await this.load(path)).map((c) => c.drawer(charSize));
  }
  static async #grabLines(path) {
    let a;
    /**@type {DirectedString[]} */
    const lines = [],
      /**@type {Directives} */
      dirs = new Directives();
    const raw = (a = [...(await (await fetch(path)).text()).split(/\r\n?|\n/)]);
    for (const v of raw) {
      if (v) {
        let l = v.trimStart();
        if (l.startsWith("//")) continue;

        if (l[0] === "<") {
          let e = l.indexOf(">");
          if (e != -1) {
            let n = l.substring(1, e);
            let s = n.indexOf(":");
            if (s != -1) {
              const d = new Directive(n.substring(0, s), n.substring(s + 1), lines.length);
              if (e + 1 === l.length) {
                dirs.push(d);
                lines.push(new DirectedString(l.substring(e + 1)));
              } else lines.push(new DirectedString(l.substring(e + 1), d));
            } else if (n === "eof") return { lines: lines, directives: dirs };
            else {
              const d = new Directive(n, undefined, lines.length);
              if (e + 1 === l.length) {
                dirs.push(d);
                lines.push(new DirectedString(l.substring(e + 1)));
              } else lines.push(new DirectedString(l.substring(e + 1), d));
            }
          } else lines.push(new DirectedString(v));
        } else lines.push(new DirectedString(v));
      }
    }
    return { lines: lines, directives: dirs };
  }
  /**Loads and parses one CMFT collection from a file. Ignores all `<split-resolver>`/`<split-type>` directives. */
  static async loadSingle(path) {
    let v = await this.#grabLines(path);
    return Collection.createFrom(v.join(""));
  }
  /**Loads and parses multiple CMFT collections from a file, splitting on newlines. Ignores all `<split-resolver>`/`<split-type>` directives. */
  static async loadSeq(path) {
    let v = await this.#grabLines(path);
    return v.map((v) => Collection.createFrom(v));
  }
}

function escape(string) {
  return `${string}`.replace("#", "\\#");
}
function drawer(string, charSize = 25, maxChars = 0) {
  return (
    maxChars ?
      Collection.createWrapped(string, maxChars)
    : Collection.createFrom(string)).drawer(charSize);
}
function blank() {
  return new Drawer().noBG();
}
/** Assembles all possible format codes, using the input string. */
function formatTest(char = "A") {
  const escaped = escape(char);
  return cols.flatMap((c) => styles.map((s) => `#${c}${s}${escaped}`)).join("");
}

globalThis.ft = formatTest;

/**
 * Handler and classes for the **CMFT** (**Component Model for Formatting Text**) text formatter.
 * */
export {
  blank,
  Collection,
  Directive,
  Directives,
  Drawer,
  drawer,
  Element,
  escape,
  formatTest,
  Icon,
  Loader,
  Text
};

