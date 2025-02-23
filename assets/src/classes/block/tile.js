class Tile extends Block {
  speedMultiplier = 1;
  appliedStatus = "none";
  appliedStatusDuration = 0;
  damage = 0;
  damageType = "normal";
  /**
   * Called whenever an entity walks on this tile.
   * @param {Entity} entity Entity that walked on this block.
   */
  entityWalksOn(entity) {
    entity.applyStatus(
      Registry.statuses.get(this.appliedStatus),
      this.appliedStatusDuration
    );
    entity.damage(this.damageType, this.damage);
  }
}
