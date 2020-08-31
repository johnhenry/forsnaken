export default class extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["events"];
  }
  connectedCallback(){
    this.setAttribute("style",  "display:contents");
  }
  attributeChangedCallback(name, old, current) {
    if (name === "events") {
      for (const event of (old || "").split(",").map((event) => event.trim())) {
        this.removeEventListener(event, this.callback);
      }
      let func;
      try {
        if (this.getAttribute("onevent") === null) {
          throw new Error("");
        }
        const body = this.getAttribute("onevent") || "";
        func = new Function("event", body);
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
      this.callback = this.callback.bind(this);
      for (const event of (current || "")
        .split(",")
        .map((event) => event.trim())) {
        this.addEventListener(event, this.callback);
      }
    }
  }
}
