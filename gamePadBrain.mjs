import SignalEvent from './SignalEvent.mjs';
export default class extends EventTarget {
  #index
  #map
  #interval
  #boundProcess
  constructor(index, map, interval=50){
    super();
    this.#index = index;
    this.#map = map;
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
    for(const index in buttons){
      if(buttons[index].pressed){
        const which = this.#map[index];
        if(which){
          this.dispatchEvent(new SignalEvent(which))
        }
      }
    }
  }
};
