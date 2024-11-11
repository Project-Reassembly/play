//Get a shorter number e.g. 12850 -> 1.29k
function shortenedNumber(num = 0) {
  //Goes up to a decillion (1 000 000 000 000 000 000 000 000 000 000). No-one will ever need that much stuff, so it should be enough.
  const sizes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];
  let exponential = num.toExponential();
  //Split the first bit and the power of 10
  let parts = exponential.split("e");
  let shownNum = parseFloat(parts[0].substring(0, 4)); //Only use first 3 digits
  let poT = parseInt(parts[1]);
  //Get size part
  let sizeIndex = Math.floor(poT / 3);
  let shownNumSize = poT % 3;
  //Assemble
  return `${roundNum(shownNum * 10 ** shownNumSize, 2)}${sizes[sizeIndex]}`;
}

function roundNum(number, dp = 0) {
  return Math.round(number * 10 ** dp) / 10 ** dp;
}

function rnd(a, b) {
  return a + Math.random() * (b - a);
}
