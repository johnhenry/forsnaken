export default class {
  // #over
  // #paused
  // #brains 
  // #boundUpdateState
  constructor({brains=[]}){
    this._private_paused = false;
    this._private_over = false;
    this._private_brains = brains;
    this._private_boundUpdateState = this.updateState.bind(this);
    // listen to keyboard events to move the snake
    for(const brain of this._private_brains) {
      brain.addEventListener('thought', this._private_boundUpdateState);
    }
  }
  disable(){
    for(const brain of this._private_brains) {
      brain.removeEventListener('thought', this._private_boundUpdateState);
    }
  }
  updateState({ detail: { which } }){
    switch(which){
      case 'pause':
        this._private_paused = !this._private_paused;
        break;
      case 'end':
        this._private_over = true;
        break;
    }
  }
  get over(){
    return this._private_over;
  }
  get paused(){
    return this._private_paused;
  }
}