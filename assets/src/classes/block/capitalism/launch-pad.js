import { constructFromType } from "../../../core/constructor.js";
import * as MLF1 from "../../../core/mlf1.js";
import { roundNum } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import { drawImg, ui } from "../../../core/ui.js";
import { game } from "../../../play/game.js";
import { Log } from "../../../play/messaging.js";
import { blockSize } from "../../../scaling.js";
import { ImageParticle } from "../../effect/image-particle.js";
import { ItemStack } from "../../item/item-stack.js";
import { Item } from "../../item/item.js";
import { BulletModel } from "../../projectile/bullet-model.js";
import { Timer } from "../../timer.js";
import { Container } from "../container.js";

/**
 * Special blocks which sell items to your corporation for 💵
 */
export class LaunchPad extends Container {
  podImage = "error";
  trail = "iti-pad-trail";
  launchCooldown = 360;
  #launchTime = 0;
  launchAmount = 10;
  inventorySize = 12;
  /** @type {BulletModel} */
  #bulletModel = new BulletModel();
  init() {
    super.init();

    this.#bulletModel = constructFromType(
      {
        lifetime: 360,
        collides: false,
        components: [
          { type: "vfx-trail", effect: this.trail, spacing: "timed" },
          { type: "movement", speed: 0, decel: -0.05 },
        ],
      },
      BulletModel,
    );
  }
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
        sold.push(`${rem}x ${item.getItem()?.name ?? "null"}`);
        item.count -= rem;
        rem = 0;
      }
      if (rem === 0) sotp();
    }, true);
    game.money += value;
    Log.send(`#a-Got \$${value} from selling ${sold.join("#a-, ")}`);
    this.inventory.clean();
    this.#bulletModel.emit(this.x, this.y, 1, -90, 0, 0, this.world, game.player);
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    MLF1.draw(
      x,
      y,
      `${this.inventory.count("*")}/${this.launchAmount}\n${this.validateLaunch() ? "Launching!" : "Not ready"}\n${""
        .padEnd((this.#launchTime / this.launchCooldown) * 20, "■")
        .padEnd(20, "□")
        .substring(0, 20)}`,
      this.title,
      Item.getColourFromRarity(0, "light"),
    );
  }
  createExtendedDetails() {
    return `${super.createExtendedDetails()}\n#=-Launching:\n  #i-${this.launchAmount} items#-- per launch\n  #h-${roundNum(this.launchCooldown / 60, 1)}s#-- launch cooldown\n  -> #e-${roundNum((60 * this.launchAmount) / this.launchCooldown, 2)} items/s#-- throughput`;
  }
}
/**
 * Special blocks which buy items from your corporation for 💵
 */
export class LandingPad extends Container {
  podImage = "error";
  trail = "iti-pad-trail";
  timer = new Timer();
  receiveCooldown = 540;
  #receiveTime = 0;
  inventorySize = 12;
  #currentFilter = "nothing";
  /** @type {BulletModel} */
  #bulletModel = new BulletModel();
  init() {
    super.init();

    this.#bulletModel = constructFromType(
      {
        lifetime: 390,
        collides: false,
        components: [
          { type: "vfx-trail", effect: this.trail, spacing: "timed" },
          { type: "movement", speed: 18, decel: 0.05 },
          { type: "expiry-vfx", effect: "land-effect" },
        ],
      },
      BulletModel,
    );
  }
  tick() {
    super.tick();
    this.tickLaunch();
    this.timer.tick();
  }
  tickLaunch() {
    if (this.#receiveTime > 0) this.#receiveTime--;
    else {
      if (!this.validateBuy()) return;
      this.buy();
      this.#receiveTime = this.receiveCooldown;
    }
  }
  validateBuy() {
    if (this.#currentFilter === "nothing") return false;
    if (game.money < (Registries.items.get(this.#currentFilter)?.marketValue ?? 1)) return false;
    if (!this.inventory.canAddItem(this.#currentFilter)) return false;
    return true;
  }
  /**
   *
   * @param {Entity} ent
   * @param {ItemStack} stack
   * @returns
   */
  interaction(ent, stack = ItemStack.EMPTY) {
    if (stack.item !== "nothing") this.#currentFilter = stack.item;
    if (stack.getItem()) Log.send("Set requested item to " + stack.getItem()?.name);
    else return false;
    ui.waitingForMouseUp = true;
    return true;
  }
  highlight(emphasised) {
    super.highlight(emphasised);
    if (this.#currentFilter && this.#currentFilter !== "nothing") {
      let img = Registries.items.get(this.#currentFilter).image;
      drawImg(
        img ?? "error",
        this.uiX - 10 * ui.camera.zoom,
        this.uiY - 10 * ui.camera.zoom,
        10 * ui.camera.zoom,
        10 * ui.camera.zoom,
      );
    }
  }
  buy() {
    let item = Registries.items.get(this.#currentFilter);
    let value = item?.marketValue ?? 1;
    game.money -= value;
    Log.send(`#a-Bought 1x ${item?.name ?? "nothing"}#a- for \$${value}`);
    this.timer.do(() => {
      this.world.particles.push(
        new ImageParticle(
          this.x,
          this.y,
          0,
          60,
          0,
          0,
          this.podImage,
          1,
          0,
          blockSize,
          blockSize / 2,
          blockSize,
          blockSize / 2,
          0,
        ),
      );
      this.inventory.addItem(this.#currentFilter);
    }, 395);
    this.#bulletModel.emit(this.x, this.y - 3249, 1, 90, 0, 0, this.world, game.player);
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    let it = Registries.items.get(this.#currentFilter);
    MLF1.draw(
      x,
      y,
      `Buying ${it.name ?? "nothing"}${
        it.name === undefined ? "" : ` (\$${it.marketValue ?? 1} each)`
      }\n${this.validateBuy() ? "Ready to Receive!" : "Not ready"}\n${""
        .padEnd((this.#receiveTime / this.receiveCooldown) * 20, "■")
        .padEnd(20, "□")
        .substring(0, 20)}`,
      this.title,
      Item.getColourFromRarity(0, "light"),
    );
  }
  createExtendedDetails() {
    return `${super.createExtendedDetails()}\n#=-Buying:\n  #h-${roundNum(60 / this.receiveCooldown, 2)} items/s#-- buy frequency`;
  }
}
