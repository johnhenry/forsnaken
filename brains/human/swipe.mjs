// https://css-tricks.com/simple-swipe-with-vanilla-javascript/
const unify =  event => event.changedTouches ? event.changedTouches[0] : event;
export default class extends EventTarget {
  #x = null
  #y = null
  #threshold
  #map
  #boundLock
  #boundMove
  #events
  constructor(threshold=1, map = ['up', 'down', 'left', 'right'], touch = false) {
    super();
    this.#map = map;
    this.#threshold = threshold;
    this.#boundLock = this.lock.bind(this);
    this.#boundMove = this.move.bind(this);
    this.#events = touch ? {
      start:'touchstart',
      end:'touchend'
    } : {
      start:'mousedown',
      end:'mouseup'
    }
    window.addEventListener(this.#events.start, this.#boundLock, false);
    window.addEventListener(this.#events.end, this.#boundMove, false);
  }
  disable(){
    window.removeEventListener(this.#events.start, this.#boundLock, false);
    window.removeEventListener(this.#events.end, this.#boundMove, false);
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
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this.#map[0]}}));
      } else {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this.#map[1]}}));
      }
    }
    if(Math.abs(dx) >= this.#threshold){
      if (dx < 0) {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this.#map[2]}}));
      } else {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this.#map[3]}}));
      }
    }
    this.#x = null;
    this.#y = null;
  }
};

