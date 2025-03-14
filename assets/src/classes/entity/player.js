const respawnTimer = new Timer();

class Player extends EquippedEntity {
  respawnTime = 180;
  spawnpoint = { x: 0, y: 0 };
  setSpawn(x, y) {
    this.spawnpoint.x = x ?? this.x;
    this.spawnpoint.y = y ?? this.y;
    Log.send(
      "Spawnpoint set to " + this.spawnpoint.x + ", " + this.spawnpoint.y,
      [255, 255, 0]
    );
  }
  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
    Log.send(
      Registry.deathmsg.has(type)
        ? Registry.deathmsg
            .get(type)
            .replaceAll("(1)", this.name)
            .replaceAll("(2)", source?.name ?? "something")
        : this.name + " died",
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
      this.dead = false;
      this.x = this.spawnpoint.x;
      this.y = this.spawnpoint.y;
      this.addToWorld(world);
      blindingFlash(this.x, this.y, 255, 30, 400);
    }, this.respawnTime);
  }
}
