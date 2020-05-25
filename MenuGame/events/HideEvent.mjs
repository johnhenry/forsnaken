export default class extends Event {
  constructor(hidden){
    super('hide');
    this.hidden = hidden;
  }
}
