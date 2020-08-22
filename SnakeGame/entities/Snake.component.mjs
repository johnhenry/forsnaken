import Snake from './snake.mjs';

export default class extends HTMLElement {
  constructor(){
    super();
    this.addEventListener(
      'thought', (event)=>this.snake?.boundUpdateState?.(event));
  }
  connectedCallback(){
    this.snake = new Snake({
      name: this.getAttribute('name'),
      color: this.getAttribute('color'),
      x: Number(this.getAttribute('x')),
      y: Number(this.getAttribute('y')), 
      velocity: Number(this.getAttribute('velocity')),
      horizontal: this.getAttribute('horizontal') !== null,
      brains: []
    });
  }

}