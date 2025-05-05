import { fonts } from "./game.js";
class InGameMessageBox {
  x = 0;
  y = -100;
  _messages = [];
  constructor(x, y, width = 500, maxLines = 10, textSize = 20) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.maxLines = maxLines;
    this.textSize = textSize;
  }
  draw(backgroundColour = [0, 0, 0, 100]) {
    //[95, 100, 100, 160]
    if (this._messages.length === 0) return;
    let actualY = this.y < 0 ? height + this.y : this.y;
    let actualX = this.x < 0 ? width + this.x : this.x;
    let w = this.width;
    push();
    textFont(fonts.ocr);
    textAlign(LEFT, TOP);
    textSize(this.textSize);
    rectMode(CORNER);
    noStroke();
    let len = Math.min(this._messages.length, this.maxLines);
    for (let msg of this._messages) {
      let text = msg.msg;
      if ((msg.count ?? 1) > 1) text = "[" + msg.count + "]" + text;
      let measured = textWidth(text);
      if (measured > w) w = measured;
    }
    for (let index = 0; index < len; index++) {
      push();
      let message = (
        this.y < 0 ? this._messages.slice(0).reverse() : this._messages
      )[index];
      if (!message) continue;
      let drawY =
        this.y > 0
          ? actualY + this.textSize * index
          : actualY - this.textSize * index;
      let txtbg = backgroundColour.slice(0);
      let txtcol = message.colour.slice(0);
      txtcol[3] ??= 255;
      txtbg[3] *= Math.min(message.timer / 120, 1);
      txtcol[3] *= Math.min(message.timer / 120, 1);
      fill(txtbg);
      rect(actualX, drawY, w, this.textSize);
      fill(txtcol);
      let txt = message.msg;
      if ((message.count ?? 1) > 1) txt = "[" + message.count + "]" + txt;
      textStyle(message.style);
      text(txt, actualX, drawY);
      pop();
    }
    pop();
    textStyle("normal");
  }
  tick() {
    let len = this._messages.length;
    for (let index = 0; index < len; index++) {
      let message = this._messages[index];
      if (!message) continue;
      message.timer--;
      if (message.timer <= 0) {
        this._messages.splice(index, 1);
      }
    }
  }
  send(message, colour = [255, 255, 255, 255], style = "normal", time = 240) {
    let count = 1;
    if (this.read() === message) {
      count = this._messages.at(-1).count + 1;
      this._messages.pop();
    }
    this._messages.push({
      msg: message,
      timer: time,
      colour: colour,
      count: count,
      style: style,
    });
  }
  read() {
    return this._messages.at(-1)?.msg;
  }
  clear() {
    this._messages.splice(0);
  }
}
const Log = new InGameMessageBox(0, -100, 600, 20);
export { Log, InGameMessageBox };
