import { dynamicSort, roundNum } from "./number.js";

/**@param {number} zeros The number of zeros after the one in the number of times - 6 -> 1000000 times. @param {Function[]} fns Functions to compare. @param {any[]} params What to pass to the functions. @param {any} thisArg The value to use as `this`. */
export const perf = (zeros, fns, params, thisArg = null) => {
  const results = [];
  const t = Math.pow(10, zeros) >>> 0;
  console.log(`[Performance x1e${zeros}]\n Test started - ${t} times.`);
  for (let i = 0; i < fns.length; i++) {
    const f = fns[i];
    f.apply(thisArg, params); // spin-up or something
    const start = performance.now();
    for (let i = 0; i < t; i++) f.apply(thisArg, params);
    const end = performance.now();
    const time = end - start;
    results.push({ index: i, name: f.name, time: time });
  }
  console.log(` Test finished. Results:`);
  const table = {};
  results.sort(dynamicSort("time"));
  for (const { index, name, time } of results) {
    const ms = time / t;
    table[`${name} (${index})`] = {
      "Total (s)": roundNum(time * 0.001, 3),
      "Average (ms)": roundNum(ms, 3),
      "Average (μs)": roundNum(ms * 1000, 3),
    };
  }
  console.table(table);
  console.log(` Fastest was <${results[0].name}>.`);
};
globalThis.perf = perf;
