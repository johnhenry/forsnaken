import pause from "https://johnhenry.github.io/std/js/pause@0.0.0/index.mjs";
import pauseframespersecond from "https://johnhenry.github.io/std/js/pauseframespersecond@0.0.0/index.mjs";

export default class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.shadow = this.shadow || this.attachShadow({ mode: "open" });
    this.slotted = this.shadow.appendChild(document.createElement("slot"));
    this.slotted.style = "display:none";
    this.slotChange = this.slotChange.bind(this);
    this.slotted.addEventListener("slotchange", this.slotChange);
    this.handleEvent = this.handleEvent.bind(this);
    this.addEventListener("pause", this.handleEvent);
    if (this.suspended) {
      this.suspended = false;
      this.reset();
    }
  }
  disconnectedCallback() {
    this.break = true;
    this.suspended = true;
  }
  slotChange() {
    this.fps = Number(this.getAttribute("fps") || 60);
    this.reset();
  }
  async reset() {
    this.break = false;
    while (true) {
      await pauseframespersecond(this.fps);
      if (this.break) {
        this.dispatchEvent(new Event("paused"));
        break;
      }
      this.dispatchEvent(new Event("tick", { bubbles: true }));
    }
    this.break = false;
  }
  async handleEvent({ type, detail }) {
    switch (type) {
      case "pause":
        this.break = true;
        if (detail) {
          await pause(detail);
          this.reset();
        }
        break;
    }
  }
  disconnectedCallBack() {
    this.pause();
    this.slotted.removeEventListener("slotchange", this.slotChange);
  }
}
