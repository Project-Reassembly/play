import { rnd, roundNum, Vector } from "../../../core/number.js";
import { ui } from "../../../core/ui.js";
import { blockSize, Direction } from "../../../scaling.js";
import { ModularTankEntity } from "../../entity/modular-tank.js";
import { drawMultilineText } from "../../inventory.js";
import { Item } from "../../item/item.js";
import { Timer } from "../../timer.js";
import { Block, drawHighlight } from "../block.js";
import { Container } from "../container.js";
import { Conveyor } from "../conveyor.js";
import { SignBlock } from "../decoration.js";

class TankAssemblyBay extends Block {
  #assemblyTimer = new Timer();
  #naem = "Tank";
  #health = 0;
  #speed = 0;
  #inv = 1;
  range = 5;
  rotatable = true;
  selectable = true;
  interaction(ent, istack) {
    if (keyIsDown(SHIFT)) {
      this.activated();
      ui.waitingForMouseUp = true;
      return true;
    }
  }
  activated() {
    super.activated();
    if (this.#assemblyTimer.operationCount > 0) return;
    let offset = Direction.vectorOf(this.direction).scale(this.range + 2);
    let centre = offset.addXY(this.gridX, this.gridY);
    let assTime = roundNum(rnd(6, 20));
    this.#assemblyTimer.repeat(
      () => this.emit("tonk-build-wave", 0.5 * blockSize, 0.5 * blockSize),
      assTime * 5,
      5
    );
    this.#assemblyTimer.repeat(
      () =>
        this.emit(
          "tonk-build-square",
          (offset.x + 0.5) * blockSize,
          (offset.y + 0.5) * blockSize
        ),
      Math.max(0, assTime * 5),
      5,
      60
    );
    this.#assemblyTimer.repeat(
      () =>
        this.emit(
          "tonk-weld",
          (offset.x + 0.5 + rnd(-this.range, this.range)) * blockSize,
          (offset.y + 0.5 + rnd(-this.range, this.range)) * blockSize
        ),
      assTime,
      25
    );
    this.#assemblyTimer.do(() => {
      let tonk = ModularTankEntity.create(
        this.world,
        centre.x,
        centre.y,
        this.range
      );
      tonk.team = this.team;
      tonk.emit("tonk-build");
    }, (assTime - 1) * 25 + 85);
  }
  highlight(emp) {
    let scl = (this.range * 2 + 1) * blockSize * ui.camera.zoom;
    let centre = Direction.vectorOf(this.direction)
      .scale(scl)
      .addXY(this.uiX, this.uiY)
      .add(new Vector(blockSize, blockSize).scale(ui.camera.zoom).scale(0.5));
    super.highlight(emp);
    drawHighlight(emp, () => {
      rect(centre.x, centre.y, scl, scl);
    });
    drawMultilineText(
      centre.x + scl / 2 + blockSize / 2,
      centre.y - 15,
      "Front",
      ""
    );
    drawMultilineText(
      centre.x - scl / 2 - blockSize * 3,
      centre.y - 15,
      "Back",
      ""
    );
  }
  tick() {
    super.tick();
    this.#assemblyTimer.tick();
    let offset = Direction.vectorOf(this.direction).scale(this.range + 2);
    let centre2 = offset.addXY(this.gridX, this.gridY);
    this.#naem = "Tank";
    this.#speed = 10;
    this.#health = 100;
    this.#inv = 1;
    let count = 0;
    this.world
      .blocksInSquare(centre2.x, centre2.y, this.range, "blocks")
      .forEach((x) => {
        if (!x) return;
        if (x instanceof SignBlock) this.#naem = x.getMsg();
        if (x instanceof Conveyor) this.#speed += 20 / x.moveTime;
        if (x instanceof Container) this.#inv += x.inventorySize;
        this.#health += x.health;
        count++;
      });
    this.#speed /= count;
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    drawMultilineText(
      x,
      y,
      "Name: " +
        this.#naem +
        "\nHealth: " +
        this.#health +
        "\nSpeed: " +
        roundNum(this.#speed, 2) +
        "\nInventory: " +
        this.#inv +
        " slots",
      this.name,
      Item.getColourFromRarity(0, "light")
    );
  }
}

export { TankAssemblyBay };
