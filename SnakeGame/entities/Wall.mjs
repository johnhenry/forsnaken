const Wall = class{
  #cells
  constructor({ x, y, x1, y1, diagonal, antiDiagonal, spread=1}){
    this.#cells= [];
    const minX = Math.min(x, x1 || Infinity);
    const maxX = Math.max(x, x1 || -Infinity);
    const MaxWidth = maxX - minX;
    const minY = Math.min(y, y1 || Infinity);
    const maxY = Math.max(y, y1 || -Infinity);
    // const MaxHeight = maxY - minY;
    // if((diagonal || antiDiagonal) && (MaxWidth !== MaxHeight) ){
    //   console.warn('dimensions must be square to properly draw diagonal')
    // }
    let i0 = 0;
    for(let i = minX; i <= maxX; i+=spread){
      let j0 = 0;
      for(let j = minY; j <= maxY; j+=spread){
        if(diagonal){
          if(j0 - i0 === 0){
            this.#cells.push({x:i, y:j});
          }
        }else if (antiDiagonal) {
          if(MaxWidth - i0 === j0){
            this.#cells.push({x:i, y:j});
          }
        }else {
          this.#cells.push({x:i, y:j});
        }
        j0+=spread;
      }
      i0+=spread;
    }
  }
  get color (){
    return '#bbbbbbff';
  }
  get cells(){
    return this.#cells;
  }
};
export default Wall;
