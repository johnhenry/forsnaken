// https://css-tricks.com/simple-swipe-with-vanilla-javascript/
import SignalEvent from '../SignalEvent.mjs';
const unify =  event => event.changedTouches ? event.changedTouches[0] : event;
export default class extends EventTarget {
  #x = null
  #y = null
  #threshold
  #map
  #boundLock
  #boundMove
  constructor(threshold=1, map = ['up', 'down', 'left', 'right']) {
    super();
    this.#map = map;
    this.#threshold = threshold;
    this.#boundLock = this.lock.bind(this);
    this.#boundMove = this.move.bind(this);
    window.addEventListener('touchstart', this.#boundLock, false);
    window.addEventListener('touchend', this.#boundMove, false);
  }
  disable(){
    window.removeEventListener('touchstart', this.#boundLock, false);
    window.removeEventListener('touchend', this.#boundMove, false);
  }
  lock(event) {
    this.#x = unify(event).clientX;
    this.#y = unify(event).clientY;
  }
  move(event) {
    let dx = 0;
    let dy = 0;
    if(this.#x !== null) {
      dx = unify(event).clientX - this.#x
    }
    if(this.#y !== null) {
      dy = unify(event).clientY - this.#y;
    }
    if(Math.abs(dy) >= this.#threshold){
      if (dy < 0) {
        this.dispatchEvent(new SignalEvent(this.#map[0]));
      } else {
        this.dispatchEvent(new SignalEvent(this.#map[1]));
      }
    }
    if(Math.abs(dx) >= this.#threshold){
      if (dx < 0) {
        this.dispatchEvent(new SignalEvent(this.#map[2]));
      } else {
        this.dispatchEvent(new SignalEvent(this.#map[3]));
      }
    }
    this.#x = null;
    this.#y = null;
  }
};

