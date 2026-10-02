// What happens around the game: the start dialog starts the clock, a score
// shakes the screen toward the snake's direction and turns the board that
// snake's color (camouflage), and the scoreboard counts apples. (The game itself only reports events.)
const game = document.getElementById("game");
const clock = document.getElementById("clock");
const screen = document.getElementById("screen");
const scores = document.getElementById("scores");
const start = document.getElementById("start");
const calm = matchMedia("(prefers-reduced-motion: reduce)");

start.addEventListener("close", () => clock.play());

const eaten = new Map();
const showScores = () => {
  scores.replaceChildren(
    ...[...eaten].sort((a, b) => b[1] - a[1]).map(([snake, count]) => {
      const item = document.createElement("li");
      item.style.color = snake.getAttribute("color");
      item.textContent = `${snake.id}: ${count}`;
      return item;
    }),
  );
};

const SHAKE = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
game.addEventListener("score", ({ detail: { snake, color, direction } }) => {
  eaten.set(snake, (eaten.get(snake) ?? 0) + 1);
  showScores();
  // Camouflage: the board takes the color of the snake that just scored,
  // which hides that snake until someone else scores.
  screen.style.backgroundColor = color;
  if (calm.matches) return;
  const [x, y] = SHAKE[direction] ?? [0, 0];
  screen.animate(
    [0, 6, -4, 2, 0].map((d) => ({ translate: `${x * d}px ${y * d}px` })),
    { duration: 250, easing: "ease-out" },
  );
});

game.addEventListener("gameover", () => {
  clock.pause();
  scores.insertAdjacentHTML("afterbegin", "<li>Game over. Press R to play again.</li>");
});

game.addEventListener("command", (event) => {
  if (event.command === "--restart") {
    eaten.clear();
    screen.style.backgroundColor = "";
    showScores();
    clock.play();
  }
});
