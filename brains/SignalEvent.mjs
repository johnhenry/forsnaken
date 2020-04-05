export default class extends Event{
  constructor(which){
    super('signal');
    this.which = which;
  }
}