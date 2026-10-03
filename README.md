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

A brain is how a snake is controlled, by a person or by the computer. At
the start of every step, the game fires a `step` event with a snapshot of
the board (every snake's cells and direction, the apples, the walls); each
brain looks and may send its snake a command. Who's in control is just
which brain is in the snake, so handing over is swapping elements, even
mid-game: a new brain takes over on its first step.

```html
<forsnaken-snake id="green" …>
  <snake-brain-player>                                       <!-- a person, with their controls inside -->
    <hot-key hotkey="arrowup" command="--up"></hot-key>
    <gamepad-input up="--up" down="--down" left="--left" right="--right"></gamepad-input>
  </snake-brain-player>
</forsnaken-snake>

<forsnaken-snake id="white" …>
  <snake-brain-random></snake-brain-random>                  <!-- turns at random, about once a second -->
</forsnaken-snake>
<snake-brain-greedy commandfor="yellow"></snake-brain-greedy>  <!-- heads for apples, avoids crashing -->
```

- `<snake-brain-player>` steers by the commands its controls send
  (`--up`, `--down`, `--left`, `--right`, `--clockwise`,
  `--counterclockwise`), one per step, in the order they came. Controls
  inside it need no ids: without `commandfor`, domkit's `<hot-key>`,
  `<gamepad-input>`, and `<swipe-input>` send their commands bubbling up to
  whatever they're inside. Swap the player brain for `<snake-brain-greedy>`
  and the computer plays, and the controls leave with the brain; swap it
  back to play again. (A swipe area wraps the board, so it can't be inside
  a brain: it names the brain with `commandfor` instead.)
- The same goes for the rest of the page: the restart and end keys sit
  inside the game, and the pause key inside the clock.
- A brain steers the snake it's inside, or the one its `commandfor` names.
  Several brains can steer one snake. (A snake also takes commands sent to
  it directly; the pages here send them to player brains instead.)
- `interval="n"` thinks every n steps, starting with its first; `disabled`
  switches a brain off.
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

They can also be edited while the game runs. Swap a snake's brain and the
same snake carries on under the new one. Change a snake's `color` or
`name` and it changes in place; change its `x`, `y`, `direction`, or
`length` (where it starts) and that snake alone starts over. A new apple
`count` adds or removes apples and leaves the rest where they are. Walls
rebuild, and the board can be resized mid-game. Snakes, apples, walls, and
the clock can be added, removed, or replaced while it runs, and the whole
game can move to another part of the page and carry on.

### Under your own names

`game/global.mjs` registers the usual tags. To pick your own, import the
classes from `game/index.mjs` and register them yourself. The elements
find each other by class, never by tag, so any names work:

```html
<script type="module">
  import { define } from "https://cdn.jsdelivr.net/gh/johnhenry/forsnaken/game/index.mjs";
  define({ game: "snake-board", snake: "snake-player", apple: "snake-food" }); // the rest keep their usual names
</script>
<snake-board><snake-player id="me"></snake-player><snake-food count="8"></snake-food>…</snake-board>
```

### In editors and page builders

[`custom-elements.json`](custom-elements.json) is a standard
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest):
every element's tag, attributes (with types), and events, and which module
registers each tag (`game/global.mjs`). `package.json` points to it
(`"customElements"`), so tools that read manifests find it on their own.
It's generated from the JSDoc in `game/` by `npm run manifest`, and CI
checks it's current.

[`builder.html`](builder.html) is a small game written as plain HTML that
plays as it is. It also carries what a page builder needs: its libraries
(`data-library` scripts), their manifests (meta tags), and ready-made pieces
(`<template data-snippet>`), all of which browsers ignore.
[Open it in htmlbuilder](https://johnhenry.github.io/htmlbuilder/?project=https://johnhenry.github.io/forsnaken/builder.html)
to rebuild it by drag and drop.

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

Camouflage needs no script: `<forsnaken-game background="#4e9a06" camouflage>`
draws the board in that color and, after each score, in the scorer's color
(that's how [`builder.html`](builder.html) does it). This page colors the
whole screen from `effects.mjs` instead, gaps between cells included.

## How it's put together

| File | What's in it |
|---|---|
| [`game/model.mjs`](game/model.mjs) | The game with no DOM: `Snake`, `Apple`, `Wall`, and `step(world)`, one turn of play |
| [`game/elements.mjs`](game/elements.mjs) | The HTML elements that wrap them, and `define()` |
| [`game/index.mjs`](game/index.mjs) / [`game/global.mjs`](game/global.mjs) | Everything, unregistered / registered under the usual tags |
| [`game/brains.mjs`](game/brains.mjs) | Brains: `SnakeBrain`, `defineSnakeBrain`, `board`, and the random and greedy brains |
| [`index.html`](index.html) | The page: the game, wrapped and wired up, all in markup |
| [`effects.mjs`](effects.mjs) | What happens around the game: start, shake, camouflage, scores |
| [`builder.html`](builder.html) | The game as a plain page with snippets, for page builders |
| [`custom-elements.json`](custom-elements.json) | The elements described for tools (generated: `npm run manifest`) |
| [`deps.mjs`](deps.mjs) | [domkit](https://github.com/johnhenry/domkit), pinned to a commit, from jsDelivr |

There's no build step: serve the folder and open it. See
[docs/architecture.md](docs/architecture.md) for why it's shaped this way.

## Developing

```sh
npm install
npm run serve   # http://localhost:4820/
npm test        # model tests (node:test), then the browser tests (Playwright)
npm run manifest  # regenerate custom-elements.json after changing the JSDoc
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
