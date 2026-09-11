import { Timer } from "../classes/timer.js";
import { col } from "../core/color.js";
import { createUIComponent, createUIImageComponent, ui, UIComponent } from "../core/ui.js";

export const notifyTimer = new Timer();
ui.addReset("notify", "false");

const warnBg = createUIComponent(["in-game"], ["notify:true"], 0, -250, 1920, 75),
  warnOutl = createUIComponent(["in-game"], ["notify:true"], 0, -250, 1940, 125).removeBackground(),
  warnText = createUIComponent(
    ["in-game"],
    ["notify:true"],
    0,
    -260,
    0,
    0,
    "none",
    null,
    "text here",
    true,
    40,
  )
    .removeBackground()
    .removeOutline(),
  warnSubText = createUIComponent(
    ["in-game"],
    ["notify:true"],
    0,
    -230,
    0,
    0,
    "none",
    null,
    "text here",
    true,
    20,
  )
    .removeBackground()
    .removeOutline(),
  warnTapeTop = createUIImageComponent(
    ["in-game"],
    ["notify:true"],
    2880,
    -300,
    3840,
    20,
    null,
    "detail.warning-tape",
    false,
  ),
  warnTapeBottom = createUIImageComponent(
    ["in-game"],
    ["notify:true"],
    -2880,
    -200,
    3840,
    20,
    null,
    "detail.warning-tape",
    false,
  );
export function warnTapeNotification(message, color = col.white, subtext= "WARNING", subcol = col.black) {
  color = color | 0;
  subcol = subcol | 0;
  UIComponent.setCondition("notify", "true");
  // setup
  notifyTimer.cancel("*");
  warnBg.setBackgroundColour(col.transparent);
  warnBg.setOutlineColour(col.transparent);
  warnOutl.setOutlineColour(col.transparent);
  warnText.setTextColour(col.transparent);
  warnSubText.setTextColour(col.transparent);
  warnText.text = `${message}`;
  warnSubText.text = `/// ${subtext} ///`;
  warnTapeTop.x = 2880;
  warnTapeBottom.x = -2880;
  // fade in
  notifyTimer.repeat(
    (i) => {
      warnTapeTop.x -= 32;
      warnTapeBottom.x += 32;
      warnBg.setBackgroundColour(col.from(100, 100, 100, i * 4.25));
      warnBg.setOutlineColour(col.from(50, 50, 50, i * 4.25));
      warnOutl.setOutlineColour(col.from(50, 50, 50, i * 4.25));
      warnText.setTextColour(col.withA(color, i * 4.25));
      warnSubText.setTextColour(col.withA(subcol, i * 4.25));
    },
    60,
    1,
  );
  // tick
  notifyTimer.repeat(
    (i) => {
      warnTapeTop.x -= 4;
      warnTapeBottom.x += 4;
    },
    480,
    1,
    60,
  );
  // fade out
  notifyTimer.repeat(
    (i) => {
      warnTapeTop.x -= 32;
      warnTapeBottom.x += 32;
      warnBg.setBackgroundColour(col.from(100, 100, 100, 255 - i * 4.25));
      warnBg.setOutlineColour(col.from(50, 50, 50, 255 - i * 4.25));
      warnOutl.setOutlineColour(col.from(50, 50, 50, 255 - i * 4.25));
      warnText.setTextColour(col.withA(color, 255 - i * 4.25));
      warnSubText.setTextColour(col.withA(subcol, 255 - i * 4.25));
    },
    60,
    1,
    540,
  );
  // end
  notifyTimer.do((i) => {
    UIComponent.setCondition("notify", "false");
  }, 600);
}

globalThis.bn = warnTapeNotification;
