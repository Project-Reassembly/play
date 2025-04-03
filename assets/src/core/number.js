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
/**Returns a random number between `a` and `b`. */
function rnd(a, b) {
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
    (result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0) *
    sortOrder;
}
