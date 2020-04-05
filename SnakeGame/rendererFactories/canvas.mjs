import DrawEvent from '../events/DrawEvent.mjs';
import ScoreEvent from '../events/ScoreEvent.mjs';
import DeathEvent from '../events/DeathEvent.mjs';
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
const scores = {};
const deaths = {};
export default (canvasElement, width, height, zoom=1) =>
  {
    const draw = makeDraw(canvasElement.getContext('2d'), width, height, zoom);  
    return (events) => {
      for(const event of events){
        if (event instanceof DrawEvent){
          const { subjects } = event;
          draw(...subjects);
        } else if (event instanceof ScoreEvent){
          const { direction, color, id } = event.subject;
          const { score } = event;
          $(canvasElement)
            .effect('shake', { direction });
          $(canvasElement)
            .stop('fade', true)
            .css('background-color', 'inherit')
            .animate({ backgroundColor: color}, 10);
          if(scores[id]){
            scores[id] += score;
          }else{
            scores[id] = score;
          }
          console.log(`${id} score: ${scores[id]}`);
        } else if (event instanceof DeathEvent) {
          const { id } = event.subject;
          if(deaths[id]){
            deaths[id] ++;
          }else{
            deaths[id] = 1;
          }
          console.log(`${id} died ${deaths[id]} times`);
        }
      }
    }
  }