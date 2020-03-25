const Snake = class{
  #x
  #y
  #dx
  #dy
  #cells
  #maxCells
  #grid
  constructor(x, y, dx, dy, cells, maxCells, grid){
    this.#x = x;
    this.#y = y;
    this.#dx = dx;
    this.#dy = dy;
    this.#cells = cells;
    this.#maxCells = maxCells;
    this.#grid = grid;
    // listen to keyboard events to move the snake
    this.boundChangeDirection = this.changeDirection.bind(this);
    window.document.addEventListener('keydown', this.boundChangeDirection);
  }
  destroy(){
    // listen to keyboard events to move the snake
    window.document.removeEventListener('keydown', this.boundChangeDirection);
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
  get dx(){
    return this.#dx;
  }
  get dy(){
    return this.#dy;
  }
  get dx(){
    return this.#dx;
  }
  grow(size=1){
    this.#maxCells+=size;
  }
  move(canvas) {
    // move snake by it's velocity
    this.#x += this.#dx;
    this.#y += this.#dy;

    // wrap snake position horizontally on edge of screen
    if (this.#x < 0) {
      this.#x = canvas.width - this.#grid;
    }
    else if (this.#x >= canvas.width) {
      this.#x = 0;
    }
    // wrap snake position vertically on edge of screen
    if (this.#y < 0) {
      this.#y = canvas.height - this.#grid;
    }
    else if (this.#y >= canvas.height) {
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
      case 37:
        if(!this.dx){
          this.#dx = -this.#grid;
          this.#dy = 0;
        }
      break;
      case 38:
        if(!this.dy){
          this.#dy = -this.#grid;
          this.#dx = 0;
        }
      break;
      case 39:
        if(!this.dx){
          this.#dx = this.#grid;
          this.#dy = 0;
        }
      break;
      case 40:
        if(!this.dy){
          this.#dy = this.#grid;
          this.#dx = 0;
        }
        break;
    }
  }
}
export default Snake;