// forsnaken stands on its own: its elements work under any tag names, its
// manifest describes them (and matches the code), and builder.html is a
// page that plays as it is.
import { test, expect } from "@playwright/test";

test("the elements work under other tag names", async ({ page }) => {
  await page.goto("/test/fixture.html");
  const result = await page.evaluate(async () => {
    const { define } = await import("/game/index.mjs");
    define({ game: "snake-board", snake: "snake-player", apple: "snake-food", wall: "snake-rock", greedyBrain: "snake-ai" });
    document.body.innerHTML = `
      <snake-board id="board" width="20" height="10">
        <snake-food count="1" x-range="15,15" y-range="2,2"></snake-food>
        <snake-rock x="0" y="9" x1="19" y1="9"></snake-rock>
        <snake-player id="a" x="2" y="2" direction="right"><snake-ai></snake-ai></snake-player>
        <snake-player id="b" x="2" y="6" direction="right" mirror="a"></snake-player>
      </snake-board>`;
    const board = document.getElementById("board");
    const parts = { snakes: board.snakes.length, apples: board.apples.length, walls: board.walls.length };
    let scored = 0;
    board.addEventListener("score", () => scored++);
    for (let i = 0; i < 14; i++) board.step();
    document.getElementById("a").dispatchEvent(Object.assign(new Event("command"), { command: "--down" }));
    return {
      parts,
      scored,
      mirrored: document.getElementById("b").snake.direction,
      usual: customElements.get("forsnaken-game") ?? null,
    };
  });
  expect(result).toEqual({ parts: { snakes: 2, apples: 1, walls: 1 }, scored: 1, mirrored: "up", usual: null });
});

test("custom-elements.json describes every element, as the code defines it", async ({ page, request }) => {
  const manifest = await (await request.get("/custom-elements.json")).json();
  const pkg = await (await request.get("/package.json")).json();
  expect(pkg.customElements).toBe("custom-elements.json");
  const described = Object.fromEntries(
    manifest.modules.flatMap((mod) => (mod.declarations ?? []).filter((d) => d.tagName).map((d) => [d.tagName, d.attributes.map((a) => a.name).sort()])),
  );
  const definitions = manifest.modules.flatMap((mod) => (mod.exports ?? []).filter((e) => e.kind === "custom-element-definition").map((e) => [e.name, mod.path]));
  await page.goto("/test/fixture.html");
  const actual = await page.evaluate(async () => {
    await import("/game/global.mjs");
    const { NAMES } = await import("/game/index.mjs");
    return Object.fromEntries(Object.values(NAMES).map((tag) => [tag, [...(customElements.get(tag).observedAttributes ?? [])].sort()]));
  });
  expect(Object.keys(described).sort()).toEqual(Object.keys(actual).sort());
  // Every attribute the element watches is documented (brains read theirs on each step, so they watch none).
  for (const [tag, attributes] of Object.entries(actual)) expect(described[tag], tag).toEqual(expect.arrayContaining(attributes));
  expect(Object.fromEntries(definitions)).toEqual(Object.fromEntries(Object.keys(actual).map((tag) => [tag, "game/global.mjs"])));
});

test("builder.html plays as it is", async ({ page }) => {
  await page.goto("/builder.html");
  await page.waitForFunction(() => document.querySelector("forsnaken-game")?.snakes?.length === 2);
  await expect.poll(() => page.evaluate(() => document.getElementById("green").snake.head.x)).toBeGreaterThan(2);
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => page.evaluate(() => document.getElementById("green").snake.direction)).toBe("down");
  expect(await page.evaluate(() => document.querySelector("pixel-canvas").canvas.width)).toBe(800);
});
