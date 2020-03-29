export default (context, width, height, zoom) => (...things)=>{
  // draw each apple and snake
  context.clearRect(0, 0, width, height);
  for(const {color, cells} of things){
    for(const cell of cells){
      context.fillStyle = color;
      context.fillRect(cell.x*zoom, cell.y*zoom, zoom, zoom);
    }
  }
}