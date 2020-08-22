import createSquares from "./squares.mjs";
import createImageData from "./imagedata.mjs";

export default class extends HTMLElement {
  constructor(){
    super();
    this.shadow = this.attachShadow( { mode: 'open' } );
    
    this.setAttribute('style', 'display:contents');
  }
  connectedCallback(){
    const protoZoom = this.getAttribute('zoom');

    const zoom = protoZoom === null 
      ? 1 
      : protoZoom.indexOf(',') === -1 
        ? Number(protoZoom)
        : protoZoom.split(',');

    const [zoomX, zoomY] = Array.isArray(zoom)
      ? zoom.map(Number)
      : [zoom, zoom];
    
    const width = Number(this.getAttribute('width')) || 1;
    const height = Number(this.getAttribute('height')) || 1;
    const squares = this.getAttribute('squares') !== null;
    const create = squares
      ? createSquares(zoom)
      : createImageData(width, height, zoomX, zoomY);
    this.primitive = (event)=>{
      const {type, bubbles, detail} = event;
      if(type === 'draw'){
        event.stopPropagation();
        return new CustomEvent('render', {bubbles, detail:create(...detail)});
      }
      return event;
    }
  }
}