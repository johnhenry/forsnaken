// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const Apple = class{
  #hp
  #value
  #xrange
  #yrange
  constructor({ xrange, yrange, avoid=[], hp=Infinity }){
    this.#xrange = xrange;
    this.#yrange = yrange
    this.#hp = hp;
    this.spawn(...avoid);
  }
  spawn(...avoid){
    this.#value=2;
    do {
      this.x = getRandomInt(...this.#xrange);
      this.y = getRandomInt(...this.#yrange);
    }while(avoid.find(({ x, y }) => x === this.x && y === this.y));
  }
  get value (){
    return this.#value;
  }
  get color (){
    return '#ff0000';
  }
  get cells(){
    return [this];
  }
  get alive(){
    return this.#hp > 0;
  }
  damage(damage){
    this.#hp -= damage;
  }
};
export default Apple;
