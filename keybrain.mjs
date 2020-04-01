export * from './keyboardConfigs.mjs';
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
    const which = this.#map[keyDownEvent.which];
    if(which){
      this.dispatchEvent(new SignalEvent(which));
    }
  }
};
