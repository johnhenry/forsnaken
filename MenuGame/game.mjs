import MenuEvent from './events/MenuEvent.mjs';
import HideEvent from './events/HideEvent.mjs';
import Selector from './entities/Selector.mjs';
export const next = Symbol('next');
export const prev = Symbol('prev');
export default async function *({ options=[], index=0, brains }){
  const selector = new Selector({ brains, cache:false });
  index = 0;
  while(true){
    if(index >= options.length){
      index = 0;
    }
    if(index < 0){
      index = options.length - 1;
    }
    yield [new MenuEvent({ options, index })];
    const { label, exec } = await selector.choose();
    if(label || label==='' || label === 0){
      switch(label) {
        case next:
          index++;
          break;
        case prev:
          index--;
          break;
        default :
          const item = options.find(x => x.label === label);
          index = options.indexOf(item);
          if(index < 0 ){
            index = label;
          }
          if(typeof index !== 'number'){
            index = 0;
          }
        break;
      }
    }
    if(exec){
      yield [ new HideEvent(true) ];
      yield * options[index].subroutine();
      yield [ new HideEvent(false) ];
    }
  }
}