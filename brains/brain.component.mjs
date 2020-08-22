export default class extends HTMLElement {
  #brain
  #bubbleThrough
  constructor(){
    super();
    this.#bubbleThrough = this.bubbleThrough.bind(this);
  }
  setBrain(brain){
    this.#brain = brain;
    this.#brain.addEventListener('thought', this.#bubbleThrough);
  }
  disconnectedCallback() {
    this.#brain?.disable();
    this.#brain?.removeEventListener('thought', this.#bubbleThrough);
  }
  bubbleThrough({type, detail}){
    this.dispatchEvent(new CustomEvent(type, {detail, bubbles:true}));
  }  
};