const blockSize = 30;
const chunkSize = 16;
const worldSize = 16;
const Direction = {
  /**@readonly */
  UP: -Math.PI / 2,
  /**@readonly */
  DOWN: Math.PI / 2,
  /**@readonly */
  LEFT: Math.PI,
  /**@readonly */
  RIGHT: 0,
  rotateClockwise(dir) {
    if (dir === Direction.UP) return Direction.RIGHT;
    if (dir === Direction.RIGHT) return Direction.DOWN;
    if (dir === Direction.DOWN) return Direction.LEFT;
    return Direction.UP;
  },
  rotateAntiClockwise(dir) {
    if (dir === Direction.UP) return Direction.LEFT;
    if (dir === Direction.LEFT) return Direction.DOWN;
    if (dir === Direction.DOWN) return Direction.RIGHT;
    return Direction.UP;
  },
  oppositeOf(dir) {
    if (dir === Direction.UP) return Direction.DOWN;
    if (dir === Direction.LEFT) return Direction.RIGHT;
    if (dir === Direction.RIGHT) return Direction.LEFT;
    return Direction.UP;
  },
  vectorOf(direction) {
    return { x: Math.cos(direction), y: Math.sin(direction) };
  },
  /**@param {0|1|2|3} */
  fromEnum(en) {
    switch (en) {
      case 0:
        return Direction.UP;
      case 1:
        return Direction.DOWN;
      case 2:
        return Direction.LEFT;
      case 3:
        return Direction.RIGHT;
      default:
        return Direction.UP;
    }
  },
  toEnum(en) {
    switch (en) {
      case Direction.UP:
        return 0;
      case Direction.DOWN:
        return 1;
      case Direction.LEFT:
        return 2;
      case Direction.RIGHT:
        return 3;
      default:
        return 0;
    }
  },
};
export { blockSize, chunkSize, worldSize, Direction };
