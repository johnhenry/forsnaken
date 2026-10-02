// The game itself, with no DOM: snakes, apples, walls, and one step of
// play. The elements in elements.mjs wrap these; tests drive them
// directly. Positions are whole grid cells, { x, y }, with 0,0 top left.

export const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const CLOCKWISE = { up: "right", right: "down", down: "left", left: "up" };
const COUNTERCLOCKWISE = { up: "left", left: "down", down: "right", right: "up" };
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

const randomInt = (min, max, random) => Math.floor(random() * (max - min)) + min;
const same = (a, b) => a.x === b.x && a.y === b.y;

export class Snake {
  #start;
  #moved; // the direction of the last move: turns are checked against it

  /**
   * @param {{ x: number, y: number, direction?: keyof DIRECTIONS, length?: number, color?: string, name?: string }} options
   */
  constructor({ x = 0, y = 0, direction = "right", length = 2, color = "#4e9a06", name = "" } = {}) {
    this.color = color;
    this.name = name;
    this.#start = { x, y, direction: DIRECTIONS[direction] ? direction : "right", length: Math.max(1, length) };
    this.reset();
  }

  /** Back to where it started, alive. */
  reset() {
    const { x, y, direction, length } = this.#start;
    const [dx, dy] = DIRECTIONS[direction];
    this.direction = direction;
    this.#moved = direction;
    this.length = length;
    // The body trails behind the head, against the direction of travel.
    this.cells = Array.from({ length }, (_, i) => ({ x: x - dx * i, y: y - dy * i }));
    this.alive = true;
  }

  get head() {
    return this.cells[0];
  }

  /**
   * Steer: `up`/`down`/`left`/`right`, or `clockwise`/`counterclockwise`.
   * Reversing onto itself is ignored. Turns are relative to the last move,
   * so two quick turns within one step can't fold the snake back on itself.
   * @param {string} turn
   * @returns {boolean} whether the direction changed
   */
  steer(turn) {
    const from = this.#moved;
    const next = turn === "clockwise" ? CLOCKWISE[from] : turn === "counterclockwise" ? COUNTERCLOCKWISE[from] : turn;
    if (!DIRECTIONS[next] || next === OPPOSITE[from]) return false;
    const changed = next !== this.direction;
    this.direction = next;
    return changed;
  }

  grow(amount = 1) {
    this.length += amount;
  }

  /** One cell forward, wrapping around the edges. */
  move(width, height) {
    const [dx, dy] = DIRECTIONS[this.direction];
    const head = this.head;
    this.cells.unshift({ x: (head.x + dx + width) % width, y: (head.y + dy + height) % height });
    this.#moved = this.direction;
    while (this.cells.length > this.length) this.cells.pop();
  }
}

export class Apple {
  /**
   * @param {{ xRange?: [number, number], yRange?: [number, number], lives?: number, value?: number, avoid?: { x: number, y: number }[] }} options
   *   `avoid`: cells it never spawns on, besides whatever it's told to avoid each time
   */
  constructor({ xRange = [0, 8], yRange = [0, 8], lives = Infinity, value = 2, avoid = [] } = {}) {
    this.avoid = avoid;
    this.xRange = xRange;
    this.yRange = yRange;
    this.lives = lives;
    this.value = value;
    this.color = "#ff0000";
    this.x = xRange[0];
    this.y = yRange[0];
  }

  get cells() {
    return [this];
  }

  get alive() {
    return this.lives > 0;
  }

  /** Move somewhere in range that isn't one of `avoid` (if there's room). */
  spawn(avoid = [], random = Math.random) {
    const cells = [...this.avoid, ...avoid];
    for (let tries = 0; tries < 1000; tries++) {
      this.x = randomInt(this.xRange[0], this.xRange[1], random);
      this.y = randomInt(this.yRange[0], this.yRange[1], random);
      if (!cells.some((cell) => same(cell, this))) return;
    }
  }
}

export class Wall {
  /**
   * A filled rectangle from x,y to x1,y1, or one of its diagonals; with
   * `spread`, only every spread-th cell (a dotted wall).
   * @param {{ x: number, y: number, x1?: number, y1?: number, shape?: "rect" | "diagonal" | "anti-diagonal", spread?: number }} options
   */
  constructor({ x = 0, y = 0, x1 = x, y1 = y, shape = "rect", spread = 1 } = {}) {
    spread = Math.max(1, Math.floor(spread));
    this.color = "#bbbbbb";
    const [left, right] = [Math.min(x, x1), Math.max(x, x1)];
    const [top, bottom] = [Math.min(y, y1), Math.max(y, y1)];
    this.cells = [];
    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        const dx = i - left;
        const dy = j - top;
        if (dx % spread || dy % spread) continue;
        if (shape === "diagonal" ? dx === dy : shape === "anti-diagonal" ? right - i === dy : true) {
          this.cells.push({ x: i, y: j });
        }
      }
    }
  }
}

/**
 * One step of play. Returns what happened, as events:
 * `{ type: "score", snake, apple }`, `{ type: "death", snake }`, and
 * `{ type: "gameover" }` once every apple has been eaten.
 * @param {{ width: number, height: number, snakes: Snake[], apples: Apple[], walls: Wall[] }} world
 * @param {() => number} [random]
 * @returns {{ type: string, [key: string]: unknown }[]}
 */
export function step(world, random = Math.random) {
  const { width, height, snakes, walls } = world;
  const events = [];
  // Over once every apple has been eaten (a board with no apples yet is
  // just a board, not a finished game).
  if (world.apples.length && !world.apples.some((apple) => apple.alive)) return [{ type: "gameover" }];

  // Eat: a head on an apple grows the snake, which then pauses a step.
  const digesting = new Set();
  for (const snake of snakes) {
    for (const apple of world.apples) {
      if (!apple.alive || !same(snake.head, apple)) continue;
      snake.grow(apple.value);
      digesting.add(snake);
      apple.lives -= 1;
      if (apple.alive) {
        apple.spawn([...snakes.flatMap((s) => s.cells), ...walls.flatMap((w) => w.cells)], random);
      }
      events.push({ type: "score", snake, apple });
    }
  }

  // Collide: with any snake's body (its own included), or a wall. Two
  // heads meeting: one of them, at random.
  const dying = new Set();
  for (const snake of snakes) {
    for (const other of snakes) {
      const cells = other === snake ? other.cells.slice(1) : other.cells;
      const hit = cells.findIndex((cell) => same(cell, snake.head));
      if (hit < 0) continue;
      const headOn = other !== snake && hit === 0;
      if (!headOn) dying.add(snake);
      // Each head-on pair is decided once, from the first snake's side.
      else if (snakes.indexOf(snake) < snakes.indexOf(other)) dying.add(random() < 0.5 ? other : snake);
    }
    if (walls.some((wall) => wall.cells.some((cell) => same(cell, snake.head)))) dying.add(snake);
  }
  for (const snake of dying) {
    events.push({ type: "death", snake });
    snake.reset();
  }

  for (const snake of snakes) {
    if (!digesting.has(snake) && !dying.has(snake)) snake.move(width, height);
  }
  return events;
}
