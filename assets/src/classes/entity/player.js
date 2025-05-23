import { rnd } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { Log } from "../../play/messaging.js";
import { Timer } from "../timer.js";
import { EquippedEntity } from "./inventory-entity.js";
import { game } from "../../play/game.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { Inventory } from "../inventory.js";
import { ui, UIComponent } from "../../core/ui.js";
export const respawnTimer = new Timer();

class Player extends EquippedEntity {
  respawnTime = 180;
  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
    let messagearray = Registries.deathmsg.has(type)
      ? Registries.deathmsg.get(type)[source ? 1 : 0]
      : ["(1) died"];
    Log.send(
      (messagearray[Math.floor(rnd(0, messagearray.length))] ?? "(1) died")
        .replaceAll("(1)", this.name)
        .replaceAll("(2)", source?.name ?? "something"),
      [255, 0, 0]
    );
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      this.world,
      this.x,
      this.y,
      rnd(0, 360),
      3
    );
    Inventory.mouseItemStack.clear();
    respawnTimer.do(() => {
      ui.waitingForMouseUp = true;
      UIComponent.setCondition("dead:yes");
    }, this.respawnTime);
    // respawnTimer.do(() => {
    //   this.health = this.maxHealth;
    //   this.statuses = {};
    //   this.dead = false;
    //   this.x = this.spawnX;
    //   this.y = this.spawnY;
    //   this.addToWorld(world);
    //   flash(this.x, this.y, 255, 30, 400);
    // }, this.respawnTime);
  }
  ai() {
    if (this.target) {
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
  }
}
export { Player };
