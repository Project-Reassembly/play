import * as CMFT from "../core/cmft.js";
import { col } from "../core/color.js";
import { fonts } from "./font.js";
class InGameMessage {
  msg = "";
  timer = 0;
  count = 1;
  /** @type {CMFT.Drawer} */
  cmft;
  constructor(message, time, charSize, maxChars) {
    this.msg = message;
    this.cmft = CMFT.drawer(message, charSize, maxChars).noBG();
    this.timer = time;
  }
}
class InGameMessageBox {
  x = 0;
  y = -100;
  /**@type {InGameMessage[]} */
  _messages = [];
  constructor(x, y, minWidth, chars = 100, maxLines = 30, textSize = 25) {
    this.minWidth = minWidth;
    this.x = x;
    this.y = y;
    this.maxChars = chars;
    this.maxLines = maxLines;
    this.charSize = textSize;
  }
  draw(backgroundColour = 100) {
    //[95, 100, 100, 160]
    if (this._messages.length === 0) return;
    let actualY = this.y;
    let w = this.minWidth;
    push();
    textFont(fonts.ocr);
    textAlign(LEFT, TOP);
    textSize(this.charSize);
    rectMode(CORNER);
    noStroke();
    fill(0, 100);
    let len = Math.min(this._messages.length, this.maxLines);
    for (const msg of this._messages) {
      const measured = msg.cmft.width;
      if (measured > w) w = measured;
    }
    actualY -= len * this.charSize;
    for (let m = len; m > 0; m--) {
      const msg = this._messages.at(-m);
      if (!msg) continue;

      let actualX = this.x;
      if (msg.timer < 100) {
        actualX -= w * (1 - msg.timer * 0.01);
      }
      rect(actualX, actualY, w, msg.cmft.height);
      msg.cmft.draw(actualX, actualY, col.white, col.from(255,220,0,));
      actualY += msg.cmft.height;
    }
    pop();
  }
  tick() {
    let len = this._messages.length;
    for (let index = 0; index < len; index++) {
      let message = this._messages[index];
      if (!message) continue;
      message.timer--;
      if (!(message.timer > 0)) {
        this._messages.splice(index, 1);
        index--;
      }
    }
  }
  send(message, time = 240) {
    let pm = this.read();
    if (pm?.msg === message) {
      pm.count += 1;
      pm.timer = time;
    } else this._messages.push(new InGameMessage(message, time, this.charSize, this.maxChars));
  }
  read() {
    return this._messages.at(-1);
  }
  clear() {
    this._messages.splice(0);
  }
}
const Log = new InGameMessageBox(-960, 400, 750);
globalThis.notify = () =>
  Log.send("#@bUpdate available! Save the game with /save or ctrl+j and reload the page.", 600);
globalThis.plog = Log;
export { InGameMessageBox, Log };

