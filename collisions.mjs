export default function *(collide, subjects, objects){
  for(let i = 0; i < subjects.length; i++) {
    for(let j = 0; j<objects.length; j++){
      if(subjects[i] && objects[j] && collide(subjects[i], objects[j])){
        yield [subjects[i], objects[j]];
      }
    }
  }
}
