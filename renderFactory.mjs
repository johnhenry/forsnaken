import drawFactory from './drawFactory.mjs';
import AppleEatenEvent from './AppleEatenEvent.mjs';

export default (context, width, height, zoom)=>
  {
    const draw = drawFactory(context, width, height, zoom);  
    return ({status, entities, event} )=>{
    switch(status){
      case 'draw':
        draw(...entities);
      break;
      case 'event':
        // apply effects
        if(event instanceof AppleEatenEvent){
          $('#game').effect('shake', event);
        }
      break;
      default:
      break;
    }
  }
}