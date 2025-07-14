//Game info
const versionGetURL =
  "https://cdn.jsdelivr.net/gh/Project-Reassembly/play@main/version.json";
let gameVersion = "0.0.0";
let preNumber = -1;
let isPreview = true;

let notify = () => {};
let versiongetter = false;
function processVersion(v) {
  let vers = v.split(".").map((x) => parseInt(x) || 0);
  //seriously only have each part up to 2 characters long or everything breaks
  return vers[0] * 10000 + vers[1] * 100 + vers[2];
}
async function checkUpdate() {
  console.log("[v] Checking for update...");
  let oldver = gameVersion;
  let oldpre = preNumber;
  await getVer();
  console.log("[v] Got data:");
  //analyse version number
  let gv = processVersion(gameVersion);
  let ov = processVersion(oldver);
  if (gv !== ov || preNumber > oldpre) {
    console.log("  Update available (" + gv + "/" + ov + ")");
    notify();
    versiongetter = true;
  } else {
    console.log("  No update available (" + gv + ").");
    versiongetter = false;
  }
  gameVersion = oldver;
  preNumber = oldpre;
}
async function getVer() {
  await import("" + versionGetURL + `?t=${Date.now()}`, {
    with: { type: "json" },
  }).then(
    (val) => {
      let def = val.default;
      console.log("[v] Got version data", def);
      gameVersion = def?.version ?? "0.0.0";
      preNumber = def?.preview ?? -1;
      isPreview = def?.isPreview ?? true;
    },
    async () => {
      console.warn(
        "[v] Failed to get version data, retrying from local data..."
      );
      await import(`../../version.json?t=${Date.now()}`, { with: { type: "json" } }).then(
        (val) => {
          let def = val.default;
          console.log("[v] Got backup version data", def);
          gameVersion = def?.version ?? "0.0.0";
          preNumber = def?.preview ?? -1;
          isPreview = def?.isPreview ?? true;
        }
      );
    }
  );
}

console.log("[v] Getting initial version data...");
import(`../../version.json?t=${Date.now()}`, { with: { type: "json" } }).then((val) => {
  let def = val.default;
  console.log("[v] Got initial version data", def);
  gameVersion = def?.version ?? "0.0.0(error)";
  preNumber = def?.preview ?? -1;
  isPreview = def?.isPreview ?? true;
});
