/**
 * A class for executing functions after a certain delay *synchronously*.
 * Can also execute repeatedly, or instantly.
 * [May be memory-intensive with many operations, unless `repeat()` is used.]
 */
class Timer {
  /** Collection of functions waiting to be executed, keyed by their ID.
   * @type {Map<symbol, TimerOperation>} */
  #operations = new Map();
  /** The number of times this timer has ticked */
  ticks = 0;
  /** The number of operations waiting for execution */
  get operationCount() {
    return this.#operations.size;
  }
  tick() {
    this.ticks++;
    for (const [id, operation] of this.#operations) {
      operation.tick(this, id);
    }
  }
  /**
   * Adds a function call to be executed after a specified delay.
   * @param {() => void} func Function to call, after the delay.
   * @param {int} delay The delay, in frames. Zero means the same frame (i.e. when the timer next ticks). `-1` means do it *now*.
   * @param {...*} parameters Additional parameters to pass in to the function on call.
   * @returns {int} The ID this operation is using. Used in `Timer.cancel()`.
   */
  do(func, delay = 0, ...parameters) {
    if (delay < 0) {
      func();
      return Symbol();
    }
    const i = Symbol();
    this.#operations.set(i, new TimerOperation(func, this.ticks + delay, parameters));
    //Return the id used
    return i;
  }
  /**
   * Repeats a function call every so many ticks, with a configurable initial delay.
   * Passes in the current iteration number (i.e. the first iteration will be passed `0`, the second `1`, etc.).
   * Every call shares the same ID, so can all be cancelled at once.
   * More memory-efficient than repeatedly calling `Timer.do()`.
   * @param {(iteration: number) => void} func Function to call.
   * @param {number} times The number of times to repeat this function call.
   * @param {number} interval The number of timer ticks between functions. `0` makes all functions execute in the same tick. Any values below `0` have no effect.
   * @param {number} delay How many ticks to wait before the first call.
   * @param {...*} parameters Additional parameters to pass in to the function on call.
   * @returns {number} The ID the operations are using. Used in `Timer.cancel()`.
   */
  repeat(func, times, interval = 1, delay = 0, ...parameters) {
    const i = Symbol();
    this.#operations.set(i, new RepeatedTimerOperation(func, this.ticks + delay, parameters, times, interval));
    //Return the id used and increment the ID
    return i;
  }
  /**
   * Cancels one or more operations. Can cancel all at once, based on ID, or based on function called. Can also remove duplicate operations. \
   * Using IDs is fastest (O(1)), ID array is O(number of ids), 
   * @param {symbol|symbol[]|"*"|(() => void)|Timer} id Identifier(s) of the operation(s) to cancel, `*` if all operations are to be cancelled, or a function of an operation to remove. Can also be another Timer, in which case any duplicate operations will be removed *from this timer*.
   */
  cancel(id) {
    //If one is to be removed
    if (typeof id === "symbol") {
      //Remove all operations with the specified id (should only be one)
      this.#operations.delete(id);
    } else if (typeof id === "object" && Array.isArray(id)) {
      //Remove all operations with any specified id
      id.forEach((i) => this.#operations.delete(i));
    } else if (id === "*") {
      //Remove all
      this.#operations.clear();
    } else if (id instanceof Timer) {
      //For each operation in the passed-in timer
      id.#operations.forEach((op, i) => {
        for (const [id, ops] of this.#operations) {
          if (ops.func === op.func && ops.willFireOn === op.willFireOn) this.#operations.delete(id);
        }
      });
    } else if (typeof id === "function") {
      //I think you now what this does by now
      for (const [i, o] of this.#operations) {
        if (o.func === i) this.#operations.delete(id);
      }
    }
  }
}
/** Represents a single delayed operation. */
class TimerOperation {
  constructor(func, willFireOn = 0, params = []) {
    this.func = func;
    this.willFireOn = willFireOn;
    this.params = params;
  }
  /** @param {Timer} timer  */
  tick(timer, id) {
    //If ready to go:
    if (this.willFireOn <= timer.ticks) {
      //execute
      this.func(...this.params);
      //Stop
      timer.cancel(id);
    }
  }
}
/** Represents a repeated operation. */
class RepeatedTimerOperation extends TimerOperation {
  #repeated = 0;
  constructor(func, firstFireOn = 0, params = [], repeatNumber = 1, repeatInterval = 1) {
    super(func, firstFireOn, params);
    this.func = func;
    this.willFireOn = firstFireOn;
    this.params = params;
    this.repeatNumber = repeatNumber;
    this.repeatInterval = repeatInterval;
  }
  /** @param {Timer} timer  */
  tick(timer, id) {
    if (this.willFireOn <= timer.ticks) {
      //increase repeats, execute
      this.func(this.#repeated++, ...this.params);
      //Stop if finished repeating
      if (this.#repeated >= this.repeatNumber) {
        timer.cancel(id);
        return;
      }
      // if not:
      this.willFireOn = timer.ticks + this.repeatInterval;
    }
  }
}

export { Timer };
export async function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}
