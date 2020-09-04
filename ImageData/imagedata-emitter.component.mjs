import SMILE from "./smile.mjs";
export default class extends HTMLElement {
  constructor() {
    super();
    this.send = this.send.bind(this);
  }
  connectedCallback() {
    this.image = new ImageData(SMILE, 6);
    this.interval = setInterval(this.send, 1000);
  }
  disconnectedCallback() {
    clearInterval(this.interval);
  }
  send() {
    this.dispatchEvent(
      new CustomEvent("render", { detail: this.image, bubbles: true })
    );
  }
}
