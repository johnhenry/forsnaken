export default class extends Event {
  constructor(subject, score){
    super('score');
    this.subject = subject;
    this.score = score;
  }
}