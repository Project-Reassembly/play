import { EntityScripter } from "../../classes/entity/ai/scripter.js";
import { col } from "../../core/color.js";
import { createSyntaxHighlightedComponent, createUIComponent } from "../../core/ui.js";

createUIComponent(["ide"], [], -300, 0, 1250, 1050)
  .setOutlineColour(col.mono(60))
  .setBackgroundColour(col.accent);

let idetxt = `
// Test Sequential Entity Script

// definition area
// 'define' type 'name' (parameters, in compressed JSON format)

define action.wait 'time60' (duration:60)
define action.shoot 'fire' (pattern:{json:json})

// sequencing area
// 'name:' defines a new sequence
// arrows '->' separate ai frames
// multiple tokens between arrows creates concurrency
// 'x[action]' or 'x[action]*' where 'x' is an INTEGER and 'action' is an action name repeats 'action', 'x' times.
//   x[a]  unfolds to concurrent repetitions: '3[foo]' compiles to 'foo foo foo'
//   x[a]* unfolds to sequential repetitions: '3[foo]*' compiles to 'foo -> foo -> foo'
// 

main:
  action -> 5[time60] -> fire fire fire

// equivalent ways to define a subsequence action

define action.sequence 'subseq' (action, fire, fire, fire, fire, fire, fire, fire, fire)

subseq:
  action -> 8[fire]*

// then you can use it like this:

ex:
  <subseq> -> ...

// yes, it works with other structures, but it's a little more concise

ex2:
 2<subseq>* -> 3<ex> -> ...
`,
  tcursor = { ln: 0, col: 0, ovr: false, active: false };

export { capturedInput, tcursor };

function capturedInput(k) {
  const lns = idetxt.split("\n");
  const col = tcursor.col;
  const line = tcursor.ln;
  const l = lns[line];

  //console.log(l, l ? l[col] : "n/a");
  if (!l) {
    idetxt += "\n";
    tcursor.col = 0;
    tcursor.ln++;
  } else if (!l[col]) {
    tcursor.col = 0;
    tcursor.ln++;
  }
  write(line, col, k, tcursor.ovr);
  tcursor.col++;
}

function write(line, col, string, ovr = true) {
  const lns = idetxt.split("\n");
  const l = lns[line];
  lns[line] = `${l.slice(0, col)}${string}${l.slice(ovr ? col + string.length : col, l.length)}`;
  idetxt = lns.join("\n");
}
globalThis.write = write;

createSyntaxHighlightedComponent(["ide"], [], -300, 0, 1200, 1000, "none", () => {
  tcursor.active = !tcursor.active;
})
  .setOutlineColour(col.mono(60))
  .setBackgroundColour(col.mono(30))
  .setText(() => idetxt)
  .setFormatter((t) =>
    EntityScripter.tokenise(t, true)
      .map((t) => t.toCMFT())
      .join(""),
  );
