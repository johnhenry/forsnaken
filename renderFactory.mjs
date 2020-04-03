import drawFactory from './drawFactory.mjs';
import AppleEatenEvent from './AppleEatenEvent.mjs';

export default (context, width, height, zoom)=>
  {
    const draw = drawFactory(context, width, height, zoom);  
    return ({ redraw, events} )=>{
    if (redraw) {
      draw(...redraw);
    }
    if (events) {
      for(const event of events){
        if(event instanceof AppleEatenEvent){
          $('#game').effect('shake', event.snake);
          $('#game').stop().css('background-color', 'inherit')
            .animate({ backgroundColor: event.snake.color}, 10);
        }
      }
    }
  }
}