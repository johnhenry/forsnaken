const addBorder = (array, width, boxwidth, boxheight = boxwidth) => {
  const data = new Uint8ClampedArray(array.length);
  for (let index = 0; index < array.length; index += 4) {
    const pixel = array.slice(index, index + 4);
    const x = (index % (width * 4)) / 4;
    const y = Math.floor(index / (width * 4));
    if (
      !(x % boxwidth) ||
      !((x + 1) % boxwidth) ||
      !((x - 1) % boxwidth) ||
      !(y % boxheight) ||
      !(y + (1 % boxheight)) ||
      !(y - (1 % boxheight))
    ) {
      continue;
    } else {
      data.set(pixel, index);
    }
  }
  return data;
};

export default class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.setAttribute("style", "display:contents");
    this.renderHandler = this.renderHandler.bind(this);
    this.cellwidth = Number(this.getAttribute("width")) || 1;
    this.cellheight = Number(this.getAttribute("height")) || 1;
    this.addEventListener("render", this.renderHandler);
  }
  disconnectedCallback() {
    this.removeEventListener("render", this.renderHandler);
  }
  renderHandler(event) {
    const { type, bubbles, detail } = event;
    event.stopPropagation();
    const { data, width } = detail;
    const transformed = new ImageData(
      addBorder(data, width, this.cellwidth, this.cellheight),
      width
    );
    this.parentElement?.dispatchEvent(
      new CustomEvent(type, { detail: transformed, bubbles })
    );
  }
}
