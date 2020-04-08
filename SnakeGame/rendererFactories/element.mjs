import ScoreEvent from '../events/ScoreEvent.mjs';
import DeathEvent from '../events/DeathEvent.mjs';
const scores = {};
const deaths = {};
export default (element, getLoop=()=>{}) => (events) => {
  for(const event of events){
    if (event instanceof ScoreEvent){
      const { direction, color, id } = event.subject;
      const { score } = event;
      $(element)
        .effect('shake', { direction });
      $(element)
        .stop('fade', true)
        .css('background-color', 'inherit')
        .animate({ backgroundColor: color}, 10);
      const loop = getLoop();
      if(loop){
        loop.pause();
        setTimeout(loop.resume, 250);
      }
      if(scores[id]){
        scores[id] += score;
      }else{
        scores[id] = score;
      }
      console.log(`${id} score: ${scores[id]}`);
      continue;
    } else if (event instanceof DeathEvent) {
      const { id } = event.subject;
      if(deaths[id]){
        deaths[id] ++;
      }else{
        deaths[id] = 1;
      }
      console.log(`${id} died ${deaths[id]} times`);
      continue;
    }
  }
}