export default (context, fillStyle, {x, y}, unit)=>{
  context.fillStyle = fillStyle;
  context.fillRect(x, y, unit, unit);
}