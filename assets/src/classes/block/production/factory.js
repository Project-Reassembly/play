import { Container } from "../container.js";

/** Tiered container block.  */
export class Factory extends Container {
  tier = 1;
  value(){
    return super.value() + this.tier;
  }
}