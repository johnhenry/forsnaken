export default class extends Event {
  constructor(which){
    super('choice');
    this.which = which;
  }
}
