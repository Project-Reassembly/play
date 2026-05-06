import { fonts } from "../play/font.js";
import { col } from "./color.js";

//#region MLF1

function draw(
  x,
  y,
  txt,
  header,
  colour = col.black,
  outlineColour = col.mono(50),
  backgroundColour = col.from(95,100,100,160),
  txtSize = 20,
  headerColourOverride = null,
) {
  push();
  //Setup
  textAlign(LEFT);
  textFont(fonts.ocr);
  textSize(txtSize);
  strokeWeight(txtSize / 10);
  //Max width
  let maxWidth = header ? textWidth(header) + txtSize * 1.2 : 0;
  let boxH = header ? txtSize * 2 : txtSize * 0.6;
  let body = txt.split("\n");
  let descLines = txt.split("\n").length;
  let lines = (header ? 1 : 0) + Math.ceil(descLines);
  textSize(txtSize * 0.9);
  //Max width of body text, plus small buffer, and also height
  for (let line of body) {
    let lw = textWidth(line);
    boxH += txtSize * 0.9;
    if (lw > maxWidth) maxWidth = lw + txtSize * 1.2;
  }
  //X pos
  let displayX = x + maxWidth / 2;
  //Y pos, can't go offscreen
  let displayY = y + boxH / 2;
  if (displayY + boxH / 2 > 540) {
    displayY = 540 - boxH / 2;
  }
  //Stop horizontal overflow
  if (displayX + maxWidth / 2 > 960) {
    displayX = 960 - maxWidth / 2;
  }
  textSize(txtSize);
  col.fill(backgroundColour);
  strokeWeight(5);
  col.stroke(outlineColour);
  //Box, with padding
  rect(displayX, displayY, maxWidth, boxH);
  col.fill(headerColourOverride ?? colour);
  col.stroke(headerColourOverride ?? colour);
  strokeWeight(1);
  let textX = displayX - maxWidth / 2 + 10;
  let textY = displayY - boxH / 2 + (header ? txtSize * 0.5 : -txtSize) + 20;
  if (header) text(header, textX, textY - 5);
  textSize(txtSize * 0.9);
  col.fill(colour);
  noStroke();
  for (let line = 0; line < lines; line++) {
    coltxt(body[line], textX, textY + txtSize + line * txtSize * 0.9, colour);
  }
  pop();
}
const Decoration = {
  "🟥": col.from(255,60,60,),
  "🟧": col.from(255,180,80,),
  "🟨": col.from(255,220,50,),
  "🟩": col.from(50,255,50,),
  "🟦": col.from(50,220,255,),
  "🟪": col.from(200,0,255,),
  "🟫": col.from(165,105,83,),
  "⬛": col.from(20,20,20,),
  "⬜": "reset",
};
function findTextColourPrefix(str = "") {
  for (let key of Object.getOwnPropertyNames(Decoration)) {
    if (str.startsWith(key)) return key;
  }
  return "";
}
function findTextColourSuffix(str = "") {
  for (let key of Object.getOwnPropertyNames(Decoration)) {
    if (str.endsWith(key)) return key;
  }
  return "";
}
function coltxt(textToShow = "", x, y, defcolour) {
  if (!textToShow) return;
  let trimmed = textToShow.trim();
  let colcode = findTextColourPrefix(trimmed);
  let endcolcode = findTextColourSuffix(trimmed);
  //Log.send(textToShow + " => " + colcode + ", " + endcolcode);
  let colour = Decoration[colcode];
  let endcolour = Decoration[endcolcode];

  if (colour === "reset") col.fill(defcolour);
  else if (colour) col.fill(colour);
  text(
    (colour || endcolour ?
      textToShow.replace(colcode, "").replace(endcolcode, "")
    : textToShow
    ).replaceAll(/[^\\]#../g, ""), //since this text doesnt support colour codes like #ci, remove them to avoid confusion
    x,
    y,
  );
  if (endcolour === "reset") col.fill(defcolour);
  else if (endcolour) col.fill(endcolour);
}

/** Assembles all possible format codes, using the input string. */
function formatTest(char = "A") {
  return Object.keys(Decoration)
    .map((c) => `${c}${char}${"⬜"}`)
    .join("\n");
}


export { Decoration, draw, formatTest };

