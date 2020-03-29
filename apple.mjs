// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const Apple = class{
  #value=2
  constructor({ unit, width, height }){
    this.x = getRandomInt(0, width/unit) * unit;
    this.y = getRandomInt(0, height/unit) * unit;
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