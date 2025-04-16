/**Represents a set of virtual power connections between blocks. */
class PowerNetwork {
  static debug = false;
  /** All block positions which provide power to or require power from this network.
   * @type {Vector[]} 
   */
  positions = [];
  /**@type {World} */
  world = null;
  /** Adds a position to the network. */
  add(x, y) {
    this.positions.push(new Vector(x, y));
  }
  /** Removes all positions that match the x and y coordinates. */
  remove(x, y) {
    this.positions = this.positions.filter((b) => b.x !== x && b.y !== y);
  }
  /** Checks whether this network has a node at a position. */
  has(x, y) {
    for (let p of this.positions) {
      if (p.x === x && p.y === y) return true;
    }
    return false;
  }
  tick() {
    if (PowerNetwork.debug) console.log("-- Power Network Tick Debug --");
    let available = 0,
      demand = 0,
      sent = 0;
    //Calculate how much power is available, and how much is needed
    //Also clean the array
    for (let i = 0; i < this.positions.length; i++) {
      let p = this.positions[i];
      let blk = this.world.getBlock(p.x, p.y);
      if (blk) {
        if (blk.isProvider) available += blk.power;
        demand += blk.powerDraw;
      } else this.providers.splice(i, 1);
    }
    if (PowerNetwork.debug)
      console.log(available + " power available, " + demand + " power wanted");
    let blocks = this.positions.map((pos) => this.world.getBlock(pos.x, pos.y));
    if (PowerNetwork.debug) console.log("Contributing blocks: ", blocks);
    //Distribute power
    for (let block of blocks) {
      if (!block.isProvider) {
        //Add power to subscribers
        let toSend = (block.powerDraw / demand) * available;
        if (PowerNetwork.debug)
          console.log(
            "Sending " +
              toSend +
              " power to " +
              block.gridX +
              ", " +
              block.gridY +
              " (wants " +
              block.powerDraw +
              ")"
          );
        sent += toSend;
        sent -= block.sendPower(toSend);
        if (PowerNetwork.debug) console.log(sent + " total power sent");
      }
    }
    //Now that the amount actually sent is known, take power from providers
    for (let block of blocks) {
      if (block.isProvider) {
        if (PowerNetwork.debug)
          console.log(
            "Taking " + sent + " power from " + block.gridX + ", " + block.gridY
          );
        sent = block.drawPower(sent);
        if (PowerNetwork.debug) console.log(sent + " power left to send");
      }
    }
    if (PowerNetwork.debug) {
      if (sent > 0) console.warn("Energy being destroyed!\nAmount: " + sent);

      if (sent < 0) console.warn("Energy being created!\nAmount: " + -sent);
    }
  }
  serialise() {
    return {
      positions: this.positions.map((blk) => ({ x: blk.x, y: blk.y })),
    };
  }
  static deserialise(created) {
    let net = new this();
    net.positions = created.positions.map((x) => new Vector(x.x, x.y));
    return net;
  }
}
