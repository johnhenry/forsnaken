import Game from './index.mjs';
import Control from '../Control.mjs';// TODO: remove
import KeyBrain from '../brains/human/keyboard.mjs';// TODO: remove

const assignForSnakeGameComponent = function (child) {
  const {snake, apple, wall, primitive} = child;
  if(snake) {
    this.snakes.push(snake);
  } else if (apple) {
    this.apples.push(apple);
  } else if (wall) {
    this.walls.push(wall);
  } else if (primitive){
    this.primitives.push(primitive);
  }
  if(child.childNodes.length) {
    // Resursively apply to children
    for (const grandChild of child.childNodes){
      assignForSnakeGameComponent.call(this, grandChild);
    }
  }
};

export default class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow( { mode: 'open' } );
    this.slotted = this.shadow.appendChild(document.createElement('slot'));
    this.slotted.style = 'display:none';    
    this.slotChange = this.slotChange.bind(this);
    this.slotted.addEventListener('slotchange', this.slotChange);
    this.addEventListener('tick', ()=>{
      if(this.syncInstance){
        for(const {type, detail} of this.syncInstance.next().value){
          this.dispatchEvent(
            this.primTransform(
              new CustomEvent(type, {detail, bubbles:true})));
        }
      }
    })
  }
  primTransform(event){
    if(this.primitives.length){
      for(const transform of this.primitives){
        event = transform(event);
      }
    }
    return event;
  }
  async connectedCallback() {
    // this.reset();
  }

  static get observedAttributes() { return []; }
  attributeChangedCallback(name, old, current) {
    // this.reset();
  }
  slotChange ({ target } ) {
    this.width = Number(this.getAttribute('width')) || 100;
    this.height = Number(this.getAttribute('height')) || 50;
    this.snakes = [];
    this.apples = [];
    this.walls = [];
    this.primitives = [];
    for(const child of target.assignedElements()) {
      assignForSnakeGameComponent.call(this, child);
    }
    this.reset();
  }

  async reset() {
    this.syncInstance = Game({ 
      apples:this.apples, 
      width: this.width,
      height: this.height,
      walls: this.walls,
      control: new Control({
        brains:[new KeyBrain({27:'end'})]})}, ...this.snakes);
  }
}
