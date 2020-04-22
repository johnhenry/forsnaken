import ScoreEvent from '../events/ScoreEvent.mjs';
import DeathEvent from '../events/DeathEvent.mjs';
const scores = {};
const deaths = {};
export default (element) => async (events) => {
  for(const event of events){
    if (event instanceof ScoreEvent){
      const { subject } = event;
      const { direction, color, id } = subject;
      const { score } = event;
      $(element)
        .effect('shake', { direction });
      $(element)
        .stop('fade', true)
        .css('background-color', 'inherit')
        .animate({ backgroundColor: color}, 10);
      await new Promise(resolve=>setTimeout(resolve, 250));
      if(scores[id]){
        scores[id] += score;
      }else{
        scores[id] = score;
      }
      const scoreElement = window.document.getElementById(`score-${id}`);
      scoreElement.style.color = subject.color;
      scoreElement.innerText = scores[id];
      continue;
    } else if (event instanceof DeathEvent) {
      const { subject } = event;
      const { id } = subject;
      if(deaths[id]){
        deaths[id] ++;
      }else{
        deaths[id] = 1;
      }
      const deathElement = window.document.getElementById(`death-${id}`);
      deathElement.style.color = subject.color;
      deathElement.innerText = deaths[id];
      continue;
    }
  }
}