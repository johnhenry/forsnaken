export default class extends HTMLElement {
  constructor() {
    super();
    this.events = [];
    this.callback = ($) => $;
  }
  static get observedAttributes() {
    return ["events", "onevent"];
  }
  connectedCallback() {
    this.setAttribute("style", "display:contents");
  }
  disconnectedCallback() {
    for (const event of this.events) {
      this.removeEventListener(event, this.callback);
    }
  }
  attributeChangedCallback(name, old, current) {
    if (name === "events") {
      for (const event of this.events) {
        this.removeEventListener(event, this.callback);
      }
      if (current) {
        this.callback = this.callback.bind(this);
        this.events = (current || "").split(",").map((event) => event.trim());
      }
      for (const event of this.events) {
        this.addEventListener(event, this.callback);
      }
    }
    if (name === "onevent") {
      for (const event of this.events) {
        this.removeEventListener(event, this.callback);
      }
      let func;
      try {
        if (!current) {
          throw new Error("");
        }
        func = new Function("event", current);
      } catch {
        func = ($) => $;
      }
      this.bubbles = this.getAttribute("bubbles") !== null;
      this.callback = function (event) {
        func.call(this, event);
        if (!this.bubbles) {
          event.stopPropagation();
        }
      };
      for (const event of this.events) {
        this.addEventListener(event, this.callback);
      }
    }
  }
}
