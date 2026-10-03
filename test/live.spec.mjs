// Editing a running game: brains swap, attributes change, elements move,
// and only what changed is affected. (An editor that patches a live page,
// like htmlbuilder's preview, relies on this.)
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/fixture.html");
  await page.evaluate(async () => {
    await import("/game/global.mjs");
    document.body.innerHTML = `
      <forsnaken-game id="g" width="40" height="20" score-pause="0">
        <forsnaken-apple id="apples" count="5" x-range="0,39" y-range="0,19"></forsnaken-apple>
        <forsnaken-wall id="wall" x="0" y="19" x1="3" y1="19"></forsnaken-wall>
        <forsnaken-snake id="a" x="5" y="5"><snake-brain-random interval="1"></snake-brain-random></forsnaken-snake>
        <forsnaken-snake id="b" x="5" y="10"></forsnaken-snake>
      </forsnaken-game>`;
    window.g = document.getElementById("g");
    window.snap = (id) => {
      const s = document.getElementById(id).snake;
      return { head: { ...s.head }, length: s.length, color: s.color, alive: s.alive };
    };
    for (let i = 0; i < 20; i++) g.step();
  });
});

test("a brain swapped mid-game takes over the same snake", async ({ page }) => {
  const result = await page.evaluate(() => {
    const a = document.getElementById("a");
    const model = a.snake;
    const before = snap("a");
    a.querySelector("snake-brain-random").remove();
    a.append(document.createElement("snake-brain-greedy"));
    const after = snap("a");
    let scored = 0;
    g.addEventListener("score", (e) => e.detail.snake === a && scored++);
    for (let i = 0; i < 300; i++) g.step();
    return { same: a.snake === model, unchanged: JSON.stringify(before) === JSON.stringify(after), scored };
  });
  expect(result.same).toBe(true);
  expect(result.unchanged).toBe(true);
  expect(result.scored).toBeGreaterThan(0);
});

test("a snake's color and name change in place; its start position starts only it over", async ({ page }) => {
  const result = await page.evaluate(() => {
    const a = document.getElementById("a");
    const before = snap("a");
    const bBefore = snap("b");
    a.setAttribute("color", "#ff00ff");
    a.setAttribute("name", "pink");
    const recolored = snap("a");
    a.setAttribute("x", "30");
    return { before, recolored, moved: snap("a"), b: JSON.stringify(snap("b")) === JSON.stringify(bBefore), name: a.snake.name };
  });
  expect(result.recolored).toEqual({ ...result.before, color: "#ff00ff" });
  expect(result.name).toBe("pink");
  expect(result.moved.head).toEqual({ x: 30, y: 5 });
  expect(result.moved.length).toBe(2);
  expect(result.b).toBe(true);
});

test("apples: a new count adds or removes apples, keeping the rest where they are; other settings apply in play", async ({ page }) => {
  const result = await page.evaluate(() => {
    const el = document.getElementById("apples");
    const where = () => el.apples.map((a) => `${a.x},${a.y}`);
    const before = where();
    el.setAttribute("count", "8");
    g.draw(); // places the new ones
    const more = where();
    el.setAttribute("count", "3");
    const fewer = where();
    el.setAttribute("value", "5");
    return { before, more, fewer, values: el.apples.map((a) => a.value) };
  });
  expect(result.more.slice(0, 5)).toEqual(result.before);
  expect(result.more).toHaveLength(8);
  expect(result.fewer).toEqual(result.before.slice(0, 3));
  expect(result.values).toEqual([5, 5, 5]);
});

test("moving elements and resizing the board keep the game going", async ({ page }) => {
  const result = await page.evaluate(() => {
    const a = document.getElementById("a");
    const model = a.snake;
    const before = snap("a");
    g.prepend(a); // reorder: disconnects and reconnects it
    const wrapper = document.createElement("div");
    g.append(wrapper);
    wrapper.append(document.getElementById("b")); // deeper
    g.setAttribute("width", "60");
    document.getElementById("wall").setAttribute("x1", "10");
    g.step();
    return {
      same: a.snake === model,
      before,
      snakes: g.snakes.length,
      wall: g.walls[0].wall.cells.length,
      canvas: g.canvas.width,
    };
  });
  expect(result.same).toBe(true);
  expect(result.snakes).toBe(2);
  expect(result.wall).toBe(11);
  expect(result.canvas).toBe(60);
});
