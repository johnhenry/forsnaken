export default class extends Event {
  constructor({options, index}){
    super('menu');
    this.options = options;
    this.index = index;
  }
}
