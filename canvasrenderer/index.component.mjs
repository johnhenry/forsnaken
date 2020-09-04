import renderImageData from "./imagedata.mjs";
import renderSquares from "./squares.mjs";

export default class extends HTMLElement {
  constructor() {
    super();
  }
  disconnectedCallback() {
    this.removeEventListener("render", this.draw);
  }
  connectedCallback() {
    this.setAttribute("style", "display:contents");
    this.slotted = document.createElement("slot");
    this.slotted.setAttribute("style", "display:none");
    this.appendChild(this.slotted);
    const width = Number(this.getAttribute("width")) || 1;
    const height = Number(this.getAttribute("height")) || 1;
    const border = Number(this.getAttribute("border-size")) ?? 0;
    const squares = this.getAttribute("squares") !== null;
    this.canvas = this.appendChild(document.createElement("canvas"));
    this.canvas.width = width;
    this.canvas.height = height;
    const draw = squares
      ? renderSquares(this.canvas, border)
      : renderImageData(this.canvas);
    this.draw = function ({ detail }) {
      draw(detail);
    };
    this.addEventListener("render", this.draw);
  }
}
