import Wall from "./Wall.mjs";

export default class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("thought", (event) =>
      this.snake?.boundUpdateState?.(event)
    );
  }
  connectedCallback() {
    this.wall = new Wall({
      x: Number(this.getAttribute("x")),
      y: Number(this.getAttribute("y")),
      x1:
        this.getAttribute("x1") === null
          ? undefined
          : Number(this.getAttribute("x1")),
      y1:
        this.getAttribute("y1") === null
          ? undefined
          : Number(this.getAttribute("y1")),
      spread: Number(this.getAttribute("spread")) || 1,
      diagonal: this.getAttribute("diagonal") !== null,
      antiDiagonal: this.getAttribute("anti-diagonal") !== null,
    });
  }
}
