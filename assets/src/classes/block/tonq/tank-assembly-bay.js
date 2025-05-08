import { rnd, roundNum, Vector } from "../../../core/number.js";
import { ui } from "../../../core/ui.js";
import { Direction } from "../../../scaling.js";
import { ModularTankEntity } from "../../entity/modular-tank.js";
import { Timer } from "../../timer.js";
import { Block, drawHighlight } from "../block.js";
import { Container } from "../container.js";

class TankAssemblyBay extends Container {
  #assemblyTimer = new Timer();
  range = 5;
  rotatable = true;
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
      () => this.emit("tonk-build-wave", 0.5 * Block.size, 0.5 * Block.size),
      assTime * 5,
      5
    );
    this.#assemblyTimer.repeat(
      () =>
        this.emit(
          "tonk-build-square",
          (offset.x + 0.5) * Block.size,
          (offset.y + 0.5) * Block.size
        ),
      Math.max(0, assTime * 5),
      5,
      60
    );
    this.#assemblyTimer.repeat(
      () =>
        this.emit(
          "tonk-weld",
          (offset.x + 0.5 + rnd(-this.range, this.range)) * Block.size,
          (offset.y + 0.5 + rnd(-this.range, this.range)) * Block.size
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
    let scl = (this.range * 2 + 1) * Block.size * ui.camera.zoom;
    let centre = Direction.vectorOf(this.direction)
      .scale(scl)
      .addXY(this.uiX, this.uiY)
      .add(new Vector(Block.size, Block.size).scale(0.5));
    super.highlight(emp);
    drawHighlight(emp, () => {
      rect(centre.x, centre.y, scl, scl);
    });
  }
  tick() {
    super.tick();
    this.#assemblyTimer.tick();
  }
}

export { TankAssemblyBay };
