# Architecture notes

Notes on how the game is put together, and why. Some apply to games (and
programs) in general.

## The game, then the page

[`game/model.mjs`](../game/model.mjs) is the game with no browser in it:
plain classes (`Snake`, `Apple`, `Wall`) and one function, `step(world)`,
that plays one turn and returns what happened (`score`, `death`,
`gameover`). It can be tested in Node, run in a worker, or drawn anywhere.

[`game/elements.mjs`](../game/elements.mjs) wraps it in HTML elements.
They hold settings (attributes), turn commands into calls (`steer()`),
and draw. The page is mostly markup that puts them together.

Keeping these apart is "separation of concerns". It makes each part
easier to reason about and change, at the cost of a little indirection.

## Events in, events out

Two ways data gets into a program:

- **Checking state**: a loop runs at a steady rate and looks at what's
  changed. Most video games, and most hardware, work this way.
- **Events**: something happens, and code runs in response.

Forsnaken uses both. The `<frame-timer>` is the loop: every `tick`, the
game takes a step and checks every snake's direction (state). Steering is
events: a key, a controller button, or a swipe sends a command (`--up`,
`--left`, …), which changes a direction. The Gamepad API only offers
state, so `<gamepad-input>` turns it into events by checking every frame.

## Brains: the one interface for control

Everything that steers a snake is a brain. At the start of each step the
game fires `step` with a copy of the board, and each brain may answer with
a command. A program decides from the board (`<snake-brain-greedy>`); a
person is a brain too (`<snake-brain-player>`), which answers with what
its controls sent since the last step. So a snake can't tell a person
from a program, and handing control from one to the other is swapping one
element for another, mid-game included: a new brain decides on its first
step.

A player's controls live inside its brain. domkit's inputs without
`commandfor` send their commands bubbling up to whatever they're inside,
and the brain keeps the turns it takes (it stops them there), so the snake
only ever hears from its brain. Swap the brain and its controls go with
it: no ids to rewire, and no keys left steering a snake that someone else
now controls. The same pattern runs through the page: restart and end are
keys inside the game, pause a key inside the clock. (The swipe area is the
exception: it has to wrap the board to see swipes, so it names its brain.)

The board is a copy on purpose: a brain can look at everything but change
nothing, so a buggy brain can't break the game. (In the 2020 version,
brains never saw the board at all, so the only possible AI was random.)

## Elements that work however they're made

The elements hold settings and the game reads them on every step, rather
than collecting them once when the page loads. So the game works whether
it's written in HTML, built one element at a time by a script or an
editor, rearranged, or defined after the elements exist. An earlier
version collected its pieces only when its children changed, and only
worked because a markup mistake (`<custom-element />`, which doesn't
close in HTML) happened to give it children.

It goes further: the elements can be edited while the game runs, which is
what lets an editor (htmlbuilder) patch a running page instead of
reloading it. Swapping brains, adding or removing snakes, apples, walls,
or the clock, or moving the whole game keeps everything else as it was. An
attribute change applies to the running game: a snake's color and name
change in place; its `x`, `y`, `direction`, and `length` are where it
starts, so changing one starts that snake over (only it); a new apple
`count` adds or removes apples and leaves the rest. Elements are found by
class, never by tag name, so any names work (`define({ snake: "…" })`).

## Side effects stay outside

The game only reports what happened. Shaking the screen, the camouflage
color, and the scoreboard are in [`effects.mjs`](../effects.mjs),
listening to the game's events. Swapping them out (sound, say) doesn't
touch the game.

## Drawing

The game draws one pixel per cell on its own canvas. Everything about how
that looks (the 8× zoom, the grid) is domkit's `<pixel-canvas>`, which
accepts any element with a `canvas` as a source. More effects are one
attribute away: `effects="grid(8) crt()"`.
