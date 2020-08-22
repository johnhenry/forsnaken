import Swipe from './swipe.mjs';
import BrainComponent from '../brain.component.mjs';
export default class extends BrainComponent {
  constructor(){
    super();
  }
  connectedCallback ( ) {
    super.setBrain(new Swipe(
      Number(this.getAttribute('threshold')) || 1,
      (this.getAttribute('map') ? this.getAttribute('map').split(',') : undefined),
      this.getAttribute('touch') !== null));
  }
};

