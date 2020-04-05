export default class extends Event {
  constructor(...subjects){
    super('draw');
    this.subjects = subjects;
  }
}