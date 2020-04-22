const frameTest = (FPS)=>{
  if(120 % FPS || FPS > 60){
    throw new Error(`FPS must be a divisor of 120 and less than or equal to 60:
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60`);
  }
}
const STEP = 1/2;
// Function that builds atop the browser's native *requestAnimationFrame* to
// Limits loops to a specified FPS when awaited.
export const animationFrame = (FPS=60, value=undefined) => {
  frameTest(FPS);
  return new Promise((resolve)=>{
  let count = -STEP;
  const loop = () => {
    count += STEP;
    if (count < 60/2/FPS) {
      return requestAnimationFrame(loop);
    }else{
      resolve(value);
    }    
  };
  loop();
})
};

export const regulateAnimation = async function * (gameInstance, FPS){
  for (const output of gameInstance){
    // Limit the rate of iterator to **FPS**
    await animationFrame(FPS);
    yield output;
  }
}

export const timeout = (FPS=60, value=undefined) => {
  frameTest(FPS);
  return new Promise(
    resolve => setTimeout(resolve, Math.floor(1000/FPS), value));
} 

export const regulateTimeout = async function * (gameInstance, FPS){
  for (const output of gameInstance){
    // Limit the rate of iterator to **FPS**
    await timeout(FPS);
    yield output;
  }
}