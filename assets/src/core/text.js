import { effectTimer } from "../play/effects.js";
import { colinterp } from "./number.js";

//wrapinator (unused)
function wrapWords(input = "", maxChars = 100) {
  let lines = [];
  let words = input.split(" ");
  let currentLine = "";
  //for each word index
  for (let index = 0; index < words.length; index++) {
    let word = words[index];
    if (currentLine.length + word.length > maxChars) {
      lines.push(currentLine);
      currentLine = "";
    }
    currentLine += word + " ";
  }
  lines.push(currentLine);
  return lines.filter((x) => x.length > 0).join("\n");
}

function colourise(input = "") {
  return new TextCollection(
    ...input
      .split(/(?=#)/)
      .filter((x) => x.length > 0)
      .map((x) => {
        if (x.startsWith("#")) {
          let c = new TextComponent(x.substring(3));
          let code = Decoration.colours[x[1]];
          if (code) c.coloured(x[1]);
          let scode = Decoration.styles[x[2]];
          if (scode) c.styled(x[2]);
          return c;
        }
        return new TextComponent(x);
      })
  );
}

function process(string, maxWidth = 40) {
  return colourise(string).splitLines().wrapWords(maxWidth);
}

export const Decoration = {
  colours: {
    // These are like Minecraft colours
    1: [0, 50, 200], // blue
    2: [0, 200, 0], // green
    3: [0, 150, 150], // cyan
    4: [200, 0, 0], // red
    5: [200, 0, 200], // purple
    6: [200, 100, 0], // orange
    7: [170, 170, 170], // light grey
    8: [70, 70, 70], // dark grey
    9: [0, 100, 150], // faded blue
    0: [0, 0, 0], // black
    a: [100, 255, 100], // light green
    b: [100, 255, 255], // light blue
    c: [255, 100, 100], // light red
    d: [220, 120, 255], // light purple
    e: [255, 255, 100], // yellow
    f: [255, 255, 255], // white

    // These aren't.
    i: [0, 190, 230], //ITI blue
    p: [255, 100, 100], //PETI red
    r: [200, 150, 255], //Rare purple
    l: [150, 150, 255], //B*l*ue blue
    h: [150, 255, 150], //CCC C*H*rono green
    get s() {
      //Special, cycles yellow to gold and back
      return [
        255,
        230 + Math.sin(effectTimer.ticks / 30) * 30,
        130 + Math.sin(effectTimer.ticks / 30) * 20,
      ];
    },

    // Rarity indicator
    "@": [],
    // Spectrum, cycles through rainbow colours
    get "~"() {
      return colinterp(
        [
          [255, 0, 0],
          [255, 255, 0],
          [0, 255, 0],
          [0, 255, 255],
          [0, 0, 255],
          [255, 0, 255],
          [255, 0, 0],
        ],
        (effectTimer.ticks % 240) / 240
      );
    },
  },
  styles: {
    // what do you *think* these do?
    b: "bold",
    i: "italic",
    n: "normal",
    k: "bold italic",
  },
};

class TextComponent {
  text = "";
  /**@type {string} */
  colour = null;
  /**@type {string} */
  style = "normal";
  constructor(text) {
    this.text = text;
  }
  coloured(col) {
    this.colour = col;
    return this;
  }
  styled(style) {
    if (style) this.style = style;
    return this;
  }
  toString() {
    return `[${this.colour ?? "default"}, ${this.style}] "${this.text}"`;
  }
  append(str) {
    this.text += str;
    return this;
  }
  split(splitter) {
    return this.text
      .split(splitter)
      .map((x) => new TextComponent(x).copyVisuals(this));
  }
  clone() {
    return new TextComponent(this.text)
      .styled(this.style)
      .coloured(this.colour);
  }
  /**@param {TextComponent} other  */
  copyVisuals(other) {
    return this.coloured(other.colour).styled(other.style);
  }
  /**@param {TextComponent} other  */
  hasSameStyle(other) {
    return this.style === other.style && this.colour === other.colour;
  }
  /**@readonly */
  get length() {
    return this.text.length;
  }
  getWidth(charsize) {
    push();
    textSize(charsize);
    textStyle(Decoration.styles[this.style] ?? "normal");
    let i = textWidth(this.text);
    pop();
    return i;
  }
}
class TextCollection {
  /**@type {TextComponent[]} */
  components = [];
  constructor(...parts) {
    this.components = parts;
  }
  /**@readonly */
  get length() {
    return this.components.reduce((p, c) => p + c.length, 0);
  }
  at(index) {
    return this.components.at(index);
  }
  /**
   *
   * @param {TextCollection | TextComponent} comp
   */
  add(comp) {
    if (comp instanceof TextCollection)
      comp.components.forEach((x) => this.add(x));
    else this.components.push(comp);
    return this;
  }
  /**
   *
   * @param {(TextCollection | TextComponent)[]} comps
   */
  addRange(...comps) {
    comps.forEach((c) => this.add(c));
    return this;
  }
  text() {
    return this.components.map((x) => x.text).join("");
  }
  toString() {
    return this.components.map((x) => x.toString()).join();
  }
  splitWords() {
    return new TextCollection(
      ...this.components.map((x) => x.split(/(?= )/)).flat()
    );
  }
  splitLines() {
    return new TextCollection(
      ...this.components.map((x) => x.split(/(?<=\n)/)).flat()
    );
  }
  merge() {
    let merged = [];
    /**@type {TextComponent?} */
    let prev;
    this.components.forEach((c) => {
      if (!prev) prev = c;
      else if (
        prev.hasSameStyle(c) &&
        !(prev.text.endsWith("\n") || c.text.startsWith("\n"))
      )
        prev.append(c.text);
      else {
        merged.push(prev);
        prev = c;
      }
    });
    merged.push(prev);
    return new TextCollection(...merged);
  }
  map(mutator) {
    return new TextCollection(
      ...this.components.map((x) =>
        new TextComponent(mutator(x.text)).copyVisuals(x)
      )
    );
  }
  wrapWords(maxChars = 100) {
    return this.splitWords().wrapComponents(maxChars).merge();
  }
  wrapComponents(maxChars = 100) {
    let output = new TextCollection();
    let lines = [];
    let currentLine = new TextCollection();
    //for each word index
    for (let index = 0; index < this.components.length; index++) {
      let word = this.components[index];
      if (
        currentLine.length + word.length >= maxChars ||
        word.text.endsWith("\n")
      ) {
        if (!word.text.endsWith("\n")) word.text += "\n";
        lines.push(currentLine);
        currentLine = new TextCollection();
      }
      currentLine.add(word);
    }
    lines.push(currentLine);
    return output.addRange(...lines);
  }
  getWidth(charsize) {
    let lines = [];
    let totalwidth = 0;
    this.components.forEach((x) => {
      totalwidth += x.getWidth(charsize);
      if (x.text.endsWith("\n")) {
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
      texts.push(new DrawnTextElement(x, y, c, charSize)); //c.draw(x, y, charsize);
      w = c.getWidth(charSize);
      x += w;
      if (c.text.endsWith("\n")) {
        y += charSize;
        widths.push(x);
        x = 0;
      }
    });
    widths.push(x);
    let d = new TextDrawer(...texts);
    d.width = Math.max(...widths);
    d.height = y + charSize;
    return d;
  }
}

class TextDrawer {
  /**@type {DrawnTextElement[]} */
  #texts = [];
  width = 0;
  height = 0;
  constructor(...text) {
    this.#texts = text;
  }
  draw(baseX, baseY, basecol = [255, 255, 255], rarityColour) {
    if (baseX + this.width > width / 2) baseX = width / 2 - this.width;
    if (baseY + this.height > height / 2) baseY = height / 2 - this.height;
    push();
    stroke(50, 50, 50);
    strokeWeight(5);
    fill(100, 100, 100, 200);
    rectMode(CORNER);
    rect(baseX - 5, baseY - 5, this.width + 10, this.height + 10);
    noStroke();
    this.#texts.forEach((x) => x.draw(baseX, baseY, basecol, rarityColour));
    pop();
  }
  /**@param {TextDrawer} other  */
  conjoin(other, offX = 0, offY = 0) {
    this.#texts.push(
      ...other.#texts.map((t) => t.move(offX, this.height + offY))
    );
    if (this.width < other.width) this.width = other.width;
    this.height += other.height;
    return this;
  }
}

class DrawnTextElement {
  #xOffset = 0;
  #yOffset = 0;
  charSize = 0;
  /**@type {TextComponent} */
  component = null;
  constructor(x, y, component, charSize) {
    this.#xOffset = x;
    this.#yOffset = y;
    this.component = component;
    this.charSize = charSize;
  }
  move(x, y) {
    this.#xOffset += x;
    this.#yOffset += y;
    return this;
  }
  draw(baseX, baseY, basecol, rarityColour = basecol) {
    push();
    textSize(this.charSize);
    textStyle(Decoration.styles[this.component.style]);
    fill(
      this.component.colour === "@"
        ? rarityColour
        : Decoration.colours[this.component.colour] ?? basecol
    );
    text(this.component.text, baseX + this.#xOffset, baseY + this.#yOffset);
    pop();
  }
}

// window["TextEngine"] = {
//   Component: TextComponent,
//   Collection: TextCollection,
//   wrap: wrapWords,
//   colourise: colourise,
//   process: process,
//   DrawnElement: DrawnTextElement,
//   Drawer: TextDrawer,
// };
export {
  wrapWords,
  colourise,
  process,
  TextComponent,
  TextCollection,
  DrawnTextElement,
  TextDrawer,
};
