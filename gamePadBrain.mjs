import SignalEvent from './SignalEvent.mjs';

export default class extends EventTarget {
  #index
  #map
  #interval
  #boundProcess
  constructor(index, interval=1000, map){
    super();
    this.#index = index;
    this.#map = {
      'up':'up',
      'down':'down',
      'left':'left',
      'right':'right',
    };
    this.#boundProcess = this.process.bind(this);
    this.#interval = setInterval(() =>{
      const gamePadState = (navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []))[this.#index];
      this.#boundProcess(gamePadState);
    }, interval);
  }
  disable(){
    clearInterval(this.#interval);
  }
  process(pad){
    if(!pad){
      return
    }
    const {buttons} = pad;
    if(buttons[12].pressed) {
      this.dispatchEvent(new SignalEvent({which:'up'}, this.#map ))
    }
    if(buttons[13].pressed) {
      this.dispatchEvent(new SignalEvent({which:'down'}, this.#map ))
    }
    if(buttons[14].pressed) {
      this.dispatchEvent(new SignalEvent({which:'left'}, this.#map ))
    }
    if(buttons[15].pressed) {
      this.dispatchEvent(new SignalEvent({which:'right'}, this.#map ))
    }
  }
};
