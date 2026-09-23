import { KeybindHandler } from "../../core/keys.js";
import { ui } from "../../core/ui.js";

export const keybinds = new (class Keybinds {
  #ui = new KeybindHandler();
  /**  @readonly */
  get ui() {
    return this.#ui;
  }
  #texteditor = new KeybindHandler();
  /** Keybinds that only function when the text editor is open. @readonly */
  get texteditor() {
    return this.#texteditor;
  }
  #game = new KeybindHandler();
  /** Keybinds that only function when in game. @readonly */
  get game() {
    return this.#game;
  }
  /** @type {Map<string,KeybindHandler>} */
  #modes = new Map();
  /** Gets a manager for keybinds which are only active while a certain mode is active. @readonly */
  mode(mode) {
    return this.#modes.getOrInsert(mode, new KeybindHandler());
  }
  down(ev) {
    if (ui.is("texteditor", "true") && this.#texteditor.downEvent(ev)) return;
    if (this.#ui.downEvent(ev)) return;
    if (ui.menuState === "in-game") {
      const mode = this.#modes.get(ui.get("mode"));
      if (mode && mode.downEvent(ev)) return;
      if (this.#game.downEvent(ev)) return;
    }
  }
  up(ev) {
    this.#texteditor.upEvent(ev);
    this.#ui.upEvent(ev);
    const mode = this.#modes.get(ui.get("mode"));
    mode && mode.upEvent(ev);
    this.#game.upEvent(ev);
  }
})();
