import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/fixture.html");
  await page.evaluate(() => import("/game/global.mjs"));
});

const steps = (page, n) => page.evaluate((n) => { for (let i = 0; i < n; i++) document.getElementById("g").step(); }, n);
const direction = (page, id) => page.evaluate((id) => document.getElementById(id).snake.direction, id);

test("each step starts with a step event carrying a copy of the board", async ({ page }) => {
  const detail = await page.evaluate(() => {
    document.body.innerHTML = `<forsnaken-game id="g" width="10" height="5">
      <forsnaken-apple x-range="8,9" y-range="0,1"></forsnaken-apple>
      <forsnaken-wall x="0" y="4" x1="1" y1="4"></forsnaken-wall>
      <forsnaken-snake id="s" x="2" y="2" color="#00f"></forsnaken-snake>
    </forsnaken-game>`;
    let seen;
    document.addEventListener("step", (e) => (seen = e.detail), { once: true });
    const game = document.getElementById("g");
    game.step();
    seen.snakes[0].head.x = 99; // a copy: changing it changes nothing
    return { ...seen, snakes: seen.snakes.map(({ element, ...s }) => ({ ...s, element: element.id })), real: game.snakes[0].snake.head.x };
  });
  expect(detail).toMatchObject({
    width: 10,
    height: 5,
    step: 1,
    snakes: [{ id: "s", element: "s", color: "#00f", direction: "right", length: 2 }],
    apples: [{ x: 8, y: 0, value: 2 }],
    walls: [{ x: 0, y: 4 }, { x: 1, y: 4 }],
  });
  expect(detail.real, "the brain's copy is separate from the game").toBe(3);
});

test("a brain inside a snake steers it; commandfor steers one elsewhere; swapping brains swaps behavior", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<forsnaken-game id="g" width="20" height="20">
      <forsnaken-apple x-range="19,20" y-range="19,20"></forsnaken-apple>
      <forsnaken-snake id="a" x="5" y="5"><snake-brain-random interval="1" clockwise="1" counterclockwise="0" straight="0"></snake-brain-random></forsnaken-snake>
      <forsnaken-snake id="b" x="5" y="10"></forsnaken-snake>
    </forsnaken-game>
    <snake-brain-random id="remote" commandfor="b" interval="1" clockwise="0" counterclockwise="1" straight="0"></snake-brain-random>`;
  });
  await steps(page, 1);
  expect([await direction(page, "a"), await direction(page, "b")]).toEqual(["down", "up"]);
  // Swap a's brain for one that turns the other way.
  await page.evaluate(() => {
    document.querySelector("#a snake-brain-random").setAttribute("clockwise", "0");
    document.querySelector("#a snake-brain-random").setAttribute("counterclockwise", "1");
  });
  await steps(page, 1);
  expect(await direction(page, "a"), "down, turned counterclockwise").toBe("right");
  // Remove b's brain: b carries on straight.
  await page.evaluate(() => document.getElementById("remote").remove());
  const before = await direction(page, "b");
  await steps(page, 3);
  expect(await direction(page, "b")).toBe(before);
});

test("interval, disabled, and the original random weights", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<forsnaken-game id="g" width="40" height="40">
      <forsnaken-apple x-range="39,40" y-range="39,40"></forsnaken-apple>
      <forsnaken-snake id="s" x="5" y="5"><snake-brain-random id="r" interval="3" clockwise="1" counterclockwise="0" straight="0"></snake-brain-random></forsnaken-snake>
    </forsnaken-game>`;
  });
  await steps(page, 1);
  expect(await direction(page, "s"), "a new brain decides on its first step").toBe("down");
  await steps(page, 2);
  expect(await direction(page, "s"), "not yet: every 3 steps").toBe("down");
  await steps(page, 1);
  expect(await direction(page, "s")).toBe("left");
  await page.evaluate(() => (document.getElementById("r").disabled = true));
  await steps(page, 6);
  expect(await direction(page, "s"), "disabled").toBe("left");
  expect(await page.evaluate(() => {
    const plain = document.createElement("snake-brain-random");
    return plain.interval;
  }), "about once a second at 24 fps, like the original").toBe(24);
});

test("the greedy brain heads for the nearest apple and avoids what's in its way", async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = `<forsnaken-game id="g" width="20" height="20">
      <forsnaken-apple x-range="10,11" y-range="12,13"></forsnaken-apple>
      <forsnaken-wall x="11" y="5" x1="11" y1="5"></forsnaken-wall>
      <forsnaken-snake id="s" x="10" y="5" direction="right"><snake-brain-greedy></snake-brain-greedy></forsnaken-snake>
    </forsnaken-game>`;
  });
  await steps(page, 1);
  expect(await direction(page, "s"), "the wall is ahead and the apple is below").toBe("down");
  await steps(page, 10);
  expect(await page.evaluate(() => document.querySelector("forsnaken-snake").snake.length), "it ate the apple").toBeGreaterThan(2);
});

test("defineSnakeBrain: a brain from one function, reading its own attributes", async ({ page }) => {
  const turns = await page.evaluate(async () => {
    const { defineSnakeBrain } = await import("/game/brains.mjs");
    defineSnakeBrain("snake-brain-fixed", (me, world, brain) => brain.getAttribute("turn"));
    document.body.innerHTML = `<forsnaken-game id="g" width="20" height="20">
      <forsnaken-apple x-range="19,20" y-range="19,20"></forsnaken-apple>
      <forsnaken-snake id="s" x="5" y="5"><snake-brain-fixed turn="up"></snake-brain-fixed></forsnaken-snake>
      <forsnaken-snake id="t" x="9" y="9" mirror="s"></forsnaken-snake>
    </forsnaken-game>`;
    document.getElementById("g").step();
    return [document.getElementById("s").snake.direction, document.getElementById("t").snake.direction];
  });
  expect(turns, "brains send commands, so mirrored snakes follow too").toEqual(["up", "down"]);
});
