const jsonifier =
    /(?:['"])?([a-zA-Z0-9_$]+)(?:['"])?\s*(?=:)|(?:['"])([^"']*)(?:['"])\s*(?!=:)|(?:['"])?([a-zA-Z_$](?:[a-zA-Z0-9_$ .\-]|\\.)*)(?:['"])?\s*(?!=:)/g,
  dejsonifier =
    /(?:['"])?([a-zA-Z0-9_$]+)(?:['"])?\s*(?=:)|(['"][^"']*['"])\s*(?!=:)|(?:['"])?([a-zA-Z_$](?:[a-zA-Z0-9_$ .\-]|\\.)*)(?:['"])?\s*(?!=:)/g;

/** @param {string} ses  */
function __es_implicit_array(ses) {
  let jsons = ses.trim();

  let items = [];
  let depthb = 0,
    depthr = 0,
    depthp = 0,
    lastpos = 0,
    opened = [];
  for (let i = 0; i < jsons.length; i++) {
    const char = jsons[i];
    if (char === "{") depthr++;
    if (char === "}") depthr--;
    if (char === "[") {
      depthb++;
      opened.push(i);
    }
    if (char === "]") {
      if (depthb > 0) {
        const o = opened.pop(),
          content = jsons.substring(o + 1, i);
        jsons = `${jsons.substring(0, o)}[${__es_implicit_array(content)}]${jsons.substring(i + 1)}`;
      }
      depthb--;
    }
    if (char === "(") depthp++;
    if (char === ")") depthp--;

    if (char === "," && depthb === 0 && depthp === 0 && depthr === 0) {
      items.push(jsons.substring(lastpos, i));
      lastpos = i + 1;
    }
  }
  items.push(jsons.substring(lastpos));
  return items.map((x) => (/^[^{[]*:/.test(x) ? `{${x.trim()}}` : x.trim())).join(",");
}

/**@param {*} obj @param {string|number} [spacing=undefined]  */
const __es_serialise = (obj, spacing) =>
  JSON.stringify(typeof obj === "object" ? obj : `${obj}`, undefined, spacing).replaceAll(
    dejsonifier,
    "$1$2$3",
  );

/**@param {string} ses */
const __es_deserialise = (ses) =>
  JSON.parse(
    __es_implicit_array(/^[^{[]*:/.test(ses) ? `{${ses.trim()}}` : ses.trim())
      .replaceAll(jsonifier, '"$1$2$3"')
      .trim(),
  );

/**@enum {number} */
const TokenType = {
  Comment: -127, // //
  Whitespace: -126, //
  Arrow: -1, // ->
  Define: 0, // define
  Subsequence: 1, // abc:
  Name: 2, // 'abc'
  Data: 3, // (key: value)
  Repeat: 4, // 8[abc]
  SeqRepeat: 5, // 8[abc]*
  SubseqReference: 6, // <seq>
  SSRepeat: 7, // 8<abc>
  SSSeqRepeat: 8, // 8<abc>*
  Type: 9, // action.*
  Default: 127, // literally anything else
};
class Token {
  /**@type {TokenType} */
  type = TokenType.Default;
  /**
   * @param {TokenType} type
   * @param {string | [any, string]} content
   */
  constructor(type, content) {
    if (type !== undefined) this.type = type;
    if (content) this.content = content;
  }
  toString() {
    switch (this.type) {
      case TokenType.Comment:
        return `//${this.content}`;
      case TokenType.Arrow:
        return "->";
      case TokenType.Data:
        return `(${this.content})`;
      case TokenType.Type:
      case TokenType.Default:
        return this.content;
      case TokenType.Define:
        return "define ";
      case TokenType.Name:
        return `'${this.content}'`;
      case TokenType.Repeat:
        return `${this.content[0]}[${this.content[1]}]`;
      case TokenType.SeqRepeat:
        return `${this.content[0]}[${this.content[1]}]*`;

      case TokenType.SSRepeat:
        return `${this.content[0]}<${this.content[1]}>`;
      case TokenType.SSSeqRepeat:
        return `${this.content[0]}<${this.content[1]}>*`;

      case TokenType.Subsequence:
        return `${this.content}:`;
      case TokenType.SubseqReference:
        return `<${this.content}>`;
    }
  }
  toDisplay() {
    return this.toString()
      .replace(" ", "∙")
      .replace(/\r?\n|\r/, "↧\n")
      .replace("\t", "→");
  }
  #CMFTSafeContent() {
    return (this.type <= 8 && this.type >= 4 ? this.content[1] : this.content).replace("#", "\\#");
  }
  toCMFT() {
    switch (this.type) {
      case TokenType.Comment:
        return `#2-//${this.#CMFTSafeContent()}`;
      case TokenType.Arrow:
        return "#n-->";
      case TokenType.Data:
        return `#e-(${this.#CMFTSafeContent()})`;
      case TokenType.Default:
        return `#g-${this.#CMFTSafeContent()}`;
      case TokenType.Type:
        return `#h-${this.#CMFTSafeContent()}`;
      case TokenType.Define:
        return "#n-define ";
      case TokenType.Name:
        return `#6-'#g-${this.#CMFTSafeContent()}#6-'`;

      case TokenType.Repeat:
        return `#c-${this.content[0]}[#g-${this.#CMFTSafeContent()}#c-]`;
      case TokenType.SeqRepeat:
        return `#c-${this.content[0]}[#g-${this.#CMFTSafeContent()}#c-]#e-*`;

      case TokenType.SSRepeat:
        return `#c-${this.content[0]}<#r-${this.#CMFTSafeContent()}#c->`;
      case TokenType.SSSeqRepeat:
        return `#c-${this.content[0]}<#r-${this.#CMFTSafeContent()}#c->#e-*`;

      case TokenType.Subsequence:
        return `#d-${this.#CMFTSafeContent()}:`;
      case TokenType.SubseqReference:
        return `#5-<#r-${this.content}#5->`;
    }
  }
  get merges() {
    return this.type === TokenType.Whitespace || this.type === TokenType.Default;
  }
}

export class EntityScripter {
  /**@readonly */
  static serialise = __es_serialise;
  /**@readonly   */
  static deserialise = __es_deserialise;

  /**@param {string} ses  */
  static tokenise(ses, whitespace = false) {
    const input = `${ses}`;
    function finish(i) {
      const s = whitespace ? input.slice(last_tok_end, i) : input.slice(last_tok_end, i).trim();
      if (s) tokens.push(new Token(undefined, s));
      last_tok_end = i;
    }
    const tokens = [];
    let last_tok_end = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      // console.log(`char #${i} = ${char} (near [${input.slice(Math.max(i-3,0), i)}̃${char}${input.slice(i+1, Math.min(i+3, input.length))}])`);

      if (!whitespace && /\s/.test(char)) continue;

      // define
      if (__es_match_at(input, "define ", i)) {
        finish(i);
        tokens.push(new Token(TokenType.Define));
        last_tok_end = i = i + 7;
      }

      // comments
      if (__es_match_at(input, "//", i)) {
        finish(i);
        let end = __es_search_from(input, "\n", i + 2);
        if (end === -1) end = input.length;
        tokens.push(new Token(TokenType.Comment, input.slice(i + 2, end)));
        last_tok_end = i = end;
        i--;
      }

      // arrow
      if (__es_match_at(input, "->", i)) {
        finish(i);
        tokens.push(new Token(TokenType.Arrow));
        last_tok_end = i = i + 2;
      }

      // name
      if (char === "'") {
        const d = __es_search_from(input, "'", i + 1);
        if (d !== -1) {
          finish(i);
          tokens.push(new Token(TokenType.Name, input.slice(i + 1, d - 1)));
          last_tok_end = i = d;
        }
      }

      // data
      if (char === "(") {
        const d = __es_search_from(input, ")", i + 1);
        if (d !== -1) {
          finish(i);
          tokens.push(new Token(TokenType.Data, input.slice(i + 1, d - 1)));
          last_tok_end = i = d;
        }
      }

      // call
      if (char === "<") {
        const d = __es_search_from(input, ">", i + 1);
        if (d !== -1) {
          finish(i);
          tokens.push(new Token(TokenType.SubseqReference, input.slice(i + 1, d - 1)));
          last_tok_end = i = d;
        }
      }

      // subsequence name
      if (/\w/.test(char)) {
        const d = __es_search_from_in_word(input, ":", i);
        if (d !== -1) {
          finish(i);
          tokens.push(new Token(TokenType.Subsequence, input.slice(i, d - 1)));
          last_tok_end = i = d;
        }
      }

      // repeat
      if (/\d/.test(char)) {
        const s = __es_find_bounds_with_depth(input, "[", "]", i);
        const a = __es_find_bounds_with_depth(input, "<", ">", i);
        const d =
          s && a ?
            s[0] < a[0] ?
              s
            : a
          : (s ?? a);
        if (d) {
          finish(i);
          const seq = input[d[1]] === "*";
          tokens.push(
            new Token(
              d === a ?
                seq ? TokenType.SSSeqRepeat
                : TokenType.SSRepeat
              : seq ? TokenType.SeqRepeat
              : TokenType.Repeat,
              [input.slice(i, d[0]), input.slice(d[0] + 1, d[1] - 1)],
            ),
          );
          if (seq) d[1]++;
          last_tok_end = i = d[1];
        }
      }

      // console.log(char);
    }
    finish(input.length);
    let l = null;
    // console.log(tokens);
    tokens.forEach((v, i, a) => {
      if (l && v.merges && l.type === v.type) {
        // console.log(`merged [${l}] and [${v}]`);
        l.content += v.content;
        delete a[i];
      }
      l = v;

      // semantic
      if (v.type === TokenType.Define && a[i+1]?.type === TokenType.Default) {
        a[i+1].type = TokenType.Type;
      }
    });
    return tokens.filter((t) => t);
  }
  /** @param {Token[]} tokens  */
  static eval(tokens) {}
  /**@param {string} path  */
  static async #getfile(path) {
    return await (await fetch(path)).text();
  }
  /**@param {string} path  */
  static async tokeniseFile(path) {
    return this.tokenise(await this.#getfile(path));
  }
}

/**@param {string} search @param {number} start @param {string} str @returns The index of the end of the match, or -1 if none was found. */
function __es_search_from(str, search, start) {
  // starting char
  const s = search[0];
  // empty string
  if (!s) return start;
  let matchstart = -1;
  // find starting point
  for (let j = start; j < str.length; j++)
    if (str[j] === s) {
      matchstart = j;
      break;
    }
  // I didn't find it
  if (matchstart === -1) return -1;
  // optimisation for single chars
  if (search.length === 1) return matchstart + 1;

  // let the compiler be faster at string comparison
  if (str.slice(matchstart, matchstart + search.length) !== search) return -1;
  // for (let i = 0; i < search.length; i++) if (str[matchstart + i] !== search[i]) return -1;
  return matchstart + search.length;
}
/**@param {string} search @param {number} start @param {string} str @returns The index of the end of the match, or -1 if none was found. */
function __es_search_from_in_word(str, search, start) {
  // starting char
  const s = search[0];
  // empty string
  if (!s) return start;
  let matchstart = -1;
  // find starting point
  for (let j = start; j < str.length; j++)
    if (/\s/.test(str[j])) return -1;
    else if (str[j] === s) {
      matchstart = j;
      break;
    }
  // I didn't find it
  if (matchstart === -1) return -1;
  // optimisation for single chars
  if (search.length === 1) return matchstart + 1;

  // let the compiler be faster at string comparison
  if (str.slice(matchstart, matchstart + search.length) !== search) return -1;
  // for (let i = 0; i < search.length; i++) if (str[matchstart + i] !== search[i]) return -1;
  return matchstart + search.length;
}

/** Finds a section enclosed in brackets. Takes depth into account, so supports nested brackets. Also supports multi-character brackets.
 * @param {string} open @param {string} close @param {number} start @param {string} str @param {number} [depth=0] Initial depth of the search. Returns when closed. @returns The bounds of the found container, or null if no valid container was present */
function __es_find_section_with_depth(str, open, close, start, depth = 0) {
  return str.slice(...__es_find_bounds_with_depth(str, open, close, start, depth));
}

/** Finds the boundaries of a section enclosed in brackets. Takes depth into account, so supports nested brackets. Also supports multi-character brackets.
 * @param {string} open @param {string} close @param {number} start @param {string} str @param {number} [depth=0] Initial depth of the search. Returns when closed. @returns {[number, number]|null} The bounds of the found container, or null if no valid container was present */
function __es_find_bounds_with_depth(str, open, close, start, depth = 0) {
  // since depth doesn't apply to this, but it's possible that they try anyway
  if (open === close) {
    const s = str.indexOf(open);
    return [s, __es_search_from(str, close, s + open.length)];
  }
  // starting chars
  const o = open[0];
  const c = close[0];
  /**@type {number} */
  let openpos = 0;
  // empty string
  if (!o || !c) return [start, start];
  // find starting point
  for (let j = start; j < str.length; j++) {
    let matchstart = -1;
    let isclose = false;
    if (str[j] === c) {
      matchstart = j;
      isclose = true;
    } else if (str[j] === o) {
      openpos ||= j;
      matchstart = j;
    }

    // I found one
    if (matchstart !== -1)
      if (!isclose) {
        // optimisation for single chars
        // console.log("opened at " + matchstart + " d " + depth + " -> " + (depth + 1));
        if (open.length === 1) depth++;
        else {
          // let the compiler be faster at string comparison
          if (str.slice(matchstart, matchstart + open.length) === open) {
            depth++;
            j += open.length - 1;
          }
        }
      } else {
        // console.log("closed at " + matchstart + " d " + depth + " -> " + (depth - 1));
        if (close.length === 1) {
          depth--;
          if (depth === 0) return [openpos, matchstart + 1];
        } else {
          // let the compiler be faster at string comparison
          if (str.slice(matchstart, matchstart + close.length) === close) {
            // for (let i = 0; i < search.length; i++) if (str[matchstart + i] !== search[i]) return -1;{
            depth--;
            j += close.length - 1;
            if (depth === 0) return [openpos, matchstart + close.length];
          }
        }
      }
  }
  return null;
}
globalThis._esm = __es_match_at;
globalThis._es = __es_find_bounds_with_depth;
globalThis._ess = __es_find_section_with_depth;

/**@param {string} search @param {number} start @param {string} str @returns True if the string matches, false if not. */
function __es_match_at(str, search, start) {
  // optimisation for single chars
  if (search.length === 1) return str[start] === search;

  // let the compiler be faster at string comparison
  if (str.slice(start, start + search.length) !== search) return false;
  // for (let i = 0; i < search.length; i++) if (str[matchstart + i] !== search[i]) return -1;
  return true;
}

globalThis.ES = EntityScripter;
