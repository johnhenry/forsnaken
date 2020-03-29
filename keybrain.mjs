export { arrows, wasd, antiArrows, antiWasd } from './keyboardConfigs.mjs';

const SignalEvent = class extends Event{
  constructor(keyDownEvent, map){
    super('signal');
    this.which = map[keyDownEvent.which];
  }
}
const KeyBrain = class extends EventTarget {
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

export default KeyBrain;