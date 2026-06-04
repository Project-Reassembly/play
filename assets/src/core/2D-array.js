/**
 * Runs a function on each element on a 2D array. Array does not have to be square.
 * @template T
 * @param {T[][]} array 2D Array to iterate.
 * @param {(element:T, row:number, col:number) => bool} func Function to iterate with. Return true to stop iterating.
 */
export function iterate2DArray(array, func) {
  outer: for (let row = 0; row < array.length; row++) {
    const rowa = array[row] ?? [];
    for (let col = 0; col < rowa.length; col++) {
      if (func(rowa[col], row, col) === true) break outer;
    }
  }
  //array.forEach((row, rowi) => row.forEach((element, col) => void func(element, rowi, col)));
}
/**
 * Runs a function on each element on a 2D array. Array does not have to be square.
 * @template T
 * @template V
 * @param {T[][]} array 2D Array to iterate.
 * @param {(element:T, row:number, col:number) => V} transformer Function to iterate with. Return true to stop iterating.
 * @returns {V[][]}
 */
export function map2DArray(array, transformer) {
  let newa = createEmpty2DCopy(array);
  iterate2DArray(array, (el, row, col) => (newa[row][col] = transformer(el)));
  return newa;
}
/**
 * Runs a function on each element on a 2D array. Array does not have to be square.
 * Allows non-rectangular arrays.
 * @template T
 * @template V
 * @param {T[][]} array 2D Array to iterate.
 * @param {(element:T, row:number, col:number) => V} transformer Function to iterate with. Return true to stop iterating.
 * @returns {V[][]}
 */
export function mapJagged2DArray(array, transformer) {
  return array.map((r, ri) => r.map((v, ci) => transformer(v, ri, ci)));
}

/** Creates a square 2D array for use in the block grid.
 * @template T
 * @param {T | (i:number,j:number) => T} [prov=null] Value provider. Is inserted normally unless it's a function, in which case it is called, and the return value is used instead.
 * @returns {T[][]}
 */
export function create2DArray(size = 1, prov = null) {
  return createAsym2DArray(size, size, prov);
}
/** Creates a rectangular 2D array for use in the block grid.
 * @template T
 * @param {T | (i:number,j:number) => T} [prov=null] Value provider. Is inserted normally unless it's a function, in which case it is called, and the return value is used instead.
 * @returns {T[][]}
 */
export function createAsym2DArray(rows = 1, cols = 1, prov = null) {
  let array = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row[j] = prov instanceof Function ? prov(i, j) : prov;
    }
    array[i] = row;
  }
  return array;
}
/** Creates an empty rectangular 2D array.
 * @returns {void[][]}
 */
export function createEmptyAsym2DArray(rows = 1, cols = 1, prov = null) {
  let array = [];
  for (let i = 0; i < rows; i++) {
    array.push(new Array(cols));
  }
  return array;
}

/** Creates an empty rectangular 2D array, with the same dimensions as the passed one.
 * @param {*[][]} array
 * @returns {void[][]}
 */
export function createEmpty2DCopy(array) {
  return createEmptyAsym2DArray(array.length, array[0]?.length ?? 0);
}

/** Copies a rectangular 2D array into another one, starting at the specified position. Mutates the original array.
 * @template T @template V
 * @param {T[][]} source
 * @param {V[][]} dest
 * @returns {(T|V)[][]} The modified destination array.
 */
export function writeSubsection(source, dest, startX = 0, startY = 0) {
  if (!dest?.length || !dest[0]?.length)
    throw new TypeError(`Can only copy into a 2D array, not a ${dest?.constructor?.name}!`);
  if (!source?.length || !source[0]?.length)
    throw new TypeError(`Can only copy a 2D array, not a ${source?.constructor?.name}!`);
  const rows = source.length;
  const cols = source[0].length;

  if (startY + rows > dest.length || startX + cols > dest[0].length)
    throw new RangeError(
      `Source array is not fully inside destination (${startX}..${startX + source[0].length}/${startY}..${startY + source.length} is not inside 0..${dest[0].length}/0..${dest.length})!`,
    );

  for (let y = 0; y < rows; y++) {
    let row = dest[startY + y];
    if (!row) row = dest[startY + y] = new Array(cols);
    for (let x = 0; x < cols; x++) {
      row[startX + x] = source[y][x];
    }
  }
  return dest;
}
/** Mutates a rectangular subsection of a 2D array.
 * @template T @template V
 * @param {T[][]} array
 * @param {(el:T,row:number,col:number)=>V} modifier
 * @returns {(T|V)[][]} The modified destination array.
 */
export function modifySubsection(
  array,
  modifier,
  startX = 0,
  startY = 0,
  sizeX = array[0]?.length,
  sizeY = array.length,
) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only modify a 2D array, not a ${array?.constructor?.name}!`);

  if (startY + sizeX > array.length || startX + sizeY > array[0].length)
    throw new RangeError(
      `Specified area is not fully inside destination array (${startX}..${startX + sizeX}/${startY}..${startY + sizeY} is not inside 0..${array[0].length}/0..${array.length})!`,
    );

  for (let y = 0; y < sizeY; y++) {
    const thisY = startY + y;
    let row = array[thisY];
    if (!row) row = array[thisY] = new Array(sizeX);
    for (let x = 0; x < sizeX; x++) {
      const thisX = startX + x;
      row[thisX] = modifier(row[thisX], thisY, thisX);
    }
  }
  return array;
}
/** Calls a function for each element in a rectangular subsection of a 2D array.
 * @template T
 * @param {T[][]} array
 * @param {(el:T,row:number,col:number,array:T[][])=>void} action
 */
export function iterateSubsection(
  array,
  action,
  startX = 0,
  startY = 0,
  sizeX = array[0]?.length,
  sizeY = array.length,
) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only act on a 2D array, not a ${array?.constructor?.name}!`);

  if (startY + sizeX > array.length || startX + sizeY > array[0].length)
    throw new RangeError(
      `Specified area is not fully inside source array (${startX}..${startX + sizeX}/${startY}..${startY + sizeY} is not inside 0..${array[0].length}/0..${array.length})!`,
    );

  for (let y = 0; y < sizeY; y++) {
    const thisY = startY + y;
    let row = array[thisY];
    if (!row) row = array[thisY] = new Array(sizeX);
    for (let x = 0; x < sizeX; x++) {
      const thisX = startX + x;
      void action(row[thisX], thisY, thisX, array);
    }
  }
}
/**
 * Reads a rectangular subsection of a 2D array.
 * @template T
 * @param {T[][]} array
 * @returns {T[][]}
 */
export function getSubsection(
  array,
  startX = 0,
  startY = 0,
  sizeX = array[0]?.length,
  sizeY = array.length,
) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only read a 2D array, not a ${array?.constructor?.name}!`);

  if (startY + sizeX > array.length || startX + sizeY > array[0].length)
    throw new RangeError(
      `Specified area is not fully inside source array (${startX}..${startX + sizeX}/${startY}..${startY + sizeY} is not inside 0..${array[0].length}/0..${array.length})!`,
    );

  let rows = [];
  for (let i = 0; i < sizeY; i++) rows[i] = array[startY + i].slice(startX, startX + sizeX);
  return rows;
}
/** Nulls out a rectangular subsection of a 2D array.
 * @template T
 * @param {T[][]} array
 */
export function deleteSubsection(
  array,
  startX = 0,
  startY = 0,
  sizeX = array[0]?.length,
  sizeY = array.length,
) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only act on a 2D array, not a ${array?.constructor?.name}!`);

  if (startY + sizeX > array.length || startX + sizeY > array[0].length)
    throw new RangeError(
      `Specified area is not fully inside source array (${startX}..${startX + sizeX}/${startY}..${startY + sizeY} is not inside 0..${array[0].length}/0..${array.length})!`,
    );

  for (let y = 0; y < sizeY; y++) {
    const thisY = startY + y;
    let row = array[thisY];
    if (!row) row = array[thisY] = new Array(sizeX);
    for (let x = 0; x < sizeX; x++) {
      const thisX = startX + x;
      row[thisX] = null;
    }
  }
}

/** Finds indices of all elements with the maximum value in the array.
 * @template T
 * @param {T[][]} array
 */
export function multiMax(array, cap = Infinity) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only act on a 2D array, not a ${array?.constructor?.name}!`);
  /**@type {Set<idx>} */
  const inds = new Set();
  let max = Math.min(array[0][0], cap);
  iterate2DArray(array, (elem, row, col) => {
    if (elem > max && elem <= cap) {
      inds.clear();
      inds.add(index.of(col, row));
      max = elem;
    } else if (elem === max) inds.add(index.of(col, row));
  });
  return inds;
}
/** Finds indices of all elements with the minimum value in the array.
 * @template T
 * @param {T[][]} array
 */
export function multiMin(array, floor = -Infinity) {
  if (!array?.length || !array[0]?.length)
    throw new TypeError(`Can only act on a 2D array, not a ${array?.constructor?.name}!`);
  /**@type {Set<idx>} */
  const inds = new Set();
  let min = Math.max(array[0][0], floor);
  iterate2DArray(array, (elem, row, col) => {
    if (elem < min && elem >= floor) {
      inds.clear();
      inds.add(index.of(col, row));
      min = elem;
    } else if (elem === min) inds.add(index.of(col, row));
  });
  return inds;
}

/**@typedef {number & {}} idx */
/**@typedef {number & {}} int16 */
/** Manages indices: sets of 2 integral 16-bit indices, compacted into a 32-bit integer. */
export const index = {
  /**
   * Creates an index representing `...[j][i]`. \
   * Always returns the same value for the same inputs. \
   * If the dimension of the array is 1, then a plain number may be used with the same semantics as this with j=0.
   * `index.of(x)` may be used for one-dimensional arrays.
   * @param {int16} col Second (horizontal) component.
   * @param {int16} row First (vertical) component.
   * @returns {idx}
   */
  of(col, row = 0) {
    col = col & 0xffff;
    row = row & 0xffff;

    return (col << 16) | row;
  },
  /**Gets the second 'horizontal' component of the index. @param {idx} idx Index to get component of. @returns {int16} */
  col(idx) {
    return (idx >> 16) & 0xffff;
  },
  /**Gets the first 'vertical' component of the index. @param {idx} idx Index to get component of. @returns {int16} */
  row(idx) {
    return idx & 0xffff;
  },
  /**Multiplied the components of an index by a number. @param {idx} idx Index to scale. @returns {idx} */
  scale(idx, factor) {
    return (
      (((idx & 0xffff0000) * factor) & 0xffff0000) | (((idx & 0x0000ffff) * factor) & 0x0000ffff)
    );
  },
  /**Offsets the components of an index. @param {idx} idx Index to scale. @returns {idx} */
  offset(idx, cols, rows) {
    return ((((idx >> 16) + cols) & 0x0000ffff) << 16) | (((idx & 0x0000ffff) + rows) & 0x0000ffff);
  },
  /** Swaps the i and j components of an index. @param {idx} idx Index to reflect. @returns {idx} New index with the components swapped. */
  reflect(idx) {
    return ((idx >> 16) & 0xffff) | ((idx & 0xffff) << 16);
  },
  /** Converts an index to a string representation. */
  str(idx) {
    return `(${(idx >> 16) & 0xffff},${idx & 0xffff})`;
  },
  /** Parses an output from `index.str(...)`. Returns `(0,0)` for an invalid format, and invalid components become `0`. @param {string} str  */
  parse(str) {
    str = `${str}`;
    const start = str.indexOf("("),
      sep = str.indexOf(",", start + 1),
      end = str.indexOf(")", sep + 1);
    console.log(start, sep, end);
    if (start !== -1 && sep !== -1 && end !== -1) {
      return this.of(
        parseInt(str.substring(start + 1, sep).trim()) || 0,
        parseInt(str.substring(sep + 1, end).trim()) || 0,
      );
    }
    return 0;
  },
  /** Finds the element of a 2D array at this index, or `null` if the index doesn't exist. @template T @param {T[][]} arr @returns T */
  at(arr, idx) {
    try {
      return arr[idx & 0xffff][(idx >> 16) & 0xffff];
    } catch {
      return null;
    }
  },
};
globalThis.i = index;
