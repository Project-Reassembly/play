//Goes up to a decillion (1 000 000 000 000 000 000 000 000 000 000). No-one will ever need that much stuff, so it should be enough.
const sizes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];

/**Shortens a number with human-friendly notation.
 * Does not round, but truncates instead, e.g. 12850 -> 1.28k
 */
function shortenedNumber(num = 0, digits = 3) {
  let exponential = num.toExponential();
  //Split the first bit and the power of 10
  let parts = exponential.split("e");
  let shownNum = parseFloat(parts[0].substring(0, digits + 1)); //Only use first N digits
  let poT = parseInt(parts[1]);
  //Get size part
  let sizeIndex = Math.max(Math.floor(poT / 3), 0);
  let shownNumSize = poT % 3;
  //Assemble
  let suffix = sizes[sizeIndex];
  return suffix
    ? `${roundNum(shownNum * 10 ** shownNumSize, 2)}${suffix}`
    : "∞";
}
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}
/**Rounds a number to a specified number of decimal places. */
function roundNum(number, dp = 0) {
  return Math.round(number * 10 ** dp) / 10 ** dp;
}
/**Returns a random number between `a` and `b`. If `b` is missing, `-a` will be substituted.*/
function rnd(a, b) {
  if (b == undefined) return rnd(a, -a);
  if (a === b) return a;
  return a + Math.random() * (b - a);
}
/**Returns `true` with a specified chance. */
function tru(chance) {
  return rnd(0, 1) < chance;
}
/**Creates a sort function based on an object property. Use `"-(property)"`, such as `"-health"`, to sort in reverse. Works on string and number values.*/
function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substring(1);
  }
  return (a, b) =>
    (a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0) *
    sortOrder;
}

/**
 * Colour Interpolation function. Finds a colour along a virtual gradient, with arbitrary stops.\
 * *god this took forever i hate everything*
 * @param {int[][]} cols Array of colours. Must all be the same length, or NaNs pop up. Gradient goes from start to end of array.
 * @param {float} factor Number 0-1. How far along the gradient the point is, from the start.
 * @param {boolean} [forceint=false] If true, will round the outputs to force them to be integer. Probably required for most uses.
 * @returns {int[]} An array representing the colour at the specified point along the gradient. The final colour in the array, if `factor` is too large.
 */
function colinterp(cols, factor, forceint = false) {
  let l = cols.length;
  let n = l - 1;
  if (l < 2) return cols[0];
  //Look at each gap between numbers
  for (let choice = 1; choice < l; choice++) {
    if (factor < choice / n) {
      //Set some temporary variables
      let c1 = cols[choice - 1],
        c2 = cols[choice],
        fact = (factor - (choice - 1) / n) * n;
      //Interpolate between the 2 chosen colours
      let o = Math.max(c1.length, c2.length); //Allows colour arrays of any length
      let out = [];
      for (let i = 0; i < o; i++)
        out.push((c1[i] ?? 255) * (1 - fact) + (c2[i] ?? 255) * fact);
      return forceint ? out.map((x) => Math.round(x)) : out;
    }
  }
  return cols.at(-1);
}

/**
 * A class representing a 2D vector structure.
 */
class Vector {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  /** The length of the hypotenuse of the triangle formed by this vector's X- and Y-values as lengths. */
  get magnitude() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }
  /**
   * Adds 2 vectors.
   * @param {Vector} vct Vector to add.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the addition. Either this vector, or the new one.
   */
  add(vct, mutate = false) {
    return this.addXY(vct.x, vct.y, mutate);
  }
  /**
   * Adds an x- and y-value to a vector.
   * @param {float} x X-value to add.
   * @param {float} y Y-value to add.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the addition. Either this vector, or the new one.
   */
  addXY(x, y, mutate = false) {
    if (mutate) {
      this.x += x;
      this.y += y;
    }
    return mutate ? this : new Vector(this.x + x, this.y + y);
  }
  /**
   * Subtracts another vector from this one.
   * @param {Vector} vct Vector to subtract.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the subtraction. Either this vector, or the new one.
   */
  sub(vct, mutate = false) {
    return this.subXY(vct.x, vct.y, mutate);
  }
  /**
   * Subtracts an x- and y-value from this vector.
   * @param {float} x X-value to subtract.
   * @param {float} y Y-value to subtract.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the subtraction. Either this vector, or the new one.
   */
  subXY(x, y, mutate = false) {
    return this.addXY(-x, -y, mutate);
  }
  /**
   * Scales this vector by an amount.
   * @param {float} amt Amount to scale by. For example, 2 would make the vector twice as long.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  scale(amt, mutate = false) {
    return this.scaleAsymmetrical(amt, amt, mutate);
  }
  /**
   * Scales this vector by an amount, using different amounts for the x- and y-direction.
   * @param {float} amtX Amount to scale the X-coordinate by. For example, 2 would make the vector twice as wide.
   * @param {float} amtY Amount to scale the Y-coordinate by. For example, 3 would make the vector three times as tall.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  scaleAsymmetrical(amtX, amtY, mutate = false) {
    if (mutate) {
      this.x *= amtX;
      this.y *= amtY;
    }
    return mutate ? this : new Vector(this.x * amtX, this.y * amtY);
  }
  /** The angle in degrees this vector makes with the positive x-axis. */
  get angle() {
    return (this.angleRad * 180) / Math.PI;
  }
  /** The angle in radians this vector makes with the positive x-axis. */
  get angleRad() {
    return Math.atan2(this.y, this.x);
  }
  /**
   * Returns the unit vector of this vector, i.e. this vector scaled by 1/magnitude.
   * @param {boolean} [mutate=false]  Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  normalise(mutate = false) {
    return this.scale(1 / this.magnitude, mutate);
  }
  /**
   * Finds the distance between this vector and another.
   * @param {Vector} vct The other vector to get the distance to.
   * @returns The Euclidean distance from this vector to the other one.
   */
  distanceTo(vct) {
    return this.sub(vct).magnitude;
  }
  /**Creates a vector from an angle *in degrees* */
  static fromAngle(angle) {
    return this.fromAngleRad((angle / 180) * Math.PI);
  }
  /**Creates a vector from an angle *in radians* */
  static fromAngleRad(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  /** Returns a p5.Vector object equivalent to this vector.\
   * Use this class instead whenever possible.
   */
  toP5() {
    return new p5.Vector(this.x, this.y);
  }
  /**
   * Creates a vector from a p5.Vector object.\
   * Work with this class when possible.\
   * Will not retain 3D values.
   * @param {p5.Vector} vct P5.Vector object to convert.
   * @returns A new Vector equivalent to the p5 vector.
   */
  static fromP5(vct) {
    return new this();
  }
}

function turn(direction, x, y, toX, toY, amount) {
  let delta = new Vector(toX - x, toY - y);
  //Define variables
  let currentDirection = Vector.fromAngle(direction).angle; //Find current angle, standardised
  let targetDirection = delta.angle; //Find target angle, standardised
  if (targetDirection === currentDirection)
    return { direction: direction, done: true }; //Do nothing if facing the right way
  let deltaRot = targetDirection - currentDirection;
  //Rotation correction
  if (deltaRot < -180) {
    deltaRot += 360;
  } else if (deltaRot > 180) {
    deltaRot -= 360;
  }
  let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
  let deltaD = 0;
  let done = false;
  //Choose smaller turn
  if (Math.abs(deltaRot) > amount) {
    deltaD = amount * sign;
    done = true;
  } else {
    deltaD = deltaRot;
    done = false;
  }
  //Turn
  return { direction: direction + deltaD, done: done };
}

export {
  shortenedNumber,
  clamp,
  roundNum,
  rnd,
  tru,
  dynamicSort,
  colinterp,
  turn,
  Vector,
};
