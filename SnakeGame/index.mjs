import collide from "https://johnhenry.github.io/std/js/collisions@0.0.0/collideXY.mjs";

import collideArray from "https://johnhenry.github.io/std/js/collisions@0.0.0/collideiterators.mjs";
export default function* (
  { apples = [], width = 400, height = 400, control = {}, walls = [] },
  ...snakes
) {
  while (true) {
    if (control.over) {
      break;
    }
    if (control.paused) {
      continue;
    }
    //Check For End Conditions
    if (!apples.length) {
      yield [new CustomEvent("game over", { detail: {} })];
      break;
    }
    // check for collision between each snake's head and each apple
    const digesting = new Set([]); // digesting snakes will not move this round
    for (const [head, apple] of collideArray(
      snakes.map(({ head }) => head),
      apples
    )) {
      // if collision happens (snake eats apple)
      const snake = snakes.find((snake) => collide(head, snake.head, true));
      // grow snake
      snake.grow(apple.value);
      digesting.add(snake);
      apple.damage(1);
      if (apple.alive) {
        apple.spawn(
          ...snakes
            .map(({ cells }) => cells)
            .flat()
            .concat(walls.map(({ cells }) => cells).flat())
        );
      } else {
        const index = apples.indexOf(apple);
        apples.splice(index, 1);
      }
      // shake screen based on snake direction
      digesting.add(snake);
      yield [
        new CustomEvent("score", {
          detail: { subject: snake, score: apple.value },
        }),
      ];
    }

    // check for collision between each snake's head and each other snake
    for (const [head, part] of collideArray(
      snakes.map(({ head }) => head),
      snakes.map(({ cells }) => cells).flat()
    )) {
      const snake = snakes
        .filter(({ enabled }) => enabled)
        .find((snake) => collide(head, snake.head, true));
      const otherSnake = snakes
        .filter(({ enabled }) => enabled)
        .flat()
        .find((snake) => snake.head === part);
      if (otherSnake) {
        if (Math.random() < 0.5) {
          if (snake.enabled) {
            snake.enabled = false; // destory old snake (remove listeners)
            yield [new CustomEvent("death", { detail: snake })];
          }
        } else {
          if (otherSnake.enabled) {
            otherSnake.enabled = false; // destory old snake (remove listeners)
            yield [new CustomEvent("death", { detail: otherSnake })];
          }
        }
      } else {
        if (snake.enabled) {
          snake.enabled = false; // destory old snake (remove listeners)
          yield [new CustomEvent("death", { detail: snake })];
        }
      }
    }

    // check for collision between each snake's head and each wall
    for (const [head] of collideArray(
      snakes.map(({ head }) => head),
      walls.map(({ cells }) => cells).flat()
    )) {
      // if collision happens (snake hits apple)
      const snake = snakes.find((snake) => collide(head, snake.head, true));
      if (snake.enabled) {
        snake.enabled = false; // destory old snake (remove listeners)
        yield [new CustomEvent("death", { detail: snake })];
      }
    }

    // revive any dead snakes
    for (const index in snakes) {
      if (!snakes[index].enabled) {
        snakes[index].reset();
      }
    }

    // move each snake
    for (const snake of snakes.filter((snake) => !digesting.has(snake))) {
      snake.move({ width, height });
    }
    yield [
      new CustomEvent("draw", {
        detail: [...apples.filter(({ alive }) => alive), ...snakes, ...walls],
      }),
    ];
  }
}
