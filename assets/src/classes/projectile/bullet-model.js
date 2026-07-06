import { rnd, roundNum } from "../../core/number.js";
import { Model } from "../component-model/model.js";
import {
  BulletComponent,
  DisableDefaultVFXComponent,
  ExpiryVFXComponent,
  ExplosionComponent,
  ExtraUpdatesComponent,
  MovementComponent,
} from "./bullet-components.js";
import { BulletInstance } from "./bullet.js";

/** @extends {Model<BulletComponent, BulletInstance>} */
export class BulletModel extends Model {
  // Core properties
  lifetime = 60;
  collides = true;
  hitSize = 5; // default override
  remove = false;
  light = 0;
  constructor() {
    super(BulletComponent, BulletInstance);
  }
  init() {
    super.init();

    if (!this.hasOneOf(DisableDefaultVFXComponent, ExpiryVFXComponent, ExplosionComponent))
      this.add(ExpiryVFXComponent, { effect: "explosion~5" });

    this.removeAll(DisableDefaultVFXComponent);
  }
  /**
   * Makes an instance of this model.
   * @param {number} x
   * @param {number} y
   * @param {number} amount
   * @param {number} direction
   * @param {number} spread
   * @param {number} spacing
   * @param {import("../world/world.js").World} world
   * @param {import("../entity/entity.js").Entity} entity
   */
  emit(
    x,
    y,
    amount,
    direction,
    spread,
    spacing,
    world,
    entity,
    speedMultMin = 1,
    speedMultMax = 1,
  ) {
    //Max difference in direction
    const diff = (spacing * (amount - 1)) / 2;
    //Current angle
    let currentAngle = -diff;

    /** @type {BulletInstance[]} */
    const result = new Array(amount);

    for (let index = 0; index < amount; index++) {
      const bullet = this.instantiate();

      bullet.lifetime = this.lifetime;
      bullet.width = this.hitSize;
      bullet.height = this.hitSize;
      //Put the bullet in position
      bullet.x = x;
      bullet.y = y;
      bullet.direction = direction; //do the offset

      //Apply uniform spread
      bullet.direction += currentAngle;
      currentAngle += spacing;
      //Apply random spread
      bullet.direction += rnd.float(spread, -spread);
      //Add entity and world
      bullet.entity = entity;
      bullet.world = world;
      // initialise
      bullet.oncreated();
      // affect speed
      if ((speedMultMin !== 1 || speedMultMax !== 1) && this.has(MovementComponent))
        bullet.data.set("speed", bullet.data.get("speed") * rnd.float(speedMultMin, speedMultMax));
      //Spawn it in
      world.bullets.push(bullet);
      result[index] = bullet;
    }
    return result;
  }

  createInfo() {
    let div = this.has(ExtraUpdatesComponent) ? this.get(ExtraUpdatesComponent).amount + 1 : 1;
    let s =
      div >= this.lifetime ?
        this.has(MovementComponent) ?
          ""
        : "#l-Instant\n"
      : `#l-${roundNum(this.lifetime / (60 * div), 2)}s#-- lifetime\n`;
    for (const comp of this.all()) {
      const i = comp.getInfo(this);
      if (i) s += i + "\n";
    }
    return s.trim();
  }
}
