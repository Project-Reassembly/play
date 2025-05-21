import { roundNum } from "../../../core/number.js";
import { game } from "../../../play/game.js";
import { Log } from "../../../play/messaging.js";
import { blockSize } from "../../../scaling.js";
import { drawMultilineText } from "../../inventory.js";
import { Item } from "../../item/item.js";
import { patternedBulletExpulsion } from "../../projectile/bullet.js";
import { Container } from "../container.js";

/**
 * Special blocks which sell items to your corporation for 💵
 */
export class LaunchPad extends Container {
  launchCooldown = 360;
  #launchTime = 0;
  launchAmount = 10;
  inventorySize = 12;
  tick() {
    super.tick();
    this.tickLaunch();
  }
  tickLaunch() {
    if (this.#launchTime > 0) this.#launchTime--;
    else {
      if (!this.validateLaunch()) return;
      this.launch();
      this.#launchTime = this.launchCooldown;
    }
  }
  validateLaunch() {
    if (this.inventory.count("*") < this.launchAmount) return false;
    return true;
  }
  launch() {
    let rem = this.launchAmount;
    let value = 0;
    let sold = [];
    this.inventory.iterate((item, slot, sotp) => {
      if (rem > item.count) {
        rem -= item.count;
        value += (item.getItem()?.marketValue ?? 0) * item.count;
        sold.push(item.toString(true));
        item.clear();
      } else {
        value += (item.getItem()?.marketValue ?? 0) * rem;
        sold.push(rem + "x " + (item.getItem()?.name ?? "null"));
        item.count -= rem;
        rem = 0;
      }
      if (rem === 0) sotp();
    }, true);
    game.money += value;
    Log.send(
      "Got $" + value + " from selling " + sold.join(", "),
      [80, 200, 80]
    );
    this.inventory.clean();
    patternedBulletExpulsion(
      this.x + blockSize / 2,
      this.y + blockSize / 2,
      {
        trailEffect: "land-trail",
        lifetime: 360,
        speed: 0,
        decel: -0.05,
        collides: false,
      },
      1,
      -90,
      0,
      0,
      this.world,
      game.player
    );
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    drawMultilineText(
      x,
      y,
      this.inventory.count("*") +
        "/" +
        this.launchAmount +
        "\n" +
        (this.validateLaunch() ? "Launching!" : "Not ready") +
        "\n" +
        ""
          .padEnd((this.#launchTime / this.launchCooldown) * 20, "■")
          .padEnd(20, "□")
          .substring(0, 20),
      this.title,
      Item.getColourFromRarity(0, "light")
    );
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.inventorySize + " slots",
      this.launchAmount + " items per launch",
      roundNum(this.launchCooldown / 60, 1) + "s launch cooldown",
      "🟨 -------------------- ⬜",
    ];
  }
}
