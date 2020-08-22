export default class extends EventTarget {
  // #index
  // #map
  // #interval
  // #boundProcess
  constructor(index, map, interval=50){
    super();
    this._private_index = index;
    this._private_map = map;
    this._private_boundProcess = this.process.bind(this);
    this._private_interval = setInterval(() =>{
      const gamePadState = (navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []))[this._private_index];
      this._private_boundProcess(gamePadState);
    }, interval);
  }
  disable(){
    clearInterval(this._private_interval);
  }
  process(pad){
    if(!pad){
      return
    }
    const {buttons} = pad;
    for(const index in buttons){
      if(buttons[index].pressed){
        const which = this._private_map[index];
        if(which){
          this.dispatchEvent(new CustomEvent('thought', {detail:{which}}))
        }
      }
    }
  }
};
