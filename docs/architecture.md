# Game Architecture Notes

These are notes on this game's architecture. They may be applicable in other situations.

## Game Components

Most of the game's action takes place in the **game [loop](./SnakeGame/loop.mjs)**,
and most of what the user experiences happens via the **[renderer](./SnakeGame/rendererFactories/canvas.mjs)**,
but it is worth it to break out some key components for the sake of organization.

"Events", "entities", and "collisions" are useful to identify and breakout into their own components.

### Events

The **game loop** and the **renderer** are directly connected in that **game loop** must yield objects that the **renderer** "understands".

In this game, we use a shared event model to achieve this could be augmented or replaced with a type system.

Modules in the "./SnakeGame/events/" folder are shared by both the **game loop** and the **renderer**. Following principals of "separation of concerns", they are otherwise decoupled.

Separating concerns like this makes a program easier to reason about, and easier to modify parts without affecting others, but it may lead to slow application execution. This is a tradeoff that must be weighed when creating applications.

### entities

Most games have easily identifyable types of entities.
For this game, I've identified "[apples](./SnakeGame/entities/apples.mjs)"
and "[snakes](./SnakeGame/entities/snakes.mjs)".

If we wanted to add another type of object, say a "wall",
we might add a class in "./SnakeGame/entities/wall.mjs" to represent it.

In a card-based game, there would probably be a "card" class in "./entities/card.mjs".

### collisions

Collison detection may not be necessary in most turn-based games, but most real-time games use some method of detecting of whether or not two objects occupy the same space.

I've defined two modules: **[collide](./SnakeGame/collisions/collide.mjs)** and **[collideArray](./SnakeGame/collisions/collideArray.mjs)** that detect whether two components -- or array of components, occupy the same two-dimensional -- x,y -- coordinates, respectively.

## Game as iterator

The result of **SnakeGame** is an _iterator_ and can be used as such.

This might be useful for debugging, rendering outside of the browser,
or usage withing other iterators.

```javascript
//... within any context
const { value } = game.next();
console.log(value);
renderer(value);
//...
```

```javascript
//... within async context
const time = Math.floor(1000 / 60); // 1/60 of a second => 60 FPS
for (const output of game) {
  await new Promise((resolve) => setTimeout(resolve, time));
  renderer(output);
}
//
```

```javascript
//...within generator context
const game = SnakeGame(/*...*/);
switch (name) {
  case "snake":
    yield * SnakeGame(/*...*/);
    break;
  default:
    yield * NoGame();
}
//...
```

## Side Effects

One might consider the "main" purpose of this game loop to be to yield a "DrawEvent",
with "DeathEvent"s and the "ScoreEvent"s being secondary.
Disabling rendering for these latter two types actually has little effect on gameplay.

There are some actions (changing the background color) that could be done within the main rendering engine itself with little effort. In these cases, sometimes the platform on which a game runs (the browser) provides facilities (via DOM and JQuery) that make it easy to offload this task.

Other actions (as shaking the rendering surface) may be difficult or even impossible to do within the main rendering engine and must be offloaded.

## Input Models

There exactly two (maybe one?) ways of getting data into an application.

### Check State

In this model, a loop runs at a specific frequency and continually checks the state of values that may change.
The loop yields values based on this state to be rendered.

This efficient method is used in most video games as well as on low-level hardware -- think arduino.

Additional steps must be taken to prevent the rendering frequency from being coupled to the game loop... Fun Fact: The game Space Invaders uses this as "feature". As you defeat enemies on screen, the game moves faster and is thus harder because there are less enemies on screen to render.

### Event

In this model, a program listens for specific types of events and executes code based on their contents.

Applications like this are easy to reason about but may lack responsiveness.

I'm not sure but this may note technically be a "real" model, but rather an abstraction atop the previous.

### Hybrids

In our game we use the "Check State" model within our main loop -- the loops continually checks the direction (state) of each snake and moves it accordingly.

On the other hand, the "brains" that we use to change the direction the snakes use an "Event" model. They emit signal events which tell the snake their to change its direction, so when using the keyboard to control the snake, we're using both models.

Note Brains are simply EventEmitters (EventTarget).

To futher complicate this, the web gamepad API is based on the "Check State" model, and this must be tranlated into an "Event" model and back into the "Check State" model when using a game pad.

It might be considered efficent to just put the code for the gamepad API directly into event loop -- and that's how a lot of games, particulary consoles with limited input options work. The way that we've created this allows us to flexibility in our ability to generalize how input works at the slight cost of performance within the gameloop. This is another tradeoff to consider.

## Full Games

Ultimately, each game has unique considerations as to what to do with its loop and how to render it's output.

A full game likely involves a number of different sub-programs -- gameloops and types renderers -- working in conjunction to produce an interactive experience.
