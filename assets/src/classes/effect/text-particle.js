import { fonts } from "../../play/game.js";
import { Particle } from "./particle.js";
// A particle which displays text.
class TextParticle extends Particle {
  constructor(
    x,
    y,
    direction,
    lifetime,
    speed,
    decel,
    text,
    colours,
    sizeFrom,
    sizeTo,
    rotateSpeed,
    useOCR = false
  ) {
    super(
      x,
      y,
      direction,
      lifetime,
      speed,
      decel,
      colours,
      rotateSpeed
    );
    this.text = text;
    this.useOCR = useOCR;
    this.size = sizeFrom;
    this.sizeFrom = sizeFrom;
    this.sizeTo = sizeTo;
  
  }
  calcSizes(lf){
    this.size = this.sizeFrom * lf + this.sizeTo * (1 - lf);
  }
  actualDraw(){
    textAlign(CENTER, CENTER);
    //turn particle
    translate(this.x, this.y);
    //rotate(this.direction + this._rotOffset);
    //Set size
    textSize(this.size);
    //Set font
    textFont(this.useOCR ? fonts.ocr : fonts.darktech);
    //Draw the particle's text
    text(this.text, 0, 0);
  }
}
export { TextParticle };
