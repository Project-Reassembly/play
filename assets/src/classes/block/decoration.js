import { Block } from "./block.js";
import { ui } from "../../core/ui.js";
import { drawMultilineText } from "../inventory.js";
import { Item } from "../item/item.js";
import { Log } from "../../play/messaging.js";
class SignBlock extends Block {
  _message = "";
  drawTooltip(x, y, outline, background) {
    drawMultilineText(
      x,
      y,
      this._message.replaceAll("\\n", "\n"),
      null,
      Item.getColourFromRarity(0, "light")
    );
  }
  getMsg(){
    return this._message;
  }
  highlight(emphasised) {
    super.highlight(emphasised),
      this.drawTooltip(this.uiX + Block.size * ui.camera.zoom, this.uiY);
  }
  interaction(ent, istack) {
    ui.texteditor.text = this._message;
    ui.texteditor.active = true;
    ui.texteditor.isCommandLine = false;
    ui.texteditor.title = "Edit Message Text:";
    ui.texteditor.save = (txt) => {
      Log.send("Text changed.");
      this._message = txt;
    };
    ui.waitingForMouseUp = true;
  }
  serialise() {
    let b = super.serialise();
    b.message = this._message;
    return b;
  }
  /**
   * @param {SignBlock} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    deserialised._message = creator.message;
  }
  read() {
    return this._message;
  }
  write(txt) {
    this._message = txt;
  }
}
export { SignBlock };
