# 🐍 Forsnaken 🐍

A snake game built from HTML elements, for learning how programs (and the
web) work. Many thanks to [@straker](https://www.patreon.com/join/straker),
whose [original gist](https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4)
it grew from.

**[Play it](https://johnhenry.github.io/forsnaken/)**

## The whole game is HTML

```html
<pixel-canvas width="800" effects="grid(8, rgb(0 0 0 / 0.4))">
  <forsnaken-game id="game" width="100" height="50">
    <frame-timer id="clock" fps="12"></frame-timer>
    <forsnaken-apple count="64" x-range="10,89" y-range="10,39"></forsnaken-apple>
    <forsnaken-wall x="1" y="1" x1="9" y1="9" shape="diagonal"></forsnaken-wall>
    <forsnaken-snake id="green" color="#4e9a06" x="0" y="0" direction="right"></forsnaken-snake>
    <forsnaken-snake id="white" color="#ffffff" x="50" y="25" ai="random"></forsnaken-snake>
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
  `--counterclockwise`. `ai="random"` steers itself, and
  `mirror="other-id"` steers opposite to another snake.
- **`<forsnaken-apple count x-range y-range lives value>`** and
  **`<forsnaken-wall x y x1 y1 shape>`** fill the board.
- **Steering is domkit's**: `<hot-key>` for keys, `<gamepad-input>` for
  controllers, `<swipe-input>` for touch. They all send the same commands,
  so a snake doesn't care which one moved it.

The elements only hold settings; the game reads them each step. So they
work however they're made: written in HTML, built by a script or an
editor, moved around, nested in other elements, or defined after the fact.

## Playing

- **Green**: arrow keys, the first controller, or swipe the board.
- **Yellow**: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or the second controller.
- Each has a light twin that mirrors it, and the white snake steers itself.
- <kbd>Space</kbd> pauses, <kbd>R</kbd> restarts.

**Camouflage:** the board turns the color of the snake that scored last,
which hides that snake. Amateurs hate this. Experts use it to their
advantage. **Shaking:** the screen jolts toward a scoring snake (not for
visitors who prefer reduced motion).

## How it's put together

| File | What's in it |
|---|---|
| [`game/model.mjs`](game/model.mjs) | The game with no DOM: `Snake`, `Apple`, `Wall`, and `step(world)`, one turn of play |
| [`game/elements.mjs`](game/elements.mjs) | The HTML elements that wrap them |
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
