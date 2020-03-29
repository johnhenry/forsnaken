export default class extends Event{
  constructor(keyDownEvent, map){
    super('signal');
    this.which = map[keyDownEvent.which];
  }
}