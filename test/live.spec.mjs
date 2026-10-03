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

// --- brains: the one interface for control -----------------------------------

const send = (page, id, command) =>
  page.evaluate(([id, command]) => document.getElementById(id)?.dispatchEvent(Object.assign(new Event("command"), { command })), [id, command]);

test("a player is a brain: inputs steer it; swap in a computer brain and it takes over; swap back and the player has control", async ({ page }) => {
  await page.evaluate(() => {
    const a = document.getElementById("a");
    a.replaceChildren(Object.assign(document.createElement("snake-brain-player"), { id: "player" }));
    a.setAttribute("x", "6"); // a new start (only this snake): heading right from 6,5
    document.getElementById("apples").remove(); // a snake pauses a step to eat: none to eat here
  });
  const dir = () => page.evaluate(() => document.getElementById("a").snake.direction);
  // The player steers, one turn per step, in the order pressed.
  await send(page, "player", "--down");
  await send(page, "player", "--left");
  await page.evaluate(() => g.step());
  expect(await dir()).toBe("down");
  await page.evaluate(() => g.step());
  expect(await dir()).toBe("left");
  // A greedy brain takes the player's place: it decides on its very first step.
  await page.evaluate(() => {
    document.getElementById("player").remove();
    document.getElementById("a").append(document.createElement("snake-brain-greedy"));
    g.insertAdjacentHTML("beforeend", `<forsnaken-apple count="5" x-range="0,39" y-range="0,19"></forsnaken-apple>`); // something to chase
  });
  // Every turn now comes from the greedy brain; the player's keys go to an
  // element that's gone, so they steer nothing.
  const sources = await page.evaluate(() => {
    const a = document.getElementById("a");
    const from = [];
    a.addEventListener("command", (e) => from.push(e.source?.localName ?? "input"));
    document.getElementById("player")?.dispatchEvent(Object.assign(new Event("command"), { command: "--up" }));
    for (let i = 0; i < 30; i++) g.step();
    return { from: [...new Set(from)], player: document.getElementById("player") };
  });
  expect(sources).toEqual({ from: ["snake-brain-greedy"], player: null });
  // Back to the player (from a known start, in case random play killed it).
  await page.evaluate(() => {
    const a = document.getElementById("a");
    a.replaceChildren(Object.assign(document.createElement("snake-brain-player"), { id: "player" }));
    a.setAttribute("x", "7");
  });
  await send(page, "player", "--up");
  await page.evaluate(() => g.step());
  expect(await dir()).toBe("up");
});

test("a new brain decides on its first step, whatever its interval", async ({ page }) => {
  const turned = await page.evaluate(() => {
    const b = document.getElementById("b"); // heading right, no brain
    b.append(Object.assign(document.createElement("snake-brain-random"), { innerHTML: "" }));
    b.querySelector("snake-brain-random").setAttribute("clockwise", "1");
    b.querySelector("snake-brain-random").setAttribute("counterclockwise", "0");
    b.querySelector("snake-brain-random").setAttribute("straight", "0"); // interval: 24 by default
    g.step();
    return b.snake.direction;
  });
  expect(turned).toBe("down");
});

// --- swapping everything else, mid-game --------------------------------------

test("snakes, apples, walls, and the clock come and go mid-game; the rest carry on", async ({ page }) => {
  const result = await page.evaluate(() => {
    const a = document.getElementById("a");
    const model = a.snake;
    // A new snake joins at its start; another leaves.
    g.insertAdjacentHTML("beforeend", `<forsnaken-snake id="c" x="20" y="15"></forsnaken-snake>`);
    document.getElementById("b").remove();
    g.step();
    const snakes = g.snakes.map((s) => s.id);
    // Apples swapped for a different set: the old ones go, the new ones are placed.
    document.getElementById("apples").replaceWith(Object.assign(document.createElement("forsnaken-apple"), { id: "gold" }));
    document.getElementById("gold").setAttribute("count", "3");
    document.getElementById("gold").setAttribute("value", "10");
    g.step();
    const apples = g.apples.flatMap((el) => el.apples).map((apple) => apple.value);
    // A wall removed and another added.
    document.getElementById("wall").remove();
    g.insertAdjacentHTML("beforeend", `<forsnaken-wall x="30" y="0" x1="30" y1="19"></forsnaken-wall>`);
    g.step();
    const walls = g.walls.flatMap((el) => el.wall.cells).length;
    // A new clock: ticks move the game.
    const timer = document.createElement("frame-timer-stub");
    g.append(timer);
    let ticked = false;
    g.addEventListener("step", () => (ticked = true), { once: true });
    timer.dispatchEvent(new Event("tick", { bubbles: true }));
    return { snakes, apples, walls, same: a.snake === model, ticked };
  });
  expect(result).toEqual({ snakes: ["a", "c"], apples: [10, 10, 10], walls: 20, same: true, ticked: true });
});

test("the whole game moves to another container and carries on", async ({ page }) => {
  const result = await page.evaluate(() => {
    const model = document.getElementById("a").snake;
    const steps = [];
    g.addEventListener("step", (e) => steps.push(e.detail.step));
    g.step();
    const box = document.createElement("section");
    document.body.append(box);
    box.append(g);
    g.step();
    return { same: document.getElementById("a").snake === model, steps };
  });
  expect(result.same).toBe(true);
  expect(result.steps[1]).toBe(result.steps[0] + 1);
});

// --- controls inside what they control (no ids) ------------------------------

test("keys inside a player brain steer through it; swapping the brain takes its keys along", async ({ page }) => {
  const DOMKIT = "https://cdn.jsdelivr.net/gh/johnhenry/domkit@6b06f9ae97fde22c367107f0c3c8967ed79c889e/src";
  await page.evaluate(async (DOMKIT) => {
    await import(`${DOMKIT}/hot-key/global.mjs`);
    document.getElementById("apples").remove(); // a snake pauses a step to eat: none to eat here
    const a = document.getElementById("a");
    a.innerHTML = `<snake-brain-player><hot-key hotkey="arrowdown" command="--down"></hot-key><hot-key hotkey="r" command="--restart"></hot-key></snake-brain-player>`;
    a.setAttribute("x", "6"); // a new start: heading right from 6,5
    window.direct = 0;
    a.addEventListener("command", (e) => e.source?.localName === "hot-key" && direct++);
    window.restarts = 0;
    g.addEventListener("command", (e) => e.command === "--restart" && restarts++);
  }, DOMKIT);
  const dir = () => page.evaluate(() => document.getElementById("a").snake.direction);
  await page.keyboard.press("ArrowDown");
  await page.evaluate(() => g.step());
  expect(await dir()).toBe("down");
  // The key's command stopped at the brain: the snake only heard it from the brain.
  expect(await page.evaluate(() => direct)).toBe(0);
  // Commands the brain doesn't handle keep bubbling (here, to the game).
  await page.keyboard.press("r");
  expect(await page.evaluate(() => restarts)).toBe(1);
  // Swap in a greedy brain: the keys went with the player brain.
  await page.evaluate(() => {
    const a = document.getElementById("a");
    a.replaceChildren(document.createElement("snake-brain-greedy"));
    a.setAttribute("x", "8");
  });
  expect(await page.evaluate(() => document.querySelectorAll("hot-key").length)).toBe(0);
  await page.keyboard.press("ArrowDown");
  await page.evaluate(() => g.step());
  expect(await dir(), "no apples: greedy carries on, and the key did nothing").toBe("right");
});
