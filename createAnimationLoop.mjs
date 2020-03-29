export default (game, render, FPS=12, start=true)=>{// Set FPS to divisors of 60: 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1
  let count = 0;
  let running = false;
  const loop = () => {
    if(running){
      requestAnimationFrame(loop);
    }
    // slow game loop to FPS fps instead of 60 (60/FPS = 4)
    if (++count < 60/FPS) {
      return;
    }
    count = 0;
    render(game.next().value);
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