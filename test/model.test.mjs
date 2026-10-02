import { test } from "node:test";
import assert from "node:assert/strict";
import { Snake, Apple, Wall, step } from "../game/model.mjs";

const sequence = (...values) => () => values.shift() ?? 0;

test("a snake starts with its body trailing behind its head", () => {
  const snake = new Snake({ x: 5, y: 5, direction: "right", length: 3 });
  assert.deepEqual(snake.cells, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
});

test("moving wraps around the edges", () => {
  const snake = new Snake({ x: 9, y: 0, direction: "right", length: 1 });
  snake.move(10, 10);
  assert.deepEqual(snake.head, { x: 0, y: 0 });
  snake.steer("up");
  snake.move(10, 10);
  assert.deepEqual(snake.head, { x: 0, y: 9 });
});

test("steering: no reversing, clockwise/counterclockwise, and no fold-back from two quick turns", () => {
  const snake = new Snake({ x: 5, y: 5, direction: "right" });
  assert.equal(snake.steer("left"), false, "can't reverse");
  snake.steer("clockwise");
  assert.equal(snake.direction, "down");
  snake.steer("counterclockwise");
  assert.equal(snake.direction, "up", "relative to the last move (right), not the pending turn");
  // The classic bug: right, then up and left before the next move = reversed into itself.
  const quick = new Snake({ x: 5, y: 5, direction: "right" });
  quick.steer("up");
  assert.equal(quick.steer("left"), false, "left is still a reversal of the last move");
  quick.move(20, 20);
  assert.equal(quick.steer("left"), true, "after moving up, left is fine");
});

test("eating grows the snake, scores, pauses it a step, and respawns the apple elsewhere", () => {
  const snake = new Snake({ x: 2, y: 2, direction: "right", length: 2 });
  const apple = new Apple({ xRange: [0, 10], yRange: [0, 10], value: 2 });
  apple.x = 2;
  apple.y = 2;
  const world = { width: 10, height: 10, snakes: [snake], apples: [apple], walls: [] };
  const events = step(world, sequence(0.5, 0.5));
  assert.deepEqual(events.map((e) => e.type), ["score"]);
  assert.equal(snake.length, 4);
  assert.deepEqual(snake.head, { x: 2, y: 2 }, "digesting: didn't move");
  assert.notDeepEqual([apple.x, apple.y], [2, 2]);
  step(world);
  assert.deepEqual(snake.head, { x: 3, y: 2 });
});

test("apples with lives run out, and then the game is over", () => {
  const snake = new Snake({ x: 1, y: 1, direction: "right" });
  const apple = new Apple({ xRange: [1, 2], yRange: [1, 2], lives: 1 });
  const world = { width: 10, height: 10, snakes: [snake], apples: [apple], walls: [] };
  assert.deepEqual(step(world).map((e) => e.type), ["score"]);
  assert.equal(world.apples.length, 0);
  assert.deepEqual(step(world).map((e) => e.type), ["gameover"]);
});

test("running into a body or a wall kills a snake, which respawns", () => {
  const snake = new Snake({ x: 3, y: 3, direction: "right", length: 5 });
  snake.cells = [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 3 }]; // head on its own body
  const world = { width: 10, height: 10, snakes: [snake], apples: [new Apple({ xRange: [9, 10], yRange: [9, 10] })], walls: [] };
  assert.deepEqual(step(world).map((e) => e.type), ["death"]);
  assert.deepEqual(snake.head, { x: 3, y: 3 });
  assert.equal(snake.cells.length, 5, "reset to its starting length");

  const walled = new Snake({ x: 5, y: 5, direction: "right" });
  const wallWorld = { width: 10, height: 10, snakes: [walled], apples: [new Apple({ xRange: [9, 10], yRange: [9, 10] })], walls: [new Wall({ x: 5, y: 5 })] };
  assert.deepEqual(step(wallWorld).map((e) => e.type), ["death"]);
});

test("head-on: one of the two snakes dies, chosen at random", () => {
  const make = () => [new Snake({ x: 4, y: 4, direction: "right", length: 1 }), new Snake({ x: 4, y: 4, direction: "left", length: 1 })];
  const apples = () => [new Apple({ xRange: [9, 10], yRange: [9, 10] })];
  const [a, b] = make();
  const first = step({ width: 10, height: 10, snakes: [a, b], apples: apples(), walls: [] }, sequence(0.9, 0.9));
  assert.deepEqual(first.map((e) => e.snake), [a], "random ≥ 0.5: the snake that ran in");
  const [c, d] = make();
  const second = step({ width: 10, height: 10, snakes: [c, d], apples: apples(), walls: [] }, sequence(0.1, 0.9));
  assert.deepEqual(second.map((e) => e.snake), [d], "random < 0.5: the other one");
});

test("walls: rectangles and diagonals", () => {
  assert.equal(new Wall({ x: 0, y: 0, x1: 2, y1: 1 }).cells.length, 6);
  assert.deepEqual(new Wall({ x: 0, y: 0, x1: 2, y1: 2, shape: "diagonal" }).cells, [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]);
  assert.deepEqual(new Wall({ x: 0, y: 0, x1: 2, y1: 2, shape: "anti-diagonal" }).cells, [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
});

test("apples spawn away from cells to avoid", () => {
  const apple = new Apple({ xRange: [0, 2], yRange: [0, 1] });
  apple.spawn([{ x: 0, y: 0 }], sequence(0, 0, 0.9, 0));
  assert.deepEqual([apple.x, apple.y], [1, 0]);
});
