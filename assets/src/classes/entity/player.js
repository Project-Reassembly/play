import { rnd } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { flash } from "../../play/effects.js";
import { Log } from "../../play/messaging.js";
import { Timer } from "../timer.js";
import { EquippedEntity } from "./inventory-entity.js";
import { world } from "../../play/game.js";
const respawnTimer = new Timer();

class Player extends EquippedEntity {
  respawnTime = 180;
  setSpawn(x, y) {
    this.spawnX = x ?? this.x;
    this.spawnY = y ?? this.y;
    Log.send(
      "Spawnpoint set to " + this.spawnX + ", " + this.spawnY,
      [255, 255, 0]
    );
  }
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
    let ticks = this.respawnTime / 60;
    respawnTimer.repeat(
      (iter) => Log.send("Respawning in: " + (ticks - iter)),
      ticks,
      60
    );
    respawnTimer.do(() => {
      this.health = this.maxHealth;
      this.statuses = {};
      this.dead = false;
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.addToWorld(world);
      flash(this.x, this.y, 255, 30, 400);
    }, this.respawnTime);
  }
  ai() {
    if (this.target) {
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
    }
  }
}
export { Player, respawnTimer };
