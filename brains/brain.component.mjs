export default class extends HTMLElement {
  // #brain
  // #bubbleThrough
  constructor(){
    super();
    this._private_bubbleThrough = this.bubbleThrough.bind(this);
  }
  setBrain(brain){
    this._private_brain = brain;
    this._private_brain.addEventListener('thought', this._private_bubbleThrough);
  }
  disconnectedCallback() {
    this._private_brain?.disable();
    this._private_brain?.removeEventListener('thought', this._private_bubbleThrough);
  }
  bubbleThrough({type, detail}){
    this.dispatchEvent(new CustomEvent(type, {detail, bubbles:true}));
  }  
};