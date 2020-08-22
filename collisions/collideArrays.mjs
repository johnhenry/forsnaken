import collide from './collide.mjs';
export default function *(subjects, objects, self=false){
  for(let i = 0; i < subjects.length; i++) {
    for(let j = 0; j<objects.length; j++){
      if(subjects[i] && objects[j] && collide(subjects[i], objects[j])){
        if(!self && subjects[i] === objects[j] ){
          continue;
        }
        yield [subjects[i], objects[j]];
      }
    }
  }
}
