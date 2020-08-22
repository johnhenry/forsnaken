export default (canvas, border=0)=>(squares)=>{
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  for(const {color, x, y, width, height} of squares){
    context.fillStyle = color;
    context.fillRect(
      x + 1*border,
      y + 1*border,
      width - 2 * border,
      height - 2 * border
    );
  }
}