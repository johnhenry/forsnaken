export default class extends Event {
  constructor(direction){
    super('apple eaten');
    this.direction = direction;
  }
}