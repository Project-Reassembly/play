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
 * @param {T} [prov=null] Value provider. Is inserted normally unless it's a function, in which case it is called, and the return value is used instead.
 * @returns {T[][]}
 */
export function create2DArray(size = 1, prov = null) {
  return createAsym2DArray(size, size, prov);
}
/** Creates a rectangular 2D array for use in the block grid.
 * @template T
 * @param {T} [prov=null] Value provider. Is inserted normally unless it's a function, in which case it is called, and the return value is used instead.
 * @returns {T[][]}
 */
export function createAsym2DArray(rows = 1, cols = 1, prov = null) {
  let array = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let i = 0; i < cols; i++) {
      row.push(prov instanceof Function ? prov() : prov);
    }
    array.push(row);
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
