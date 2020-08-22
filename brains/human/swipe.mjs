// https://css-tricks.com/simple-swipe-with-vanilla-javascript/
const unify =  event => event.changedTouches ? event.changedTouches[0] : event;
export default class extends EventTarget {
  // #x = null
  // #y = null
  // #threshold
  // #map
  // #boundLock
  // #boundMove
  // #events
  constructor(threshold=1, map = ['up', 'down', 'left', 'right'], touch = false) {
    super();
    this._private_x = null;
    this._private_y = null;
    this._private_map = map;
    this._private_threshold = threshold;
    this._private_boundLock = this.lock.bind(this);
    this._private_boundMove = this.move.bind(this);
    this._private_events = touch ? {
      start:'touchstart',
      end:'touchend'
    } : {
      start:'mousedown',
      end:'mouseup'
    }
    window.addEventListener(this._private_events.start, this._private_boundLock, false);
    window.addEventListener(this._private_events.end, this._private_boundMove, false);
  }
  disable(){
    window.removeEventListener(this._private_events.start, this._private_boundLock, false);
    window.removeEventListener(this._private_events.end, this._private_boundMove, false);
  }
  lock(event) {
    this._private_x = unify(event).clientX;
    this._private_y = unify(event).clientY;
  }
  move(event) {
    let dx = 0;
    let dy = 0;
    if(this._private_x !== null) {
      dx = unify(event).clientX - this._private_x
    }
    if(this._private_y !== null) {
      dy = unify(event).clientY - this._private_y;
    }
    if(Math.abs(dy) >= this._private_threshold){
      if (dy < 0) {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this._private_map[0]}}));
      } else {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this._private_map[1]}}));
      }
    }
    if(Math.abs(dx) >= this._private_threshold){
      if (dx < 0) {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this._private_map[2]}}));
      } else {
        this.dispatchEvent(new CustomEvent('thought', {detail:{which:this._private_map[3]}}));
      }
    }
    this._private_x = null;
    this._private_y = null;
  }
};

