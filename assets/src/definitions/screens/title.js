createUIComponent(
  ["title"],
  [],
  0,
  0,
  100,
  50,
  "none",
  () => {
    genMode = "create";
    ui.menuState = "in-game";
  },
  "New",
  true,
  30
);
createUIComponent(
  ["title"],
  [],
  0,
  60,
  100,
  50,
  "none",
  () => {
    genMode = "load";
    ui.menuState = "in-game";
  },
  "Load",
  true,
  30
);
createUIComponent(
  ["title"],
  [],
  0,
  -200,
  0,
  0,
  "none",
  null,
  ">>> Project: <<<\n< Reassembly >",
  false,
  50
).setTextColour([100, 100, 100]);
