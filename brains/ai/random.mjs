export default class extends EventTarget {
  #values
  #interval
  #boundProcess
  constructor(weights, interval=1000){
    super();
    this.#values = Object.entries(weights).map(([value, weight]) => {
      const result = [];
      for(let i = 0; i < weight; i++){
        result.push(value);
      }
      return result;
    }).flat();
    this.#boundProcess = this.process.bind(this);
    this.#interval = setInterval(() =>{
      this.#boundProcess();
    }, interval);
  }
  disable(){
    clearInterval(this.#interval);
  }
  process(){
    const which = this.#values[Math.floor(Math.random() * this.#values.length)];
    this.dispatchEvent(new CustomEvent('thought', {detail:{which}}));
  }
};
