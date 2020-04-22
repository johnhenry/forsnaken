export default class extends Event{
  constructor(which, error){
    super('signal');
    this.which = which;
    this.error = error;
  }
}