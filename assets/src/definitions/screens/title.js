createUIComponent(
  ["title"],
  [],
  0,
  0,
  100,
  50,
  "none",
  () => {
    ui.menuState = "in-game"
  },
  "Play",
  true,
  30
)
createUIComponent(
  ["title"],
  [],
  0,
  -200,
  0,
  0,
  "none",
  null,
  "/   Project:   \\\n\\Reassembly/",
  false,
  50
).setTextColour([100,100,100])