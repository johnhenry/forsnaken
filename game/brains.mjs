// Brains: elements that steer a snake, the way a keyboard or controller
// does, but by deciding for themselves. A brain steers the snake it's
// inside, or the one its `commandfor` names. At the start of every step,
// the game fires `step` with a snapshot of the board; each brain looks at
// it and may send its snake a command (--up, --clockwise, …). Swap brains
// by swapping elements.
//
//   <forsnaken-snake id="white" …>
//     <snake-brain-random></snake-brain-random>
//   </forsnaken-snake>
//   <snake-brain-greedy commandfor="yellow"></snake-brain-greedy>
//
// Write your own with defineSnakeBrain(name, (me, world, brain) => turn).

// A snake element, under whatever tag it was registered as: it steers.
// (Not an import of the class: elements.mjs imports this module.)
const isSnake = (el) => typeof el?.steer === "function" && "snake" in el;

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/**
 * @typedef {{ x: number, y: number }} Cell
 * @typedef {{ id: string, element: Element, color: string, direction: string, length: number, head: Cell, cells: Cell[] }} SnakeView
 * @typedef {{ width: number, height: number, step: number, snakes: SnakeView[], apples: (Cell & { value: number })[], walls: Cell[] }} WorldView
 */

/**
 * Helpers for thinking about the board: where a move leads (wrapping at
 * the edges), whether a cell is taken, and how far apart two cells are.
 * @param {WorldView} world
 */
export function board(world) {
  const taken = new Set([...world.walls, ...world.snakes.flatMap((s) => s.cells)].map(({ x, y }) => `${x},${y}`));
  const wrap = (n, size) => ((n % size) + size) % size;
  return {
    /** The cell one step from `cell` in `direction`. */
    next(cell, direction) {
      const [dx, dy] = DELTA[direction];
      return { x: wrap(cell.x + dx, world.width), y: wrap(cell.y + dy, world.height) };
    },
    /** Whether a wall or any snake is on `cell`. */
    taken: (cell) => taken.has(`${cell.x},${cell.y}`),
    /** Steps between two cells, going around the edges where that's shorter. */
    distance(a, b) {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return Math.min(dx, world.width - dx) + Math.min(dy, world.height - dy);
    },
    /** The directions `snake` can take next: anything but reversing. */
    choices: (snake) => Object.keys(DELTA).filter((d) => d !== OPPOSITE[snake.direction]),
  };
}

/**
 * @attr {string} commandfor - The id of the snake to steer. Default the snake it's inside.
 * @attr {number} interval - Think every this many steps.
 * @attr {boolean} disabled - Don't steer.
 *
 * A brain. Subclasses override `think(me, world)`, returning a turn (`up`,
 * `down`, `left`, `right`, `clockwise`, `counterclockwise`) or nothing to
 * carry on.
 */
export class SnakeBrain extends HTMLElement {
  #onStep = (event) => this.#step(event);
  #steps = 0;

  connectedCallback() {
    // Listen at the document, not on one game, so a brain keeps working
    // however the page is rebuilt; each step checks it's for our snake.
    this.ownerDocument.addEventListener("step", this.#onStep);
  }

  disconnectedCallback() {
    this.ownerDocument.removeEventListener("step", this.#onStep);
  }

  /** Mirrors the `disabled` attribute: a disabled brain doesn't steer. */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }

  /** The snake it steers: the one `commandfor` names, or the one it's inside. */
  get snake() {
    const id = this.getAttribute("commandfor");
    if (id) {
      const target = this.getRootNode().getElementById?.(id);
      return isSnake(target) ? target : null;
    }
    for (let node = this.parentElement; node; node = node.parentElement) if (isSnake(node)) return node;
    return null;
  }

  /** Think every this many steps (the `interval` attribute; default 1). */
  get interval() {
    return Math.max(1, Math.floor(Number(this.getAttribute("interval")) || this.constructor.interval || 1));
  }

  /**
   * Decide a turn. The default carries on.
   * @param {SnakeView} me
   * @param {WorldView} world
   * @returns {string | void}
   */
  think(me, world) {}

  #step(event) {
    const snake = this.snake;
    if (this.disabled || !snake || !event.target.contains?.(snake)) return;
    if (++this.#steps % this.interval) return;
    const world = event.detail;
    const me = world.snakes.find((s) => s.element === snake);
    if (!me) return;
    const turn = this.think(me, world);
    if (!turn) return;
    // Sent as a command, like any other input, so mirrored snakes follow.
    const command = `--${turn}`;
    const commandEvent = globalThis.CommandEvent
      ? new CommandEvent("command", { command, source: this })
      : Object.assign(new Event("command"), { command, source: this });
    snake.dispatchEvent(commandEvent);
  }
}

/**
 * Define a brain from a function, with no class to write:
 * `defineSnakeBrain("snake-brain-lefty", (me) => "counterclockwise")`.
 * The function gets the snake, the board, and the brain element (to read
 * its attributes), and returns a turn or nothing.
 * @param {string} name a custom element name
 * @param {(me: SnakeView, world: WorldView, brain: SnakeBrain) => string | void} think
 * @param {{ interval?: number }} [options] the default interval
 */
export function defineSnakeBrain(name, think, { interval = 1 } = {}) {
  const Brain = class extends SnakeBrain {
    static interval = interval;
    think(me, world) {
      return think(me, world, this);
    }
  };
  if (!customElements.get(name)) customElements.define(name, Brain);
  return Brain;
}

/**
 * @tag snake-brain-random
 * @summary Turns at random, every 24 steps by default.
 * @attr {number} clockwise - Weight of turning clockwise. Default 1.
 * @attr {number} counterclockwise - Weight of turning counterclockwise. Default 1.
 * @attr {number} straight - Weight of going straight. Default 2.
 *
 * The original brain: every `interval` steps (default 24, about a second at 24 fps),
 * turn clockwise, counterclockwise, or go straight, at random, weighted by
 * the `clockwise`, `counterclockwise`, and `straight` attributes (1, 1, 2).
 */
export class RandomBrain extends SnakeBrain {
  static interval = 24;
  think() {
    const weight = (name, fallback) => {
      const value = Number(this.getAttribute(name));
      return this.hasAttribute(name) && Number.isFinite(value) && value >= 0 ? value : fallback;
    };
    const options = [["clockwise", weight("clockwise", 1)], ["counterclockwise", weight("counterclockwise", 1)], ["", weight("straight", 2)]];
    const total = options.reduce((sum, [, w]) => sum + w, 0);
    let pick = Math.random() * total;
    for (const [turn, w] of options) {
      if ((pick -= w) < 0) return turn || undefined;
    }
  }
}

/**
 * @tag snake-brain-greedy
 * @summary Heads for the nearest apple, avoiding walls and snakes.
 *
 * Heads for the nearest apple, never stepping onto a wall or a snake if it
 * can help it.
 */
export class GreedyBrain extends SnakeBrain {
  think(me, world) {
    const b = board(world);
    const apples = world.apples;
    let best = null;
    for (const direction of b.choices(me)) {
      const cell = b.next(me.head, direction);
      if (b.taken(cell)) continue;
      const distance = apples.length ? Math.min(...apples.map((apple) => b.distance(cell, apple))) : 0;
      // Prefer the nearest apple; on a tie, keep going the same way.
      if (!best || distance < best.distance || (distance === best.distance && direction === me.direction)) best = { direction, distance };
    }
    if (best && best.direction !== me.direction) return best.direction;
  }
}
