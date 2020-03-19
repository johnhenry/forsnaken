// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const Apple = class{
  #grid
  constructor(grid){
    this.#grid = grid;
    this.x = getRandomInt(0, 25) * grid;
    this.y = getRandomInt(0, 25) * grid;
  }
  drawOnCanvasContext(context){
    // draw apple
    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, this.#grid, this.#grid);
  }
};
export default Apple;