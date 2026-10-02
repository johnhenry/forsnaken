# 🐍 Forsnaken 🐍

A snake game built from HTML elements, for learning how programs (and the
web) work. Many thanks to [@straker](https://www.patreon.com/join/straker),
whose [original gist](https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4)
it grew from.

**[Play it](https://johnhenry.github.io/forsnaken/)**

## The whole game is HTML

```html
<pixel-canvas width="800" effects="grid(8, transparent, 3)">
  <forsnaken-game id="game" width="100" height="50">
    <frame-timer id="clock" fps="24"></frame-timer>
    <forsnaken-apple count="64" x-range="10,89" y-range="10,39"></forsnaken-apple>
    <forsnaken-wall x="1" y="1" x1="9" y1="9" shape="diagonal"></forsnaken-wall>
    <forsnaken-snake id="green" color="#4e9a06" x="0" y="0" direction="right"></forsnaken-snake>
    <forsnaken-snake id="white" color="#ffffff" x="50" y="25">
      <snake-brain-random></snake-brain-random>
    </forsnaken-snake>
  </forsnaken-game>
</pixel-canvas>

<hot-key hotkey="arrowup" commandfor="green" command="--up"></hot-key>
<!-- …and the other directions, a <gamepad-input>, a <swipe-input> -->
```

- **`<forsnaken-game>`** is the board. It steps on every `tick` from the
  `<frame-timer>` inside it, and fires `score`, `death`, and `gameover`
  events. It draws itself one pixel per cell, so it's also a source for
  domkit's `<pixel-canvas>`, which scales it up and adds the grid.
- **`<forsnaken-snake>`** is steered with
  [invoker commands](https://developer.mozilla.org/docs/Web/API/Invoker_Commands_API):
  `--up`, `--down`, `--left`, `--right`, `--clockwise`,
  `--counterclockwise`. A brain inside it steers it for you (see below),
  and `mirror="other-id"` steers it opposite to another snake.
- **`<forsnaken-apple count x-range y-range lives value avoid>`** and
  **`<forsnaken-wall x y x1 y1 shape spread>`** fill the board. `avoid`
  lists cells apples never appear on (`avoid="3,4 5,6"`); `spread="2"`
  makes a dotted wall.
- **Steering is domkit's**: `<hot-key>` for keys, `<gamepad-input>` for
  controllers, `<swipe-input>` for touch. They all send the same commands,
  so a snake doesn't care which one moved it.

## Brains

A brain steers a snake by deciding for itself. At the start of every
step, the game fires a `step` event with a snapshot of the board (every
snake's cells and direction, the apples, the walls); each brain looks and
may send its snake a command, exactly like a key press. Swap brains by
swapping elements:

```html
<forsnaken-snake id="white" …>
  <snake-brain-random></snake-brain-random>                  <!-- turns at random, about once a second -->
</forsnaken-snake>
<snake-brain-greedy commandfor="yellow"></snake-brain-greedy>  <!-- heads for apples, avoids crashing -->
```

- A brain steers the snake it's inside, or the one its `commandfor` names.
  Several brains (and keys, controllers, swipes) can steer one snake.
- `interval="n"` thinks every n steps; `disabled` switches a brain off.
- `<snake-brain-random>` is the original: every 24 steps (a second) it turns
  clockwise, counterclockwise, or goes straight, weighted by its
  `clockwise`, `counterclockwise`, and `straight` attributes (1, 1, 2).
- `<snake-brain-greedy>` heads for the nearest apple, never onto a wall or
  a snake if it can help it.

Write your own with one function. It gets the snake, the board, and the
brain element (for its attributes), and returns a turn (`up`, `down`,
`left`, `right`, `clockwise`, `counterclockwise`) or nothing:

```js
import { defineSnakeBrain, board } from "./game/brains.mjs";

// Turn whenever the next cell is taken.
defineSnakeBrain("snake-brain-careful", (me, world) => {
  const b = board(world);
  if (b.taken(b.next(me.head, me.direction))) return "clockwise";
});
```

```html
<forsnaken-snake id="yellow" …><snake-brain-careful></snake-brain-careful></forsnaken-snake>
```

`board(world)` has helpers: `next(cell, direction)` (wrapping at the
edges), `taken(cell)`, `distance(a, b)`, and `choices(snake)` (every
direction but reversing). For a class instead, extend `SnakeBrain` and
override `think(me, world)`.

## Elements that work however they're made

The elements only hold settings; the game reads them each step. So they
work however they're made: written in HTML, built by a script or an
editor, moved around, nested in other elements, or defined after the fact.

## Playing

- **Green**: arrow keys, the first controller, or swipe the board.
- **Yellow**: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or the second controller.
- Each has a light twin that mirrors it, and the white snake steers itself.
- <kbd>Space</kbd> pauses, <kbd>R</kbd> restarts, <kbd>Esc</kbd> ends the game.
- Eating an apple holds the game still for a beat (`score-pause`, 250 ms by default).

**Camouflage:** the board turns the color of the snake that scored last,
which hides that snake. Amateurs hate this. Experts use it to their
advantage. **Shaking:** the screen jolts toward a scoring snake (not for
visitors who prefer reduced motion).

## How it's put together

| File | What's in it |
|---|---|
| [`game/model.mjs`](game/model.mjs) | The game with no DOM: `Snake`, `Apple`, `Wall`, and `step(world)`, one turn of play |
| [`game/elements.mjs`](game/elements.mjs) | The HTML elements that wrap them |
| [`game/brains.mjs`](game/brains.mjs) | Brains: `SnakeBrain`, `defineSnakeBrain`, `board`, and the random and greedy brains |
| [`index.html`](index.html) | The page: the game, wrapped and wired up, all in markup |
| [`effects.mjs`](effects.mjs) | What happens around the game: start, shake, camouflage, scores |
| [`deps.mjs`](deps.mjs) | [domkit](https://github.com/johnhenry/domkit), pinned to a commit, from jsDelivr |

There's no build step: serve the folder and open it. See
[docs/architecture.md](docs/architecture.md) for why it's shaped this way.

## Developing

```sh
npm install
npm run serve   # http://localhost:4820/
npm test        # model tests (node:test), then the browser tests (Playwright)
```

## Ideas to try

- Add a snake that's steered over the network (a WebSocket or WebRTC
  connection that sends the same commands).
- Write a brain that plans further ahead, hunts other snakes, or learns
  (TensorFlow.js), and race it against `<snake-brain-greedy>`.
- Make apples worth different amounts, and show it (size? color?).
- Draw the board another way: as HTML, SVG, or text in the console.
- Run the board through more of domkit's pixel effects: `crt()`,
  `palette(gameboy, ordered)`, `glitch()`.
- Give the same treatment to @straker's
  [Pong](https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5),
  [Breakout](https://gist.github.com/straker/98a2aed6a7686d26c04810f08bfaf66b),
  or [Tetris](https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1).

The 2020–2021 version (a canvas renderer, "brain" components, and a
generator game loop, loaded from `johnhenry.github.io/lib`) is in this
repository's history before this rewrite.
