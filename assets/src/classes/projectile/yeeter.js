import { construct } from "../../core/constructor.js";
import { rnd } from "../../core/number.js";

export function patternedBulletExpulsion(
  x,
  y,
  bulletToSpawn,
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
      let bulletToFire = construct(bulletToSpawn, "bullet");
      //Put the bullet in position
      bulletToFire.x = x;
      bulletToFire.y = y;
      bulletToFire.direction = direction; //do the offset
      //Apply uniform spread
      bulletToFire.direction += currentAngle;
      currentAngle += spacing;
      //Apply random spread
      bulletToFire.direction += rnd(spread, -spread);
      //Add entity and world
      bulletToFire.entity = entity;
      bulletToFire.world = world;
      //Spawn it in
      bulletToFire.speed *= rnd(speedMultMin, speedMultMax);
      world.bullets.push(bulletToFire);
      bulletToFire.oncreated();
    }
  };
  if (bulletToSpawn instanceof Array) bulletToSpawn.forEach(maek);
  else maek(bulletToSpawn);
}