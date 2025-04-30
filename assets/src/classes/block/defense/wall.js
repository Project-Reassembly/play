//Does nothing special, just blocks shit
class Wall extends Block {
  explosiveness = 0;
  /** Damage reduction. Less effective vs. higher damage values. */
  armour = 0;
  /** Increase this to decrease the amount by which higher values reduce damage. By a **lot**. _This is sensitive_, use carefully.*/
  armourToughness = 5;
  damage(type, amount, source) {
    super.damage(
      type,
      amount * (1 -
        ((1 - this.armourToughness / (this.armour + this.armourToughness)) **
          0.3) **
          Math.ceil(amount ** (this.armourToughness / 10))),
      source
    );
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.health + " health",
      this.armour > 0 ? this.armour + " armour" : "",
      this.explosiveness > 0
        ? "🟥"+this.explosiveness * 100 + "% explosiveness⬜"
        : "",
      "🟨 -------------------- ⬜",
    ];
  }
}
