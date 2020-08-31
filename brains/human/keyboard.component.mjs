import {
  wasd,
  antiWasd,
  arrows,
  antiArrows,
} from "../configurations/keyboard.mjs";
import Keyboard from "./keyboard.mjs";
import BrainComponent from "../brain.component.mjs";
export default class extends BrainComponent {
  constructor() {
    super();
  }
  connectedCallback() {
    super.setBrain(
      new Keyboard({
        ...(this.getAttribute("arrows") !== null ? arrows : {}),
        ...(this.getAttribute("wasd") !== null ? wasd : {}),
        ...(this.getAttribute("anti-arrows") !== null ? antiArrows : {}),
        ...(this.getAttribute("anti-wasd") !== null ? antiWasd : {}),
        ...(this.getAttribute("keys")
          ? JSON.parse(this.getAttribute("keys"))
          : {}),
      })
    );
  }
}
