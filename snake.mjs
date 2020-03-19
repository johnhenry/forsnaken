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
  set cells(_cells){
    this.#cells = _cells;
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
  set x(x){
    this.#x = x;
  }
  set y(y){
    this.#y = y;
  }
  get dy(){
    return this.#dy;
  }
  set dx(dx){
    this.#dx = dx;
  }
  set dy(dy){
    this.#dy = dy;
  }
  set dy(dy){
    this.#dy = dy;
  }
  get maxCells(){
    return this.#maxCells;
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
  drawOnCanvasContext(context, apple) {
    // draw snake one cell at a time
    context.fillStyle = 'green';
    let index = 0;
    for(const cell of this.#cells){
    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
      context.fillRect(cell.x, cell.y, this.#grid, this.#grid);  
      // snake ate apple
      if (cell.x === apple.x && cell.y === apple.y) {
        this.#maxCells++;
        // canvas is 400x400 which is 25x25 grids
        return false;
      }
      // check collision with all cells after this one (modified bubble sort)
      for (let i = index + 1; i < this.#cells.length; i++) {
        // snake occupies same space as a body part. reset game
        if (cell.x === this.#cells[i].x && cell.y === this.#cells[i].y) {
          this.destroy();
          throw new Error('dead');
        }
      }
      index++;
    }
    return true;
  }
}
export default Snake;