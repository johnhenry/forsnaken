export default class extends Event {
  constructor(snake){
    super('apple eaten');
    this.snake = snake;
  }
}