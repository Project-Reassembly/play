/** A 32-bit random number generator with several methods to randomise various things. */
export class Randomiser {
  /**@type {Shr3} */
  shr;
  constructor(seed) {
    this.shr = new Shr3(seed);
    return Object.freeze(this);
  }
  /** Returns a random floating-point number between `a` and `b`. If `b` is omitted, it is zero. If `a` is omitted, it is one. @returns {number}*/
  float(a = 1, b = 0) {
    if (a > b) [a, b] = [b, a];
    return a + this.shr.rand() * (b - a);
  }
  /** Returns a random integral number between `a` and `b`. The lower bound is inclusive, and the upper is exclusive, allowing for
   * ```js
   * random.int(array.length)
   *  ```
   * Because of this, `a`'s default value is `2`, so
   * ```js
   * random.int()
   * ```
   * returns either `1` or `0`, with equal probability.
   * */
  int(a = 2, b = 0) {
    if (a > b) [a, b] = [b, a];
    return Math.floor(a + Math.random() * (b - a));
  }
  /** Returns a random hexadecimal string `length` characters long. Defaults to 6-character, like a colour. Does not include the preceding `0x` or `#`. @returns {string}*/
  hex(length = 6) {
    if (length <= 8)
      return (this.shr.randint() >>> (32 - length * 4)) // * ((1 << (length * 4)) - 1))
        .toString(16)
        .padStart(length, "0");
    return this.hex(8) + this.hex(length - 8);
  }
  /** Returns `true` with probability `chance`, otherwise returns false. If `chance` is omitted, the chances of `true` and `false` are equal. */
  bool(chance = 0.5) {
    return this.shr.rand() < chance;
  }
  /**Returns a random entry in the argument list.  \
   * Used like
   * ```js
   * random.of("a", "b", "c");
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.of(...array);
   * ```
   * @template T
   * @param {...T} args The entries to pick from.
   */
  of(...args) {
    return args[(this.shr.rand() * args.length) | 0];
  }
  /**Returns a random entry of the argument.  \
   * If the argument is an object, then a random value is returned.\
   * If the argument is an array, then a random entry is returned.\
   * Array lengths >= 4294967296 are not valid.\
   * Used like
   * ```js
   * random.in(["a", "b", "c"]) // "a";
   * random.in({a: "b", c: "d"}) // "b";
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.in(array);
   * ```
   * @template T
   * @param {{[s:string]:T}|ArrayLike<T>} array The entries to pick from.
   */
  in(array) {
    const vs = Object.values(array);
    return vs[(this.shr.rand() * vs.length) | 0];
  }
  /**Returns a random index of the argument.  \
   * If the argument is an object, then a random key is returned.\
   * If the argument is an array, then a random index is returned.\
   * Used like
   * ```js
   * random.idx(["a", "b", "c"]) // 1;
   * random.idx({a: "b", c: "d"}) // c;
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.idx(array) // 3;
   * ```
   * @template T
   * @param {T} array The entries to pick from.
   * @returns {T extends Array ? number : keyof T}
   */
  idx(array) {
    return Array.isArray(array) ?
        (this.shr.rand() * array.length) | 0
      : this.in(Object.keys(array));
  }
  /** Makes an array of random outputs, with length `count`.
   * `count` may be supplied multiple times, in which case the result will be 2-dimensional.
   * ```js
   * random.x(9).int() // [0, 1, 1 ,1, 0, 1 ,0, 0, 1]
   * random.x(3, 3).int() // [ [0, 1, 1], [1, 0, 1], [0, 0, 1] ]
   * random.x(3).x(3).int() // [ [0, 1, 1], [1, 0, 1], [0, 0, 1] ]
   * ```
   */
  x(...count) {
    return new RandomiserArrayWrapper(this, count);
  }
}
class Shr3 {
  constructor(seed) {
    this.setSeed(seed);
  }
  setSeed(val) {
    this.jsr = this.seed = (val == null ? Math.random() * 4294967295 : val) >>> 0;
  }
  getSeed() {
    return this.seed;
  }
  rand() {
    this.jsr ^= this.jsr << 17;
    this.jsr ^= this.jsr >> 13;
    this.jsr ^= this.jsr << 5;
    return (this.jsr >>> 0) / 4294967295;
  }
  randint() {
    this.jsr ^= this.jsr << 17;
    this.jsr ^= this.jsr >> 13;
    this.jsr ^= this.jsr << 5;
    return this.jsr >>> 0;
  }
  static next(prev) {
    prev = prev >>> 0;
    prev ^= prev << 17;
    prev ^= prev >> 13;
    prev ^= prev << 5;
    return (prev >>> 0) / 4294967295;
  }
}
/** Yeah no I'm not typing this */
class RandomiserArrayWrapper {
  /**@type {number[]} */
  #counts;
  /**@type {Randomiser} */
  #rnd;
  /**@param {number[]} counts  */
  constructor(rnd, counts) {
    this.#rnd = rnd;
    this.#counts = counts ?? [1];
    if (this.#counts.length === 0) this.#counts = [1];
    return Object.freeze(this);
  }
  /**@param {() => any} fn @param {any[]} args  */
  #arr(fn, length, args) {
    const a = [];
    for (let i = length - 1; i >= 0; i--) a[i] = fn.apply(this.#rnd, args);
    return a;
  }
  /**@param {() => any} fn @param {any[]} args  */
  #project(ar, fn, len, args) {
    ar.forEach(
      (v, i, a) =>
        (a[i] = Array.isArray(v) ? this.#project(v, fn, len, args) : this.#arr(fn, len, args)),
    );
    return ar;
  }
  /**@param {() => any} fn @param {any[]} args  */
  #arrange(fn, ...args) {
    // initial array
    let cs = [0];
    for (const count of this.#counts) {
      cs = this.#project(cs, fn, count, args);
    }
    return cs[0];
  }
  /** Returns a random floating-point number between `a` and `b`. If `b` is omitted, it is zero. If `a` is omitted, it is one.*/
  float(a = 1, b = 0) {
    return this.#arrange(this.#rnd.float, a, b);
  }
  /** Returns a random integral number between `a` and `b`. The lower bound is inclusive, and the upper is exclusive, allowing for
   * ```js
   * random.int(array.length)
   *  ```
   * Because of this, `a`'s default value is `2`, so
   * ```js
   * random.int()
   * ```
   * returns either `1` or `0`, with equal probability.
   * */
  int(a = 2, b = 0) {
    return this.#arrange(this.#rnd.int, a, b);
  }
  /** Returns a random hexadecimal string `length` characters long. Defaults to 6-character, like a colour. Does not include the preceding `0x` or `#`.*/
  hex(length = 6) {
    return this.#arrange(this.#rnd.hex, length);
  }
  /** Returns `true` with probability `chance`, otherwise returns false. If `chance` is omitted, the chances of `true` and `false` are equal. */
  bool(chance = 0.5) {
    return this.#arrange(this.#rnd.bool, chance);
  }
  /**Returns a random entry in the argument list.  \
   * Used like
   * ```js
   * random.of("a", "b", "c");
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.of(...array);
   * ```
   * @param {...any} args The entries to pick from.
   */
  of(...args) {
    return this.#arrange(this.#rnd.of, ...args);
  }
  /**Returns a random entry of the argument.  \
   * If the argument is an object, then a random value is returned.\
   * If the argument is an array, then a random entry is returned.\
   * Array lengths >= 4294967296 are not valid.\
   * Used like
   * ```js
   * random.in(["a", "b", "c"]) // "a";
   * random.in({a: "b", c: "d"}) // "b";
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.in(array);
   * ```
   * @template T
   * @param {{[s:string]:T}|ArrayLike<T>} array The entries to pick from.
   */
  in(array) {
    return this.#arrange(this.#rnd.in, array);
  }
  /**Returns a random index of the argument.  \
   * If the argument is an object, then a random key is returned.\
   * If the argument is an array, then a random index is returned.\
   * Used like
   * ```js
   * random.idx(["a", "b", "c"]) // 1;
   * random.idx({a: "b", c: "d"}) // c;
   * ```
   * or
   * ```js
   * const array = ["a", "b", "c"];
   * random.idx(array) // 3;
   * ```
   * @template T
   * @param {T} array The entries to pick from.
   * @returns {T extends Array ? number : keyof T}
   */
  idx(array) {
    return this.#arrange(this.#rnd.idx, array);
  }
  /** Makes an array of random outputs, with length `count`.
   * `count` may be supplied multiple times, in which case the result will be 2-dimensional.
   * ```js
   * random.x(9).int() // [0, 1, 1 ,1, 0, 1 ,0, 0, 1]
   * random.x(3, 3).int() // [ [0, 1, 1], [1, 0, 1], [0, 0, 1] ]
   * random.x(3).x(3).int() // [ [0, 1, 1], [1, 0, 1], [0, 0, 1] ]
   * ```
   */
  x(...count) {
    return new RandomiserArrayWrapper(this.#rnd, [...this.#counts, ...count]);
  }
}