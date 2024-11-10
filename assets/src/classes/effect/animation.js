class PartAnimation {
  #targetXOffset = 0;
  #targetYOffset = 0;
  #targetRotOffset = 0;
  #targetSlideOffset = 0;
  #elapsed = 0;
  #delayLeft = 0;
  _started = false;
  _speed = 1;
  _progress = 0;

  //Set target pos
  set xOffset(_) {
    this.#targetXOffset = _;
  }
  set yOffset(_) {
    this.#targetYOffset = _;
  }
  set rotOffset(_) {
    this.#targetRotOffset = _;
  }
  set slideOffset(_) {
    this.#targetSlideOffset = _;
  }
  //Get current pos
  get xOffset() {
    return this.#targetXOffset * this._progress;
  }
  get yOffset() {
    return this.#targetYOffset * this._progress;
  }
  get rotOffset() {
    return this.#targetRotOffset * this._progress;
  }
  get slideOffset() {
    return this.#targetSlideOffset * this._progress;
  }

  //Public stuff
  duration = 0;
  delay = 0;

  //Method time
  reset() {
    this._progress = 0;
    this.#delayLeft = this.delay;
    this.#elapsed = 0;
  }
  setTarget(x, y, rot, slide) {
    this.xOffset = x;
    this.yOffset = y;
    this.rotOffset = rot;
    this.slideOffset = slide;
  }
  tick(dt) {
    //Do nothing if not started
    if (!this._started) return;
    //Wait for delay
    if (this.#delayLeft > 0) {
      this.#delayLeft -= dt * Math.abs(this._speed); //Negative speed doesn't softlock
      return;
    }
    //Time passes
    this.#elapsed += dt * this._speed;
    //Set progress
    this._progress = this.#elapsed / this.duration;
    if (this.hasEnded()) this.onEnd(); //End method
  }
  hasEnded() {
    return this._progress >= 1;
  }
  onEnd() {
    this._progress = 1;
  }
  start() {
    this._started = true;
  }
  pause() {
    this._started = false;
  }
  stop() {
    this._started = false;
    this.reset();
  }
}

class LoopingAnimation extends PartAnimation {
  onEnd() {
    this.reset();
  }
}

class InfiniteAnimation extends PartAnimation {
  hasEnded() {
    return false;
  }
}

class BounceAnimation extends PartAnimation {
  _mode = "forward";
  hasEnded() {
    if (this._mode === "reverse") return this._progress <= 0;
    if (this._mode === "forward") return this._progress >= 1;
  }
  onEnd() {
    this._speed *= -1;
    if (this._mode === "reverse") this._mode = "forward";
    else if (this._mode === "forward") this._mode = "reverse";
  }
}

class RecoilAnimation extends BounceAnimation {
  speedRatio = 0.5;
  onEnd() {
    this._speed *= -1;
    if (this._mode === "reverse") {
      this._mode = "forward";
      this._speed /= this.speedRatio;
      this.stop();
    } else if (this._mode === "forward") {
      this._mode = "reverse";
      this._speed *= this.speedRatio;
    }
  }
}
