export default class extends Event {
  constructor(subject){
    super('death');
    this.subject = subject;
  }
}