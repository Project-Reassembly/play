import { col } from "../../core/color.js";
import { Bullet } from "./bullet.js";
/**@deprecated Use regular bullets instead. */
class Missile extends Bullet {
  trailColours = [col.from(255,255,100), col.red];
  flameLength = 200;
  init(){
    super.init();
    console.warn("'Missile' type is deprecated, use 'Bullet' with the same properties.")
  }
}
export { Missile };

