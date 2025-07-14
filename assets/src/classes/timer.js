/**
 * A class for executing functions after a certain delay *synchronously*.
 * Can also execute repeatedly, or instantly.
 * [May be memory-intensive with many operations, unless `repeat()` is used.]
 */
class Timer {
  /** Array of functions waiting to be executed.
   * @type {TimerOperation[]} */
  #operations = [];
  /** The next free ID number*/
  #nextId = 0;
  /** The number of times this timer has ticked */
  ticks = 0;
  /** The number of operations waiting for execution */
  get operationCount() {
    return this.#operations.length;
  }
  tick() {
    this.ticks++;
    this.#operations.forEach((operation) => {
      operation.tick();
    });
    let l = this.#operations.length;
    for (let i = 0; i < l; i++) {
      let operation = this.#operations[i];
      if (!operation || operation?.executed) {
        this.#operations.splice(i, 1);
        if (i > 0) {
          i--;
          l--;
        }
      }
    }
  }
  /**
   * Adds a function call to be executed after a specified delay.
   * @param {function} func Function to call, after the delay.
   * @param {int} delay The delay, in frames. Zero means the same frame (i.e. when the timer next ticks). `-1` means do it *now*.
   * @param {...*} parameters Additional parameters to pass in to the function on call.
   * @returns {int} The ID this operation is using. Used in `Timer.cancel()`. Returns `-1` if delay was `-1`, and the function was instantly executed.
   */
  do(func, delay = 0, ...parameters) {
    if (delay < 0) {
      func();
      return -1;
    }
    this.#operations.push(
      new TimerOperation(func, delay, this.#nextId, parameters)
    );
    //Increment the ID
    this.#nextId++;
    //Return the id used
    return this.#nextId - 1;
  }
  /**
   * Repeats a function call every so many ticks, with a configurable initial delay.
   * Passes in the current iteration number (i.e. the first iteration will be passed `0`, the second `1`, etc.).
   * Every call shares the same ID, so can all be cancelled at once.
   * More memory-efficient than repeatedly calling `Timer.do()`.
   * @param {(iteration: int) => void} func Function to call.
   * @param {int} times The number of times to repeat this function call.
   * @param {int} interval The number of timer ticks between functions. `0` makes all functions execute in the same tick. Any values below `0` have no effect.
   * @param {int} delay How many ticks to wait before the first call.
   * @param {...*} parameters Additional parameters to pass in to the function on call.
   * @returns {int} The ID the operations are using. Used in `Timer.cancel()`.
   */
  repeat(func, times, interval = 1, delay = 0, ...parameters) {
    this.#operations.push(
      new RepeatedTimerOperation(
        func,
        delay,
        this.#nextId,
        parameters,
        times,
        interval
      )
    );
    //Increment the ID
    this.#nextId++;
    //Return the id used
    return this.#nextId - 1;
  }
  /**
   * Cancels one or more operations. Can cancel all at once, based on ID, or based on function called. Can also remove duplicate operations.
   * @param {int|int[]|"*"|Function|Timer} id Identifier(s) of the operation(s) to cancel, `*` if all operations are to be cancelled, or a function to compare operations with. Can also be another Timer, in which case any duplicate operations will be removed *from this timer*.
   */
  cancel(id) {
    //If one is to be removed
    if (typeof id === "number") {
      //Remove all operations with the specified id (should only be one)
      this.#operations = this.#operations.filter((x) => x.id !== id);
    } else if (typeof id === "object" && Array.isArray(id)) {
      //Remove all operations with any specified id
      this.#operations = this.#operations.filter((x) => !id.includes(x.id));
    } else if (id === "*") {
      //Remove all
      this.#operations = [];
    } else if (id instanceof Timer) {
      //FOr each operation in the passed-in timer
      id.#operations.forEach((y) => {
        //Remove any in this one
        this.#operations = this.#operations.filter(
          //That match in function and delay
          (x) => !(x.func === y.func && x.delay === y.delay)
        );
      });
    } else if (typeof id === "function") {
      //I think you now what this does by now
      this.#operations = this.#operations.filter((x) => x.func !== id);
    }
  }
}
/** Represents a single delayed operation. */
class TimerOperation {
  executed = false;
  constructor(func, delay = 0, id = 0, params = []) {
    this.id = id;
    this.func = func;
    this.delay = delay;
    this.params = params;
  }
  tick() {
    //Don't run if already executed
    if (this.executed) return;
    //Reduce delay
    this.delay--;
    //If ready to go:
    if (this.delay < 0) {
      //execute
      this.func(...this.params);
      //Stop
      this.executed = true;
    }
  }
}
/** Represents a repeated operation. */
class RepeatedTimerOperation extends TimerOperation {
  #repeated = 0;
  #currentIntervalWait = 0;
  constructor(
    func,
    delay = 0,
    id = 0,
    params = [],
    repeatNumber = 1,
    repeatInterval = 1
  ) {
    super(func, delay, id, params);
    this.id = id;
    this.func = func;
    this.delay = delay;
    this.params = params;
    this.repeatNumber = repeatNumber;
    this.repeatInterval = repeatInterval;
  }
  tick() {
    //Don't run if already finished
    if (this.executed) return;
    //Reduce delay
    this.delay--;
    //If ready to go:
    if (this.delay < 0) {
      this.#currentIntervalWait--;
      if (this.#currentIntervalWait <= 0) {
        //increase repeats
        this.#repeated++;
        //Stop if finished repeating
        if (this.#repeated > this.repeatNumber) {
          this.executed = true;
          return;
        }
        //execute
        this.func(this.#repeated - 1, ...this.params);
        //reset interval
        this.#currentIntervalWait = this.repeatInterval;
      }
    }
  }
}

export { Timer };
