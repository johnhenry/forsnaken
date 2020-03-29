export default (game, render, FPS=12)=>{// Set FPS to divisors of 60: 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1
  let count = 0;
  const loop = () => {
    requestAnimationFrame(loop);
    // slow game loop to FPS fps instead of 60 (60/FPS = 4)
    if (++count < 60/FPS) {
      return;
    }
    count = 0;
    render(game.next().value);
  };
  loop();
}