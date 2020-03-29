export default (context, fillStyle, {x, y}, scalex, scaley)=>{
  context.fillStyle = fillStyle;
  context.fillRect(x, y, scalex, scaley);
}