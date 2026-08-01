import { roundNum } from "../../../core/number.js";
import { Factory } from "../production/factory.js";

export class PowerGenerator extends Factory {
  powerGeneration = 16.666667;
  maxPower = 100000;
  isProvider = true;

  generate() {
    if (this.power <= this.maxPower - this.powerGeneration) {
      this.power += this.powerGeneration;
      return true;
    }
    return false;
  }
  createExtendedDetails() {
    return `#=-Power Generation:\n  #e-${roundNum(this.powerGeneration * 60, 1)}#-- energy/s #=-(#h-${roundNum(this.maxPower / (this.powerGeneration * 60), 1)}s#-- to fill#=-)`;
  }
}
