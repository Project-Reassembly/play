/**@typedef {number & {}} byte */
/**@typedef {number & {}} color */

import { clamp } from "./number.js";

/** Slightly optimised colours. */
export const col = new (class Int32Colours {
  constructor() {
    Object.freeze(this);
  }
  /** Turns almost anything into a colour.
   *  @type {(something: boolean | string | number | [number,number,number]| [number,number,number,number] | {r:number, g:number, b:number, a?:number} | (() => *) | bigint | symbol) => color} something Thing to turn.
   *  ****
   * **Types**:
   *  - `string`: Tries to parse as a hex number of the form `#rrggbbaa` or `#rrggbb`
   *  - `number`: Just uses the number directly (as an int32).
   *  - `boolean`: White if true, black if false.
   *  - `symbol` or `undefined`: Red.
   *  - `object`: If an array, maps the array as follows: `[r, g, b, a]`. If not, uses the `{r, g, b, a}` properties.
   *  - `function`: Calls the passed thing, and normalises then result.
   */
  convert = function (something) {
    switch (typeof something) {
      case "string":
        return this.fromHex(something.substring(1).padEnd(8, "f"));
      case "number":
        return something | 0;
      case "bigint":
        return something | 0;
      case "boolean":
        return something ? this.white : this.black;
      case "symbol":
        return col.red;
      case "undefined":
        return col.red;
      case "object":
        if (something instanceof Array) return this.from(...something, 255);
        return this.from(something.r, something.g, something.b, something.a);
      case "function":
        return this.normalise(something());
    }
  }.bind(this);
  /**@readonly @type {color}*/
  get transparent() {
    return 0 | 0;
  }
  /**@readonly @type {color}*/
  get red() {
    return -16776961 | 0;
  }
  /**@readonly @type {color}*/
  get yellow() {
    return -65281 | 0;
  }
  /**@readonly @type {color} */
  get green() {
    return 16711935 | 0;
  }
  /**@readonly @type {color}*/
  get cyan() {
    return 16777215 | 0;
  }
  /**@readonly @type {color}*/
  get blue() {
    return 65535 | 0;
  }
  /**@readonly @type {color}*/
  get magenta() {
    return -16711681 | 0;
  }
  /**@readonly @type {color}*/
  get white() {
    return -1 | 0;
  }
  /**@readonly @type {color}*/
  get black() {
    return 255 | 0;
  }
  /**@readonly @type {color}*/
  get accent() {
    return -425066241 | 0;
  }
  /**@param {byte} r @param {byte} g @param {byte} b @param {byte} a @returns {color} */
  from(r = 0, g = 0, b = 0, a = 255) {
    return ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff);
  }
  /**@param {color} col @returns {byte} */
  r(col) {
    return (col >> 24) & 0xff;
  }
  /**@param {color} col @returns {byte} */
  g(col) {
    return (col >> 16) & 0xff;
  }
  /**@param {color} col @returns {byte} */
  b(col) {
    return (col >> 8) & 0xff;
  }
  /**@param {color} col @returns {byte} */
  a(col) {
    return col & 0xff;
  }
  /**@param {color} col @returns {color} */
  hide(col) {
    return col & 0xffffff00;
  }
  /**@param {color} col @param {byte} a  @returns {color} */
  withA(col, a) {
    a = Math.min(a, 255);
    return (col & 0xffffff00) | a;
  }
  /**@param {color} col @param {byte} a  @returns {color} */
  addA(col, a) {
    a = a | 0;
    col = col | 0;
    a = Math.min((col & 0xff) + a, 255);
    return (col & 0xffffff00) | a;
  }
  /**@param {color} col @param {byte} f  @returns {color} */
  lighten(col, f) {
    f = f >>> 0;
    col = col | 0;
    const r = Math.min(((col >> 24) & 0xff) + f, 255) | 0,
      g = Math.min(((col >> 16) & 0xff) + f, 255) | 0,
      b = Math.min(((col >> 8) & 0xff) + f, 255) | 0;
    return (r << 24) | (g << 16) | (b << 8) | (col & 0xff);
  }
  /**@param {color} col @param {byte} f  @returns {color} */
  darken(col, f) {
    f = f >>> 0;
    col = col | 0;
    const r = Math.max(((col >> 24) & 0xff) - f, 0) | 0,
      g = Math.max(((col >> 16) & 0xff) - f, 0) | 0,
      b = Math.max(((col >> 8) & 0xff) - f, 0) | 0;
    return (r << 24) | (g << 16) | (b << 8) | (col & 0xff);
  }
  /**@param {color} col @param {number} f  @returns {color} */
  mult(col, f) {
    col = col | 0;
    const r = clamp(((col >> 24) & 0xff) * f, 0, 255) | 0,
      g = clamp(((col >> 16) & 0xff) * f, 0, 255) | 0,
      b = clamp(((col >> 8) & 0xff) * f, 0, 255) | 0;
    return (r << 24) | (g << 16) | (b << 8) | (col & 0xff);
  }
  /**Mixes two colors together. @param {color} col1 @param {color} col2  @returns {color} */
  blend(col1, col2) {
    col1 = col1 | 0;
    col2 = col2 | 0;
    const r1 = (col1 >> 24) & 0xff,
      g1 = (col1 >> 16) & 0xff,
      b1 = (col1 >> 8) & 0xff,
      a1 = col1 & 0xff;
    const r2 = (col2 >> 24) & 0xff,
      g2 = (col2 >> 16) & 0xff,
      b2 = (col2 >> 8) & 0xff,
      a2 = col2 & 0xff;
    const ar = clamp(a1 + a2, 0, 255) & 0xff;
    const mf = a1 / ar;
    const rr = r1 * mf + r2 * (1 - mf),
      gr = g1 * mf + g2 * (1 - mf),
      br = b1 * mf + b2 * (1 - mf);
    return (rr << 24) | (gr << 16) | (br << 8) | (ar & 0xff);
  }
  /** @param {byte} level  @returns {color} */
  mono(level) {
    level = level & 0xff;
    return (level << 24) | (level << 16) | (level << 8) | 255;
  }
  /**@param {color} col @returns {[byte,byte,byte,byte]} */
  array(col) {
    col = col | 0;
    return [(col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, col & 0xff];
  }
  /**
   * Colour Interpolation function. Finds a colour along a virtual gradient, with arbitrary stops.\
   * *god this took forever i hate everything*\
   * **version 2 YEAAA**
   * @param {color[]} cols Array of colours. Gradient goes from start to end of array.
   * @param {float} factor Number 0-1. How far along the gradient the point is, from the start.
   * @returns {color} An integer representation of the colour at the specified point along the gradient. The final colour in the array, if `factor` is too large.
   */
  interp(cols, factor) {
    let l = cols.length;
    let n = (l - 1) | 0;
    if (l < 2) return cols[0] ?? 0;
    //Look at each gap between numbers
    for (let choice = 1; choice < l; choice++) {
      if (factor < choice / n) {
        //Set some temporary variables
        const c1 = cols[choice - 1],
          c2 = cols[choice],
          fact = factor * n - (choice - 1);
        const i_f = 1 - fact;
        //Interpolate between the 2 chosen colours
        // uhhhhhh what the actual fuck is this
        // what did i just write
        return (
          (((((c1 >> 24) & 0xff) * i_f + ((c2 >> 24) & 0xff) * fact) & 0xff) << 24) |
          (((((c1 >> 16) & 0xff) * i_f + ((c2 >> 16) & 0xff) * fact) & 0xff) << 16) |
          (((((c1 >> 8) & 0xff) * i_f + ((c2 >> 8) & 0xff) * fact) & 0xff) << 8) |
          (((c1 & 0xff) * i_f + (c2 & 0xff) * fact) & 0xff)
        );
      }
    }
    return cols.at(-1) | 0;
  }
  /**
   * Colour Interpolation function, but between 2 colours only.
   * @param {color} c1 First colour.
   * @param {color} c2 Second colour.
   * @param {float} factor Number 0-1. How much colour 2 contributes to the result.
   * @returns {color} An integer representation of the colour at the specified point along the gradient. The final colour in the array, if `factor` is too large.
   */
  in2rp(c1, c2, factor) {
    const fact = factor;
    const i_f = 1 - fact;
    return (
      (((((c1 >> 24) & 0xff) * i_f + ((c2 >> 24) & 0xff) * fact) & 0xff) << 24) |
      (((((c1 >> 16) & 0xff) * i_f + ((c2 >> 16) & 0xff) * fact) & 0xff) << 16) |
      (((((c1 >> 8) & 0xff) * i_f + ((c2 >> 8) & 0xff) * fact) & 0xff) << 8) |
      (((c1 & 0xff) * i_f + (c2 & 0xff) * fact) & 0xff)
    );
  }
  /**@param {color} col */
  hex(col) {
    return (col >>> 0).toString(16).padEnd(8, "f");
  }
  /**@param {string} col */
  fromHex(col) {
    return parseInt(col, 16) | 0;
  }
  /**@param {color} col */
  fill(col) {
    // if(typeof col !== "number") throw new TypeError(`${col} is not a color!`)
    // ctx.fillStyle = `#${(col >>> 0).toString(16).padEnd(8,"0")}`;
    col = col | 0;
    fill((col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, (col & 0xff) | 1);
  }
  /**@param {color} col */
  tint(col) {
    // ctx.fillStyle = `#${(col >>> 0).toString(16).padEnd(8,"0")}`;
    col = col | 0;
    tint((col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, (col & 0xff) | 1);
  }
  /**@param {color} col */
  fillOn(g, col) {
    col = col | 0;
    g.fill((col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, (col & 0xff) | 1);
  }
  /**@param {color} col */
  stroke(col) {
    // if(typeof col !== "number") throw new TypeError(`${col} is not a color!`)
    col = col | 0;
    stroke((col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, (col & 0xff) | 1);
  }
  /**@param {color} col */
  strokeOn(g, col) {
    col = col | 0;
    g.stroke((col >> 24) & 0xff, (col >> 16) & 0xff, (col >> 8) & 0xff, (col & 0xff) | 1);
  }
  /** Recursively converts every colour-looking property of an object to an actual colour. */
  autonorm = function (obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (
        v instanceof Array &&
        (v.length === 3) | (v.length === 4) &&
        v.every((i) => typeof i === "number")
      )
        obj[k] = this.from(v[0], v[1], v[2], v[3]);
      else if (typeof v === "string" && (v.length === 7 || v.length === 9) && v[0] === "#")
        obj[k] = this.fromHex(v.substring(1).padEnd(8, "f"));
      else if (typeof v === "object" && !(v instanceof Array)) obj[k] = this.autonorm(v);
    }
  }.bind(this);
})();

globalThis.c = col;
