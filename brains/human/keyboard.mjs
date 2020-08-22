export default class extends EventTarget {
  // #map
  // #boundProcess
  constructor(map = {}) {
    super();
    this._private_map = map || {};
    this._private_boundProcess = this.process.bind(this);
    window.document.addEventListener("keydown", this._private_boundProcess);
  }
  disable() {
    window.document.removeEventListener("keydown", this._private_boundProcess);
  }
  process(keyDownEvent) {
    const which = this._private_map[keyDownEvent.which];
    if (which) {
      this.dispatchEvent(new CustomEvent("thought", { detail: { which } }));
    }
  }
}
