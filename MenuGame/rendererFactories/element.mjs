import MenuEvent from '../events/MenuEvent.mjs';
import SignalEvent from '../../brains/SignalEvent.mjs';

export default (element, brain) => async (events) => {
  for(const event of events){
    if (event instanceof MenuEvent){
      const { options, index } = event;
      element.innerHTML = '';
      for(let i = 0; i < options.length; i++){
        const { label } = options[i];
        const div = document.createElement('div');
        div.innerText = label;
        div.style = 'cursor:pointer;color:white';
        div.onclick = ()=>{
          brain.dispatchEvent(new SignalEvent({exec:true, label}));
        }
        if(i === index){
          div.style = 'cursor:pointer;color:red';
        }
        element.appendChild(div);
      }
    }
  }
}