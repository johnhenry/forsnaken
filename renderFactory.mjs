import drawFactory from './drawFactory.mjs';
import DrawEvent from './DrawEvent.mjs';
import ScoreEvent from './ScoreEvent.mjs';
import DeathEvent from './DeathEvent.mjs';
export default (context, width, height, zoom) =>
  {
    const draw = drawFactory(context, width, height, zoom);  
    return (events) => {
      for(const event of events){
        if (event instanceof DrawEvent){
          const { subjects } = event;
          draw(...subjects);
        } else if (event instanceof ScoreEvent){
          const { direction, color, id } = event.subject;
          const { score } = event;
          $('#game')
            .effect('shake', { direction });
          $('#game')
            .stop('fade', true)
            .css('background-color', 'inherit')
            .animate({ backgroundColor: color}, 10);
          console.log(`snake ${id} scored ${score}`);
        } else if (event instanceof DeathEvent) {
          const { id } = event.subject;
          console.log(`snake ${id} died`);
        }
      }
    }
  }