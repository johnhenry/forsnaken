// https://softwareengineering.stackexchange.com/questions/212808/treating-a-1d-data-structure-as-2d-grid

export const scaleX = (array, factor=1) =>{
  const data = new Uint8ClampedArray(array.length * factor);
  for(let index = 0; index <= array.length-4; index+=4){
    const pixel = array.slice(index, index+4);
    for(let i = 0; i < factor*4; i+=4){
      newRow.set(pixel, factor * index + i);
    }
  }
  return data;
}
export const scaleY = (array, width, factor=1) => {
  const data = new Uint8ClampedArray(array.length * factor);
  let i = 0;
  const height = array.length/width/4;
  while(i < height){
    const row = array.slice((i)*(width*4), (i+1)*(width*4));
    for (let k = 0; k < row.length; k++) {
      for (let j = 0; j < factor; j++) {
          const index = k+(factor*(i+1)-(j+1))*width*4;
          data[index] = row[k];
        }
      }
    i++;
  }
  return data;
}

export const scale = (array, width, X=1, Y=1) => {
  const data = new Uint8ClampedArray(array.length * X * Y);
  let i = 0;
  const height = array.length/width/4;
  const newWidth = width * X;
  while(i < height) {
    const row = array.slice((i)*(width*4), (i+1)*(width*4));
    const newRow = new Uint8ClampedArray(row.length*X);
    // scale x -- extend each "pixel" X times
    for(let index = 0; index < row.length; index+=4){
      const pixel = row.slice(index, index+4);
      for(let j = 0; j < X*4; j+=4){
        newRow.set(pixel, X * index + j);
      }
    }
    // scale y -- extend each "row" Y times
    for (let index = 0; index < newRow.length; index++) {
      const val = newRow[index];
      for (let j = 0; j < Y; j++) {
          data[index+(Y*(i+1)-(j+1))*newWidth*4] = val;
        }
      }
    i++;
  }
  return data;
}
