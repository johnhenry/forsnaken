import Apple from "./apple.mjs";

export default class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("thought", (event) =>
      this.snake?.boundUpdateState?.(event)
    );
  }
  connectedCallback() {
    const multi = Number(this.getAttribute("multi"));
    const xrange = this.getAttribute("x-range") || "0,8";
    const yrange = this.getAttribute("y-range") || "0,8";
    const avoid = this.getAttribute("avoid") || "[]";
    const hp = Number(this.getAttribute("hp")) || Infinity;
    if (!multi) {
      this.apple = new Apple({
        xrange: xrange.split(",").map((x) => Number(x)),
        yrange: yrange.split(",").map((x) => Number(x)),
        avoid: JSON.parse(avoid) || [],
        hp,
      });
    } else {
      for (let i = 0; i < Number(multi); i++) {
        const apple = document.createElement(this.tagName);
        apple.setAttribute("x-range", xrange);
        apple.setAttribute("y-range", yrange);
        apple.setAttribute("avoid", avoid);
        apple.setAttribute("hp", hp);
        this.appendChild(apple);
      }
    }
  }
}
