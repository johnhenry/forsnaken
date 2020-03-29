export { arrows, wasd, antiArrows, antiWasd } from './keyboardConfigs.mjs';
import SignalEvent from './SignalEvent.mjs';
export default class extends EventTarget {
  #map
  #boundProcess
  constructor(map = {}){
    super();
    this.#map = map || {};
    this.#boundProcess = this.process.bind(this);
    window.document.addEventListener('keydown', this.#boundProcess);
  }
  disable(){
    window.document.removeEventListener('keydown', this.#boundProcess);
  }
  process(keyDownEvent){
    const event = new SignalEvent(keyDownEvent, this.#map);
    if(event.which){
      this.dispatchEvent(event);
    }
  }
};
