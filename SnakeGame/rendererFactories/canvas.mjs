import DrawEvent from '../events/DrawEvent.mjs';
const makeDraw = (context, width, height, zoom=1) => (...things)=>{
  // draw each apple and snake
  context.clearRect(0, 0, width, height);
  for(const {color, cells} of things){
    for(const cell of cells){
      context.fillStyle = color;
      if (zoom > 2) {
        context.fillRect(cell.x * zoom + 1, cell.y * zoom + 1, zoom - 2, zoom - 2);
      } else {
        context.fillRect(cell.x * zoom, cell.y * zoom, zoom, zoom);
      }
    }
  }
}
export default (canvasElement, width, height, zoom=1) =>
  {
    const draw = makeDraw(canvasElement.getContext('2d'), width, height, zoom);  
    return (events) => {
      for(const event of events){
        if (event instanceof DrawEvent){
          const { subjects } = event;
          draw(...subjects);
          continue;
        }
      }
    }
  }