import { scale } from "../ImageData/utilities.mjs";

export default class extends HTMLElement {
  constructor() {
    super();
    this.style = "display:contents";
    this.renderHandler = this.renderHandler.bind(this);
  }
  connectedCallback() {
    const protoZoom = this.getAttribute("value");
    const zoom =
      protoZoom === null
        ? 1
        : protoZoom.indexOf(",") === -1
        ? Number(protoZoom)
        : protoZoom.split(",");

    const [zoomX, zoomY] = Array.isArray(zoom)
      ? zoom.map(Number)
      : [zoom, zoom];

    this.zoomX = zoomX;
    this.zoomY = zoomY;
    this.addEventListener("render", this.renderHandler);
  }
  disconnectedCallback() {
    this.removeEventListener("render", this.renderHandler);
  }
  renderHandler(event) {
    const { type, bubbles, detail } = event;
    event.stopPropagation();
    const { data, width } = detail;
    const scaled = new ImageData(
      scale(data, width, this.zoomX, this.zoomY),
      width * this.zoomX
    );
    this.parentElement.dispatchEvent(
      new CustomEvent(type, { detail: scaled, bubbles })
    );
  }
}
