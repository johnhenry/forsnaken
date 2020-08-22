export default (zoom=1)=>(...objects) =>{
  const details = [];
  for(const {color, cells} of objects){
    for(const {x, y} of cells){
      details.push({color, x: x * zoom, y: y*zoom, width: zoom, height: zoom});
    }
  }
  return details;
}