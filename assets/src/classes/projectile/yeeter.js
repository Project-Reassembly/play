import { construct } from "../../core/constructor.js";
import { rnd } from "../../core/number.js";
import Integrate from "../../lib/integrate.js";
import { World } from "../world/world.js";
import { Bullet } from "./bullet.js";


  /**
   * Fires bullets in a pattern!
   * @param {number} x X position the bullets start at.
   * @param {number} y Y position the bullets start at.
   * @param {number} direction Direction of the center of the bullet cone.
   * @param {Integrate.Unconstructed<Bullet> | Integrate.Unconstructed<Bullet>[]} definition Bullet definition(s) to fire.
   * @param {number} spread Random spread.
   * @param {number} spacing Even spread.
   * @param {number} amount Number of bullets to fire.
   * @param {World} world World to fire them into.
   * @param {Entity?} entity Entity to associate the bullets with.
   * @param {number} [speedMultMax=1] Minimum multiplier for the speed of each bullet. Individual bullets roll separately.
   * @param {number} [speedMultMin=1] Maximum multiplier for the speed of each bullet. Individual bullets roll separately.
   */
export function patternedBulletExpulsion(
  x,
  y,
  definition,
  amount,
  direction,
  spread,
  spacing,
  world,
  entity,
  speedMultMin = 1,
  speedMultMax = 1
) {
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  let maek = (bulletToSpawn) => {
    for (let index = 0; index < amount; index++) {
      /** @type {Bullet} */
      let bulletToFire = construct(bulletToSpawn, "bullet");
      //Put the bullet in position
      bulletToFire.x = x;
      bulletToFire.y = y;
      bulletToFire.direction = direction; //do the offset
      //Apply uniform spread
      bulletToFire.direction += currentAngle;
      currentAngle += spacing;
      //Apply random spread
      bulletToFire.direction += rnd.float(spread, -spread);
      //Add entity and world
      bulletToFire.entity = entity;
      bulletToFire.world = world;
      //Spawn it in
      bulletToFire.speed *= rnd.float(speedMultMin, speedMultMax);
      world.bullets.push(bulletToFire);
      bulletToFire.oncreated();
    }
  };
  if (definition instanceof Array) definition.forEach(maek);
  else maek(definition);
}  /**
   * Fires bullets in a pattern, and returns them all.
   * @param {number} x X position the bullets start at.
   * @param {number} y Y position the bullets start at.
   * @param {number} direction Direction of the center of the bullet cone.
   * @param {Integrate.Unconstructed<Bullet> | Integrate.Unconstructed<Bullet>[]} definition Bullet definition(s) to fire.
   * @param {number} spread Random spread.
   * @param {number} spacing Even spread.
   * @param {number} amount Number of bullets to fire.
   * @param {World} world World to fire them into.
   * @param {Entity?} entity Entity to associate the bullets with.
   * @param {number} [speedMultMax=1] Minimum multiplier for the speed of each bullet. Individual bullets roll separately.
   * @param {number} [speedMultMin=1] Maximum multiplier for the speed of each bullet. Individual bullets roll separately.
   */
export function getPatternedBulletExpulsion(
  x,
  y,
  definition,
  amount,
  direction,
  spread,
  spacing,
  world,
  entity,
  speedMultMin = 1,
  speedMultMax = 1
) {
  /** @type {Bullet[]} */
  let buls = [];
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  let maek = (bulletToSpawn) => {
    for (let index = 0; index < amount; index++) {
      /** @type {Bullet} */
      let bulletToFire = construct(bulletToSpawn, "bullet");
      //Put the bullet in position
      bulletToFire.x = x;
      bulletToFire.y = y;
      bulletToFire.direction = direction; //do the offset
      //Apply uniform spread
      bulletToFire.direction += currentAngle;
      currentAngle += spacing;
      //Apply random spread
      bulletToFire.direction += rnd.float(spread, -spread);
      //Add entity and world
      bulletToFire.entity = entity;
      bulletToFire.world = world;
      //Spawn it in
      bulletToFire.speed *= rnd.float(speedMultMin, speedMultMax);
      world.bullets.push(bulletToFire);
      buls.push(bulletToFire);
      bulletToFire.oncreated();
    }
  };
  if (definition instanceof Array) definition.forEach(maek);
  else maek(definition);
  return buls;
}