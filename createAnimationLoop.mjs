// Function that builds atop the browser's native *requestAnimationFrame* to
// run iterators at a specified framerate and render yielded elements.
// Useful for game loops.
// Set FPS to divisors of 120 less than 60: 60, 40, 30, 24, 20, 15, 12, 10, 8, 6, 5, 4, 3, 2, 1
export const loop = (iterator, renderer=console.log, FPS=12, start=true) => {
  let count = 0;
  let running = false;
  let current;
  const loop = () => {
    if(running){
      requestAnimationFrame(loop);
    }
    count +=0.5;
    if (count < 30/FPS) {
      return;
    }
    count = 0;
    current = iterator.next().value;
    renderer(current);
  };
  const pause = () => running = false;
  const resume = () => {
    if(!running){
      running = true;
      loop();
    }
    return running;
  }
  if(start){
    resume();
  }
  return { 
    pause,
    resume,
    get running(){ return running },
    get current(){ return current } 
  };
};

export const asyncLoop = (iterator, renderer=console.log, FPS=12, start=true) => {
  let running = false;
  let current;
  const MS = Math.floor(1000/FPS);
  const loop = async () => {
    if(!running){
      return;
    }
    current = await iterator.next().value;
    await renderer(current );
    setTimeout(loop, MS);
  };
  const pause = () => running = false;
  const resume = () => {
    if(!running){
      running = true;
      loop();
    }
    return running;
  }
  if(start){
    resume();
  }
  return { 
    pause,
    resume,
    get running(){ return running },
    get current(){ return current } 
  };
};