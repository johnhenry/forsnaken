// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const Apple = class{
  #value
  #xrange
  #yrange
  constructor({ xrange, yrange, avoid=[] }){
    this.#xrange = xrange;
    this.#yrange = yrange
    this.spawn(...avoid);
  }
  spawn(...avoid){
    this.#value=2
    do {
      this.x = getRandomInt(...this.#xrange);
      this.y = getRandomInt(...this.#yrange);
    }while(avoid.find(({ x, y }) => x === this.x && y === this.y));
  }
  get value (){
    return this.#value;
  }
  get color (){
    return 'red';
  }
  get cells(){
    return [this];
  }
};
export default Apple;
