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
// from domkit drive them with no script.
import { Snake, Apple, Wall, step } from "./model.mjs";

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

const MIRROR = { up: "down", down: "up", left: "right", right: "left", clockwise: "counterclockwise", counterclockwise: "clockwise" };

/**
 * A snake. Steer it with commands; `ai="random"` steers itself, and
 * `mirror="other-id"` steers opposite to another snake.
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
      const game = this.closest("forsnaken-game") ?? this.getRootNode();
      for (const follower of game.querySelectorAll(`forsnaken-snake[mirror="${CSS.escape(this.id)}"]`)) {
        if (follower !== this && follower instanceof ForsnakenSnake) follower.snake.steer(MIRROR[turn] ?? turn);
      }
    }
    return changed;
  }
}

/** `count` apples that respawn in a range when eaten, `lives` times each. */
export class ForsnakenApple extends Entity {
  static observedAttributes = ["count", "x-range", "y-range", "lives", "value"];
  #apples = null;

  /** The models, one per apple. */
  get apples() {
    this.#apples ??= Array.from({ length: Math.max(1, number(this, "count", 1)) }, () =>
      new Apple({
        xRange: range(this, "x-range", [0, 8]),
        yRange: range(this, "y-range", [0, 8]),
        lives: number(this, "lives", Infinity),
        value: number(this, "value", 2),
      }));
    return this.#apples;
  }

  /** Start over with fresh apples. */
  reset() {
    this.#apples = null;
  }
}

/** A wall: a filled rectangle, or one of its diagonals (`shape`). */
export class ForsnakenWall extends Entity {
  static observedAttributes = ["x", "y", "x1", "y1", "shape"];
  #wall = null;

  reset() {
    this.#wall = null;
  }

  get wall() {
    const x = number(this, "x", 0);
    const y = number(this, "y", 0);
    this.#wall ??= new Wall({ x, y, x1: number(this, "x1", x), y1: number(this, "y1", y), shape: this.getAttribute("shape") ?? "rect" });
    return this.#wall;
  }
}

const AI_TURNS = ["clockwise", "counterclockwise", "", ""]; // the original weights: 1, 1, and 2 to go straight

/** The board: steps on each `tick` from a <frame-timer> inside it, and draws. */
export class ForsnakenGame extends HTMLElement {
  static observedAttributes = ["width", "height"];
  #canvas;
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
    return [...this.querySelectorAll("forsnaken-snake")].filter((el) => el instanceof ForsnakenSnake);
  }
  get apples() {
    return [...this.querySelectorAll("forsnaken-apple")].filter((el) => el instanceof ForsnakenApple);
  }
  get walls() {
    return [...this.querySelectorAll("forsnaken-wall")].filter((el) => el instanceof ForsnakenWall);
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
    if (this.#over) return;
    const elements = new Map(this.snakes.map((el) => [el.snake, el]));
    this.#steps++;
    for (const el of elements.values()) {
      if (el.getAttribute("ai") !== "random") continue;
      const every = Math.max(1, number(el, "ai-interval", 12));
      if (this.#steps % every === 0) {
        const turn = AI_TURNS[Math.floor(Math.random() * AI_TURNS.length)];
        if (turn) el.steer(turn);
      }
    }
    const world = this.#world();
    for (const event of step(world)) {
      const snake = event.snake && elements.get(event.snake);
      if (event.type === "gameover") this.#over = true;
      this.dispatchEvent(new CustomEvent(event.type, {
        bubbles: true,
        detail: snake ? { snake, color: event.snake.color, direction: event.snake.direction, value: event.apple?.value } : {},
      }));
    }
    this.draw(world);
  }

  /** Start again: snakes back to their places, fresh apples. */
  restart() {
    for (const el of this.snakes) el.snake.reset();
    for (const el of this.apples) el.reset();
    this.#over = false;
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

/** Register the elements under their names. */
export function define() {
  for (const [name, element] of [
    ["forsnaken-game", ForsnakenGame],
    ["forsnaken-snake", ForsnakenSnake],
    ["forsnaken-apple", ForsnakenApple],
    ["forsnaken-wall", ForsnakenWall],
  ]) {
    if (!customElements.get(name)) customElements.define(name, element);
  }
}
