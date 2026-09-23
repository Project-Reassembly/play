/** Represents a key with optional modifiers. */
class ModifiedKey {
  key = "esc";
  mods = 0;
  constructor(key, modifiers = 0) {
    this.key = key;
    this.mods = modifiers;
    //console.log(`created [${key}:${(control ? "c" : "") + (shift ? "s" : "") + (alt ? "a" : "")}]`);
  }
  active(key, ctrl, shift, alt) {
    // console.log(
    //   `checking [${key}:${(ctrl ? "c" : "") + (shift ? "s" : "") + (alt ? "a" : "")}] against [${
    //     this.key
    //   }:${(this.ctrl ? "c" : "") + (this.shift ? "s" : "") + (this.alt ? "a" : "")}]`
    // );
    return (
      this.key === key
      && (this.mods === -1
        || (((this.mods & mods.ctrl) !== 0) === ctrl && ((this.mods & mods.shift) !== 0) === shift && ((this.mods & mods.alt) !== 0) === alt))
    );
  }
}

/** Defines a _shortcut_: that is, a keybind that fires once, when a key is pressed. */
class KeyBinding {
  #event_press;
  #event_hold;
  #event_release;
  #held = false;
  /**@readonly */
  get down() {
    return this.#held;
  }
  /**
   * @param {string} key
   * @param {modifier} mods
   * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
   */
  constructor(key, modifiers = 0, events = {}) {
    this.#shortcut = new ModifiedKey("" + key, modifiers);
    this.#event_press = events.press;
    this.#event_release = events.release;
    this.#event_hold = events.hold;
  }
  /** @readonly */
  get shortcut() {
    return this.#shortcut;
  }
  /** @type {ModifiedKey?} */
  #shortcut = null;
  /** @type {() => void} */
  event = () => undefined;
  press() {
    if (this.#event_press) void this.#event_press();
    this.#held = true;
  }
  release() {
    if (this.#held && this.#event_release) void this.#event_release();
    this.#held = false;
  }
  hold() {
    if (this.#held && this.#event_hold) void this.#event_hold();
  }
  /**@type {ModifiedKey} */
  #original = null;
  /** Changes a binding's settings. Won't change name or event.
   * @param {{key?: string, addMods?: modifier, removeMods?: modifier}} changes
   */
  modify(changes = {}) {
    this.#original ??= this.#shortcut;
    let modifiers = this.#original.mods;
    if (changes.addMods !== undefined) modifiers = modifiers | changes.addMods;
    if (changes.removeMods !== undefined) modifiers = modifiers & ~changes.removeMods;
    this.#shortcut = new ModifiedKey(changes.key ?? this.#shortcut.key, modifiers);
  }
  /**Resets this keybind to its original value. */
  restore() {
    this.#shortcut = this.#original;
  }
}

/** Deals with a whole collection of keybinds. */
export class KeybindHandler {
  /** @type {Map<string, KeyBinding>} */
  #keys = new Map();

  #sc = new (class Shortcuts {
    /** @type {Map<string, KeyBinding>} */
    #keys;
    constructor(keys) {
      Object.freeze(this);
      this.#keys = keys;
    }
    /** Creates and connects a new shortcut binding with no modifiers, and only a keydown event.
     * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
     */
    simple(name, key, event) {
      const kb = new KeyBinding(key, 0, { press: event });
      this.#keys.set(name, kb);
      return kb;
    }
    /** Creates and connects a new shortcut binding with modifiers, but still only a keydown event.
     * @param {modifier} mods
     * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
     */
    modified(name, key, mods, event) {
      const kb = new KeyBinding(key, mods, { press: event });
      this.#keys.set(name, kb);
      return kb;
    }
    /** Creates and connects a new shortcut binding with no modifiers, and keyup / keydown events.
     * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
     */
    dual(name, key, down, up) {
      const kb = new KeyBinding(key, 0, { press: down, release: up });
      this.#keys.set(name, kb);
      return kb;
    }
  })(this.#keys);
  /** @readonly */
  get shortcut() {
    return this.#sc;
  }
  #ct = new (class Controls {
    /** @type {Map<string, KeyBinding>} */
    #keys;
    constructor(keys) {
      Object.freeze(this);
      this.#keys = keys;
    }
    /** Creates and connects a new control binding with no modifiers, and only a hold event.
     * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
     */
    simple(name, key, event) {
      const kb = new KeyBinding(key, 0, { hold: event });
      this.#keys.set(name, kb);
      return kb;
    }
    /** Creates and connects a new control binding with modifiers, but still only a hold event.
     * @param {modifier} mods
     * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
     */
    modified(name, key, mods, event) {
      const kb = new KeyBinding(key, mods, { hold: event });
      this.#keys.set(name, kb);
      return kb;
    }
  })(this.#keys);
  /** @readonly */
  get controls() {
    return this.#ct;
  }
  /** Creates and connects a new shortcut binding.
   * @param {modifier} mods
   * @param {{ press?: () => void, hold?: () => void, release?: () => void }} events
   */
  binding(name, key, mods, events) {
    const kb = new KeyBinding(key, mods, events);
    this.#keys.set(name, kb);
    return kb;
  }

  /** Changes a binding's settings. Won't change name or event.
   * @param {{key?: string, ctrl?: boolean, shift?: boolean, alt?: boolean, ignore?: boolean}} mods
   */
  modify(name, mods) {
    let binding = this.#keys.get(name);
    binding.modify(mods);
  }
  /**Resets the specified keybind to its original value. */
  restore(name) {
    let binding = this.#keys.get(name);
    binding.restore();
  }
  /** Removes (all) functionality from a shortcut. */
  disconnect(name) {
    this.#keys.delete(name);
  }
  /** Disconnects all shortcuts. */
  kill() {
    this.#keys.clear();
  }
  /** Force-fires the specified keybind.
   * @returns `true` if it fired, `false` if not.
   */
  fire(name) {
    let b = this.#keys.get(name);
    return !b || !b.press();
  }
  /**
   * Fires `down` with data from the provided `KeyboardEvent`.
   * @param {KeyboardEvent} ev
   */
  downEvent(ev) {
    return this.down(ev.code, ev.ctrlKey, ev.shiftKey, ev.altKey);
  }
  /**
   * Fires `up` with data from the provided `KeyboardEvent`.
   * @param {KeyboardEvent} ev
   */
  upEvent(ev) {
    return this.up(ev.code);
  }
  /** Fires connected events for each keybind matching the passed in key and modifiers.
   * @returns `true` if some event fired, `false` if not.
   */
  down(key, ctrl = false, shift = false, alt = false) {
    let fired = false;
    // console.log(`firing [${key}:${(ctrl ? "c" : "") + (shift ? "s" : "") + (alt ? "a" : "")}]`);
    for (const [name, binding] of this.#keys) {
      if (binding.shortcut.active(key, ctrl, shift, alt)) {
        binding.press();
        // console.log(`activated ${name}`);
        fired = true;
      }
    }
    // if (!fired) console.log(`no result`);
    return fired;
  }
  /**
   * Notifies each keybind matching the passed in key that it has been released.
   * @returns `true` if some event fired, `false` if not.
   */
  up(key) {
    // console.log(`unfiring [${key}:*]`);
    for (const [name, binding] of this.#keys) {
      if (binding.shortcut.key === key) {
        binding.release();
        // console.log(`deactivated ${name}`);
      }
    }
  }
  /** Updates each keybind (fires its 'hold' event). */
  tick() {
    for (const [, binding] of this.#keys) binding.hold();
  }
  /** Returns the key and modifiers associated with the specified binding, presented in human-readable format. */
  describe(name) {
    const b = this.#keys.get(name)?.shortcut;
    return b ? `${b.ctrl ? "Ctrl + " : ""}${b.shift ? "Shift + " : ""}${b.alt ? "Alt + " : ""}${renames[b.key] ?? autoname(b.key)}` : undefined;
  }
  /** Returns the key and modifiers associated with the specified binding, presented in CMFT for a coloured human-readable format. */
  describeCMFT(name) {
    const b = this.#keys.get(name)?.shortcut;
    return b ?
        `${b.ctrl ? "#d-Ctrl#=- + " : ""}${b.shift ? "#d-Shift#=-  + " : ""}${b.alt ? "#d-Alt#=-  + " : ""}#a-${renames[b.key] ?? autoname(b.key)}`
      : undefined;
  }
  /** Returns the key name associated with the specified binding. */
  key(name) {
    return this.#keys.get(name)?.shortcut?.key;
  }
  /** Returns whether or not the specified binding requires the `ctrl` key to be held. */
  ctrl(name) {
    return this.#keys.get(name)?.shortcut?.ctrl;
  }
  /** Returns whether or not the specified binding requires the `shift` key to be held. */
  shift(name) {
    return this.#keys.get(name)?.shortcut?.shift;
  }
  /** Returns whether or not the specified binding requires the `alt` key to be held. */
  alt(name) {
    return this.#keys.get(name)?.shortcut?.alt;
  }
  /** Returns the key and modifiers associated with the specified binding, as a `ModifiedKey` object. */
  descriptor(name) {
    return this.#keys.get(name)?.shortcut;
  }
  /** @readonly */
  get all() {
    return new Set(this.#keys.keys());
  }
}

const renames = {
  ArrowUp: "Up",
  ArrowLeft: "Left",
  ArrowDown: "Down",
  ArrowRight: "Right",
  BracketOpen: "[",
  BracketClose: "]",
  IntlBackslash: "\\",
  /** yeah, i know */
  Backslash: "#",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Semicolon: ";",
  Minus: "-",
  Equal: "=",
  ContextMenu: "Menu",
  NumpadMultiply: "Multiply",
  NumpadDivide: "Divide",
  NumpadSubtract: "Subtract",
  NumpadAdd: "Add",
  NumpadEnter: "Execute",
};
/** @typedef {number & {}} modifier */
/** Modifier key states. Can be combined with bitwise 'or' operations. */
export const mods = Object.freeze({
  /** @type {modifier} */ ctrl: 0b0001,
  /** @type {modifier} */ shift: 0b0010,
  /** @type {modifier} */ alt: 0b0100,
  /** Ignore modifier states, go in any state. */
  ignore: -1,
});
export const keys = Object.freeze({
  unbound: "",
  q: "KeyQ",
  w: "KeyW",
  e: "KeyE",
  r: "KeyR",
  t: "KeyT",
  y: "KeyY",
  u: "KeyU",
  i: "KeyI",
  o: "KeyO",
  p: "KeyP",
  a: "KeyA",
  s: "KeyS",
  d: "KeyD",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  z: "KeyZ",
  x: "KeyX",
  c: "KeyC",
  v: "KeyV",
  b: "KeyB",
  n: "KeyN",
  m: "KeyM",
  space: "Space",
  0: "Digit0",
  1: "Digit1",
  2: "Digit2",
  3: "Digit3",
  4: "Digit4",
  5: "Digit5",
  6: "Digit6",
  7: "Digit7",
  8: "Digit8",
  9: "Digit9",
  minus: "Minus",
  equals: "Equal",
  backquote: "Backquote",
  backspace: "Backspace",
  hash: "Backslash",
  backslash: "IntlBackslash",
  slash: "Slash",
  comma: "Comma",
  dot: "Period",
  tab: "Tab",
  capsLock: "CapsLock",
  escape: "Escape",
  f1: "F1",
  f2: "F2",
  f3: "F3",
  f4: "F4",
  f5: "F5",
  f6: "F6",
  f7: "F7",
  f8: "F8",
  f9: "F9",
  f10: "F10",
  f11: "F11",
  f12: "F12",
  insert: "Insert",
  delete: "Delete",
  np1: "Numpad1",
  np2: "Numpad2",
  np3: "Numpad3",
  np4: "Numpad4",
  np5: "Numpad5",
  np6: "Numpad6",
  np7: "Numpad7",
  np8: "Numpad8",
  np9: "Numpad9",
  np0: "Numpad0",
  enter: "Enter",
  apostrophe: "Quote",
  menu: "ContextMenu",
  divide: "NumpadDivide",
  multiply: "NumpadMultiply",
  subtract: "NumpadSubtract",
  add: "NumpadAdd",
  execute: "NumpadEnter",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
});
/** @param {string} str */
function autoname(str) {
  return str
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z0-9][a-z0-9])/g, "$1 $2")
    .replace("Numpad ", "NP ");
}
