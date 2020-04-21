const Menu = class{
  #index
  #options
  #boundUpdateState
  constructor({index=0, options=[], brains}){
    this.#index = index;
    this.#options = options;
    this.#brains = brains;
    this.#boundUpdateState = this.updateState.bind(this);
    // listen to keyboard events to move the snake
    for(const brain of this.#brains) {
      brain.addEventListener('signal', this.#boundUpdateState);
    }
  }
  disable(){
    this.#enabled = false;
    for(const brain of this.#brains) {
      brain.removeEventListener('signal', this.#boundUpdateState);
    }
  }
  get index(){
    return this.#index;
  }
  get option(){
    return this.#options[this.#index];
  }
  options(mapping = ({ option }) => option ){
    return this.#options.map((value, index) => ({ option: value, selected: index === this.#index })).map(mapping);
  }
  updateState({ which }) {
    // prevent snake from backtracking on itself by checking that it's 
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)
    switch(which){
      case 'next':
        this.#index++;
        if(this.#index === this.#choices.length){
          this.#index = 0;
        }
      break;
      case 'previous':
        this.#index--;
        if(this.#index === -1){
          this.#index = this.#choices.length - 1;
        }
      break;
      default :
        this.#index = which;
        if(this.#index < 0 || this.#index >= this.#choices.length){
          throw new Error('out of bounds');
          this.#index = 0;
        }
      break;
    }
  }
}
export default Snake;
