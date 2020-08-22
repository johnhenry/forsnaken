export default class {
  #over
  #paused
  #brains 
  #boundUpdateState
  constructor({brains=[]}){
    this.#paused = false;
    this.#over = false;
    this.#brains = brains;
    this.#boundUpdateState = this.updateState.bind(this);
    // listen to keyboard events to move the snake
    for(const brain of this.#brains) {
      brain.addEventListener('thought', this.#boundUpdateState);
    }
  }
  disable(){
    for(const brain of this.#brains) {
      brain.removeEventListener('thought', this.#boundUpdateState);
    }
  }
  updateState({ detail: { which } }){
    switch(which){
      case 'pause':
        this.#paused = !this.#paused;
        break;
      case 'end':
        this.#over = true;
        break;
    }
  }
  get over(){
    return this.#over;
  }
  get paused(){
    return this.#paused;
  }
}