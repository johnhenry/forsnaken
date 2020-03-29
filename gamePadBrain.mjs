import SignalEvent from './SignalEvent.mjs';
export const xbox = {
  12:'up',
  13:'down',
  14:'left',
  15:'right'
};
export const antiXbox = {
  13:'up',
  12:'down',
  15:'left',
  14:'right'
};
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
        const event = new SignalEvent({which:index}, this.#map);
        if(event.which){
          this.dispatchEvent(event);
        }
      }
    }
  }
};