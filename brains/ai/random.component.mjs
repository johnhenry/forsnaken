import Random from './random.mjs';
import BrainComponent from '../brain.component.mjs';
export default class extends BrainComponent {
  constructor(){
    super();
  }
  connectedCallback ( ) {
    super.setBrain(new Random(
      JSON.parse(this.getAttribute('weights')),
      Number(this.getAttribute('interval')) || 1000));
  }
};