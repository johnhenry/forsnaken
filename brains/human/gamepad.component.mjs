

// Brain Configurations
import { dpad, antiDpad } from '../configurations/gamepad.mjs';
import GamePad from './gamepad.mjs';

import BrainComponent from '../brain.component.mjs';
export default class extends BrainComponent {
  constructor(){
    super();
  }
  connectedCallback ( ) {
    super.setBrain(new GamePad(Number(this.getAttribute('index')) || 0, {
      ...(this.getAttribute('dpad') !== null ? dpad : {}),
      ...(this.getAttribute('anti-dpad') !== null ? antiDpad : {}),
      ...(this.getAttribute('buttons') ? JSON.parse(buttons) : {}),
    }));
  }
};