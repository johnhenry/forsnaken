// Function that builds atop the browser's native *requestAnimationFrame* to
// run iterators at a specified framerate and render yielded elements.
// Useful for game loops.

export default (iterator, renderer, FPS=12, start=true)=>{// Set FPS to divisors of 60: 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1
  let count = 0;
  let running = false;
  const loop = () => {
    if(running){
      requestAnimationFrame(loop);
    }
    count +=0.5;
    if (count < 30/FPS) {
      return;
    }
    count = 0;
    renderer(iterator.next().value);
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
  return { pause, resume };
}