import { test, expect } from "@playwright/test";

const heads = (page) =>
  page.evaluate(() => Object.fromEntries(document.getElementById("game").snakes.map((s) => [s.id, { ...s.snake.head, direction: s.snake.direction }])));

test.describe("the page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => customElements.get("pixel-canvas") && customElements.get("forsnaken-game") && customElements.get("hot-key"));
  });

  test("waits on the start dialog, then plays; keys steer, twins mirror", async ({ page }) => {
    const before = await heads(page);
    await page.waitForTimeout(300);
    expect(await heads(page), "the clock starts paused").toEqual(before);
    await page.getByRole("button", { name: "Start" }).click();
    await expect.poll(async () => (await heads(page)).green.x).toBeGreaterThan(0);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("d"); // yellow: right (it's heading down)
    await expect.poll(async () => {
      const h = await heads(page);
      return [h.green.direction, h["green-twin"].direction, h.yellow.direction, h["yellow-twin"].direction];
    }).toEqual(["down", "up", "right", "left"]);
  });

  test("Space pauses (without freezing the page) and R restarts", async ({ page }) => {
    await page.getByRole("button", { name: "Start" }).click();
    await page.waitForTimeout(300);
    await page.keyboard.press("Space");
    const paused = await heads(page);
    await page.waitForTimeout(300);
    expect(await heads(page)).toEqual(paused);
    expect(await page.evaluate(() => 1 + 1), "the page still responds").toBe(2);
    await page.keyboard.press("r");
    await expect.poll(async () => (await heads(page)).green.x).toBeLessThan(paused.green.x);
  });

  test("the board is drawn through <pixel-canvas>, scaled up 8× with a grid", async ({ page }) => {
    const result = await page.evaluate(() => {
      const screen = document.getElementById("screen");
      screen.render();
      return { source: screen.source.id, size: [screen.canvas.width, screen.canvas.height] };
    });
    expect(result).toEqual({ source: "game", size: [800, 400] });
  });

  test("markup has explicit closing tags: every entity is a direct child of the game", async ({ page }) => {
    const children = await page.evaluate(() => [...document.getElementById("game").children].map((el) => el.localName));
    expect(children).toEqual([
      "frame-timer",
      "forsnaken-apple",
      ...Array(4).fill("forsnaken-wall"),
      ...Array(5).fill("forsnaken-snake"),
    ]);
  });
});

test.describe("the elements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test/fixture.html");
  });

  test("work however they're built: one at a time, any order, defined later", async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Built bottom-up like an editor would: children first, game last,
      // and only then defined.
      const snake = document.createElement("forsnaken-snake");
      snake.setAttribute("color", "#00f");
      snake.setAttribute("x", "2");
      snake.setAttribute("y", "1");
      const apple = document.createElement("forsnaken-apple");
      apple.setAttribute("count", "3");
      apple.setAttribute("x-range", "5,9");
      apple.setAttribute("y-range", "0,4");
      const game = document.createElement("forsnaken-game");
      game.setAttribute("width", "10");
      game.setAttribute("height", "5");
      document.body.append(game);
      game.append(apple);
      const group = document.createElement("div"); // nesting doesn't matter
      game.append(group);
      group.append(snake);
      await import("/game/global.mjs");
      const context = game.canvas.getContext("2d");
      const colored = (x, y) => [...context.getImageData(x, y, 1, 1).data].join();
      return { snakes: game.snakes.length, apples: game.apples[0].apples.length, head: colored(2, 1), size: [game.canvas.width, game.canvas.height] };
    });
    expect(result).toEqual({ snakes: 1, apples: 3, head: "0,0,255,255", size: [10, 5] });
  });

  test("a <frame-timer> inside drives it; score, death, and gameover events bubble", async ({ page }) => {
    const events = await page.evaluate(async () => {
      await import("/game/global.mjs");
      document.body.innerHTML = `<div id="host"><forsnaken-game id="g" width="10" height="3">
        <forsnaken-apple count="1" x-range="3,4" y-range="1,2" lives="1"></forsnaken-apple>
        <forsnaken-snake id="s" x="1" y="1" direction="right"></forsnaken-snake>
      </forsnaken-game></div>`;
      const seen = [];
      for (const type of ["score", "death", "gameover"]) document.getElementById("host").addEventListener(type, (e) => seen.push([type, e.detail.snake?.id ?? null]));
      const game = document.getElementById("g");
      for (let i = 0; i < 4; i++) game.dispatchEvent(new Event("tick")); // what <frame-timer> sends
      return seen;
    });
    expect(events).toEqual([["score", "s"], ["gameover", null]]);
  });

  test("commands steer snakes and restart the game", async ({ page }) => {
    const result = await page.evaluate(async () => {
      await import("/game/global.mjs");
      document.body.innerHTML = `<forsnaken-game id="g" width="10" height="10">
        <forsnaken-apple x-range="9,10" y-range="9,10"></forsnaken-apple>
        <forsnaken-snake id="s" x="5" y="5"></forsnaken-snake>
        <forsnaken-snake id="m" x="2" y="2" mirror="s"></forsnaken-snake>
      </forsnaken-game>`;
      const send = (el, command) => el.dispatchEvent(Object.assign(new Event("command"), { command }));
      const game = document.getElementById("g");
      send(document.getElementById("s"), "--down");
      game.step();
      const moved = [document.getElementById("s").snake.head, document.getElementById("m").snake.direction];
      send(game, "--restart");
      return { moved, restarted: document.getElementById("s").snake.head };
    });
    expect(result).toEqual({ moved: [{ x: 5, y: 6 }, "up"], restarted: { x: 5, y: 5 } });
  });
});
