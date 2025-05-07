import { Vector } from "../../../core/number.js";
import { ui } from "../../../core/ui.js";
import { Direction } from "../../../scaling.js";
import { ModularTankEntity } from "../../entity/modular-tank.js";
import { Block, drawHighlight } from "../block.js";
import { Container } from "../container.js";

class TankAssemblyBay extends Container {
  range = 5;
  interaction(ent, istack) {
    if (keyIsDown(SHIFT)) {
      this.activated();
      ui.waitingForMouseUp = true;
      return true;
    }
  }
  activated() {
    super.activated();
    let centre = Direction.vectorOf(this.direction)
      .scale(this.range + 2)
      .addXY(this.gridX, this.gridY);
    let tonk = ModularTankEntity.create(this.world, centre.x, centre.y, this.range);
    tonk.team = this.team;
    tonk.emit("explosion~30");
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
}

export { TankAssemblyBay };
