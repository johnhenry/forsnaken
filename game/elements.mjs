// The game as HTML elements:
//
//   <forsnaken-game width="100" height="50">
//     <frame-timer fps="12"></frame-timer>                 <- its clock (domkit)
//     <forsnaken-apple count="64" x-range="10,89" y-range="10,39"></forsnaken-apple>
//     <forsnaken-wall x="1" y="1" x1="9" y1="9" shape="diagonal"></forsnaken-wall>
//     <forsnaken-snake id="green" color="#4e9a06" x="0" y="0" direction="right"></forsnaken-snake>
//   </forsnaken-game>
//
// The entity elements only hold configuration; the game reads them
// whenever it steps, so they work however they're created (parsed, built
// by an editor, moved), in any order, at any depth. Snakes are steered with
// invoker commands (--up, --down, --left, --right, --clockwise,
// --counterclockwise), so <hot-key>, <gamepad-input>, and <swipe-input>
// from domkit drive them with no script, and so do brains (brains.mjs),
// which decide for themselves from the board the game shows them.
import { Snake, Apple, Wall, step } from "./model.mjs";
import { RandomBrain, GreedyBrain } from "./brains.mjs";

// Entities tell their game when they connect or change (an element that
// upgrades after the game drew isn't a DOM mutation the game could see).
const announce = (element) => element.dispatchEvent(new Event("forsnakenchange", { bubbles: true }));

class Entity extends HTMLElement {
  connectedCallback() {
    announce(this);
  }
  attributeChangedCallback() {
    this.reset?.();
    if (this.isConnected) announce(this);
  }
}

const number = (element, name, fallback) => {
  const value = Number(element.getAttribute(name));
  return element.hasAttribute(name) && Number.isFinite(value) ? value : fallback;
};
const range = (element, name, fallback) => {
  const parts = (element.getAttribute(name) ?? "").split(",").map(Number);
  return parts.length === 2 && parts.every(Number.isFinite) ? parts : fallback;
};

// Parts are found by class, never by tag name, so the elements work under
// any names (see define()).
const descendants = (root, Class) => [...root.querySelectorAll("*")].filter((el) => el instanceof Class);
const ancestor = (el, Class) => {
  for (let node = el.parentElement; node; node = node.parentElement) if (node instanceof Class) return node;
  return null;
};

const MIRROR = { up: "down", down: "up", left: "right", right: "left", clockwise: "counterclockwise", counterclockwise: "clockwise" };

/**
 * A snake. Steer it with commands, or put a brain inside it
 * (<snake-brain-random>, <snake-brain-greedy>, your own); `mirror="other-id"`
 * steers it opposite to another snake.
 * @tag forsnaken-snake
 * @summary A snake, steered by commands (--up, --down, --left, --right, --clockwise, --counterclockwise) or a brain inside it.
 * @attr {number} x - Starting column. Default 0.
 * @attr {number} y - Starting row. Default 0.
 * @attr {"up" | "down" | "left" | "right"} direction - Starting direction. Default right.
 * @attr {number} length - Starting length. Default 2.
 * @attr {string} color - Its color. Default #4e9a06.
 * @attr {string} name - Its name in events. Default its id.
 * @attr {string} mirror - The id of a snake to steer opposite to.
 */
export class ForsnakenSnake extends Entity {
  static observedAttributes = ["x", "y", "direction", "length", "color", "name"];
  #snake = null;

  constructor() {
    super();
    this.addEventListener("command", (event) => {
      const turn = /^--(up|down|left|right|clockwise|counterclockwise)$/.exec(event.command ?? "")?.[1];
      if (turn) this.steer(turn);
    });
  }

  /** Rebuilt (and restarted) from the attributes on next use. */
  reset() {
    this.#snake = null;
  }

  /** The model: its cells, direction, and length. */
  get snake() {
    this.#snake ??= new Snake({
      x: number(this, "x", 0),
      y: number(this, "y", 0),
      direction: this.getAttribute("direction") ?? "right",
      length: number(this, "length", 2),
      color: this.getAttribute("color") ?? "#4e9a06",
      name: this.getAttribute("name") ?? this.id,
    });
    return this.#snake;
  }

  /**
   * Steer it, and any snake with `mirror` naming it (the opposite way).
   * @param {string} turn up, down, left, right, clockwise, or counterclockwise
   */
  steer(turn) {
    const changed = this.snake.steer(turn);
    if (this.id) {
      const game = ancestor(this, ForsnakenGame) ?? this.getRootNode();
      for (const follower of game.querySelectorAll(`[mirror="${CSS.escape(this.id)}"]`)) {
        if (follower !== this && follower instanceof ForsnakenSnake) follower.snake.steer(MIRROR[turn] ?? turn);
      }
    }
    return changed;
  }
}

// "3,4 5,6", or JSON: [[3, 4], [5, 6]] or [{ "x": 3, "y": 4 }]
const cells = (text) => {
  if (!text?.trim()) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((c) => (Array.isArray(c) ? { x: Number(c[0]), y: Number(c[1]) } : { x: Number(c.x), y: Number(c.y) }));
  } catch {
    // not JSON: pairs
  }
  return text.trim().split(/\s+/).map((pair) => pair.split(",").map(Number)).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)).map(([x, y]) => ({ x, y }));
};

/**
 * `count` apples that respawn in a range when eaten, `lives` times each,
 * never on a cell listed in `avoid` ("3,4 5,6").
 * @tag forsnaken-apple
 * @summary Apples that respawn in a range when eaten.
 * @attr {number} count - How many apples. Default 1.
 * @attr {string} x-range - Columns they appear in, "from,to". Default 0,8.
 * @attr {string} y-range - Rows they appear in, "from,to". Default 0,8.
 * @attr {number} lives - Times each respawns. Default forever.
 * @attr {number} value - Growth when eaten. Default 2.
 * @attr {string} avoid - Cells never to appear on: "3,4 5,6", or JSON.
 */
export class ForsnakenApple extends Entity {
  static observedAttributes = ["count", "x-range", "y-range", "lives", "value", "avoid"];
  #apples = null;

  /** The models, one per apple. */
  get apples() {
    this.#apples ??= Array.from({ length: Math.max(1, number(this, "count", 1)) }, () =>
      new Apple({
        xRange: range(this, "x-range", [0, 8]),
        yRange: range(this, "y-range", [0, 8]),
        lives: number(this, "lives", Infinity),
        value: number(this, "value", 2),
        avoid: cells(this.getAttribute("avoid")),
      }));
    return this.#apples;
  }

  /** Start over with fresh apples. */
  reset() {
    this.#apples = null;
  }
}

/**
 * A wall: a filled rectangle, or one of its diagonals (`shape`); `spread` dots it.
 * @tag forsnaken-wall
 * @summary A wall: a filled rectangle or one of its diagonals.
 * @attr {number} x - First corner's column. Default 0.
 * @attr {number} y - First corner's row. Default 0.
 * @attr {number} x1 - Opposite corner's column. Default x.
 * @attr {number} y1 - Opposite corner's row. Default y.
 * @attr {"rect" | "diagonal" | "anti-diagonal"} shape - Default rect.
 * @attr {number} spread - Fill every this many cells. Default 1.
 */
export class ForsnakenWall extends Entity {
  static observedAttributes = ["x", "y", "x1", "y1", "shape", "spread"];
  #wall = null;

  reset() {
    this.#wall = null;
  }

  get wall() {
    const x = number(this, "x", 0);
    const y = number(this, "y", 0);
    this.#wall ??= new Wall({ x, y, x1: number(this, "x1", x), y1: number(this, "y1", y), shape: this.getAttribute("shape") ?? "rect", spread: number(this, "spread", 1) });
    return this.#wall;
  }
}

/**
 * @tag forsnaken-game
 * @summary The board: steps on each tick from a <frame-timer> inside it, and draws the snakes, apples, and walls inside it.
 * @attr {number} width - Columns. Default 100.
 * @attr {number} height - Rows. Default 50.
 * @attr {number} score-pause - Milliseconds to hold still after a score. Default 250.
 * @fires step - Before each step; detail is a snapshot of the board.
 * @fires score - A snake ate an apple.
 * @fires death - A snake died.
 * @fires gameover - Every snake is dead, or --end.
 * @cssprop --forsnaken-scale - Screen pixels per cell. Default 8.
 * @csspart board - The canvas.
 *
 * The board: steps on each `tick` from a <frame-timer> inside it, and
 * draws. Each step starts with a `step` event whose `detail` is a snapshot
 * of the board (for brains), and may fire `score`, `death`, and `gameover`.
 * After a score, the game holds still for `score-pause` milliseconds
 * (default 250), a beat to notice it. `--end` ends the game.
 */
export class ForsnakenGame extends HTMLElement {
  static observedAttributes = ["width", "height"];
  #canvas;
  #holdUntil = 0; // after a score, steps wait until then
  #placed = new WeakSet(); // apples given a first position
  #steps = 0;
  #over = false;
  #observer = new MutationObserver(() => this.#scheduleDraw());
  #pending = false;

  // Coalesce redraws for changes to the next microtask.
  #scheduleDraw() {
    if (this.#pending) return;
    this.#pending = true;
    queueMicrotask(() => {
      this.#pending = false;
      if (this.isConnected) this.draw();
    });
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    // Host defaults: the board, scaled up crisply. The configuration
    // elements inside aren't displayed.
    style.append(
      ":host(:not([hidden])) { display: inline-block; vertical-align: middle; line-height: 0; }",
      " canvas { inline-size: 100%; block-size: auto; image-rendering: pixelated; }",
      " slot { display: none; }",
    );
    this.#canvas = document.createElement("canvas");
    this.#canvas.setAttribute("part", "board");
    this.#sizing = document.createElement("style");
    shadow.append(style, this.#sizing, this.#canvas, document.createElement("slot"));
    this.addEventListener("tick", () => this.step());
    this.addEventListener("forsnakenchange", () => this.#scheduleDraw());
    this.addEventListener("command", (event) => {
      if (event.command === "--restart") this.restart();
      if (event.command === "--step") this.step();
      if (event.command === "--end") this.end();
    });
  }
  #sizing;

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "img");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Snake game");
    this.#observer.observe(this, { childList: true, subtree: true, attributes: true });
    this.#resize();
    this.draw();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  attributeChangedCallback() {
    this.#resize();
    if (this.isConnected) this.draw();
  }

  get width() {
    return Math.max(1, Math.floor(number(this, "width", 100)));
  }

  get height() {
    return Math.max(1, Math.floor(number(this, "height", 50)));
  }

  /** The board, one pixel per cell: a <pixel-canvas> source (domkit). */
  get canvas() {
    return this.#canvas;
  }

  /** Snake, apple, and wall elements inside, however deeply. */
  get snakes() {
    return descendants(this, ForsnakenSnake);
  }
  get apples() {
    return descendants(this, ForsnakenApple);
  }
  get walls() {
    return descendants(this, ForsnakenWall);
  }

  #world() {
    const snakes = this.snakes.map((el) => el.snake);
    const walls = this.walls.map((el) => el.wall);
    const apples = this.apples.flatMap((el) => el.apples);
    // New apples start somewhere free (not in a wall or a snake).
    for (const apple of apples) {
      if (this.#placed.has(apple)) continue;
      this.#placed.add(apple);
      apple.spawn([...walls.flatMap((w) => w.cells), ...snakes.flatMap((s) => s.cells)]);
    }
    return { width: this.width, height: this.height, snakes, walls, apples };
  }

  /** Play one step: move, eat, collide, then draw. Fires score/death/gameover. */
  step() {
    if (this.#over || performance.now() < this.#holdUntil) return;
    const elements = new Map(this.snakes.map((el) => [el.snake, el]));
    this.#steps++;
    const world = this.#world();
    // Brains (and anyone else) see the board before anything moves; turns
    // they send now take effect in this step.
    this.dispatchEvent(new CustomEvent("step", { bubbles: true, detail: this.#snapshot(world, elements) }));
    for (const event of step(world)) {
      const snake = event.snake && elements.get(event.snake);
      if (event.type === "gameover") this.#over = true;
      if (event.type === "score") this.#holdUntil = performance.now() + Math.max(0, number(this, "score-pause", 250));
      // `subject` and `score` are the 2021 names for `snake` and `value`.
      this.dispatchEvent(new CustomEvent(event.type, {
        bubbles: true,
        detail: snake
          ? { snake, subject: snake, color: event.snake.color, direction: event.snake.direction, value: event.apple?.value, score: event.apple?.value }
          : {},
      }));
    }
    this.draw(world);
  }

  // A copy of the board for brains: they can look, not touch.
  #snapshot(world, elements) {
    return {
      width: world.width,
      height: world.height,
      step: this.#steps,
      snakes: world.snakes.map((snake) => ({
        id: elements.get(snake)?.id ?? "",
        element: elements.get(snake),
        color: snake.color,
        direction: snake.direction,
        length: snake.length,
        head: { ...snake.head },
        cells: snake.cells.map((cell) => ({ ...cell })),
      })),
      apples: world.apples.filter((apple) => apple.alive).map(({ x, y, value }) => ({ x, y, value })),
      walls: world.walls.flatMap((wall) => wall.cells.map((cell) => ({ ...cell }))),
    };
  }

  /** End the game now (fires `gameover`). */
  end() {
    if (this.#over) return;
    this.#over = true;
    this.dispatchEvent(new CustomEvent("gameover", { bubbles: true, detail: {} }));
  }

  /** Start again: snakes back to their places, fresh apples. */
  restart() {
    for (const el of this.snakes) el.snake.reset();
    for (const el of this.apples) el.reset();
    this.#over = false;
    this.#holdUntil = 0;
    this.draw();
  }

  #resize() {
    if (this.#canvas.width !== this.width) this.#canvas.width = this.width;
    if (this.#canvas.height !== this.height) this.#canvas.height = this.height;
    this.#sizing.textContent = `:host { inline-size: calc(${this.width}px * var(--forsnaken-scale, 8)); }`;
  }

  /** Draw the board as it is now (it's drawn after every step anyway). */
  draw(world = this.#world()) {
    const context = this.#canvas.getContext("2d");
    context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    for (const thing of [...world.walls, ...world.apples.filter((a) => a.alive), ...world.snakes]) {
      context.fillStyle = thing.color;
      for (const cell of thing.cells) context.fillRect(cell.x, cell.y, 1, 1);
    }
    this.dispatchEvent(new Event("framechange"));
  }
}

export const NAMES = {
  game: "forsnaken-game",
  snake: "forsnaken-snake",
  apple: "forsnaken-apple",
  wall: "forsnaken-wall",
  randomBrain: "snake-brain-random",
  greedyBrain: "snake-brain-greedy",
};

/**
 * Register the elements, under their usual names or your own:
 * `define({ game: "snake-board", snake: "snake-player" })`. Elements
 * already registered (under any name) are left alone.
 * @param {Partial<typeof NAMES>} [names]
 */
export function define(names = {}) {
  const classes = { game: ForsnakenGame, snake: ForsnakenSnake, apple: ForsnakenApple, wall: ForsnakenWall, randomBrain: RandomBrain, greedyBrain: GreedyBrain };
  for (const [key, element] of Object.entries(classes)) {
    const name = names[key] ?? NAMES[key];
    // A class can only be registered once, so a second define() under new
    // names is a no-op for it.
    if (customElements.get(name) || customElements.getName?.(element)) continue;
    customElements.define(name, element);
  }
}
