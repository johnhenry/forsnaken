const Snake = class{
  #x
  #y
  #dx
  #dy
  #cells
  #maxCells
  #grid
  #brain
  #boundChangeDirection
  constructor(x, y, dx, dy, cells, maxCells, grid, brain){
    this.#x = x;
    this.#y = y;
    this.#dx = dx;
    this.#dy = dy;
    this.#cells = cells;
    this.#maxCells = maxCells;
    this.#grid = grid;
    this.#brain = brain;
    // listen to keyboard events to move the snake
    this.#brain.addEventListener('signal', this.#boundChangeDirection = this.changeDirection.bind(this));
  }
  destroy(){
    this.#brain.removeEventListener('signal', this.#boundChangeDirection);
  }
  get head(){
    return this.#cells[0];
  }
  get tail(){
    return this.#cells.slice(1);
  }
  get cells(){
    return this.#cells;
  }
  get x(){
    return this.#x;
  }
  get y(){
    return this.#y;
  }
  get direction(){
    if(this.#dy > 0 ){
      return 'down';
    }else if(this.#dy < 0 ){
      return 'up';
    }else if(this.#dx >0 ){
      return 'right';
    }
    return 'left';
  }
  grow(size=1){
    this.#maxCells+=size;
  }
  move({width, height}) {
    // move snake by it's velocity
    this.#x += this.#dx;
    this.#y += this.#dy;

    // wrap snake position horizontally on edge of screen
    if (this.#x < 0) {
      this.#x = width - this.#grid;
    }
    else if (this.#x >= width) {
      this.#x = 0;
    }
    // wrap snake position vertically on edge of screen
    if (this.#y < 0) {
      this.#y = height - this.#grid;
    }
    else if (this.#y >= height) {
      this.#y = 0;
    }
    // keep track of where snake has been. front of the array is always the head
    this.#cells.unshift({x: this.x, y: this.y});
    // remove cells as we move away from them
    if (this.#cells.length > this.#maxCells) {
      this.#cells.pop();
    }
  }
  changeDirection({ which }) {
    // prevent snake from backtracking on itself by checking that it's 
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)
    switch(which){
      case 'left':
        if(!this.#dx){
          this.#dx = -this.#grid;
          this.#dy = 0;
        }
      break;
      case 'up':
        if(!this.#dy){
          this.#dy = -this.#grid;
          this.#dx = 0;
        }
      break;
      case 'right': 
        if(!this.#dx){
          this.#dx = this.#grid;
          this.#dy = 0;
        }
      break;
      case 'down':
        if(!this.#dy){
          this.#dy = this.#grid;
          this.#dx = 0;
        }
        break;
    }
  }
}
export default Snake;