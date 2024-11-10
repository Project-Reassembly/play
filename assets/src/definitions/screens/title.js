createUIComponent(
  ["title"],
  [],
  0,
  0,
  100,
  50,
  "none",
  () => {
    createPlayer()
    ui.menuState = "in-game"
  },
  "Play",
  true,
  30
)